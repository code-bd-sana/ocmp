import mongoose, { Schema } from 'mongoose';

export interface ISelfService extends Document {
  serviceName: string;
  description?: string;
  serviceLink?: string;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const SelfServiceSchema: Schema<ISelfService> = new Schema(
  {
    serviceName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    serviceLink: {
      type: String,
    },
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

const SelfService = mongoose.model<ISelfService>('SelfService', SelfServiceSchema);

export default SelfService;
