import { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${
      type === 'success'
        ? 'bg-green-900 border-green-600 text-green-100'
        : 'bg-red-900 border-red-600 text-red-100'
    }`}>
      {type === 'success' ? (
        <CheckCircle size={24} className="flex-shrink-0" />
      ) : (
        <XCircle size={24} className="flex-shrink-0" />
      )}
      <p className="font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-70 transition-opacity"
      >
        <X size={20} />
      </button>
    </div>
  );
}
