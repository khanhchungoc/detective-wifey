import type { AppCaseContext, AppId } from '../shared/contracts/app-contracts';
import type { CaseConfig } from '../shared/contracts/case-schema';
import { getAppDefinition } from './appRegistry';

/** Project only this app's payloads and public narrative context into its host contract. */
export function createAppContext(config: CaseConfig, appId: AppId): AppCaseContext {
  return {
    caseId: config.caseId, husband: config.husband, levelNumber: config.levelNumber,
    suspectPool: config.suspectPool,
    lockChallenges: config.lockChallenges.map(challenge => ({
      challengeId: challenge.challengeId, targetType: challenge.targetType,
      targetId: challenge.targetId, lockType: challenge.lockType,
      clueSourceApp: challenge.clueSourceApp, promptQuestion: challenge.promptQuestion,
    })),
    appsData: Object.fromEntries((getAppDefinition(appId)?.dataKeys ?? [appId])
      .filter(key => key in config.appsData).map(key => [key, config.appsData[key]])),
  };
}
