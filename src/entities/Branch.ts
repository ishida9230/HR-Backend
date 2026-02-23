// OK
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("branches")
export class Branch {
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
 * BranchテーブルのCREATE TABLE文を生成
 * 依存関係: なし
 */
export function getBranchCreateTableSQL(): string {
  return `CREATE TABLE "branches" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "name" character varying NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_branches" PRIMARY KEY ("id")
  )`;
}
