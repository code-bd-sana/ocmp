import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody, validateParams, validateQuery } from '../../handlers/zod-error-handler';
import { zodSearchQuerySchema } from '../../handlers/common-zod-validator';

/** Standalone user: single wheelRetorquePolicyMonitoringId param */
const zodWheelRetorquePolicyMonitoringIdParamSchema = z
  .object({
    wheelRetorquePolicyMonitoringId: z
      .string({ message: 'Wheel re-torque policy monitoring id is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' }),
  })
  .strict();

export type WheelRetorquePolicyMonitoringIdParamInput = z.infer<
  typeof zodWheelRetorquePolicyMonitoringIdParamSchema
>;

/** TM: wheelRetorquePolicyMonitoringId + standAloneId params */
const zodWheelRetorquePolicyMonitoringAndManagerIdParamSchema = z
  .object({
    wheelRetorquePolicyMonitoringId: z
      .string({ message: 'Wheel re-torque policy monitoring id is required' })
      .refine(isMongoId, {
        message: 'Please provide a valid MongoDB ObjectId for wheelRetorquePolicyMonitoringId',
      }),
    standAloneId: z
      .string({ message: 'standAloneId is required' })
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' }),
  })
  .strict();

export type WheelRetorquePolicyMonitoringAndManagerIdParamInput = z.infer<
  typeof zodWheelRetorquePolicyMonitoringAndManagerIdParamSchema
>;

const baseWheelRetorquePolicyMonitoringFields = {
  vehicleId: z
    .string({ message: 'Vehicle id is required' })
    .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' }),
  dateChanged: z
    .string({ message: 'Date changed must be a string' })
    .datetime({ message: 'Date changed must be a valid ISO date string' })
    .optional(),
  tyreSize: z
    .string({ message: 'Tyre size must be a string' })
    .max(120, 'Tyre size must not exceed 120 characters')
    .optional(),
  tyreLocation: z
    .string({ message: 'Tyre location must be a string' })
    .max(120, 'Tyre location must not exceed 120 characters')
    .optional(),
  reTorqueDue: z
    .string({ message: 'Re-torque due must be a string' })
    .datetime({ message: 'Re-torque due must be a valid ISO date string' })
    .optional(),
  reTorqueCompleted: z
    .string({ message: 'Re-torque completed must be a string' })
    .datetime({ message: 'Re-torque completed must be a valid ISO date string' })
    .optional(),
  technician: z
    .string({ message: 'Technician must be a string' })
    .max(200, 'Technician must not exceed 200 characters')
    .optional(),
};

/** TM create: standAloneId is REQUIRED */
const zodCreateWheelRetorquePolicyMonitoringAsManagerSchema = z
  .object({
    ...baseWheelRetorquePolicyMonitoringFields,
    standAloneId: z
      .string({ message: 'standAloneId is required for transport manager' })
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateWheelRetorquePolicyMonitoringAsManagerInput = z.infer<
  typeof zodCreateWheelRetorquePolicyMonitoringAsManagerSchema
>;

/** Standalone create: no standAloneId needed */
const zodCreateWheelRetorquePolicyMonitoringAsStandAloneSchema = z
  .object({
    ...baseWheelRetorquePolicyMonitoringFields,
  })
  .strict();

export type CreateWheelRetorquePolicyMonitoringAsStandAloneInput = z.infer<
  typeof zodCreateWheelRetorquePolicyMonitoringAsStandAloneSchema
>;

/** Update (shared for both roles) — all fields optional, at least 1 required */
const zodUpdateWheelRetorquePolicyMonitoringSchema = z
  .object({
    vehicleId: z
      .string({ message: 'Vehicle id must be a string' })
      .refine(isMongoId, { message: 'vehicleId must be a valid MongoDB ObjectId' })
      .optional(),
    dateChanged: z
      .string({ message: 'Date changed must be a string' })
      .datetime({ message: 'Date changed must be a valid ISO date string' })
      .optional(),
    tyreSize: z
      .string({ message: 'Tyre size must be a string' })
      .max(120, 'Tyre size must not exceed 120 characters')
      .optional(),
    tyreLocation: z
      .string({ message: 'Tyre location must be a string' })
      .max(120, 'Tyre location must not exceed 120 characters')
      .optional(),
    reTorqueDue: z
      .string({ message: 'Re-torque due must be a string' })
      .datetime({ message: 'Re-torque due must be a valid ISO date string' })
      .optional(),
    reTorqueCompleted: z
      .string({ message: 'Re-torque completed must be a string' })
      .datetime({ message: 'Re-torque completed must be a valid ISO date string' })
      .optional(),
    technician: z
      .string({ message: 'Technician must be a string' })
      .max(200, 'Technician must not exceed 200 characters')
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type UpdateWheelRetorquePolicyMonitoringInput = z.infer<
  typeof zodUpdateWheelRetorquePolicyMonitoringSchema
>;

/** Extends base search query with standAloneId for TM filtering */
const zodSearchWheelRetorquePolicyMonitoringsSchema = zodSearchQuerySchema.extend({
  standAloneId: z
    .string()
    .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId for standAloneId' })
    .optional(),
});

export type SearchWheelRetorquePolicyMonitoringsQueryInput = z.infer<
  typeof zodSearchWheelRetorquePolicyMonitoringsSchema
>;

export const validateWheelRetorquePolicyMonitoringIdParam = validateParams(
  zodWheelRetorquePolicyMonitoringIdParamSchema
);
export const validateWheelRetorquePolicyMonitoringAndManagerIdParam = validateParams(
  zodWheelRetorquePolicyMonitoringAndManagerIdParamSchema
);

export const validateCreateWheelRetorquePolicyMonitoringAsManager = validateBody(
  zodCreateWheelRetorquePolicyMonitoringAsManagerSchema
);
export const validateCreateWheelRetorquePolicyMonitoringAsStandAlone = validateBody(
  zodCreateWheelRetorquePolicyMonitoringAsStandAloneSchema
);
export const validateUpdateWheelRetorquePolicyMonitoring = validateBody(
  zodUpdateWheelRetorquePolicyMonitoringSchema
);

export const validateSearchWheelRetorquePolicyMonitoringsQueries = validateQuery(
  zodSearchWheelRetorquePolicyMonitoringsSchema
);
