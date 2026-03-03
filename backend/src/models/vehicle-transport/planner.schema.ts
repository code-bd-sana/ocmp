import mongoose, { Schema } from 'mongoose';

export interface IPlanner extends Document {
  date: Date;
}

// Define the Planner schema
const PlannerSchema: Schema<IPlanner> = new Schema({
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Planner = mongoose.model<IPlanner>('Planner', PlannerSchema);

export default Planner;
