// OK
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Request } from "./Request";

@Entity("request_items")
export class RequestItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", name: "request_id" })
  requestId: number;

  @Column({ type: "varchar", name: "field_key" })
  fieldKey: string;

  @Column({ type: "text", nullable: true, name: "old_value" })
  oldValue: string | null;

  @Column({ type: "text", nullable: true, name: "new_value" })
  newValue: string | null;

  @CreateDateColumn({ type: "timestamp", name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Request, (request) => request.items)
  @JoinColumn({ name: "request_id" })
  request: Request;
}

/**
 * RequestItemテーブルのCREATE TABLE文を生成
 * 依存関係: requests
 */
export function getRequestItemCreateTableSQL(): string {
  return `CREATE TABLE "request_items" (
    "id" integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    "request_id" integer NOT NULL,
    "field_key" character varying NOT NULL,
    "old_value" text,
    "new_value" text,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_request_items" PRIMARY KEY ("id"),
    CONSTRAINT "FK_request" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
  )`;
}
