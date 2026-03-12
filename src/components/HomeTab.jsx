import React from 'react';
import { Sun, Moon, ChevronRight, RotateCcw, Download } from 'lucide-react';

export default function HomeTab({
  isNightView,
  setIsNightView,
  startReading,
  handleReset,
  dailyProgress,
  morningProgress,
  eveningProgress,
  isMobileView,
  isStandaloneMode,
  showInstallBanner,
  installPlatform,
  installPromptEvent,
  handleInstallApp,
}) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-32 animate-fade-in-up">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-bold text-gray-700 text-lg">Pilih Waktu Dzikir</h2>
        <button onClick={() => setIsNightView((prev) => !prev)} className={`relative inline-flex items-center w-[132px] h-10 px-1 rounded-full border transition-all duration-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${isNightView ? 'bg-slate-900 border-slate-700' : 'bg-amber-50 border-amber-200'}`} aria-label="Toggle night/day view">
          <span className={`absolute top-1 h-8 w-[62px] rounded-full transition-transform duration-300 shadow-sm ${isNightView ? 'translate-x-[64px] bg-slate-700' : 'translate-x-0 bg-amber-400'}`} />
          <span className="relative z-10 w-1/2 flex items-center justify-center gap-1.5 text-[11px] font-semibold"><Sun className={`w-3.5 h-3.5 ${isNightView ? 'text-slate-300' : 'text-white'}`} /><span className={`${isNightView ? 'text-slate-300' : 'text-white'}`}>Day</span></span>
          <span className="relative z-10 w-1/2 flex items-center justify-center gap-1.5 text-[11px] font-semibold"><Moon className={`w-3.5 h-3.5 ${isNightView ? 'text-white' : 'text-amber-500'}`} /><span className={`${isNightView ? 'text-white' : 'text-amber-600'}`}>Night</span></span>
        </button>
      </div>

      <button onClick={() => startReading('pagi')} className="w-full bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between group hover:border-emerald-200 transition-all active:scale-[0.98]">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform"><Sun className="w-7 h-7" /></div>
          <div className="text-left"><h3 className="font-bold text-gray-800 text-lg">Dzikir Pagi</h3><p className="text-gray-500 text-sm">Dibaca setelah Shubuh</p></div>
        </div>
        <ChevronRight className="text-gray-300 group-hover:text-emerald-500" />
      </button>

      <button onClick={() => startReading('petang')} className="w-full bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between group hover:border-indigo-200 transition-all active:scale-[0.98]">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform"><Moon className="w-7 h-7" /></div>
          <div className="text-left"><h3 className="font-bold text-gray-800 text-lg">Dzikir Petang</h3><p className="text-gray-500 text-sm">Dibaca setelah Ashar</p></div>
        </div>
        <ChevronRight className="text-gray-300 group-hover:text-indigo-500" />
      </button>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-700">Progres Hari Ini</h3>
          <button onClick={handleReset} className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"><RotateCcw className="w-3 h-3" /> Ulang Hitungan</button>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex justify-between text-sm font-medium mb-2"><span className="text-gray-500">Penyelesaian Keseluruhan</span><span className="text-emerald-600 font-bold">{dailyProgress}%</span></div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden"><div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${dailyProgress}%` }} /></div>
          <p className="text-xs text-gray-500 mt-3">Progress realtime: Pagi {morningProgress}% • Petang {eveningProgress}%</p>
        </div>

        {isMobileView && !isStandaloneMode && showInstallBanner && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-sm animate-fade-in-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"><Download className="w-5 h-5" /></div>
              <div className="flex-1">
                <p className="font-semibold text-emerald-900 text-sm">Install Dzikir Harian</p><p className="text-xs text-emerald-700 mt-1">Pasang aplikasi agar akses lebih cepat dari homescreen.</p>
                <div className="mt-2 rounded-xl bg-white/80 p-3 border border-emerald-100">
                  {installPlatform === 'ios' && <ol className="text-xs text-emerald-800 list-decimal pl-4 space-y-1"><li>Buka di Safari, lalu ketuk tombol <strong>Share</strong> (ikon kotak + panah).</li><li>Pilih <strong>Add to Home Screen</strong>.</li><li>Ketuk <strong>Add</strong> sampai ikon muncul di layar utama.</li></ol>}
                  {installPlatform === 'android' && <ol className="text-xs text-emerald-800 list-decimal pl-4 space-y-1"><li>Ketuk tombol <strong>Install</strong> di bawah ini.</li><li>Jika tidak muncul, buka menu browser (⋮).</li><li>Pilih <strong>Install app</strong> atau <strong>Add to Home screen</strong>.</li></ol>}
                  {installPlatform === 'other' && <p className="text-xs text-emerald-800">Gunakan menu browser lalu pilih <strong>Install app</strong> atau <strong>Add to Home Screen</strong>.</p>}
                </div>
                <div className="flex gap-2 mt-3">{installPromptEvent ? <button onClick={handleInstallApp} className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">Install</button> : <span className="px-3 py-2 text-xs font-semibold rounded-lg bg-white text-emerald-700 border border-emerald-200">Buka menu browser untuk install</span>}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
