// TODO: Userテーブル削除によりコメントアウト（参考用に保持）
// import { Router } from "express";
// import { AuthController } from "../controllers/auth.controller";
// import { authMiddleware } from "../middleware/auth.middleware";

// TODO: Userテーブル削除によりコメントアウト（参考用に保持）
// const router = Router();
// const authController = new AuthController();

// // 認証不要
// router.post("/register", (req, res) => authController.register(req, res));
// router.post("/login", (req, res) => authController.login(req, res));

// // 認証必要
// router.get("/me", authMiddleware, (req, res) => authController.getMe(req, res));

// TODO: Userテーブル削除によりコメントアウト（参考用に保持）
// export default router;

// 一時的な空のルーター（エラー回避用）
import { Router } from "express";
const router = Router();
export default router;
