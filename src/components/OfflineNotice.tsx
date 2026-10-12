import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineNoticeProps {
  isOnline: boolean;
  onReconnect?: () => void;
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({ isOnline, onReconnect }) => {
  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 text-amber-950" />
          <span>
            <strong>Chế độ Ngoại Tuyến:</strong> Hệ thống tự động chuyển tiếp. Bấm kết nối lại để vào chế độ trực tuyến!
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {onReconnect && (
            <button
              onClick={onReconnect}
              type="button"
              className="inline-flex items-center gap-1 bg-amber-900 hover:bg-black text-white px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Kết nối trực tuyến</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
