import mongoose from "mongoose";
const cardSchema = new mongoose.Schema(
    {
        cardNumber: {
            type: String,
            required: true,
            trim: true,
            unique: true
          },
        goodTill: {
            type: String,
            required: true,
          },
        secretCode: {
            type: String,
            required: true,
        },
        lastFourNumbers: {
            type: Number
        },
        dni: {
            type: Number,
            required: true,
        }
    }
)


export default mongoose.model("Card", cardSchema);
