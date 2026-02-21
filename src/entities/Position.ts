// OK
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum PositionName {
  REGULAR = "REGULAR",
  CHIEF = "CHIEF",
  MANAGER = "MANAGER",
  PRESIDENT = "PRESIDENT",
}

@Entity("positions")
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "enum",
    enum: PositionName,
  })
  name: PositionName;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}

/**
 * PositionテーブルのCREATE TABLE文を生成
 * 依存関係: なし
 */
export function getPositionCreateTableSQL(): string {
  return `CREATE TABLE "positions" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "name" "public"."position_name_enum" NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_positions" PRIMARY KEY ("id")
  )`;
}

/**
 * PositionName ENUM型のCREATE TYPE文を生成
 */
export function getPositionNameEnumCreateTypeSQL(): string {
  return `CREATE TYPE "public"."position_name_enum" AS ENUM('平社員', '主任', '部長', '社長')`;
}
