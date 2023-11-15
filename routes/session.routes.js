import { Router } from "express";
import {
  login,
  logout,
  verifyToken,
} from "../controllers/user.controller.js";

import { validateSchema } from "../middlewares/validator.middleware.js";
import { loginSchema } from "../schemas/user.schema.js";

const router = Router();

router.post("/session", validateSchema(loginSchema), login);
router.get("/session", verifyToken);
router.delete("/session", verifyToken, logout);
export default router;
