import React, { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { UniversalEvidenceModal } from '../features/investigation';

vi.mock('../hooks/useSwipeBack', () => ({ useSwipeBack: () => ({}) }));
// Exercise event guards without a DOM; browser focus behavior uses the actual hooks in production.
vi.mock('react', async importOriginal => ({
  ...await importOriginal<typeof import('react')>(),
  useRef: () => ({ current: null }),
  useContext: () => true,
  useState: (init: unknown) => [typeof init === 'function' ? (init as () => unknown)() : init, () => {}],
  useEffect: () => {},
}));

function findButton(node: React.ReactNode, label: string): React.ReactElement<Record<string, unknown>> | undefined {
  if (!isValidElement<Record<string, unknown>>(node)) return undefined;
  if (node.type === 'button' && renderToStaticMarkup(node).includes(label)) return node;
  for (const child of React.Children.toArray(node.props.children as React.ReactNode)) {
    const found = findButton(child, label);
    if (found) return found;
  }
  return undefined;
}

describe('Evidence modal attribution boundary', () => {
  it('pins a sourced order without inventing suspect attribution', () => {
    const onPinEvidence = vi.fn();
    const onClose = vi.fn();
    const modal = UniversalEvidenceModal({
      isOpen: true,
      item: { title: 'Đơn mua order_polo', snippet: 'Áo polo', suspectToTag: '',
        source: { caseId: 'case_01', recordId: 'order_polo', title: 'Đơn mua order_polo', snippet: 'Áo polo' } },
      onPinEvidence, onClose,
    });
    const pin = findButton(modal, 'Ghim');
    expect(pin?.props.disabled).toBe(false);
    (pin?.props.onClick as () => void)();
    expect(onPinEvidence).toHaveBeenCalledExactlyOnceWith('Đơn mua order_polo');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not create a suspect or close inspection when attribution is absent', () => {
    const onPinEvidence = vi.fn();
    const onClose = vi.fn();
    const modal = UniversalEvidenceModal({
      isOpen: true,
      item: { title: 'Hóa đơn', snippet: 'Bản ghi được cung cấp', suspectToTag: '   ' },
      onPinEvidence,
      onClose,
    });
    const pin = findButton(modal, 'Ghim');
    expect(pin?.props.disabled).toBe(true);
    (pin?.props.onClick as () => void)();
    expect(onPinEvidence).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('preserves the existing pin callback for supplied attribution', () => {
    const onPinEvidence = vi.fn();
    const onClose = vi.fn();
    const modal = UniversalEvidenceModal({
      isOpen: true,
      item: { title: 'Hóa đơn', snippet: 'Bản ghi được cung cấp', suspectToTag: 'Tên từ dữ liệu' },
      onPinEvidence,
      onClose,
    });
    const pin = findButton(modal, 'Ghim');
    expect(pin?.props.disabled).toBe(false);
    (pin?.props.onClick as () => void)();
    expect(onPinEvidence).toHaveBeenCalledExactlyOnceWith('Tên từ dữ liệu');
    expect(onClose).toHaveBeenCalledOnce();
  });
});
