"use strict";

const cityTranslations = (() => {
  const keys = `
cityShort cityTitle cityReturn cityBudget cityBuilt cityMap cityPlots cityGuide cityProjects cityBuild
cityQuarter cityConservatory cityTower citySkyline cityLotEmpty cityLotBuilt cityPrice citySuccess cityNeed cityFull cityTemporary`.trim().split(/\s+/);
  const phrases = {
    ru: `Город|Стеклянный город|К игре|Бюджет строительства|Застроено участков|Карта города|Участки|Очки за комбинации пополняют бюджет. Выберите участок и проект, чтобы построить здание.|Проекты|Построить
Старый квартал|Зимний сад|Стеклянная башня|Хрустальный небоскрёб|Участок {lot} свободен|Участок {lot} · {name}|{price} очков|Построено: {name}|Не хватает {points} очков.|Все участки застроены.|Город сохранится только до закрытия страницы.`,
    en: `City|Glass City|Back to game|Construction budget|Developed lots|City map|Lots|Points from matches fund construction. Pick a lot and a project to build.|Projects|Build
Old Town Quarter|Winter Garden|Glass Tower|Crystal Skyscraper|Lot {lot} is available|Lot {lot} · {name}|{price} points|Built: {name}|You need {points} more points.|All lots are developed.|The city will only be kept until you close this page.`,
    az: `Şəhər|Şüşə şəhər|Oyuna qayıt|Tikinti büdcəsi|Tikili olan sahələr|Şəhər xəritəsi|Sahələr|Kombinasiyalardan qazandığınız xallar tikintiyə sərf olunur. Tikmək üçün sahə və layihə seçin.|Layihələr|Tik
Köhnə şəhər məhəlləsi|Qış bağı|Şüşə qüllə|Büllur göydələn|{lot} nömrəli sahə boşdur|Sahə {lot} · {name}|{price} xal|Tikildi: {name}|Daha {points} xal lazımdır.|Bütün sahələrdə tikinti tamamlanıb.|Şəhər yalnız bu səhifəni bağlayana qədər saxlanacaq.`,
    hy: `Քաղաք|Ապակե քաղաք|Վերադառնալ խաղին|Շինարարության բյուջե|Կառուցապատված հողամասեր|Քաղաքի քարտեզ|Հողամասեր|Համադրություններից ստացած միավորներն ավելանում են բյուջեին։ Կառուցելու համար ընտրեք հողամաս և նախագիծ։|Նախագծեր|Կառուցել
Հին քաղաքի թաղամաս|Ձմեռային այգի|Ապակե աշտարակ|Բյուրեղյա երկնաքեր|Հողամաս {lot}-ն ազատ է|Հողամաս {lot} · {name}|{price} միավոր|Կառուցվեց՝ {name}|Պակասում է {points} միավոր։|Բոլոր հողամասերը կառուցապատված են։|Քաղաքը կպահպանվի միայն մինչև էջը փակելը։`,
    be: `Горад|Шкляны горад|Да гульні|Бюджэт будаўніцтва|Забудавана ўчасткаў|Карта горада|Участкі|Ачкі за камбінацыі папаўняюць бюджэт. Выберыце ўчастак і праект, каб пабудаваць будынак.|Праекты|Пабудаваць
Стары квартал|Зімовы сад|Шкляная вежа|Крыштальны хмарачос|Участак {lot} вольны|Участак {lot} · {name}|{price} ачкоў|Пабудавана: {name}|Не хапае {points} ачкоў.|Усе ўчасткі забудаваныя.|Горад захаваецца толькі да закрыцця старонкі.`,
    ka: `ქალაქი|მინის ქალაქი|თამაშზე დაბრუნება|მშენებლობის ბიუჯეტი|განაშენიანებული ნაკვეთები|ქალაქის რუკა|ნაკვეთები|კომბინაციებით მოგებული ქულები მშენებლობის ბიუჯეტს ემატება. ასაშენებლად აირჩიეთ ნაკვეთი და პროექტი.|პროექტები|აშენება
ძველი ქალაქის კვარტალი|ზამთრის ბაღი|მინის კოშკი|ბროლის ცათამბჯენი|ნაკვეთი {lot} თავისუფალია|ნაკვეთი {lot} · {name}|{price} ქულა|აშენდა: {name}|კიდევ {points} ქულა გჭირდებათ.|ყველა ნაკვეთი განაშენიანებულია.|ქალაქი მხოლოდ ამ გვერდის დახურვამდე შეინახება.`,
    kk: `Қала|Шыны қала|Ойынға оралу|Құрылыс бюджеті|Игерілген учаскелер|Қала картасы|Учаскелер|Комбинациялардан жиналған ұпайлар құрылыс бюджетіне қосылады. Ғимарат салу үшін учаске мен жобаны таңдаңыз.|Жобалар|Салу
Ескі қала орамы|Қысқы бақ|Шыны мұнара|Хрусталь зәулім ғимарат|{lot}-учаске бос|{lot}-учаске · {name}|{price} ұпай|Салынды: {name}|Тағы {points} ұпай керек.|Барлық учаскелер игерілді.|Қала бет жабылғанша ғана сақталады.`,
    ky: `Шаар|Айнек шаар|Оюнга кайтуу|Курулуш бюджети|Курулуш бүткөн жерлер|Шаардын картасы|Жер тилкелери|Айкалыштардан алган упайлар курулушка жумшалат. Куруу үчүн жер тилкесин жана долбоорду тандаңыз.|Долбоорлор|Куруу
Эски шаар кварталы|Кышкы бак|Айнек мунара|Хрусталь асман тиреген имарат|{lot}-тилке бош|{lot}-тилке · {name}|{price} упай|Курулду: {name}|Дагы {points} упай керек.|Бардык тилкелерге курулду.|Шаар барак жабылганга чейин гана сакталат.`,
    ro: `Oraș|Orașul de sticlă|Înapoi la joc|Buget de construcții|Parcelele construite|Harta orașului|Parcele|Punctele câștigate din combinații finanțează construcțiile. Alege o parcelă și un proiect pentru a construi.|Proiecte|Construiește
Cartierul vechi|Grădina de iarnă|Turnul de sticlă|Zgârie-norul de cristal|Parcela {lot} este liberă|Parcela {lot} · {name}|{price} puncte|Construit: {name}|Îți mai trebuie {points} puncte.|Toate parcelele sunt construite.|Orașul se păstrează doar până închizi pagina.`,
    tg: `Шаҳр|Шаҳри шишагӣ|Бозгашт ба бозӣ|Буҷети сохтмон|Қитъаҳои сохташуда|Харитаи шаҳр|Қитъаҳо|Холҳои комбинатсияҳо буҷети сохтмонро пур мекунанд. Барои сохтмон қитъа ва тарҳро интихоб кунед.|Тарҳҳо|Сохтан
Маҳаллаи кӯҳна|Боғи зимистона|Манораи шишагӣ|Осмонбӯси булӯрӣ|Қитъаи {lot} холӣ аст|Қитъаи {lot} · {name}|{price} хол|Сохта шуд: {name}|Боз {points} хол лозим аст.|Дар ҳамаи қитъаҳо сохтмон анҷом ёфт.|Шаҳр танҳо то пӯшидани саҳифа нигоҳ дошта мешавад.`,
    tk: `Şäher|Aýna şäher|Oýna dolan|Gurluşyk býujeti|Gurlan ýer bölekleri|Şäheriň kartasy|Ýer bölekleri|Utuklar gurluşyk býujetini doldurýar. Gurluşyk üçin ýer bölegini we taslamany saýlaň.|Taslamalar|Gur
Köne şäher kwartaly|Gyş bagy|Aýna diň|Kristal belent bina|{lot}-njy ýer bölegi boş|Ýer bölegi {lot} · {name}|{price} utuk|Guruldy: {name}|Ýene {points} utuk gerek.|Ähli ýer böleklerinde gurluşyk tamamlandy.|Şäher diňe sahypa ýapylýança saklanar.`,
    uz: `Shahar|Shisha shahar|Oʻyinga qaytish|Qurilish byudjeti|Qurilgan uchastkalar|Shahar xaritasi|Uchastkalar|Kombinatsiyalardan olingan ballar qurilish byudjetiga qoʻshiladi. Qurish uchun uchastka va loyihani tanlang.|Loyihalar|Qurish
Eski shahar mahallasi|Qishki bogʻ|Shisha minora|Billur osmonoʻpar bino|{lot}-uchastka boʻsh|{lot}-uchastka · {name}|{price} ball|Qurildi: {name}|Yana {points} ball kerak.|Barcha uchastkalarda qurilish tugadi.|Shahar sahifa yopilguncha saqlanadi.`,
    uk: `Місто|Скляне місто|До гри|Бюджет будівництва|Забудовано ділянок|Карта міста|Ділянки|Очки за комбінації поповнюють бюджет. Оберіть ділянку й проєкт, щоб звести будівлю.|Проєкти|Побудувати
Старий квартал|Зимовий сад|Скляна вежа|Кришталевий хмарочос|Ділянка {lot} вільна|Ділянка {lot} · {name}|{price} очок|Побудовано: {name}|Бракує {points} очок.|Усі ділянки забудовано.|Місто збережеться лише до закриття сторінки.`
  };

  const zoomLabels = {
    ru: ["Отдалить карту", "Приблизить карту"],
    en: ["Zoom out", "Zoom in"],
    az: ["Xəritəni kiçilt", "Xəritəni böyüt"],
    hy: ["Փոքրացնել քարտեզը", "Մեծացնել քարտեզը"],
    be: ["Аддаліць карту", "Наблізіць карту"],
    ka: ["რუკის დაპატარავება", "რუკის გადიდება"],
    kk: ["Картаны кішірейту", "Картаны үлкейту"],
    ky: ["Картаны кичирейтүү", "Картаны чоңойтуу"],
    ro: ["Micșorează harta", "Mărește harta"],
    tg: ["Хурд кардани харита", "Калон кардани харита"],
    tk: ["Kartany kiçelt", "Kartany ulalt"],
    uz: ["Xaritani kichraytirish", "Xaritani kattalashtirish"],
    uk: ["Віддалити карту", "Наблизити карту"]
  };
  const roadLabels = {
    ru: "Здания|Дороги|Выберите два соседних участка. Дорога пройдёт между ними.|Соседний участок|Участок {lot}|Построить дорогу|Дорога построена.|Здесь уже есть дорога.",
    en: "Buildings|Roads|Choose two neighboring lots. The road will run between them.|Neighboring lot|Lot {lot}|Build road|Road built.|There's already a road here.",
    az: "Binalar|Yollar|İki qonşu sahə seçin. Yol onların arasından keçəcək.|Qonşu sahə|Sahə {lot}|Yol çək|Yol çəkildi.|Burada artıq yol var.",
    hy: "Շենքեր|Ճանապարհներ|Ընտրեք երկու հարևան հողամաս։ Ճանապարհը կանցնի դրանց միջև։|Հարևան հողամաս|Հողամաս {lot}|Կառուցել ճանապարհ|Ճանապարհը կառուցվեց։|Այստեղ արդեն ճանապարհ կա։",
    be: "Будынкі|Дарогі|Выберыце два суседнія ўчасткі. Дарога пройдзе паміж імі.|Суседні ўчастак|Участак {lot}|Пабудаваць дарогу|Дарога пабудавана.|Тут ужо ёсць дарога.",
    ka: "შენობები|გზები|აირჩიეთ ორი მეზობელი ნაკვეთი. გზა მათ შორის გაივლის.|მეზობელი ნაკვეთი|ნაკვეთი {lot}|გზის აშენება|გზა აშენდა.|აქ უკვე არის გზა.",
    kk: "Ғимараттар|Жолдар|Екі көршілес учаскені таңдаңыз. Жол олардың арасынан өтеді.|Көршілес учаске|{lot}-учаске|Жол салу|Жол салынды.|Мұнда жол бар.",
    ky: "Имараттар|Жолдор|Эки коңшу тилкени тандаңыз. Жол алардын ортосунан өтөт.|Коңшу тилке|{lot}-тилке|Жол куруу|Жол курулду.|Бул жерде жол бар.",
    ro: "Clădiri|Drumuri|Alege două parcele vecine. Drumul va trece între ele.|Parcelă vecină|Parcela {lot}|Construiește drumul|Drumul a fost construit.|Aici există deja un drum.",
    tg: "Биноҳо|Роҳҳо|Ду қитъаи ҳамсояро интихоб кунед. Роҳ аз байни онҳо мегузарад.|Қитъаи ҳамсоя|Қитъаи {lot}|Роҳ сохтан|Роҳ сохта шуд.|Дар ин ҷо аллакай роҳ ҳаст.",
    tk: "Binalar|Ýollar|Iki goňşy ýer bölegini saýlaň. Ýol olaryň arasyndan geçer.|Goňşy ýer bölegi|Ýer bölegi {lot}|Ýol gur|Ýol guruldy.|Bu ýerde eýýäm ýol bar.",
    uz: "Binolar|Yoʻllar|Ikkita qoʻshni uchastkani tanlang. Yoʻl ularning orasidan oʻtadi.|Qoʻshni uchastka|{lot}-uchastka|Yoʻl qurish|Yoʻl qurildi.|Bu yerda yoʻl bor.",
    uk: "Будівлі|Дороги|Оберіть дві сусідні ділянки. Дорога пройде між ними.|Сусідня ділянка|Ділянка {lot}|Побудувати дорогу|Дорогу побудовано.|Тут уже є дорога."
  };
  const roadKeys = ["roadBuildings", "roadName", "roadGuide", "roadNeighbor", "roadLot", "roadBuild", "roadSuccess", "roadExists"];
  return Object.fromEntries(Object.entries(phrases).map(([locale, source]) => [
    locale, {
      ...Object.fromEntries(source.split(/[|\n]/).map((value, index) => [keys[index], value])),
      cityZoomOut: zoomLabels[locale][0],
      cityZoomIn: zoomLabels[locale][1],
      ...Object.fromEntries(roadLabels[locale].split("|").map((label, index) => [roadKeys[index], label]))
    }
  ]));
})();
