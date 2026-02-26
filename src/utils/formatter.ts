import { EmploymentType } from "../entities/Employee";
import { EmploymentTypeJapanese } from "../dtos/employee.dto";

/**
 * EmploymentType ENUMを日本語文字列に変換
 * @param employmentType 雇用タイプのENUM値
 * @returns 日本語の雇用タイプ文字列
 */
export function mapEmploymentTypeToJapanese(
  employmentType: EmploymentType
): EmploymentTypeJapanese {
  const mapping: Record<EmploymentType, EmploymentTypeJapanese> = {
    [EmploymentType.FULL_TIME]: "正社員",
    [EmploymentType.CONTRACT]: "契約社員",
    [EmploymentType.OUTSOURCING]: "業務委託",
  };
  return mapping[employmentType];
}
