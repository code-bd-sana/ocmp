import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionPayment document
export interface ISubscriptionPayment extends Document {
  subscriptionInvoiceId: mongoose.Types.ObjectId;
  transactionId?: string;
  paidAmount?: number;
  paymentStatus?: string;
  paidAt?: Date;
  paymentMethod?: 'CARD' | 'STRIPE' | 'CASH' | 'MANUAL';
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
    },
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['CARD', 'STRIPE', 'CASH', 'MANUAL'],
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
