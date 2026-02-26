import { Request } from "../entities/Request";
import { saveRequest, saveRequestItems, getRequestById } from "../repositories/request.repository";
import { CreateRequestRequest, RequestResponse } from "../dtos/request.dto";
import { getEmployeeById } from "../repositories/employee.repository";
import HttpException from "../exceptions/HttpException";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_REQUEST_CREATION_FAILED,
  ERROR_MESSAGE_REQUEST_CREATION_ERROR,
} from "../constants/error-messages";
import { RequestStatus } from "../entities/Request";
import { AppDataSource } from "../config/database";

/**
 * RequestエンティティをレスポンスDTOに変換
 */
function mapRequestToResponse(request: Request): RequestResponse {
  return {
    id: request.id,
    employeeId: request.employeeId,
    status: request.status,
    text: request.text,
    submittedAt: request.submittedAt ? request.submittedAt.toISOString() : null,
    completedAt: request.completedAt ? request.completedAt.toISOString() : null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    items: request.items.map((item) => ({
      id: item.id,
      fieldKey: item.fieldKey,
      oldValue: item.oldValue,
      newValue: item.newValue,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

/**
 * 変更申請を作成（ビジネスロジック層）
 * @param requestData 変更申請リクエストデータ
 * @returns 作成された変更申請レスポンス
 * @throws HttpException 従業員が見つからない場合 (404) またはデータ変換エラー (500)
 */
export async function createChangeRequest(
  requestData: CreateRequestRequest
): Promise<RequestResponse> {
  try {
    // ビジネスロジック: 申請者の存在確認（getEmployeeById内で既にチェック済み）
    await getEmployeeById(requestData.employeeId);

    // ビジネスロジック: トランザクション内で変更申請とアイテムを作成
    const request = await AppDataSource.transaction(async (transactionalEntityManager) => {
      // リポジトリ層で変更申請を作成
      const savedRequest = await saveRequest(
        {
          employeeId: requestData.employeeId,
          text: requestData.text,
          status: RequestStatus.PENDING_MANAGER,
          submittedAt: new Date(),
        },
        transactionalEntityManager
      );

      // リポジトリ層で変更申請アイテムを作成
      await saveRequestItems(
        requestData.items.map((item) => ({
          requestId: savedRequest.id,
          fieldKey: item.fieldKey,
          oldValue: item.oldValue,
          newValue: item.newValue,
        })),
        transactionalEntityManager
      );

      // リポジトリ層でリレーションを含めて取得
      const requestWithItems = await getRequestById(savedRequest.id, transactionalEntityManager);

      if (!requestWithItems) {
        throw new Error(ERROR_MESSAGE_REQUEST_CREATION_FAILED);
      }

      return requestWithItems;
    });

    // ビジネスロジック: データ変換（エンティティ → DTO）
    return mapRequestToResponse(request);
  } catch (error) {
    if (error instanceof HttpException) {
      throw error; // 既にHttpExceptionの場合はそのまま再スロー
    }
    // その他の予期しないエラー（例: データ変換エラー、TypeORMエラーなど）
    throw new HttpException(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ERROR_MESSAGE_REQUEST_CREATION_ERROR,
      {
        originalError: error instanceof Error ? error.message : String(error),
      }
    );
  }
}
