import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Settings2, BookOpen, X, Info, Download } from 'lucide-react';
import './App.css';
import AppLogo from './components/AppLogo';
import HomeTab from './components/HomeTab';
import SettingsTab from './components/SettingsTab';
import ReadingTab from './components/ReadingTab';
import { STORAGE_KEYS, isStandaloneDisplay, dalilByTitle, dzikirData, ISTIGHFAR_LINK, readStoredCounts, writeStoredCounts } from './data/dzikirContent';
import { downloadReminderCalendar, getReminderSummary } from './lib/calendarReminders';

const getLocalDateKey = () => new Date().toLocaleDateString('en-CA');
const fontSizeClasses = ['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'];

const getMsUntilNextMidnight = () => {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return nextMidnight.getTime() - now.getTime();
};

const getDzikirListForTime = (time, tahlilTargetByTime) => dzikirData[time].map((item) => {
  if (!item.targetOptions) return item;

  const selectedTarget = tahlilTargetByTime[time] === 100 ? 100 : 10;
  const selectedOption = item.targetOptions[selectedTarget];

  return {
    ...item,
    target: selectedTarget,
    fadhilah: selectedOption?.fadhilah || item.fadhilah,
    source: selectedOption?.source || item.source,
  };
});

const getProgressFromCounts = (list, savedCounts) => {
  let totalTarget = 0;
  let totalCompleted = 0;

  list.forEach((item) => {
    totalTarget += item.target;
    totalCompleted += Math.min(savedCounts[item.id] || 0, item.target);
  });

  return totalTarget === 0 ? 0 : Math.round((totalCompleted / totalTarget) * 100);
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeTime, setActiveTime] = useState('pagi');
  const [counts, setCounts] = useState({});
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [settingsOrigin, setSettingsOrigin] = useState('home');
  const scrollRef = useRef(null);

  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem(STORAGE_KEYS.fontSize) ?? 2));
  const [showArabic, setShowArabic] = useState(() => localStorage.getItem(STORAGE_KEYS.showArabic) !== 'false');
  const [showLatin, setShowLatin] = useState(() => localStorage.getItem(STORAGE_KEYS.showLatin) !== 'false');
  const [showTranslation, setShowTranslation] = useState(() => localStorage.getItem(STORAGE_KEYS.showTranslation) !== 'false');
  const [showBenefitsSources, setShowBenefitsSources] = useState(() => localStorage.getItem(STORAGE_KEYS.showBenefitsSources) !== 'false');
  const [isNightView, setIsNightView] = useState(() => localStorage.getItem(STORAGE_KEYS.nightView) === 'true');
  const [currentDateKey, setCurrentDateKey] = useState(getLocalDateKey());
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 768);
  const [isStandaloneMode, setIsStandaloneMode] = useState(() => isStandaloneDisplay());
  const [showInstallBanner, setShowInstallBanner] = useState(() => window.innerWidth < 768 && !isStandaloneDisplay());
  const [activeDalil, setActiveDalil] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [morningReminderTime, setMorningReminderTime] = useState(() => localStorage.getItem('dzikir_calendar_morning_reminder_time') || '05:30');
  const [eveningReminderTime, setEveningReminderTime] = useState(() => localStorage.getItem('dzikir_calendar_evening_reminder_time') || '17:00');
  const [reminderDuration, setReminderDuration] = useState(() => localStorage.getItem('dzikir_calendar_reminder_duration') || 'week');
  const [tahlilTargetByTime, setTahlilTargetByTime] = useState(() => ({
    pagi: Number(localStorage.getItem('dzikir_tahlil_target_pagi') || 10),
    petang: Number(localStorage.getItem('dzikir_tahlil_target_petang') || 10),
  }));
  const [activeAutoCounter, setActiveAutoCounter] = useState(null);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;
    return navigator.serviceWorker.register('/sw.js');
  }, []);

  const dzikirListByTime = useMemo(() => ({
    pagi: getDzikirListForTime('pagi', tahlilTargetByTime),
    petang: getDzikirListForTime('petang', tahlilTargetByTime),
  }), [tahlilTargetByTime]);

  const currentDzikirList = dzikirListByTime[activeTime];
  const reminderSummary = useMemo(() => getReminderSummary({ morningTime: morningReminderTime, eveningTime: eveningReminderTime, durationKey: reminderDuration }), [morningReminderTime, eveningReminderTime, reminderDuration]);

  useEffect(() => {
    registerServiceWorker().catch(() => {
      // no-op
    });
  }, [registerServiceWorker]);

  useEffect(() => {
    const savedCounts = readStoredCounts(activeTime, currentDateKey);
    const initialCounts = {};
    currentDzikirList.forEach((d) => { initialCounts[d.id] = savedCounts[d.id] || 0; });
    const istighfarMeta = ISTIGHFAR_LINK[activeTime];
    if (istighfarMeta) {
      const oppositeCounts = readStoredCounts(istighfarMeta.otherTime, currentDateKey);
      initialCounts[istighfarMeta.id] = Math.max(initialCounts[istighfarMeta.id] || 0, oppositeCounts[istighfarMeta.otherId] || 0);
    }

    const syncCounts = window.setTimeout(() => {
      setCounts(initialCounts);
    }, 0);

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
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.showBenefitsSources, String(showBenefitsSources)); }, [showBenefitsSources]);
  useEffect(() => { localStorage.setItem('dzikir_calendar_morning_reminder_time', morningReminderTime); }, [morningReminderTime]);
  useEffect(() => { localStorage.setItem('dzikir_calendar_evening_reminder_time', eveningReminderTime); }, [eveningReminderTime]);
  useEffect(() => { localStorage.setItem('dzikir_calendar_reminder_duration', reminderDuration); }, [reminderDuration]);
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
    const syncInstallState = () => {
      const mobile = window.innerWidth < 768;
      const standalone = isStandaloneDisplay();
      setIsMobileView(mobile);
      setIsStandaloneMode(standalone);
      setShowInstallBanner(mobile && !standalone);
    };

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
      syncInstallState();
    };

    const handleAppInstalled = () => {
      setShowInstallBanner(false);
      setInstallPromptEvent(null);
      syncInstallState();
    };

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

  useEffect(() => {
    if (!activeAutoCounter) return undefined;
    const autoEntry = currentDzikirList.find((item) => item.id === activeAutoCounter);
    const autoIntervalMs = autoEntry?.title === 'Tasbih' ? 2500 : autoEntry?.title === 'Istighfar' ? 3000 : null;
    if (!autoEntry || !autoIntervalMs) return undefined;

    const timer = window.setInterval(() => {
      setCounts((prev) => {
        const current = prev[autoEntry.id] || 0;
        if (current >= autoEntry.target) {
          window.clearInterval(timer);
          setActiveAutoCounter(null);
          return prev;
        }

        const nextCount = current + 1;
        if (window.navigator?.vibrate) window.navigator.vibrate(20);
        return { ...prev, [autoEntry.id]: nextCount };
      });
    }, autoIntervalMs);

    return () => window.clearInterval(timer);
  }, [activeAutoCounter, currentDzikirList]);

  const handleExportReminderCalendar = useCallback(() => {
    downloadReminderCalendar({ morningTime: morningReminderTime, eveningTime: eveningReminderTime, durationKey: reminderDuration });
    setIsReminderModalOpen(false);
  }, [eveningReminderTime, morningReminderTime, reminderDuration]);

  const handleOpenReminderModal = useCallback(() => {
    setIsReminderModalOpen(true);
  }, []);

  const handleIncrement = useCallback((id, target, index) => {
    setCounts((prev) => {
      const current = prev[id] || 0;
      if (current >= target) return prev;
      if (window.navigator?.vibrate) window.navigator.vibrate(50);
      const newCount = current + 1;
      if (newCount === target && index < currentDzikirList.length - 1) {
        window.setTimeout(() => {
          const nextElement = document.getElementById(`dzikir-${currentDzikirList[index + 1].id}`);
          if (nextElement && scrollRef.current) nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 600);
      }
      return { ...prev, [id]: newCount };
    });
  }, [currentDzikirList]);

  const handleReset = useCallback(() => {
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
    setActiveAutoCounter(null);
  }, [activeTime, currentDateKey, currentDzikirList, isReadingMode]);

  const startReading = useCallback((time) => {
    setActiveTime(time);
    setSettingsOrigin('home');
    setIsReadingMode(true);
    setActiveAutoCounter(null);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  }, []);

  const openSettingsFromReading = useCallback(() => {
    setSettingsOrigin('reading');
    setActiveTab('settings');
    setIsReadingMode(false);
    setActiveAutoCounter(null);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  }, []);

  const handleBackToReading = useCallback(() => {
    setIsReadingMode(true);
    setActiveAutoCounter(null);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  }, []);

  const toggleAutoCounter = useCallback((id) => {
    setActiveAutoCounter((prev) => (prev === id ? null : id));
  }, []);

  const progress = useMemo(() => {
    if (Object.keys(counts).length === 0) return 0;
    return getProgressFromCounts(currentDzikirList, counts);
  }, [counts, currentDzikirList]);

  const progressByTime = useMemo(() => ({
    pagi: activeTime === 'pagi' ? getProgressFromCounts(dzikirListByTime.pagi, counts) : getProgressFromCounts(dzikirListByTime.pagi, readStoredCounts('pagi', currentDateKey)),
    petang: activeTime === 'petang' ? getProgressFromCounts(dzikirListByTime.petang, counts) : getProgressFromCounts(dzikirListByTime.petang, readStoredCounts('petang', currentDateKey)),
  }), [activeTime, counts, currentDateKey, dzikirListByTime]);

  const morningProgress = progressByTime.pagi;
  const eveningProgress = progressByTime.petang;
  const dailyProgress = Math.round((morningProgress + eveningProgress) / 2);

  const handleInstallApp = useCallback(async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
    setIsInstallModalOpen(false);
  }, [installPromptEvent]);

  const handleOpenHome = useCallback(() => {
    setSettingsOrigin('home');
    setActiveTab('home');
    setActiveAutoCounter(null);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setSettingsOrigin('home');
    setActiveTab('settings');
    setActiveAutoCounter(null);
  }, []);

  const handleCloseReading = useCallback(() => {
    setIsReadingMode(false);
    setActiveAutoCounter(null);
  }, []);

  const setActiveTimeTahlilTarget = useCallback((value) => {
    setTahlilTargetByTime((prev) => ({ ...prev, [activeTime]: value }));
  }, [activeTime]);

  return (
    <div className={`min-h-screen bg-gray-50 font-sans text-gray-800 flex justify-center items-stretch lg:items-center overflow-x-hidden selection:bg-emerald-200 px-0 sm:px-4 lg:px-8 ${isNightView ? 'night-view' : ''}`}>
      <div className="app-shell w-full max-w-4xl h-[100dvh] lg:h-[92vh] bg-white relative flex flex-col overflow-hidden sm:rounded-[2rem] lg:shadow-2xl lg:border border-gray-200">
        <div className={`flex min-h-0 flex-1 flex-col transition-all duration-300 ${(isInstallModalOpen || isReminderModalOpen) ? 'app-shell__backdrop is-blurred' : ''}`}>
          {!isReadingMode && (
            <header className="app-header px-5 sm:px-6 text-white shadow-md z-10 relative shrink-0">
              <div className="app-header__glow" />
              <div className="app-header__inner">
                <div className="app-header__top flex items-start gap-4">
                  <AppLogo />
                  <div className="min-w-0 app-header__brand-copy">
                    <h1 className="text-2xl font-bold tracking-tight">Dzikir Harian</h1>
                    <div className="mt-1 flex items-center gap-2 text-emerald-100 app-header__subtitle-row">
                      <p className="text-sm font-medium">Sesuai Sunnah Nabi</p>
                      <p className="text-lg sm:text-xl calligraphy-subtitle" dir="rtl" aria-label="Kaligrafi Muhammad">مُحَمَّد</p>
                    </div>
                  </div>
                </div>

                <div className="app-header__verse bg-white/14 backdrop-blur-md rounded-[1.7rem] p-4 sm:p-5 border border-white/15 shadow-inner">
                  <div className="app-header__verse-content flex gap-3 items-start">
                    <div className="app-header__verse-icon w-10 h-10 rounded-full bg-white/14 text-emerald-50 flex items-center justify-center shrink-0">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 app-header__verse-copy">
                      <p className="app-header__verse-quote text-sm leading-relaxed text-white font-medium">&quot;Maka bertasbihlah kepada Allah di waktu petang dan waktu pagi.&quot;</p>
                      <p className="app-header__verse-reference text-sm sm:text-[15px] font-semibold text-emerald-50 mt-2">QS. Ar-Rum: 17</p>
                    </div>
                  </div>
                </div>
              </div>
            </header>
          )}

          {isReadingMode && (
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white/95 backdrop-blur z-20 shrink-0 shadow-sm">
              <button onClick={handleCloseReading} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="text-center flex-1">
                <h2 className="font-bold text-gray-800 text-sm">{activeTime === 'pagi' ? 'Dzikir Pagi' : 'Dzikir Petang'}</h2>
                <p className="text-xs text-emerald-600 font-bold tracking-wide">{progress}% SELESAI</p>
              </div>
              <button onClick={openSettingsFromReading} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
          )}
          {isReadingMode && <div className="w-full bg-gray-100 h-1 shrink-0"><div className="bg-emerald-500 h-1 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} /></div>}

          <div ref={scrollRef} className="content-scroll flex-1 overflow-y-auto no-scrollbar relative bg-gray-50 pb-safe">
            {activeTab === 'home' && !isReadingMode && <HomeTab isNightView={isNightView} setIsNightView={setIsNightView} startReading={startReading} handleReset={handleReset} dailyProgress={dailyProgress} morningProgress={morningProgress} eveningProgress={eveningProgress} isMobileView={isMobileView} isStandaloneMode={isStandaloneMode} showInstallBanner={showInstallBanner} setIsInstallModalOpen={setIsInstallModalOpen} />}
            {activeTab === 'settings' && !isReadingMode && (
              <SettingsTab
                fontSize={fontSize}
                setFontSize={setFontSize}
                showArabic={showArabic}
                setShowArabic={setShowArabic}
                showLatin={showLatin}
                setShowLatin={setShowLatin}
                showTranslation={showTranslation}
                setShowTranslation={setShowTranslation}
                showBenefitsSources={showBenefitsSources}
                setShowBenefitsSources={setShowBenefitsSources}
                showBackToReading={settingsOrigin === 'reading'}
                onBackToReading={handleBackToReading}
                morningReminderTime={morningReminderTime}
                setMorningReminderTime={setMorningReminderTime}
                eveningReminderTime={eveningReminderTime}
                setEveningReminderTime={setEveningReminderTime}
                reminderDuration={reminderDuration}
                setReminderDuration={setReminderDuration}
                reminderSummary={reminderSummary}
                onOpenReminderModal={handleOpenReminderModal}
                isMobileView={isMobileView}
              />
            )}
            {isReadingMode && <ReadingTab currentDzikirList={currentDzikirList} counts={counts} showArabic={showArabic} fontSize={fontSize} fontSizeClasses={fontSizeClasses} showLatin={showLatin} showTranslation={showTranslation} showBenefitsSources={showBenefitsSources} handleIncrement={handleIncrement} setActiveDalil={setActiveDalil} dalilByTitle={dalilByTitle} progress={progress} activeTime={activeTime} setIsReadingMode={setIsReadingMode} setActiveTab={setActiveTab} tahlilTarget={tahlilTargetByTime[activeTime]} setTahlilTarget={setActiveTimeTahlilTarget} activeAutoCounter={activeAutoCounter} onToggleAutoCounter={toggleAutoCounter} />}
          </div>

          {!isReadingMode && <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-around items-center z-20 pb-safe shrink-0"><button onClick={handleOpenHome} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'home' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}><div className={`p-2 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-emerald-50' : 'bg-transparent'}`}><BookOpen className="w-6 h-6" /></div><span className="text-[10px] font-semibold">Dzikir</span></button><button onClick={handleOpenSettings} className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'settings' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}><div className={`p-2 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-emerald-50' : 'bg-transparent'}`}><Settings2 className="w-6 h-6" /></div><span className="text-[10px] font-semibold">Pengaturan</span></button></nav>}
        </div>

        {isInstallModalOpen && !isReadingMode && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/38 p-4" onClick={() => setIsInstallModalOpen(false)}>
            <div className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-xl animate-fade-in-up" onClick={(event) => event.stopPropagation()}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Install App</p>
                  <h3 className="mt-1 text-lg font-bold text-gray-900">Panduan instal aplikasi</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">Ikuti langkah berikut supaya Dzikir Harian bisa dibuka seperti aplikasi.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                  aria-label="Tutup panduan instal aplikasi"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="rounded-3xl bg-emerald-50/70 p-4">
                {isStandaloneMode === false && <p className="text-sm text-emerald-900">Tambahkan aplikasi ke Home Screen agar pengalaman membuka dzikir dan file kalender terasa seperti aplikasi native di perangkat Anda.</p>}
                {isMobileView && installPromptEvent ? <p className="mt-2 text-sm text-emerald-900">Setelah terpasang, Anda tetap bisa membuka file kalender pengingat kapan saja dari menu Pengaturan.</p> : null}
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  Tutup
                </button>

                {installPromptEvent ? (
                  <button
                    type="button"
                    onClick={handleInstallApp}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
                  >
                    <Download className="h-4 w-4" />
                    Install sekarang
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {isReminderModalOpen && !isReadingMode && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/38 p-4" onClick={() => setIsReminderModalOpen(false)}>
            <div className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-xl animate-fade-in-up" onClick={(event) => event.stopPropagation()}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">Reminder Dzikir</p>
                  <h3 className="mt-1 text-lg font-bold text-gray-900">Buat Pengingat Dzikir</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">Atur waktu dzikir pagi dan petang, lalu export menjadi kalender pengingat yang siap diimpor.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
                  aria-label="Tutup popup pengingat dzikir"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-2 text-sm font-medium text-gray-700">
                    <span>Dzikir pagi</span>
                    <input type="time" value={morningReminderTime} onChange={(e) => setMorningReminderTime(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition-colors focus:border-emerald-400 focus:bg-white" />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-gray-700">
                    <span>Dzikir petang</span>
                    <input type="time" value={eveningReminderTime} onChange={(e) => setEveningReminderTime(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 outline-none transition-colors focus:border-emerald-400 focus:bg-white" />
                  </label>
                </div>

                <div className="space-y-2 text-sm font-medium text-gray-700">
                  <span>Durasi pengingat</span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ['day', '1 hari'],
                      ['week', '1 minggu'],
                      ['month', '1 bulan'],
                    ].map(([value, title]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReminderDuration(value)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${reminderDuration === value ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-100' : 'border-gray-200 bg-gray-50 hover:bg-white'}`}
                      >
                        <div className="font-semibold text-gray-800">{title}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-50/70 p-4">
                  <p className="text-sm font-semibold text-emerald-900">Ringkasan export</p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-700">{reminderSummary}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleExportReminderCalendar}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
                >
                  <Download className="h-4 w-4" />
                  Buat Pengingat Dzikir
                </button>
              </div>
            </div>
          </div>
        )}

        {activeDalil && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setActiveDalil(null)}><div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-gray-100 p-5 sm:p-6" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between gap-3 mb-4"><div><p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Dalil dari sumber</p><h3 className="text-lg font-bold text-gray-900">{activeDalil.title}</h3></div><button type="button" onClick={() => setActiveDalil(null)} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center" aria-label="Tutup popup dalil"><X className="w-5 h-5" /></button></div><div className="bg-gray-50 rounded-2xl p-4 space-y-3"><p className="text-sm text-gray-700 leading-relaxed">{activeDalil.dalil}</p><p className="text-xs text-gray-500"><span className="font-semibold">Referensi:</span> {activeDalil.source}</p></div></div></div>}
      </div>
    </div>
  );
}
