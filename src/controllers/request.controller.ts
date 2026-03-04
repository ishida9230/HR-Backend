import { NextFunction, Request, Response } from "express";
import {
  createChangeRequest,
  getChangeRequestById,
  hideChangeRequest,
} from "../services/request.service";
import { CreateRequestRequest } from "../dtos/request.dto";
import HttpException from "../exceptions/HttpException";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_INVALID_EMPLOYEE_ID,
  ERROR_MESSAGE_MISSING_REQUIRED_FIELDS,
  ERROR_MESSAGE_INVALID_REQUEST_ID,
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

/**
 * GET /api/requests/:id
 * 変更申請詳細取得ハンドラー
 */
export async function getRequestByIdHandler(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(request.params.id, 10);

    // バリデーション: IDが正の整数であることを確認
    const idValidation = validatePositiveIntegerId(id, "requestId");
    if (!idValidation.isValid) {
      next(
        new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_REQUEST_ID, {
          requestId: idValidation.error?.value,
        })
      );
      return;
    }

    const requestId = idValidation.id!;

    // サービス層で変更申請取得（ビジネスロジック含む）
    const changeRequest = await getChangeRequestById(requestId);

    // 成功レスポンス
    response.status(HTTP_STATUS.OK).json(changeRequest);
  } catch (error) {
    next(error); // エラーをそのままエラーミドルウェアに渡す
  }
}

/**
 * PATCH /api/requests/:id/hide
 * 変更申請を非表示にするハンドラー
 */
export async function hideRequestHandler(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    // throw new Error("test");
    const id = parseInt(request.params.id, 10);

    // バリデーション: IDが正の整数であることを確認
    const idValidation = validatePositiveIntegerId(id, "requestId");
    if (!idValidation.isValid) {
      next(
        new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_REQUEST_ID, {
          requestId: idValidation.error?.value,
        })
      );
      return;
    }

    const requestId = idValidation.id!;

    // サービス層で非表示処理（ビジネスロジック含む）
    const hiddenRequest = await hideChangeRequest(requestId);

    // 成功レスポンス
    response.status(HTTP_STATUS.OK).json(hiddenRequest);
  } catch (error) {
    next(error); // エラーをそのままエラーミドルウェアに渡す
  }
}
