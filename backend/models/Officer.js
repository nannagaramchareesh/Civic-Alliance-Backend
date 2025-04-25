import mongoose from "mongoose";

const officerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    department: { type: String, required: true },
    role: { type: String, default: "Officer" }, 
    date: { type: Date, default: Date.now },
})

export default mongoose.model("Officer",officerSchema);