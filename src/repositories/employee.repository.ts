import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { Employee } from "../entities/Employee";
import HttpException from "../exceptions/HttpException";
import { HTTP_STATUS, ERROR_MESSAGE_EMPLOYEE_NOT_FOUND } from "../constants/error-messages";

/**
 * 従業員リポジトリを取得
 */
function getEmployeeRepository(): Repository<Employee> {
  return AppDataSource.getRepository(Employee);
}

/**
 * 従業員IDで従業員エンティティを取得（データアクセスのみ）
 * アクティブな従業員のみを取得します
 * @param id 従業員ID（正の整数であることが前提）
 * @returns 従業員エンティティ
 * @throws RecordNotFoundException 従業員が見つからない場合
 */
export async function getEmployeeById(id: number): Promise<Employee> {
  const employeeRepository = getEmployeeRepository();

  // 従業員を取得（リレーションを含む、アクティブな従業員のみ）
  // QueryBuilderを使用してSQLレベルでassignmentsをid順でソート
  const employee = await employeeRepository
    .createQueryBuilder("employee")
    .where("employee.id = :id", { id })
    .andWhere("employee.isActive = :isActive", { isActive: true })
    .leftJoinAndSelect("employee.assignments", "assignments")
    .leftJoinAndSelect("assignments.department", "department")
    .leftJoinAndSelect("assignments.branch", "branch")
    .leftJoinAndSelect("assignments.position", "position")
    .orderBy("assignments.id", "ASC")
    .getOne();

  // 従業員が見つからない場合
  if (!employee) {
    throw new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_EMPLOYEE_NOT_FOUND, {
      employeeId: id,
    });
  }

  return employee;
}
