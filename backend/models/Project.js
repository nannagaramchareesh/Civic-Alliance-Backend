import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  resourcesNeeded: { type: String },
  interDepartmental: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "departmentHeadModel", required: true }, // Reference to User
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Project", projectSchema);
