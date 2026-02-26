import { getEmployeeProfile } from "../employee.service";
import { getEmployeeById } from "../../repositories/employee.repository";
import { mockEmployee, mockEmployeeWithEndDate } from "../../__tests__/helpers/mocks/employee.mock";
import HttpException from "../../exceptions/HttpException";
import { HTTP_STATUS, ERROR_MESSAGE_EMPLOYEE_NOT_FOUND } from "../../constants/error-messages";

// Repository層をモック化
jest.mock("../../repositories/employee.repository");

describe("EmployeeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getEmployeeProfile", () => {
    it("正常系: 従業員プロフィールを取得できる", async () => {
      // Repository層のモック: 正常な従業員データを返却
      (getEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await getEmployeeProfile(1);

      // アサーション
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.firstName).toBe("太郎");
      expect(result.lastName).toBe("山田");
      expect(result.employmentType).toBe("正社員");
      expect(result.isActive).toBe(true);
      expect(result.assignments).toHaveLength(2);
      expect(result.assignments[0].id).toBe(1);
      expect(result.assignments[1].id).toBe(2);

      // Repository層が正しく呼ばれたことを確認
      expect(getEmployeeById).toHaveBeenCalledWith(1);
      expect(getEmployeeById).toHaveBeenCalledTimes(1);
    });

    it("正常系: endDateがnullのassignmentsのみ返却される", async () => {
      // Repository層のモック: endDateが設定されているassignmentを含むデータを返却
      (getEmployeeById as jest.Mock).mockResolvedValue(mockEmployeeWithEndDate);

      const result = await getEmployeeProfile(1);

      // アサーション: endDateがnullのassignmentのみ返却される
      expect(result.assignments).toHaveLength(1);
      expect(result.assignments[0].id).toBe(1);
      expect(result.assignments[0].endDate).toBeNull();
    });

    it("正常系: assignmentsがid順でソートされている", async () => {
      (getEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await getEmployeeProfile(1);

      // アサーション: assignmentsがid順でソートされている
      expect(result.assignments[0].id).toBeLessThan(result.assignments[1].id);
    });

    it("正常系: employmentTypeが日本語に変換されている", async () => {
      (getEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await getEmployeeProfile(1);

      // アサーション: employmentTypeが日本語に変換されている
      expect(result.employmentType).toBe("正社員");
    });

    it("正常系: 日付がISO 8601形式の文字列に変換されている", async () => {
      (getEmployeeById as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await getEmployeeProfile(1);

      // アサーション: 日付がISO 8601形式の文字列に変換されている
      expect(typeof result.createdAt).toBe("string");
      expect(typeof result.updatedAt).toBe("string");
      expect(typeof result.assignments[0].startDate).toBe("string");
      expect(result.assignments[0].endDate).toBeNull();
    });

    it("異常系: 従業員が見つからない場合、HttpExceptionをスロー", async () => {
      // Repository層のモック: HttpException(404)をスロー
      (getEmployeeById as jest.Mock).mockRejectedValue(
        new HttpException(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGE_EMPLOYEE_NOT_FOUND, {
          employeeId: 9999,
        })
      );

      // アサーション: HttpExceptionがスローされる
      await expect(getEmployeeProfile(9999)).rejects.toThrow(HttpException);
      expect(getEmployeeById).toHaveBeenCalledWith(9999);
    });
  });
});
