const DURATION_PRESETS = {
  day: { label: '1 hari (besok)', days: 1 },
  week: { label: '1 minggu', days: 7 },
  month: { label: '1 bulan', days: 30 },
};

const MOTIVATION_LINES = [
  'Luangkan sejenak untuk berdzikir, karena hati yang mengingat Allah akan terasa lebih tenang.',
  'Dzikir hari ini adalah jeda yang menenangkan jiwa di tengah kesibukan.',
  'Satu dzikir yang rutin lebih baik daripada niat baik yang terus ditunda.',
  'Tenangkan hati, lembutkan lisan, dan isi hari dengan mengingat Allah.',
  'Mulai kembali dengan dzikir; sedikit tapi istiqamah akan terasa besar nilainya.',
];

const pad = (value) => String(value).padStart(2, '0');

const escapeIcsText = (value) => String(value)
  .replace(/\\/g, '\\\\')
  .replace(/\n/g, '\\n')
  .replace(/,/g, '\\,')
  .replace(/;/g, '\\;');

const formatDateForIcs = (date) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;

const getDurationLabel = (durationKey) => DURATION_PRESETS[durationKey]?.label || DURATION_PRESETS.week.label;

const distributeTimes = (baseHour, baseMinute, frequencyPerDay) => {
  const baseTotalMinutes = (baseHour * 60) + baseMinute;
  const latestTotalMinutes = 21 * 60;

  if (frequencyPerDay <= 1 || baseTotalMinutes >= latestTotalMinutes) {
    return [baseTotalMinutes];
  }

  const step = Math.max(90, Math.floor((latestTotalMinutes - baseTotalMinutes) / Math.max(1, frequencyPerDay - 1)));

  return Array.from({ length: frequencyPerDay }, (_, index) => {
    const totalMinutes = Math.min(latestTotalMinutes, baseTotalMinutes + (step * index));
    return totalMinutes;
  });
};

const getReminderOccurrences = ({ time, frequencyPerDay, durationKey }) => {
  const [hourString, minuteString] = time.split(':');
  const baseHour = Number(hourString || 5);
  const baseMinute = Number(minuteString || 30);
  const totalDays = DURATION_PRESETS[durationKey]?.days || DURATION_PRESETS.week.days;
  const timesPerDay = distributeTimes(baseHour, baseMinute, frequencyPerDay);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1);
  startDate.setHours(0, 0, 0, 0);

  return Array.from({ length: totalDays }, (_, dayIndex) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayIndex);

    return timesPerDay.map((totalMinutes, reminderIndex) => {
      const date = new Date(currentDate);
      date.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);

      return {
        date,
        reminderIndex,
      };
    });
  }).flat();
};

const buildEventDescription = ({ durationKey, frequencyPerDay, reminderIndex }) => {
  const motivation = MOTIVATION_LINES[reminderIndex % MOTIVATION_LINES.length];

  return [
    'Pengingat dzikir harian.',
    `Durasi pengingat: ${getDurationLabel(durationKey)}.`,
    `Frekuensi: ${frequencyPerDay} kali per hari.`,
    motivation,
  ].join('\n');
};

export const getReminderSummary = ({ time, frequencyPerDay, durationKey }) => {
  const occurrences = getReminderOccurrences({ time, frequencyPerDay, durationKey });
  const durationLabel = getDurationLabel(durationKey);

  return `Kalender akan dibuat untuk ${occurrences.length} pengingat, dimulai besok pukul ${time}, sebanyak ${frequencyPerDay} kali per hari selama ${durationLabel.toLowerCase()}.`;
};

export const downloadReminderCalendar = ({ time, frequencyPerDay, durationKey }) => {
  const occurrences = getReminderOccurrences({ time, frequencyPerDay, durationKey });
  const createdAt = formatDateForIcs(new Date());
  const events = occurrences.map(({ date, reminderIndex }, index) => {
    const endDate = new Date(date.getTime() + (15 * 60 * 1000));
    const description = buildEventDescription({ durationKey, frequencyPerDay, reminderIndex: index + reminderIndex });

    return [
      'BEGIN:VEVENT',
      `UID:dzikir-${date.getTime()}-${index}@dzikirharian.app`,
      `DTSTAMP:${createdAt}`,
      `DTSTART:${formatDateForIcs(date)}`,
      `DTEND:${formatDateForIcs(endDate)}`,
      `SUMMARY:${escapeIcsText('Pengingat Dzikir Harian')}`,
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
