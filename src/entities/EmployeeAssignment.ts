// OK
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Employee } from "./Employee";
import { Department } from "./Department";
import { Branch } from "./Branch";
import { Position } from "./Position";

@Entity("employee_assignments")
export class EmployeeAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", name: "employee_id" })
  employeeId: number;

  @Column({ type: "int", name: "department_id" })
  departmentId: number;

  @Column({ type: "int", name: "branch_id" })
  branchId: number;

  @Column({ type: "int", name: "position_id" })
  positionId: number;

  @Column({ type: "boolean", name: "superior_flag", default: false })
  superiorFlag: boolean;

  @Column({ type: "timestamp", name: "start_date" })
  startDate: Date;

  @Column({ type: "timestamp", nullable: true, name: "end_date" })
  endDate: Date | null;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.assignments)
  @JoinColumn({ name: "employee_id" })
  employee: Employee;

  @ManyToOne(() => Department)
  @JoinColumn({ name: "department_id" })
  department: Department;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: "branch_id" })
  branch: Branch;

  @ManyToOne(() => Position)
  @JoinColumn({ name: "position_id" })
  position: Position;
}

/**
 * EmployeeAssignmentテーブルのCREATE TABLE文を生成
 * 依存関係: employees, departments, branches, positions
 */
export function getEmployeeAssignmentCreateTableSQL(): string {
  return `CREATE TABLE "employee_assignments" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "employee_id" integer NOT NULL,
    "department_id" integer NOT NULL,
    "branch_id" integer NOT NULL,
    "position_id" integer NOT NULL,
    "superior_flag" boolean NOT NULL DEFAULT false,
    "start_date" TIMESTAMP NOT NULL,
    "end_date" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_employee_assignments" PRIMARY KEY ("id"),
    CONSTRAINT "FK_employee" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_branch" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_position" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
  )`;
}
