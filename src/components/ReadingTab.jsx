import React, { memo, useCallback } from 'react';
import { Check, Pause, Play } from 'lucide-react';

const getAutoIntervalLabel = (seconds) => `${seconds.toFixed(1).replace('.0', '')} detik`;

const ReadingItem = memo(function ReadingItem({
  dzikir,
  index,
  currentCount,
  showArabic,
  fontSize,
  fontSizeClasses,
  showLatin,
  showTranslation,
  showBenefitsSources,
  onIncrement,
  onOpenDalil,
  tahlilTarget,
  setTahlilTarget,
  autoCountConfig,
  activeAutoCounter,
  onToggleAutoCounter,
}) {
  const isCompleted = currentCount >= dzikir.target;
  const isAutoCountEnabled = autoCountConfig && !isCompleted;
  const isAutoCounting = isAutoCountEnabled && activeAutoCounter === dzikir.id;

  return (
    <div id={`dzikir-${dzikir.id}`} className={`dzikir-card bg-white rounded-[2rem] shadow-sm border overflow-hidden relative transition-all duration-500 ${isCompleted ? 'border-emerald-200 ring-1 ring-emerald-50 opacity-70' : 'border-gray-100'}`}>
      <div className="px-5 py-4 border-b border-gray-50 flex items-start justify-between gap-3 bg-gray-50/50">
        <div className="flex min-w-0 items-start gap-3 flex-1">
          <span className={`mt-0.5 w-8 h-8 rounded-full flex shrink-0 items-center justify-center text-xs font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{index + 1}</span>
          <h3 className="min-w-0 flex-1 font-bold text-gray-800 leading-snug whitespace-normal break-words text-[15px] sm:text-base">{dzikir.title}</h3>
        </div>
        <div className="shrink-0 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">{dzikir.target}x</div>
      </div>
      <div className="p-6 space-y-6">
        {showArabic && <div dir="rtl" className={`text-right text-gray-900 leading-[2.5] ${fontSizeClasses[fontSize]}`} style={{ fontFamily: "'Scheherazade New', 'Amiri', 'Traditional Arabic', serif" }}>{dzikir.arabic}</div>}
        {(showLatin || showTranslation) && <div className={`space-y-4 ${showArabic ? 'pt-4 border-t border-dashed border-gray-200' : ''}`}>{showLatin && <div className="text-emerald-800/90 italic font-medium leading-relaxed text-[15px]">{dzikir.latin}</div>}{showTranslation && <div className="text-gray-600 leading-relaxed text-[15px]">{dzikir.translation}</div>}</div>}
        {showBenefitsSources && (dzikir.fadhilah || dzikir.source) && <div className="bg-gray-50 rounded-2xl p-4 text-sm mt-6"><div className="space-y-3 break-words"><div>{dzikir.fadhilah && <p className="text-gray-700"><strong className="font-semibold text-amber-600">💡 Keutamaan: </strong>{dzikir.fadhilah}</p>}</div>{dzikir.source && <div className="text-gray-500 text-xs leading-relaxed"><button type="button" onClick={() => onOpenDalil(dzikir)} className="text-left hover:text-gray-700 break-words"><strong className="font-semibold">📚 Sumber: </strong><span className="underline underline-offset-2 decoration-dotted break-words">{dzikir.source}</span></button></div>}</div></div>}
        {dzikir.targetOptions && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 mb-2">Pilihan jumlah bacaan</p>
            <div className="flex gap-2">
              {[10, 100].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setTahlilTarget(option)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tahlilTarget === option ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-100'}`}
                >
                  {option}x
                </button>
              ))}
            </div>
          </div>
        )}

        {isAutoCountEnabled && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Hitung Otomatis</p>
                <p className="mt-1 text-sm text-emerald-900">Tambah hitungan tiap {getAutoIntervalLabel(autoCountConfig.intervalMs / 1000)}.</p>
              </div>
              <button
                type="button"
                onClick={() => onToggleAutoCounter(dzikir.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${isAutoCounting ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-100'}`}
              >
                {isAutoCounting ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isAutoCounting ? 'Berhenti' : 'Mulai'}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 bg-gray-50/50 flex flex-col gap-3"><button onClick={() => onIncrement(dzikir.id, dzikir.target, index)} disabled={isCompleted} className={`relative w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 overflow-hidden group ${isCompleted ? 'bg-emerald-500 text-white cursor-default' : 'bg-gray-900 text-white shadow-md hover:bg-gray-800 active:bg-gray-700'}`}>{isCompleted ? <><Check className="w-6 h-6 animate-scale-in" /> Selesai</> : <>Hitung ({currentCount}/{dzikir.target})</>}{!isCompleted && <div className="absolute inset-0 bg-white/20 opacity-0 active:opacity-100 transition-opacity" />}</button></div>
    </div>
  );
}, (prevProps, nextProps) => (
  prevProps.dzikir === nextProps.dzikir
  && prevProps.index === nextProps.index
  && prevProps.currentCount === nextProps.currentCount
  && prevProps.showArabic === nextProps.showArabic
  && prevProps.fontSize === nextProps.fontSize
  && prevProps.showLatin === nextProps.showLatin
  && prevProps.showTranslation === nextProps.showTranslation
  && prevProps.showBenefitsSources === nextProps.showBenefitsSources
  && prevProps.tahlilTarget === nextProps.tahlilTarget
  && prevProps.activeAutoCounter === nextProps.activeAutoCounter
));

function ReadingTab({ currentDzikirList, counts, showArabic, fontSize, fontSizeClasses, showLatin, showTranslation, showBenefitsSources, handleIncrement, setActiveDalil, dalilByTitle, progress, activeTime, setIsReadingMode, setActiveTab, tahlilTarget, setTahlilTarget, activeAutoCounter, onToggleAutoCounter }) {
  const handleOpenDalil = useCallback((dzikir) => {
    setActiveDalil({
      title: dzikir.title,
      source: dzikir.source,
      dalil: dalilByTitle[dzikir.title] || 'Dalil lengkap belum tersedia untuk dzikir ini.',
    });
  }, [dalilByTitle, setActiveDalil]);

  const handleBackHome = useCallback(() => {
    setIsReadingMode(false);
    setActiveTab('home');
  }, [setActiveTab, setIsReadingMode]);

  const autoCounterByTitle = {
    Tasbih: { intervalMs: 2500 },
    Istighfar: { intervalMs: 3000 },
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in-up pb-[calc(env(safe-area-inset-bottom,16px)+2rem)]">
      {currentDzikirList.map((dzikir, index) => (
        <ReadingItem
          key={dzikir.id}
          dzikir={dzikir}
          index={index}
          currentCount={counts[dzikir.id] || 0}
          showArabic={showArabic}
          fontSize={fontSize}
          fontSizeClasses={fontSizeClasses}
          showLatin={showLatin}
          showTranslation={showTranslation}
          showBenefitsSources={showBenefitsSources}
          onIncrement={handleIncrement}
          onOpenDalil={handleOpenDalil}
          tahlilTarget={tahlilTarget}
          setTahlilTarget={setTahlilTarget}
          autoCountConfig={autoCounterByTitle[dzikir.title]}
          activeAutoCounter={activeAutoCounter}
          onToggleAutoCounter={onToggleAutoCounter}
        />
      ))}
      {progress === 100 && <div className="bg-emerald-50 rounded-[2rem] p-8 text-center border-2 border-emerald-100 animate-fade-in-up mt-8 mb-8"><div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 animate-scale-in" /></div><h2 className="text-2xl font-bold text-emerald-900 mb-3">Alhamdulillah!</h2><p className="text-emerald-700 font-medium mb-8">Anda telah menyelesaikan seluruh rangkaian dzikir {activeTime} ini.</p><button onClick={handleBackHome} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200">Kembali ke Beranda</button></div>}
    </div>
  );
}

export default memo(ReadingTab);
