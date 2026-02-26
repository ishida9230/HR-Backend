import request from "supertest";
import express, { Application } from "express";
import { createRequestHandler } from "../request.controller";
import { createChangeRequest } from "../../services/request.service";
import { RequestResponse } from "../../dtos/request.dto";
import errorMiddleware from "../../middleware/error.middleware";
import HttpException from "../../exceptions/HttpException";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_INVALID_EMPLOYEE_ID,
  ERROR_MESSAGE_MISSING_REQUIRED_FIELDS,
} from "../../constants/error-messages";

// Service層をモック化
jest.mock("../../services/request.service");

describe("RequestController", () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post("/api/requests", createRequestHandler);
    app.use(errorMiddleware);
    jest.clearAllMocks();
  });

  describe("POST /api/requests", () => {
    const validRequestBody = {
      employeeId: 1,
      text: "住所変更のため申請します",
      items: [
        {
          fieldKey: "address",
          oldValue: "東京都千代田区千代田1-1",
          newValue: "東京都港区六本木1-1",
        },
        {
          fieldKey: "postalCode",
          oldValue: "100-0001",
          newValue: "106-0032",
        },
      ],
    };

    it("正常系: 変更申請を作成できる", async () => {
      // Service層のモック: 正常な変更申請データを返却
      const mockResponse: RequestResponse = {
        id: 1,
        employeeId: 1,
        status: "PENDING_MANAGER",
        text: "住所変更のため申請します",
        submittedAt: "2024-01-15T10:00:00.000Z",
        completedAt: null,
        createdAt: "2024-01-15T10:00:00.000Z",
        updatedAt: "2024-01-15T10:00:00.000Z",
        items: [
          {
            id: 1,
            fieldKey: "address",
            oldValue: "東京都千代田区千代田1-1",
            newValue: "東京都港区六本木1-1",
            createdAt: "2024-01-15T10:00:00.000Z",
          },
          {
            id: 2,
            fieldKey: "postalCode",
            oldValue: "100-0001",
            newValue: "106-0032",
            createdAt: "2024-01-15T10:00:00.000Z",
          },
        ],
      };

      (createChangeRequest as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).post("/api/requests").send(validRequestBody);

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.CREATED);
      expect(response.body).toEqual(mockResponse);
      expect(createChangeRequest).toHaveBeenCalledWith({
        employeeId: 1,
        text: "住所変更のため申請します",
        items: [
          {
            fieldKey: "address",
            oldValue: "東京都千代田区千代田1-1",
            newValue: "東京都港区六本木1-1",
          },
          {
            fieldKey: "postalCode",
            oldValue: "100-0001",
            newValue: "106-0032",
          },
        ],
      });
      expect(createChangeRequest).toHaveBeenCalledTimes(1);
    });

    it("異常系: employeeIdが不足している場合、400 Bad Request", async () => {
      const invalidBody = {
        text: "住所変更のため申請します",
        items: [
          {
            fieldKey: "address",
            oldValue: "東京都千代田区千代田1-1",
            newValue: "東京都港区六本木1-1",
          },
        ],
      };

      const response = await request(app).post("/api/requests").send(invalidBody);

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_MISSING_REQUIRED_FIELDS);
      expect(createChangeRequest).not.toHaveBeenCalled();
    });

    it("異常系: textが不足している場合、400 Bad Request", async () => {
      const invalidBody = {
        employeeId: 1,
        items: [
          {
            fieldKey: "address",
            oldValue: "東京都千代田区千代田1-1",
            newValue: "東京都港区六本木1-1",
          },
        ],
      };

      const response = await request(app).post("/api/requests").send(invalidBody);

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_MISSING_REQUIRED_FIELDS);
      expect(createChangeRequest).not.toHaveBeenCalled();
    });

    it("異常系: itemsが不足している場合、400 Bad Request", async () => {
      const invalidBody = {
        employeeId: 1,
        text: "住所変更のため申請します",
      };

      const response = await request(app).post("/api/requests").send(invalidBody);

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_MISSING_REQUIRED_FIELDS);
      expect(createChangeRequest).not.toHaveBeenCalled();
    });

    it("異常系: itemsが空配列の場合、400 Bad Request", async () => {
      const invalidBody = {
        employeeId: 1,
        text: "住所変更のため申請します",
        items: [],
      };

      const response = await request(app).post("/api/requests").send(invalidBody);

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_MISSING_REQUIRED_FIELDS);
      expect(createChangeRequest).not.toHaveBeenCalled();
    });

    it("異常系: itemsが配列でない場合、400 Bad Request", async () => {
      const invalidBody = {
        employeeId: 1,
        text: "住所変更のため申請します",
        items: "not-an-array",
      };

      const response = await request(app).post("/api/requests").send(invalidBody);

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_MISSING_REQUIRED_FIELDS);
      expect(createChangeRequest).not.toHaveBeenCalled();
    });

    it("異常系: employeeIdが0の場合、400 Bad Request", async () => {
      const invalidBody = {
        ...validRequestBody,
        employeeId: 0,
      };

      const response = await request(app).post("/api/requests").send(invalidBody);

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_INVALID_EMPLOYEE_ID);
      expect(createChangeRequest).not.toHaveBeenCalled();
    });

    it("異常系: employeeIdが負の数の場合、400 Bad Request", async () => {
      const invalidBody = {
        ...validRequestBody,
        employeeId: -1,
      };

      const response = await request(app).post("/api/requests").send(invalidBody);

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_INVALID_EMPLOYEE_ID);
      expect(createChangeRequest).not.toHaveBeenCalled();
    });

    it("異常系: employeeIdが数値以外の場合、400 Bad Request", async () => {
      const invalidBody = {
        ...validRequestBody,
        employeeId: "not-a-number",
      };

      const response = await request(app).post("/api/requests").send(invalidBody);

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_INVALID_EMPLOYEE_ID);
      expect(createChangeRequest).not.toHaveBeenCalled();
    });

    it("異常系: 従業員が見つからない場合、404 Not Found", async () => {
      // Service層のモック: HttpException(404)をスロー
      (createChangeRequest as jest.Mock).mockRejectedValue(
        new HttpException(HTTP_STATUS.NOT_FOUND, "指定された従業員が見つかりませんでした。", {
          employeeId: 9999,
        })
      );

      const response = await request(app).post("/api/requests").send(validRequestBody);

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.NOT_FOUND);
      expect(createChangeRequest).toHaveBeenCalledWith({
        employeeId: 1,
        text: "住所変更のため申請します",
        items: [
          {
            fieldKey: "address",
            oldValue: "東京都千代田区千代田1-1",
            newValue: "東京都港区六本木1-1",
          },
          {
            fieldKey: "postalCode",
            oldValue: "100-0001",
            newValue: "106-0032",
          },
        ],
      });
    });

    it("異常系: サービス層でエラーが発生した場合、エラーミドルウェアで処理される", async () => {
      // Service層のモック: 一般的なエラーをスロー
      (createChangeRequest as jest.Mock).mockRejectedValue(new Error("Internal server error"));

      const response = await request(app).post("/api/requests").send(validRequestBody);

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });
});
