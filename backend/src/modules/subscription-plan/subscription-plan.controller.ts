import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ServerResponse from '../../helpers/responses/custom-response';
import { AuthenticatedRequest } from '../../middlewares/is-authorized';
import { ISubscriptionPlan } from './subscription-plan.interface';
import { subscriptionPlanServices } from './subscription-plan.service';

/**
 * Controller function to create a new subscription plan.
 */
export const createSubscriptionPlan = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, planType, applicableAccountType, description, isActive } = req.body;

    // Ensure applicableAccountType and planType are strings (in case they're sent as arrays)
    const planTypeString = Array.isArray(planType) ? planType[0] : planType;
    const applicableAccountTypeString = Array.isArray(applicableAccountType)
      ? applicableAccountType[0]
      : applicableAccountType;

    // Check if a subscription plan with the same name and planType already exists
    const existingPlan = await subscriptionPlanServices.getPlanByNameAndType(name, planTypeString);

    if (existingPlan) {
      ServerResponse(
        res,
        false,
        400,
        'A subscription plan with this name and plan type already exists'
      );
      return; // Exit function here without returning a value
    }

    // Ensure isActive defaults to true if not provided
    const newPlan: Partial<ISubscriptionPlan> = {
      name,
      planType: planTypeString,
      applicableAccountType: applicableAccountTypeString,
      description,
      isActive: isActive ?? true, // Default to true if not provided
      createdBy: new mongoose.Types.ObjectId(req.user?._id),
    };

    // Call the service to create a new subscription plan
    const result = await subscriptionPlanServices.createPlan(newPlan);

    if (!result) {
      ServerResponse(res, false, 500, 'Failed to create subscription plan');
      return; // Exit function here without returning a value
    }

    // Respond with the created subscription plan data
    ServerResponse(res, true, 201, 'Subscription plan created successfully', result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      ServerResponse(res, false, 500, error.message || 'Server Error');
    } else {
      ServerResponse(res, false, 500, 'An unknown error occurred');
    }
  }
};

/**
 * Controller function to get all subscription plans.
 */
export const getAllSubscriptionPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = await subscriptionPlanServices.getAllPlans();
    ServerResponse(res, true, 200, 'Subscription plans fetched successfully', plans);
  } catch (error: unknown) {
    if (error instanceof Error) {
      ServerResponse(res, false, 500, error.message || 'Server Error');
    } else {
      ServerResponse(res, false, 500, 'An unknown error occurred');
    }
  }
};

/**
 * Controller function to update an existing subscription plan.
 */
export const updateSubscriptionPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure id is a string (in case it's an array)
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Validate that the id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      ServerResponse(res, false, 400, 'Invalid plan ID format');
      return; // Exit function here without returning a value
    }

    const { name, planType, applicableAccountType, isActive } = req.body;

    // Ensure applicableAccountType and planType are strings (in case they're sent as arrays)
    const planTypeString = Array.isArray(planType) ? planType[0] : planType;
    const applicableAccountTypeString = Array.isArray(applicableAccountType)
      ? applicableAccountType[0]
      : applicableAccountType;

    // Check if a subscription plan with the same name and planType already exists (except the current plan being updated)
    const existingPlan = await subscriptionPlanServices.getPlanByNameAndType(
      name,
      planTypeString,
      id // Exclude the current plan being updated
    );

    if (existingPlan) {
      ServerResponse(
        res,
        false,
        400,
        'A subscription plan with this name and plan type already exists'
      );
      return; // Exit function here without returning a value
    }

    const updateData = {
      name,
      planType: planTypeString,
      applicableAccountType: applicableAccountTypeString,
      isActive,
    };

    const updatedPlan = await subscriptionPlanServices.updatePlan(id, updateData);

    if (!updatedPlan) {
      ServerResponse(res, false, 500, 'Failed to update subscription plan');
      return; // Exit function here without returning a value
    }

    ServerResponse(res, true, 200, 'Subscription plan updated successfully', updatedPlan);
  } catch (error: unknown) {
    if (error instanceof Error) {
      ServerResponse(res, false, 500, error.message || 'Server Error');
    } else {
      ServerResponse(res, false, 500, 'An unknown error occurred');
    }
  }
};

/**
 * Controller function to delete an existing subscription plan.
 */
export const deleteSubscriptionPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure id is a string (in case it's an array)
    const id: string = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = await subscriptionPlanServices.deletePlan(id);

    if (!result) {
      throw new Error('Failed to delete subscription plan');
    }

    ServerResponse(res, true, 200, 'Subscription plan deleted successfully');
  } catch (error: unknown) {
    if (error instanceof Error) {
      ServerResponse(res, false, 500, error.message || 'Server Error');
    } else {
      ServerResponse(res, false, 500, 'An unknown error occurred');
    }
  }
};
