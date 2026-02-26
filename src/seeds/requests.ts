import { Request } from "../entities/Request";
import { RequestStatus } from "../entities/Request";
import { Repository } from "typeorm";

/**
 * 申請のシードデータ
 *
 * INSERT文の内容:
 * INSERT INTO "requests" ("id", "employee_id", "status", "text", "submitted_at", "completed_at", "created_at", "updated_at") VALUES
 * ('<uuid-1>', '<employee-uuid-1>', '上長承認待ち', '住所変更のため申請します', '2024-01-15 10:00:00', NULL, NOW(), NOW()),
 * ('<uuid-2>', '<employee-uuid-2>', '人事承認待ち', '給与変更のため申請します', '2024-01-20 14:30:00', NULL, NOW(), NOW()),
 * ... (全10件)
 *
 * employeeId: 従業員ID（employees.tsのidを参照）
 */
export const requestsData = [
  {
    id: 1,
    employeeId: 1, // 山田太郎
    status: RequestStatus.PENDING_MANAGER,
    text: "住所変更のため申請します",
    submittedAt: "2024-01-15T10:00:00",
    completedAt: null,
  },
  {
    id: 2,
    employeeId: 2, // 佐藤花子
    status: RequestStatus.PENDING_HR,
    text: "給与変更のため申請します",
    submittedAt: "2024-01-20T14:30:00",
    completedAt: null,
  },
  {
    id: 3,
    employeeId: 3, // 田中一郎
    status: RequestStatus.CHANGES_REQUESTED,
    text: "部署異動のため申請します",
    submittedAt: "2024-01-10T09:00:00",
    completedAt: null,
  },
  {
    id: 4,
    employeeId: 4, // 鈴木次郎
    status: RequestStatus.COMPLETED,
    text: "休暇取得のため申請します",
    submittedAt: "2024-01-05T11:00:00",
    completedAt: "2024-01-12T16:00:00",
  },
  {
    id: 5,
    employeeId: 5, // 渡辺三郎
    status: RequestStatus.PENDING_MANAGER,
    text: "電話番号変更のため申請します",
    submittedAt: "2024-01-25T13:00:00",
    completedAt: null,
  },
  {
    id: 6,
    employeeId: 6, // 小林四郎
    status: RequestStatus.PENDING_HR,
    text: "メールアドレス変更のため申請します",
    submittedAt: "2024-01-18T15:30:00",
    completedAt: null,
  },
  {
    id: 7,
    employeeId: 7, // 加藤五郎
    status: RequestStatus.COMPLETED,
    text: "緊急連絡先変更のため申請します",
    submittedAt: "2024-01-08T10:00:00",
    completedAt: "2024-01-15T14:00:00",
  },
  {
    id: 8,
    employeeId: 8, // 吉田六郎
    status: RequestStatus.PENDING_MANAGER,
    text: "役職変更のため申請します",
    submittedAt: "2024-01-22T09:30:00",
    completedAt: null,
  },
  {
    id: 9,
    employeeId: 9, // 山本七郎
    status: RequestStatus.CHANGES_REQUESTED,
    text: "勤務地変更のため申請します",
    submittedAt: "2024-01-12T11:00:00",
    completedAt: null,
  },
  {
    id: 10,
    employeeId: 10, // 中村八郎
    status: RequestStatus.COMPLETED,
    text: "社員証再発行のため申請します",
    submittedAt: "2024-01-03T08:00:00",
    completedAt: "2024-01-10T12:00:00",
  },
];

/**
 * 申請のシードデータを投入
 *
 * @param repository Requestリポジトリ
 */
export async function seedRequests(repository: Repository<Request>): Promise<void> {
  // 既存データがある場合はスキップ（冪等性）
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log("⚠️ 既に申請データが存在します。スキップします。");
    return;
  }

  const requests = requestsData.map((data) => {
    const request = new Request();
    request.id = data.id;
    request.employeeId = data.employeeId;
    request.status = data.status;
    request.text = data.text;
    request.submittedAt = data.submittedAt ? new Date(data.submittedAt) : null;
    request.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    return request;
  });

  await repository.save(requests);
  console.log(`✅ 申請シードデータを投入しました（${requests.length}件）`);
}
