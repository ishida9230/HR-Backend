// TODO: Userテーブル削除によりコメントアウト（参考用に保持）
// import { Request, Response } from "express";
// import { AuthService } from "../services/auth.service";
// import { AuthRequest } from "../middleware/auth.middleware";

// TODO: Userテーブル削除によりコメントアウト（参考用に保持）
// const authService = new AuthService();

// TODO: Userテーブル削除によりコメントアウト（参考用に保持）
// export class AuthController {
//   async register(req: Request, res: Response): Promise<void> {
//     try {
//       const { email, password, firstName, lastName, role } = req.body;

//       if (!email || !password || !firstName || !lastName) {
//         res.status(400).json({ message: "必須項目を入力してください" });
//         return;
//       }

//       const result = await authService.register({
//         email,
//         password,
//         firstName,
//         lastName,
//         role,
//       });

//       res.status(201).json({
//         message: "ユーザー登録が完了しました",
//         user: result.user.toJSON(),
//         token: result.token,
//       });
//     } catch (error) {
//       const message = error instanceof Error ? error.message : "登録に失敗しました";
//       res.status(400).json({ message });
//     }
//   }

//   async login(req: Request, res: Response): Promise<void> {
//     try {
//       const { email, password } = req.body;

//       if (!email || !password) {
//         res.status(400).json({ message: "メールアドレスとパスワードを入力してください" });
//         return;
//       }

//       const result = await authService.login({ email, password });

//       res.json({
//         message: "ログインに成功しました",
//         user: result.user.toJSON(),
//         token: result.token,
//       });
//     } catch (error) {
//       const message = error instanceof Error ? error.message : "ログインに失敗しました";
//       res.status(401).json({ message });
//     }
//   }

//   async getMe(req: AuthRequest, res: Response): Promise<void> {
//     try {
//       if (!req.user) {
//         res.status(401).json({ message: "認証が必要です" });
//         return;
//       }

//       res.json({
//         user: req.user.toJSON(),
//       });
//     } catch (error) {
//       res.status(500).json({ message: "ユーザー情報の取得に失敗しました" });
//     }
//   }
// }
