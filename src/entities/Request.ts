// OK
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Employee } from "./Employee";
import { Department } from "./Department";
import { RequestItem } from "./RequestItem";
import { ApprovalStep } from "./ApprovalStep";

export enum RequestStatus {
  PENDING_MANAGER = "PENDING_MANAGER",
  PENDING_HR = "PENDING_HR",
  CHANGES_REQUESTED = "CHANGES_REQUESTED",
  COMPLETED = "COMPLETED",
}

@Entity("requests")
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", name: "applicant_employee_id" })
  applicantEmployeeId: number;

  @Column({ type: "int", name: "applicant_department_id" })
  applicantDepartmentId: number;

  @Column({
    type: "enum",
    enum: RequestStatus,
    default: RequestStatus.PENDING_MANAGER,
  })
  status: RequestStatus;

  @Column({ type: "varchar" })
  title: string;

  @Column({ type: "timestamp", nullable: true, name: "submitted_at" })
  submittedAt: Date | null;

  @Column({ type: "timestamp", nullable: true, name: "completed_at" })
  completedAt: Date | null;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.requests)
  @JoinColumn({ name: "applicant_employee_id" })
  applicantEmployee: Employee;

  @ManyToOne(() => Department)
  @JoinColumn({ name: "applicant_department_id" })
  applicantDepartment: Department;

  @OneToMany(() => RequestItem, (item) => item.request)
  items: RequestItem[];

  @OneToMany(() => ApprovalStep, (step) => step.request)
  approvalSteps: ApprovalStep[];
}

/**
 * RequestテーブルのCREATE TABLE文を生成
 * 依存関係: employees, departments, requests_status_enum ENUM型
 */
export function getRequestCreateTableSQL(): string {
  return `CREATE TABLE "requests" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "applicant_employee_id" integer NOT NULL,
    "applicant_department_id" integer NOT NULL,
    "status" "public"."requests_status_enum" NOT NULL DEFAULT '上長承認待ち',
    "title" character varying NOT NULL,
    "submitted_at" TIMESTAMP,
    "completed_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_requests" PRIMARY KEY ("id"),
    CONSTRAINT "FK_applicant_employee" FOREIGN KEY ("applicant_employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_applicant_department" FOREIGN KEY ("applicant_department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
  )`;
}

/**
 * RequestStatus ENUM型のCREATE TYPE文を生成
 */
export function getRequestStatusEnumCreateTypeSQL(): string {
  return `CREATE TYPE "public"."requests_status_enum" AS ENUM('上長承認待ち', '人事承認待ち', '差し戻し', '完了')`;
}
