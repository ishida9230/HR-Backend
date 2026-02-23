// OK
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { EmployeeAssignment } from "./EmployeeAssignment";
import { EmployeeRole } from "./EmployeeRole";
import { Request } from "./Request";
import { ApprovalStep } from "./ApprovalStep";

export enum EmploymentType {
  FULL_TIME = "FULL_TIME",
  CONTRACT = "CONTRACT",
  OUTSOURCING = "OUTSOURCING",
}

@Entity("employees")
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", unique: false, name: "employee_code" })
  employeeCode: number;

  @Column({ type: "varchar", unique: false })
  email: string;

  @Column({ type: "varchar", unique: false, name: "first_name" })
  firstName: string;

  @Column({ type: "varchar", unique: false, name: "last_name" })
  lastName: string;

  @Column({ type: "varchar", nullable: false, name: "postal_code" })
  postalCode: string;

  @Column({ type: "varchar", nullable: false, name: "address" })
  address: string;

  @Column({ type: "varchar", nullable: false, name: "phone" })
  phone: string;

  @Column({
    type: "enum",
    enum: EmploymentType,
    name: "employment_type",
  })
  employmentType: EmploymentType;

  @Column({ type: "boolean", default: true, name: "is_active" })
  isActive: boolean;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => EmployeeAssignment, (assignment) => assignment.employee)
  assignments: EmployeeAssignment[];

  @OneToMany(() => EmployeeRole, (employeeRole) => employeeRole.employee)
  roles: EmployeeRole[];

  @OneToMany(() => Request, (request) => request.applicantEmployee)
  requests: Request[];

  @OneToMany(() => ApprovalStep, (step) => step.actedByEmployee)
  approvalSteps: ApprovalStep[];
}

/**
 * EmployeeテーブルのCREATE TABLE文を生成
 * 依存関係: employees_employment_type_enum ENUM型
 */
export function getEmployeeCreateTableSQL(): string {
  return `CREATE TABLE "employees" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "employee_code" integer NOT NULL,
    "email" character varying NOT NULL,
    "first_name" character varying NOT NULL,
    "last_name" character varying NOT NULL,
    "postal_code" character varying NOT NULL,
    "address" character varying NOT NULL,
    "phone" character varying NOT NULL,
    "employment_type" "public"."employees_employment_type_enum" NOT NULL,
    "is_active" boolean NOT NULL DEFAULT true,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_employees" PRIMARY KEY ("id"),
    CONSTRAINT "UQ_employee_code" UNIQUE ("employee_code"),
    CONSTRAINT "UQ_email" UNIQUE ("email")
  )`;
}

/**
 * EmploymentType ENUM型のCREATE TYPE文を生成
 */
export function getEmploymentTypeEnumCreateTypeSQL(): string {
  return `CREATE TYPE "public"."employees_employment_type_enum" AS ENUM('FULL_TIME', 'CONTRACT', 'OUTSOURCING')`;
}
