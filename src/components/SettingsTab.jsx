import React, { memo } from 'react';
import { CalendarDays, ChevronLeft, Type, Languages, AlignLeft, Sunrise, Sunset } from 'lucide-react';

function SettingsTab({ fontSize, setFontSize, showArabic, setShowArabic, showLatin, setShowLatin, showTranslation, setShowTranslation, showBackToReading, onBackToReading, morningReminderTime, eveningReminderTime, reminderSummary, onOpenReminderModal, isMobileView }) {
  return (
    <div className="p-6 space-y-8 animate-fade-in-up pb-[calc(env(safe-area-inset-bottom,16px)+8.5rem)]">
      <div className="space-y-4">
        {showBackToReading && (
          <button
            type="button"
            onClick={onBackToReading}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke halaman dzikir
          </button>
        )}
        <h2 className="font-bold text-gray-800 text-xl">Pengaturan Tampilan</h2>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0"><CalendarDays className="w-5 h-5" /></div>
          <div className="min-w-0">
            <h4 className="font-semibold text-gray-800">Kalender Pengingat Dzikir</h4>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">Atur jadwal dzikir pagi dan petang, lalu export ke kalender perangkat Anda.</p>
          </div>
        </div>

        {isMobileView ? (
          <button type="button" onClick={onOpenReminderModal} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600">
            <CalendarDays className="h-4 w-4" /> Atur Pengingat Dzikir
          </button>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500"><Sunrise className="w-4 h-4 text-amber-500" /> Dzikir pagi</div>
                <div className="mt-2 text-base font-bold text-gray-800">{morningReminderTime}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500"><Sunset className="w-4 h-4 text-indigo-500" /> Dzikir petang</div>
                <div className="mt-2 text-base font-bold text-gray-800">{eveningReminderTime}</div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-sm font-medium text-emerald-900">Ringkasan</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-700">{reminderSummary}</p>
            </div>

            <button type="button" onClick={onOpenReminderModal} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600">
              <CalendarDays className="h-4 w-4" /> Buat Pengingat Dzikir
            </button>
          </>
        )}
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <label className="flex items-center gap-3 text-gray-700 font-semibold mb-4"><Type className="w-5 h-5 text-emerald-600" /> Ukuran Huruf Arab</label>
        <div className="grid grid-cols-2 gap-3">{['Kecil', 'Sedang', 'Besar', 'Sgt Besar'].map((label, idx) => <button key={idx} onClick={() => setFontSize(idx)} className={`py-3 rounded-xl border font-medium text-sm transition-all ${fontSize === idx ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>{label}</button>)}</div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {[
          ['ع', 'Teks Arab', 'Tampilkan tulisan Arab', showArabic, setShowArabic, 'bg-emerald-50', 'text-emerald-500'],
          [<Languages className="w-5 h-5" key="latin" />, 'Teks Latin', 'Tampilkan cara baca', showLatin, setShowLatin, 'bg-blue-50', 'text-blue-500'],
          [<AlignLeft className="w-5 h-5" key="tr" />, 'Terjemahan', 'Tampilkan arti bahasa', showTranslation, setShowTranslation, 'bg-purple-50', 'text-purple-500'],
        ].map(([icon, title, subtitle, checked, setter, bg, color]) => (
          <div key={title} className="p-5 flex items-center justify-between"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center ${color}`}>{icon}</div><div><h4 className="font-semibold text-gray-800">{title}</h4><p className="text-xs text-gray-500">{subtitle}</p></div></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={checked} onChange={(e) => setter(e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div></label></div>
        ))}
      </div>
    </div>
  );
}

export default memo(SettingsTab);
