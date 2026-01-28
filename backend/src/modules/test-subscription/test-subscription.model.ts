import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a TestSubscription document
export interface ITestSubscription extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  // fieldName: fieldType;
  name: string;
  planType: 'FREE' | 'PAID' | 'CUSTOM';
  applicableAccountType?: 'STANDALONE' | 'TRANSPORT_MANAGER' | 'BOTH';
  description?: string;
  isActive?: boolean;
  createdBy: mongoose.Types.ObjectId;
}

// Define the TestSubscription schema
const TestSubscriptionSchema: Schema<ITestSubscription> = new Schema(
  {
    // Define schema fields here
    // Example fields (replace with actual schema)
    // fieldName: {
    //   type: Schema.Types.FieldType,
    //   required: true,
    //   trim: true,
    // },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create the TestSubscription model
const TestSubscription = mongoose.model<ITestSubscription>(
  'TestSubscription',
  TestSubscriptionSchema
);

// Export the TestSubscription model
export default TestSubscription;

