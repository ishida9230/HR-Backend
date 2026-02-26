import { Repository, SelectQueryBuilder } from "typeorm";
import { AppDataSource } from "../../config/database";
import { Employee } from "../../entities/Employee";
import { getEmployeeById } from "../employee.repository";
import { mockEmployee } from "../../__tests__/helpers/mocks/employee.mock";
import HttpException from "../../exceptions/HttpException";
import { HTTP_STATUS, ERROR_MESSAGE_EMPLOYEE_NOT_FOUND } from "../../constants/error-messages";

// TypeORMのRepositoryとQueryBuilderをモック化
jest.mock("../../config/database");

describe("EmployeeRepository", () => {
  let mockRepository: jest.Mocked<Repository<Employee>>;
  let mockQueryBuilder: jest.Mocked<SelectQueryBuilder<Employee>>;

  beforeEach(() => {
    jest.clearAllMocks();

    // QueryBuilderのモック
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    } as any;

    // Repositoryのモック
    mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    } as any;

    // AppDataSource.getRepositoryをモック化
    (AppDataSource.getRepository as jest.Mock) = jest.fn().mockReturnValue(mockRepository);
  });

  describe("getEmployeeById", () => {
    it("正常系: 従業員エンティティを取得できる", async () => {
      // QueryBuilderのモック: 正常な従業員データを返却
      mockQueryBuilder.getOne = jest.fn().mockResolvedValue(mockEmployee);

      const result = await getEmployeeById(1);

      // アサーション
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.firstName).toBe("太郎");
      expect(result.lastName).toBe("山田");
      expect(result.isActive).toBe(true);
      expect(result.assignments).toHaveLength(2);

      // QueryBuilderが正しく呼ばれたことを確認
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith("employee");
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("employee.id = :id", {
        id: 1,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("employee.isActive = :isActive", {
        isActive: true,
      });
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(4);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("assignments.id", "ASC");
      expect(mockQueryBuilder.getOne).toHaveBeenCalledTimes(1);
    });

    it("正常系: isActive = trueの従業員のみ取得される", async () => {
      mockQueryBuilder.getOne = jest.fn().mockResolvedValue(mockEmployee);

      await getEmployeeById(1);

      // アサーション: isActive = trueの条件が追加されている
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith("employee.isActive = :isActive", {
        isActive: true,
      });
    });

    it("正常系: assignmentsがid順でソートされている", async () => {
      mockQueryBuilder.getOne = jest.fn().mockResolvedValue(mockEmployee);

      await getEmployeeById(1);

      // アサーション: assignmentsがid順でソートされている
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith("assignments.id", "ASC");
    });

    it("正常系: すべてのリレーションが取得される", async () => {
      mockQueryBuilder.getOne = jest.fn().mockResolvedValue(mockEmployee);

      await getEmployeeById(1);

      // アサーション: すべてのリレーションが取得される
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        "employee.assignments",
        "assignments"
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        "assignments.department",
        "department"
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        "assignments.branch",
        "branch"
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        "assignments.position",
        "position"
      );
    });

    it("異常系: 従業員が見つからない場合、HttpExceptionをスロー", async () => {
      // QueryBuilderのモック: nullを返却（従業員が見つからない）
      mockQueryBuilder.getOne = jest.fn().mockResolvedValue(null);

      // アサーション: HttpExceptionがスローされる
      await expect(getEmployeeById(9999)).rejects.toThrow(HttpException);

      try {
        await getEmployeeById(9999);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).status).toBe(HTTP_STATUS.NOT_FOUND);
        expect((error as HttpException).message).toBe(ERROR_MESSAGE_EMPLOYEE_NOT_FOUND);
      }
    });

    it("異常系: 非アクティブな従業員は取得できない", async () => {
      // QueryBuilderのモック: nullを返却（非アクティブな従業員は取得できない）
      mockQueryBuilder.getOne = jest.fn().mockResolvedValue(null);

      // アサーション: HttpExceptionがスローされる
      await expect(getEmployeeById(1000)).rejects.toThrow(HttpException);
    });
  });
});
