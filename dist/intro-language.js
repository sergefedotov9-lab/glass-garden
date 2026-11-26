"use strict";

const introTranslations = (() => {
  const keys = [
    "introLoading", "introMusic", "introHelp", "introSkip", "introBack", "introNext", "introPlay", "introStep",
    "introGoalTitle", "introGoalCopy", "introMatchTitle", "introMatchCopy", "introBuildTitle", "introBuildCopy"
  ];
  const phrases = {
    ru: "Загрузка игры…|Фоновая музыка|Как играть|Пропустить|Назад|Далее|Играть|Шаг {step} из {total}|Постройте Стеклянный город|Собирайте комбинации и превращайте очки в здания. Так на берегу вырастут европейские кварталы и стеклянные небоскрёбы.|Соберите три шара в ряд|Смахните шар к соседнему или нажмите на оба по очереди. Три или больше одинаковых шара в ряд разобьются и принесут очки.|Потратьте очки на строительство|Откройте «Город», выберите свободный участок и проект, затем нажмите «Построить». Бюджет копится от партии к партии.",
    en: "Loading the game…|Background music|How to play|Skip|Back|Next|Play|Step {step} of {total}|Build Glass City|Make matches and turn points into buildings. Grow European quarters and glass skyscrapers along the waterfront.|Match three orbs|Swipe one orb toward its neighbor or tap both in turn. Three or more identical orbs in a row shatter and earn points.|Spend points on construction|Open City, pick an empty lot and a project, then select Build. Your budget carries over between rounds.",
    az: "Oyun yüklənir…|Fon musiqisi|Necə oynamalı|Keç|Geri|İrəli|Oyna|Addım {step} / {total}|Şüşə şəhəri qurun|Kombinasiyalar yaradın və xalları binalara çevirin. Sahildə Avropa üslubunda məhəllələr və şüşə göydələnlər ucaldın.|Üç kürəni bir sıraya düzün|Kürəni qonşusuna doğru sürüşdürün və ya hər ikisinə növbə ilə toxunun. Bir sırada üç və ya daha çox eyni kürə qırılır və xal qazandırır.|Xalları tikintiyə xərcləyin|«Şəhər» bölməsini açın, boş sahə və layihə seçin, sonra «Tik» düyməsinə basın. Büdcə oyunlar arasında saxlanılır.",
    hy: "Խաղը բեռնվում է…|Ֆոնային երաժշտություն|Ինչպես խաղալ|Բաց թողնել|Հետ|Հաջորդը|Խաղալ|Քայլ {step}՝ {total}-ից|Կառուցեք Ապակե քաղաքը|Կազմեք համադրություններ և միավորները վերածեք շենքերի։ Ափին կաճեն եվրոպական թաղամասեր ու ապակե երկնաքերեր։|Երեք գնդիկ շարեք մեկ շարքում|Սահեցրեք գնդիկը դեպի հարևանը կամ հերթով հպվեք երկուսին։ Երեք կամ ավելի նույն գնդիկներ կկոտրվեն և միավորներ կտան։|Միավորները ծախսեք շինարարության վրա|Բացեք «Քաղաքը», ընտրեք ազատ հողամաս ու նախագիծ, ապա սեղմեք «Կառուցել»։ Բյուջեն պահպանվում է խաղերի միջև։",
    be: "Гульня загружаецца…|Фонавая музыка|Як гуляць|Прапусціць|Назад|Далей|Гуляць|Крок {step} з {total}|Пабудуйце Шкляны горад|Збірайце камбінацыі і ператварайце ачкі ў будынкі. На беразе вырастуць еўрапейскія кварталы і шкляныя хмарачосы.|Збярыце тры шарыкі ў рад|Ссуньце шарык да суседняга або націсніце на абодва па чарзе. Тры і больш аднолькавых шарыкаў у радзе разаб’юцца і прынясуць ачкі.|Выдаткуйце ачкі на будаўніцтва|Адкрыйце «Горад», выберыце вольны ўчастак і праект, затым націсніце «Пабудаваць». Бюджэт захоўваецца паміж партыямі.",
    ka: "თამაში იტვირთება…|ფონური მუსიკა|როგორ ვითამაშოთ|გამოტოვება|უკან|შემდეგი|თამაში|ნაბიჯი {step} / {total}|ააშენეთ მინის ქალაქი|შექმენით კომბინაციები და ქულები შენობებად აქციეთ. სანაპიროზე ევროპული კვარტლები და მინის ცათამბჯენები გაჩნდება.|სამი ბურთი ერთ რიგში მოაწყვეთ|გაასრიალეთ ბურთი მეზობლისკენ ან ორივეს რიგრიგობით შეეხეთ. ერთ რიგში სამი ან მეტი ერთნაირი ბურთი დაიმსხვრევა და ქულებს მიიღებთ.|დახარჯეთ ქულები მშენებლობაზე|გახსენით „ქალაქი“, აირჩიეთ თავისუფალი ნაკვეთი და პროექტი, შემდეგ დააჭირეთ „აშენებას“. ბიუჯეტი თამაშებს შორის ინახება.",
    kk: "Ойын жүктелуде…|Фондық музыка|Қалай ойнау керек|Өткізіп жіберу|Артқа|Келесі|Ойнау|{total} қадамның {step}-қадамы|Шыны қала салыңыз|Комбинация құрып, ұпайларды ғимаратқа айналдырыңыз. Жағалауда еуропалық орамдар мен шыны зәулім үйлер бой көтереді.|Үш шарды қатарға тізіңіз|Шарды көршісіне қарай сырғытыңыз немесе екеуін кезек түртіңіз. Бір қатардағы кемінде үш бірдей шар сынып, ұпай береді.|Ұпайларды құрылысқа жұмсаңыз|«Қаланы» ашыңыз, бос учаске мен жоба таңдаңыз да, «Салу» түймесін басыңыз. Бюджет ойындар арасында сақталады.",
    ky: "Оюн жүктөлүүдө…|Фондук музыка|Кантип ойноо керек|Өткөрүп жиберүү|Артка|Кийинки|Ойноо|{total} кадамдын {step}-кадамы|Айнек шаарды куруңуз|Упай топтоп, аларды имараттарга айландырыңыз. Жээкте европалык кварталдар жана айнек мунаралар өсөт.|Үч шарды катарга тизиңиз|Шарды коңшусуна жылдырыңыз же экөөнү кезеги менен басыңыз. Катардагы үч же андан көп бирдей шар сынып, упай берет.|Упайларды курулушка жумшаңыз|«Шаарды» ачып, бош жерди жана долбоорду тандаңыз, анан «Куруу» баскычын басыңыз. Бюджет оюндар арасында сакталат.",
    ro: "Se încarcă jocul…|Muzică de fundal|Cum se joacă|Omite|Înapoi|Înainte|Joacă|Pasul {step} din {total}|Construiește Orașul de sticlă|Formează combinații și transformă punctele în clădiri. Ridică pe mal cartiere europene și zgârie-nori de sticlă.|Așază trei bile într-un șir|Glisează o bilă spre cea alăturată sau atinge-le pe ambele pe rând. Trei sau mai multe bile identice în șir se sparg și îți aduc puncte.|Cheltuiește puncte pentru construcții|Deschide «Oraș», alege o parcelă liberă și un proiect, apoi apasă «Construiește». Bugetul se păstrează între partide.",
    tg: "Бозӣ бор мешавад…|Мусиқии замина|Тарзи бозӣ|Гузарондан|Бозгашт|Баъдӣ|Бозӣ кардан|Қадами {step} аз {total}|Шаҳри шишагӣ созед|Комбинатсияҳо созед ва холҳоро ба биноҳо табдил диҳед. Дар канори об маҳаллаҳои аврупоӣ ва осмонбӯсҳои шишагӣ қомат меафрозанд.|Се тӯбчаро дар як қатор чинед|Тӯбчаро ба сӯи тӯбчаи ҳамсоя лағжонед ё ҳар дуро пайдарпай зер кунед. Се ё зиёда тӯбчаи якхела мешикананд ва хол медиҳанд.|Холҳоро барои сохтмон сарф кунед|«Шаҳр»-ро кушоед, қитъаи холӣ ва тарҳро интихоб кунед ва «Сохтан»-ро зер кунед. Буҷет байни бозиҳо нигоҳ дошта мешавад.",
    tk: "Oýun ýüklenýär…|Fon sazy|Nädip oýnamaly|Geçir|Yza|Indiki|Oýna|{total} ädimiň {step}-njisi|Aýna şäheri guruň|Utuk gazanyň we olary binalara öwrüň. Suwuň kenarynda Ýewropa kwartallary we aýna belent jaýlar gurlar.|Üç şary bir hatara düzüň|Şary goňşusyna süýşüriň ýa-da ikisine nobatma-nobat basyň. Bir hatardaky üç ýa-da köp meňzeş şar döwülip, utuk getirýär.|Utuklary gurluşyga sarp ediň|«Şäheri» açyň, boş ýer bölegini we taslamany saýlaň, soň «Gur» düwmesine basyň. Býujet oýunlaryň arasynda saklanýar.",
    uz: "Oʻyin yuklanmoqda…|Fon musiqasi|Qanday oʻynaladi|Oʻtkazib yuborish|Orqaga|Keyingi|Oʻynash|{total} qadamdan {step}-qadam|Shisha shaharni quring|Kombinatsiyalar tuzing va ballarni binolarga aylantiring. Sohilda Yevropa mahallalari va shisha osmonoʻpar binolar qad koʻtaradi.|Uchta sharni bir qatorga tering|Sharni yonidagisiga suring yoki ikkalasini navbat bilan bosing. Bir qatordagi uch yoki undan koʻp bir xil shar sinadi va ball beradi.|Ballarni qurilishga sarflang|«Shahar»ni oching, boʻsh uchastka va loyihani tanlang, keyin «Qurish»ni bosing. Byudjet oʻyinlar orasida saqlanadi.",
    uk: "Гра завантажується…|Фонова музика|Як грати|Пропустити|Назад|Далі|Грати|Крок {step} з {total}|Побудуйте Скляне місто|Збирайте комбінації та перетворюйте очки на будівлі. На березі виростуть європейські квартали та скляні хмарочоси.|Зберіть три кульки в ряд|Посуньте кульку до сусідньої або торкніться обох по черзі. Три чи більше однакових кульок у ряд розіб’ються і принесуть очки.|Витрачайте очки на будівництво|Відкрийте «Місто», оберіть вільну ділянку й проєкт, а тоді натисніть «Побудувати». Бюджет зберігається між партіями."
  };
  const retry = {
    ru: "Не удалось связаться с игрой. Попробуйте ещё раз.",
    en: "Couldn't reach the game server. Please try again.",
    az: "Oyun serverinə qoşulmaq olmadı. Yenidən cəhd edin.",
    hy: "Չհաջողվեց կապվել խաղի սերվերին։ Կրկին փորձեք։",
    be: "Не ўдалося звязацца з серверам гульні. Паспрабуйце яшчэ раз.",
    ka: "თამაშის სერვერთან დაკავშირება ვერ მოხერხდა. სცადეთ ხელახლა.",
    kk: "Ойын серверіне қосылу мүмкін болмады. Қайталап көріңіз.",
    ky: "Оюн серверине туташуу мүмкүн болбоду. Кайра аракет кылыңыз.",
    ro: "Serverul jocului nu a răspuns. Încearcă din nou.",
    tg: "Пайвастшавӣ ба сервери бозӣ муяссар нашуд. Аз нав кӯшиш кунед.",
    tk: "Oýun serwerine birigip bolmady. Gaýtadan synanyşyň.",
    uz: "Oʻyin serveriga ulanib boʻlmadi. Qayta urinib koʻring.",
    uk: "Не вдалося зв’язатися із сервером гри. Спробуйте ще раз."
  };
  return Object.fromEntries(Object.entries(phrases).map(([locale, line]) => [
    locale, {
      ...Object.fromEntries(line.split("|").map((phrase, index) => [keys[index], phrase])),
      secureUnavailable: retry[locale]
    }
  ]));
})();
