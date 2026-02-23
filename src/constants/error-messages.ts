/**
 * エラーメッセージ定義
 * バックエンドで使用するエラーメッセージの文字列を定義
 */

// HTTPステータスコード
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// エラーメッセージ
export const ERROR_MESSAGE_INVALID_EMPLOYEE_ID = "従業員IDが不正です";
export const ERROR_MESSAGE_EMPLOYEE_NOT_FOUND = "指定された従業員が見つかりませんでした。";
export const ERROR_MESSAGE_ENDPOINT_NOT_FOUND = "エンドポイントが見つかりません";
export const ERROR_MESSAGE_SERVER_ERROR =
  "ネットワークエラーが発生しました。しばらくしてから再度お試しください。";
