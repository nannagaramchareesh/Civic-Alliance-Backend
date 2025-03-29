import mongoose from "mongoose";

const officerSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
    },
    password:{
        type:String,
    },
})

export default mongoose.model("Officer",officerSchema);