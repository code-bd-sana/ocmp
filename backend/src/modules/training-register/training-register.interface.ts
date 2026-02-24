/**
 * Type definition for training-register.
 *
 * This type defines the structure of a single training-register object.
 * @interface TTrainingRegister
 */
export interface TTrainingRegister {
  participantId: string;
  trainingId: string;
  trainingInterval: number;
  trainingDate: string;
  standAloneId?: string;
  createdBy: string;
}