import { useMotionState } from '../../../shared/motion/useMotionState';
import { type ReactNode } from 'react';
import { IoChevronBack } from 'react-icons/io5';
import { StoryEvidenceTarget, UniversalEvidenceModal, type UniversalEvidenceItem } from '../../../features/investigation';
import type { VirtualAppProps, AppId } from '../../../shared/contracts/app-contracts';
import type { NarrativeRecord } from '../data';
import { ContactAvatar } from '../../../shared/ui/ContactAvatar';

export function CommunicationHeader({ title, backLabel = 'Quay lại', onBack, avatarName }: { title: string; backLabel?: string; onBack?: () => void; avatarName?: string }) {
  return <header className="communication-header">{onBack ? <button type="button" onClick={onBack}><IoChevronBack aria-hidden="true" />{backLabel}</button> : <span className="communication-header-spacer" />}<div className="communication-header-title flex min-w-0 flex-1 items-center justify-center gap-2">{avatarName && <ContactAvatar name={avatarName} size={32} />}<h1 className="min-w-0">{title}</h1></div><span className="communication-header-spacer" /></header>;
}
export function useCommunicationEvidence(caseId: string, onTagSuspect: VirtualAppProps['onTagSuspect'], appId: AppId) {
  const [item, setItem] = useMotionState<UniversalEvidenceItem | null>(null, 'sheet');
  const wrap = (
    row: NarrativeRecord,
    title: string,
    snippet: string,
    children: ReactNode,
    extra?: Partial<UniversalEvidenceItem>
  ) => (
    <StoryEvidenceTarget
      item={{
        title,
        snippet,
        suspectToTag: row.suspectName || title,
        ...extra,
        source: {
          caseId,
          recordId: row.id,
          clueRefId: row.clueRefId || undefined,
          title,
          snippet,
          ...extra,
        },
      }}
      onTriggerEvidence={setItem}
    >
      {children}
    </StoryEvidenceTarget>
  );
  return {
    wrap,
    setItem,
    active: Boolean(item),
    modal: (
      <UniversalEvidenceModal
        isOpen={Boolean(item)}
        item={item}
        onClose={() => setItem(null)}
        onPinEvidence={(name) => onTagSuspect(name, appId, item?.source)}
      />
    ),
  };
}
export function EmptyState({ children }: { children: ReactNode }) { return <p className="communication-empty">{children}</p>; }
