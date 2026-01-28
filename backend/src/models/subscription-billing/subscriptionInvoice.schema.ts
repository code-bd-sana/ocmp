import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionInvoice document
export interface ISubscriptionInvoice extends Document {
  userId: mongoose.Types.ObjectId;
  userSubscriptionId: mongoose.Types.ObjectId;
  invoiceNumber: string; /* Unique invoice ID */
  amount?: number;
  status?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  dueDate?: Date;
}

// Define the SubscriptionInvoice schema
const SubscriptionInvoiceSchema: Schema<ISubscriptionInvoice> = new Schema(
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
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    } /* Unique invoice ID */,
    amount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    },
    dueDate: {
      type: Date, // Due date for the invoice payment
    },
  },
  { timestamps: true, versionKey: false }
);

// Create the SubscriptionInvoice model
const SubscriptionInvoice = mongoose.model<ISubscriptionInvoice>(
  'SubscriptionInvoice',
  SubscriptionInvoiceSchema
);

// Export the SubscriptionInvoice model
export default SubscriptionInvoice;
