import { Request, Response, NextFunction } from "express";
import HttpException from "../exceptions/HttpException";
import { HTTP_STATUS, ERROR_MESSAGE_SERVER_ERROR } from "../constants/error-messages";

/**
 * エラーハンドリングミドルウェア
 * 全てのエラーをHttpExceptionに統一して処理
 */
function errorMiddleware(
  error: Error | HttpException,
  request: Request,
  response: Response,
  _next: NextFunction
): void {
  // HttpExceptionでない場合は500エラーとして扱う（固定の文言を返す）
  let httpException: HttpException;
  if (error instanceof HttpException) {
    httpException = error;
  } else {
    // 予期しないエラー（TypeORMエラー、データベースエラーなど）は500エラーとして扱う
    // 固定の文言を返す（エラーの詳細情報はログにのみ出力）
    httpException = new HttpException(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGE_SERVER_ERROR,
      {
        originalError: error.name,
      }
    );
  }

  const status = httpException.status;
  const message = httpException.message;
  const code = status;
  const details = httpException.details;

  // エラーログ出力（詳細な情報を含む）
  const logData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    status,
    message,
    details,
    errorType: error instanceof HttpException ? "HttpException" : error.constructor.name,
    stack: error.stack, // スタックトレース（開発環境のみ推奨）
  };

  if (status >= 500) {
    console.error("❌ サーバーエラー:", JSON.stringify(logData, null, 2));
    console.error("エラー詳細:", error);
  } else {
    console.warn("⚠️ クライアントエラー:", JSON.stringify(logData, null, 2));
  }

  // エラーレスポンス
  response.status(status).json({
    error: {
      code,
      message,
      ...(details && { details }),
    },
  });
}

export default errorMiddleware;
