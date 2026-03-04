import { RenewalTrackerStatus } from '../../models/compliance-enforcement-dvsa/renewalTracker.schema';

const DAY_IN_MS = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

// Helper function to get the start of today (00:00:00)
const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Derives the renewal tracker status based on the provided dates and reminder settings.
 *
 * The logic is as follows:
 * - If the start date is in the future, the status is SCHEDULED.
 * - If there is no due date, the status is ACTIVE.
 * - If the due date is in the past, the status is EXPIRED.
 * - If the due date is within the next 7 days, the status is DUE_SOON.
 * - If a reminder is set and the reminder date is today or in the past, the status is DUE_SOON.
 */
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

  // Check if the start date is in the future
  if (startDate && startDate.getTime() > today.getTime()) {
    return RenewalTrackerStatus.SCHEDULED;
  }

  // If there is no due date, consider it active
  if (!dueDate) {
    return RenewalTrackerStatus.ACTIVE;
  }

  const dueDateStart = new Date(dueDate);
  dueDateStart.setHours(0, 0, 0, 0);

  // Check if the due date has passed
  if (dueDateStart.getTime() < today.getTime()) {
    return RenewalTrackerStatus.EXPIRED;
  }

  // Check if the due date is within the next 7 days
  const daysToDue = Math.ceil((dueDateStart.getTime() - today.getTime()) / DAY_IN_MS);
  if (daysToDue <= 7) {
    return RenewalTrackerStatus.DUE_SOON;
  }

  // Check if a reminder is set and the reminder date is today or in the past
  if (dates.reminderSet && reminderDate) {
    const reminderDateStart = new Date(reminderDate);
    reminderDateStart.setHours(0, 0, 0, 0);

    if (reminderDateStart.getTime() <= today.getTime()) {
      return RenewalTrackerStatus.DUE_SOON;
    }
  }

  return RenewalTrackerStatus.ACTIVE;
};
