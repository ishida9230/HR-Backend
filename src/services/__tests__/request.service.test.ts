import { createChangeRequest } from "../request.service";
import {
  saveRequest,
  saveRequestItems,
  getRequestById,
} from "../../repositories/request.repository";
import { getEmployeeById } from "../../repositories/employee.repository";
import { mockRequest } from "../../__tests__/helpers/mocks/request.mock";
import { mockEmployee } from "../../__tests__/helpers/mocks/employee.mock";
import HttpException from "../../exceptions/HttpException";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_EMPLOYEE_NOT_FOUND,
  ERROR_MESSAGE_REQUEST_CREATION_FAILED,
  ERROR_MESSAGE_REQUEST_CREATION_ERROR,
} from "../../constants/error-messages";
import { RequestStatus } from "../../entities/Request";
import { AppDataSource } from "../../config/database";

// Repository層をモック化
jest.mock("../../repositories/request.repository");
jest.mock("../../repositories/employee.repository");
jest.mock("../../config/database");

describe("RequestService", () => {
  const mockEntityManager = {
    getRepository: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // AppDataSource.transactionのモック
    (AppDataSource.transaction as jest.Mock) = jest.fn(async (callback) => {
      return await callback(mockEntityManager);
    });
  });

  describe("createChangeRequest", () => {
    const validRequestData = {
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
      // Repository層のモック
      (getEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);
      (saveRequest as jest.Mock).mockResolvedValue({
        ...mockRequest,
        id: 1,
      });
      (saveRequestItems as jest.Mock).mockResolvedValue(mockRequest.items);
      (getRequestById as jest.Mock).mockResolvedValue(mockRequest);

      const result = await createChangeRequest(validRequestData);

      // アサーション
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.employeeId).toBe(1);
      expect(result.text).toBe("住所変更のため申請します");
      expect(result.status).toBe("PENDING_MANAGER");
      expect(result.items).toHaveLength(2);
      expect(result.items[0].fieldKey).toBe("address");
      expect(result.items[1].fieldKey).toBe("postalCode");

      // Repository層が正しく呼ばれたことを確認
      expect(getEmployeeById).toHaveBeenCalledWith(1);
      expect(saveRequest).toHaveBeenCalledWith(
        {
          employeeId: 1,
          text: "住所変更のため申請します",
          status: RequestStatus.PENDING_MANAGER,
          submittedAt: expect.any(Date),
        },
        mockEntityManager
      );
      expect(saveRequestItems).toHaveBeenCalledWith(
        [
          {
            requestId: 1,
            fieldKey: "address",
            oldValue: "東京都千代田区千代田1-1",
            newValue: "東京都港区六本木1-1",
          },
          {
            requestId: 1,
            fieldKey: "postalCode",
            oldValue: "100-0001",
            newValue: "106-0032",
          },
        ],
        mockEntityManager
      );
      expect(getRequestById).toHaveBeenCalledWith(1, mockEntityManager);
      expect(AppDataSource.transaction).toHaveBeenCalledTimes(1);
    });

    it("正常系: 日付がISO 8601形式の文字列に変換されている", async () => {
      // Repository層のモック
      (getEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);
      (saveRequest as jest.Mock).mockResolvedValue({
        ...mockRequest,
        id: 1,
      });
      (saveRequestItems as jest.Mock).mockResolvedValue(mockRequest.items);
      (getRequestById as jest.Mock).mockResolvedValue(mockRequest);

      const result = await createChangeRequest(validRequestData);

      // アサーション: 日付がISO 8601形式の文字列に変換されている
      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
      expect(typeof result.submittedAt).toBe("string");
      expect(result.completedAt).toBeNull();
      expect(typeof result.items[0].createdAt).toBe("string");
    });

    it("正常系: oldValueとnewValueがnullの場合も処理できる", async () => {
      const requestDataWithNulls = {
        employeeId: 1,
        text: "住所変更のため申請します",
        items: [
          {
            fieldKey: "address",
            oldValue: null,
            newValue: "東京都港区六本木1-1",
          },
        ],
      };

      const mockRequestWithNulls = {
        ...mockRequest,
        items: [
          {
            ...mockRequest.items[0],
            oldValue: null,
          },
        ],
      };

      // Repository層のモック
      (getEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);
      (saveRequest as jest.Mock).mockResolvedValue({
        ...mockRequestWithNulls,
        id: 1,
      });
      (saveRequestItems as jest.Mock).mockResolvedValue(mockRequestWithNulls.items);
      (getRequestById as jest.Mock).mockResolvedValue(mockRequestWithNulls);

      const result = await createChangeRequest(requestDataWithNulls);

      // アサーション
      expect(result.items[0].oldValue).toBeNull();
      expect(result.items[0].newValue).toBe("東京都港区六本木1-1");
    });

    it("異常系: 従業員が見つからない場合、HttpExceptionをスロー", async () => {
      const requestDataWithInvalidEmployee = {
        ...validRequestData,
        employeeId: 9999,
      };

      // Repository層のモック: HttpException(404)をスロー
      (getEmployeeById as jest.Mock).mockRejectedValue(
        new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_EMPLOYEE_NOT_FOUND, {
          employeeId: 9999,
        })
      );

      // アサーション: HttpExceptionがスローされる
      await expect(createChangeRequest(requestDataWithInvalidEmployee)).rejects.toThrow(
        HttpException
      );
      await expect(createChangeRequest(requestDataWithInvalidEmployee)).rejects.toHaveProperty(
        "status",
        HTTP_STATUS.NOT_FOUND
      );
      expect(getEmployeeById).toHaveBeenCalledWith(9999);
      expect(AppDataSource.transaction).not.toHaveBeenCalled();
    });

    it("異常系: 変更申請の作成後に取得に失敗した場合、HttpExceptionをスロー", async () => {
      // Repository層のモック
      (getEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);
      (saveRequest as jest.Mock).mockResolvedValue({
        ...mockRequest,
        id: 1,
      });
      (saveRequestItems as jest.Mock).mockResolvedValue(mockRequest.items);
      (getRequestById as jest.Mock).mockResolvedValue(null); // 取得に失敗

      // アサーション: HttpExceptionがスローされる
      // getRequestByIdがnullを返した場合、Errorがスローされ、catchブロックでHttpException(500)に変換される
      await expect(createChangeRequest(validRequestData)).rejects.toThrow(HttpException);
      await expect(createChangeRequest(validRequestData)).rejects.toHaveProperty(
        "status",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
      await expect(createChangeRequest(validRequestData)).rejects.toHaveProperty(
        "message",
        ERROR_MESSAGE_REQUEST_CREATION_ERROR
      );
    });

    it("異常系: トランザクション内でエラーが発生した場合、HttpExceptionをスロー", async () => {
      // Repository層のモック
      (getEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);
      (saveRequest as jest.Mock).mockRejectedValue(new Error("Database error"));

      // アサーション: HttpExceptionがスローされる
      await expect(createChangeRequest(validRequestData)).rejects.toThrow(HttpException);
      await expect(createChangeRequest(validRequestData)).rejects.toHaveProperty(
        "status",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
      await expect(createChangeRequest(validRequestData)).rejects.toHaveProperty(
        "message",
        ERROR_MESSAGE_REQUEST_CREATION_ERROR
      );
    });

    it("異常系: データ変換エラーが発生した場合、HttpExceptionをスロー", async () => {
      // Repository層のモック: 不正なデータを返却（createdAtがnullなど）
      const invalidRequest = {
        ...mockRequest,
        createdAt: null, // 不正なデータ
      } as any;

      (getEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);
      (saveRequest as jest.Mock).mockResolvedValue({
        ...invalidRequest,
        id: 1,
      });
      (saveRequestItems as jest.Mock).mockResolvedValue(mockRequest.items);
      (getRequestById as jest.Mock).mockResolvedValue(invalidRequest);

      // アサーション: HttpExceptionがスローされる
      await expect(createChangeRequest(validRequestData)).rejects.toThrow(HttpException);
      await expect(createChangeRequest(validRequestData)).rejects.toHaveProperty(
        "status",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
      await expect(createChangeRequest(validRequestData)).rejects.toHaveProperty(
        "message",
        ERROR_MESSAGE_REQUEST_CREATION_ERROR
      );
    });
  });
});
