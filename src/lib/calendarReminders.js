const DURATION_PRESETS = {
  day: { label: '1 hari (besok)', days: 1 },
  week: { label: '1 minggu', days: 7 },
  month: { label: '1 bulan', days: 30 },
};

const MOTIVATION_LINES = {
  pagi: [
    'Awali pagi dengan dzikir agar hati lebih tenang dan langkah hari ini lebih berkah.',
    'Dzikir pagi adalah penguat hati sebelum memulai aktivitas.',
    'Mulailah hari dengan mengingat Allah, agar jiwa terasa ringan dan lapang.',
  ],
  petang: [
    'Tutup sore dengan dzikir agar hati lebih damai dan lelah terasa menenangkan.',
    'Dzikir petang membantu menutup hari dengan syukur dan ketenangan.',
    'Luangkan sejenak di petang hari untuk dzikir dan menenangkan jiwa.',
  ],
};

const pad = (value) => String(value).padStart(2, '0');

const escapeIcsText = (value) => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n')
  .replace(/,/g, '\\,')
  .replace(/;/g, '\\;');

const formatDateForIcs = (date) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;

const getDurationLabel = (durationKey) => DURATION_PRESETS[durationKey]?.label || DURATION_PRESETS.week.label;

const createEventTime = (baseDate, time) => {
  const [hourString, minuteString] = time.split(':');
  const date = new Date(baseDate);
  date.setHours(Number(hourString || 0), Number(minuteString || 0), 0, 0);
  return date;
};

const getReminderOccurrences = ({ morningTime, eveningTime, durationKey }) => {
  const totalDays = DURATION_PRESETS[durationKey]?.days || DURATION_PRESETS.week.days;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);

  return Array.from({ length: totalDays }, (_, dayIndex) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayIndex);

    return [
      {
        date: createEventTime(currentDate, morningTime),
        type: 'pagi',
      },
      {
        date: createEventTime(currentDate, eveningTime),
        type: 'petang',
      },
    ];
  }).flat();
};

const buildEventDescription = ({ type, occurrenceIndex }) => {
  const motivationList = MOTIVATION_LINES[type];
  const motivation = motivationList[occurrenceIndex % motivationList.length];
  const title = type === 'pagi' ? 'Dzikir pagi' : 'Dzikir petang';

  return [
    `Pengingat ${title}.`,
    motivation,
  ].join('\n');
};

export const getReminderSummary = ({ morningTime, eveningTime, durationKey }) => {
  const occurrences = getReminderOccurrences({ morningTime, eveningTime, durationKey });
  const durationLabel = getDurationLabel(durationKey);

  return `Kalender akan dibuat untuk ${occurrences.length} pengingat: dzikir pagi pukul ${morningTime} dan dzikir petang pukul ${eveningTime}, dimulai besok selama ${durationLabel.toLowerCase()}.`;
};

export const downloadReminderCalendar = ({ morningTime, eveningTime, durationKey }) => {
  const occurrences = getReminderOccurrences({ morningTime, eveningTime, durationKey });
  const createdAt = formatDateForIcs(new Date());
  const events = occurrences.map(({ date, type }, index) => {
    const endDate = new Date(date.getTime() + (15 * 60 * 1000));
    const description = buildEventDescription({ type, occurrenceIndex: index });
    const title = type === 'pagi' ? 'Pengingat Dzikir Pagi' : 'Pengingat Dzikir Petang';

    return [
      'BEGIN:VEVENT',
      `UID:dzikir-${type}-${date.getTime()}-${index}@dzikirharian.app`,
      `DTSTAMP:${createdAt}`,
      `DTSTART:${formatDateForIcs(date)}`,
      `DTEND:${formatDateForIcs(endDate)}`,
      `SUMMARY:${escapeIcsText(title)}`,
      `DESCRIPTION:${escapeIcsText(description)}`,
      `LOCATION:${escapeIcsText('Dzikir Harian')}`,
      'END:VEVENT',
    ].join('\r\n');
  }).join('\r\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dzikir Harian//Kalender Pengingat//ID',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pengingat-dzikir-${durationKey}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
