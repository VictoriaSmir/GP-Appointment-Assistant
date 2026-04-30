console.log("LOADING: emergency.js");

const EMERGENCY_SYMPTOMS = {
  "eng_Latn": {
    "warning_title":   "Call 999 now if you or someone has any of these:",
    "screen_title":    "Confirm this is not an emergency",
    "button_emergency":"Yes - Call 999 Now",
    "button_continue": "No, book GP appointment",
    "symptoms": [
      { "category": "signs of a heart attack",          "description": "chest pain, pressure, heaviness, tightness or squeezing across the chest" },
      { "category": "signs of a stroke",                "description": "face dropping on one side, cannot hold both arms up, difficulty speaking" },
      { "category": "sudden confusion (delirium)",      "description": "cannot be sure of own name or age, slurred speech or not making sense" },
      { "category": "suicide attempt",                  "description": "by taking something or self-harming" },
      { "category": "severe difficulty breathing",      "description": "not being able to get words out, breathing very fast, choking or gasping" },
      { "category": "heavy bleeding",                   "description": "spraying, pouring or enough to make a puddle" },
      { "category": "severe injuries",                  "description": "after a serious accident" },
      { "category": "seizure (fit)",                    "description": "shaking or jerking because of a fit, or unconscious (can't be woken up)" },
      { "category": "sudden, rapid swelling",           "description": "of the lips, mouth, throat or tongue" },
      { "category": "labour or childbirth",             "description": "water breaking, more frequent intense cramps (contractions), baby coming, or just born" },
      { "category": "signs of a severe infection (sepsis)", "description": "blue, grey, pale or blotchy skin, lips, tongue, palms of soles; a rash that does not fade when you roll a glass over it or high temperature with a stiff neck / bothered by light" }
    ]
  },
  "spa_Latn": {
    "warning_title":   "Llama al 999 ahora si tú o alguien tiene alguno de estos:",
    "screen_title":    "Confirma que no es una emergencia",
    "button_emergency":"Sí - Llama al 999 Ahora",
    "button_continue": "No, reservar cita con el médico",
    "symptoms": [
      { "category": "signos de un ataque al corazón",   "description": "dolor en el pecho, presión, pesadez, tensión o constricción en el pecho" },
      { "category": "signos de un derrame cerebral",    "description": "cara caída de un lado, no puede sostener ambos brazos en alto, dificultad para hablar" },
      { "category": "confusión repentina (delirio)",    "description": "no puede estar seguro de su nombre o edad, habla confusa o sin sentido" },
      { "category": "intento de suicidio",              "description": "tomando algo o autolesionándose" },
      { "category": "dificultad severa para respirar",  "description": "no poder pronunciar palabras, respirar muy rápido, ahogar o jadear" },
      { "category": "sangrado abundante",               "description": "rociando, derramando o suficiente para formar un charco" },
      { "category": "lesiones graves",                  "description": "después de un accidente grave" },
      { "category": "convulsión (ataque)",              "description": "temblores o sacudidas por un ataque, o inconsciente (no se puede despertar)" },
      { "category": "hinchazón repentina y rápida",     "description": "de labios, boca, garganta o lengua" },
      { "category": "parto o alumbramiento",            "description": "rotura de aguas, calambres intensos más frecuentes (contracciones), bebé en camino o recién nacido" },
      { "category": "signos de infección grave (sepsis)", "description": "piel azul, gris, pálida o manchada, labios, lengua, palmas o plantas; sarpullido que no desaparece al rodar un vaso sobre él o fiebre alta con cuello rígido / molestia con la luz" }
    ]
  },
  "fra_Latn": {
    "warning_title":   "Appelez le 999 maintenant si vous ou quelqu'un présente l'un de ces signes :",
    "screen_title":    "Confirmez qu'il ne s'agit pas d'une urgence",
    "button_emergency":"Oui - Appeler le 999 Maintenant",
    "button_continue": "Non, prendre rendez-vous chez le médecin",
    "symptoms": [
      { "category": "signes d'une crise cardiaque",     "description": "douleur thoracique, pression, lourdeur, serrement ou oppression dans la poitrine" },
      { "category": "signes d'un AVC",                  "description": "visage tombant d'un côté, incapacité à lever les deux bras, difficulté à parler" },
      { "category": "confusion soudaine (délire)",      "description": "ne peut pas être sûr de son nom ou âge, discours confus ou incompréhensible" },
      { "category": "tentative de suicide",             "description": "en prenant quelque chose ou en s'automutilant" },
      { "category": "difficulté respiratoire sévère",   "description": "incapacité à prononcer des mots, respiration très rapide, étouffement ou halètement" },
      { "category": "saignement abondant",              "description": "giclant, coulant ou assez pour former une flaque" },
      { "category": "blessures graves",                 "description": "après un accident grave" },
      { "category": "convulsion (crise)",               "description": "tremblements ou secousses dus à une crise, ou inconscient (ne peut pas être réveillé)" },
      { "category": "gonflement soudain et rapide",     "description": "des lèvres, de la bouche, de la gorge ou de la langue" },
      { "category": "travail ou accouchement",          "description": "perte des eaux, crampes intenses plus fréquentes (contractions), bébé à venir ou venant de naître" },
      { "category": "signes d'infection grave (sepsis)", "description": "peau bleue, grise, pâle ou marbrée, lèvres, langue, paumes ou plantes; éruption cutanée qui ne s'efface pas quand on passe un verre dessus ou forte fièvre avec nuque raide / gêne à la lumière" }
    ]
  },
  "deu_Latn": {
    "warning_title":   "Rufen Sie jetzt 999, wenn Sie oder jemand eines davon hat:",
    "screen_title":    "Bestätigen Sie, dass es kein Notfall ist",
    "button_emergency":"Ja - Jetzt 999 Anrufen",
    "button_continue": "Nein, Arzttermin buchen",
    "symptoms": [
      { "category": "Anzeichen eines Herzinfarkts",     "description": "Brustschmerzen, Druck, Schwere, Enge oder Quetschen in der Brust" },
      { "category": "Anzeichen eines Schlaganfalls",    "description": "Gesicht hängt auf einer Seite, kann nicht beide Arme heben, Sprachschwierigkeiten" },
      { "category": "plötzliche Verwirrtheit (Delir)",  "description": "nicht sicher über eigenen Namen oder Alter, undeutliche oder unverständliche Sprache" },
      { "category": "Suizidversuch",                    "description": "durch Einnahme von etwas oder Selbstverletzung" },
      { "category": "schwere Atemnot",                  "description": "unfähig Worte herauszubringen, sehr schnelles Atmen, Würgen oder Keuchen" },
      { "category": "starke Blutung",                   "description": "spritzend, fließend oder genug, um eine Pfütze zu bilden" },
      { "category": "schwere Verletzungen",             "description": "nach einem schweren Unfall" },
      { "category": "Krampfanfall",                     "description": "Zittern oder Zucken durch einen Anfall, oder bewusstlos (kann nicht geweckt werden)" },
      { "category": "plötzliche, schnelle Schwellung",  "description": "der Lippen, des Mundes, der Kehle oder der Zunge" },
      { "category": "Wehen oder Geburt",                "description": "Blasensprung, häufigere intensive Krämpfe (Wehen), Baby kommt oder ist gerade geboren" },
      { "category": "Zeichen einer schweren Infektion (Sepsis)", "description": "blaue, graue, blasse oder fleckige Haut, Lippen, Zunge, Handflächen oder Fußsohlen; Ausschlag, der nicht verblasst wenn man ein Glas darüberrollt, oder hohes Fieber mit steifem Nacken / Lichtempfindlichkeit" }
    ]
  },
  "por_Latn": {
    "warning_title":   "Ligue para o 999 agora se você ou alguém tiver algum destes:",
    "screen_title":    "Confirme que não é uma emergência",
    "button_emergency":"Sim - Ligar para 999 Agora",
    "button_continue": "Não, marcar consulta com o médico",
    "symptoms": [
      { "category": "sinais de ataque cardíaco",        "description": "dor no peito, pressão, peso, aperto ou aperto no peito" },
      { "category": "sinais de AVC",                    "description": "rosto caindo de um lado, não consegue segurar ambos os braços levantados, dificuldade em falar" },
      { "category": "confusão súbita (delírio)",        "description": "não consegue ter certeza do próprio nome ou idade, fala enrolada ou sem sentido" },
      { "category": "tentativa de suicídio",            "description": "tomando algo ou se automutilando" },
      { "category": "dificuldade grave para respirar",  "description": "não conseguir pronunciar palavras, respirar muito rápido, engasgando ou ofegante" },
      { "category": "sangramento abundante",            "description": "jorrando, derramando ou suficiente para formar uma poça" },
      { "category": "ferimentos graves",                "description": "após um acidente grave" },
      { "category": "convulsão (ataque)",               "description": "tremores ou sacudidas por causa de um ataque, ou inconsciente (não pode ser acordado)" },
      { "category": "inchaço repentino e rápido",       "description": "dos lábios, boca, garganta ou língua" },
      { "category": "trabalho de parto ou parto",       "description": "rompimento da bolsa, câimbras intensas mais frequentes (contrações), bebê chegando ou recém-nascido" },
      { "category": "sinais de infecção grave (sepse)", "description": "pele azul, cinza, pálida ou manchada, lábios, língua, palmas ou solas; erupção cutânea que não desaparece ao rolar um copo sobre ela ou febre alta com pescoço rígido / incomodado com a luz" }
    ]
  },
  "pol_Latn": {
    "warning_title":   "Zadzwoń teraz pod 999, jeśli ty lub ktoś ma którekolwiek z tych objawów:",
    "screen_title":    "Potwierdź, że to nie jest nagły przypadek",
    "button_emergency":"Tak - Zadzwoń pod 999 Teraz",
    "button_continue": "Nie, umów wizytę u lekarza",
    "symptoms": [
      { "category": "objawy zawału serca",              "description": "ból w klatce piersiowej, ucisk, ciężkość, napięcie lub ściskanie w klatce piersiowej" },
      { "category": "objawy udaru mózgu",               "description": "opadanie twarzy po jednej stronie, niemożność trzymania obu rąk w górze, trudności z mówieniem" },
      { "category": "nagłe splątanie (delirium)",       "description": "niepewność co do własnego imienia lub wieku, bełkotliwa mowa lub nie ma sensu" },
      { "category": "próba samobójcza",                 "description": "przyjmując coś lub samookaleczając się" },
      { "category": "ciężkie trudności z oddychaniem",  "description": "niemożność wydobycia słów, bardzo szybkie oddychanie, dławienie lub dyszel" },
      { "category": "obfite krwawienie",                "description": "tryskające, lejące lub wystarczające do utworzenia kałuży" },
      { "category": "poważne obrażenia",                "description": "po poważnym wypadku" },
      { "category": "napad drgawkowy",                  "description": "drżenie lub szarpanie z powodu napadu lub nieprzytomny (nie można go obudzić)" },
      { "category": "nagły, gwałtowny obrzęk",          "description": "warg, ust, gardła lub języka" },
      { "category": "poród lub połóg",                  "description": "odejście wód, coraz częstsze intensywne skurcze, dziecko przychodzące lub właśnie urodzone" },
      { "category": "objawy ciężkiej infekcji (sepsa)", "description": "niebieska, szara, blada lub plamkowa skóra, usta, język, dłonie lub podeszwy; wysypka, która nie znika po przetoczeniu po niej szklanki lub wysoka temperatura ze sztywnym karkiem / wrażliwość na światło" }
    ]
  },
  "rus_Cyrl": {
    "warning_title":   "Звоните 999 прямо сейчас, если у вас или кого-то есть что-то из этого:",
    "screen_title":    "Подтвердите, что это не экстренная ситуация",
    "button_emergency":"Да - Позвонить 999 Сейчас",
    "button_continue": "Нет, записаться на приём к врачу",
    "symptoms": [
      { "category": "признаки сердечного приступа",     "description": "боль в груди, давление, тяжесть, сжатие или сдавливание в грудной клетке" },
      { "category": "признаки инсульта",                "description": "опущение лица с одной стороны, невозможность поднять обе руки, затруднение речи" },
      { "category": "внезапная спутанность сознания",   "description": "не уверен в своём имени или возрасте, невнятная речь или бессмысленные слова" },
      { "category": "попытка самоубийства",             "description": "приём чего-либо или самоповреждение" },
      { "category": "сильное затруднение дыхания",      "description": "неспособность говорить, очень быстрое дыхание, удушье или задыхание" },
      { "category": "сильное кровотечение",             "description": "брызжет, льётся или достаточно, чтобы образовалась лужа" },
      { "category": "серьёзные травмы",                 "description": "после серьёзной аварии" },
      { "category": "судороги (приступ)",               "description": "тряска или дёргания из-за приступа, или без сознания" },
      { "category": "внезапный, быстрый отёк",          "description": "губ, рта, горла или языка" },
      { "category": "роды или родоразрешение",          "description": "отхождение вод, более частые интенсивные схватки, ребёнок появляется или только что родился" },
      { "category": "признаки тяжёлой инфекции (сепсис)", "description": "синяя, серая, бледная или пятнистая кожа; сыпь, не исчезающая при прокатывании стакана, или высокая температура с жёсткой шеей / беспокойство от света" }
    ]
  },
  "ukr_Cyrl": {
    "warning_title":   "Телефонуйте 999 зараз, якщо у вас або когось є будь-що з цього:",
    "screen_title":    "Підтвердьте, що це не надзвичайна ситуація",
    "button_emergency":"Так - Зателефонувати 999 Зараз",
    "button_continue": "Ні, записатись на прийом до лікаря",
    "symptoms": [
      { "category": "ознаки серцевого нападу",          "description": "біль у грудях, тиск, важкість, стискання або здавлювання в грудній клітці" },
      { "category": "ознаки інсульту",                  "description": "обличчя опускається з одного боку, не може тримати обидві руки вгору, труднощі з мовленням" },
      { "category": "раптова сплутаність свідомості",   "description": "не впевнений у власному імені або віці, нечітке або безглузде мовлення" },
      { "category": "спроба самогубства",               "description": "вживання чогось або самоушкодження" },
      { "category": "тяжкі труднощі з диханням",        "description": "неможливість вимовити слова, дуже швидке дихання, задуха або задихання" },
      { "category": "сильна кровотеча",                 "description": "струменить, ллється або достатньо для утворення калюжі" },
      { "category": "серйозні травми",                  "description": "після серйозної аварії" },
      { "category": "судоми (напад)",                   "description": "тремтіння або посмикування через напад, або непритомний" },
      { "category": "раптовий, швидкий набряк",         "description": "губ, рота, горла або язика" },
      { "category": "пологи або розродження",           "description": "відходження вод, більш часті інтенсивні скорочення, дитина приходить або щойно народилась" },
      { "category": "ознаки тяжкої інфекції (сепсис)", "description": "синя, сіра, бліда або плямиста шкіра; висип, що не зникає при прокочуванні склянки, або висока температура з жорсткою шиєю / чутливість до світла" }
    ]
  },
  "ara_Arab": {
    "warning_title":   "اتصل بـ 999 الآن إذا كان لديك أو لدى أحدهم أي من هذه الأعراض:",
    "screen_title":    "تأكد من أن هذه ليست حالة طوارئ",
    "button_emergency":"نعم - اتصل بـ 999 الآن",
    "button_continue": "لا، احجز موعداً مع الطبيب",
    "symptoms": [
      { "category": "علامات النوبة القلبية",            "description": "ألم في الصدر، ضغط، ثقل، شد أو ضغط عبر الصدر" },
      { "category": "علامات السكتة الدماغية",           "description": "تدلي الوجه من جانب واحد، عدم القدرة على رفع كلا الذراعين، صعوبة في الكلام" },
      { "category": "ارتباك مفاجئ (هذيان)",             "description": "عدم التأكد من الاسم أو العمر، كلام متعثر أو غير منطقي" },
      { "category": "محاولة انتحار",                    "description": "بتناول شيء ما أو إيذاء النفس" },
      { "category": "صعوبة شديدة في التنفس",            "description": "عدم القدرة على نطق الكلمات، التنفس السريع جداً، الاختناق أو اللهاث" },
      { "category": "نزيف حاد",                         "description": "متدفق أو سائل أو كافٍ لتكوين بركة" },
      { "category": "إصابات خطيرة",                    "description": "بعد حادث خطير" },
      { "category": "نوبة تشنجية",                      "description": "رجفة أو ارتجاج بسبب نوبة، أو فقدان الوعي" },
      { "category": "تورم مفاجئ وسريع",                 "description": "في الشفاه أو الفم أو الحلق أو اللسان" },
      { "category": "المخاض أو الولادة",                "description": "انفجار الأغشية، تشنجات مكثفة أكثر تكراراً، الطفل قادم أو وُلد للتو" },
      { "category": "علامات عدوى حادة (إنتان)",         "description": "جلد أزرق أو رمادي أو شاحب أو رقيق؛ طفح جلدي لا يتلاشى عند تدحرج كوب عليه أو حمى شديدة مع تيبس في الرقبة / ازعاج من الضوء" }
    ]
  },
  "hin_Deva": {
    "warning_title":   "अभी 999 पर कॉल करें यदि आपको या किसी को इनमें से कोई भी लक्षण हो:",
    "screen_title":    "पुष्टि करें कि यह आपातकाल नहीं है",
    "button_emergency":"हाँ - अभी 999 पर कॉल करें",
    "button_continue": "नहीं, GP अपॉइंटमेंट बुक करें",
    "symptoms": [
      { "category": "दिल के दौरे के संकेत",             "description": "सीने में दर्द, दबाव, भारीपन, जकड़न या सीने में दबाव" },
      { "category": "स्ट्रोक के संकेत",                  "description": "चेहरे का एक तरफ झुकना, दोनों हाथ ऊपर न उठा पाना, बोलने में कठिनाई" },
      { "category": "अचानक भ्रम (प्रलाप)",               "description": "अपना नाम या उम्र न जानना, अस्पष्ट भाषण या बेतुकी बातें" },
      { "category": "आत्महत्या का प्रयास",               "description": "कुछ लेकर या खुद को नुकसान पहुँचाकर" },
      { "category": "सांस लेने में गंभीर कठिनाई",         "description": "शब्द न निकाल पाना, बहुत तेज सांस लेना, घुटन या हांफना" },
      { "category": "भारी रक्तस्राव",                    "description": "छिड़काव, बह रहा है या पोखर बनाने के लिए पर्याप्त" },
      { "category": "गंभीर चोटें",                       "description": "गंभीर दुर्घटना के बाद" },
      { "category": "दौरा (फिट)",                        "description": "दौरे के कारण हिलना या झटके लगना, या बेहोश (जगाया नहीं जा सकता)" },
      { "category": "अचानक, तीव्र सूजन",                 "description": "होंठ, मुंह, गले या जीभ की" },
      { "category": "प्रसव या बच्चे का जन्म",             "description": "पानी टूटना, अधिक बार तीव्र ऐंठन (संकुचन), बच्चा आ रहा है या अभी पैदा हुआ" },
      { "category": "गंभीर संक्रमण के संकेत (सेप्सिस)", "description": "नीली, भूरी, पीली या धब्बेदार त्वचा; दाने जो गिलास घुमाने पर नहीं जाते या गर्दन की अकड़न के साथ तेज बुखार / रोशनी से परेशानी" }
    ]
  },
  "zho_Hans": {
    "warning_title":   "如果您或某人有以下任何症状，请立即拨打999：",
    "screen_title":    "确认这不是紧急情况",
    "button_emergency":"是 - 立即拨打999",
    "button_continue": "否，预约全科医生",
    "symptoms": [
      { "category": "心脏病发作的迹象",                  "description": "胸部疼痛、压迫感、沉重感、紧绷感或挤压感" },
      { "category": "中风的迹象",                        "description": "面部一侧下垂、无法举起双臂、说话困难" },
      { "category": "突然混乱（谵妄）",                  "description": "不确定自己的姓名或年龄、口齿不清或语无伦次" },
      { "category": "自杀企图",                          "description": "服用药物或自我伤害" },
      { "category": "严重呼吸困难",                      "description": "无法说话、呼吸非常快、窒息或喘气" },
      { "category": "大出血",                            "description": "喷射、倾泻或足以形成水坑" },
      { "category": "严重受伤",                          "description": "严重事故后" },
      { "category": "癫痫发作",                          "description": "因癫痫发作而颤抖或抽搐，或失去意识（无法唤醒）" },
      { "category": "突然快速肿胀",                      "description": "嘴唇、口腔、喉咙或舌头肿胀" },
      { "category": "分娩或生产",                        "description": "破水、更频繁的剧烈痉挛（宫缩）、婴儿即将出生或刚出生" },
      { "category": "严重感染（败血症）的迹象",           "description": "皮肤呈蓝色、灰色、苍白或斑驳；用玻璃杯滚动不会消失的皮疹或高烧伴有颈部僵硬/畏光" }
    ]
  },
  "ita_Latn": {
    "warning_title":   "Chiama il 999 ora se tu o qualcuno avete uno di questi:",
    "screen_title":    "Conferma che non si tratta di un'emergenza",
    "button_emergency":"Sì - Chiama il 999 Ora",
    "button_continue": "No, prenota appuntamento con medico",
    "symptoms": [
      { "category": "segni di infarto",                 "description": "dolore al petto, senso di oppressione, pesantezza, costrizione o compressione al torace" },
      { "category": "segni di ictus",                   "description": "viso che cade su un lato, incapacità di tenere entrambe le braccia alzate, difficoltà a parlare" },
      { "category": "confusione improvvisa (delirio)",  "description": "non è sicuro del proprio nome o età, discorso confuso o senza senso" },
      { "category": "tentativo di suicidio",            "description": "assumendo qualcosa o autolesionismo" },
      { "category": "grave difficoltà respiratoria",    "description": "incapacità di parlare, respiro molto veloce, soffocamento o ansimare" },
      { "category": "emorragia grave",                  "description": "sangue che spruzza, scorre abbondantemente o abbastanza da formare una pozza" },
      { "category": "lesioni gravi",                    "description": "dopo un grave incidente" },
      { "category": "convulsioni (attacco)",            "description": "tremori o scatti a causa di un attacco, o incosciente (non si può svegliare)" },
      { "category": "gonfiore improvviso e rapido",     "description": "delle labbra, bocca, gola o lingua" },
      { "category": "travaglio o parto",                "description": "rottura delle acque, crampi intensi più frequenti (contrazioni), bambino in arrivo o appena nato" },
      { "category": "segni di infezione grave (sepsi)", "description": "pelle blu, grigia, pallida o chiazzata; eruzione cutanea che non svanisce quando si passa un bicchiere sopra o febbre alta con collo rigido / fastidio dalla luce" }
    ]
  },
  "jpn_Jpan": {
    "warning_title":   "あなたまたは誰かが次のいずれかに該当する場合は、今すぐ999に電話してください：",
    "screen_title":    "これが緊急事態ではないことを確認してください",
    "button_emergency":"はい - 今すぐ999に電話する",
    "button_continue": "いいえ、GPの予約をする",
    "symptoms": [
      { "category": "心臓発作のサイン",                  "description": "胸の痛み、圧迫感、重さ、締め付け感または圧迫感" },
      { "category": "脳卒中のサイン",                    "description": "顔の片側が垂れ下がる、両腕を上げられない、話すことが困難" },
      { "category": "突然の混乱（せん妄）",              "description": "自分の名前や年齢が分からない、言葉が不明瞭または意味をなさない" },
      { "category": "自殺企図",                          "description": "何かを摂取するか自傷行為による" },
      { "category": "重度の呼吸困難",                    "description": "言葉が出ない、非常に速い呼吸、窒息またはあえぎ" },
      { "category": "大量出血",                          "description": "噴出、流出、または水たまりができるほど" },
      { "category": "重傷",                              "description": "重大な事故の後" },
      { "category": "発作（てんかん）",                  "description": "発作による震えまたはけいれん、または意識不明（起こせない）" },
      { "category": "突然の急激な腫れ",                  "description": "唇、口、喉または舌の" },
      { "category": "陣痛または出産",                    "description": "破水、より頻繁な激しいけいれん（陣痛）、赤ちゃんが来るまたは生まれたばかり" },
      { "category": "重症感染症（敗血症）のサイン",      "description": "青色、灰色、青白いまたはまだらな皮膚；ガラスを転がしても消えない発疹、または首のこわばりを伴う高熱/光への過敏症" }
    ]
  },
  "kor_Hang": {
    "warning_title":   "귀하 또는 누군가가 다음 중 하나라도 해당하면 지금 999에 전화하세요:",
    "screen_title":    "이것이 응급상황이 아님을 확인하세요",
    "button_emergency":"예 - 지금 999에 전화",
    "button_continue": "아니요, GP 예약하기",
    "symptoms": [
      { "category": "심장마비 징후",                    "description": "흉통, 압박감, 무거움, 답답함 또는 조임" },
      { "category": "뇌졸중 징후",                      "description": "얼굴 한쪽이 처짐, 양팔을 들 수 없음, 말하기 어려움" },
      { "category": "갑작스러운 혼란 (섬망)",           "description": "자신의 이름이나 나이를 확신할 수 없음, 불명확한 발음 또는 이해할 수 없는 말" },
      { "category": "자살 시도",                        "description": "무언가를 복용하거나 자해" },
      { "category": "심각한 호흡 곤란",                 "description": "말을 할 수 없음, 매우 빠른 호흡, 질식 또는 헐떡임" },
      { "category": "심한 출혈",                        "description": "분사, 쏟아지거나 웅덩이가 생길 정도" },
      { "category": "심각한 부상",                      "description": "심각한 사고 후" },
      { "category": "발작 (경련)",                      "description": "발작으로 인한 떨림 또는 경련, 또는 의식불명" },
      { "category": "갑작스럽고 빠른 부기",             "description": "입술, 구강, 목구멍 또는 혀의" },
      { "category": "분만 또는 출산",                   "description": "양수 파열, 더 자주 강렬한 경련(수축), 아기가 오거나 방금 태어남" },
      { "category": "심각한 감염 징후 (패혈증)",        "description": "파랗거나 회색이거나 창백하거나 얼룩진 피부; 유리를 굴려도 사라지지 않는 발진 또는 뻣뻣한 목을 동반한 고열/빛에 민감" }
    ]
  },
  "ben_Beng": {
    "warning_title":   "আপনি বা কেউ যদি এর যেকোনোটি থাকে তাহলে এখনই 999 কল করুন:",
    "screen_title":    "নিশ্চিত করুন যে এটি জরুরি অবস্থা নয়",
    "button_emergency":"হ্যাঁ - এখনই 999 কল করুন",
    "button_continue": "না, জিপি অ্যাপয়েন্টমেন্ট বুক করুন",
    "symptoms": [
      { "category": "হার্ট অ্যাটাকের লক্ষণ",          "description": "বুকে ব্যথা, চাপ, ভারী অনুভূতি, শক্ত বা চেপে ধরার অনুভূতি" },
      { "category": "স্ট্রোকের লক্ষণ",                 "description": "মুখের একপাশ ঝুলে পড়া, দুটি হাত উপরে রাখতে না পারা, কথা বলতে অসুবিধা" },
      { "category": "হঠাৎ বিভ্রান্তি",                 "description": "নিজের নাম বা বয়স সম্পর্কে অনিশ্চিত, অস্পষ্ট বা অর্থহীন বক্তব্য" },
      { "category": "আত্মহত্যার চেষ্টা",               "description": "কিছু গ্রহণ করে বা নিজেকে আঘাত করে" },
      { "category": "শ্বাস নিতে গুরুতর কষ্ট",           "description": "কথা বলতে না পারা, খুব দ্রুত শ্বাস নেওয়া, শ্বাসরোধ বা হাঁপানো" },
      { "category": "ভারী রক্তপাত",                    "description": "স্প্রে হওয়া, ঢালা বা পুকুর তৈরির মতো রক্তপাত" },
      { "category": "গুরুতর আঘাত",                     "description": "গুরুতর দুর্ঘটনার পরে" },
      { "category": "খিঁচুনি",                         "description": "খিঁচুনির কারণে কাঁপা বা ঝাঁকুনি, বা অজ্ঞান অবস্থা" },
      { "category": "হঠাৎ দ্রুত ফুলে যাওয়া",           "description": "ঠোঁট, মুখ, গলা বা জিভ ফুলে যাওয়া" },
      { "category": "প্রসব বা সন্তান জন্ম",             "description": "পানি ভাঙা, ঘন ঘন তীব্র খিঁচুনি, শিশু আসছে বা এইমাত্র জন্মেছে" },
      { "category": "গুরুতর সংক্রমণের লক্ষণ (সেপসিস)", "description": "নীল, ধূসর, ফ্যাকাশে বা ছোপযুক্ত ত্বক; গ্লাস গড়ালেও মিলিয়ে যায় না এমন ফুসকুড়ি বা ঘাড় শক্ত হয়ে জ্বর" }
    ]
  },
  "nld_Latn": {
    "warning_title":   "Bel nu 999 als u of iemand een van deze symptomen heeft:",
    "screen_title":    "Bevestig dat dit geen noodgeval is",
    "button_emergency":"Ja - Bel nu 999",
    "button_continue": "Nee, maak een afspraak bij de huisarts",
    "symptoms": [
      { "category": "tekenen van een hartaanval",         "description": "pijn op de borst, druk, zwaar gevoel, beklemming of samenknijpen in de borst" },
      { "category": "tekenen van een beroerte",           "description": "gezicht dat aan één kant hangt, kan beide armen niet omhoog houden, moeite met spreken" },
      { "category": "plotselinge verwarring (delirium)",  "description": "weet eigen naam of leeftijd niet zeker, onduidelijk of onsamenhangend spreken" },
      { "category": "zelfmoordpoging",                   "description": "door iets in te nemen of zichzelf te verwonden" },
      { "category": "ernstige moeite met ademen",         "description": "geen woorden kunnen uitbrengen, erg snel ademen, stikken of happen naar lucht" },
      { "category": "hevig bloeden",                      "description": "spuitend, stromend of genoeg voor een plas bloed" },
      { "category": "ernstig letsel",                    "description": "na een ernstig ongeluk" },
      { "category": "aanval (insult)",                   "description": "schudden of schokken door een aanval, of bewusteloos" },
      { "category": "plotselinge snelle zwelling",        "description": "van lippen, mond, keel of tong" },
      { "category": "bevalling of geboorte",              "description": "vliezen gebroken, steeds vaker heftige krampen, baby op komst of net geboren" },
      { "category": "tekenen van ernstige infectie (sepsis)", "description": "blauwe, grijze, bleke of gevlekte huid; uitslag die niet vervaagt bij glastest, of hoge koorts met stijve nek / lichtschuwheid" }
    ]
  },
  "tur_Latn": {
    "warning_title":   "Siz veya biri bunlardan herhangi birine sahipse şimdi 999'u arayın:",
    "screen_title":    "Bunun bir acil durum olmadığını onaylayın",
    "button_emergency":"Evet - Şimdi 999'u Arayın",
    "button_continue": "Hayır, GP randevusu alın",
    "symptoms": [
      { "category": "kalp krizi belirtileri",             "description": "göğüs ağrısı, baskı, ağırlık, sıkışma veya göğüste sıkıştırma hissi" },
      { "category": "felç belirtileri",                   "description": "yüzün bir tarafının düşmesi, her iki kolu kaldıramamak, konuşma güçlüğü" },
      { "category": "ani kafa karışıklığı (deliryum)",    "description": "kendi adından veya yaşından emin olamamak, düzensiz veya anlamsız konuşma" },
      { "category": "intihar girişimi",                   "description": "bir şey alarak veya kendine zarar vererek" },
      { "category": "ciddi nefes alma güçlüğü",           "description": "kelime çıkaramamak, çok hızlı nefes almak, boğulma veya nefes nefese kalma" },
      { "category": "yoğun kanama",                       "description": "fışkıran, akan veya göl oluşturacak kadar kanama" },
      { "category": "ciddi yaralanmalar",                 "description": "ciddi bir kaza sonrasında" },
      { "category": "nöbet (kasılma)",                    "description": "nöbet nedeniyle sarsılma veya titreme ya da bilinçsiz olma" },
      { "category": "ani hızlı şişme",                    "description": "dudaklar, ağız, boğaz veya dilde" },
      { "category": "doğum veya doğum eylemi",            "description": "su kesesinin yırtılması, giderek sıklaşan yoğun kasılmalar, bebek geliyor veya yeni doğdu" },
      { "category": "ciddi enfeksiyon belirtileri (sepsis)", "description": "mavi, gri, soluk veya benekli deri; cam bastırıldığında kaybolmayan döküntü veya yüksek ateş ile sert boyun / ışığa duyarlılık" }
    ]
  },
  "vie_Latn": {
    "warning_title":   "Gọi 999 ngay nếu bạn hoặc ai đó có bất kỳ dấu hiệu nào sau đây:",
    "screen_title":    "Xác nhận đây không phải trường hợp khẩn cấp",
    "button_emergency":"Có - Gọi 999 Ngay",
    "button_continue": "Không, đặt lịch khám bác sĩ đa khoa",
    "symptoms": [
      { "category": "dấu hiệu đau tim",                  "description": "đau ngực, áp lực, nặng nề, tức ngực hoặc bóp nghẹt" },
      { "category": "dấu hiệu đột quỵ",                  "description": "mặt xệ một bên, không giơ được cả hai tay, khó nói" },
      { "category": "lú lẫn đột ngột (mê sảng)",         "description": "không chắc về tên hoặc tuổi của mình, nói lắp hoặc vô nghĩa" },
      { "category": "cố gắng tự tử",                     "description": "bằng cách uống thứ gì đó hoặc tự làm hại bản thân" },
      { "category": "khó thở nghiêm trọng",              "description": "không nói được, thở rất nhanh, nghẹt thở hoặc hổn hển" },
      { "category": "chảy máu nhiều",                    "description": "phun, chảy ào ào hoặc đủ để tạo thành vũng máu" },
      { "category": "thương tích nặng",                  "description": "sau tai nạn nghiêm trọng" },
      { "category": "co giật",                           "description": "run rẩy hoặc giật do co giật, hoặc bất tỉnh" },
      { "category": "sưng đột ngột nhanh chóng",         "description": "ở môi, miệng, họng hoặc lưỡi" },
      { "category": "chuyển dạ hoặc sinh con",           "description": "vỡ ối, cơn co thắt dữ dội ngày càng thường xuyên, em bé sắp ra hoặc vừa sinh" },
      { "category": "dấu hiệu nhiễm trùng nặng (nhiễm khuẩn huyết)", "description": "da xanh, xám, nhợt hoặc có đốm; phát ban không mờ khi lăn ly thủy tinh hoặc sốt cao kèm cứng cổ / nhạy cảm ánh sáng" }
    ]
  },
  "tha_Thai": {
    "warning_title":   "โทร 999 ทันทีหากคุณหรือใครบางคนมีอาการใดๆ เหล่านี้:",
    "screen_title":    "ยืนยันว่านี่ไม่ใช่เหตุฉุกเฉิน",
    "button_emergency":"ใช่ - โทร 999 ทันที",
    "button_continue": "ไม่ใช่ นัดหมายแพทย์ทั่วไป",
    "symptoms": [
      { "category": "อาการหัวใจวาย",                     "description": "เจ็บหน้าอก กดดัน หนัก แน่น หรือรู้สึกบีบที่หน้าอก" },
      { "category": "อาการโรคหลอดเลือดสมอง",             "description": "ใบหน้าหย่อนข้างหนึ่ง ยกแขนทั้งสองข้างไม่ได้ พูดลำบาก" },
      { "category": "สับสนฉับพลัน (เพ้อ)",               "description": "ไม่แน่ใจชื่อหรืออายุตัวเอง พูดไม่ชัดหรือพูดไม่รู้เรื่อง" },
      { "category": "พยายามฆ่าตัวตาย",                   "description": "โดยการกินบางอย่างหรือทำร้ายตนเอง" },
      { "category": "หายใจลำบากอย่างรุนแรง",              "description": "พูดไม่ออก หายใจเร็วมาก สำลักหรือหอบ" },
      { "category": "เลือดออกมาก",                       "description": "พุ่ง ไหลออกมา หรือมากพอที่จะเป็นแอ่ง" },
      { "category": "บาดเจ็บสาหัส",                      "description": "หลังเกิดอุบัติเหตุร้ายแรง" },
      { "category": "ชัก",                               "description": "สั่นหรือกระตุกเนื่องจากชัก หรือหมดสติ" },
      { "category": "บวมฉับพลันอย่างรวดเร็ว",             "description": "ที่ริมฝีปาก ปาก ลำคอ หรือลิ้น" },
      { "category": "การเจ็บครรภ์หรือคลอดบุตร",          "description": "น้ำคร่ำแตก เจ็บครรภ์รุนแรงถี่ขึ้น ทารกกำลังออกมาหรือเพิ่งเกิด" },
      { "category": "อาการติดเชื้อรุนแรง (ภาวะพิษเหตุติดเชื้อ)", "description": "ผิวหนังสีน้ำเงิน เทา ซีด หรือเป็นจุด; ผื่นที่ไม่จางเมื่อใช้แก้วกด หรือไข้สูงพร้อมคอแข็ง/ไวต่อแสง" }
    ]
  },
  "ron_Latn": {
    "warning_title":   "Sunați 999 acum dacă dumneavoastră sau cineva are oricare dintre acestea:",
    "screen_title":    "Confirmați că aceasta nu este o urgență",
    "button_emergency":"Da - Sunați 999 Acum",
    "button_continue": "Nu, programați o consultație la medicul de familie",
    "symptoms": [
      { "category": "semne de atac de cord",              "description": "durere în piept, presiune, greutate, strângere sau apăsare în piept" },
      { "category": "semne de accident vascular cerebral","description": "fața căzută pe o parte, nu poate ține ambele brațe ridicate, dificultăți de vorbire" },
      { "category": "confuzie bruscă (delir)",            "description": "nu este sigur de propriul nume sau vârstă, vorbire neclară sau fără sens" },
      { "category": "tentativă de suicid",                "description": "luând ceva sau automutilându-se" },
      { "category": "dificultăți severe de respirație",   "description": "nu poate scoate cuvinte, respiră foarte repede, se sufocă sau gâfâie" },
      { "category": "sângerare abundentă",                "description": "țâșnind, curgând sau suficient pentru a forma o băltoacă" },
      { "category": "răni grave",                         "description": "după un accident grav" },
      { "category": "criză (convulsie)",                  "description": "tremurând sau zvâcnind din cauza unei crize, sau inconștient" },
      { "category": "umflare bruscă rapidă",              "description": "a buzelor, gurii, gâtului sau limbii" },
      { "category": "travaliu sau naștere",               "description": "membrane rupte, contracții intense tot mai frecvente, bebelușul vine sau tocmai s-a născut" },
      { "category": "semne de infecție gravă (sepsis)",   "description": "piele albastră, gri, palidă sau pătată; erupție cutanată care nu dispare la testul cu paharul sau febră mare cu gât rigid / sensibilitate la lumină" }
    ]
  }
};

// ─────────────────────────────────────────────
// Load symptoms for a given NLLB language code.
// Falls back to English if the language is not present.
// ─────────────────────────────────────────────
function loadEmergencySymptoms(langCode) {
  const data = EMERGENCY_SYMPTOMS[langCode] || EMERGENCY_SYMPTOMS["eng_Latn"];

  document.getElementById("emergencyTitle").textContent        = data.warning_title    || "";
  document.getElementById("emergencyConfirmTitle").textContent = data.screen_title     || "";
  document.getElementById("emergencyYesText").textContent      = data.button_emergency || "";
  document.getElementById("emergencyNoText").textContent       = data.button_continue  || "";

  document.getElementById("emergencyList").innerHTML = (data.symptoms || []).map(s => `
    <li class="emergency-item">
      <div class="emergency-category">${s.category}</div>
      <div class="emergency-description">${s.description}</div>
    </li>
  `).join("");
}

// ─────────────────────────────────────────────
// Button handlers
// ─────────────────────────────────────────────

document.getElementById("btnEmergencyNo").addEventListener("click", async () => {
  showGlobalLoading();
  try {
    const coreStr = await translateCoreStrings(selectedLanguage);
    window._allTranslatedStrings = Object.assign(window._allTranslatedStrings || {}, coreStr);
    updateUIWithTranslations({ ...window._allTranslatedStrings });
  } catch (e) {
    console.warn("Core string translation failed, continuing with fallback:", e);
  } finally {
    hideGlobalLoading();
  }
  showScreen(document.getElementById("accessibilityScreen"));
});

console.log("DONE:    emergency.js");