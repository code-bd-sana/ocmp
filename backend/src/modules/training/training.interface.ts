/**
 * Type definition for training.
 *
 * This type defines the structure of a training object as returned by the API.
 */
export interface TTraining {
  trainingName: string;
  intervalDays: number[];
  standAloneId?: string;
  createdBy: string;
}