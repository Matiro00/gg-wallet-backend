import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    dni: {
      type: Number,
      required: true,
      unique: true,
    },
    credits: {
      type: Number,
      required: true
    },
    ggwcbu: {
      type: String,
      required: true
    },
    valid: {
      type: Boolean,
      required: true
    },
    code:{
      type: String
    },
    lastValidated:{
      type: Date
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
