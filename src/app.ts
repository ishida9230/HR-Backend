import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import errorMiddleware from "./middleware/error.middleware";
import { getEmployeeProfileHandler } from "./controllers/employee.controller";
import HttpException from "./exceptions/HttpException";
import { HTTP_STATUS, ERROR_MESSAGE_ENDPOINT_NOT_FOUND } from "./constants/error-messages";

const app: Application = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 処理時間の計測用ミドルウェア
app.use((request: Request, response: Response, next: express.NextFunction) => {
  (request as Request & { startTime: number }).startTime = Date.now();
  next();
});

// Routes
// 従業員関連API
app.get("/api/employees/:id", (req, res, next) => {
  void getEmployeeProfileHandler(req, res, next);
});

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_ENDPOINT_NOT_FOUND));
});

// Error handler
app.use(errorMiddleware);

export default app;
