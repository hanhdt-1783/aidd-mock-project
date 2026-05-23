'use client';

import { useEffect, useState } from 'react';

type ToastProps = {
  message: string;
  onDismiss: () => void;
};

export function KudosToast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        zIndex: 9999,
        padding: '14px 24px',
        borderRadius: 8,
        backgroundColor: '#FFEA9E',
        color: '#00101A',
        fontFamily: 'Montserrat, sans-serif',
        fontSize: 14,
        fontWeight: 700,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        animation: 'fadeInUp 0.2s ease',
      }}
    >
      {message}
    </div>
  );
}

// Hook to manage a single toast queue
export function useKudosToast() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => setToast(msg);
  const dismissToast = () => setToast(null);

  return { toast, showToast, dismissToast };
}
