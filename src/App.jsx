import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Sun, Moon, Check, RotateCcw, Settings2, Languages, AlignLeft, BookOpen, X, ChevronRight, Info, Type, Download, BellRing } from 'lucide-react';
import appLogo from './assets/app-logo.png';

const STORAGE_KEYS = {
  nightView: 'dzikir_night_view',
  fontSize: 'dzikir_font_size',
  showArabic: 'dzikir_show_arabic',
  showLatin: 'dzikir_show_latin',
  showTranslation: 'dzikir_show_translation',
  remindersEnabled: 'dzikir_reminders_enabled',
};

const isStandaloneDisplay = () => {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
};

const getLocalDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

const getCountsStorageKey = (time, dateKey) => `dzikir_counts_${time}_${dateKey}`;

const getMsUntilNextTrigger = (hour, minute) => {
  const now = new Date();
  const trigger = new Date(now);
  trigger.setHours(hour, minute, 0, 0);

  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }

  return trigger.getTime() - now.getTime();
};

// --- DATA DZIKIR (Super Lengkap) ---
const dzikirData = {
  pagi: [
    {
      id: 'p0',
      title: 'Membaca Ta\'awudz',
      arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
      latin: 'A\'udzu billahi minasy-syaithoonir rojiim.',
      translation: 'Aku berlindung kepada Allah dari godaan syaitan yang terkutuk.',
      target: 1,
    },
    {
      id: 'p1',
      title: 'Membaca Ayat Kursi',
      arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      latin: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khudzuhū sinatun wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ, man dzalladzī yasyfa'u 'indahū illā bi-idznih, ya'lamu mā baina aidīhim wa mā khalfahum, wa lā yuḥīṭūna bisyai'im min 'ilmihī illā bimā syā', wasi'a kursiyyuhus-samāwāti wal-arḍ, wa lā ya'ūduhū ḥifzhuhumā, wa huwal-'aliyyul-'aẓīm.",
      translation: 'Allah, tidak ada tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya); tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang di langit dan di bumi. Tiada yang dapat memberi syafa\'at di sisi Allah tanpa izin-Nya? Allah mengetahui apa-apa yang di hadapan mereka dan di belakang mereka, dan mereka tidak mengetahui apa-apa dari ilmu Allah melainkan apa yang dikehendaki-Nya. Kursi Allah meliputi langit dan bumi. Dan Allah tidak merasa berat memelihara keduanya, dan Allah Maha Tinggi lagi Maha Besar.',
      fadhilah: 'Siapa yang membacanya di pagi hari, maka ia akan dilindungi dari (gangguan) jin hingga petang.',
      source: 'HR. Al-Hakim (1/562). Dishahihkan oleh Al-Albani dalam Shahih At-Targhib wa At-Tarhib (1/273).',
      target: 1,
    },
    {
      id: 'p2',
      title: 'Membaca Surah Al-Ikhlas',
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ هُوَ اللَّهُ أَحَدٌ ۝١ اللَّهُ الصَّمَدُ ۝٢ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝٣ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ۝٤',
      latin: 'Bismillāhir-raḥmānir-raḥīm. Qul huwallāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakul lahū kufuwan aḥad.',
      translation: 'Katakanlah: "Dialah Allah, Yang Maha Esa. Allah adalah Tuhan yang bergantung kepada-Nya segala sesuatu. Dia tiada beranak dan tidak pula diperanakkan, dan tidak ada seorangpun yang setara dengan Dia."',
      fadhilah: 'Membaca Al-Ikhlas, Al-Falaq, dan An-Naas pagi dan sore 3x cukuplah baginya (penjagaan) dari segala sesuatu.',
      source: 'HR. Abu Dawud no. 5082, Tirmidzi no. 3575, dan An-Nasa\'i no. 5428.',
      target: 3,
    },
    {
      id: 'p3',
      title: 'Membaca Surah Al-Falaq',
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝١ مِن شَرِّ مَا خَلَقَ ۝٢ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝٣ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝٤ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ۝٥',
      latin: 'Bismillāhir-raḥmānir-raḥīm. Qul a‘ūżu birabbil-falaq. Min syarri mā khalaq. Wa min syarri gāsiqin iżā waqab. Wa min syarrin-naffāṡāti fil-‘uqad. Wa min syarri ḥāsidin iżā ḥasad.',
      translation: 'Katakanlah: "Aku berlindung kepada Tuhan Yang Menguasai subuh, dari kejahatan makhluk-Nya, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan wanita-wanita tukang sihir yang menghembus pada buhul-buhul, dan dari kejahatan pendengki bila ia dengki."',
      source: 'HR. Abu Dawud no. 5082, Tirmidzi no. 3575, dan An-Nasa\'i no. 5428.',
      target: 3,
    },
    {
      id: 'p4',
      title: 'Membaca Surah An-Naas',
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝١ مَلِكِ النَّاسِ ۝٢ إِلَٰهِ النَّاسِ ۝٣ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝٤ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝٥ مِنَ الْجِنَّةِ وَالنَّاسِ ۝٦',
      latin: 'Bismillāhir-raḥmānir-raḥīm. Qul a‘ūżu birabbin-nās. Malikin-nās. Ilāhin-nās. Min syarril-waswāsil-khannās. Allażī yuwaswisu fī ṣudūrin-nās. Minal-jinnati wan-nās.',
      translation: 'Katakanlah: "Aku berlindung kepada Tuhan (yang memelihara dan menguasai) manusia. Raja manusia. Sembahan manusia. Dari kejahatan (bisikan) syaitan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia."',
      source: 'HR. Abu Dawud no. 5082, Tirmidzi no. 3575, dan An-Nasa\'i no. 5428.',
      target: 3,
    },
    {
      id: 'p5',
      title: 'Doa Memasuki Pagi Hari',
      arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
      latin: 'Aṣbaḥnā wa aṣbaḥal-mulku lillāh, wal-ḥamdulillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa ‘alā kulli syai’in qadīr. Rabbi as’aluka khaira mā fī hāżal-yaum wa khaira mā ba‘dahu, wa a‘ūżubika min syarri mā fī hāżal-yaumi wa syarri mā ba‘dahu. Rabbi a‘ūżubika minal-kasali wa sū’il-kibar. Rabbi a‘ūżubika min ‘ażābin fin-nāri wa ‘ażābin fil-qabr.',
      translation: 'Kami telah memasuki waktu pagi dan kerajaan hanya milik Allah, segala puji bagi Allah. Tidak ada ilah (yang berhak disembah) kecuali Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan bagi-Nya pujian. Dia-lah Yang Mahakuasa atas segala sesuatu. Wahai Tuhanku, aku mohon kepada-Mu kebaikan di hari ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan hari ini dan kejahatan sesudahnya. Wahai Tuhanku, aku berlindung kepada-Mu dari kemalasan dan kejelekan di hari tua. Wahai Tuhanku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di alam kubur.',
      source: 'HR. Muslim no. 2723.',
      target: 1,
    },
    {
      id: 'p6',
      title: 'Doa Perlindungan Pagi',
      arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
      latin: 'Allāhumma bika aṣbaḥnā, wa bika amsainā, wa bika naḥyā, wa bika namūtu wa ilaikan-nusyūr.',
      translation: 'Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu sore. Dengan rahmat dan pertolongan-Mu kami hidup dan dengan kehendak-Mu kami mati. Dan kepada-Mu kebangkitan (bagi semua makhluk).',
      source: 'HR. Tirmidzi no. 3391 dan Abu Dawud no. 5068.',
      target: 1,
    },
    {
      id: 'p7',
      title: 'Sayyidul Istighfar',
      arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      latin: 'Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa anā ‘abduka, wa anā ‘alā ‘ahdika wa wa‘dika mastaṭa‘tu, a‘ūżubika min syarri mā ṣana‘tu, abū\'u laka bini‘matika ‘alayya, wa abū\'u biżambī faghfirlī fa’innahū lā yaghfiruz-żunūba illā anta.',
      translation: 'Ya Allah, Engkau adalah Rabbku, tidak ada tuhan yang berhak disembah kecuali Engkau. Engkaulah yang menciptakanku dan aku adalah hamba-Mu. Aku akan setia pada perjanjianku dengan-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang kuperbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, oleh karena itu ampunilah aku. Sesungguhnya tiada yang mengampuni dosa-dosa selain Engkau.',
      source: 'HR. Bukhari no. 6306.',
      target: 1,
    },
    {
      id: 'p_new1',
      title: 'Doa Mempersaksikan Allah (4x)',
      arabic: 'اَللَّهُمَّ إِنِّيْ أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ وَجَمِيْعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ لاَ إِلَـهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيْكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُوْلُكَ',
      latin: 'Allahumma inni ash-bahtu usy-hiduka wa usy-hidu hamalata \'arsyika wa malaa-ikatak wa jami\'a kholqik, annaka antallahu laa ilaha illa anta wahdaka laa syariika lak, wa anna Muhammadan \'abduka wa rosuuluk.',
      translation: 'Ya Allah, sesungguhnya aku di waktu pagi ini mempersaksikan Engkau, malaikat yang memikul \'Arys-Mu, malaikat-malaikat dan seluruh makhluk-Mu, bahwa sesungguhnya Engkau adalah Allah, tiada ilah yang berhak disembah kecuali Engkau semata, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu.',
      fadhilah: 'Barangsiapa yang mengucapkan dzikir ini ketika pagi dan petang hari sebanyak empat kali, maka Allah akan membebaskan dirinya dari siksa neraka.',
      source: 'HR. Abu Dawud no. 5069.',
      target: 4,
    },
    {
      id: 'p8',
      title: 'Doa Keselamatan (Al-\'Afiyah)',
      arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
      latin: 'Allāhumma innī as\'alukal-‘āfiyata fid-dunyā wal-ākhirah. Allāhumma innī as\'alukal-‘afwa wal-‘āfiyata fī dīnī wa dunyāya wa ahlī wa mālī. Allāhummastur ‘aurātī wa āmin rau‘ātī. Allāhummaḥfażnī mim baini yadayya wa min khalfī wa ‘an yamīnī wa ‘an syimālī wa min fauqī wa a‘ūżu bi‘ażamatika an ugtāla min taḥtī.',
      translation: 'Ya Allah, sesungguhnya aku memohon keselamatan di dunia dan akhirat. Ya Allah, sesungguhnya aku memohon ampunan dan keselamatan dalam agamaku, (kehidupan) duniaku, keluargaku, dan hartaku. Ya Allah, tutupilah aibku dan berilah ketenteraman di hatiku. Ya Allah, jagalah aku dari depan, belakang, kanan, kiri, dan atasku, serta aku berlindung dengan kebesaran-Mu agar tidak ditenggelamkan ke dalam bumi dari bawahku.',
      source: 'HR. Abu Dawud no. 5074 dan Ibnu Majah no. 3871.',
      target: 1,
    },
    {
      id: 'p_new2',
      title: 'Doa Berlindung dari Godaan Setan',
      arabic: 'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
      latin: 'Allahumma \'aalimal ghoibi wasy-syahaadah faathiros samaawaati wal ardh. Robba kulli syai-in wa maliikah. Asyhadu alla ilaha illa anta. A\'udzu bika min syarri nafsii wa min syarrisy-syaithooni wa syirkihi, wa an aqtarifo \'alaa nafsii suu-an aw ajurrohu ilaa muslim.',
      translation: 'Ya Allah, Yang Maha Mengetahui yang ghaib dan yang nyata, wahai Pencipta langit dan bumi, Tuhan segala sesuatu dan yang merajainya. Aku bersaksi bahwa tidak ada ilah yang berhak disembah kecuali Engkau. Aku berlindung kepada-Mu dari kejahatan diriku, setan dan balatentaranya, dan aku (berlindung kepada-Mu) dari berbuat kejelekan terhadap diriku atau menyeretnya kepada seorang muslim.',
      fadhilah: 'Doa perlindungan komprehensif dari keburukan diri sendiri dan godaan setan.',
      source: 'HR. Tirmidzi no. 3392 dan Abu Dawud no. 5067.',
      target: 1,
    },
    {
      id: 'p9',
      title: 'Doa Memohon Kesehatan (3x)',
      arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
      latin: 'Allāhumma ‘āfinī fī badanī, Allāhumma ‘āfinī fī sam‘ī, Allāhumma ‘āfinī fī baṣarī, lā ilāha illā anta. Allāhumma innī a‘ūżubika minal-kufri wal-faqr, wa a‘ūżubika min ‘ażābil-qabr, lā ilāha illā anta.',
      translation: 'Ya Allah, selamatkanlah tubuhku (dari penyakit dan cacat). Ya Allah, selamatkanlah pendengaranku. Ya Allah, selamatkanlah penglihatanku. Tidak ada ilah (yang berhak disembah) kecuali Engkau. Ya Allah, sesungguhnya aku berlindung kepada-Mu dari kekufuran dan kefakiran. Aku berlindung kepada-Mu dari siksa kubur. Tidak ada ilah (yang berhak disembah) kecuali Engkau.',
      source: 'HR. Abu Dawud no. 5090, Ahmad (5/42).',
      target: 3,
    },
    {
      id: 'p10',
      title: 'Doa Kecukupan (7x)',
      arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
      latin: 'Ḥasbiyallāhu lā ilāha illā huwa ‘alaihi tawakkaltu wa huwa rabbul-‘arsyil-‘aẓīm.',
      translation: 'Cukuplah Allah bagiku; tidak ada ilah (yang berhak disembah) melainkan Dia. Hanya kepada-Nya aku bertawakkal dan Dia adalah Tuhan yang memiliki \'Arsy yang agung.',
      fadhilah: 'Barangsiapa membacanya di pagi dan petang sebanyak 7 kali, maka Allah akan mencukupinya dari apa yang menyusahkannya dari urusan dunia dan akhirat.',
      source: 'HR. Ibnu As-Sunni no. 71, Abu Dawud no. 5081.',
      target: 7,
    },
    {
      id: 'p11',
      title: 'Membaca Bismillahilladzi (3x)',
      arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      latin: 'Bismillāhillażī lā yaḍurru ma‘asmihī syai\'un fil-arḍi wa lā fis-samā\'i wa huwas-samī‘ul-‘alīm.',
      translation: 'Dengan nama Allah yang bila disebut, segala sesuatu di bumi dan langit tidak akan berbahaya, Dia-lah Yang Maha Mendengar lagi Maha Mengetahui.',
      source: 'HR. Abu Dawud no. 5088, Tirmidzi no. 3388, dan Ibnu Majah no. 3869.',
      target: 3,
    },
    {
      id: 'p12',
      title: 'Doa Ridha Kepada Allah (3x)',
      arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
      latin: 'Raḍītu billāhi rabbā, wa bil-islāmi dīnā, wa bimuḥammadin ṣallallāhu ‘alaihi wa sallama nabiyyā.',
      translation: 'Aku rela Allah sebagai Tuhan, Islam sebagai agama, dan Muhammad shallallahu ‘alaihi wa sallam sebagai Nabi.',
      source: 'HR. Abu Dawud no. 5072, Tirmidzi no. 3389.',
      target: 3,
    },
    {
      id: 'p_new3',
      title: 'Memohon Perbaikan Urusan',
      arabic: 'يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ، وَأَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ وَلاَ تَكِلْنِيْ إِلَى نَفْسِيْ طَرْفَةَ عَيْنٍ أَبَدًا',
      latin: "Yā Ḥayyu Yā Qayyūm, biraḥmatika astaghīts, wa aṣliḥ lī sya'ni kullahū wa lā takilnī ilā nafsī ṭarfata 'ainin abadan.",
      translation: 'Wahai Rabb Yang Maha Hidup, wahai Rabb Yang Berdiri Sendiri (tidak butuh segala sesuatu), dengan rahmat-Mu aku minta pertolongan, perbaikilah segala urusanku dan jangan diserahkan kepadaku sekali pun sekejap mata (tanpa mendapat pertolongan dari-Mu).',
      fadhilah: 'Dzikir yang diajarkan oleh Nabi ﷺ pada Fathimah supaya diamalkan pagi dan petang agar senantiasa mendapat pertolongan Allah.',
      source: 'HR. Ibnu As-Sunni no. 46, An Nasai, Al Hakim.',
      target: 1,
    },
    {
      id: 'p_new4',
      title: 'Syukur Atas Nikmat Islam',
      arabic: 'أَصْبَحْنَا عَلَى فِطْرَةِ اْلإِسْلاَمِ وَعَلَى كَلِمَةِ اْلإِخْلاَصِ، وَعَلَى دِيْنِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِيْنَا إِبْرَاهِيْمَ، حَنِيْفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِيْنَ',
      latin: "Aṣbaḥnā 'alā fiṭratil-islām, wa 'alā kalimatil-ikhlāṣ, wa 'alā dīni nabiyyinā Muḥammadin ṣallallāhu 'alaihi wa sallam, wa 'alā millati abīnā Ibrāhīma ḥanīfan musliman wa mā kāna minal-musyrikīn.",
      translation: 'Di waktu pagi kami memegang agama Islam, kalimat ikhlas (kalimat syahadat), agama Nabi kami Muhammad ﷺ, dan agama bapak kami Ibrahim, yang berdiri di atas jalan yang lurus, muslim dan tidak tergolong orang-orang musyrik.',
      fadhilah: 'Pernyataan keteguhan di atas agama tauhid dan rasa syukur atas nikmat iman di pagi hari.',
      source: 'HR. Ahmad (3: 406), shahih sesuai syarat Bukhari Muslim.',
      target: 1,
    },
    {
      id: 'p13',
      title: 'Dzikir Khusus Pagi (1): Ilmu & Rezeki',
      arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
      latin: 'Allāhumma innī as\'aluka ‘ilman nāfi‘ā, wa rizqan ṭayyibā, wa ‘amalam mutaqabbalā.',
      translation: 'Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.',
      source: 'HR. Ibnu Majah no. 925.',
      target: 1,
    },
    {
      id: 'p14',
      title: 'Dzikir Khusus Pagi (2): Tasbih (3x)',
      arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
      latin: 'Subḥānallāhi wa biḥamdih: ‘Adada khalqih, wa riḍā nafsih, wa zinata ‘arsyih, wa midāda kalimātih.',
      translation: 'Maha Suci Allah dan segala puji bagi-Nya, sebanyak bilangan makhluk-Nya, sejauh kerelaan Diri-Nya, seberat timbangan \'Arsy-Nya, dan sebanyak tinta (untuk menulis) kalimat-Nya.',
      source: 'HR. Muslim no. 2726.',
      target: 3,
    },
    {
      id: 'p15',
      title: 'Tasbih 100x',
      arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
      latin: 'Subḥānallāhi wa biḥamdih.',
      translation: 'Maha Suci Allah, aku memuji-Nya.',
      fadhilah: 'Barangsiapa membacanya 100x dalam sehari, maka diampuni dosa-dosanya sekalipun sebanyak buih di lautan.',
      source: 'HR. Bukhari no. 6405 dan Muslim no. 2691.',
      target: 100,
    },
    {
      id: 'p16',
      title: 'Tahlil 100x (Atau 10x)',
      arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      latin: 'Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa ‘alā kulli syai’in qadīr.',
      translation: 'Tidak ada ilah (yang berhak disembah) selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala pujian. Dan Dia Mahakuasa atas segala sesuatu.',
      source: 'HR. Bukhari no. 3293 dan Muslim no. 2691.',
      target: 10,
    },
    {
      id: 'p17',
      title: 'Istighfar 100x',
      arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
      latin: 'Astaghfirullāha wa atūbu ilaih.',
      translation: 'Aku memohon ampun kepada Allah dan bertaubat kepada-Nya.',
      source: 'HR. Bukhari no. 6307 dan Muslim no. 2702.',
      target: 100,
    }
  ],
  petang: [
    {
      id: 'pt0',
      title: 'Membaca Ta\'awudz',
      arabic: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
      latin: 'A\'udzu billahi minasy-syaithoonir rojiim.',
      translation: 'Aku berlindung kepada Allah dari godaan syaitan yang terkutuk.',
      target: 1,
    },
    {
      id: 'pt1',
      title: 'Membaca Ayat Kursi',
      arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
      latin: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khudzuhū sinatun wa lā nawm, lahū mā fis-samāwāti wa mā fil-arḍ, man dzalladzī yasyfa'u 'indahū illā bi-idznih, ya'lamu mā baina aidīhim wa mā khalfahum, wa lā yuḥīṭūna bisyai'im min 'ilmihī illā bimā syā', wasi'a kursiyyuhus-samāwāti wal-arḍ, wa lā ya'ūduhū ḥifzhuhumā, wa huwal-'aliyyul-'aẓīm.",
      translation: 'Allah, tidak ada tuhan (yang berhak disembah) melainkan Dia Yang Hidup kekal lagi terus menerus mengurus (makhluk-Nya); tidak mengantuk dan tidak tidur. Kepunyaan-Nya apa yang di langit dan di bumi. Tiada yang dapat memberi syafa\'at di sisi Allah tanpa izin-Nya? Allah mengetahui apa-apa yang di hadapan mereka dan di belakang mereka, dan mereka tidak mengetahui apa-apa dari ilmu Allah melainkan apa yang dikehendaki-Nya. Kursi Allah meliputi langit dan bumi. Dan Allah tidak merasa berat memelihara keduanya, dan Allah Maha Tinggi lagi Maha Besar.',
      fadhilah: 'Siapa yang membacanya di petang hari, maka ia akan dilindungi dari gangguan mereka (jin) hingga pagi.',
      source: 'HR. Al-Hakim (1/562). Dishahihkan oleh Al-Albani dalam Shahih At-Targhib wa At-Tarhib (1/273).',
      target: 1,
    },
    {
      id: 'pt2',
      title: 'Membaca Surah Al-Ikhlas',
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ هُوَ اللَّهُ أَحَدٌ ۝١ اللَّهُ الصَّمَدُ ۝٢ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝٣ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ۝٤',
      latin: 'Bismillāhir-raḥmānir-raḥīm. Qul huwallāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakul lahū kufuwan aḥad.',
      translation: 'Katakanlah: "Dialah Allah, Yang Maha Esa. Allah adalah Tuhan yang bergantung kepada-Nya segala sesuatu. Dia tiada beranak dan tidak pula diperanakkan, dan tidak ada seorangpun yang setara dengan Dia."',
      source: 'HR. Abu Dawud no. 5082, Tirmidzi no. 3575.',
      target: 3,
    },
    {
      id: 'pt3',
      title: 'Membaca Surah Al-Falaq',
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝١ مِن شَرِّ مَا خَلَقَ ۝٢ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝٣ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝٤ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ۝٥',
      latin: 'Bismillāhir-raḥmānir-raḥīm. Qul a‘ūżu birabbil-falaq. Min syarri mā khalaq. Wa min syarri gāsiqin iżā waqab. Wa min syarrin-naffāṡāti fil-‘uqad. Wa min syarri ḥāsidin iżā ḥasad.',
      translation: 'Katakanlah: "Aku berlindung kepada Tuhan Yang Menguasai subuh, dari kejahatan makhluk-Nya, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan wanita-wanita tukang sihir yang menghembus pada buhul-buhul, dan dari kejahatan pendengki bila ia dengki."',
      source: 'HR. Abu Dawud no. 5082, Tirmidzi no. 3575.',
      target: 3,
    },
    {
      id: 'pt4',
      title: 'Membaca Surah An-Naas',
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝١ مَلِكِ النَّاسِ ۝٢ إِلَٰهِ النَّاسِ ۝٣ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝٤ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝٥ مِنَ الْجِنَّةِ وَالنَّاسِ ۝٦',
      latin: 'Bismillāhir-raḥmānir-raḥīm. Qul a‘ūżu birabbin-nās. Malikin-nās. Ilāhin-nās. Min syarril-waswāsil-khannās. Allażī yuwaswisu fī ṣudūrin-nās. Minal-jinnati wan-nās.',
      translation: 'Katakanlah: "Aku berlindung kepada Tuhan (yang memelihara dan menguasai) manusia. Raja manusia. Sembahan manusia. Dari kejahatan (bisikan) syaitan yang biasa bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia."',
      source: 'HR. Abu Dawud no. 5082, Tirmidzi no. 3575.',
      target: 3,
    },
    {
      id: 'pt5',
      title: 'Doa Memasuki Petang Hari',
      arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
      latin: 'Amsainā wa amsal-mulku lillāh, wal-ḥamdulillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa ‘alā kulli syai’in qadīr. Rabbi as’aluka khaira mā fī hāżihil-lailati wa khaira mā ba‘dahā, wa a‘ūżubika min syarri mā fī hāżihil-lailati wa syarri mā ba‘dahā. Rabbi a‘ūżubika minal-kasali wa sū’il-kibar. Rabbi a‘ūżubika min ‘ażābin fin-nāri wa ‘ażābin fil-qabr.',
      translation: 'Kami telah memasuki waktu sore dan kerajaan hanya milik Allah, segala puji bagi Allah. Tidak ada ilah (yang berhak disembah) kecuali Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan bagi-Nya pujian. Dia-lah Yang Mahakuasa atas segala sesuatu. Wahai Tuhanku, aku mohon kepada-Mu kebaikan di malam ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan malam ini dan kejahatan sesudahnya. Wahai Tuhanku, aku berlindung kepada-Mu dari kemalasan dan kejelekan di hari tua. Wahai Tuhanku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di alam kubur.',
      source: 'HR. Muslim no. 2723.',
      target: 1,
    },
    {
      id: 'pt6',
      title: 'Doa Perlindungan Petang',
      arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
      latin: 'Allāhumma bika amsainā, wa bika aṣbaḥnā, wa bika naḥyā, wa bika namūtu wa ilaikal-maṣīr.',
      translation: 'Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu sore, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi. Dengan rahmat dan pertolongan-Mu kami hidup dan dengan kehendak-Mu kami mati. Dan kepada-Mu tempat kembali (bagi semua makhluk).',
      source: 'HR. Tirmidzi no. 3391 dan Abu Dawud no. 5068.',
      target: 1,
    },
    {
      id: 'pt7',
      title: 'Sayyidul Istighfar',
      arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
      latin: 'Allāhumma anta rabbī lā ilāha illā anta, khalaqtanī wa anā ‘abduka, wa anā ‘alā ‘ahdika wa wa‘dika mastaṭa‘tu, a‘ūżubika min syarri mā ṣana‘tu, abū\'u laka bini‘matika ‘alayya, wa abū\'u biżambī faghfirlī fa’innahū lā yaghfiruz-żunūba illā anta.',
      translation: 'Ya Allah, Engkau adalah Rabbku, tidak ada tuhan yang berhak disembah kecuali Engkau. Engkaulah yang menciptakanku dan aku adalah hamba-Mu. Aku akan setia pada perjanjianku dengan-Mu semampuku. Aku berlindung kepada-Mu dari keburukan yang kuperbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, oleh karena itu ampunilah aku. Sesungguhnya tiada yang mengampuni dosa-dosa selain Engkau.',
      source: 'HR. Bukhari no. 6306.',
      target: 1,
    },
    {
      id: 'pt_new1',
      title: 'Doa Mempersaksikan Allah (4x)',
      arabic: 'اَللَّهُمَّ إِنِّيْ أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ وَجَمِيْعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللهُ لاَ إِلَـهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيْكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُوْلُكَ',
      latin: 'Allahumma inni amsaytu usy-hiduka wa usy-hidu hamalata \'arsyika wa malaa-ikatak wa jami\'a kholqik, annaka antallahu laa ilaha illa anta wahdaka laa syariika lak, wa anna Muhammadan \'abduka wa rosuuluk.',
      translation: 'Ya Allah, sesungguhnya aku di waktu petang ini mempersaksikan Engkau, malaikat yang memikul \'Arys-Mu, malaikat-malaikat dan seluruh makhluk-Mu, bahwa sesungguhnya Engkau adalah Allah, tiada ilah yang berhak disembah kecuali Engkau semata, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu.',
      fadhilah: 'Barangsiapa yang mengucapkan dzikir ini ketika pagi dan petang hari sebanyak empat kali, maka Allah akan membebaskan dirinya dari siksa neraka.',
      source: 'HR. Abu Dawud no. 5069.',
      target: 4,
    },
    {
      id: 'pt8',
      title: 'Doa Keselamatan (Al-\'Afiyah)',
      arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
      latin: "Allāhumma innī as'alukal-‘āfiyata fid-dunyā wal-ākhirah, allāhumma innī as'alukal-‘afwa wal-‘āfiyata fī dīnī wa dunyāya wa ahlī wa mālī. Allāhumma-stur ‘aurātī wa āmin rau‘ātī. Allāhummaḥfaẓnī min baini yadayya, wa min khalfī, wa ‘an yamīnī, wa ‘an syimālī, wa min fauqī, wa a‘ūżu bi‘aẓamatika an ughtāla min taḥtī.",
      translation: 'Ya Allah, sesungguhnya aku memohon keselamatan di dunia dan akhirat. Ya Allah, sesungguhnya aku memohon ampunan dan keselamatan dalam urusan agamaku, duniaku, keluargaku, dan hartaku. Ya Allah, tutupilah auratku (aib dan kekuranganku), dan tenteramkanlah rasa takutku. Ya Allah, jagalah aku dari depanku, dari belakangku, dari kananku, dari kiriku, dan dari atasku. Aku berlindung dengan keagungan-Mu agar tidak disambar dari bawahku.',
      source: 'HR. Abu Dawud no. 5074 dan Ibnu Majah no. 3871.',
      target: 1,
    },
    {
      id: 'pt_new2',
      title: 'Doa Berlindung dari Godaan Setan',
      arabic: 'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
      latin: 'Allahumma \'aalimal ghoibi wasy-syahaadah faathiros samaawaati wal ardh. Robba kulli syai-in wa maliikah. Asyhadu alla ilaha illa anta. A\'udzu bika min syarri nafsii wa min syarrisy-syaithooni wa syirkihi, wa an aqtarifo \'alaa nafsii suu-an aw ajurrohu ilaa muslim.',
      translation: 'Ya Allah, Yang Maha Mengetahui yang ghaib dan yang nyata, wahai Pencipta langit dan bumi, Tuhan segala sesuatu dan yang merajainya. Aku bersaksi bahwa tidak ada ilah yang berhak disembah kecuali Engkau. Aku berlindung kepada-Mu dari kejahatan diriku, setan dan balatentaranya, dan aku (berlindung kepada-Mu) dari berbuat kejelekan terhadap diriku atau menyeretnya kepada seorang muslim.',
      fadhilah: 'Doa perlindungan komprehensif dari keburukan diri sendiri dan godaan setan.',
      source: 'HR. Tirmidzi no. 3392 dan Abu Dawud no. 5067.',
      target: 1,
    },
    {
      id: 'pt9',
      title: 'Doa Memohon Kesehatan (3x)',
      arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لَا إِلَهَ إِلَّا أَنْتَ',
      latin: 'Allāhumma ‘āfinī fī badanī, Allāhumma ‘āfinī fī sam‘ī, Allāhumma ‘āfinī fī baṣarī, lā ilāha illā anta. Allāhumma innī a‘ūżu bika minal-kufri wal-faqri, wa a‘ūżu bika min ‘ażābil-qabri, lā ilāha illā anta.',
      translation: 'Ya Allah, selamatkanlah tubuhku (dari penyakit dan cacat). Ya Allah, selamatkanlah pendengaranku. Ya Allah, selamatkanlah penglihatanku. Tiada ilah yang berhak disembah selain Engkau. Ya Allah, sesungguhnya aku berlindung kepada-Mu dari kekafiran dan kemiskinan. Dan aku berlindung kepada-Mu dari azab kubur. Tiada ilah yang berhak disembah selain Engkau.',
      source: 'HR. Abu Dawud no. 5090 dan Ahmad (5/42).',
      target: 3,
    },
    {
      id: 'pt10',
      title: 'Doa Kecukupan (7x)',
      arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
      latin: 'Ḥasbiyallāhu lā ilāha illā huwa ‘alaihi tawakkaltu wa huwa rabbul-‘arsyil-‘aẓīm.',
      translation: 'Cukuplah Allah bagiku; tidak ada ilah (yang berhak disembah) melainkan Dia. Hanya kepada-Nya aku bertawakkal dan Dia adalah Tuhan yang memiliki \'Arsy yang agung.',
      source: 'HR. Ibnu As-Sunni no. 71 dan Abu Dawud no. 5081.',
      target: 7,
    },
    {
      id: 'pt11',
      title: 'Membaca Bismillahilladzi (3x)',
      arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
      latin: 'Bismillāhillażī lā yaḍurru ma‘asmihī syai\'un fil-arḍi wa lā fis-samā\'i wa huwas-samī‘ul-‘alīm.',
      translation: 'Dengan nama Allah yang bila disebut, segala sesuatu di bumi dan langit tidak akan berbahaya, Dia-lah Yang Maha Mendengar lagi Maha Mengetahui.',
      source: 'HR. Abu Dawud no. 5088 dan Tirmidzi no. 3388.',
      target: 3,
    },
    {
      id: 'pt12',
      title: 'Doa Ridha Kepada Allah (3x)',
      arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
      latin: 'Raḍītu billāhi rabbā, wa bil-islāmi dīnā, wa bimuḥammadin ṣallallāhu ‘alaihi wa sallama nabiyyā.',
      translation: 'Aku rela Allah sebagai Tuhan, Islam sebagai agama, dan Muhammad shallallahu ‘alaihi wa sallam sebagai Nabi.',
      source: 'HR. Abu Dawud no. 5072 dan Tirmidzi no. 3389.',
      target: 3,
    },
    {
      id: 'pt_new3',
      title: 'Memohon Perbaikan Urusan',
      arabic: 'يَا حَيُّ يَا قَيُّوْمُ بِرَحْمَتِكَ أَسْتَغِيْثُ، وَأَصْلِحْ لِيْ شَأْنِيْ كُلَّهُ وَلاَ تَكِلْنِيْ إِلَى نَفْسِيْ طَرْفَةَ عَيْنٍ أَبَدًا',
      latin: "Yā Ḥayyu Yā Qayyūm, biraḥmatika astaghīts, wa aṣliḥ lī sya'ni kullahū wa lā takilnī ilā nafsī ṭarfata 'ainin abadan.",
      translation: 'Wahai Rabb Yang Maha Hidup, wahai Rabb Yang Berdiri Sendiri (tidak butuh segala sesuatu), dengan rahmat-Mu aku minta pertolongan, perbaikilah segala urusanku dan jangan diserahkan kepadaku sekali pun sekejap mata (tanpa mendapat pertolongan dari-Mu).',
      fadhilah: 'Dzikir yang diajarkan oleh Nabi ﷺ pada Fathimah supaya diamalkan pagi dan petang agar senantiasa mendapat pertolongan Allah.',
      source: 'HR. Ibnu As-Sunni no. 46, An Nasai, Al Hakim.',
      target: 1,
    },
    {
      id: 'pt_new4',
      title: 'Syukur Atas Nikmat Islam',
      arabic: 'أَمْسَيْنَا عَلَى فِطْرَةِ اْلإِسْلاَمِ وَعَلَى كَلِمَةِ اْلإِخْلاَصِ، وَعَلَى دِيْنِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِيْنَا إِبْرَاهِيْمَ، حَنِيْفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِيْنَ',
      latin: "Amsainā 'alā fiṭratil-islām, wa 'alā kalimatil-ikhlāṣ, wa 'alā dīni nabiyyinā Muḥammadin ṣallallāhu 'alaihi wa sallam, wa 'alā millati abīnā Ibrāhīma ḥanīfan musliman wa mā kāna minal-musyrikīn.",
      translation: 'Di waktu petang kami memegang agama Islam, kalimat ikhlas (kalimat syahadat), agama Nabi kami Muhammad ﷺ, dan agama bapak kami Ibrahim, yang berdiri di atas jalan yang lurus, muslim dan tidak tergolong orang-orang musyrik.',
      fadhilah: 'Pernyataan keteguhan di atas agama tauhid dan rasa syukur atas nikmat iman di petang hari.',
      source: 'HR. Ahmad (3: 406), shahih sesuai syarat Bukhari Muslim.',
      target: 1,
    },
    {
      id: 'pt13',
      title: 'Dzikir Khusus Petang: A\'udzu bikalimatillah (3x)',
      arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      latin: 'A‘ūżu bikalimātillāhit-tāmmāti min syarri mā khalaq.',
      translation: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan makhluk yang diciptakan-Nya.',
      source: 'HR. Ahmad (2/290) dan Tirmidzi no. 3604.',
      target: 3,
    },
    {
      id: 'pt14',
      title: 'Tasbih 100x',
      arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
      latin: 'Subḥānallāhi wa biḥamdih.',
      translation: 'Maha Suci Allah, aku memuji-Nya.',
      source: 'HR. Bukhari no. 6405 dan Muslim no. 2691.',
      target: 100,
    },
    {
      id: 'pt15',
      title: 'Tahlil 100x (Atau 10x)',
      arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      latin: 'Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa ‘alā kulli syai’in qadīr.',
      translation: 'Tidak ada ilah (yang berhak disembah) selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala pujian. Dan Dia Mahakuasa atas segala sesuatu.',
      source: 'HR. Bukhari no. 3293 dan Muslim no. 2691.',
      target: 10,
    },
    {
      id: 'pt16',
      title: 'Istighfar 100x',
      arabic: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
      latin: 'Astaghfirullāha wa atūbu ilaih.',
      translation: 'Aku memohon ampun kepada Allah dan bertaubat kepada-Nya.',
      source: 'HR. Bukhari no. 6307 dan Muslim no. 2702.',
      target: 100,
    }
  ]
};

function AppLogo({ compact = false }) {
  return (
    <div className={`relative ${compact ? 'w-11 h-11' : 'w-14 h-14'} shrink-0 overflow-hidden rounded-2xl shadow-sm`}>
      <img src={appLogo} alt="DzikirHarian Logo" className="w-full h-full object-cover" />
    </div>
  );
}


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
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isMobileView, setIsMobileView] = useState(() => window.innerWidth < 768);
  const [isStandaloneMode, setIsStandaloneMode] = useState(() => isStandaloneDisplay());
  const [showInstallBanner, setShowInstallBanner] = useState(() => window.innerWidth < 768 && !isStandaloneDisplay());
  const [currentDateKey, setCurrentDateKey] = useState(() => getLocalDateKey());
  const [remindersEnabled, setRemindersEnabled] = useState(() => localStorage.getItem(STORAGE_KEYS.remindersEnabled) !== 'false');
  const installPlatform = useMemo(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'other';
  }, []);

  const currentDzikirList = dzikirData[activeTime];

  const fontSizeClasses = ['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'];

  useEffect(() => {
    const syncCounts = () => {
      const savedCounts = localStorage.getItem(getCountsStorageKey(activeTime, currentDateKey));
      if (savedCounts) {
        setCounts(JSON.parse(savedCounts));
      } else {
        const initialCounts = {};
        currentDzikirList.forEach(d => initialCounts[d.id] = 0);
        setCounts(initialCounts);
      }
    };

    const frame = window.requestAnimationFrame(syncCounts);
    return () => window.cancelAnimationFrame(frame);
  }, [activeTime, currentDzikirList, currentDateKey]);

  useEffect(() => {
    if (Object.keys(counts).length === 0) return;

    const persistCounts = setTimeout(() => {
      localStorage.setItem(getCountsStorageKey(activeTime, currentDateKey), JSON.stringify(counts));
    }, 80);

    return () => clearTimeout(persistCounts);
  }, [counts, activeTime, currentDateKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.nightView, String(isNightView));
  }, [isNightView]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.fontSize, String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.showArabic, String(showArabic));
  }, [showArabic]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.showLatin, String(showLatin));
  }, [showLatin]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.showTranslation, String(showTranslation));
  }, [showTranslation]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.remindersEnabled, String(remindersEnabled));
  }, [remindersEnabled]);

  useEffect(() => {
    const updateCurrentDateKey = () => {
      setCurrentDateKey(getLocalDateKey());
    };

    updateCurrentDateKey();
    const interval = window.setInterval(updateCurrentDateKey, 30 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !remindersEnabled) {
      return;
    }

    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [remindersEnabled]);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !remindersEnabled) {
      return;
    }

    let mounted = true;
    let morningTimeout;
    let eveningTimeout;

    const scheduleReminder = async (hour, minute, title, body, assignTimeout) => {
      const registration = await navigator.serviceWorker.ready;

      const run = async () => {
        if (!mounted) return;

        if (Notification.permission === 'granted') {
          await registration.showNotification(title, {
            body,
            tag: title,
            renotify: true,
            icon: '/icons/android-chrome-192x192.png',
            badge: '/icons/favicon-48x48.png',
          });
        }

        const nextMs = getMsUntilNextTrigger(hour, minute);
        assignTimeout(window.setTimeout(run, nextMs));
      };

      const initialMs = getMsUntilNextTrigger(hour, minute);
      assignTimeout(window.setTimeout(run, initialMs));
    };

    const init = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js');
        if (Notification.permission === 'granted') {
          await scheduleReminder(
            5,
            30,
            'Dzikir Pagi',
            'Waktunya dzikir pagi. Tenangkan hati, awali hari dengan mengingat Allah.',
            (timeout) => {
              morningTimeout = timeout;
            }
          );

          await scheduleReminder(
            17,
            0,
            'Dzikir Petang',
            'Waktunya dzikir petang. Tutup sore dengan dzikir dan doa.',
            (timeout) => {
              eveningTimeout = timeout;
            }
          );
        }
      } catch {
        // no-op untuk browser yang tidak mendukung scheduling ini.
      }
    };

    init();

    return () => {
      mounted = false;
      window.clearTimeout(morningTimeout);
      window.clearTimeout(eveningTimeout);
    };
  }, [remindersEnabled]);

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
    const preventPinchZoom = (event) => {
      if (event.touches && event.touches.length > 1) {
        event.preventDefault();
      }
    };

    const preventCtrlZoom = (event) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
      }
    };

    const preventGesture = (event) => {
      event.preventDefault();
    };

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
    setCounts(prev => {
      const current = prev[id] || 0;
      if (current < target) {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }

        const newCount = current + 1;

        if (newCount === target && index < currentDzikirList.length - 1) {
          setTimeout(() => {
            const nextElement = document.getElementById(`dzikir-${currentDzikirList[index + 1].id}`);
            if (nextElement && scrollRef.current) {
              nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 600);
        }

        return { ...prev, [id]: newCount };
      }
      return prev;
    });
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengulang hitungan dzikir ini dari awal?')) {
      const initialCounts = {};
      currentDzikirList.forEach(d => initialCounts[d.id] = 0);
      setCounts(initialCounts);

      if (isReadingMode && scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const startReading = (time) => {
    setActiveTime(time);
    setIsReadingMode(true);

    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  const progress = useMemo(() => {
    if (Object.keys(counts).length === 0) return 0;

    let totalTarget = 0;
    let totalCompleted = 0;

    currentDzikirList.forEach(d => {
      totalTarget += d.target;
      totalCompleted += Math.min(counts[d.id] || 0, d.target);
    });

    return totalTarget === 0 ? 0 : Math.round((totalCompleted / totalTarget) * 100);
  }, [counts, currentDzikirList]);

  const getStoredCounts = (time) => {
    if (time === activeTime) return counts;
    const saved = localStorage.getItem(getCountsStorageKey(time, currentDateKey));
    return saved ? JSON.parse(saved) : {};
  };

  const getProgressForTime = (time) => {
    const list = dzikirData[time];
    const savedCounts = getStoredCounts(time);

    let totalTarget = 0;
    let totalCompleted = 0;

    list.forEach((item) => {
      totalTarget += item.target;
      totalCompleted += Math.min(savedCounts[item.id] || 0, item.target);
    });

    return totalTarget === 0 ? 0 : Math.round((totalCompleted / totalTarget) * 100);
  };

  const morningProgress = getProgressForTime('pagi');
  const eveningProgress = getProgressForTime('petang');
  const dailyProgress = Math.round((morningProgress * 0.5) + (eveningProgress * 0.5));

  const handleInstallApp = async () => {
    if (!installPromptEvent) return;
    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  };

  return (
    <div className={`min-h-screen bg-gray-50 font-sans text-gray-800 flex justify-center items-stretch lg:items-center overflow-x-hidden selection:bg-emerald-200 px-0 sm:px-4 lg:px-8 ${isNightView ? 'night-view' : ''}`}>
      <div className="app-shell w-full max-w-4xl h-[100dvh] lg:h-[92vh] bg-white relative flex flex-col overflow-hidden sm:rounded-[2rem] lg:shadow-2xl lg:border border-gray-200">
        {!isReadingMode && (
          <header className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-b-3xl shadow-md z-10 relative shrink-0">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <AppLogo />
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Dzikir Harian</h1>
                  <div className="mt-1 flex items-center gap-2 text-emerald-100">
                    <p className="text-sm font-medium">Sesuai Sunnah Nabi</p>
                    <p
                      className="text-lg sm:text-xl calligraphy-subtitle"
                      dir="rtl"
                      aria-label="Kaligrafi Muhammad"
                    >
                      مُحَمَّد
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-emerald-100 shrink-0 mt-0.5" />
                <p className="text-sm leading-relaxed text-white">
                  "Maka bertasbihlah kepada Allah di waktu petang dan waktu pagi." <span className="block text-emerald-100 text-xs mt-1">(QS. Ar-Rum: 17)</span>
                </p>
              </div>
            </div>
          </header>
        )}

        {isReadingMode && (
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white/95 backdrop-blur z-20 shrink-0 shadow-sm">
            <button onClick={() => setIsReadingMode(false)} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="text-center flex-1">
              <h2 className="font-bold text-gray-800 text-sm">
                {activeTime === 'pagi' ? 'Dzikir Pagi' : 'Dzikir Petang'}
              </h2>
              <p className="text-xs text-emerald-600 font-bold tracking-wide">
                {progress}% SELESAI
              </p>
            </div>
            <button onClick={() => { setActiveTab('settings'); setIsReadingMode(false); }} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
        )}

        {isReadingMode && (
          <div className="w-full bg-gray-100 h-1 shrink-0">
            <div
              className="bg-emerald-500 h-1 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div ref={scrollRef} className="content-scroll flex-1 overflow-y-auto no-scrollbar relative bg-gray-50 pb-safe">
          {activeTab === 'home' && !isReadingMode && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 pb-32 animate-fade-in-up">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-bold text-gray-700 text-lg">Pilih Waktu Dzikir</h2>
                <button
                  onClick={() => setIsNightView((prev) => !prev)}
                  className={`relative inline-flex items-center w-[132px] h-10 px-1 rounded-full border transition-all duration-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${isNightView ? 'bg-slate-900 border-slate-700' : 'bg-amber-50 border-amber-200'}`}
                  aria-label="Toggle night/day view"
                >
                  <span className={`absolute top-1 h-8 w-[62px] rounded-full transition-transform duration-300 shadow-sm ${isNightView ? 'translate-x-[64px] bg-slate-700' : 'translate-x-0 bg-amber-400'}`} />
                  <span className="relative z-10 w-1/2 flex items-center justify-center gap-1.5 text-[11px] font-semibold">
                    <Sun className={`w-3.5 h-3.5 ${isNightView ? 'text-slate-300' : 'text-white'}`} />
                    <span className={`${isNightView ? 'text-slate-300' : 'text-white'}`}>Day</span>
                  </span>
                  <span className="relative z-10 w-1/2 flex items-center justify-center gap-1.5 text-[11px] font-semibold">
                    <Moon className={`w-3.5 h-3.5 ${isNightView ? 'text-white' : 'text-amber-500'}`} />
                    <span className={`${isNightView ? 'text-white' : 'text-amber-600'}`}>Night</span>
                  </span>
                </button>
              </div>

              <button
                onClick={() => startReading('pagi')}
                className="w-full bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between group hover:border-emerald-200 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                    <Sun className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800 text-lg">Dzikir Pagi</h3>
                    <p className="text-gray-500 text-sm">Dibaca setelah Shubuh</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-emerald-500" />
              </button>

              <button
                onClick={() => startReading('petang')}
                className="w-full bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between group hover:border-indigo-200 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                    <Moon className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800 text-lg">Dzikir Petang</h3>
                    <p className="text-gray-500 text-sm">Dibaca setelah Ashar</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-indigo-500" />
              </button>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-700">Progres Hari Ini</h3>
                  <button onClick={handleReset} className="text-xs text-emerald-600 font-medium flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                    <RotateCcw className="w-3 h-3" /> Ulang Hitungan
                  </button>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-gray-500">Penyelesaian Keseluruhan</span>
                    <span className="text-emerald-600 font-bold">{dailyProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${dailyProgress}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    Progress realtime: Pagi {morningProgress}% • Petang {eveningProgress}%
                  </p>
                </div>

                {isMobileView && !isStandaloneMode && showInstallBanner && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-sm animate-fade-in-up">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Download className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-900 text-sm">Install Dzikir Harian</p>
                        <p className="text-xs text-emerald-700 mt-1">Pasang aplikasi agar akses lebih cepat dari homescreen.</p>
                        <div className="mt-2 rounded-xl bg-white/80 p-3 border border-emerald-100">
                          {installPlatform === 'ios' && (
                            <ol className="text-xs text-emerald-800 list-decimal pl-4 space-y-1">
                              <li>Buka di Safari, lalu ketuk tombol <strong>Share</strong> (ikon kotak + panah).</li>
                              <li>Pilih <strong>Add to Home Screen</strong>.</li>
                              <li>Ketuk <strong>Add</strong> sampai ikon muncul di layar utama.</li>
                            </ol>
                          )}
                          {installPlatform === 'android' && (
                            <ol className="text-xs text-emerald-800 list-decimal pl-4 space-y-1">
                              <li>Ketuk tombol <strong>Install</strong> di bawah ini.</li>
                              <li>Jika tidak muncul, buka menu browser (⋮).</li>
                              <li>Pilih <strong>Install app</strong> atau <strong>Add to Home screen</strong>.</li>
                            </ol>
                          )}
                          {installPlatform === 'other' && (
                            <p className="text-xs text-emerald-800">Gunakan menu browser lalu pilih <strong>Install app</strong> atau <strong>Add to Home Screen</strong>.</p>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3">
                          {installPromptEvent ? (
                            <button onClick={handleInstallApp} className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">Install</button>
                          ) : (
                            <span className="px-3 py-2 text-xs font-semibold rounded-lg bg-white text-emerald-700 border border-emerald-200">Buka menu browser untuk install</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && !isReadingMode && (
            <div className="p-6 space-y-8 animate-fade-in-up">
              <h2 className="font-bold text-gray-800 text-xl mb-4">Pengaturan Tampilan</h2>

              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Notifikasi Pengingat</h4>
                      <p className="text-xs text-gray-500">Pagi 05.30 & Petang 17.00 (default aktif)</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={remindersEnabled} onChange={(e) => setRemindersEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                  Pesan notifikasi: “Waktunya dzikir pagi. Tenangkan hati, awali hari dengan mengingat Allah.” dan
                  “Waktunya dzikir petang. Tutup sore dengan dzikir dan doa.”
                </p>
              </div>

              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <label className="flex items-center gap-3 text-gray-700 font-semibold mb-4">
                  <Type className="w-5 h-5 text-emerald-600" /> Ukuran Huruf Arab
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Kecil', 'Sedang', 'Besar', 'Sgt Besar'].map((label, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFontSize(idx)}
                      className={`py-3 rounded-xl border font-medium text-sm transition-all ${fontSize === idx
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <span className="text-xl">ع</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Teks Arab</h4>
                      <p className="text-xs text-gray-500">Tampilkan tulisan Arab</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={showArabic} onChange={(e) => setShowArabic(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                      <Languages className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Teks Latin</h4>
                      <p className="text-xs text-gray-500">Tampilkan cara baca</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={showLatin} onChange={(e) => setShowLatin(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
                      <AlignLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Terjemahan</h4>
                      <p className="text-xs text-gray-500">Tampilkan arti bahasa</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={showTranslation} onChange={(e) => setShowTranslation(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {isReadingMode && (
            <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in-up">
              {currentDzikirList.map((dzikir, index) => {
                const currentCount = counts[dzikir.id] || 0;
                const isCompleted = currentCount >= dzikir.target;

                return (
                  <div
                    key={dzikir.id}
                    id={`dzikir-${dzikir.id}`}
                    className={`bg-white rounded-[2rem] shadow-sm border overflow-hidden relative transition-all duration-500 ${isCompleted ? 'border-emerald-200 ring-1 ring-emerald-50 opacity-70' : 'border-gray-100'
                      }`}
                  >
                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                          }`}>
                          {index + 1}
                        </span>
                        <h3 className="font-bold text-gray-800 line-clamp-1">{dzikir.title}</h3>
                      </div>
                      <div className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        {dzikir.target}x
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {showArabic && (
                        <div
                          dir="rtl"
                          className={`text-right text-gray-900 leading-[2.5] ${fontSizeClasses[fontSize]}`}
                          style={{ fontFamily: "'Scheherazade New', 'Amiri', 'Traditional Arabic', serif" }}
                        >
                          {dzikir.arabic}
                        </div>
                      )}

                      {(showLatin || showTranslation) && (
                        <div className={`space-y-4 ${showArabic ? 'pt-4 border-t border-dashed border-gray-200' : ''}`}>
                          {showLatin && (
                            <div className="text-emerald-800/90 italic font-medium leading-relaxed text-[15px]">
                              {dzikir.latin}
                            </div>
                          )}
                          {showTranslation && (
                            <div className="text-gray-600 leading-relaxed text-[15px]">
                              {dzikir.translation}
                            </div>
                          )}
                        </div>
                      )}

                      {(dzikir.fadhilah || dzikir.source) && (
                        <div className="bg-gray-50 rounded-2xl p-4 text-sm mt-6">
                          {dzikir.fadhilah && (
                            <p className="text-gray-700 mb-2"><strong className="font-semibold text-amber-600">💡 Keutamaan: </strong>{dzikir.fadhilah}</p>
                          )}
                          {dzikir.source && (
                            <p className="text-gray-500 text-xs"><strong className="font-semibold">📚 Sumber: </strong>{dzikir.source}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-gray-50/50 flex flex-col gap-3">
                      <button
                        onClick={() => handleIncrement(dzikir.id, dzikir.target, index)}
                        disabled={isCompleted}
                        className={`relative w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 overflow-hidden group ${isCompleted
                          ? 'bg-emerald-500 text-white cursor-default'
                          : 'bg-gray-900 text-white shadow-md hover:bg-gray-800 active:bg-gray-700'
                          }`}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-6 h-6 animate-scale-in" /> Selesai
                          </>
                        ) : (
                          <>
                            Hitung ({currentCount}/{dzikir.target})
                          </>
                        )}
                        {!isCompleted && <div className="absolute inset-0 bg-white/20 opacity-0 active:opacity-100 transition-opacity" />}
                      </button>
                    </div>
                  </div>
                );
              })}

              {progress === 100 && (
                <div className="bg-emerald-50 rounded-[2rem] p-8 text-center border-2 border-emerald-100 animate-fade-in-up mt-8 mb-8">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 animate-scale-in" />
                  </div>
                  <h2 className="text-2xl font-bold text-emerald-900 mb-3">Alhamdulillah!</h2>
                  <p className="text-emerald-700 font-medium mb-8">Anda telah menyelesaikan seluruh rangkaian dzikir {activeTime} ini.</p>

                  <button
                    onClick={() => { setIsReadingMode(false); setActiveTab('home'); }}
                    className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {!isReadingMode && (
          <nav className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-4 sm:px-6 py-3 sm:py-4 flex justify-around items-center z-20 pb-safe shrink-0">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'home' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`p-2 rounded-xl transition-colors ${activeTab === 'home' ? 'bg-emerald-50' : 'bg-transparent'}`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold">Dzikir</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'settings' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`p-2 rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-emerald-50' : 'bg-transparent'}`}>
                <Settings2 className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold">Pengaturan</span>
            </button>
          </nav>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap');
        
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        .content-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
        }

        .calligraphy-subtitle {
          font-family: 'Scheherazade New', 'Amiri', serif;
          font-weight: 700;
          letter-spacing: 0.01em;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.18);
        }

        .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 16px);
        }

        .night-view {
          background: radial-gradient(circle at top, #1e293b, #020617 55%);
          color: #ffffff;
        }

        .night-view > div {
          background: #0f172a;
          border-color: #334155;
        }

        .night-view .bg-white,
        .night-view [class*='bg-white/95'],
        .night-view .bg-gray-50,
        .night-view [class*='bg-gray-50/50'],
        .night-view .bg-emerald-50,
        .night-view [class*='bg-emerald-100'],
        .night-view .bg-indigo-50,
        .night-view .bg-blue-50,
        .night-view .bg-purple-50,
        .night-view .bg-amber-50 {
          background-color: #1e293b !important;
        }

        .night-view .from-emerald-600,
        .night-view .to-teal-700,
        .night-view .from-emerald-400,
        .night-view .to-teal-500 {
          --tw-gradient-from: #0f766e var(--tw-gradient-from-position) !important;
          --tw-gradient-to: rgb(6 95 70 / 0) var(--tw-gradient-to-position) !important;
          --tw-gradient-stops: var(--tw-gradient-from), #115e59 var(--tw-gradient-via-position), var(--tw-gradient-to) !important;
        }

        .night-view *,
        .night-view .text-emerald-600,
        .night-view .text-emerald-100,
        .night-view .text-emerald-700,
        .night-view .text-emerald-900,
        .night-view .text-indigo-500,
        .night-view .text-amber-500,
        .night-view .text-blue-500,
        .night-view .text-purple-500,
        .night-view .text-gray-300,
        .night-view .text-gray-400,
        .night-view .text-gray-500,
        .night-view .text-gray-600,
        .night-view .text-gray-700,
        .night-view .text-gray-800,
        .night-view .text-gray-900 {
          color: #ffffff !important;
        }

        .night-view .border-gray-50,
        .night-view .border-gray-100,
        .night-view .border-gray-200,
        .night-view .border-emerald-100,
        .night-view .border-emerald-200,
        .night-view .divide-gray-100 > :not([hidden]) ~ :not([hidden]) {
          border-color: #334155 !important;
        }

        .night-view .shadow-sm,
        .night-view .shadow-md,
        .night-view .shadow-2xl {
          box-shadow: none !important;
        }

        .night-view img {
          filter: brightness(0.85);
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @media (orientation: landscape) and (max-height: 560px) {
          .app-shell {
            height: 100dvh !important;
            border-radius: 0 !important;
          }

          .app-shell header {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }

          .app-shell .pb-safe {
            padding-bottom: env(safe-area-inset-bottom, 8px);
          }

          .app-shell nav {
            padding-top: 0.45rem !important;
            padding-bottom: 0.45rem !important;
          }
        }
      `}} />
    </div>
  );
}
