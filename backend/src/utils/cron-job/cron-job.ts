import cron from 'node-cron';
import { renewalTrackerServices } from '../../modules/renewal-tracker/renewal-tracker.service';
import { plannerServices } from '../../modules/planner/planner.service';

let cronJobStarted = false;

export const startCronJob = () => {
  if (cronJobStarted) return;
  cronJobStarted = true;

  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const renewalCount = await renewalTrackerServices.syncRenewalTrackerStatus();
      const plannerCount = await plannerServices.plannerStatusUpdateToDue();

      console.log(
        `[Cron] Completed scheduled jobs. Renewal Tracker updated: ${renewalCount}, Planner updated: ${plannerCount}`
      );
    } catch (error) {
      console.error('[Cron] Error running scheduled jobs:', error);
    }
  });
};
