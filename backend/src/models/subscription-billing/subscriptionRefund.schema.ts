import mongoose, { Document, Schema } from 'mongoose';

export enum SubscriptionRefundType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  PRORATED = 'PRORATED',
}

export enum SubscriptionRefundMethod {
  ORIGINAL_METHOD = 'ORIGINAL_METHOD',
  MANUAL = 'MANUAL',
}

// Define and export an interface representing a SubscriptionRefund document
export interface ISubscriptionRefund extends Document {
  userId: mongoose.Types.ObjectId;
  userSubscriptionId: mongoose.Types.ObjectId;
  subscriptionInvoiceId: mongoose.Types.ObjectId;
  subscriptionPaymentId: mongoose.Types.ObjectId;
  refundType: SubscriptionRefundType;
  refundReason?: string;
  paidAmount: number;
  usedDays?: number;
  totalDays?: number;
  calculatedRefundAmount?: number;
  approvedRefundAmount?: number;
  refundMethod: SubscriptionRefundMethod;
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  requestedAt: Date;
  approvedAt?: Date;
  refundedAt?: Date;
  adminNote?: string;
}

// Define the SubscriptionRefund schema
const SubscriptionRefundSchema: Schema<ISubscriptionRefund> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    userSubscriptionId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'UserSubscription', // Reference to the UserSubscription model
    },
    subscriptionInvoiceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'SubscriptionInvoice', // Reference to the SubscriptionInvoice model
    },
    subscriptionPaymentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'SubscriptionPayment', // Reference to the SubscriptionPayment model
    },
    refundType: {
      type: String,
      enum: Object.values(SubscriptionRefundType),
      required: true,
    },
    refundReason: {
      type: String,
    },
    paidAmount: {
      type: Number,
      required: true,
    },
    usedDays: {
      type: Number,
    },
    totalDays: {
      type: Number,
    },
    calculatedRefundAmount: {
      type: Number,
    },
    approvedRefundAmount: {
      type: Number,
    },
    refundMethod: {
      type: String,
      enum: Object.values(SubscriptionRefundMethod),
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
    },
    requestedAt: {
      type: Date,
      required: true,
    },
    approvedAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    adminNote: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionRefund model
const SubscriptionRefund = mongoose.model<ISubscriptionRefund>(
  'SubscriptionRefund',
  SubscriptionRefundSchema
);

// Export the SubscriptionRefund model
export default SubscriptionRefund;
