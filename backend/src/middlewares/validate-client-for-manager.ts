import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import ServerResponse from '../helpers/responses/custom-response';
import { ClientManagement, ClientStatus } from '../models';
import { AuthenticatedRequest } from './is-authorized';

export const validateClientForManagerMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // standAloneId can come from body (POST), params (PATCH/DELETE), or query (GET)
    const standAloneId =
      req.body?.standAloneId || req.params?.standAloneId || (req.query?.standAloneId as string);
    const managerId = req.user?._id; // assuming auth middleware sets this

    // Validate standAloneId is a valid ObjectId before querying
    if (!standAloneId || !mongoose.Types.ObjectId.isValid(standAloneId)) {
      return ServerResponse(res, false, 400, 'Invalid or missing standAloneId — must be a valid ObjectId');
    }

    const isClientExist = await ClientManagement.exists({
      managerId: new mongoose.Types.ObjectId(managerId),
      'clients.clientId': new mongoose.Types.ObjectId(standAloneId),
      'clients.status': { $in: [ClientStatus.APPROVED] },
    });

    if (!isClientExist) {
      return ServerResponse(res, false, 403, 'Client not found in your clients list or not approved');
    }

    next();
  } catch (error) {
    next(error);
  }
};
