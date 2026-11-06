import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { PhoneShell } from '../shell';
import { getAppDefinition, APP_REGISTRY, DOCK_APP_IDS } from './appRegistry';
import { createAppContext } from './appContext';
import { getAvailableLevels, loadCaseByLevel, LevelSelectorSheet } from '../features/case-runtime';
import { LocalStorageAdapter, ResumeSessionModal, type GameStateRepository } from '../features/session';
import { PlaySession } from '../features/play-session';
import { SharedPinLockpad } from '../features/locks';
import { WifeNotebookModal } from '../features/wife-notebook';
import type { CaseConfig } from '../shared/contracts/case-schema';
import type { AppId } from '../shared/contracts/app-contracts';
import { appTransition, transition } from '../shared/motion/transition';
import { AnchoredOverlay } from '../shared/ui/AnchoredOverlay';
import { RetainedAppView } from './RetainedAppView';

export function GameRoot({ repository, initialCaseConfig }: {
  repository?: GameStateRepository; initialCaseConfig?: CaseConfig;
}) {
  const [openNotebookCase, setOpenNotebookCase] = useState<string | null>(null);
  const [messageRoute, setMessageRoute] = useState<{ sessionId: number; threadId: string; request: number } | null>(null);
  const [game] = useState(() => new PlaySession({
    repository: repository ?? new LocalStorageAdapter(), loadCaseByLevel, getAvailableLevels, getAppDefinition,
    now: Date.now,
    schedule: (callback, delay) => { const timer = setTimeout(callback, delay); return () => clearTimeout(timer); },
    onCaught: () => window.alert('CHỒNG ĐÃ PHÁT HIỆN BẠN ĐANG LÉN XEM ĐIỆN THOẠI! Màn chơi sẽ được khởi động lại.'),
  }, initialCaseConfig));
  const state = useSyncExternalStore(game.subscribe, game.getSnapshot, game.getSnapshot);
  useEffect(() => { void game.initialize(); return game.stop; }, [game]);
  const { caseConfig, activeAppId, pendingChallenge } = state;
  const currentMessageRoute = messageRoute?.sessionId === state.appSessionId ? messageRoute : null;
  const notebookOpen = openNotebookCase === caseConfig.caseId;
  const activeApp = activeAppId !== 'home' ? getAppDefinition(activeAppId) ?? null : null;
  const contexts = useMemo(() => Object.fromEntries(Object.values(APP_REGISTRY)
    .map(app => [app.appId, createAppContext(caseConfig, app.appId)])), [caseConfig]);
  // Preserve the current level-based provisioning pending the documented launcher decision.
  const provisioned = caseConfig.activeAppIds || ['ecommerce', 'internet-messaging', 'banking', 'photos', 'comms'];
  const appIds = [...new Set(provisioned.flatMap(id => id === 'comms' ? ['phone', 'messages'] : [id]))];
  const dock = DOCK_APP_IDS.map(getAppDefinition).filter(app => app !== undefined);
  const upper = appIds.filter(id => !DOCK_APP_IDS.includes(id as AppId))
    .map(id => getAppDefinition(id as AppId)).filter(app => app !== undefined);
  const returnHome = () => {
    if (activeAppId !== 'home') appTransition('close', activeAppId, game.returnHome);
  };
  const launch = (id: AppId) => {
    if (id === activeAppId) return;
    if (caseConfig.grayedOutAppIds?.includes(id)) {
      const def = getAppDefinition(id);
      game.notify(`${def?.displayName ?? id}: Tính năng đang phát triển cho các màn sau.`);
      return;
    }
    appTransition('open', id, () => game.launch(id));
  };

  return <PhoneShell
    key={`${caseConfig.caseId}:${state.appSessionId}`}
    deviceMetadata={caseConfig.deviceMetadata}
    activeAppId={activeAppId} activeAppDefinition={activeApp}
    activeUpperApps={upper} activeDockApps={dock}
    grayedOutAppIds={caseConfig.grayedOutAppIds}
    systemAlertToast={state.systemAlertToast}
    onLaunchApp={launch} onReturnHome={returnHome} onRestartLevel={game.restart}
    onOpenNotebook={() => setOpenNotebookCase(caseConfig.caseId)}
    onCloseNotebook={() => setOpenNotebookCase(null)}
    notebookOpen={notebookOpen}
    onNotify={game.notify}
    renderLevelSelector={onClose => <LevelSelectorSheet levels={game.availableLevels()}
      activeLevelNumber={caseConfig.levelNumber} unlockedMaxLevel={state.playerProgress.unlockedLevel}
      starRatings={state.playerProgress.bestStarRatings}
      onSelectLevel={level => { if (game.selectLevel(level)) onClose(); }} onClose={onClose} />}
    overlays={<>
      <AnchoredOverlay key={caseConfig.caseId} open={notebookOpen} anchorSelector="[data-notebook-tab]"
        label="Sổ tay của vợ" onClose={() => setOpenNotebookCase(null)}>
      <WifeNotebookModal
        caseId={caseConfig.caseId}
        caseConfig={caseConfig}
        knowledgeGraph={caseConfig.knowledgeGraph}
        currentStrikes={state.strikes}
        maxStrikes={caseConfig.allowedStrikes}
        getSourceApp={id => APP_REGISTRY[id]}
        taggedSuspects={state.taggedSuspects}
        isOpen={notebookOpen}
        onClose={() => setOpenNotebookCase(null)}
        onReturnHome={() => {
          setOpenNotebookCase(null);
          returnHome();
        }}
        onNavigateToSource={(appId) => {
          setOpenNotebookCase(null);
          launch(appId);
        }}
        onUpdateTaggedSuspects={game.updateTaggedSuspects}
        onApplyConfrontationStrike={game.applyConfrontationPenalty}
        onConfrontationVictory={game.recordConfrontationVerdict}
        onNextLevel={game.forgiveAndAdvanceLevel}
      />
      </AnchoredOverlay>
      {pendingChallenge && <SharedPinLockpad key={`${caseConfig.caseId}:${pendingChallenge.challenge.challengeId}`}
        appName={pendingChallenge.appName} targetChallengeId={pendingChallenge.challenge.challengeId}
        expectedPin={pendingChallenge.challenge.expectedAnswer} currentStrikes={state.strikes}
        maxStrikes={caseConfig.allowedStrikes} onSuccess={id => transition('sheet-out', () => game.solveChallenge(id))}
        onFailStrike={game.failChallenge} onCancel={() => transition('sheet-out', game.cancelChallenge)} />}
      {state.resumableSession && <ResumeSessionModal session={state.resumableSession}
        onResume={() => transition('fade', game.resume)} onRestart={() => transition('fade', game.restart)} />}
    </>}
  >
    {Object.values(APP_REGISTRY).map(({ appId, component: AppComponent }) => <RetainedAppView
      key={appId} active={activeAppId === appId}>
      <AppComponent key={appId === 'messages' ? currentMessageRoute?.request : undefined} caseData={contexts[appId]}
      onTagSuspect={game.tag} onReturnHome={returnHome} onRequestUnlock={id => transition('sheet-in', () => game.requestUnlock(id))}
      unlockedChallenges={state.unlockedChallenges}
      initialThreadId={appId === 'messages' ? currentMessageRoute?.threadId : undefined}
      onOpenMessages={threadId => {
        if (!appIds.includes('messages')) return false;
        transition('push', () => {
          setMessageRoute(route => ({ sessionId: state.appSessionId, threadId, request: (route?.request ?? 0) + 1 }));
          game.launch('messages');
        });
        return true;
      }} />
    </RetainedAppView>)}
  </PhoneShell>;
}
