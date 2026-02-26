/**
 * バリデーション用ユーティリティ関数
 */

/**
 * IDが正の整数であることを検証
 * @param id ID（文字列または数値）
 * @param fieldName フィールド名（エラーメッセージ用、デフォルト: "ID"）
 * @returns 検証されたID（数値）またはnull（無効な場合）
 */
export function validatePositiveIntegerId(
  id: string | number | undefined | null,
  fieldName: string = "ID"
): {
  isValid: boolean;
  id?: number;
  error?: { fieldName: string; value: string | number | undefined | null };
} {
  if (id === undefined || id === null || id === "") {
    return {
      isValid: false,
      error: { fieldName, value: id },
    };
  }

  const parsedId = typeof id === "string" ? parseInt(id, 10) : id;

  if (isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
    return {
      isValid: false,
      error: { fieldName, value: id },
    };
  }

  return {
    isValid: true,
    id: parsedId,
  };
}
