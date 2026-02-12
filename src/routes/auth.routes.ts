import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

// 認証不要
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

// 認証必要
router.get("/me", authMiddleware, (req, res) => authController.getMe(req, res));

export default router;
