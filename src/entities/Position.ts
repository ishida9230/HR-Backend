// OK
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("positions")
export class Position {
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
 * PositionテーブルのCREATE TABLE文を生成
 * 依存関係: なし
 */
export function getPositionCreateTableSQL(): string {
  return `CREATE TABLE "positions" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "name" character varying NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_positions" PRIMARY KEY ("id")
  )`;
}
