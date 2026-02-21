// OK
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum BranchName {
  TOKYO = "TOKYO",
  OSAKA = "OSAKA",
  FUKUOKA = "FUKUOKA",
}

@Entity("branches")
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: BranchName,
  })
  name: BranchName;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}

/**
 * BranchテーブルのCREATE TABLE文を生成
 * 依存関係: なし
 */
export function getBranchCreateTableSQL(): string {
  return `CREATE TABLE "branches" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "name" "public"."branch_name_enum" NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_branches" PRIMARY KEY ("id")
  )`;
}

/**
 * BranchName ENUM型のCREATE TYPE文を生成
 */
export function getBranchNameEnumCreateTypeSQL(): string {
  return `CREATE TYPE "public"."branch_name_enum" AS ENUM('東京支店', '大阪支店', '福岡支店')`;
}
