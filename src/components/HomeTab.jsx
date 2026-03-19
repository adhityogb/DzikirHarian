import React, { useState } from 'react';
import { Sun, Moon, ChevronRight, RotateCcw, Download, Sparkles } from 'lucide-react';

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
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);

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

      {isMobileView && !isStandaloneMode && showInstallBanner && (
        <div className="install-card relative overflow-hidden rounded-[2rem] border border-emerald-200/80 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-[1px] shadow-[0_18px_40px_rgba(16,185,129,0.22)]">
          <div className="relative rounded-[calc(2rem-1px)] bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(236,253,245,0.98))] p-5 sm:p-6">
            <div className="install-card__blur" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.24em]">Install App</p>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Pasang Dzikir Harian ke layar utama</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">Akses lebih cepat, nuansa seperti aplikasi native, dan tetap selaras dengan warna hijau lembut aplikasi ini.</p>

                <div className="mt-4 flex flex-wrap gap-3">
                  {installPlatform === 'android' && installPromptEvent ? (
                    <button
                      type="button"
                      onClick={handleInstallApp}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
                    >
                      <Download className="w-4 h-4" />
                      Install aplikasi
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowInstallInstructions((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50 active:scale-[0.98]"
                    >
                      <Download className="w-4 h-4" />
                      {showInstallInstructions ? 'Sembunyikan panduan' : 'Lihat cara install'}
                    </button>
                  )}

                  {installPlatform === 'android' && !installPromptEvent && (
                    <button
                      type="button"
                      onClick={() => setShowInstallInstructions((prev) => !prev)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:bg-emerald-100 active:scale-[0.98]"
                    >
                      {showInstallInstructions ? 'Tutup langkah manual' : 'Langkah manual'}
                    </button>
                  )}
                </div>

                {(showInstallInstructions || installPlatform === 'ios' || installPlatform === 'other' || (installPlatform === 'android' && !installPromptEvent)) && (
                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm animate-fade-in-up">
                    {installPlatform === 'ios' && <ol className="text-sm text-emerald-900 list-decimal pl-5 space-y-1.5"><li>Buka aplikasi ini lewat Safari.</li><li>Ketuk tombol <strong>Share</strong> (ikon kotak + panah).</li><li>Pilih <strong>Add to Home Screen</strong>, lalu tekan <strong>Add</strong>.</li></ol>}
                    {installPlatform === 'android' && <ol className="text-sm text-emerald-900 list-decimal pl-5 space-y-1.5"><li>Tekan menu browser <strong>⋮</strong>.</li><li>Pilih <strong>Install app</strong> atau <strong>Add to Home screen</strong>.</li><li>Konfirmasi agar ikon muncul di layar utama.</li></ol>}
                    {installPlatform === 'other' && <p className="text-sm text-emerald-900">Gunakan menu browser, lalu pilih <strong>Install app</strong> atau <strong>Add to Home Screen</strong> bila tersedia.</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
      </div>
    </div>
  );
}
