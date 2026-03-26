/**
 * エラーメッセージ定義
 * バックエンドで使用するエラーメッセージの文字列を定義
 */

// HTTPステータスコード
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// エラーメッセージ
export const ERROR_MESSAGE_INVALID_EMPLOYEE_ID = "従業員IDが不正です";
export const ERROR_MESSAGE_INVALID_REQUEST_ID = "変更申請IDが不正です";
export const ERROR_MESSAGE_INVALID_DEPARTMENT_ID = "部署IDが不正です";
export const ERROR_MESSAGE_INVALID_BRANCH_ID = "支店IDが不正です";
export const ERROR_MESSAGE_INVALID_POSITION_ID = "役職IDが不正です";
export const ERROR_MESSAGE_EMPLOYEE_NOT_FOUND = "指定された従業員が見つかりませんでした。";
export const ERROR_MESSAGE_ENDPOINT_NOT_FOUND = "エンドポイントが見つかりません";
export const ERROR_MESSAGE_SERVER_ERROR =
  "ネットワークエラーが発生しました。しばらくしてから再度お試しください。";
export const ERROR_MESSAGE_MISSING_REQUIRED_FIELDS = "必須項目が不足しています";
export const ERROR_MESSAGE_REQUEST_CREATION_FAILED = "変更申請の作成に失敗しました";
export const ERROR_MESSAGE_REQUEST_CREATION_ERROR = "変更申請の作成中にエラーが発生しました";
export const ERROR_MESSAGE_REQUEST_NOT_FOUND = "指定された変更申請が見つかりませんでした。";
export const ERROR_MESSAGE_DATA_FETCH_ERROR = "データの取得または変換中にエラーが発生しました";
export const ERROR_MESSAGE_PENDING_REQUEST_EXISTS =
  "既に承認待ちの変更申請が存在します。完了または差し戻しになるまで新しい申請は作成できません。";
export const ERROR_MESSAGE_REQUEST_ALREADY_HIDDEN = "この申請は既に非表示になっています。";
export const ERROR_MESSAGE_REQUEST_NOT_PROCESSABLE =
  "この申請は処理可能な状態ではありません。";
export const ERROR_MESSAGE_STATUS_MISMATCH = "statusが一致しません。期待値: {expectedStatus}, 送信値: {receivedStatus}";
export const ERROR_MESSAGE_STATUS_REQUIRED = "statusが必要です。";
export const ERROR_MESSAGE_ACTOR_ID_REQUIRED = "実行者IDが必要です。";
export const ERROR_MESSAGE_REJECT_COMMENT_REQUIRED = "差し戻し時はコメントが必要です。";
export const ERROR_MESSAGE_INVALID_STATUS = "無効なstatusです: {status}";
export const ERROR_MESSAGE_ASSIGNMENTS_MUST_BE_ARRAY = "assignmentsは配列形式である必要があります。";
export const ERROR_MESSAGE_ASSIGNMENTS_UPDATE_FAILED = "assignmentsの更新に失敗しました。";