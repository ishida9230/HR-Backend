// OK
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("roles")
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "text", array: true })
  permissions: string[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}

/**
 * RoleテーブルのCREATE TABLE文を生成
 * 依存関係: なし
 */
export function getRoleCreateTableSQL(): string {
  return `CREATE TABLE "roles" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "name" character varying NOT NULL,
    "permissions" text array NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_roles" PRIMARY KEY ("id")
  )`;
}
