import { NextFunction, Request, Response } from "express";
import { getBranches } from "../services/branch.service";

/**
 * GET /api/branches
 * 支店一覧取得ハンドラー
 */
export async function getBranchesHandler(
  _request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const branches = await getBranches();
    response.status(200).json(branches);
  } catch (error) {
    next(error);
  }
}
