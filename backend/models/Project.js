import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  category: { type: String, required: true },
  department:{ type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  resourcesNeeded: { type: String },
  priority: {type:Number,required:true},
  interDepartmental: { type: Boolean, default: false },
  // isCompleted:{type:Boolean,deafult:false},
  collaborationRequests: [
    {
      name: { type: String, required: true }, // Department requesting collaboration
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
      message: { type: String, default: "" }
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
  },  
  // Approved Collaborating Departments
  collaboratingDepartments: [
    {
      name: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date }, // Nullable, filled when collaboration ends
      status: { type: String, enum: ["approved",'pending'], default: "approved" }

    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Project", projectSchema);
