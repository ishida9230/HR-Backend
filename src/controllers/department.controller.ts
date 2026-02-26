import { NextFunction, Request, Response } from "express";
import { getDepartments } from "../services/department.service";

/**
 * GET /api/departments
 * 部署一覧取得ハンドラー
 */
export async function getDepartmentsHandler(
  _request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const departments = await getDepartments();
    response.status(200).json(departments);
  } catch (error) {
    next(error);
  }
}
