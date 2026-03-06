import { Request } from "../entities/Request";
import { RequestStatus } from "../entities/Request";
import { Repository } from "typeorm";

/**
 * 申請のシードデータ（100件）を投入
 *
 * @param repository Requestリポジトリ
 */
export async function seedRequests100(repository: Repository<Request>): Promise<void> {
  // 既存の最大IDを取得
  const existingRequests = await repository.find({ select: ["id"], order: { id: "DESC" }, take: 1 });
  const maxExistingId = existingRequests.length > 0 ? existingRequests[0].id : 0;
  const startId = maxExistingId + 1;

  // 100件のデータを生成（既存のIDの続きから）
  const newRequests = [];
  const employeeIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const statuses = [
    RequestStatus.PENDING_MANAGER,
    RequestStatus.PENDING_HR,
    RequestStatus.CHANGES_REQUESTED,
    RequestStatus.COMPLETED,
  ];
  const requestTexts = [
    "住所変更のため申請します",
    "給与変更のため申請します",
    "部署異動のため申請します",
    "休暇取得のため申請します",
    "電話番号変更のため申請します",
    "メールアドレス変更のため申請します",
    "緊急連絡先変更のため申請します",
    "役職変更のため申請します",
    "勤務地変更のため申請します",
    "社員証再発行のため申請します",
    "氏名変更のため申請します",
    "郵便番号変更のため申請します",
    "銀行口座変更のため申請します",
    "扶養家族追加のため申請します",
    "健康診断結果提出のため申請します",
    "資格取得申請のため申請します",
    "研修参加申請のため申請します",
    "出張申請のため申請します",
    "経費精算申請のため申請します",
    "備品購入申請のため申請します",
  ];

  // 現在日時から過去6ヶ月の範囲で日付を生成
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  for (let i = 0; i < 100; i++) {
    const id = startId + i;

    // 従業員IDをランダムに選択（1-10）
    const employeeId = employeeIds[Math.floor(Math.random() * employeeIds.length)];

    // ステータスをバランスよく割り当て
    let status: RequestStatus;
    if (i < 25) {
      status = RequestStatus.PENDING_MANAGER;
    } else if (i < 50) {
      status = RequestStatus.PENDING_HR;
    } else if (i < 75) {
      status = RequestStatus.CHANGES_REQUESTED;
    } else {
      status = RequestStatus.COMPLETED;
    }

    // 申請テキストをランダムに選択
    const text = requestTexts[Math.floor(Math.random() * requestTexts.length)];

    // 申請日を過去6ヶ月の範囲でランダムに生成
    const daysAgo = Math.floor(Math.random() * 180); // 0-179日前
    const submittedAt = new Date(now);
    submittedAt.setDate(submittedAt.getDate() - daysAgo);
    submittedAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

    // 完了日はCOMPLETEDステータスの場合のみ設定（申請日の1-14日後）
    let completedAt: Date | null = null;
    if (status === RequestStatus.COMPLETED) {
      completedAt = new Date(submittedAt);
      const daysAfter = Math.floor(Math.random() * 14) + 1; // 1-14日後
      completedAt.setDate(completedAt.getDate() + daysAfter);
      completedAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
    }

    const request = new Request();
    request.id = id;
    request.employeeId = employeeId;
    request.status = status;
    request.text = text;
    request.submittedAt = submittedAt;
    request.completedAt = completedAt;

    newRequests.push(request);
  }

  if (newRequests.length > 0) {
    await repository.save(newRequests);
    console.log(`✅ 申請シードデータを投入しました（${newRequests.length}件追加、ID: ${startId}〜${startId + newRequests.length - 1}）`);
  } else {
    console.log("⚠️ 追加する申請データがありません。");
  }
}
