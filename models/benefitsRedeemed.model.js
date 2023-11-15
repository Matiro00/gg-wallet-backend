import mongoose from "mongoose";
const benefitsRedeemedSchema = new mongoose.Schema(
    {
        dni: {
            type: Number,
            required: true,
        },
        idBenefit: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        }
    }
)


export default mongoose.model("BenefitsRedeemed", benefitsRedeemedSchema);
