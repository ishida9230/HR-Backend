import { NextFunction, Request, Response } from "express";
import { getPositions } from "../services/position.service";

/**
 * GET /api/positions
 * 役職一覧取得ハンドラー
 */
export async function getPositionsHandler(
  _request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    const positions = await getPositions();
    response.status(200).json(positions);
  } catch (error) {
    next(error);
  }
}
