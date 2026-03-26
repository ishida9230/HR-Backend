import { Repository, EntityManager } from "typeorm";
import { AppDataSource } from "../config/database";
import { ApprovalStep, StepType, ApprovalStatus } from "../entities/ApprovalStep";

/**
 * 承認ステップリポジトリを取得
 */
function getApprovalStepRepository(manager?: EntityManager): Repository<ApprovalStep> {
  if (manager) {
    return manager.getRepository(ApprovalStep);
  }
  return AppDataSource.getRepository(ApprovalStep);
}

/**
 * 申請IDに紐づく承認ステップを取得（ステップ順序でソート）
 * @param requestId 申請ID
 * @param manager トランザクション用のEntityManager（オプション）
 * @returns 承認ステップの配列
 */
export async function getApprovalStepsByRequestId(
  requestId: number,
  manager?: EntityManager
): Promise<ApprovalStep[]> {
  const approvalStepRepository = getApprovalStepRepository(manager);
  return await approvalStepRepository.find({
    where: { requestId },
    relations: ["actedByEmployee"],
    order: { stepOrder: "ASC" },
  });
}

/**
 * 申請IDとステップタイプに紐づく承認ステップを取得
 * @param requestId 申請ID
 * @param stepType ステップタイプ
 * @param manager トランザクション用のEntityManager（オプション）
 * @returns 承認ステップエンティティまたはnull
 */
export async function getApprovalStepByRequestIdAndStepType(
  requestId: number,
  stepType: StepType,
  manager?: EntityManager
): Promise<ApprovalStep | null> {
  const approvalStepRepository = getApprovalStepRepository(manager);
  return await approvalStepRepository.findOne({
    where: { requestId, stepType },
    relations: ["actedByEmployee"],
  });
}

/**
 * 前回の承認ステップを取得（最新の承認済みまたは差し戻し済みのステップ）
 * @param requestId 申請ID
 * @param manager トランザクション用のEntityManager（オプション）
 * @returns 前回の承認ステップエンティティまたはnull
 */
export async function getPreviousApprovalStep(
  requestId: number,
  manager?: EntityManager
): Promise<ApprovalStep | null> {
  const approvalStepRepository = getApprovalStepRepository(manager);
  const steps = await approvalStepRepository.find({
    where: { requestId },
    relations: ["actedByEmployee"],
    order: { stepOrder: "DESC", actedAt: "DESC" },
  });

  // 承認済みまたは差し戻し済みのステップを探す
  return (
    steps.find(
      (step) =>
        step.status === ApprovalStatus.APPROVED || step.status === ApprovalStatus.CHANGES_REQUESTED
    ) || null
  );
}

/**
 * 承認ステップを作成または更新
 * @param stepData 承認ステップデータ
 * @param manager トランザクション用のEntityManager（オプション）
 * @returns 作成または更新された承認ステップエンティティ
 */
export async function saveApprovalStep(
  stepData: {
    requestId: number;
    stepOrder: number;
    stepType: StepType;
    status: ApprovalStatus;
    actedByEmployeeId: number | null;
    comment: string | null;
    actedAt: Date | null;
  },
  manager?: EntityManager
): Promise<ApprovalStep> {
  const approvalStepRepository = getApprovalStepRepository(manager);
  const existingStep = await approvalStepRepository.findOne({
    where: { requestId: stepData.requestId, stepType: stepData.stepType },
  });

  if (existingStep) {
    // 既存のステップを更新
    existingStep.status = stepData.status;
    existingStep.actedByEmployeeId = stepData.actedByEmployeeId;
    existingStep.comment = stepData.comment;
    existingStep.actedAt = stepData.actedAt;
    return await approvalStepRepository.save(existingStep);
  } else {
    // 新しいステップを作成
    const step = approvalStepRepository.create(stepData);
    return await approvalStepRepository.save(step);
  }
}
