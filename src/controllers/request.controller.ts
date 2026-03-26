import { NextFunction, Request, Response } from "express";
import {
  createChangeRequest,
  getChangeRequestById,
  hideChangeRequest,
  getRequestCountsService,
  getRequestListService,
  getRequestForApprovalService,
  processRequestActionService,
} from "../services/request.service";
import { CreateRequestRequest, RequestActionRequest } from "../dtos/request.dto";
import { RequestListQuery } from "../dtos/request.dto";
import HttpException from "../exceptions/HttpException";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_INVALID_EMPLOYEE_ID,
  ERROR_MESSAGE_MISSING_REQUIRED_FIELDS,
  ERROR_MESSAGE_INVALID_REQUEST_ID,
  ERROR_MESSAGE_STATUS_REQUIRED,
  ERROR_MESSAGE_ACTOR_ID_REQUIRED,
  ERROR_MESSAGE_REJECT_COMMENT_REQUIRED,
} from "../constants/error-messages";
import { validatePositiveIntegerId } from "../utils/validation";
import { parseIdArray } from "../utils/query-parser";

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

/**
 * GET /api/requests/count
 * 申請件数取得ハンドラー
 */
export async function getRequestCountsHandler(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    // サービス層で申請件数取得
    const counts = await getRequestCountsService();

    // 成功レスポンス
    response.status(HTTP_STATUS.OK).json(counts);
  } catch (error) {
    next(error); // エラーをそのままエラーミドルウェアに渡す
  }
}

/**
 * GET /api/requests/list
 * 申請一覧取得ハンドラー
 */
export async function getRequestListHandler(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = request.query;

    // クエリパラメータをパース（Expressのクエリパラメータは文字列または文字列配列）
    const statusParams = Array.isArray(query.status)
      ? query.status
      : query.status
      ? [query.status]
      : [];
    const departmentIdParams = Array.isArray(query.departmentIds)
      ? query.departmentIds
      : query.departmentIds
      ? [query.departmentIds]
      : [];
    const branchIdParams = Array.isArray(query.branchIds)
      ? query.branchIds
      : query.branchIds
      ? [query.branchIds]
      : [];
    const positionIdParams = Array.isArray(query.positionIds)
      ? query.positionIds
      : query.positionIds
      ? [query.positionIds]
      : [];

    const listQuery: RequestListQuery = {
      statuses:
        statusParams.length > 0
          ? statusParams.map((s) => String(s)).filter((s) => s.length > 0)
          : undefined,
      employeeName: typeof query.employeeName === "string" ? query.employeeName : undefined,
      departmentIds: departmentIdParams.length > 0 ? parseIdArray(departmentIdParams) : undefined,
      branchIds: branchIdParams.length > 0 ? parseIdArray(branchIdParams) : undefined,
      positionIds: positionIdParams.length > 0 ? parseIdArray(positionIdParams) : undefined,
      page: query.page ? parseInt(String(query.page), 10) : 1,
      limit: query.limit ? parseInt(String(query.limit), 10) : 25,
    };

    // サービス層で申請一覧取得
    const result = await getRequestListService(listQuery);

    // 成功レスポンス
    response.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error); // エラーをそのままエラーミドルウェアに渡す
  }
}

/**
 * GET /api/requests/:id/approve
 * 申請承認画面用の申請詳細取得ハンドラー（前回の承認情報を含む）
 */
export async function getRequestForApprovalHandler(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawId = parseInt(request.params.id, 10);
    const idValidation = validatePositiveIntegerId(rawId, "requestId");
    if (!idValidation.isValid) {
      next(
        new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_REQUEST_ID, {
          requestId: idValidation.error?.value ?? request.params.id,
        })
      );
      return;
    }

    const id = idValidation.id!;
    const result = await getRequestForApprovalService(id);
    response.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/requests/:id/action
 * 申請承認・差し戻し統合ハンドラー
 */
export async function processRequestActionHandler(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawId = parseInt(request.params.id, 10);
    const idValidation = validatePositiveIntegerId(rawId, "requestId");
    if (!idValidation.isValid) {
      next(
        new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_REQUEST_ID, {
          requestId: idValidation.error?.value ?? request.params.id,
        })
      );
      return;
    }

    const id = idValidation.id!;
    const body = request.body as RequestActionRequest;

    // バリデーション: statusが必須
    if (!body.status || typeof body.status !== "string") {
      next(
        new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_STATUS_REQUIRED, {
          body: request.body,
        })
      );
      return;
    }

    // バリデーション: 実行者IDが必須
    if (!body.actedByEmployeeId || typeof body.actedByEmployeeId !== "number") {
      next(
        new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_ACTOR_ID_REQUIRED, {
          body: request.body,
        })
      );
      return;
    }

    // バリデーション: 差し戻し時（statusがCHANGES_REQUESTED）はコメントが必須
    if (body.status === "CHANGES_REQUESTED" && (!body.comment || !body.comment.trim())) {
      next(
        new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_REJECT_COMMENT_REQUIRED, {
          body: request.body,
        })
      );
      return;
    }

    const result = await processRequestActionService(id, body);
    response.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
}
