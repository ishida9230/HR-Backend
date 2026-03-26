import request from "supertest";
import express, { Application } from "express";
import errorMiddleware from "../../middleware/error.middleware";
import HttpException from "../../exceptions/HttpException";
import { processRequestActionHandler } from "../request.controller";
import { processRequestActionService } from "../../services/request.service";
import { RequestResponse } from "../../dtos/request.dto";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_INVALID_REQUEST_ID,
  ERROR_MESSAGE_STATUS_REQUIRED,
  ERROR_MESSAGE_ACTOR_ID_REQUIRED,
  ERROR_MESSAGE_REJECT_COMMENT_REQUIRED,
  ERROR_MESSAGE_SERVER_ERROR,
} from "../../constants/error-messages";

jest.mock("../../services/request.service");

describe("RequestActionController", () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.post("/api/requests/:id/action", processRequestActionHandler);
    app.use(errorMiddleware);
    jest.clearAllMocks();
  });

  describe("POST /api/requests/:id/action", () => {
    const mockResponse: RequestResponse = {
      id: 1,
      employeeId: 1,
      status: "PENDING_HR",
      text: "住所変更のため申請します",
      submittedAt: "2024-01-15T10:00:00.000Z",
      completedAt: null,
      createdAt: "2024-01-15T10:00:00.000Z",
      updatedAt: "2024-01-15T10:00:00.000Z",
      isHidden: false,
      items: [
        {
          id: 1,
          fieldKey: "address",
          oldValue: "東京都千代田区千代田1-1",
          newValue: "東京都港区六本木1-1",
          createdAt: "2024-01-15T10:00:00.000Z",
        },
      ],
    };

    it("正常系: 承認（コメント不要）", async () => {
      (processRequestActionService as jest.Mock).mockResolvedValue(mockResponse);

      const body = { status: "PENDING_HR", actedByEmployeeId: 1 };
      const response = await request(app).post("/api/requests/1/action").send(body);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(processRequestActionService).toHaveBeenCalledWith(1, body);
    });

    it("正常系: 差し戻し（コメント必須）", async () => {
      (processRequestActionService as jest.Mock).mockResolvedValue(mockResponse);

      const body = {
        status: "CHANGES_REQUESTED",
        comment: "理由です",
        actedByEmployeeId: 1,
      };
      const response = await request(app).post("/api/requests/1/action").send(body);

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(processRequestActionService).toHaveBeenCalledWith(1, body);
    });

    it("異常系: statusが不足している場合、400 Bad Request", async () => {
      const body = { actedByEmployeeId: 1 };

      const response = await request(app).post("/api/requests/1/action").send(body);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_STATUS_REQUIRED);
      expect(processRequestActionService).not.toHaveBeenCalled();
    });

    it("異常系: 実行者IDが不足している場合、400 Bad Request", async () => {
      const body = { status: "PENDING_HR" };

      const response = await request(app).post("/api/requests/1/action").send(body);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_ACTOR_ID_REQUIRED);
      expect(processRequestActionService).not.toHaveBeenCalled();
    });

    it("異常系: 差し戻し時（CHANGES_REQUESTED）にコメントが空の場合、400 Bad Request", async () => {
      const body = { status: "CHANGES_REQUESTED", comment: "   ", actedByEmployeeId: 1 };

      const response = await request(app).post("/api/requests/1/action").send(body);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_REJECT_COMMENT_REQUIRED);
      expect(processRequestActionService).not.toHaveBeenCalled();
    });

    it("異常系: requestIdが不正な場合、400 Bad Request", async () => {
      const body = { status: "PENDING_HR", actedByEmployeeId: 1 };

      const response = await request(app).post("/api/requests/0/action").send(body);

      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_INVALID_REQUEST_ID);
      expect(processRequestActionService).not.toHaveBeenCalled();
    });

    it("異常系: Serviceで一般エラーが起きた場合、500 Internal Server Error", async () => {
      (processRequestActionService as jest.Mock).mockRejectedValue(new Error("boom"));

      const body = { status: "PENDING_HR", actedByEmployeeId: 1 };
      const response = await request(app).post("/api/requests/1/action").send(body);

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_SERVER_ERROR);
    });

    it("異常系: ServiceがHttpExceptionをスローした場合、そのまま返す", async () => {
      const httpError = new HttpException(HTTP_STATUS.NOT_FOUND, "not found", {
        requestId: 1,
      });
      (processRequestActionService as jest.Mock).mockRejectedValue(httpError);

      const body = { status: "PENDING_HR", actedByEmployeeId: 1 };
      const response = await request(app).post("/api/requests/1/action").send(body);

      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body.error.message).toBe("not found");
    });
  });
});

