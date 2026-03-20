import React, { memo } from 'react';
import { CalendarDays, Clock3, Download, ChevronLeft, Type, Languages, AlignLeft, Repeat2, Sparkles } from 'lucide-react';

function SettingsTab({ fontSize, setFontSize, showArabic, setShowArabic, showLatin, setShowLatin, showTranslation, setShowTranslation, showBackToReading, onBackToReading, reminderTime, setReminderTime, reminderFrequency, setReminderFrequency, reminderDuration, setReminderDuration, reminderSummary, onExportReminderCalendar }) {
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

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-5">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shrink-0"><CalendarDays className="w-5 h-5" /></div>
          <div>
            <h4 className="font-semibold text-gray-800">Kalender Pengingat Dzikir</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">Sistem notifikasi cloud disembunyikan sementara. Sebagai gantinya, Anda bisa membuat file kalender pengingat (.ics) dan mengimpornya ke Google Calendar, Apple Calendar, atau kalender lain.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-gray-700">
            <span className="inline-flex items-center gap-2"><Clock3 className="w-4 h-4 text-emerald-600" /> Jam mulai</span>
            <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition-colors focus:border-emerald-400 focus:bg-white" />
          </label>

          <label className="space-y-2 text-sm font-medium text-gray-700">
            <span className="inline-flex items-center gap-2"><Repeat2 className="w-4 h-4 text-emerald-600" /> Frekuensi per hari</span>
            <select value={reminderFrequency} onChange={(e) => setReminderFrequency(Number(e.target.value))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition-colors focus:border-emerald-400 focus:bg-white">
              {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} kali</option>)}
            </select>
          </label>
        </div>

        <div className="space-y-2 text-sm font-medium text-gray-700">
          <span className="inline-flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-600" /> Durasi pengingat</span>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['day', '1 hari', 'Mulai besok saja'],
              ['week', '1 minggu', 'Rutinitas pekanan'],
              ['month', '1 bulan', 'Bangun kebiasaan'],
            ].map(([value, title, caption]) => (
              <button
                key={value}
                type="button"
                onClick={() => setReminderDuration(value)}
                className={`rounded-2xl border px-4 py-4 text-left transition-all ${reminderDuration === value ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-100' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}
              >
                <div className="font-semibold text-gray-800">{title}</div>
                <div className="mt-1 text-xs text-gray-500">{caption}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-900">Ringkasan export</p>
          <p className="mt-1 text-xs leading-relaxed text-emerald-700">{reminderSummary}</p>
        </div>

        <button type="button" onClick={onExportReminderCalendar} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600">
          <Download className="h-4 w-4" /> Export kalender pengingat
        </button>
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
