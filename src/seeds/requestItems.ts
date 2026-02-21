import { RequestItem } from "../entities/RequestItem";
import { Repository } from "typeorm";

/**
 * 申請項目のシードデータ
 *
 * INSERT文の内容:
 * INSERT INTO "request_items" ("id", "request_id", "field_key", "old_value", "new_value", "created_at") VALUES
 * (1, 1, 'address', '東京都千代田区千代田1-1', '東京都新宿区新宿1-1', NOW()),
 * (2, 1, 'postalCode', '100-0001', '160-0001', NOW()),
 * (3, 2, 'salary', '300000', '350000', NOW()),
 * ... (全15件)
 *
 * requestId: 申請ID（requests.tsのidを参照）
 * fieldKey: 変更するフィールドのキー
 * oldValue: 変更前の値
 * newValue: 変更後の値
 */
export const requestItemsData = [
  // 申請ID: 1 - 住所変更申請
  {
    id: 1,
    requestId: 1,
    fieldKey: "address",
    oldValue: "東京都千代田区千代田1-1",
    newValue: "東京都新宿区新宿1-1",
  },
  {
    id: 2,
    requestId: 1,
    fieldKey: "postalCode",
    oldValue: "100-0001",
    newValue: "160-0001",
  },

  // 申請ID: 2 - 給与変更申請
  {
    id: 3,
    requestId: 2,
    fieldKey: "salary",
    oldValue: "300000",
    newValue: "350000",
  },

  // 申請ID: 3 - 部署異動申請
  {
    id: 4,
    requestId: 3,
    fieldKey: "department",
    oldValue: "営業部",
    newValue: "開発部",
  },

  // 申請ID: 4 - 休暇申請
  {
    id: 5,
    requestId: 4,
    fieldKey: "vacationStartDate",
    oldValue: null,
    newValue: "2024-02-01",
  },
  {
    id: 6,
    requestId: 4,
    fieldKey: "vacationEndDate",
    oldValue: null,
    newValue: "2024-02-05",
  },

  // 申請ID: 5 - 電話番号変更申請
  {
    id: 7,
    requestId: 5,
    fieldKey: "phone",
    oldValue: "06-2345-6789",
    newValue: "06-9876-5432",
  },

  // 申請ID: 6 - メールアドレス変更申請
  {
    id: 8,
    requestId: 6,
    fieldKey: "email",
    oldValue: "kobayashi@example.com",
    newValue: "kobayashi.new@example.com",
  },

  // 申請ID: 7 - 緊急連絡先変更申請
  {
    id: 9,
    requestId: 7,
    fieldKey: "emergencyContact",
    oldValue: "090-1234-5678",
    newValue: "090-9876-5432",
  },
  {
    id: 10,
    requestId: 7,
    fieldKey: "emergencyContactName",
    oldValue: "加藤 花子",
    newValue: "加藤 太郎",
  },

  // 申請ID: 8 - 役職変更申請
  {
    id: 11,
    requestId: 8,
    fieldKey: "position",
    oldValue: "平社員",
    newValue: "主任",
  },

  // 申請ID: 9 - 勤務地変更申請
  {
    id: 12,
    requestId: 9,
    fieldKey: "branch",
    oldValue: "福岡支店",
    newValue: "東京支店",
  },
  {
    id: 13,
    requestId: 9,
    fieldKey: "address",
    oldValue: "福岡県福岡市中央区天神3-3",
    newValue: "東京都千代田区千代田5-5",
  },
  {
    id: 14,
    requestId: 9,
    fieldKey: "postalCode",
    oldValue: "810-0003",
    newValue: "100-0005",
  },

  // 申請ID: 10 - 社員証再発行申請
  {
    id: 15,
    requestId: 10,
    fieldKey: "employeeCard",
    oldValue: "紛失",
    newValue: "再発行",
  },
];

/**
 * 申請項目のシードデータを投入
 *
 * @param repository RequestItemリポジトリ
 */
export async function seedRequestItems(repository: Repository<RequestItem>): Promise<void> {
  // 既存データがある場合はスキップ（冪等性）
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log("⚠️ 既に申請項目データが存在します。スキップします。");
    return;
  }

  const requestItems = requestItemsData.map((data) => {
    const requestItem = new RequestItem();
    requestItem.id = data.id;
    requestItem.requestId = data.requestId;
    requestItem.fieldKey = data.fieldKey;
    requestItem.oldValue = data.oldValue;
    requestItem.newValue = data.newValue;
    return requestItem;
  });

  await repository.save(requestItems);
  console.log(`✅ 申請項目シードデータを投入しました（${requestItems.length}件）`);
}
