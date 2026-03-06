/**
 * クエリパラメータ解析用ユーティリティ関数
 */

/**
 * クエリパラメータの配列を数値配列に変換
 * @param params クエリパラメータの配列（unknown型）
 * @returns 数値配列
 */
export function parseIdArray(params: unknown[]): number[] {
  return params
    .map((param) => parseInt(String(param), 10))
    .filter((id) => !isNaN(id));
}
