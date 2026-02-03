import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a Tracking document
export interface ITracking extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  // fieldName: fieldType;
}

// Define the Tracking schema
const TrackingSchema: Schema<ITracking> = new Schema({
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

// Create the Tracking model
const Tracking = mongoose.model<ITracking>('Tracking', TrackingSchema);

// Export the Tracking model
export default Tracking;