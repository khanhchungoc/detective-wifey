import React, { useId, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  IoAlertCircleOutline,
  IoArrowForwardOutline,
  IoCallOutline,
  IoChatbubbleEllipsesOutline,
  IoCheckmarkCircleOutline,
  IoCompassOutline,
  IoGitNetworkOutline,
  IoJournalOutline,
  IoPinOutline,
  IoRefreshOutline,
  IoStar,
  IoTrophyOutline,
} from 'react-icons/io5';
import { useDialogFocus } from '../../shared/ui/useDialogFocus';
import type { TutorialPopupGuideProps, TutorialStepId } from './types';

interface StarRuleRow {
  stars: 1 | 2 | 3;
  label: string;
  description: string;
}

interface StepHeaderMeta {
  eyebrow: string;
  title: string;
}

const GOAL_STEPS: readonly string[] = [
  'Lướt các ứng dụng trên máy để tìm chi tiết lạ',
  'Nhấn giữ vào thông tin nghi ngờ để ghim lại',
  'Vào Sổ tay nối các manh mối khớp nhau',
  'Bấm Đối chất để hỏi thẳng mặt anh ấy',
];

const STAR_RULES: readonly StarRuleRow[] = [
  {
    stars: 1,
    label: '1 sao',
    description: 'Mới nối 1 cặp bằng chứng, chưa đủ ép nhận hết',
  },
  {
    stars: 2,
    label: '2 sao',
    description: 'Đủ chứng cứ thuyết phục',
  },
  {
    stars: 3,
    label: '3 sao',
    description: 'Nối đủ toàn bộ bằng chứng chốt, bắt gọn tại trận',
  },
];

const STEP_HEADER_META: Record<Exclude<TutorialStepId, 'complete'>, StepHeaderMeta> = {
  goal: {
    eyebrow: 'Bước 1 / 8',
    title: 'Chào mừng thám tử',
  },
  open_messages: {
    eyebrow: 'Bước 2 / 8',
    title: 'Có tin nhắn lạ',
  },
  pin_message: {
    eyebrow: 'Bước 3 / 8',
    title: 'Ghim manh mối đầu tiên',
  },
  open_phone: {
    eyebrow: 'Bước 4 / 8',
    title: 'Kiểm tra danh bạ',
  },
  open_notebook: {
    eyebrow: 'Bước 5 / 8',
    title: 'Mở Sổ tay điều tra',
  },
  connect_alias: {
    eyebrow: 'Bước 6 / 8',
    title: 'Nối dây vạch mặt',
  },
  independent_alibi: {
    eyebrow: 'Bước 6 / 8',
    title: 'Tự tìm bằng chứng nói dối',
  },
  confrontation_rules: {
    eyebrow: 'Bước 7 / 8',
    title: 'Chuẩn bị Đối chất',
  },
};

function isCenteredStep(step: TutorialStepId): boolean {
  return step === 'goal' || step === 'confrontation_rules' || step === 'complete';
}

function getPrimaryActionLabel(step: Exclude<TutorialStepId, 'complete'>): string {
  if (step === 'goal') {
    return 'Bắt đầu thôi';
  }
  if (step === 'confrontation_rules') {
    return 'Vào hỏi tội thôi';
  }
  return 'Đã hiểu';
}

function renderStepIcon(step: TutorialStepId): React.ReactElement {
  const iconClass = 'h-[18px] w-[18px] shrink-0 text-game-text';
  switch (step) {
    case 'goal':
      return <IoCompassOutline aria-hidden="true" className={iconClass} />;
    case 'open_messages':
      return <IoChatbubbleEllipsesOutline aria-hidden="true" className={iconClass} />;
    case 'pin_message':
      return <IoPinOutline aria-hidden="true" className={iconClass} />;
    case 'open_phone':
      return <IoCallOutline aria-hidden="true" className={iconClass} />;
    case 'open_notebook':
      return <IoJournalOutline aria-hidden="true" className={iconClass} />;
    case 'connect_alias':
    case 'independent_alibi':
      return <IoGitNetworkOutline aria-hidden="true" className={iconClass} />;
    case 'confrontation_rules':
      return <IoTrophyOutline aria-hidden="true" className={iconClass} />;
    case 'complete':
      return <IoCheckmarkCircleOutline aria-hidden="true" className="h-8 w-8 text-game-emerald" />;
  }
}

function renderStarIcons(count: 1 | 2 | 3): React.ReactElement {
  return (
    <span className="inline-flex w-14 shrink-0 items-center gap-0.5 text-game-amber" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <IoStar key={index} className="h-3.5 w-3.5 shrink-0" />
      ))}
    </span>
  );
}

export const TutorialPopupGuide: React.FC<TutorialPopupGuideProps> = ({
  step,
  visible,
  onDismiss,
  onSkipGuide,
  onEnterLevel1,
  onReplayLevel0,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const shouldReduceMotion = useReducedMotion();
  const isOpen = visible && step !== null;
  const handleKeyDown = useDialogFocus(isOpen, dialogRef, onDismiss);

  if (!isOpen || !step) {
    return null;
  }

  const centered = isCenteredStep(step);

  const cardMotionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: centered ? 8 : 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      data-tutorial-step={step}
      className={`fixed inset-0 z-[85] flex justify-center px-4 font-sans ${
        centered ? 'items-center bg-black/35' : 'items-end bg-black/15 pb-8'
      }`}
    >
      <motion.div
        {...cardMotionProps}
        className="w-full max-w-[342px] rounded-2xl border border-white/10 bg-game-dossier p-5 text-game-text shadow-2xl"
      >
        {step === 'complete' ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-game-elevated">
              {renderStepIcon('complete')}
            </div>
            <h2 id={titleId} className="text-ios-title-3 font-semibold text-game-text">
              Xuất sắc, xong Màn 0
            </h2>
            <p className="mt-2 text-ios-subheadline text-game-text-secondary">
              Bạn đã nắm trọn 4 bước điều tra: Xem - Ghim - Nối dây - Đối chất.
            </p>

            <div className="mt-4 w-full rounded-xl border border-white/10 bg-game-elevated p-3.5 text-left">
              <div className="mb-1 flex items-center gap-2 text-game-text">
                <IoAlertCircleOutline aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-game-amber" />
                <span className="text-ios-footnote font-semibold">Nhắc nhỏ trước khi vào Màn 1</span>
              </div>
              <p className="text-ios-footnote text-game-text-secondary">
                Hỏi tội khi chưa đủ chứng cứ sẽ bị trừ điểm tin tưởng. Nhớ nối đủ các cặp bằng chứng chốt để gom trọn 3 sao nhé.
              </p>
            </div>

            <div className="mt-5 flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={onEnterLevel1}
                className="touch-target-min min-h-[48px] w-full inline-flex items-center justify-center gap-2 rounded-xl bg-game-crimson px-4 py-3 text-ios-headline text-game-text active:scale-[0.98] active:opacity-85 transition-[transform,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70"
              >
                <span>Vào Màn 1 ngay</span>
                <IoArrowForwardOutline aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
              </button>
              <button
                type="button"
                onClick={onReplayLevel0}
                className="touch-target-min min-h-[44px] w-full inline-flex items-center justify-center gap-2 rounded-xl border-0 bg-transparent px-4 py-2 text-ios-subheadline font-medium text-game-text-secondary hover:text-game-text active:opacity-75 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                <IoRefreshOutline aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                <span>Chơi lại Màn 0</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <StepHeader step={step} titleId={titleId} />
            <div className="mt-3 text-ios-subheadline leading-relaxed text-game-text-secondary">
              <StepBody step={step} />
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onSkipGuide}
                className="touch-target-min border-0 bg-transparent px-2 min-h-[44px] text-ios-subheadline font-medium text-game-text-secondary hover:text-game-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-lg"
              >
                Bỏ qua
              </button>
              <button
                type="button"
                onClick={onDismiss}
                className="touch-target-min min-h-[44px] min-w-[112px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-game-crimson px-4 py-2.5 text-ios-subheadline font-semibold text-game-text active:scale-[0.98] active:opacity-85 transition-[transform,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70"
              >
                <span>{getPrimaryActionLabel(step)}</span>
                {step === 'goal' || step === 'confrontation_rules' ? (
                  <IoArrowForwardOutline aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
                ) : null}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

interface StepHeaderProps {
  step: Exclude<TutorialStepId, 'complete'>;
  titleId: string;
}

const StepHeader: React.FC<StepHeaderProps> = ({ step, titleId }) => {
  const meta = STEP_HEADER_META[step];

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-game-elevated">
        {renderStepIcon(step)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-ios-caption-1 font-medium tabular-nums text-game-text-muted">
          {meta.eyebrow}
        </p>
        <h2 id={titleId} className="text-ios-headline font-semibold text-game-text">
          {meta.title}
        </h2>
      </div>
    </div>
  );
};

const StepBody: React.FC<{ step: Exclude<TutorialStepId, 'complete'> }> = ({ step }) => {
  switch (step) {
    case 'goal':
      return (
        <div>
          <p className="text-ios-subheadline text-game-text">
            Chồng bạn có vẻ đang giấu chuyện gì đó trong điện thoại. Mình cùng kiểm tra nhẹ 4 bước nhé:
          </p>
          <ol className="mt-3 space-y-2 rounded-xl border border-white/10 bg-game-elevated p-3 text-ios-footnote text-game-text-secondary">
            {GOAL_STEPS.map((line, index) => (
              <li key={line} className="flex items-start gap-2.5">
                <span className="w-4 shrink-0 font-semibold tabular-nums text-game-text">
                  {index + 1}.
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    case 'open_messages':
      return (
        <p>
          Vừa có tin nhắn từ <span className="font-semibold text-game-text">&quot;Tùng Gara&quot;</span> nghe hơi sai sai. Bạn mở mục <span className="font-semibold text-game-text">Tin nhắn</span> (biểu tượng xanh lá) rồi chạm vào cuộc trò chuyện của <span className="font-semibold text-game-text">&quot;Tùng Gara&quot;</span> xem sao nhé.
        </p>
      );
    case 'pin_message':
      return (
        <p>
          Mở cuộc trò chuyện <span className="font-semibold text-game-text">&quot;Tùng Gara&quot;</span>, thấy dòng nào đáng nghi thì bạn cứ <span className="font-semibold text-game-text">nhấn giữ</span> vào đó một chút, rồi bấm <span className="font-semibold text-game-text">Ghim</span> để lưu vào Sổ tay nhé.
        </p>
      );
    case 'open_phone':
      return (
        <p>
          Chuẩn rồi. Giờ bạn <span className="font-semibold text-game-text">chạm thanh ngang dưới cùng</span> để về màn hình chính, mở <span className="font-semibold text-game-text">Điện thoại</span> -&gt; chọn tab <span className="font-semibold text-game-text">Danh bạ</span> -&gt; chạm <span className="font-semibold text-game-text">&quot;Tùng Gara&quot;</span>. Xem mục <span className="font-semibold text-game-text">Ghi chú</span> rồi nhấn giữ vào đó để ghim lại nhé.
        </p>
      );
    case 'open_notebook':
      return (
        <p>
          Có 2 manh mối rồi nè. Bạn chạm vào <span className="font-semibold text-game-text">biểu tượng cuốn sổ có số đỏ ở mép phải màn hình</span> để mở Sổ tay ghép chứng cứ nhé.
        </p>
      );
    case 'connect_alias':
      return (
        <p>
          Hai thẻ này đang khớp nhau đấy. Bạn <span className="font-semibold text-game-text">chạm vào thẻ thứ nhất, rồi chạm tiếp vào thẻ thứ hai</span> để nối dây lột trần danh tính thật của <span className="font-semibold text-game-text">&quot;Tùng Gara&quot;</span>.
        </p>
      );
    case 'independent_alibi':
      return (
        <div>
          <p className="text-ios-subheadline text-game-text">
            Hay quá, <span className="font-semibold">&quot;Tùng Gara&quot;</span> hóa ra là <span className="font-semibold">Lê Ngọc Vy</span>. Giờ đến lượt bạn tự trổ tài nhé:
          </p>
          <ul className="mt-2.5 space-y-2 rounded-xl border border-white/10 bg-game-elevated p-3 text-ios-footnote text-game-text-secondary">
            <li>
              - Bấm <span className="font-semibold text-game-text">&lt; góc dưới trái</span> để quay lại điện thoại.
            </li>
            <li>
              - Tìm tin nhắn chồng bảo <span className="font-semibold text-game-text">&quot;đang ngồi công ty&quot;</span> (trong mục <span className="font-semibold text-game-text">Vợ</span>) và bức ảnh quán cà phê trong <span className="font-semibold text-game-text">Ảnh (Photos)</span> (bấm biểu tượng <span className="font-semibold text-game-text">i</span> góc trên phải để xem địa điểm).
            </li>
            <li>
              - Ghim cả 2, nối dây trong Sổ tay rồi bấm nút đỏ <span className="font-semibold text-game-text">Đối chất</span> ở góc dưới phải.
            </li>
          </ul>
        </div>
      );
    case 'confrontation_rules':
      return (
        <div>
          <p className="text-ios-subheadline text-game-text">
            Chọn câu hỏi khớp với dây bằng chứng bạn vừa nối để chồng hết đường chối cãi nhé.
          </p>
          <div className="mt-3 rounded-xl border border-white/10 bg-game-elevated p-3">
            <p className="text-ios-footnote font-semibold text-game-text">
              Cách tính sao (từ Màn 1 trở đi)
            </p>
            <ul className="mt-2 space-y-2 text-ios-footnote text-game-text-secondary">
              {STAR_RULES.map((rule) => (
                <li key={rule.stars} className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0">{renderStarIcons(rule.stars)}</span>
                  <span>
                    <span className="font-semibold text-game-text">{rule.label}:</span> {rule.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-ios-footnote text-game-text-muted">
            Yên tâm, Màn 0 là màn tập nên bạn cứ thử thoải mái, không lo bị thua đâu nhé.
          </p>
        </div>
      );
  }
};
