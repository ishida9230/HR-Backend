import { EmploymentType } from "../entities/Employee";
import { Employee } from "../entities/Employee";
import { Repository } from "typeorm";

/**
 * 従業員のシードデータ
 *
 * INSERT文の内容:
 * INSERT INTO "employees" ("id", "employee_code", "email", "first_name", "last_name", "postal_code", "address", "phone", "employment_type", "is_active", "created_at", "updated_at") VALUES
 * ('<uuid-1>', '1', 'yamada@example.com', '太郎', '山田', '100-0001', '東京都千代田区千代田1-1', '03-1234-5678', '正社員', true, NOW(), NOW()),
 * ('<uuid-2>', '2', 'sato@example.com', '花子', '佐藤', '530-0001', '大阪府大阪市北区梅田1-1', '06-1234-5678', '正社員', true, NOW(), NOW()),
 * ... (全10件)
 *
 */
export const employeesData = [
  {
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
  },
  {
    id: 2,
    employeeCode: 2,
    email: "sato@example.com",
    firstName: "花子",
    lastName: "佐藤",
    postalCode: "530-0001",
    address: "大阪府大阪市北区梅田1-1",
    phone: "06-1234-5678",
    employmentType: EmploymentType.FULL_TIME,
    isActive: true,
  },
  {
    id: 3,
    employeeCode: 3,
    email: "tanaka@example.com",
    firstName: "一郎",
    lastName: "田中",
    postalCode: "810-0001",
    address: "福岡県福岡市中央区天神1-1",
    phone: "092-1234-5678",
    employmentType: EmploymentType.CONTRACT,
    isActive: true,
  },
  {
    id: 4,
    employeeCode: 4,
    email: "suzuki@example.com",
    firstName: "次郎",
    lastName: "鈴木",
    postalCode: "100-0002",
    address: "東京都千代田区千代田2-2",
    phone: "03-2345-6789",
    employmentType: EmploymentType.FULL_TIME,
    isActive: true,
  },
  {
    id: 5,
    employeeCode: 5,
    email: "watanabe@example.com",
    firstName: "三郎",
    lastName: "渡辺",
    postalCode: "530-0002",
    address: "大阪府大阪市北区梅田2-2",
    phone: "06-2345-6789",
    employmentType: EmploymentType.OUTSOURCING,
    isActive: true,
  },
  {
    id: 6,
    employeeCode: 6,
    email: "kobayashi@example.com",
    firstName: "四郎",
    lastName: "小林",
    postalCode: "810-0002",
    address: "福岡県福岡市中央区天神2-2",
    phone: "092-2345-6789",
    employmentType: EmploymentType.FULL_TIME,
    isActive: true,
  },
  {
    id: 7,
    employeeCode: 7,
    email: "kato@example.com",
    firstName: "五郎",
    lastName: "加藤",
    postalCode: "100-0003",
    address: "東京都千代田区千代田3-3",
    phone: "03-3456-7890",
    employmentType: EmploymentType.CONTRACT,
    isActive: true,
  },
  {
    id: 8,
    employeeCode: 8,
    email: "yoshida@example.com",
    firstName: "六郎",
    lastName: "吉田",
    postalCode: "530-0003",
    address: "大阪府大阪市北区梅田3-3",
    phone: "06-3456-7890",
    employmentType: EmploymentType.FULL_TIME,
    isActive: true,
  },
  {
    id: 9,
    employeeCode: 9,
    email: "yamamoto@example.com",
    firstName: "七郎",
    lastName: "山本",
    postalCode: "810-0003",
    address: "福岡県福岡市中央区天神3-3",
    phone: "092-3456-7890",
    employmentType: EmploymentType.FULL_TIME,
    isActive: true,
  },
  {
    id: 10,
    employeeCode: 10,
    email: "nakamura@example.com",
    firstName: "八郎",
    lastName: "中村",
    postalCode: "100-0004",
    address: "東京都千代田区千代田4-4",
    phone: "03-4567-8901",
    employmentType: EmploymentType.OUTSOURCING,
    isActive: true,
  },
];

/**
 * 従業員のシードデータを投入
 *
 * @param repository Employeeリポジトリ
 */
export async function seedEmployees(repository: Repository<Employee>): Promise<void> {
  // 既存データがある場合はスキップ（冪等性）
  const existingCount = await repository.count();
  if (existingCount > 0) {
    console.log("⚠️ 既に従業員データが存在します。スキップします。");
    return;
  }

  const employees = employeesData.map((data) => {
    const employee = new Employee();
    employee.id = data.id;
    employee.employeeCode = data.employeeCode;
    employee.email = data.email;
    employee.firstName = data.firstName;
    employee.lastName = data.lastName;
    employee.postalCode = data.postalCode;
    employee.address = data.address;
    employee.phone = data.phone;
    employee.employmentType = data.employmentType;
    employee.isActive = data.isActive;
    return employee;
  });

  await repository.save(employees);
  console.log(`✅ 従業員シードデータを投入しました（${employees.length}件）`);
}
