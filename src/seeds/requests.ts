import { Request } from "../entities/Request";
import { RequestStatus } from "../entities/Request";
import { Repository } from "typeorm";

/**
 * 申請のシードデータ
 *
 * INSERT文の内容:
 * INSERT INTO "requests" ("id", "applicant_employee_id", "applicant_department_id", "status", "title", "submitted_at", "completed_at", "created_at", "updated_at") VALUES
 * ('<uuid-1>', '<employee-uuid-1>', '<department-uuid-1>', '上長承認待ち', '住所変更申請', '2024-01-15 10:00:00', NULL, NOW(), NOW()),
 * ('<uuid-2>', '<employee-uuid-2>', '<department-uuid-2>', '人事承認待ち', '給与変更申請', '2024-01-20 14:30:00', NULL, NOW(), NOW()),
 * ... (全10件)
 *
 * applicantEmployeeId: 申請者従業員ID（employees.tsのidを参照）
 * applicantDepartmentId: 申請者部署ID（departments.tsのidを参照）
 *
 * 部署ID:
 * 1=SALES（営業部）
 * 2=DEVELOPMENT（開発部）
 * 3=CS（CS部）
 * 4=ADMINISTRATION（管理部）
 * 5=HR（人事部）
 */
export const requestsData = [
  {
    id: 1,
    applicantEmployeeId: 1, // 山田太郎
    applicantDepartmentId: 1, // 営業部
    status: RequestStatus.PENDING_MANAGER,
    title: "住所変更申請",
    submittedAt: "2024-01-15T10:00:00",
    completedAt: null,
  },
  {
    id: 2,
    applicantEmployeeId: 2, // 佐藤花子
    applicantDepartmentId: 2, // 開発部
    status: RequestStatus.PENDING_HR,
    title: "給与変更申請",
    submittedAt: "2024-01-20T14:30:00",
    completedAt: null,
  },
  {
    id: 3,
    applicantEmployeeId: 3, // 田中一郎
    applicantDepartmentId: 1, // 営業部
    status: RequestStatus.CHANGES_REQUESTED,
    title: "部署異動申請",
    submittedAt: "2024-01-10T09:00:00",
    completedAt: null,
  },
  {
    id: 4,
    applicantEmployeeId: 4, // 鈴木次郎
    applicantDepartmentId: 2, // 開発部
    status: RequestStatus.COMPLETED,
    title: "休暇申請",
    submittedAt: "2024-01-05T11:00:00",
    completedAt: "2024-01-12T16:00:00",
  },
  {
    id: 5,
    applicantEmployeeId: 5, // 渡辺三郎
    applicantDepartmentId: 5, // 人事部
    status: RequestStatus.PENDING_MANAGER,
    title: "電話番号変更申請",
    submittedAt: "2024-01-25T13:00:00",
    completedAt: null,
  },
  {
    id: 6,
    applicantEmployeeId: 6, // 小林四郎
    applicantDepartmentId: 1, // 営業部
    status: RequestStatus.PENDING_HR,
    title: "メールアドレス変更申請",
    submittedAt: "2024-01-18T15:30:00",
    completedAt: null,
  },
  {
    id: 7,
    applicantEmployeeId: 7, // 加藤五郎
    applicantDepartmentId: 3, // CS部
    status: RequestStatus.COMPLETED,
    title: "緊急連絡先変更申請",
    submittedAt: "2024-01-08T10:00:00",
    completedAt: "2024-01-15T14:00:00",
  },
  {
    id: 8,
    applicantEmployeeId: 8, // 吉田六郎
    applicantDepartmentId: 4, // 管理部
    status: RequestStatus.PENDING_MANAGER,
    title: "役職変更申請",
    submittedAt: "2024-01-22T09:30:00",
    completedAt: null,
  },
  {
    id: 9,
    applicantEmployeeId: 9, // 山本七郎
    applicantDepartmentId: 2, // 開発部
    status: RequestStatus.CHANGES_REQUESTED,
    title: "勤務地変更申請",
    submittedAt: "2024-01-12T11:00:00",
    completedAt: null,
  },
  {
    id: 10,
    applicantEmployeeId: 10, // 中村八郎
    applicantDepartmentId: 5, // 人事部
    status: RequestStatus.COMPLETED,
    title: "社員証再発行申請",
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
    request.applicantEmployeeId = data.applicantEmployeeId;
    request.applicantDepartmentId = data.applicantDepartmentId;
    request.status = data.status;
    request.title = data.title;
    request.submittedAt = data.submittedAt ? new Date(data.submittedAt) : null;
    request.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    return request;
  });

  await repository.save(requests);
  console.log(`✅ 申請シードデータを投入しました（${requests.length}件）`);
}
