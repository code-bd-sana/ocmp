import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a User document
export interface IUser extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  // fieldName: fieldType;
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
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

// Create the User model
const User = mongoose.model<IUser>('User', UserSchema);

// Export the User model
export default User;