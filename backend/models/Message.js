import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    user: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    reactions: {
      type: Map,
      of: String, // values: 'like' | 'dislike'
      default: {},
    },
  });
  

export default mongoose.model("Message",messageSchema);
