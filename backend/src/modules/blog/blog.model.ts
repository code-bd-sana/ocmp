import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a Blog document
export interface IBlog extends Document {
  // Define the schema fields with their types
  // Example fields (replace with actual fields)
  // fieldName: fieldType;
}

// Define the Blog schema
const BlogSchema: Schema<IBlog> = new Schema({
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

// Create the Blog model
const Blog = mongoose.model<IBlog>('Blog', BlogSchema);

// Export the Blog model
export default Blog;