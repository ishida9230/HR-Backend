import request from "supertest";
import express, { Application } from "express";
import { getEmployeeProfileHandler } from "../employee.controller";
import { getEmployeeProfile } from "../../services/employee.service";
import { EmployeeProfileResponse } from "../../dtos/employee.dto";
import errorMiddleware from "../../middleware/error.middleware";
import HttpException from "../../exceptions/HttpException";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_EMPLOYEE_NOT_FOUND,
  ERROR_MESSAGE_INVALID_EMPLOYEE_ID,
} from "../../constants/error-messages";

// Service層をモック化
jest.mock("../../services/employee.service");

describe("EmployeeController", () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.get("/api/employees/:id", getEmployeeProfileHandler);
    app.use(errorMiddleware);
    jest.clearAllMocks();
  });

  describe("GET /api/employees/:id", () => {
    it("正常系: 従業員プロフィールを取得できる", async () => {
      // Service層のモック: 正常なプロフィールデータを返却
      const mockProfile: EmployeeProfileResponse = {
        id: 1,
        employeeCode: 1,
        email: "yamada@example.com",
        firstName: "太郎",
        lastName: "山田",
        postalCode: "100-0001",
        address: "東京都千代田区千代田1-1",
        phone: "03-1234-5678",
        employmentType: "正社員",
        isActive: true,
        createdAt: "2020-01-01T00:00:00.000Z",
        updatedAt: "2020-01-01T00:00:00.000Z",
        assignments: [
          {
            id: 1,
            employeeId: 1,
            departmentId: 1,
            branchId: 1,
            positionId: 1,
            superiorFlag: false,
            startDate: "2020-01-01T00:00:00.000Z",
            endDate: null,
            createdAt: "2020-01-01T00:00:00.000Z",
            department: { id: 1, name: "営業部" },
            branch: { id: 1, name: "東京支店" },
            position: { id: 1, name: "平社員" },
          },
        ],
      };

      (getEmployeeProfile as jest.Mock).mockResolvedValue(mockProfile);

      const response = await request(app).get("/api/employees/1");

      // アサーション
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProfile);
      expect(getEmployeeProfile).toHaveBeenCalledWith(1);
      expect(getEmployeeProfile).toHaveBeenCalledTimes(1);
    });

    it("異常系: 従業員IDが0の場合、400 Bad Request", async () => {
      const response = await request(app).get("/api/employees/0");

      // アサーション
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(400);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_INVALID_EMPLOYEE_ID);
      expect(getEmployeeProfile).not.toHaveBeenCalled();
    });

    it("異常系: 従業員IDが負の数の場合、400 Bad Request", async () => {
      const response = await request(app).get("/api/employees/-1");

      // アサーション
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(400);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_INVALID_EMPLOYEE_ID);
      expect(getEmployeeProfile).not.toHaveBeenCalled();
    });

    it("異常系: 従業員IDが数値以外の場合、400 Bad Request", async () => {
      const response = await request(app).get("/api/employees/abc");

      // アサーション
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(400);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_INVALID_EMPLOYEE_ID);
      expect(getEmployeeProfile).not.toHaveBeenCalled();
    });

    it("異常系: 従業員が見つからない場合、404 Not Found", async () => {
      // Service層のモック: HttpException(404)をスロー
      (getEmployeeProfile as jest.Mock).mockRejectedValue(
        new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_EMPLOYEE_NOT_FOUND, {
          employeeId: 9999,
        })
      );

      const response = await request(app).get("/api/employees/9999");

      // アサーション
      expect(response.status).toBe(404);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(404);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_EMPLOYEE_NOT_FOUND);
      expect(response.body.error.details).toEqual({
        employeeId: 9999,
      });
      expect(getEmployeeProfile).toHaveBeenCalledWith(9999);
    });

    it("異常系: サービス層でエラーが発生した場合、エラーミドルウェアで処理される", async () => {
      // Service層のモック: 一般的なエラーをスロー
      (getEmployeeProfile as jest.Mock).mockRejectedValue(new Error("Internal server error"));

      const response = await request(app).get("/api/employees/1");

      // アサーション
      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(500);
    });
  });
});
