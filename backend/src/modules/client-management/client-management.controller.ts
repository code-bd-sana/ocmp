import { Request, Response } from 'express';
import { SearchQueryInput } from '../../handlers/common-zod-validator';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { UserRole } from '../../models';
import catchAsync from '../../utils/catch-async/catch-async';
import { clientManagementServices } from './client-management.service';

/**
 * Controller: Create a client under the authenticated Transport Manager.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id = managerId from Redis→JWT decode).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const createClient = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  // req.user._id comes from: Bearer UUID → Redis lookup → JWT decode → { _id, email, role, loginHash }
  const managerId = req.user!._id;
  try {
    const result = await clientManagementServices.createClient(managerId, req.body);
    if (!result) return ServerResponse(res, false, 400, 'Failed to create client assignment');
    ServerResponse(res, true, 201, 'Client assigned to Transport Manager successfully', result);
  } catch (error: any) {
    console.error('[createClient] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Get all clients of a Transport Manager.
 * If user is TRANSPORT_MANAGER → uses req.user._id (sees only own clients).
 * If user is SUPER_ADMIN → uses :managerId from URL param.
 *
 * @param {AuthenticatedRequest} req - The request object.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const getClientsByManagerId = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  // TM uses token (GET /clients), Admin uses URL param (GET /transport-manager/:managerId/clients)
  const managerId = req.params.managerId
    ? (req.params.managerId as string)
    : req.user!._id;
  const query = req.query as unknown as SearchQueryInput;
  try {
    const result = await clientManagementServices.getClientsByManagerId(managerId as string, query);
    ServerResponse(res, true, 200, 'Clients retrieved successfully', result);
  } catch (error: any) {
    console.error('[getClientsByManagerId] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Get the Transport Manager of a client.
 *
 * @param {Request} req - The request object containing clientId in URL params.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const getManagerByClientId = catchAsync(async (req: Request, res: Response) => {
  const { clientId } = req.params;
  try {
    const result = await clientManagementServices.getManagerByClientId(clientId as string);
    if (!result) return ServerResponse(res, false, 404, 'No Transport Manager found for this client');
    ServerResponse(res, true, 200, 'Transport Manager retrieved successfully', result);
  } catch (error: any) {
    console.error('[getManagerByClientId] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Assign a client to a Transport Manager.
 * Client requests to join a TM's team — clientId from token, managerId from body.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id = clientId from Redis→JWT decode).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const requestJoinTeam = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const clientId = req.user!._id;
  try {
    const result = await clientManagementServices.requestJoinTeam(clientId as string, req.body);
    if (!result) return ServerResponse(res, false, 400, 'Failed to request join team');
    ServerResponse(res, true, 200, 'Request to join team submitted successfully', result);
  } catch (error: any) {
    console.error('[requestJoinTeam] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Remove a client from Transport Manager.
 *
 * @param {Request} req - The request object containing clientId in URL params.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const removeClientFromManager = catchAsync(async (req: Request, res: Response) => {
  const { clientId } = req.params;
  try {
    const result = await clientManagementServices.removeClientFromManager(clientId as string);
    if (!result) return ServerResponse(res, false, 404, 'No assignment found for this client');
    ServerResponse(res, true, 200, 'Client removed from Transport Manager successfully');
  } catch (error: any) {
    console.error('[removeClientFromManager] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Get client limit status for a Transport Manager.
 * Uses req.user._id directly — no need for managerId param since only TM can access this.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id = managerId from Redis→JWT decode).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const getClientLimit = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user!._id;
  try {
    const result = await clientManagementServices.getClientLimit(managerId as string);
    ServerResponse(res, true, 200, 'Client limit status retrieved successfully', result);
  } catch (error: any) {
    console.error('[getClientLimit] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Update client limit for a Transport Manager.
 *
 * @param {Request} req - The request object containing managerId in URL params and clientLimit in body.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const updateClientLimit = catchAsync(async (req: Request, res: Response) => {
  const { managerId } = req.params;
  try {
    const result = await clientManagementServices.updateClientLimit(managerId as string, req.body);
    ServerResponse(res, true, 200, 'Client limit updated successfully', result);
  } catch (error: any) {
    console.error('[updateClientLimit] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Get all pending join requests for the authenticated Transport Manager.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id = managerId from Redis→JWT decode).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const getPendingRequests = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user!._id;
  try {
    const result = await clientManagementServices.getPendingRequests(managerId as string);
    ServerResponse(res, true, 200, 'Pending join requests retrieved successfully', result);
  } catch (error: any) {
    console.error('[getPendingRequests] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Approve or reject a pending join request.
 * TM only — managerId from token, clientId from URL param, status from body.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id = managerId from Redis→JWT decode).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const updateJoinRequest = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user!._id;
  const { clientId } = req.params;
  try {
    const result = await clientManagementServices.updateJoinRequest(
      managerId as string,
      clientId as string,
      req.body
    );
    ServerResponse(res, true, 200, `Join request ${result.status} successfully`, result);
  } catch (error: any) {
    console.error('[updateJoinRequest] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Get all active Transport Managers (id + name).
 * For standalone users to browse available managers before requesting to join.
 *
 * @param {AuthenticatedRequest} req - The request object.
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const getManagerList = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await clientManagementServices.getManagerList();
    ServerResponse(res, true, 200, 'Manager list retrieved successfully', result);
  } catch (error: any) {
    console.error('[getManagerList] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

// ═══════════════════════════════════════════════════════════════
//  LEAVE REQUEST FLOW (Client → Manager)
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Client requests to leave their Transport Manager's team.
 * Changes APPROVED → LEAVE_REQUESTED. ClientId from token.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id = clientId from Redis→JWT decode).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const requestLeave = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const clientId = req.user!._id;
  try {
    const result = await clientManagementServices.requestLeave(clientId as string);
    ServerResponse(res, true, 200, 'Leave request submitted successfully', result);
  } catch (error: any) {
    console.error('[requestLeave] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Get all leave requests for the authenticated Transport Manager.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id = managerId from Redis→JWT decode).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const getLeaveRequests = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user!._id;
  try {
    const result = await clientManagementServices.getLeaveRequests(managerId as string);
    ServerResponse(res, true, 200, 'Leave requests retrieved successfully', result);
  } catch (error: any) {
    console.error('[getLeaveRequests] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Transport Manager accepts or rejects a client's leave request.
 * accept → REVOKED, reject → APPROVED.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id = managerId, clientId in param, action in body).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const handleLeaveRequest = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user!._id;
  const { clientId } = req.params;
  try {
    const result = await clientManagementServices.handleLeaveRequest(
      managerId as string,
      clientId as string,
      req.body
    );
    ServerResponse(res, true, 200, `Leave request ${result.action}ed successfully`, result);
  } catch (error: any) {
    console.error('[handleLeaveRequest] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

// ═══════════════════════════════════════════════════════════════
//  REMOVE REQUEST FLOW (Manager → Client)
// ═══════════════════════════════════════════════════════════════

/**
 * Controller: Transport Manager requests to remove a client from their team.
 * Changes APPROVED → REMOVE_REQUESTED. ManagerId from token, clientId from param.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id = managerId, clientId in param).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const requestRemove = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const managerId = req.user!._id;
  const { clientId } = req.params;
  try {
    const result = await clientManagementServices.requestRemove(
      managerId as string,
      clientId as string
    );
    ServerResponse(res, true, 200, 'Remove request submitted successfully', result);
  } catch (error: any) {
    console.error('[requestRemove] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Client checks if they have a pending remove request.
 * ClientId from token.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id = clientId from Redis→JWT decode).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const getRemoveRequest = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const clientId = req.user!._id;
  try {
    const result = await clientManagementServices.getRemoveRequest(clientId as string);
    if (!result) return ServerResponse(res, false, 404, 'No remove request found');
    ServerResponse(res, true, 200, 'Remove request retrieved successfully', result);
  } catch (error: any) {
    console.error('[getRemoveRequest] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});

/**
 * Controller: Client accepts or rejects a remove request from their manager.
 * accept → REVOKED, reject → APPROVED. ClientId from token.
 *
 * @param {AuthenticatedRequest} req - The request object (user._id = clientId, action in body).
 * @param {Response} res - The response object used to send the response.
 * @returns {Promise<void>}
 */
export const handleRemoveRequest = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const clientId = req.user!._id;
  try {
    const result = await clientManagementServices.handleRemoveRequest(
      clientId as string,
      req.body
    );
    ServerResponse(res, true, 200, `Remove request ${result.action}ed successfully`, result);
  } catch (error: any) {
    console.error('[handleRemoveRequest] Error:', error.message);
    ServerResponse(res, false, 400, error.message);
  }
});