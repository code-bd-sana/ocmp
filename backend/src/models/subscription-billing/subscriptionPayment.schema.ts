import mongoose, { Document, Schema } from 'mongoose';
import { SubscriptionInvoiceStatus } from './subscriptionInvoice.schema';

export enum SubscriptionPaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  MANUAL = 'MANUAL',
}

// Define and export an interface representing a SubscriptionPayment document
export interface ISubscriptionPayment extends Document {
  subscriptionInvoiceId: mongoose.Types.ObjectId;
  transactionId?: string;
  paidAmount?: number;
  paymentStatus?: SubscriptionInvoiceStatus;
  paidAt?: Date;
  paymentMethod?: SubscriptionPaymentMethod;
}

// Define the SubscriptionPayment schema
const SubscriptionPaymentSchema: Schema<ISubscriptionPayment> = new Schema(
  {
    subscriptionInvoiceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'SubscriptionInvoice', // Reference to the SubscriptionInvoice model
    },
    transactionId: {
      type: String,
    },
    paidAmount: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(SubscriptionInvoiceStatus),
    },
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(SubscriptionPaymentMethod),
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionPayment model
const SubscriptionPayment = mongoose.model<ISubscriptionPayment>(
  'SubscriptionPayment',
  SubscriptionPaymentSchema
);

// Export the SubscriptionPayment model
export default SubscriptionPayment;
