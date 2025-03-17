import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name:{type:String,required:true},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  role: { type: String, default: "Department Head" }, // Fixed Role
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("departmentHeadModel", userSchema);
