import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a Test document
export interface ITest extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  // fieldName: fieldType;
}

// Define the Test schema
const TestSchema: Schema<ITest> = new Schema({
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

// Create the Test model
const Test = mongoose.model<ITest>('Test', TestSchema);

// Export the Test model
export default Test;