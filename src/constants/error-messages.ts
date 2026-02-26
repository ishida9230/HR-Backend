/**
 * エラーメッセージ定義
 * バックエンドで使用するエラーメッセージの文字列を定義
 */

// HTTPステータスコード
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// エラーメッセージ
export const ERROR_MESSAGE_INVALID_EMPLOYEE_ID = "従業員IDが不正です";
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
export const ERROR_MESSAGE_DATA_FETCH_ERROR = "データの取得または変換中にエラーが発生しました";
