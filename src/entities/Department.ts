// OK
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum DepartmentName {
  SALES = "SALES",
  DEVELOPMENT = "DEVELOPMENT",
  CS = "CS",
  ADMINISTRATION = "ADMINISTRATION",
  HR = "HR",
}

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: DepartmentName,
  })
  name: DepartmentName;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}

/**
 * DepartmentテーブルのCREATE TABLE文を生成
 * 依存関係: なし
 */
export function getDepartmentCreateTableSQL(): string {
  return `CREATE TABLE "departments" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "name" "public"."department_name_enum" NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_departments" PRIMARY KEY ("id")
  )`;
}

/**
 * DepartmentName ENUM型のCREATE TYPE文を生成
 */
export function getDepartmentNameEnumCreateTypeSQL(): string {
  return `CREATE TYPE "public"."department_name_enum" AS ENUM('営業部', '開発部', 'CS部', '管理部', '人事部')`;
}
