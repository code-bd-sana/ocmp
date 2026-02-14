import { ApplicableAccountType, SubscriptionPlan } from '../../models';
import { ISubscriptionPlan } from './subscription-plan.interface';

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
};
