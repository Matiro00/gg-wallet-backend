import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { exchangeBenefitsSchema } from "../schemas/user.schema.js";
import {showBenefits, exchangeBenefits, showBenefitsRedeemed} from "../controllers/user.controller.js"
const router = Router();

router.get("/benefit",auth, showBenefits);
router.get("/benefitRedeemed",auth, showBenefitsRedeemed);
router.put("/benefit",auth, validateSchema(exchangeBenefitsSchema), exchangeBenefits);



export default router;
