import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Settings2, BookOpen, X, Info } from 'lucide-react';
import './App.css';
import AppLogo from './components/AppLogo';
import HomeTab from './components/HomeTab';
import SettingsTab from './components/SettingsTab';
import ReadingTab from './components/ReadingTab';
import { STORAGE_KEYS, isStandaloneDisplay, dalilByTitle, dzikirData, ISTIGHFAR_LINK, readStoredCounts, writeStoredCounts } from './data/dzikirContent';

const getLocalDateKey = () => new Date().toLocaleDateString('en-CA');
const getMsUntilNextTrigger = (hour, minute) => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, minute, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
};

const getMsUntilNextMidnight = () => {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.getTime() - now.getTime();
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeTime, setActiveTime] = useState('pagi');
  const [counts, setCounts] = useState({});
  const [isReadingMode, setIsReadingMode] = useState(false);
  const scrollRef = useRef(null);

  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.fontSize) ?? 2));
  const [showArabic, setShowArabic] = useState(() => localStorage.getItem(STORAGE_KEYS.showArabic) !== 'false');
  const [showLatin, setShowLatin] = useState(() => localStorage.getItem(STORAGE_KEYS.showLatin) !== 'false');
  const [showTranslation, setShowTranslation] = useState(() => localStorage.getItem(STORAGE_KEYS.showTranslation) !== 'false');
  const [isNightView, setIsNightView] = useState(() => localStorage.getItem(STORAGE_KEYS.nightView) === 'true');
  const [remindersEnabled, setRemindersEnabled] = useState(() => localStorage.getItem(STORAGE_KEYS.remindersEnabled) !== 'false');
  const [currentDateKey, setCurrentDateKey] = useState(getLocalDateKey());
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 768);
  const [isStandaloneMode, setIsStandaloneMode] = useState(() => isStandaloneDisplay());
  const [showInstallBanner, setShowInstallBanner] = useState(() => window.innerWidth < 768 && !isStandaloneDisplay());
  const [activeDalil, setActiveDalil] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(() => ('Notification' in window ? Notification.permission : 'default'));
  const [tahlilTargetByTime, setTahlilTargetByTime] = useState(() => ({
    pagi: Number(localStorage.getItem('dzikir_tahlil_target_pagi') || 10),
    petang: Number(localStorage.getItem('dzikir_tahlil_target_petang') || 10),
  }));

  const installPlatform = useMemo(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'other';
  }, []);

  const currentDzikirList = useMemo(
    () => dzikirData[activeTime].map((item) => {
      if (item.title !== 'Tahlil 100x (Atau 10x)' || !item.targetOptions) return item;
      const selectedTarget = tahlilTargetByTime[activeTime] === 100 ? 100 : 10;
      const selectedOption = item.targetOptions[selectedTarget];
      return {
        ...item,
        target: selectedTarget,
        fadhilah: selectedOption?.fadhilah || item.fadhilah,
        source: selectedOption?.source || item.source,
      };
    }),
    [activeTime, tahlilTargetByTime],
  );
  const fontSizeClasses = ['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'];

  useEffect(() => {
    const savedCounts = readStoredCounts(activeTime, currentDateKey);
    const initialCounts = {};
    currentDzikirList.forEach((d) => { initialCounts[d.id] = savedCounts[d.id] || 0; });
    const istighfarMeta = ISTIGHFAR_LINK[activeTime];
    if (istighfarMeta) {
      const oppositeCounts = readStoredCounts(istighfarMeta.otherTime, currentDateKey);
      initialCounts[istighfarMeta.id] = Math.max(initialCounts[istighfarMeta.id] || 0, oppositeCounts[istighfarMeta.otherId] || 0);
    }
    const syncCounts = window.setTimeout(() => setCounts(initialCounts), 0);
    return () => window.clearTimeout(syncCounts);
  }, [activeTime, currentDzikirList, currentDateKey]);

  useEffect(() => {
    if (Object.keys(counts).length === 0) return;
    const persistCounts = setTimeout(() => {
      writeStoredCounts(activeTime, counts, currentDateKey);
      const istighfarMeta = ISTIGHFAR_LINK[activeTime];
      if (istighfarMeta) {
        const oppositeCounts = readStoredCounts(istighfarMeta.otherTime, currentDateKey);
        writeStoredCounts(istighfarMeta.otherTime, { ...oppositeCounts, [istighfarMeta.otherId]: counts[istighfarMeta.id] || 0 }, currentDateKey);
      }
    }, 80);
    return () => clearTimeout(persistCounts);
  }, [counts, activeTime, currentDateKey]);

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.nightView, String(isNightView)); }, [isNightView]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.fontSize, String(fontSize)); }, [fontSize]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.showArabic, String(showArabic)); }, [showArabic]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.showLatin, String(showLatin)); }, [showLatin]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.showTranslation, String(showTranslation)); }, [showTranslation]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.remindersEnabled, String(remindersEnabled)); }, [remindersEnabled]);
  useEffect(() => {
    localStorage.setItem('dzikir_tahlil_target_pagi', String(tahlilTargetByTime.pagi));
    localStorage.setItem('dzikir_tahlil_target_petang', String(tahlilTargetByTime.petang));
  }, [tahlilTargetByTime]);

  useEffect(() => {
    let midnightTimeout;
    let backupInterval;

    const syncDate = () => setCurrentDateKey(getLocalDateKey());
    const scheduleMidnightSync = () => {
      window.clearTimeout(midnightTimeout);
      midnightTimeout = window.setTimeout(() => {
        syncDate();
        scheduleMidnightSync();
      }, getMsUntilNextMidnight() + 50);
    };

    scheduleMidnightSync();
    backupInterval = window.setInterval(syncDate, 60 * 1000);
    document.addEventListener('visibilitychange', syncDate);
    window.addEventListener('focus', syncDate);

    return () => {
      window.clearTimeout(midnightTimeout);
      window.clearInterval(backupInterval);
      document.removeEventListener('visibilitychange', syncDate);
      window.removeEventListener('focus', syncDate);
    };
  }, []);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !remindersEnabled) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then((result) => setNotificationPermission(result));
    }
  }, [remindersEnabled]);

  useEffect(() => {
    if (!('Notification' in window)) return;
    const syncPermission = () => setNotificationPermission(Notification.permission);
    document.addEventListener('visibilitychange', syncPermission);
    window.addEventListener('focus', syncPermission);
    return () => {
      document.removeEventListener('visibilitychange', syncPermission);
      window.removeEventListener('focus', syncPermission);
    };
  }, []);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !remindersEnabled) return;
    let mounted = true; let morningTimeout; let eveningTimeout;
    const scheduleReminder = async (hour, minute, title, body, assignTimeout) => {
      const registration = await navigator.serviceWorker.ready;
      const run = async () => {
        if (!mounted) return;
        if (Notification.permission === 'granted') {
          await registration.showNotification(title, { body, tag: title, renotify: true, icon: '/icons/android-chrome-192x192.png', badge: '/icons/favicon-48x48.png' });
        }
        assignTimeout(window.setTimeout(run, getMsUntilNextTrigger(hour, minute)));
      };
      assignTimeout(window.setTimeout(run, getMsUntilNextTrigger(hour, minute)));
    };
    (async () => {
      try {
        await navigator.serviceWorker.register('/sw.js');
        if (notificationPermission === 'granted') {
          await scheduleReminder(5, 30, 'Dzikir Pagi', 'Waktunya dzikir pagi. Tenangkan hati, awali hari dengan mengingat Allah.', (t) => { morningTimeout = t; });
          await scheduleReminder(17, 0, 'Dzikir Petang', 'Waktunya dzikir petang. Tutup sore dengan dzikir dan doa.', (t) => { eveningTimeout = t; });
        }
      } catch {
        // no-op
      }
    })();
    return () => { mounted = false; window.clearTimeout(morningTimeout); window.clearTimeout(eveningTimeout); };
  }, [remindersEnabled, notificationPermission]);

  useEffect(() => {
    const syncInstallState = () => {
      const mobile = window.innerWidth < 768;
      const standalone = isStandaloneDisplay();
      setIsMobileView(mobile); setIsStandaloneMode(standalone); setShowInstallBanner(mobile && !standalone);
    };
    const handleBeforeInstallPrompt = (event) => { event.preventDefault(); setInstallPromptEvent(event); syncInstallState(); };
    const handleAppInstalled = () => { setShowInstallBanner(false); setInstallPromptEvent(null); syncInstallState(); };
    const displayModeMediaQuery = window.matchMedia('(display-mode: standalone)');
    syncInstallState();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('resize', syncInstallState);
    displayModeMediaQuery.addEventListener('change', syncInstallState);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', syncInstallState);
      displayModeMediaQuery.removeEventListener('change', syncInstallState);
    };
  }, []);

  useEffect(() => {
    const preventPinchZoom = (event) => { if (event.touches && event.touches.length > 1) event.preventDefault(); };
    const preventCtrlZoom = (event) => { if (event.ctrlKey || event.metaKey) event.preventDefault(); };
    const preventGesture = (event) => event.preventDefault();
    document.addEventListener('touchmove', preventPinchZoom, { passive: false });
    document.addEventListener('wheel', preventCtrlZoom, { passive: false });
    document.addEventListener('gesturestart', preventGesture);
    document.addEventListener('gesturechange', preventGesture);
    return () => {
      document.removeEventListener('touchmove', preventPinchZoom);
      document.removeEventListener('wheel', preventCtrlZoom);
      document.removeEventListener('gesturestart', preventGesture);
      document.removeEventListener('gesturechange', preventGesture);
    };
  }, []);

  const handleIncrement = (id, target, index) => {
    setCounts((prev) => {
      const current = prev[id] || 0;
      if (current >= target) return prev;
      if (window.navigator?.vibrate) window.navigator.vibrate(50);
      const newCount = current + 1;
      if (newCount === target && index < currentDzikirList.length - 1) {
        setTimeout(() => {
          const nextElement = document.getElementById(`dzikir-${currentDzikirList[index + 1].id}`);
          if (nextElement && scrollRef.current) nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 600);
      }
      return { ...prev, [id]: newCount };
    });
  };

  const handleReset = () => {
    if (!window.confirm('Apakah Anda yakin ingin mengulang hitungan dzikir ini dari awal?')) return;
    const initialCounts = {};
    currentDzikirList.forEach((d) => { initialCounts[d.id] = 0; });
    setCounts(initialCounts);
    const istighfarMeta = ISTIGHFAR_LINK[activeTime];
    if (istighfarMeta) {
      const oppositeCounts = readStoredCounts(istighfarMeta.otherTime, currentDateKey);
      writeStoredCounts(istighfarMeta.otherTime, { ...oppositeCounts, [istighfarMeta.otherId]: 0 }, currentDateKey);
    }
    if (isReadingMode && scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startReading = (time) => {
    setActiveTime(time); setIsReadingMode(true);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const progress = useMemo(() => {
    if (Object.keys(counts).length === 0) return 0;
    let totalTarget = 0; let totalCompleted = 0;
    currentDzikirList.forEach((d) => { totalTarget += d.target; totalCompleted += Math.min(counts[d.id] || 0, d.target); });
    return totalTarget === 0 ? 0 : Math.round((totalCompleted / totalTarget) * 100);
  }, [counts, currentDzikirList]);

  const getProgressForTime = (time) => {
    const list = dzikirData[time];
    const savedCounts = time === activeTime ? counts : readStoredCounts(time, currentDateKey);
    let totalTarget = 0; let totalCompleted = 0;
    list.forEach((item) => { totalTarget += item.target; totalCompleted += Math.min(savedCounts[item.id] || 0, item.target); });
    return totalTarget === 0 ? 0 : Math.round((totalCompleted / totalTarget) * 100);
  };

  const morningProgress = getProgressForTime('pagi');
  const eveningProgress = getProgressForTime('petang');
  const dailyProgress = Math.round((morningProgress + eveningProgress) / 2);

  const handleInstallApp = async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  };

  return (
    <div className={`min-h-screen bg-gray-50 font-sans text-gray-800 flex justify-center items-stretch lg:items-center overflow-x-hidden selection:bg-emerald-200 px-0 sm:px-4 lg:px-8 ${isNightView ? 'night-view' : ''}`}>
      <div className="app-shell w-full max-w-4xl h-[100dvh] lg:h-[92vh] bg-white relative flex flex-col overflow-hidden sm:rounded-[2rem] lg:shadow-2xl lg:border border-gray-200">
        {!isReadingMode && <header className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-b-3xl shadow-md z-10 relative shrink-0"><div className="flex justify-between items-center mb-6"><div className="flex items-center gap-4"><AppLogo /><div><h1 className="text-2xl font-bold tracking-tight">Dzikir Harian</h1><div className="mt-1 flex items-center gap-2 text-emerald-100"><p className="text-sm font-medium">Sesuai Sunnah Nabi</p><p className="text-lg sm:text-xl calligraphy-subtitle" dir="rtl" aria-label="Kaligrafi Muhammad">مُحَمَّد</p></div></div></div></div><div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner"><div className="flex gap-3"><Info className="w-5 h-5 text-emerald-100 shrink-0 mt-0.5" /><p className="text-sm leading-relaxed text-white">"Maka bertasbihlah kepada Allah di waktu petang dan waktu pagi." <span className="block text-emerald-100 text-xs mt-1">(QS. Ar-Rum: 17)</span></p></div></div></header>}

        {isReadingMode && <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white/95 backdrop-blur z-20 shrink-0 shadow-sm"><button onClick={() => setIsReadingMode(false)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6" /></button><div className="text-center flex-1"><h2 className="font-bold text-gray-800 text-sm">{activeTime === 'pagi' ? 'Dzikir Pagi' : 'Dzikir Petang'}</h2><p className="text-xs text-emerald-600 font-bold tracking-wide">{progress}% SELESAI</p></div><button onClick={() => { setActiveTab('settings'); setIsReadingMode(false); }} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><Settings2 className="w-5 h-5" /></button></div>}
        {isReadingMode && <div className="w-full bg-gray-100 h-1 shrink-0"><div className="bg-emerald-500 h-1 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} /></div>}

        <div ref={scrollRef} className="content-scroll flex-1 overflow-y-auto no-scrollbar relative bg-gray-50 pb-safe">
          {activeTab === 'home' && !isReadingMode && <HomeTab isNightView={isNightView} setIsNightView={setIsNightView} startReading={startReading} handleReset={handleReset} dailyProgress={dailyProgress} morningProgress={morningProgress} eveningProgress={eveningProgress} isMobileView={isMobileView} isStandaloneMode={isStandaloneMode} showInstallBanner={showInstallBanner} installPlatform={installPlatform} installPromptEvent={installPromptEvent} handleInstallApp={handleInstallApp} />}
          {activeTab === 'settings' && !isReadingMode && <SettingsTab remindersEnabled={remindersEnabled} setRemindersEnabled={setRemindersEnabled} fontSize={fontSize} setFontSize={setFontSize} showArabic={showArabic} setShowArabic={setShowArabic} showLatin={showLatin} setShowLatin={setShowLatin} showTranslation={showTranslation} setShowTranslation={setShowTranslation} />}
          {isReadingMode && <ReadingTab currentDzikirList={currentDzikirList} counts={counts} showArabic={showArabic} fontSize={fontSize} fontSizeClasses={fontSizeClasses} showLatin={showLatin} showTranslation={showTranslation} handleIncrement={handleIncrement} setActiveDalil={setActiveDalil} dalilByTitle={dalilByTitle} progress={progress} activeTime={activeTime} setIsReadingMode={setIsReadingMode} setActiveTab={setActiveTab} tahlilTarget={tahlilTargetByTime[activeTime]} setTahlilTarget={(value) => setTahlilTargetByTime((prev) => ({ ...prev, [activeTime]: value }))} />}
        </div>

        {activeDalil && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setActiveDalil(null)}><div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-6" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between gap-3 mb-4"><div><p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Dalil dari sumber</p><h3 className="text-lg font-bold text-gray-900">{activeDalil.title}</h3></div><button type="button" onClick={() => setActiveDalil(null)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center" aria-label="Tutup popup dalil"><X className="w-5 h-5" /></button></div><div className="bg-gray-50 rounded-2xl p-4 space-y-3"><p className="text-sm text-gray-700 leading-relaxed">{activeDalil.dalil}</p><p className="text-xs text-gray-500"><span className="font-semibold">Referensi:</span> {activeDalil.source}</p></div></div></div>}

        {!isReadingMode && <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-around items-center z-20 pb-safe shrink-0"><button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'home' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}><div className={`p-2 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-emerald-50' : 'bg-transparent'}`}><BookOpen className="w-6 h-6" /></div><span className="text-[10px] font-semibold">Dzikir</span></button><button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'settings' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}><div className={`p-2 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-emerald-50' : 'bg-transparent'}`}><Settings2 className="w-6 h-6" /></div><span className="text-[10px] font-semibold">Pengaturan</span></button></nav>}
      </div>
    </div>
  );
}
