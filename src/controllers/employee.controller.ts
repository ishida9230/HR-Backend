import { NextFunction, Request, Response } from "express";
import { getEmployeeProfile } from "../services/employee.service";
import HttpException from "../exceptions/HttpException";
import { HTTP_STATUS, ERROR_MESSAGE_INVALID_EMPLOYEE_ID } from "../constants/error-messages";

/**
 * GET /api/employees/:id
 * 従業員プロフィール取得ハンドラー
 */
export async function getEmployeeProfileHandler(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(request.params.id, 10);

    // バリデーション: 従業員IDが正の整数であることを確認
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
      next(
        new HttpException(HTTP_STATUS.BAD_REQUEST, ERROR_MESSAGE_INVALID_EMPLOYEE_ID, {
          employeeId: request.params.id,
        })
      );
      return;
    }

    // サービス層でプロフィール取得（ビジネスロジック含む）
    const profile = await getEmployeeProfile(id);

    // 成功レスポンス
    response.status(200).json(profile);
  } catch (error) {
    next(error);
  }
}
