import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a payment document
export interface IPayment extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  // fieldName: fieldType;
}

// Define the payment schema
const PaymentSchema: Schema<IPayment> = new Schema({
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

// Create the payment model
const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

// Export the payment model
export default Payment;