import request from "supertest";
import express, { Application } from "express";
import {
  createRequestHandler,
  hideRequestHandler,
  getRequestListHandler,
} from "../request.controller";
import {
  createChangeRequest,
  hideChangeRequest,
  getRequestListService,
} from "../../services/request.service";
import { RequestResponse, RequestListResponse } from "../../dtos/request.dto";
import errorMiddleware from "../../middleware/error.middleware";
import HttpException from "../../exceptions/HttpException";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_INVALID_EMPLOYEE_ID,
  ERROR_MESSAGE_MISSING_REQUIRED_FIELDS,
  ERROR_MESSAGE_INVALID_REQUEST_ID,
  ERROR_MESSAGE_REQUEST_NOT_FOUND,
  ERROR_MESSAGE_REQUEST_ALREADY_HIDDEN,
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
        isHidden: false,
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

  describe("PATCH /api/requests/:id/hide", () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.patch("/api/requests/:id/hide", hideRequestHandler);
      app.use(errorMiddleware);
      jest.clearAllMocks();
    });

    it("正常系: 変更申請を非表示にできる", async () => {
      // Service層のモック: 更新されたrequestIdのみを返却
      const mockResponse = { id: 1 };

      (hideChangeRequest as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).patch("/api/requests/1/hide");

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(hideChangeRequest).toHaveBeenCalledWith(1);
      expect(hideChangeRequest).toHaveBeenCalledTimes(1);
    });

    it("異常系: requestIdが0の場合、400 Bad Request", async () => {
      const response = await request(app).patch("/api/requests/0/hide");

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_INVALID_REQUEST_ID);
      expect(hideChangeRequest).not.toHaveBeenCalled();
    });

    it("異常系: requestIdが負の数の場合、400 Bad Request", async () => {
      const response = await request(app).patch("/api/requests/-1/hide");

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_INVALID_REQUEST_ID);
      expect(hideChangeRequest).not.toHaveBeenCalled();
    });

    it("異常系: requestIdが数値以外の場合、400 Bad Request", async () => {
      const response = await request(app).patch("/api/requests/abc/hide");

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_INVALID_REQUEST_ID);
      expect(hideChangeRequest).not.toHaveBeenCalled();
    });

    it("異常系: 変更申請が見つからない場合、404 Not Found", async () => {
      // Service層のモック: HttpException(404)をスロー
      (hideChangeRequest as jest.Mock).mockRejectedValue(
        new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_REQUEST_NOT_FOUND, {
          requestId: 9999,
        })
      );

      const response = await request(app).patch("/api/requests/9999/hide");

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.NOT_FOUND);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_REQUEST_NOT_FOUND);
      expect(hideChangeRequest).toHaveBeenCalledWith(9999);
    });

    it("異常系: 既に非表示の場合、400 Bad Request", async () => {
      // Service層のモック: HttpException(400)をスロー
      (hideChangeRequest as jest.Mock).mockRejectedValue(
        new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_REQUEST_ALREADY_HIDDEN, {
          requestId: 1,
        })
      );

      const response = await request(app).patch("/api/requests/1/hide");

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe(ERROR_MESSAGE_REQUEST_ALREADY_HIDDEN);
      expect(hideChangeRequest).toHaveBeenCalledWith(1);
    });

    it("異常系: サービス層でエラーが発生した場合、エラーミドルウェアで処理される", async () => {
      // Service層のモック: 一般的なエラーをスロー
      (hideChangeRequest as jest.Mock).mockRejectedValue(new Error("Internal server error"));

      const response = await request(app).patch("/api/requests/1/hide");

      // アサーション
      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });

  describe("GET /api/requests/list", () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.get("/api/requests/list", getRequestListHandler);
      app.use(errorMiddleware);
      jest.clearAllMocks();
    });

    it("正常系: 申請一覧を取得できる（パラメータなし）", async () => {
      const mockResponse: RequestListResponse = {
        requests: [
          {
            id: 1,
            title: "住所変更のため申請します",
            employee: {
              id: 1,
              firstName: "太郎",
              lastName: "山田",
            },
            departments: [{ id: 1, name: "営業部" }],
            branches: [{ id: 1, name: "東京支店" }],
            positions: [{ id: 1, name: "マネージャー" }],
            status: "PENDING_MANAGER",
            submittedAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 25,
        totalPages: 1,
      };

      (getRequestListService as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).get("/api/requests/list");

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(getRequestListService).toHaveBeenCalledWith({
        status: undefined,
        employeeName: undefined,
        departmentId: undefined,
        branchId: undefined,
        positionId: undefined,
        page: 1,
        limit: 25,
      });
      expect(getRequestListService).toHaveBeenCalledTimes(1);
    });

    it("正常系: ステータスでフィルタリングできる", async () => {
      const mockResponse: RequestListResponse = {
        requests: [],
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 0,
      };

      (getRequestListService as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).get("/api/requests/list?status=PENDING_MANAGER");

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(getRequestListService).toHaveBeenCalledWith({
        status: "PENDING_MANAGER",
        employeeName: undefined,
        departmentId: undefined,
        branchId: undefined,
        positionId: undefined,
        page: 1,
        limit: 25,
      });
    });

    it("正常系: 従業員名でフィルタリングできる（大文字・小文字を区別しない）", async () => {
      const mockResponse: RequestListResponse = {
        requests: [
          {
            id: 1,
            title: "住所変更のため申請します",
            employee: {
              id: 1,
              firstName: "Taro",
              lastName: "Yamada",
            },
            departments: [{ id: 1, name: "営業部" }],
            branches: [{ id: 1, name: "東京支店" }],
            positions: [{ id: 1, name: "マネージャー" }],
            status: "PENDING_MANAGER",
            submittedAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 25,
        totalPages: 1,
      };

      (getRequestListService as jest.Mock).mockResolvedValue(mockResponse);

      // 小文字で検索しても大文字の名前がヒットすることを確認
      const response = await request(app).get("/api/requests/list?employeeName=taro");

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(getRequestListService).toHaveBeenCalledWith({
        status: undefined,
        employeeName: "taro",
        departmentId: undefined,
        branchId: undefined,
        positionId: undefined,
        page: 1,
        limit: 25,
      });
    });

    it("正常系: 部署IDでフィルタリングできる", async () => {
      const mockResponse: RequestListResponse = {
        requests: [],
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 0,
      };

      (getRequestListService as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).get("/api/requests/list?departmentId=1");

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(getRequestListService).toHaveBeenCalledWith({
        status: undefined,
        employeeName: undefined,
        departmentId: 1,
        branchId: undefined,
        positionId: undefined,
        page: 1,
        limit: 25,
      });
    });

    it("正常系: 支店IDでフィルタリングできる", async () => {
      const mockResponse: RequestListResponse = {
        requests: [],
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 0,
      };

      (getRequestListService as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).get("/api/requests/list?branchId=1");

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(getRequestListService).toHaveBeenCalledWith({
        status: undefined,
        employeeName: undefined,
        departmentId: undefined,
        branchId: 1,
        positionId: undefined,
        page: 1,
        limit: 25,
      });
    });

    it("正常系: 役職IDでフィルタリングできる", async () => {
      const mockResponse: RequestListResponse = {
        requests: [],
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 0,
      };

      (getRequestListService as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).get("/api/requests/list?positionId=1");

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(getRequestListService).toHaveBeenCalledWith({
        status: undefined,
        employeeName: undefined,
        departmentId: undefined,
        branchId: undefined,
        positionId: 1,
        page: 1,
        limit: 25,
      });
    });

    it("正常系: ページネーションが機能する", async () => {
      const mockResponse: RequestListResponse = {
        requests: [],
        total: 50,
        page: 2,
        limit: 25,
        totalPages: 2,
      };

      (getRequestListService as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).get("/api/requests/list?page=2&limit=25");

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(getRequestListService).toHaveBeenCalledWith({
        status: undefined,
        employeeName: undefined,
        departmentId: undefined,
        branchId: undefined,
        positionId: undefined,
        page: 2,
        limit: 25,
      });
    });

    it("正常系: 複数の条件を組み合わせてフィルタリングできる", async () => {
      const mockResponse: RequestListResponse = {
        requests: [],
        total: 0,
        page: 1,
        limit: 25,
        totalPages: 0,
      };

      (getRequestListService as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).get(
        "/api/requests/list?status=PENDING_MANAGER&employeeName=山田&departmentId=1&branchId=1&positionId=1&page=1&limit=10"
      );

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(getRequestListService).toHaveBeenCalledWith({
        status: "PENDING_MANAGER",
        employeeName: "山田",
        departmentId: 1,
        branchId: 1,
        positionId: 1,
        page: 1,
        limit: 10,
      });
    });

    it("正常系: 複数の所属情報がある場合、すべて返される", async () => {
      const mockResponse: RequestListResponse = {
        requests: [
          {
            id: 1,
            title: "住所変更のため申請します",
            employee: {
              id: 1,
              firstName: "太郎",
              lastName: "山田",
            },
            departments: [
              { id: 1, name: "営業部" },
              { id: 2, name: "開発部" },
            ],
            branches: [
              { id: 1, name: "東京支店" },
              { id: 2, name: "大阪支店" },
            ],
            positions: [
              { id: 1, name: "マネージャー" },
              { id: 2, name: "シニアマネージャー" },
            ],
            status: "PENDING_MANAGER",
            submittedAt: "2024-01-15T10:00:00.000Z",
            updatedAt: "2024-01-15T10:00:00.000Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 25,
        totalPages: 1,
      };

      (getRequestListService as jest.Mock).mockResolvedValue(mockResponse);

      const response = await request(app).get("/api/requests/list");

      expect(response.status).toBe(HTTP_STATUS.OK);
      expect(response.body).toEqual(mockResponse);
      expect(response.body.requests[0].departments).toHaveLength(2);
      expect(response.body.requests[0].branches).toHaveLength(2);
      expect(response.body.requests[0].positions).toHaveLength(2);
    });

    it("異常系: サービス層でエラーが発生した場合、エラーミドルウェアで処理される", async () => {
      (getRequestListService as jest.Mock).mockRejectedValue(new Error("Internal server error"));

      const response = await request(app).get("/api/requests/list");

      expect(response.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });
  });
});
