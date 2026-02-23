// OK
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
  })
  name: string;

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
    "name" character varying NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_departments" PRIMARY KEY ("id")
  )`;
}
