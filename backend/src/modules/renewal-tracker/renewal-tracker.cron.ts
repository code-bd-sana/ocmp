import cron from 'node-cron';
import { renewalTrackerServices } from './renewal-tracker.service';

let renewalTrackerStatusJobStarted = false;

export const startRenewalTrackerStatusCron = () => {
  if (renewalTrackerStatusJobStarted) return;

  renewalTrackerStatusJobStarted = true;

  cron.schedule('0 0 * * *', async () => {
    try {
      const updatedCount = await renewalTrackerServices.syncRenewalTrackerStatuses();
      if (updatedCount > 0) {
        console.log(`[RenewalTracker Cron] Updated ${updatedCount} record(s) status`);
      }
    } catch (error) {
      console.error('[RenewalTracker Cron] Failed to sync statuses', error);
    }
  });
};
