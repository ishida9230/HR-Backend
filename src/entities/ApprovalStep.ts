import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Request } from "./Request";
import { Employee } from "./Employee";

export enum StepType {
  MANAGER = "MANAGER",
  HR = "HR",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  CHANGES_REQUESTED = "CHANGES_REQUESTED",
}

@Entity("approval_steps")
export class ApprovalStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", name: "request_id" })
  requestId: number;

  @Column({ type: "int", name: "step_order" })
  stepOrder: number;

  @Column({
    type: "enum",
    enum: StepType,
    name: "step_type",
  })
  stepType: StepType;

  @Column({
    type: "enum",
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  status: ApprovalStatus;

  @Column({ type: "int", nullable: true, name: "acted_by_employee_id" })
  actedByEmployeeId: number | null;

  @Column({ type: "text", nullable: true })
  comment: string | null;

  @Column({ type: "timestamp", nullable: true, name: "acted_at" })
  actedAt: Date | null;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Request, (request) => request.approvalSteps)
  @JoinColumn({ name: "request_id" })
  request: Request;

  @ManyToOne(() => Employee, (employee) => employee.approvalSteps)
  @JoinColumn({ name: "acted_by_employee_id" })
  actedByEmployee: Employee | null;
}

/**
 * ApprovalStepテーブルのCREATE TABLE文を生成
 * 依存関係: requests, employees, approval_steps_step_type_enum, approval_steps_status_enum ENUM型
 */
export function getApprovalStepCreateTableSQL(): string {
  return `CREATE TABLE "approval_steps" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "request_id" integer NOT NULL,
    "step_order" integer NOT NULL,
    "step_type" "public"."approval_steps_step_type_enum" NOT NULL,
    "status" "public"."approval_steps_status_enum" NOT NULL DEFAULT 'PENDING',
    "acted_by_employee_id" integer,
    "comment" text,
    "acted_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_approval_steps" PRIMARY KEY ("id"),
    CONSTRAINT "FK_request" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
    CONSTRAINT "FK_acted_by_employee" FOREIGN KEY ("acted_by_employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
  )`;
}

/**
 * StepType ENUM型のCREATE TYPE文を生成
 */
export function getStepTypeEnumCreateTypeSQL(): string {
  return `CREATE TYPE "public"."approval_steps_step_type_enum" AS ENUM('MANAGER', 'HR')`;
}

/**
 * ApprovalStatus ENUM型のCREATE TYPE文を生成
 */
export function getApprovalStatusEnumCreateTypeSQL(): string {
  return `CREATE TYPE "public"."approval_steps_status_enum" AS ENUM('PENDING', 'APPROVED', 'CHANGES_REQUESTED')`;
}
