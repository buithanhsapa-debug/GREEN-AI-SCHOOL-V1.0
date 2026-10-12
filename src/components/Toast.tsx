import React from 'react';
import { CheckCircle2, AlertCircle, Award, Sparkles, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'reward' | 'error';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        let bgStyle = 'bg-white border-emerald-200 text-slate-800 shadow-xl';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;

        if (t.type === 'reward') {
          bgStyle = 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-transparent shadow-xl';
          icon = <Award className="w-5 h-5 text-amber-300 shrink-0 animate-bounce" />;
        } else if (t.type === 'error') {
          bgStyle = 'bg-rose-50 border-rose-300 text-rose-900 shadow-xl';
          icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
        } else if (t.type === 'info') {
          bgStyle = 'bg-sky-50 border-sky-300 text-sky-900 shadow-xl';
          icon = <Sparkles className="w-5 h-5 text-sky-600 shrink-0" />;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border flex items-start justify-between gap-3 animate-in slide-in-from-right-5 fade-in duration-200 ${bgStyle}`}
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm">{t.title}</h4>
                {t.description && (
                  <p className="text-xs opacity-90 mt-0.5 font-medium leading-relaxed">
                    {t.description}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 rounded-lg hover:bg-black/10 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
