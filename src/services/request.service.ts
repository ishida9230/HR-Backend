import { Request } from "../entities/Request";
import {
  saveRequest,
  saveRequestItems,
  getRequestById,
  hasPendingRequestByEmployeeId,
  getRequestByIdWithoutRelations,
  updateRequestIsHidden,
} from "../repositories/request.repository";
import { CreateRequestRequest, RequestResponse } from "../dtos/request.dto";
import { getEmployeeById } from "../repositories/employee.repository";
import { getBranchById } from "../repositories/branch.repository";
import { getDepartmentById } from "../repositories/department.repository";
import { getPositionById } from "../repositories/position.repository";
import HttpException from "../exceptions/HttpException";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_REQUEST_CREATION_FAILED,
  ERROR_MESSAGE_REQUEST_CREATION_ERROR,
  ERROR_MESSAGE_REQUEST_NOT_FOUND,
  ERROR_MESSAGE_INVALID_BRANCH_ID,
  ERROR_MESSAGE_INVALID_DEPARTMENT_ID,
  ERROR_MESSAGE_INVALID_POSITION_ID,
  ERROR_MESSAGE_DATA_FETCH_ERROR,
  ERROR_MESSAGE_PENDING_REQUEST_EXISTS,
  ERROR_MESSAGE_REQUEST_ALREADY_HIDDEN,
} from "../constants/error-messages";
import { RequestStatus } from "../entities/Request";
import { AppDataSource } from "../config/database";

/**
 * 所属情報のJSON文字列をパースして、IDから名前を取得した形式に変換
 * @param value アサインメント配列のJSON文字列またはnull
 * @returns {branches: [{id, name}], departments: [{id, name}], positions: [{id, name}]}のJSON文字列、またはnull
 * @throws HttpException マスターデータが存在しない場合（DB整合性違反）
 */
export async function formatAssignmentsValue(value: string | null): Promise<string | null> {
  if (!value) {
    return value;
  }

  try {
    const assignments = JSON.parse(value) as Array<{
      branchId: number;
      departmentId: number;
      positionId: number;
    }>;
    if (!Array.isArray(assignments)) {
      return value;
    }

    // 元の配列の順序を保持するため、出現順序を記録
    // 重複チェックは行わず、すべてのマスターデータを含める
    const branchList: Array<{ id: number; name: string; order: number }> = [];
    const departmentList: Array<{ id: number; name: string; order: number }> = [];
    const positionList: Array<{ id: number; name: string; order: number }> = [];

    // 重複を避けるためのMap（マスターデータ取得の最適化用）
    const branchCache = new Map<number, { id: number; name: string }>();
    const departmentCache = new Map<number, { id: number; name: string }>();
    const positionCache = new Map<number, { id: number; name: string }>();

    // 各アサインメントからマスターデータを取得（順次処理で順序を保証）
    for (let index = 0; index < assignments.length; index++) {
      const a = assignments[index];
      const branchId = Number(a.branchId);
      const departmentId = Number(a.departmentId);
      const positionId = Number(a.positionId);

      // キャッシュから取得、なければDBから取得
      let branch = branchCache.get(branchId);
      let department = departmentCache.get(departmentId);
      let position = positionCache.get(positionId);

      if (!branch) {
        const fetchedBranch = await getBranchById(branchId);
        if (!fetchedBranch) {
          throw new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_BRANCH_ID, {
            branchId,
          });
        }
        branch = { id: fetchedBranch.id, name: fetchedBranch.name };
        branchCache.set(branchId, branch);
      }

      if (!department) {
        const fetchedDepartment = await getDepartmentById(departmentId);
        if (!fetchedDepartment) {
          throw new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_DEPARTMENT_ID, {
            departmentId,
          });
        }
        department = { id: fetchedDepartment.id, name: fetchedDepartment.name };
        departmentCache.set(departmentId, department);
      }

      if (!position) {
        const fetchedPosition = await getPositionById(positionId);
        if (!fetchedPosition) {
          throw new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_POSITION_ID, {
            positionId,
          });
        }
        position = { id: fetchedPosition.id, name: fetchedPosition.name };
        positionCache.set(positionId, position);
      }

      // リストに追加（重複チェックなし、すべて追加）
      branchList.push({ id: branch.id, name: branch.name, order: index });
      departmentList.push({ id: department.id, name: department.name, order: index });
      positionList.push({ id: position.id, name: position.name, order: index });
    }

    // 元の配列での出現順序でソート
    const branches = branchList.sort((a, b) => a.order - b.order);
    const departments = departmentList.sort((a, b) => a.order - b.order);
    const positions = positionList.sort((a, b) => a.order - b.order);

    // orderプロパティを削除して返す
    const branchesFormatted = branches.map(({ order: _order, ...rest }) => rest);
    const departmentsFormatted = departments.map(({ order: _order, ...rest }) => rest);
    const positionsFormatted = positions.map(({ order: _order, ...rest }) => rest);

    return JSON.stringify({
      branches: branchesFormatted,
      departments: departmentsFormatted,
      positions: positionsFormatted,
    });
  } catch (error) {
    // HttpExceptionの場合はそのまま再スロー
    if (error instanceof HttpException) {
      throw error;
    }
    // JSONパースに失敗した場合やその他のエラーはデータ不整合として扱う
    throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGE_DATA_FETCH_ERROR, {
      originalError: error instanceof Error ? error.message : String(error),
      value,
    });
  }
}

/**
 * RequestエンティティをレスポンスDTOに変換
 */
async function mapRequestToResponse(request: Request): Promise<RequestResponse> {
  // itemsを非同期で処理（assignmentsフィールドの場合にIDから名前を取得）
  const items = await Promise.all(
    request.items.map(async (item) => {
      let oldValue = item.oldValue;
      let newValue = item.newValue;

      // assignmentsフィールドの場合、IDから名前を取得
      if (item.fieldKey === "assignments") {
        oldValue = await formatAssignmentsValue(item.oldValue);
        newValue = await formatAssignmentsValue(item.newValue);
      }

      return {
        id: item.id,
        fieldKey: item.fieldKey,
        oldValue,
        newValue,
        createdAt: item.createdAt.toISOString(),
      };
    })
  );

  return {
    id: request.id,
    employeeId: request.employeeId,
    status: request.status,
    text: request.text,
    submittedAt: request.submittedAt ? request.submittedAt.toISOString() : null,
    completedAt: request.completedAt ? request.completedAt.toISOString() : null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    isHidden: request.isHidden,
    items,
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

    // ビジネスロジック: 承認待ちの変更申請が既に存在するかチェック
    const hasPending = await hasPendingRequestByEmployeeId(requestData.employeeId);
    if (hasPending) {
      throw new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_PENDING_REQUEST_EXISTS);
    }

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
    return await mapRequestToResponse(request);
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

/**
 * 変更申請をIDで取得（ビジネスロジック層）
 * @param id 変更申請ID
 * @returns 変更申請レスポンス
 * @throws HttpException 変更申請が見つからない場合 (404)
 */
export async function getChangeRequestById(id: number): Promise<RequestResponse> {
  const request = await getRequestById(id);

  if (!request) {
    throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND, {
      requestId: id,
    });
  }

  return await mapRequestToResponse(request);
}

/**
 * 変更申請を非表示にする（ビジネスロジック層）
 * @param id 変更申請ID
 * @returns 更新された変更申請ID
 * @throws HttpException 変更申請が見つからない場合 (404) または既に非表示の場合 (400)
 */
export async function hideChangeRequest(id: number): Promise<{ id: number }> {
  // 1. 存在確認（リポジトリ層で取得）
  const request = await getRequestByIdWithoutRelations(id);

  // 2. 存在チェック（サービス層でエラーハンドリング）
  if (!request) {
    throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND, {
      requestId: id,
    });
  }

  // 3. ビジネスロジックチェック（サービス層）
  if (request.isHidden) {
    throw new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_REQUEST_ALREADY_HIDDEN, {
      requestId: id,
    });
  }

  // 4. 更新（リポジトリ層でDB操作）
  const updatedRequest = await updateRequestIsHidden(request);

  // レスポンスは更新したrequestIdのみ
  return { id: updatedRequest.id };
}
