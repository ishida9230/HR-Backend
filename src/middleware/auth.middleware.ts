// TODO: Userテーブル削除によりコメントアウト（参考用に保持）
// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import { AppDataSource } from "../config/database";
// import { User } from "../entities/User";

// TODO: Userテーブル削除によりコメントアウト（参考用に保持）
// export interface AuthRequest extends Request {
//   user?: User;
// }

// TODO: Userテーブル削除によりコメントアウト（参考用に保持）
// export const authMiddleware = async (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       res.status(401).json({ message: "認証トークンがありません" });
//       return;
//     }

//     const token = authHeader.split(" ")[1];
//     const secret = process.env.JWT_SECRET || "default-secret";

//     const decoded = jwt.verify(token, secret) as { userId: string };

//     const userRepository = AppDataSource.getRepository(User);
//     const user = await userRepository.findOne({
//       where: { id: decoded.userId },
//     });

//     if (!user || !user.isActive) {
//       res.status(401).json({ message: "無効なユーザーです" });
//       return;
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: "無効なトークンです" });
//   }
// };
