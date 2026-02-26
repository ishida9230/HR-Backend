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
import { RequestItem } from "./RequestItem";
import { ApprovalStep } from "./ApprovalStep";

export enum RequestStatus {
  PENDING_MANAGER = "PENDING_MANAGER", // 上長承認待ち
  PENDING_HR = "PENDING_HR", // 人事承認待ち
  CHANGES_REQUESTED = "CHANGES_REQUESTED", // 差し戻し
  COMPLETED = "COMPLETED", // 完了
}

@Entity("requests")
export class Request {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", name: "employee_id" })
  employeeId: number;

  @Column({
    type: "enum",
    enum: RequestStatus,
    default: RequestStatus.PENDING_MANAGER,
  })
  status: RequestStatus;

  @Column({ type: "text" })
  text: string;

  @Column({ type: "timestamp", nullable: true, name: "submitted_at" })
  submittedAt: Date | null;

  @Column({ type: "timestamp", nullable: true, name: "completed_at" })
  completedAt: Date | null;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.requests)
  @JoinColumn({ name: "employee_id" })
  employee: Employee;

  @OneToMany(() => RequestItem, (item) => item.request)
  items: RequestItem[];

  @OneToMany(() => ApprovalStep, (step) => step.request)
  approvalSteps: ApprovalStep[];
}

/**
 * RequestテーブルのCREATE TABLE文を生成
 * 依存関係: employees, requests_status_enum ENUM型
 */
export function getRequestCreateTableSQL(): string {
  return `CREATE TABLE "requests" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "employee_id" integer NOT NULL,
    "status" "public"."requests_status_enum" NOT NULL DEFAULT '上長承認待ち',
    "text" text NOT NULL,
    "submitted_at" TIMESTAMP,
    "completed_at" TIMESTAMP,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_requests" PRIMARY KEY ("id"),
    CONSTRAINT "FK_employee" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
  )`;
}

/**
 * RequestStatus ENUM型のCREATE TYPE文を生成
 */
export function getRequestStatusEnumCreateTypeSQL(): string {
  return `CREATE TYPE "public"."requests_status_enum" AS ENUM('上長承認待ち', '人事承認待ち', '差し戻し', '完了')`;
}
