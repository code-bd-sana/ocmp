import mongoose from 'mongoose';
import type { UploadedFile } from 'express-fileupload';
import DocumentModel, { IDocument } from '../../models/document.schema';
import { deleteObjects, uploadBuffer } from './s3';

export interface UploadedDocumentResult {
  documents: IDocument[];
  s3Keys: string[];
}

const toUploadedFilesArray = (
  fileInput?: UploadedFile | UploadedFile[]
): UploadedFile[] => {
  if (!fileInput) return [];
  return Array.isArray(fileInput) ? fileInput : [fileInput];
};

/**
 * Extract uploaded files from supported field names.
 * Accepts both single and multi-file values from express-fileupload.
 */
export const extractUploadedFiles = (
  files: UploadedFile | UploadedFile[] | { [field: string]: UploadedFile | UploadedFile[] } | undefined,
  fieldNames: string[] = ['attachments', 'files']
): UploadedFile[] => {
  if (!files) return [];

  const bucket: UploadedFile[] = [];

  if ('name' in (files as UploadedFile)) {
    return toUploadedFilesArray(files as UploadedFile | UploadedFile[]);
  }

  const fileMap = files as { [field: string]: UploadedFile | UploadedFile[] };

  for (const fieldName of fieldNames) {
    const fieldValue = fileMap[fieldName];
    if (!fieldValue) continue;
    bucket.push(...toUploadedFilesArray(fieldValue));
  }

  return bucket;
};

/**
 * Upload multiple files to S3 and persist rows in Document collection.
 * If any upload/save fails, uploaded S3 objects and saved documents are rolled back.
 */
export const uploadFilesAndCreateDocuments = async (
  files: UploadedFile[],
  uploaderId: string,
  folderPrefix: string
): Promise<UploadedDocumentResult> => {
  if (!files.length) {
    throw new Error('No files provided for upload');
  }

  const uploadedS3: Array<{
    Key: string;
    Location: string;
    originalName: string;
    mimeType: string;
    size: number;
  }> = [];

  try {
    for (const file of files) {
      const uploaded = await uploadBuffer(
        file.data,
        undefined,
        file.mimetype,
        folderPrefix
      );

      uploadedS3.push({
        Key: uploaded.Key,
        Location: uploaded.Location,
        originalName: file.name,
        mimeType: file.mimetype || 'application/octet-stream',
        size: file.size,
      });
    }

    const documentRows = uploadedS3.map((item) => {
      const filename = item.Key.split('/').pop() || item.Key;
      return {
        filename,
        originalName: item.originalName,
        mimeType: item.mimeType,
        size: item.size,
        url: item.Location,
        s3Key: item.Key,
        uploader: new mongoose.Types.ObjectId(uploaderId),
      };
    });

    const documents = await DocumentModel.insertMany(documentRows, { ordered: true });
    return { documents, s3Keys: uploadedS3.map((item) => item.Key) };
  } catch (error) {
    const uploadedKeys = uploadedS3.map((item) => item.Key);

    if (uploadedKeys.length) {
      await Promise.allSettled([
        deleteObjects(uploadedKeys),
        DocumentModel.deleteMany({ s3Key: { $in: uploadedKeys } }),
      ]);
    }

    throw error;
  }
};

/**
 * Roll back document and S3 objects created during upload flow.
 */
export const rollbackUploadedDocuments = async (
  documents: Pick<IDocument, '_id' | 's3Key'>[]
): Promise<void> => {
  if (!documents.length) return;

  const s3Keys = documents.map((doc) => doc.s3Key).filter(Boolean);
  const docIds = documents.map((doc) => doc._id).filter(Boolean);

  await Promise.allSettled([
    s3Keys.length ? deleteObjects(s3Keys) : Promise.resolve(),
    docIds.length ? DocumentModel.deleteMany({ _id: { $in: docIds } }) : Promise.resolve(),
  ]);
};
