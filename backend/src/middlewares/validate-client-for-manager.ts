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
    const { standAloneId } = req.body || req.params; // depending on where you send the standAloneId from
    const managerId = req.user?._id; // assuming auth middleware sets this

    const isClientExist = await ClientManagement.exists({
      managerId: new mongoose.Types.ObjectId(managerId),
      'clients.clientId': new mongoose.Types.ObjectId(standAloneId),
      'clients.status': { $in: [ClientStatus.APPROVED] },
    });

    if (!isClientExist) {
      ServerResponse(res, false, 403, 'Client not found in your clients list or not approved');
    }

    next();
  } catch (error) {
    next(error);
  }
};
