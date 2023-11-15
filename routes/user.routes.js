import { Router } from "express";
import {
  register,

} from "../controllers/user.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { registerSchema, transferCreditsSchema, userCodeSchema,userResendCodeSchema, addsCreditSchema } from "../schemas/user.schema.js";
import {transferCredit, verifyEmail, resendCode,addsCredit} from "../controllers/user.controller.js"
const router = Router();

router.post("/user", validateSchema(registerSchema), register);
router.post("/user/code", validateSchema(userCodeSchema), verifyEmail);
router.put("/user/code", validateSchema(userResendCodeSchema), resendCode);
router.put("/user/credit",auth, validateSchema(transferCreditsSchema), transferCredit);
router.put("/user", validateSchema(addsCreditSchema), addsCredit);




export default router;
