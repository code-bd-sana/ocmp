import { ApplicableAccountType, SubscriptionPlan } from '../../models';
import { ISubscriptionPlan } from './subscription-plan.interface';

/**
 * Service function to check if a subscription plan with the same name and plan type already exists.
 * @param name - The name of the subscription plan.
 * @param planType - The plan type of the subscription plan.
 * @param excludeId - The ID of the subscription plan to exclude from the check (for update operations).
 * @returns {Promise<ISubscriptionPlan | null>} - The existing plan or null if no duplicate is found.
 */
const getPlanByNameAndType = async (
  name: string,
  planType: string,
  excludeId?: string
): Promise<ISubscriptionPlan | null> => {
  try {
    const filter = {
      name,
      planType,
      ...(excludeId && { _id: { $ne: excludeId } }), // Exclude current plan if it's an update
    };

    const existingPlan = await SubscriptionPlan.findOne(filter).lean();
    return existingPlan;
  } catch (error) {
    throw new Error('Error checking for existing subscription plan');
  }
};

/**
 * Service function to create a new subscription plan.
 */
const createPlan = async (data: Partial<ISubscriptionPlan>): Promise<ISubscriptionPlan> => {
  try {
    if (
      data.applicableAccountType &&
      !Object.values(ApplicableAccountType).includes(data.applicableAccountType)
    ) {
      throw new Error('Invalid applicableAccountType');
    }

    const newPlan = new SubscriptionPlan(data);
    const savedPlan = await newPlan.save();
    return savedPlan;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error('Error creating subscription plan: ' + error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

/**
 * Service function to get all subscription plans.
 */
const getAllPlans = async (): Promise<ISubscriptionPlan[]> => {
  try {
    const plans = await SubscriptionPlan.find().lean();
    return plans;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error('Error fetching subscription plans: ' + error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

/**
 * Service function to update an existing subscription plan.
 */
const updatePlan = async (
  id: string,
  updateData: Partial<ISubscriptionPlan>
): Promise<ISubscriptionPlan | null> => {
  try {
    if (
      updateData.applicableAccountType &&
      !Object.values(ApplicableAccountType).includes(updateData.applicableAccountType)
    ) {
      throw new Error('Invalid applicableAccountType');
    }

    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    return updatedPlan;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error('Error updating subscription plan: ' + error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

/**
 * Service function to delete an existing subscription plan.
 */
const deletePlan = async (id: string): Promise<boolean> => {
  try {
    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);
    return deletedPlan !== null;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error('Error deleting subscription plan: ' + error.message);
    } else {
      throw new Error('An unknown error occurred');
    }
  }
};

export const subscriptionPlanServices = {
  createPlan,
  getAllPlans,
  updatePlan,
  deletePlan,
  getPlanByNameAndType,
};
