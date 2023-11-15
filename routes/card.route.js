import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { validateSchema } from "../middlewares/validator.middleware.js";
import { cardSchema,deleteCardSchema } from "../schemas/user.schema.js";
import { addNewCard, showCards,deleteCard } from "../controllers/user.controller.js"
const router = Router();

router.post("/card",auth, validateSchema(cardSchema), addNewCard);
router.get("/card",auth, showCards);
router.delete("/card",auth, validateSchema(deleteCardSchema),deleteCard);




export default router;
