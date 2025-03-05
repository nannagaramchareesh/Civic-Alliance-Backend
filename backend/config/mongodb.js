import mongoose from 'mongoose';
const connectDB = async()=>{
     mongoose.connect(`${process.env.MONGODB_URL}/civicalliance`).then(()=>{
        console.log("Connected to mongodb")
     })
}

export default connectDB;