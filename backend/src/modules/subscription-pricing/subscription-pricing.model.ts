import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a SubscriptionPricing document
export interface ISubscriptionPricing extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  // fieldName: fieldType;
}

// Define the SubscriptionPricing schema
const SubscriptionPricingSchema: Schema<ISubscriptionPricing> = new Schema({
  // Define schema fields here
  // Example fields (replace with actual schema)
  // fieldName: {
  //   type: Schema.Types.FieldType,
  //   required: true,
  //   trim: true,
  // },
},{
 timestamps: true,
 versionKey: false,
});

// Create the SubscriptionPricing model
const SubscriptionPricing = mongoose.model<ISubscriptionPricing>('SubscriptionPricing', SubscriptionPricingSchema);

// Export the SubscriptionPricing model
export default SubscriptionPricing;