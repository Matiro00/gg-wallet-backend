import mongoose from "mongoose";
const benefitsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
          },
        ammountAvailable: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        }
    }
)


export default mongoose.model("Benefits", benefitsSchema);
