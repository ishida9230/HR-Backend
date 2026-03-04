/**
 * Requestエンティティのモックデータ
 */
import { Request } from "../../../entities/Request";
import { RequestItem } from "../../../entities/RequestItem";
import { RequestStatus } from "../../../entities/Request";
import { Employee } from "../../../entities/Employee";

/**
 * モック変更申請データ（正常系）
 */
export const mockRequest: Request = {
  id: 1,
  employeeId: 1,
  status: RequestStatus.PENDING_MANAGER,
  text: "住所変更のため申請します",
  submittedAt: new Date("2024-01-15T10:00:00.000Z"),
  completedAt: null,
  isHidden: false,
  createdAt: new Date("2024-01-15T10:00:00.000Z"),
  updatedAt: new Date("2024-01-15T10:00:00.000Z"),
  employee: {} as Employee,
  items: [
    {
      id: 1,
      requestId: 1,
      fieldKey: "address",
      oldValue: "東京都千代田区千代田1-1",
      newValue: "東京都港区六本木1-1",
      createdAt: new Date("2024-01-15T10:00:00.000Z"),
      request: {} as Request,
    } as RequestItem,
    {
      id: 2,
      requestId: 1,
      fieldKey: "postalCode",
      oldValue: "100-0001",
      newValue: "106-0032",
      createdAt: new Date("2024-01-15T10:00:00.000Z"),
      request: {} as Request,
    } as RequestItem,
  ],
  approvalSteps: [],
};

/**
 * モック変更申請データ（アイテムなし）
 */
export const mockRequestWithoutItems: Request = {
  ...mockRequest,
  items: [],
};
