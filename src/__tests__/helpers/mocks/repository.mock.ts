/**
 * Repository層のモック関数
 */
import { Employee } from "../../../entities/Employee";
import { getEmployeeById } from "../../../repositories/employee.repository";
import { mockEmployee, mockInactiveEmployee } from "./employee.mock";
import RecordNotFoundException from "../../../exceptions/RecordNotFoundException";

/**
 * getEmployeeByIdのモック関数
 */
export const mockGetEmployeeById = jest.fn<Promise<Employee>, [number]>();

/**
 * getEmployeeByIdをモック化
 */
export function setupEmployeeRepositoryMock(): void {
  jest.mock("../../../repositories/employee.repository", () => ({
    getEmployeeById: mockGetEmployeeById,
  }));
}

/**
 * モックのリセット
 */
export function resetEmployeeRepositoryMock(): void {
  mockGetEmployeeById.mockReset();
}

/**
 * 正常系のモックデータを設定
 */
export function setupMockEmployeeSuccess(): void {
  mockGetEmployeeById.mockResolvedValue(mockEmployee);
}

/**
 * 非アクティブな従業員のモックデータを設定
 */
export function setupMockInactiveEmployee(): void {
  mockGetEmployeeById.mockResolvedValue(mockInactiveEmployee);
}

/**
 * 従業員が見つからない場合のモックを設定
 */
export function setupMockEmployeeNotFound(): void {
  mockGetEmployeeById.mockRejectedValue(new RecordNotFoundException(9999, "employee"));
}
