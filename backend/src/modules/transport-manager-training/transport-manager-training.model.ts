import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a transport-manager-training document
export interface ITransportManagerTraining extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  // fieldName: fieldType;
}

// Define the transport-manager-training schema
const TransportManagerTrainingSchema: Schema<ITransportManagerTraining> = new Schema({
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

// Create the transport-manager-training model
const TransportManagerTraining = mongoose.model<ITransportManagerTraining>('TransportManagerTraining', TransportManagerTrainingSchema);

// Export the transport-manager-training model
export default TransportManagerTraining;