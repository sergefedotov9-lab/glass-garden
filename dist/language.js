"use strict";

const gardenLanguage = (() => {
  const keys = `
title description game intro settings scoreboard score goal moves progress round board hint restart close
language theme light dark sound volume mute on off listen background garden spring midnight custom choose difficulty easy normal hard difficultyHelp apply again
instruction invalid points cascade reshuffle pick neighbor hintStatus win lose summary cell empty temporary badImage
ruby amber emerald azure amethyst pink`.trim().split(/\s+/);

  const translations = {
    ru: `Круглый квартал|Собирайте стеклянные шары в ряды и слушайте звон осколков.|Игра «Три в ряд»|Соберите три одинаковых шара в ряд.|Настройки|Счёт партии|Очки|Цель|Ходы|Прогресс к цели|Партия|Игровое поле|Подсказка|Сначала|Закрыть настройки
Язык|Тема интерфейса|Светлая|Тёмная|Звук|Громкость|Без звука|Звук вкл.|Звук выкл.|Послушать|Фон игры|Сад|Весна|Полночь|Своё фото|Выбрать своё фото|Сложность|Лёгкая|Обычная|Сложная|Смена сложности начнёт новую партию.|Начать новую партию|Новая партия
Нажмите на два соседних шара или сдвиньте один.|Этот обмен не собрал ряд. Попробуйте другой.|+{points} очков|Каскад ×{chain} · +{points} очков|Поле обновлено. Можно сделать новый ход.|Выберите шар.|Выберите соседний шар для обмена.|Поменяйте местами два подсвеченных шара.|Цель достигнута!|Ходы закончились|Набрано {score} из {goal} очков.|{color} шар, строка {row}, столбец {column}|Пустая клетка, строка {row}, столбец {column}|Фон изменён до закрытия или обновления страницы.|Не удалось открыть картинку. Выберите другой файл.
Рубиновый|Янтарный|Изумрудный|Лазурный|Аметистовый|Розовый`,
    en: `Круглый квартал|Match glass orbs and listen to the sound of shattering glass.|Match-three game|Match three identical orbs in a row.|Settings|Game score|Score|Goal|Moves|Progress toward the goal|Game|Board|Hint|Restart|Close settings
Language|Interface theme|Light|Dark|Sound|Volume|Mute|Sound on|Sound off|Preview sound|Game background|Garden|Spring|Midnight|Your photo|Choose your photo|Difficulty|Easy|Normal|Hard|Changing difficulty starts a new game.|Start a new game|New game
Tap two adjacent orbs or swipe one.|That swap didn't make a match. Try another.|+{points} points|Cascade ×{chain} · +{points} points|The board has been refreshed. Make another move.|Select an orb.|Select an adjacent orb to swap.|Swap the two highlighted orbs.|Goal reached!|Out of moves|You scored {score} of {goal} points.|{color} orb, row {row}, column {column}|Empty cell, row {row}, column {column}|The background will reset when you close or reload the page.|Couldn't open the image. Choose a different file.
Ruby|Amber|Emerald|Azure|Amethyst|Pink`,
    uk: `Круглый квартал|Збирайте скляні кульки в ряди та слухайте дзвін уламків.|Гра «Три в ряд»|Зберіть три однакові кульки в ряд.|Налаштування|Рахунок гри|Очки|Мета|Ходи|Прогрес до мети|Партія|Ігрове поле|Підказка|Спочатку|Закрити налаштування
Мова|Тема інтерфейсу|Світла|Темна|Звук|Гучність|Вимкнути звук|Звук увімкнено|Звук вимкнено|Прослухати|Тло гри|Сад|Весна|Північ|Ваше фото|Вибрати своє фото|Складність|Легка|Звичайна|Складна|Зміна складності почне нову партію.|Почати нову партію|Нова партія
Торкніться двох сусідніх кульок або посуньте одну.|Цей обмін не утворив ряд. Спробуйте інший.|+{points} очок|Каскад ×{chain} · +{points} очок|Поле оновлено. Можна зробити новий хід.|Виберіть кульку.|Виберіть сусідню кульку для обміну.|Поміняйте місцями дві підсвічені кульки.|Мети досягнуто!|Ходи закінчилися|Ви набрали {score} з {goal} очок.|{color} кулька, рядок {row}, стовпець {column}|Порожня клітинка, рядок {row}, стовпець {column}|Тло діятиме до закриття або оновлення сторінки.|Не вдалося відкрити зображення. Виберіть інший файл.
Рубінова|Бурштинова|Смарагдова|Лазурова|Аметистова|Рожева`,
    be: `Круглый квартал|Збірайце шкляныя шарыкі ў рады і слухайце звон аскепкаў.|Гульня «Тры ў рад»|Збярыце тры аднолькавыя шарыкі ў рад.|Налады|Лік гульні|Ачкі|Мэта|Хады|Прагрэс да мэты|Партыя|Гульнявое поле|Падказка|Спачатку|Закрыць налады
Мова|Тэма інтэрфейсу|Светлая|Цёмная|Гук|Гучнасць|Выключыць гук|Гук уключаны|Гук выключаны|Паслухаць|Фон гульні|Сад|Вясна|Поўнач|Ваша фота|Выбраць сваё фота|Складанасць|Лёгкая|Звычайная|Складаная|Змена складанасці пачне новую партыю.|Пачаць новую партыю|Новая партыя
Націсніце на два суседнія шарыкі або ссуньце адзін.|Гэты абмен не стварыў рада. Паспрабуйце іншы.|+{points} ачкоў|Каскад ×{chain} · +{points} ачкоў|Поле абноўлена. Можна зрабіць новы ход.|Выберыце шарык.|Выберыце суседні шарык для абмену.|Памяняйце месцамі два падсвечаныя шарыкі.|Мэта дасягнута!|Хады скончыліся|Набрана {score} з {goal} ачкоў.|{color} шарык, радок {row}, слупок {column}|Пустая клетка, радок {row}, слупок {column}|Фон зменены да закрыцця або абнаўлення старонкі.|Не ўдалося адкрыць выяву. Выберыце іншы файл.
Рубінавы|Бурштынавы|Смарагдавы|Блакітны|Аметыставы|Ружовы`,
    kk: `Круглый квартал|Шыны шарларды қатарға тізіп, сынықтардың сыңғырын тыңдаңыз.|«Қатарынан үш» ойыны|Үш бірдей шарды бір қатарға тізіңіз.|Баптаулар|Ойын есебі|Ұпай|Мақсат|Жүріс|Мақсатқа жету барысы|Ойын|Ойын алаңы|Көмек|Қайта бастау|Баптауларды жабу
Тіл|Интерфейс тақырыбы|Ашық|Қараңғы|Дыбыс|Дыбыс деңгейі|Дыбысты өшіру|Дыбыс қосулы|Дыбыс өшірулі|Тыңдап көру|Ойын фоны|Бақ|Көктем|Түн ортасы|Өз фотосы|Өз фотоңызды таңдау|Күрделілік|Оңай|Қалыпты|Қиын|Күрделілікті өзгерткенде жаңа ойын басталады.|Жаңа ойын бастау|Жаңа ойын
Қатар тұрған екі шарды түртіңіз немесе біреуін сырғытыңыз.|Ауыстырған шарлар қатар құрамады. Басқаша көріңіз.|+{points} ұпай|Тізбек ×{chain} · +{points} ұпай|Алаң жаңарды. Келесі жүрісті жасаңыз.|Шарды таңдаңыз.|Ауыстыру үшін көршілес шарды таңдаңыз.|Белгіленген екі шардың орнын ауыстырыңыз.|Мақсатқа жеттіңіз!|Жүрістер бітті|{goal} ұпайдың {score} ұпайын жинадыңыз.|{color} шар, {row}-жол, {column}-баған|Бос ұяшық, {row}-жол, {column}-баған|Фон бетті жапқанша немесе жаңартқанша сақталады.|Сурет ашылмады. Басқа файлды таңдаңыз.
Лағыл түсті|Кәріптас түсті|Зүбәржат түсті|Көгілдір|Аметист түсті|Қызғылт`,
    ky: `Круглый квартал|Айнек шарларды катарга тизип, сыныктардын үнүн угуңуз.|«Катарынан үч» оюну|Үч окшош шарды бир катарга тизиңиз.|Жөндөөлөр|Оюндун упайы|Упай|Максат|Жүрүш|Максатка жетүү|Оюн|Оюн талаасы|Кеңеш|Кайра баштоо|Жөндөөлөрдү жабуу
Тил|Интерфейстин темасы|Жарык|Караңгы|Үн|Үндүн деңгээли|Үндү өчүрүү|Үн күйүк|Үн өчүк|Угуп көрүү|Оюндун фону|Бак|Жаз|Түн ортосу|Өз сүрөтүңүз|Өз сүрөтүңүздү тандоо|Кыйындык|Жеңил|Кадимки|Кыйын|Кыйындыкты өзгөрткөндө жаңы оюн башталат.|Жаңы оюнду баштоо|Жаңы оюн
Жанаша турган эки шарды басыңыз же бирин жылдырыңыз.|Алмаштырганда катар түзүлгөн жок. Башкача аракет кылыңыз.|+{points} упай|Чынжыр ×{chain} · +{points} упай|Талаа жаңырды. Кийинки жүрүштү жасаңыз.|Шарды тандаңыз.|Алмаштыруу үчүн жанындагы шарды тандаңыз.|Белгиленген эки шардын ордун алмаштырыңыз.|Максатка жеттиңиз!|Жүрүштөр бүттү|{goal} упайдан {score} упай топтодуңуз.|{color} шар, {row}-сап, {column}-мамыча|Бош уяча, {row}-сап, {column}-мамыча|Фон баракты жапканга же жаңыртканга чейин сакталат.|Сүрөт ачылган жок. Башка файлды тандаңыз.
Жакут түстүү|Янтарь түстүү|Зымырыт түстүү|Көгүлтүр|Аметист түстүү|Кызгылт`,
    uz: `Круглый квартал|Shisha sharlarni qatorga tering va siniqlarning jarangini tinglang.|«Ketma-ket uchta» oʻyini|Uchta bir xil sharni bir qatorga tering.|Sozlamalar|Oʻyin hisobi|Ball|Maqsad|Yurishlar|Maqsad sari siljish|Oʻyin|Oʻyin maydoni|Yordam|Qayta boshlash|Sozlamalarni yopish
Til|Interfeys mavzusi|Yorugʻ|Qorongʻi|Ovoz|Ovoz balandligi|Ovozni oʻchirish|Ovoz yoqilgan|Ovoz oʻchirilgan|Tinglab koʻrish|Oʻyin foni|Bogʻ|Bahor|Yarim tun|Oʻz suratingiz|Oʻz suratingizni tanlash|Qiyinlik|Oson|Oddiy|Qiyin|Qiyinlik oʻzgarsa, yangi oʻyin boshlanadi.|Yangi oʻyinni boshlash|Yangi oʻyin
Yonma-yon ikkita sharni bosing yoki birini suring.|Bu almashtirish qator hosil qilmadi. Boshqasini sinab koʻring.|+{points} ball|Zanjir ×{chain} · +{points} ball|Maydon yangilandi. Keyingi yurishni qiling.|Sharni tanlang.|Almashtirish uchun yonidagi sharni tanlang.|Ajratilgan ikki sharning joyini almashtiring.|Maqsadga erishdingiz!|Yurishlar tugadi|{goal} balldan {score} ball toʻpladingiz.|{color} shar, {row}-qator, {column}-ustun|Boʻsh katak, {row}-qator, {column}-ustun|Fon sahifa yopilguncha yoki yangilanguncha saqlanadi.|Rasm ochilmadi. Boshqa faylni tanlang.
Yoqut rangli|Qahrabo rangli|Zumrad rangli|Moviy|Ametist rangli|Pushti`,
    tg: `Круглый квартал|Тӯбчаҳои шишагиро ба қатор чинед ва садои шикастани шишаро гӯш кунед.|Бозии «Се дар як қатор»|Се тӯбчаи якхеларо дар як қатор чинед.|Танзимот|Ҳисоби бозӣ|Хол|Ҳадаф|Ҳаракатҳо|Пешрафт ба сӯи ҳадаф|Бозӣ|Майдони бозӣ|Роҳнамо|Аз нав|Пӯшидани танзимот
Забон|Мавзӯи интерфейс|Равшан|Торик|Садо|Баландии садо|Хомӯш кардани садо|Садо фаъол аст|Садо хомӯш аст|Гӯш кардан|Заминаи бозӣ|Боғ|Баҳор|Нисфи шаб|Акси худ|Интихоби акси худ|Душворӣ|Осон|Муқаррарӣ|Душвор|Бо иваз кардани сатҳи душворӣ бозии нав оғоз мешавад.|Оғози бозии нав|Бозии нав
Ду тӯбчаи ҳамсояро зер кунед ё якеро лағжонед.|Бо ин ивазкунӣ қатор ҳосил нашуд. Ивази дигарро санҷед.|+{points} хол|Занҷир ×{chain} · +{points} хол|Майдон нав шуд. Ҳаракати нав кунед.|Тӯбчаеро интихоб кунед.|Барои иваз кардан тӯбчаи ҳамсояро интихоб кунед.|Ҷойи ду тӯбчаи равшаншударо иваз кунед.|Ба ҳадаф расидед!|Ҳаракатҳо тамом шуданд|Шумо аз {goal} хол {score} хол гирифтед.|Тӯбчаи {color}, сатри {row}, сутуни {column}|Хонаи холӣ, сатри {row}, сутуни {column}|Замина то пӯшидан ё нав кардани саҳифа нигоҳ дошта мешавад.|Тасвир кушода нашуд. Файли дигареро интихоб кунед.
ёқутӣ|қаҳрабоӣ|зумуррадӣ|нилгун|аметистӣ|гулобӣ`,
    tk: `Круглый квартал|Aýna şarlary hatara düzüň we döwülýän aýnanyň sesini diňläň.|«Bir hatarda üç» oýny|Üç meňzeş şary bir hatara düzüň.|Sazlamalar|Oýnuň hasaby|Utuk|Maksat|Göçümler|Maksada tarap ilerleme|Oýun|Oýun meýdançasy|Yşarat|Täzeden başla|Sazlamalary ýap
Dil|Interfeýsiň temasy|Açyk|Garaňky|Ses|Sesiň derejesi|Sesi öçür|Ses açyk|Ses öçük|Diňläp gör|Oýnuň fony|Bag|Bahar|Ýarygije|Öz suratyňyz|Öz suratyňyzy saýlaň|Kynçylyk|Ýeňil|Adaty|Kyn|Kynçylyk üýtgese, täze oýun başlanar.|Täze oýna başla|Täze oýun
Iki goňşy şara basyň ýa-da birini süýşüriň.|Bu çalşyk hatar döretmedi. Başga çalşygy synap görüň.|+{points} utuk|Zynjyr ×{chain} · +{points} utuk|Meýdança täzelendi. Indiki göçümi ediň.|Şary saýlaň.|Çalyşmak üçin goňşy şary saýlaň.|Tapawutlandyrylan iki şaryň ýerini çalşyň.|Maksada ýetdiňiz!|Göçümler gutardy|{goal} utukdan {score} utuk gazandyňyz.|{color} şar, {row}-nji hatar, {column}-nji sütün|Boş öýjük, {row}-nji hatar, {column}-nji sütün|Fon sahypa ýapylýança ýa-da täzelenýänçä saklanar.|Suraty açyp bolmady. Başga faýl saýlaň.
Ýakut reňkli|Kähribar reňkli|Zümerret reňkli|Mawy|Ametist reňkli|Gülgüne`,
    az: `Круглый квартал|Şüşə kürələri sıraya düzün və sınan şüşənin səsini dinləyin.|«Üçü bir sırada» oyunu|Üç eyni kürəni bir sıraya düzün.|Ayarlar|Oyun hesabı|Xal|Hədəf|Gedişlər|Hədəfə doğru irəliləyiş|Oyun|Oyun lövhəsi|İpucu|Yenidən başla|Ayarları bağla
Dil|İnterfeys mövzusu|Açıq|Tünd|Səs|Səs səviyyəsi|Səsi söndür|Səs açıqdır|Səs söndürülüb|Səsi dinlə|Oyun fonu|Bağ|Yaz|Gecə yarısı|Öz şəkliniz|Öz şəklinizi seçin|Çətinlik|Asan|Normal|Çətin|Çətinliyi dəyişəndə yeni oyun başlayır.|Yeni oyuna başla|Yeni oyun
Yan-yana olan iki kürəyə toxunun və ya birini sürüşdürün.|Bu dəyişmə sıra yaratmadı. Başqasını sınayın.|+{points} xal|Zəncir ×{chain} · +{points} xal|Lövhə yeniləndi. Növbəti gedişi edin.|Kürəni seçin.|Dəyişmək üçün yanındakı kürəni seçin.|İşarələnmiş iki kürənin yerini dəyişin.|Hədəfə çatdınız!|Gedişlər bitdi|{goal} xaldan {score} xal topladınız.|{color} kürə, {row}-ci sətir, {column}-ci sütun|Boş xana, {row}-ci sətir, {column}-ci sütun|Fon səhifəni bağlayana və ya yeniləyənə qədər saxlanacaq.|Şəkli açmaq olmadı. Başqa fayl seçin.
Yaqut rəngli|Kəhrəba rəngli|Zümrüd rəngli|Mavi|Ametist rəngli|Çəhrayı`,
    hy: `Круглый квартал|Ապակե գնդիկները շարեք և լսեք կոտրվող ապակու ձայնը։|«Երեքը շարքով» խաղ|Երեք նույն գնդիկ շարեք մեկ շարքում։|Կարգավորումներ|Խաղի հաշիվ|Միավորներ|Նպատակ|Քայլեր|Առաջընթաց դեպի նպատակը|Խաղ|Խաղադաշտ|Հուշում|Սկսել նորից|Փակել կարգավորումները
Լեզու|Միջերեսի թեմա|Բաց|Մուգ|Ձայն|Ձայնի բարձրություն|Անջատել ձայնը|Ձայնը միացված է|Ձայնն անջատված է|Լսել ձայնը|Խաղի ֆոն|Այգի|Գարուն|Կեսգիշեր|Ձեր լուսանկարը|Ընտրել ձեր լուսանկարը|Բարդություն|Հեշտ|Սովորական|Բարդ|Բարդությունը փոխելիս նոր խաղ կսկսվի։|Սկսել նոր խաղ|Նոր խաղ
Հպվեք երկու հարևան գնդիկի կամ սահեցրեք մեկը։|Այս փոխանակմամբ շարք չկազմվեց։ Փորձեք մեկ ուրիշը։|+{points} միավոր|Շղթա ×{chain} · +{points} միավոր|Խաղադաշտը թարմացվեց։ Կատարեք հաջորդ քայլը։|Ընտրեք գնդիկ։|Ընտրեք հարևան գնդիկը՝ տեղերը փոխելու համար։|Փոխեք ընդգծված երկու գնդիկների տեղերը։|Նպատակին հասաք։|Քայլերն ավարտվեցին|Հավաքեցիք {score} միավոր՝ {goal}-ից։|{color} գնդիկ, տող {row}, սյունակ {column}|Դատարկ վանդակ, տող {row}, սյունակ {column}|Ֆոնը կպահպանվի մինչև էջը փակելը կամ թարմացնելը։|Չհաջողվեց բացել պատկերը։ Ընտրեք այլ ֆայլ։
Սուտակագույն|Սաթագույն|Զմրուխտագույն|Երկնագույն|Ամեթիստագույն|Վարդագույն`,
    ka: `Круглый квартал|მინის ბურთები მწკრივებად დააწყვეთ და მოუსმინეთ მსხვრევის ხმას.|თამაში „სამი ერთ რიგში“|სამი ერთნაირი ბურთი ერთ რიგში მოაწყვეთ.|პარამეტრები|თამაშის ანგარიში|ქულები|მიზანი|სვლები|პროგრესი მიზნისკენ|თამაში|სათამაშო დაფა|მინიშნება|თავიდან დაწყება|პარამეტრების დახურვა
ენა|ინტერფეისის თემა|ღია|მუქი|ხმა|ხმის დონე|ხმის გამორთვა|ხმა ჩართულია|ხმა გამორთულია|ხმის მოსმენა|თამაშის ფონი|ბაღი|გაზაფხული|შუაღამე|თქვენი ფოტო|თქვენი ფოტოს არჩევა|სირთულე|მარტივი|ჩვეულებრივი|რთული|სირთულის შეცვლისას ახალი თამაში დაიწყება.|ახალი თამაშის დაწყება|ახალი თამაში
შეეხეთ ორ მეზობელ ბურთს ან ერთი გაასრიალეთ.|ამ გაცვლით რიგი არ შეიქმნა. სცადეთ სხვა სვლა.|+{points} ქულა|ჯაჭვი ×{chain} · +{points} ქულა|დაფა განახლდა. გააკეთეთ შემდეგი სვლა.|აირჩიეთ ბურთი.|ასაცვლელად აირჩიეთ მეზობელი ბურთი.|გაუცვალეთ ადგილები ორ მონიშნულ ბურთს.|მიზანს მიაღწიეთ!|სვლები ამოიწურა|დააგროვეთ {score} ქულა {goal}-დან.|{color} ბურთი, რიგი {row}, სვეტი {column}|ცარიელი უჯრა, რიგი {row}, სვეტი {column}|ფონი დარჩება გვერდის დახურვამდე ან განახლებამდე.|სურათი ვერ გაიხსნა. აირჩიეთ სხვა ფაილი.
ლალისფერი|ქარვისფერი|ზურმუხტისფერი|ცისფერი|ამეთვისტოსფერი|ვარდისფერი`,
    ro: `Круглый квартал|Așază bilele de sticlă în șir și ascultă clinchetul cioburilor.|Joc cu trei în linie|Așază trei bile identice într-un șir.|Setări|Scorul jocului|Scor|Țintă|Mutări|Progres spre țintă|Joc|Tabla de joc|Indiciu|De la capăt|Închide setările
Limbă|Tema interfeței|Luminoasă|Întunecată|Sunet|Volum|Oprește sunetul|Sunet activ|Sunet oprit|Ascultă|Fundalul jocului|Grădină|Primăvară|Miezul nopții|Fotografia ta|Alege fotografia ta|Dificultate|Ușoară|Normală|Dificilă|Schimbarea dificultății începe un joc nou.|Începe un joc nou|Joc nou
Atinge două bile alăturate sau glisează una.|Schimbul nu a format un șir. Încearcă altul.|+{points} puncte|Cascadă ×{chain} · +{points} puncte|Tabla a fost rearanjată. Fă următoarea mutare.|Alege o bilă.|Alege o bilă alăturată pentru schimb.|Schimbă între ele cele două bile evidențiate.|Țintă atinsă!|Nu mai ai mutări|Ai obținut {score} din {goal} puncte.|Bilă {color}, rândul {row}, coloana {column}|Celulă goală, rândul {row}, coloana {column}|Fundalul se păstrează până când închizi sau reîncarci pagina.|Imaginea nu s-a deschis. Alege alt fișier.
rubinie|chihlimbarie|verde-smarald|azurie|ametist|roz`
  };

  const messages = Object.fromEntries(Object.entries(translations).map(([locale, source]) => [
    locale, {
      ...Object.fromEntries(source.split(/[|\n]/).map((value, index) => [keys[index], value])),
      ...cityTranslations[locale],
      ...introTranslations[locale]
    }
  ]));
  const storageKey = "glass-garden-language";
  const selector = document.querySelector("#language");
  const localizedText = new Map();
  let locale = "ru";
  let number;
  let percent;

  try {
    const saved = localStorage.getItem(storageKey);
    if (Object.hasOwn(messages, saved)) locale = saved;
  } catch {
    // Use Russian when local preferences are unavailable.
  }

  function t(key, values = {}) {
    return (messages[locale][key] ?? messages.ru[key]).replace(/\{(\w+)\}/g, (_, name) => (
      typeof values[name] === "number" ? number.format(values[name]) : (values[name] ?? "")
    ));
  }

  function write(element, key, values) {
    localizedText.set(element, { key, values });
    element.textContent = key ? t(key, values) : "";
  }

  function renderLanguage() {
    document.documentElement.lang = locale;
    selector.value = locale;
    number = new Intl.NumberFormat(locale);
    percent = new Intl.NumberFormat(locale, { style: "percent" });
    for (const element of document.querySelectorAll("[data-i18n]")) {
      element.textContent = t(element.dataset.i18n);
    }
    for (const element of document.querySelectorAll("[data-i18n-label]")) {
      element.setAttribute("aria-label", t(element.dataset.i18nLabel));
    }
    for (const element of document.querySelectorAll("[data-i18n-content]")) {
      element.content = t(element.dataset.i18nContent);
    }
    for (const [element, { key, values }] of localizedText) {
      write(element, key, values);
    }
  }

  selector.addEventListener("change", () => {
    if (!Object.hasOwn(messages, selector.value)) return;
    locale = selector.value;
    renderLanguage();
    try {
      localStorage.setItem(storageKey, locale);
    } catch {
      // Keep the chosen language for the current session.
    }
    document.dispatchEvent(new Event("garden-language-change"));
  });

  renderLanguage();
  return {
    t,
    write,
    formatNumber: value => number.format(value),
    formatPercent: value => percent.format(value)
  };
})();
