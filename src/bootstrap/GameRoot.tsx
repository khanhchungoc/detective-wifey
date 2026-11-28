import { lazy, Suspense, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PhoneShell } from '../shell';
import hoangWallpaperUrl from '../shell/assets/hoang-technosoft-selfie-wallpaper-v3.webp';
import { getAppDefinition, APP_REGISTRY, DOCK_APP_IDS, UPPER_GRID_APP_IDS, ALL_LAUNCHER_APP_IDS } from './appRegistry';
import { createAppContext } from './appContext';
import { getAvailableLevels, loadCaseByLevel, LevelSelectorSheet } from '../features/case-runtime';
import { LocalStorageAdapter, type GameStateRepository } from '../features/session';
import { PlaySession } from '../features/play-session';
import { SharedPinLockpad } from '../features/locks';

const WifeNotebookModal = lazy(() =>
  import('../features/wife-notebook').then(m => ({ default: m.WifeNotebookModal })),
);
import {
  GameStartupScreen,
  LevelSelectorHub,
  LevelContextBriefing,
  LevelSwitchConfirmModal,
  buildHusbandProfiles,
  buildLevelCards,
  buildCaseBriefing,
  buildLockscreenConfig,
} from '../features/game-flow';
import type { CaseConfig } from '../shared/contracts/case-schema';
import type { AppDefinition, AppId } from '../shared/contracts/app-contracts';
import type { GameFlowStage, LevelCardItem } from '../shared/contracts/game-flow';
import { appTransition, transition } from '../shared/motion/transition';
import { AnchoredOverlay } from '../shared/ui/AnchoredOverlay';
import { RetainedAppView } from './RetainedAppView';

export function GameRoot({ repository, initialCaseConfig, initialStage = 'startup' }: {
  repository?: GameStateRepository;
  initialCaseConfig?: CaseConfig;
  initialStage?: GameFlowStage;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [flowStage, setFlowStage] = useState<GameFlowStage>(initialStage);
  const [isMuted, setIsMuted] = useState(false);
  const [briefingRecallOpen, setBriefingRecallOpen] = useState(false);
  const [switchLevelConfirmOpen, setSwitchLevelConfirmOpen] = useState(false);
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
  const caseTitle = useMemo(() => {
    const match = getAvailableLevels(caseConfig.husbandId).find(lvl => lvl.caseId === caseConfig.caseId);
    return match?.levelTitle.replace(/^MÀN\s+\d+:\s*/i, '').trim() || `Hồ sơ ${caseConfig.husbandName}`;
  }, [caseConfig.caseId, caseConfig.husbandId, caseConfig.husbandName]);
  const activeApp = activeAppId !== 'home' ? getAppDefinition(activeAppId) ?? null : null;
  const contexts = useMemo(() => Object.fromEntries(Object.values(APP_REGISTRY)
    .map(app => [app.appId, createAppContext(caseConfig, app.appId)])), [caseConfig]);
  // Level-scoped app enablement: up to 12 apps displayed on SpringBoard, with out-of-scope apps disabled.
  const enabledAppIds = useMemo(() => new Set(
    (caseConfig.activeAppIds || [])
      .flatMap(id => id === 'comms' ? ['phone', 'messages'] : [id])
      .filter(id => !(caseConfig.grayedOutAppIds || []).includes(id as AppId))
  ), [caseConfig.activeAppIds, caseConfig.grayedOutAppIds]);

  const disabledAppIds = useMemo(() => (
    ALL_LAUNCHER_APP_IDS.filter(id => !enabledAppIds.has(id))
  ), [enabledAppIds]);

  const upper = useMemo(() => (
    UPPER_GRID_APP_IDS.map(getAppDefinition).filter((app): app is AppDefinition => Boolean(app))
  ), []);
  const dock = useMemo(() => (
    DOCK_APP_IDS.map(getAppDefinition).filter((app): app is AppDefinition => Boolean(app))
  ), []);

  const husbands = useMemo(() => buildHusbandProfiles(), []);
  const levelCards = useMemo(
    () => buildLevelCards(
      game.availableLevels(),
      state.playerProgress.unlockedLevel,
      state.playerProgress.bestStarRatings,
    ),
    [game, state.playerProgress.unlockedLevel, state.playerProgress.bestStarRatings],
  );
  const activeHusband = useMemo(
    () => husbands.find(h => h.husbandId === caseConfig.husbandId) ?? husbands[0],
    [husbands, caseConfig.husbandId],
  );
  const activeBriefing = useMemo(
    () => buildCaseBriefing(caseConfig, caseTitle, activeHusband),
    [caseConfig, caseTitle, activeHusband],
  );
  const lockscreenConfig = useMemo(
    () => buildLockscreenConfig(caseConfig, hoangWallpaperUrl, (appId) => {
      const def = APP_REGISTRY[appId];
      return def ? { appName: def.displayName, iconAsset: def.iconAsset, themeGradient: def.themeGradient } : undefined;
    }),
    [caseConfig],
  );

  const returnHome = () => {
    if (activeAppId !== 'home') appTransition('close', activeAppId, game.returnHome);
  };
  const launch = (id: AppId) => {
    if (id === activeAppId) return;
    if (disabledAppIds.includes(id)) {
      const def = getAppDefinition(id);
      game.notify(`${def?.displayName ?? id}: Tính năng đang phát triển cho các màn sau.`);
      return;
    }
    appTransition('open', id, () => game.launch(id));
  };

  const handleSelectLevelCard = (card: LevelCardItem) => {
    // The Màn 0 guide is not playable yet; the selector never emits it, this guards the contract.
    if (card.isGuide || card.comingSoon) return;
    if (game.selectLevel(card.levelNumber)) {
      setFlowStage('level-context');
    }
  };

  const stageTransition = prefersReducedMotion
    ? { duration: 0.12 }
    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const };

  const stageKey =
    flowStage === 'phone-lockscreen' || flowStage === 'phone-home'
      ? 'phone-stage'
      : flowStage;

  const earnedStars = useMemo(
    () => Object.values(state.playerProgress.bestStarRatings).reduce((sum, rating) => sum + rating, 0),
    [state.playerProgress.bestStarRatings],
  );
  const maxStars = useMemo(() => Math.max(1, game.availableLevels().length) * 3, [game]);

  return (
    <div className="w-full h-[100dvh] flex justify-center items-center overflow-hidden bg-game-backdrop">
      <AnimatePresence mode="wait">
        {flowStage === 'startup' ? (
          <motion.div
            key="startup"
            className="w-full h-full flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={stageTransition}
          >
            <GameStartupScreen
              preloadAssets={[husbands[0].portraitUrl, hoangWallpaperUrl]}
              hasOngoingGame={Boolean(state.ongoingSession)}
              ongoingLevelNumber={state.ongoingSession?.levelNumber}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(prev => !prev)}
              earnedStars={earnedStars}
              maxStars={maxStars}
              onContinue={() => {
                if (game.resumeOngoing()) {
                  setFlowStage('phone-home');
                }
              }}
              onStart={() => setFlowStage('level-selector')}
            />
          </motion.div>
        ) : flowStage === 'level-selector' ? (
          <motion.div
            key="level-selector"
            className="w-full h-full flex justify-center"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={stageTransition}
          >
            <LevelSelectorHub
              husbands={husbands}
              levels={levelCards}
              initialHusbandId={caseConfig.husbandId}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(prev => !prev)}
              onSelectLevel={handleSelectLevelCard}
            />
          </motion.div>
        ) : flowStage === 'level-context' ? (
          <motion.div
            key="level-context"
            className="w-full h-full flex justify-center"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={stageTransition}
          >
            <LevelContextBriefing
              briefing={activeBriefing}
              mode="entry"
              onBack={() => setFlowStage('level-selector')}
              onStartInvestigation={() => setFlowStage('phone-lockscreen')}
            />
          </motion.div>
        ) : (
          <motion.div
            key={stageKey}
            className="w-full h-full flex justify-center"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={stageTransition}
          >
            <PhoneShell
              key={`${caseConfig.caseId}:${state.appSessionId}`}
              deviceMetadata={caseConfig.deviceMetadata}
              activeAppId={activeAppId} activeAppDefinition={activeApp}
              activeUpperApps={upper} activeDockApps={dock}
              grayedOutAppIds={disabledAppIds}
              systemAlertToast={state.systemAlertToast}
              onLaunchApp={launch} onReturnHome={returnHome} onRestartLevel={game.restart}
              onOpenNotebook={() => setOpenNotebookCase(caseConfig.caseId)}
              onCloseNotebook={() => setOpenNotebookCase(null)}
              notebookOpen={notebookOpen}
              notebookEvidenceCount={state.taggedSuspects.length}
              notebookCaseNumber={caseConfig.levelNumber}
              onNotify={game.notify}
              isLocked={flowStage === 'phone-lockscreen'}
              lockscreenConfig={lockscreenConfig}
              currentStrikes={state.strikes}
              maxStrikes={caseConfig.allowedStrikes}
              onUnlockPhone={(targetAppId) => {
                setFlowStage('phone-home');
                if (targetAppId && enabledAppIds.has(targetAppId as AppId)) {
                  launch(targetAppId as AppId);
                }
              }}
              onLockscreenPasscodeFail={game.failChallenge}
              onOpenBriefing={() => setBriefingRecallOpen(true)}
              onRequestLevelSelector={() => setSwitchLevelConfirmOpen(true)}
              renderLevelSelector={onClose => <LevelSelectorSheet levels={game.availableLevels()}
                activeLevelNumber={caseConfig.levelNumber} unlockedMaxLevel={state.playerProgress.unlockedLevel}
                starRatings={state.playerProgress.bestStarRatings}
                onSelectLevel={level => { if (game.selectLevel(level)) onClose(); }} onClose={onClose} />}
              overlays={<>
                <AnchoredOverlay key={caseConfig.caseId} open={notebookOpen} anchorSelector="[data-notebook-tab]"
                  label="Bảng bằng chứng" onClose={() => setOpenNotebookCase(null)}>
                <Suspense fallback={null}>
                <WifeNotebookModal
                  caseId={caseConfig.caseId}
                  caseTitle={caseTitle}
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
                </Suspense>
                </AnchoredOverlay>
                {briefingRecallOpen && (
                  <LevelContextBriefing
                    briefing={activeBriefing}
                    mode="recall"
                    onClose={() => setBriefingRecallOpen(false)}
                  />
                )}
                <LevelSwitchConfirmModal
                  isOpen={switchLevelConfirmOpen}
                  onStay={() => setSwitchLevelConfirmOpen(false)}
                  onConfirm={() => {
                    setSwitchLevelConfirmOpen(false);
                    setOpenNotebookCase(null);
                    void game.restart();
                    setFlowStage('level-selector');
                  }}
                />
                {pendingChallenge && <SharedPinLockpad key={`${caseConfig.caseId}:${pendingChallenge.challenge.challengeId}`}
                  appName={pendingChallenge.appName} targetChallengeId={pendingChallenge.challenge.challengeId}
                  expectedPin={pendingChallenge.challenge.expectedAnswer} currentStrikes={state.strikes}
                  maxStrikes={caseConfig.allowedStrikes} onSuccess={id => transition('sheet-out', () => game.solveChallenge(id))}
                  onFailStrike={game.failChallenge} onCancel={() => transition('sheet-out', game.cancelChallenge)} />}
              </>}
            >
              {Object.values(APP_REGISTRY).map(({ appId, component: AppComponent }) => <RetainedAppView
                key={appId} active={activeAppId === appId}>
                <AppComponent key={appId === 'messages' ? currentMessageRoute?.request : undefined} caseData={contexts[appId]}
                onTagSuspect={game.tag} onReturnHome={returnHome} onRequestUnlock={id => transition('sheet-in', () => game.requestUnlock(id))}
                unlockedChallenges={state.unlockedChallenges}
                initialThreadId={appId === 'messages' ? currentMessageRoute?.threadId : undefined}
                onOpenMessages={threadId => {
                  if (!enabledAppIds.has('messages')) return false;
                  transition('push', () => {
                    setMessageRoute(route => ({ sessionId: state.appSessionId, threadId, request: (route?.request ?? 0) + 1 }));
                    game.launch('messages');
                  });
                  return true;
                }} />
              </RetainedAppView>)}
            </PhoneShell>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
