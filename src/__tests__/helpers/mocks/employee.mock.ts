/**
 * Employeeエンティティのモックデータ
 */
import { Employee } from "../../../entities/Employee";
import { EmployeeAssignment } from "../../../entities/EmployeeAssignment";
import { EmploymentType } from "../../../entities/Employee";

/**
 * モック従業員データ（正常系）
 */
export const mockEmployee: Employee = {
  id: 1,
  employeeCode: 1,
  email: "yamada@example.com",
  firstName: "太郎",
  lastName: "山田",
  postalCode: "100-0001",
  address: "東京都千代田区千代田1-1",
  phone: "03-1234-5678",
  employmentType: EmploymentType.FULL_TIME,
  isActive: true,
  createdAt: new Date("2020-01-01T00:00:00.000Z"),
  updatedAt: new Date("2020-01-01T00:00:00.000Z"),
  assignments: [
    {
      id: 1,
      employeeId: 1,
      departmentId: 1,
      branchId: 1,
      positionId: 1,
      superiorFlag: false,
      createdAt: new Date("2020-01-01T00:00:00.000Z"),
      department: { id: 1, name: "営業部" } as any,
      branch: { id: 1, name: "東京支店" } as any,
      position: { id: 1, name: "平社員" } as any,
      employee: {} as Employee,
    } as EmployeeAssignment,
    {
      id: 2,
      employeeId: 1,
      departmentId: 2,
      branchId: 2,
      positionId: 2,
      superiorFlag: true,
      createdAt: new Date("2021-01-01T00:00:00.000Z"),
      department: { id: 2, name: "開発部" } as any,
      branch: { id: 2, name: "大阪支店" } as any,
      position: { id: 2, name: "主任" } as any,
      employee: {} as Employee,
    } as EmployeeAssignment,
  ],
  roles: [],
  requests: [],
  approvalSteps: [],
};

/**
 * モック従業員データ（非アクティブ）
 */
export const mockInactiveEmployee: Employee = {
  ...mockEmployee,
  id: 1000,
  isActive: false,
};
