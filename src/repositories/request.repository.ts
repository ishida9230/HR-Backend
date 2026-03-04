import { Repository, EntityManager } from "typeorm";
import { AppDataSource } from "../config/database";
import { Request, RequestStatus } from "../entities/Request";
import { RequestItem } from "../entities/RequestItem";

/**
 * 変更申請リポジトリを取得
 */
function getRequestRepository(manager?: EntityManager): Repository<Request> {
  if (manager) {
    return manager.getRepository(Request);
  }
  return AppDataSource.getRepository(Request);
}

/**
 * 変更申請アイテムリポジトリを取得
 */
function getRequestItemRepository(manager?: EntityManager): Repository<RequestItem> {
  if (manager) {
    return manager.getRepository(RequestItem);
  }
  return AppDataSource.getRepository(RequestItem);
}

/**
 * 変更申請を作成（データアクセスのみ）
 * @param requestData 変更申請データ
 * @param manager トランザクション用のEntityManager（オプション）
 * @returns 作成された変更申請エンティティ
 */
export async function saveRequest(
  requestData: {
    employeeId: number;
    text: string;
    status: RequestStatus;
    submittedAt: Date;
  },
  manager?: EntityManager
): Promise<Request> {
  const requestRepository = getRequestRepository(manager);
  const request = requestRepository.create(requestData);
  return await requestRepository.save(request);
}

/**
 * 変更申請アイテムを作成（データアクセスのみ）
 * @param items 変更申請アイテムの配列
 * @param manager トランザクション用のEntityManager（オプション）
 * @returns 作成された変更申請アイテムの配列
 */
export async function saveRequestItems(
  items: Array<{
    requestId: number;
    fieldKey: string;
    oldValue: string | null;
    newValue: string | null;
  }>,
  manager?: EntityManager
): Promise<RequestItem[]> {
  const requestItemRepository = getRequestItemRepository(manager);
  const requestItems = items.map((item) => requestItemRepository.create(item));
  return await requestItemRepository.save(requestItems);
}

/**
 * 変更申請をIDで取得（リレーション含む）
 * @param id 変更申請ID
 * @param manager トランザクション用のEntityManager（オプション）
 * @returns 変更申請エンティティ（リレーション含む）
 * @description
 * - requestsテーブルから変更申請情報を取得
 * - request_itemsテーブルから変更項目（items）を取得（relations: ["items"]により自動JOIN）
 * - Requestエンティティの@OneToManyリレーションにより、request_itemsテーブルと結合される
 */
export async function getRequestById(id: number, manager?: EntityManager): Promise<Request | null> {
  const requestRepository = getRequestRepository(manager);
  return await requestRepository.findOne({
    where: { id },
    relations: ["items"],
  });
}

/**
 * 従業員の非表示でない変更申請を全て取得（リレーション含む）
 * @param employeeId 従業員ID
 * @returns 非表示でない変更申請エンティティの配列（リレーション含む）、存在しない場合は空配列
 * @description isHiddenがfalseの申請を全て取得（非表示にした申請は除外）
 * 承認待ち（PENDING_MANAGER、PENDING_HR）を優先的に返すため、SQLでカスタムソートを適用
 */
export async function getVisibleRequestsByEmployeeId(employeeId: number): Promise<Request[]> {
  const requestRepository = getRequestRepository();

  // QueryBuilderを使用してカスタムソート順序をSQLで実装
  const requests = await requestRepository
    .createQueryBuilder("request")
    .leftJoinAndSelect("request.items", "items")
    .where("request.employeeId = :employeeId", { employeeId })
    .andWhere("request.isHidden = :isHidden", { isHidden: false })
    .orderBy(
      // CASE文でステータスの優先順位を指定
      // 優先順位: PENDING_MANAGER(1) → PENDING_HR(2) → CHANGES_REQUESTED(3) → COMPLETED(4)
      `CASE 
        WHEN request.status = 'PENDING_MANAGER' THEN 1
        WHEN request.status = 'PENDING_HR' THEN 2
        WHEN request.status = 'CHANGES_REQUESTED' THEN 3
        WHEN request.status = 'COMPLETED' THEN 4
        ELSE 999
      END`,
      "ASC"
    )
    .addOrderBy("request.createdAt", "DESC") // 同じ優先順位の場合は作成日時の降順
    .getMany();

  return requests;
}

/**
 * 従業員の最新の変更申請を取得（リレーション含む、非表示でないもの）
 * @param employeeId 従業員ID
 * @returns 最新の変更申請エンティティ（リレーション含む）、存在しない場合はnull
 * @description isHiddenがfalseの申請のうち、最新の1件を取得
 * 承認待ち（PENDING_MANAGER、PENDING_HR）を優先的に返す
 * @deprecated 後方互換性のため残す。新規実装ではgetVisibleRequestsByEmployeeIdを使用すること
 */
export async function getLatestRequestByEmployeeId(employeeId: number): Promise<Request | null> {
  const requests = await getVisibleRequestsByEmployeeId(employeeId);
  return requests.length > 0 ? requests[0] : null;
}

/**
 * 従業員に承認待ちの変更申請が存在するかチェック
 * @param employeeId 従業員ID
 * @returns 承認待ちの変更申請が存在する場合true、存在しない場合false
 * @description
 * - PENDING_MANAGER（上長承認待ち）またはPENDING_HR（人事承認待ち）のステータス
 * - かつisHiddenがfalseの申請が存在するかチェック
 */
export async function hasPendingRequestByEmployeeId(employeeId: number): Promise<boolean> {
  const requestRepository = getRequestRepository();
  const count = await requestRepository.count({
    where: [
      {
        employeeId,
        status: RequestStatus.PENDING_MANAGER,
        isHidden: false,
      },
      {
        employeeId,
        status: RequestStatus.PENDING_HR,
        isHidden: false,
      },
    ],
  });
  return count > 0;
}

/**
 * 変更申請をIDで取得（リレーションなし、データアクセスのみ）
 * @param id 変更申請ID
 * @returns 変更申請エンティティ、存在しない場合はnull
 * @description
 * - requestsテーブルから変更申請情報を取得（リレーションなし）
 * - 存在しない場合はnullを返す（TypeORMのfindOneの仕様）
 */
export async function getRequestByIdWithoutRelations(id: number): Promise<Request | null> {
  const requestRepository = getRequestRepository();
  return await requestRepository.findOne({ where: { id } });
}

/**
 * 変更申請のisHiddenをtrueに更新（データアクセスのみ）
 * @param request 更新する変更申請エンティティ
 * @returns 更新された変更申請エンティティ
 * @description
 * - DBとの疎通（更新）のみを行う
 * - ビジネスロジックチェックはサービス層で行う
 */
export async function updateRequestIsHidden(request: Request): Promise<Request> {
  const requestRepository = getRequestRepository();
  request.isHidden = true;
  return await requestRepository.save(request);
}
