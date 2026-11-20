import React from 'react';
import { Download, Info } from 'lucide-react';
import { isNativeApp } from '../utils/platform';

export const WebPreviewBanner: React.FC = () => {
  if (isNativeApp()) {
    return null;
  }

  return (
    <div className="bg-slate-900 dark:bg-emerald-950/90 text-white border-b border-slate-800 dark:border-emerald-800/60">
      <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <p className="text-xs font-medium text-slate-200 truncate">
            Mode Preview Web (Data tidak tersimpan permanen)
          </p>
        </div>
        <a
          href="./CatatanDompet.apk"
          download="CatatanDompet.apk"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs px-3 py-1.5 shadow-sm transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download APK</span>
        </a>
      </div>
    </div>
  );
};
