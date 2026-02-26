import { NextFunction, Request, Response } from "express";
import { createChangeRequest } from "../services/request.service";
import { CreateRequestRequest } from "../dtos/request.dto";
import HttpException from "../exceptions/HttpException";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_INVALID_EMPLOYEE_ID,
  ERROR_MESSAGE_MISSING_REQUIRED_FIELDS,
} from "../constants/error-messages";
import { validatePositiveIntegerId } from "../utils/validation";

/**
 * POST /api/requests
 * 変更申請作成ハンドラー
 */
export async function createRequestHandler(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = request.body as CreateRequestRequest;

    // バリデーション: 必須フィールドの確認（employeeIdは後でvalidatePositiveIntegerIdでチェック）
    if (
      body.employeeId === undefined ||
      body.employeeId === null ||
      !body.text ||
      !body.items ||
      !Array.isArray(body.items) ||
      body.items.length === 0
    ) {
      next(
        new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_MISSING_REQUIRED_FIELDS, {
          body: request.body,
        })
      );
      return;
    }

    // バリデーション: 従業員IDが正の整数であることを確認
    const employeeIdValidation = validatePositiveIntegerId(body.employeeId, "employeeId");
    if (!employeeIdValidation.isValid) {
      next(
        new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_EMPLOYEE_ID, {
          employeeId: employeeIdValidation.error?.value,
        })
      );
      return;
    }

    const employeeId = employeeIdValidation.id!;

    // サービス層で変更申請作成（ビジネスロジック含む）
    const createdRequest = await createChangeRequest({
      employeeId,
      text: body.text,
      items: body.items,
    });

    // 成功レスポンス
    response.status(HTTP_STATUS.CREATED).json(createdRequest);
  } catch (error) {
    next(error); // エラーをそのままエラーミドルウェアに渡す
  }
}
