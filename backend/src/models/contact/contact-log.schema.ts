import mongoose, { Document, Schema } from 'mongoose';

// Define and export an interface representing a contact-log document
export interface IContactLog extends Document {
  // Define the schema fields with their types
  date: Date;
  contactMethod?: string;
  person: string;
  subject: string;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate: Date;
  standAloneId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

// Define the contact-log schema
const ContactLogSchema: Schema<IContactLog> = new Schema(
  {
    // Define schema fields here
    // Example fields (replace with actual schema)
    date: {
      type: Date,
      required: true,
    },
    contactMethod: {
      type: String,
    },
    person: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    outcome: {
      type: String,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    standAloneId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference from User model
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Create the contact-log model
const ContactLog = mongoose.model<IContactLog>('ContactLog', ContactLogSchema);

// Export the contact-log model
export default ContactLog;
