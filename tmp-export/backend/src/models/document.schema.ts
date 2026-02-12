import mongoose, { Document as MongoDocument, Schema } from 'mongoose';

// Define and export an interface representing a Document document
export interface IDocument extends MongoDocument {
  // Define the schema fields with their types
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  s3Key: string;
  uploader: mongoose.Types.ObjectId;
}

// Define the Document schema
const DocumentSchema: Schema<IDocument> = new Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    uploader: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User who uploaded the document
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the Document model
const Document = mongoose.model<IDocument>('Document', DocumentSchema);

// Export the Document model
export default Document;
