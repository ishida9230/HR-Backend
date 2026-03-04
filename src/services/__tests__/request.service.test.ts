import { createChangeRequest, formatAssignmentsValue } from "../request.service";
import {
  saveRequest,
  saveRequestItems,
  getRequestById,
} from "../../repositories/request.repository";
import { getEmployeeById } from "../../repositories/employee.repository";
import { getBranchById } from "../../repositories/branch.repository";
import { getDepartmentById } from "../../repositories/department.repository";
import { getPositionById } from "../../repositories/position.repository";
import { mockRequest } from "../../__tests__/helpers/mocks/request.mock";
import { mockEmployee } from "../../__tests__/helpers/mocks/employee.mock";
import HttpException from "../../exceptions/HttpException";
import {
  HTTP_STATUS,
  ERROR_MESSAGE_EMPLOYEE_NOT_FOUND,
  ERROR_MESSAGE_REQUEST_CREATION_FAILED,
  ERROR_MESSAGE_REQUEST_CREATION_ERROR,
  ERROR_MESSAGE_INVALID_BRANCH_ID,
  ERROR_MESSAGE_INVALID_DEPARTMENT_ID,
  ERROR_MESSAGE_INVALID_POSITION_ID,
  ERROR_MESSAGE_DATA_FETCH_ERROR,
} from "../../constants/error-messages";
import { RequestStatus } from "../../entities/Request";
import { AppDataSource } from "../../config/database";

// Repository層をモック化
jest.mock("../../repositories/request.repository");
jest.mock("../../repositories/employee.repository");
jest.mock("../../repositories/branch.repository");
jest.mock("../../repositories/department.repository");
jest.mock("../../repositories/position.repository");
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

  describe("formatAssignmentsValue", () => {
    const mockBranch = { id: 1, name: "東京支店" };
    const mockDepartment = { id: 1, name: "営業部" };
    const mockPosition = { id: 1, name: "平社員" };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("正常系: アサインメント配列を正しい形式に変換できる", async () => {
      const assignments = JSON.stringify([
        { branchId: 1, departmentId: 1, positionId: 1 },
        { branchId: 2, departmentId: 2, positionId: 2 },
      ]);

      (getBranchById as jest.Mock)
        .mockResolvedValueOnce(mockBranch)
        .mockResolvedValueOnce({ id: 2, name: "大阪支店" });
      (getDepartmentById as jest.Mock)
        .mockResolvedValueOnce(mockDepartment)
        .mockResolvedValueOnce({ id: 2, name: "開発部" });
      (getPositionById as jest.Mock)
        .mockResolvedValueOnce(mockPosition)
        .mockResolvedValueOnce({ id: 2, name: "主任" });

      const result = await formatAssignmentsValue(assignments);
      const parsed = JSON.parse(result!);

      expect(parsed).toHaveProperty("branches");
      expect(parsed).toHaveProperty("departments");
      expect(parsed).toHaveProperty("positions");
      expect(parsed.branches).toHaveLength(2);
      expect(parsed.departments).toHaveLength(2);
      expect(parsed.positions).toHaveLength(2);
      expect(parsed.branches[0]).toEqual({ id: 1, name: "東京支店" });
      expect(parsed.branches[1]).toEqual({ id: 2, name: "大阪支店" });
      expect(parsed.departments[0]).toEqual({ id: 1, name: "営業部" });
      expect(parsed.departments[1]).toEqual({ id: 2, name: "開発部" });
      expect(parsed.positions[0]).toEqual({ id: 1, name: "平社員" });
      expect(parsed.positions[1]).toEqual({ id: 2, name: "主任" });
    });

    it("正常系: 同じIDが複数回出現する場合、すべて含まれる", async () => {
      const assignments = JSON.stringify([
        { branchId: 1, departmentId: 1, positionId: 1 },
        { branchId: 2, departmentId: 2, positionId: 2 },
        { branchId: 3, departmentId: 5, positionId: 1 }, // positionId: 1が再度出現
      ]);

      (getBranchById as jest.Mock)
        .mockResolvedValueOnce(mockBranch)
        .mockResolvedValueOnce({ id: 2, name: "大阪支店" })
        .mockResolvedValueOnce({ id: 3, name: "福岡支店" });
      (getDepartmentById as jest.Mock)
        .mockResolvedValueOnce(mockDepartment)
        .mockResolvedValueOnce({ id: 2, name: "開発部" })
        .mockResolvedValueOnce({ id: 5, name: "人事部" });
      (getPositionById as jest.Mock)
        .mockResolvedValueOnce(mockPosition)
        .mockResolvedValueOnce({ id: 2, name: "主任" });
      // positionId: 1はキャッシュから取得されるため、2回目の呼び出しはない

      const result = await formatAssignmentsValue(assignments);
      const parsed = JSON.parse(result!);

      expect(parsed.positions).toHaveLength(3);
      expect(parsed.positions[0]).toEqual({ id: 1, name: "平社員" });
      expect(parsed.positions[1]).toEqual({ id: 2, name: "主任" });
      expect(parsed.positions[2]).toEqual({ id: 1, name: "平社員" }); // 重複して含まれる
    });

    it("正常系: 元の配列の順序が保持される", async () => {
      const assignments = JSON.stringify([
        { branchId: 3, departmentId: 5, positionId: 2 },
        { branchId: 1, departmentId: 1, positionId: 1 },
        { branchId: 2, departmentId: 2, positionId: 2 },
      ]);

      (getBranchById as jest.Mock)
        .mockResolvedValueOnce({ id: 3, name: "福岡支店" })
        .mockResolvedValueOnce(mockBranch)
        .mockResolvedValueOnce({ id: 2, name: "大阪支店" });
      (getDepartmentById as jest.Mock)
        .mockResolvedValueOnce({ id: 5, name: "人事部" })
        .mockResolvedValueOnce(mockDepartment)
        .mockResolvedValueOnce({ id: 2, name: "開発部" });
      (getPositionById as jest.Mock)
        .mockResolvedValueOnce({ id: 2, name: "主任" })
        .mockResolvedValueOnce(mockPosition);

      const result = await formatAssignmentsValue(assignments);
      const parsed = JSON.parse(result!);

      // 元の配列の順序が保持される
      expect(parsed.branches[0]).toEqual({ id: 3, name: "福岡支店" });
      expect(parsed.branches[1]).toEqual({ id: 1, name: "東京支店" });
      expect(parsed.branches[2]).toEqual({ id: 2, name: "大阪支店" });
    });

    it("正常系: nullの場合はnullを返す", async () => {
      const result = await formatAssignmentsValue(null);

      expect(result).toBeNull();
      expect(getBranchById).not.toHaveBeenCalled();
      expect(getDepartmentById).not.toHaveBeenCalled();
      expect(getPositionById).not.toHaveBeenCalled();
    });

    it("正常系: 空文字列の場合は空文字列を返す", async () => {
      const result = await formatAssignmentsValue("");

      // 空文字列は falsy なので、そのまま返される
      expect(result).toBe("");
      expect(getBranchById).not.toHaveBeenCalled();
      expect(getDepartmentById).not.toHaveBeenCalled();
      expect(getPositionById).not.toHaveBeenCalled();
    });

    it("正常系: 配列でない場合は元の値を返す", async () => {
      const invalidJson = JSON.stringify({ branchId: 1 });

      const result = await formatAssignmentsValue(invalidJson);

      expect(result).toBe(invalidJson);
      expect(getBranchById).not.toHaveBeenCalled();
    });

    it("異常系: 無効な支店IDの場合、HttpExceptionをスロー", async () => {
      const assignments = JSON.stringify([
        { branchId: 999, departmentId: 1, positionId: 1 },
      ]);

      (getBranchById as jest.Mock).mockResolvedValue(null);
      (getDepartmentById as jest.Mock).mockResolvedValue(mockDepartment);
      (getPositionById as jest.Mock).mockResolvedValue(mockPosition);

      await expect(formatAssignmentsValue(assignments)).rejects.toThrow(HttpException);
      await expect(formatAssignmentsValue(assignments)).rejects.toHaveProperty(
        "status",
        HTTP_STATUS.BAD_REQUEST
      );
      await expect(formatAssignmentsValue(assignments)).rejects.toHaveProperty(
        "message",
        ERROR_MESSAGE_INVALID_BRANCH_ID
      );
    });

    it("異常系: 無効な部署IDの場合、HttpExceptionをスロー", async () => {
      const assignments = JSON.stringify([
        { branchId: 1, departmentId: 999, positionId: 1 },
      ]);

      (getBranchById as jest.Mock).mockResolvedValue(mockBranch);
      (getDepartmentById as jest.Mock).mockResolvedValue(null);
      (getPositionById as jest.Mock).mockResolvedValue(mockPosition);

      await expect(formatAssignmentsValue(assignments)).rejects.toThrow(HttpException);
      await expect(formatAssignmentsValue(assignments)).rejects.toHaveProperty(
        "status",
        HTTP_STATUS.BAD_REQUEST
      );
      await expect(formatAssignmentsValue(assignments)).rejects.toHaveProperty(
        "message",
        ERROR_MESSAGE_INVALID_DEPARTMENT_ID
      );
    });

    it("異常系: 無効な役職IDの場合、HttpExceptionをスロー", async () => {
      const assignments = JSON.stringify([
        { branchId: 1, departmentId: 1, positionId: 999 },
      ]);

      (getBranchById as jest.Mock).mockResolvedValue(mockBranch);
      (getDepartmentById as jest.Mock).mockResolvedValue(mockDepartment);
      (getPositionById as jest.Mock).mockResolvedValue(null);

      await expect(formatAssignmentsValue(assignments)).rejects.toThrow(HttpException);
      await expect(formatAssignmentsValue(assignments)).rejects.toHaveProperty(
        "status",
        HTTP_STATUS.BAD_REQUEST
      );
      await expect(formatAssignmentsValue(assignments)).rejects.toHaveProperty(
        "message",
        ERROR_MESSAGE_INVALID_POSITION_ID
      );
    });

    it("異常系: 無効なJSON文字列の場合、HttpExceptionをスロー", async () => {
      const invalidJson = "invalid json string";

      await expect(formatAssignmentsValue(invalidJson)).rejects.toThrow(HttpException);
      await expect(formatAssignmentsValue(invalidJson)).rejects.toHaveProperty(
        "status",
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
      await expect(formatAssignmentsValue(invalidJson)).rejects.toHaveProperty(
        "message",
        ERROR_MESSAGE_DATA_FETCH_ERROR
      );
    });

    it("正常系: マスターデータ取得はキャッシュを使用して最適化される", async () => {
      const assignments = JSON.stringify([
        { branchId: 1, departmentId: 1, positionId: 1 },
        { branchId: 1, departmentId: 1, positionId: 1 }, // 同じIDが再度出現
      ]);

      (getBranchById as jest.Mock).mockResolvedValueOnce(mockBranch);
      (getDepartmentById as jest.Mock).mockResolvedValueOnce(mockDepartment);
      (getPositionById as jest.Mock).mockResolvedValueOnce(mockPosition);

      const result = await formatAssignmentsValue(assignments);
      const parsed = JSON.parse(result!);

      // 同じIDでも2回含まれる
      expect(parsed.branches).toHaveLength(2);
      expect(parsed.departments).toHaveLength(2);
      expect(parsed.positions).toHaveLength(2);

      // マスターデータ取得は1回のみ（キャッシュを使用）
      expect(getBranchById).toHaveBeenCalledTimes(1);
      expect(getDepartmentById).toHaveBeenCalledTimes(1);
      expect(getPositionById).toHaveBeenCalledTimes(1);
    });
  });
});
