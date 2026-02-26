import { RenewalTrackerStatus } from '../../models/compliance-enforcement-dvsa/renewalTracker.schema';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const deriveRenewalTrackerStatus = (dates: {
  startDate?: Date | string;
  expiryOrDueDate?: Date | string;
  reminderSet?: boolean;
  reminderDate?: Date | string;
}): RenewalTrackerStatus => {
  const today = getStartOfToday();

  const startDate = dates.startDate ? new Date(dates.startDate) : undefined;
  const dueDate = dates.expiryOrDueDate ? new Date(dates.expiryOrDueDate) : undefined;
  const reminderDate = dates.reminderDate ? new Date(dates.reminderDate) : undefined;

  if (startDate && startDate.getTime() > today.getTime()) {
    return RenewalTrackerStatus.SCHEDULED;
  }

  if (!dueDate) {
    return RenewalTrackerStatus.ACTIVE;
  }

  const dueDateStart = new Date(dueDate);
  dueDateStart.setHours(0, 0, 0, 0);

  if (dueDateStart.getTime() < today.getTime()) {
    return RenewalTrackerStatus.EXPIRED;
  }

  const daysToDue = Math.ceil((dueDateStart.getTime() - today.getTime()) / DAY_IN_MS);
  if (daysToDue <= 7) {
    return RenewalTrackerStatus.DUE_SOON;
  }

  if (dates.reminderSet && reminderDate) {
    const reminderDateStart = new Date(reminderDate);
    reminderDateStart.setHours(0, 0, 0, 0);

    if (reminderDateStart.getTime() <= today.getTime()) {
      return RenewalTrackerStatus.DUE_SOON;
    }
  }

  return RenewalTrackerStatus.ACTIVE;
};
