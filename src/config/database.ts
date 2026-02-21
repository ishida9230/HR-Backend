import { DataSource } from "typeorm";
import { Department } from "../entities/Department";
import { Branch } from "../entities/Branch";
import { Position } from "../entities/Position";
import { Role } from "../entities/Role";
import { Employee } from "../entities/Employee";
import { EmployeeAssignment } from "../entities/EmployeeAssignment";
import { EmployeeRole } from "../entities/EmployeeRole";
import { Request } from "../entities/Request";
import { RequestItem } from "../entities/RequestItem";
import { ApprovalStep } from "../entities/ApprovalStep";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "hr_system",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [
    Department,
    Branch,
    Position,
    Role,
    Employee,
    EmployeeAssignment,
    EmployeeRole,
    Request,
    RequestItem,
    ApprovalStep,
  ],
  migrations: ["src/migrations/*.ts"],
  subscribers: [],
});
