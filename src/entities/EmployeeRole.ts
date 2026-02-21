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
import { Role } from "./Role";

@Entity("employee_roles")
export class EmployeeRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", name: "employee_id" })
  employeeId: number;

  @Column({ type: "int", name: "role_id" })
  roleId: number;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.roles)
  @JoinColumn({ name: "employee_id" })
  employee: Employee;

  @ManyToOne(() => Role)
  @JoinColumn({ name: "role_id" })
  role: Role;
}

/**
 * EmployeeRoleテーブルのCREATE TABLE文を生成
 * 依存関係: employees, roles
 */
export function getEmployeeRoleCreateTableSQL(): string {
  return `CREATE TABLE "employee_roles" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "employee_id" integer NOT NULL,
    "role_id" integer NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_employee_roles" PRIMARY KEY ("id"),
    CONSTRAINT "FK_employee" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
  )`;
}
