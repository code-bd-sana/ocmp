import { isMongoId } from 'validator';
import { z } from 'zod';
import { validateBody } from '../../handlers/zod-error-handler';
import { VehicleStatus, OwnerShipStatus } from '../../models';

const additionalDetailsSchema = z
  .object({
    lastServiceDate: z.coerce.date({ message: 'lastServiceDate must be a valid date' }).optional(),
    nextServiceDate: z.coerce.date({ message: 'nextServiceDate must be a valid date' }).optional(),
    grossPlatedWeight: z.number({ message: 'grossPlatedWeight must be a number' }),
    ownerShipStatus: z.nativeEnum(OwnerShipStatus, {
      message: 'ownerShipStatus must be a valid ownership status',
    }),
    diskNumber: z.coerce.date({ message: 'diskNumber must be a valid date' }),
    dateLeft: z.coerce.date({ message: 'dateLeft must be a valid date' }).optional(),
    chassisNumber: z
      .string({ message: 'chassisNumber must be a string' })
      .min(1, 'chassisNumber is required'),
    keysAvailable: z.number({ message: 'keysAvailable must be a number' }),
    v5InName: z.boolean({ message: 'v5InName must be a boolean' }),
    plantingCertificate: z.boolean({ message: 'plantingCertificate must be a boolean' }),
    vedExpiry: z.coerce.date({ message: 'vedExpiry must be a valid date' }).optional(),
    insuranceExpiry: z.coerce.date({ message: 'insuranceExpiry must be a valid date' }).optional(),
    serviceDueDate: z.coerce.date({ message: 'serviceDueDate must be a valid date' }).optional(),
  })
  .strict();

/**
 * Vehicle Validation Schemas and Types
 *
 * This module defines Zod schemas for validating vehicle related
 * requests such as creation (single + bulk) and updates (single + bulk).
 * It also exports corresponding TypeScript types inferred from these schemas.
 * Each schema includes detailed validation rules and custom error messages
 * to ensure data integrity and provide clear feedback to API consumers.
 *
 * Named validator middleware functions are exported for direct use in Express routes.
 */

/**
 * Base Zod schema for common vehicle fields
 */
const baseVehicleFields = {
  vehicleRegId: z
    .string({ message: 'vehicleRegId must be a string' })
    .min(1, 'Vehicle registration id is required')
    .max(100, 'Vehicle registration id must not exceed 100 characters'),
  vehicleType: z
    .string({ message: 'vehicleType must be a string' })
    .min(1, 'Vehicle type is required')
    .max(100, 'Vehicle type must not exceed 100 characters'),
  licensePlate: z
    .string({ message: 'licensePlate must be a string' })
    .min(1, 'License plate is required')
    .max(50, 'License plate must not exceed 50 characters'),
  status: z.nativeEnum(VehicleStatus, { message: 'status must be a valid vehicle status' }),
  additionalDetails: z.preprocess(
    (val) => val || {},
    z
      .object({
        lastServiceDate: z.coerce
          .date({ message: 'lastServiceDate must be a valid date' })
          .optional(),
        nextServiceDate: z.coerce
          .date({ message: 'nextServiceDate must be a valid date' })
          .optional(),
        grossPlatedWeight: z.number({ message: 'grossPlatedWeight must be a number' }),
        ownerShipStatus: z.nativeEnum(OwnerShipStatus, {
          message: 'ownerShipStatus must be a valid ownership status',
        }),
        diskNumber: z.coerce.date({ message: 'diskNumber must be a valid date' }),
        dateLeft: z.coerce.date({ message: 'dateLeft must be a valid date' }).optional(),
        chassisNumber: z
          .string({ message: 'chassisNumber must be a string' })
          .min(1, 'chassisNumber is required'),
        keysAvailable: z.number({ message: 'keysAvailable must be a number' }),
        v5InName: z.boolean({ message: 'v5InName must be a boolean' }),
        plantingCertificate: z.boolean({ message: 'plantingCertificate must be a boolean' }),
        vedExpiry: z.coerce.date({ message: 'vedExpiry must be a valid date' }).optional(),
        insuranceExpiry: z.coerce
          .date({ message: 'insuranceExpiry must be a valid date' })
          .optional(),
        serviceDueDate: z.coerce
          .date({ message: 'serviceDueDate must be a valid date' })
          .optional(),
      })
      .strict()
  ),
  driverPack: z.boolean({ message: 'driverPack must be a boolean' }),
  notes: z.string({ message: 'notes must be a string' }).optional(),
  driverIds: z.array(
    z
      .string({ message: 'driverId must be a string' })
      .refine(isMongoId, { message: 'Please provide valid driver ids' })
  ),
  attachments: z
    .array(
      z
        .string({ message: 'attachment id must be a string' })
        .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' })
    )
    .optional(),
};

/**
 * Zod schema for creating a vehicle as a Transport Manager
 * → standAloneId is REQUIRED (must be one of the manager's approved clients)
 */
const zodCreateVehicleAsTransportManagerSchema = z
  .object({
    ...baseVehicleFields,
    standAloneId: z
      .string({ message: 'standAloneId must be a string' })
      .min(1, 'standAloneId is required for transport manager')
      .refine(isMongoId, { message: 'standAloneId must be a valid MongoDB ObjectId' }),
  })
  .strict();

export type CreateVehicleAsTransportManagerInput = z.infer<
  typeof zodCreateVehicleAsTransportManagerSchema
>;

/**
 * Zod schema for creating a vehicle as a Stand-Alone user
 * → standAloneId is optional (stand-alone users create their own vehicles)
 */
const zodCreateVehicleAsStandAloneSchema = z
  .object({
    ...baseVehicleFields,
    standAloneId: z
      .string()
      .refine(isMongoId, { message: 'Please provide a valid MongoDB ObjectId' })
      .optional(),
  })
  .strict();

export type CreateVehicleAsStandAloneInput = z.infer<typeof zodCreateVehicleAsStandAloneSchema>;

/**
 * Named validators — use these directly in your Express routes
 */
export const validateCreateVehicleAsTransportManager = validateBody(
  zodCreateVehicleAsTransportManagerSchema
);
export const validateCreateVehicleAsStandAlone = validateBody(zodCreateVehicleAsStandAloneSchema);

