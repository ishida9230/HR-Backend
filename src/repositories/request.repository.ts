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
 */
export async function getRequestById(id: number, manager?: EntityManager): Promise<Request | null> {
  const requestRepository = getRequestRepository(manager);
  return await requestRepository.findOne({
    where: { id },
    relations: ["items"],
  });
}
