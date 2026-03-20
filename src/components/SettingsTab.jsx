import React, { memo } from 'react';
import { BellRing, Type, Languages, AlignLeft, ChevronLeft, CheckCircle2, Cloud, Send, Sunrise, Sunset } from 'lucide-react';

const reminderSchedule = [
  {
    icon: Sunrise,
    title: 'Dzikir pagi',
    subtitle: 'Setelah Subuh',
    time: '05.30',
    iconClassName: 'bg-amber-100 text-amber-500',
    pillClassName: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    icon: Sunset,
    title: 'Dzikir petang',
    subtitle: 'Setelah Ashar',
    time: '17.00',
    iconClassName: 'bg-orange-100 text-orange-500',
    pillClassName: 'bg-orange-50 text-orange-700 border-orange-100',
  },
];

function SettingsTab({ remindersEnabled, onRemindersToggle, notificationPermission, installPlatform, isStandaloneMode, fontSize, setFontSize, showArabic, setShowArabic, showLatin, setShowLatin, showTranslation, setShowTranslation, showBackToReading, onBackToReading, reminderStatusMessage, isReminderBusy, isPushConfigured, hasPushSubscription, onSendTestNotification }) {
  const notificationHint = installPlatform === 'ios'
    ? (isStandaloneMode
      ? 'Pastikan izin notifikasi Safari/PWA sudah diizinkan. Pengiriman notifikasi dijalankan dari Cloudflare Worker sehingga tetap bisa masuk saat app tertutup.'
      : 'Untuk iPhone/iPad, pasang app ke Home Screen terlebih dahulu sebelum mengaktifkan notifikasi.')
    : 'Pengingat dikirim via Web Push + Cloudflare Worker agar tetap berjalan walau tab atau aplikasi sedang tertutup.';

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
        <div className="flex items-center gap-3 text-gray-700 font-semibold">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
            <Sunrise className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Waktu Pengingat Dzikir</h3>
            <p className="text-xs text-gray-500 font-normal">Jadwal default yang dikirim Worker ke perangkat Anda.</p>
          </div>
        </div>

        <div className="space-y-3">
          {reminderSchedule.map((scheduleItem) => {
            const ScheduleIcon = scheduleItem.icon;

            return (
              <div key={scheduleItem.title} className="flex items-center justify-between gap-4 rounded-[1.75rem] border border-gray-100 bg-gradient-to-r from-white to-gray-50 px-4 py-4 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${scheduleItem.iconClassName}`}>
                    <ScheduleIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-gray-800 leading-tight">{scheduleItem.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{scheduleItem.subtitle}</p>
                  </div>
                </div>

                <div className={`shrink-0 rounded-full border px-4 py-2 text-lg font-bold tracking-[0.16em] ${scheduleItem.pillClassName}`}>
                  {scheduleItem.time}
                </div>
              </div>
            );
          })}
        </div>
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

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500"><BellRing className="w-5 h-5" /></div><div><h4 className="font-semibold text-gray-800">Notifikasi Pengingat Cloud</h4><p className="text-xs text-gray-500">Aktifkan agar reminder tetap masuk saat app tertutup</p></div></div><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={remindersEnabled} disabled={isReminderBusy} onChange={(e) => { void onRemindersToggle(e.target.checked); }} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-disabled:opacity-50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div></label></div>
        <p className="text-xs text-gray-500 leading-relaxed">{notificationHint}</p>
        <div className={`rounded-2xl border px-4 py-3 text-sm ${hasPushSubscription ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-full p-1 ${hasPushSubscription ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
              {hasPushSubscription ? <CheckCircle2 className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}
            </div>
            <div className="space-y-1">
              <p className="font-semibold">{hasPushSubscription ? 'Subscription tersimpan di Cloudflare' : 'Subscription belum aktif'}</p>
              <p className="text-xs leading-relaxed">{reminderStatusMessage}</p>
            </div>
          </div>
        </div>
        {!isPushConfigured && <p className="text-xs text-amber-600 leading-relaxed">Mode cloud belum siap karena env frontend untuk Worker/VAPID belum diisi.</p>}
        {notificationPermission === 'denied' && <p className="text-xs text-rose-500 leading-relaxed">Izin notifikasi sedang diblokir. Ubah izin di pengaturan browser/perangkat jika ingin menyalakannya kembali.</p>}
        <button type="button" disabled={!hasPushSubscription || isReminderBusy} onClick={() => { void onSendTestNotification(); }} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /> Kirim notifikasi uji</button>
      </div>
    </div>
  );
}
export default memo(SettingsTab);
