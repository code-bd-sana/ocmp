import { Response } from 'express';
import mongoose from 'mongoose';
import { policyProcedureServices } from './policy-procedure.service';
import ServerResponse from '../../helpers/responses/custom-response';
import catchAsync from '../../utils/catch-async/catch-async';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import { SearchPolicyProceduresQueryInput } from './policy-procedure.validation';

// ═══════════════════════════════════════════════════════════════
// CREATE CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Create a policy procedure as a Transport Manager.
 * POST /api/v1/policy-procedure/create-policy-procedure
 */
export const createPolicyProcedureAsManager = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  req.body.standAloneId = new mongoose.Types.ObjectId(req.body.standAloneId);
  const result = await policyProcedureServices.createPolicyProcedureAsManager(req.body);
  if (!result) throw new Error('Failed to create policy procedure');
  ServerResponse(res, true, 201, 'Policy procedure created successfully', result);
});

/**
 * Controller: Create a policy procedure as a Standalone User.
 * POST /api/v1/policy-procedure/create-stand-alone-policy-procedure
 */
export const createPolicyProcedureAsStandAlone = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id;
  req.body.createdBy = new mongoose.Types.ObjectId(userId);
  const result = await policyProcedureServices.createPolicyProcedureAsStandAlone(req.body);
  if (!result) throw new Error('Failed to create policy procedure');
  ServerResponse(res, true, 201, 'Policy procedure created successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// READ CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Get all policy procedures (paginated + searchable).
 * GET /api/v1/policy-procedure/get-policy-procedures
 */
export const getAllPolicyProcedures = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const query = { ...((req as any).validatedQuery as SearchPolicyProceduresQueryInput) };

  // Standalone: use own userId for access control
  if (req.user?.role === UserRole.STANDALONE_USER) {
    query.standAloneId = req.user._id;
  }
  // TM: standAloneId already comes from validated query params

  const result = await policyProcedureServices.getAllPolicyProcedures(query);
  ServerResponse(res, true, 200, 'Policy procedures retrieved successfully', result);
});

/**
 * Controller: Get a single policy procedure by ID.
 * GET /api/v1/policy-procedure/get-policy-procedure/:policyProcedureId
 */
export const getPolicyProcedureById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { policyProcedureId } = req.params;
  let accessId: string | undefined;

  if (req.user?.role === UserRole.STANDALONE_USER) {
    accessId = req.user._id;
  }
  if (req.user?.role === UserRole.TRANSPORT_MANAGER) {
    accessId = req.query?.standAloneId as string;
  }

  const result = await policyProcedureServices.getPolicyProcedureById(policyProcedureId as string, accessId);
  ServerResponse(res, true, 200, 'Policy procedure retrieved successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// UPDATE CONTROLLER
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Update a policy procedure.
 * PATCH /api/v1/policy-procedure/update-policy-procedure-by-manager/:policyProcedureId/:standAloneId  (TM)
 * PATCH /api/v1/policy-procedure/update-policy-procedure/:policyProcedureId  (Standalone)
 */
export const updatePolicyProcedure = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const policyProcedureId = paramToString(req.params.policyProcedureId);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  const result = await policyProcedureServices.updatePolicyProcedure(policyProcedureId as string, req.body, accessId);
  ServerResponse(res, true, 200, 'Policy procedure updated successfully', result);
});

// ═══════════════════════════════════════════════════════════════
// DELETE CONTROLLER
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Delete a policy procedure.
 * DELETE /api/v1/policy-procedure/delete-policy-procedure-by-manager/:policyProcedureId/:standAloneId  (TM)
 * DELETE /api/v1/policy-procedure/delete-policy-procedure/:policyProcedureId  (Standalone)
 */
export const deletePolicyProcedure = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const paramToString = (p?: string | string[]) => (Array.isArray(p) ? p[0] : p);
  const policyProcedureId = paramToString(req.params.policyProcedureId);
  // TM accesses through the client's standAloneId; standalone uses own ID
  const accessId = req.user!.role === UserRole.TRANSPORT_MANAGER
    ? paramToString(req.params.standAloneId) as string
    : req.user!._id;
  await policyProcedureServices.deletePolicyProcedure(policyProcedureId as string, accessId);
  ServerResponse(res, true, 200, 'Policy procedure deleted successfully');
});