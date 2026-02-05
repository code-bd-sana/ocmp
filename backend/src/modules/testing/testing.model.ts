import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a Testing document
export interface ITesting extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  // fieldName: fieldType;
}

// Define the Testing schema
const TestingSchema: Schema<ITesting> = new Schema({
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

// Create the Testing model
const Testing = mongoose.model<ITesting>('Testing', TestingSchema);

// Export the Testing model
export default Testing;