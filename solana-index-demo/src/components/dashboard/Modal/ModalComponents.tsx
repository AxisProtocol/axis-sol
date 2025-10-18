import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';

// Modal Layout Component
interface ModalLayoutProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  titleId: string;
}

export function ModalLayout({
  isOpen,
  onClose,
  children,
  titleId,
}: ModalLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 背面スクロールをロック
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const overlay = (
    <div
      className="fixed inset-0 left-0 top-0 w-screen h-screen z-[120] bg-black/80 backdrop-blur-[8px] grid place-items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose} /* 外側クリックで閉じたくなければ削除 */
    >
      <div
        className="w-[min(980px,92vw)] bg-neutral-900/90 border border-white/12 rounded-2xl shadow-2xl shadow-black/60 p-5 text-white"
        onClick={(e) => e.stopPropagation()} /* 内側クリックは閉じない */
      >
        {children}
      </div>
    </div>
  );

  // ここがポイント：常に <body> 直下に描画
  return createPortal(overlay, document.body);
}

// Modal Header Component
interface ModalHeaderProps {
  networkName: string;
  publicKey: string | null;
  onClose: () => void;
  title: string;
}

export function ModalHeader({
  networkName,
  publicKey,
  onClose,
  title,
}: ModalHeaderProps) {
  const fmtAddr = (pk?: string | null) => {
    if (!pk) return '';
    return `${pk.slice(0, 4)}…${pk.slice(-4)}`;
  };

  return (
    <header className="flex justify-between items-center mb-2">
      <div className="flex gap-2 items-center text-sm text-[#cfd3dc]">
        <span className="px-2 py-1 border border-white/20 rounded-md">
          {networkName}
        </span>
        <span className="opacity-90">
          Connected: {fmtAddr(publicKey) || '—'}
        </span>
      </div>
      <button
        className="bg-transparent text-white text-3xl border-none cursor-pointer hover:text-gray-300 transition-colors"
        aria-label="Close"
        onClick={onClose}
      >
        ×
      </button>
    </header>
  );
}

// Modal Input Component
interface ModalInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  type?: 'number' | 'text';
  step?: string;
  disabled?: boolean;
  placeholder?: string;
  inputMode?: 'decimal' | 'numeric' | 'text';
  suffix?: string;
}

export const ModalInput = forwardRef<HTMLInputElement, ModalInputProps>(
  (
    {
      id,
      label,
      value,
      onChange,
      min = '0',
      step = '0.01',
      type = 'number',
      disabled = false,
      placeholder,
      inputMode = 'decimal',
    },
    ref
  ) => {
    return (
      <>
        <label
          className="block mt-3 mb-1.5 text-[#B8C0CC] text-sm"
          htmlFor={id}
        >
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          type={type}
          className="w-full px-4 py-3.5 rounded-lg border border-white/18 bg-black/35 text-white text-base focus:outline-none focus:border-[#88aaff] focus:shadow-[0_0_0_2px_rgba(136,170,255,0.25)]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          inputMode={inputMode}
          spellCheck={false}
        />
      </>
    );
  }
);

ModalInput.displayName = 'ModalInput';

// Percentage Buttons Component
interface PercentageButtonsProps {
  onSetPercentage: (percentage: number) => void;
  disabled?: boolean;
  className?: string;
}

export function PercentageButtons({
  onSetPercentage,
  disabled = false,
  className = '',
}: PercentageButtonsProps) {
  const percentages = [
    { value: 0.25, label: '25%' },
    { value: 0.5, label: '50%' },
    { value: 0.75, label: '75%' },
    { value: 1, label: 'Max' },
  ];

  return (
    <div className={`flex gap-2 mt-2.5 mb-4 ${className}`}>
      {percentages.map(({ value, label }) => (
        <button
          key={value}
          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white cursor-pointer hover:bg-white/16 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onSetPercentage(value)}
          disabled={disabled}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Modal Button Component
interface ModalButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ModalButton({
  onClick,
  disabled = false,
  children,
  className = '',
}: ModalButtonProps) {
  return (
    <button
      className={`w-full px-4 py-3.5 rounded-lg border border-white/25 bg-white text-black font-bold cursor-pointer mt-1 shadow-lg shadow-white/25 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// Balance Display Component
interface BalanceItem {
  label: string;
  value: string | number;
  decimals?: number;
}

interface BalanceDisplayProps {
  items: BalanceItem[];
}

export function BalanceDisplay({ items }: BalanceDisplayProps) {
  return (
    <>
      {items.map((item, index) => (
        <div key={index} className="flex items-baseline justify-between m-1">
          <span className="text-[#B8C0CC]">{item.label}</span>
          <strong className="font-bold">
            {typeof item.value === 'number' && item.decimals
              ? item.value.toFixed(item.decimals)
              : item.value}
          </strong>
        </div>
      ))}
    </>
  );
}

// Info Display Component
interface InfoItem {
  label: string;
  value: string;
}

interface InfoDisplayProps {
  title: string;
  description: string;
  items: InfoItem[];
  expectedValue?: {
    label: string;
    value: string | number;
    formula: string;
  };
}

export function InfoDisplay({
  title,
  description,
  items,
  expectedValue,
}: InfoDisplayProps) {
  return (
    <aside className="bg-white/4 border border-white/10 rounded-xl p-4">
      <h3 className="m-0 mb-3 text-lg opacity-95">{title}</h3>
      <p>{description}</p>

      <div className="grid grid-cols-1 gap-2.5 mt-2 break-all">
        {items.map((item, index) => (
          <div key={index}>
            <div className="text-xs text-[#AEB6C4]">{item.label}</div>
            <div className="font-mono text-sm">{item.value}</div>
          </div>
        ))}
      </div>

      {expectedValue && (
        <div className="mt-4 p-3 rounded-lg bg-black/35 border border-white/12">
          <div className="flex items-baseline justify-between m-1">
            <span className="text-[#B8C0CC] text-sm">
              {expectedValue.label}
            </span>
            <strong className="text-lg">{expectedValue.value}</strong>
          </div>
          <small dangerouslySetInnerHTML={{ __html: expectedValue.formula }} />
        </div>
      )}
    </aside>
  );
}
