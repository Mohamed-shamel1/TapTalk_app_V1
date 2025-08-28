import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  jti:{
    type: String,
    required: true,
    unique: true,
  },
  expireIn: {
    type:Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});


const tokenModel = mongoose.model("Token", tokenSchema);

export default tokenModel;