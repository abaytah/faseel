/**
 * Curated Q&A knowledge base for the Faseel AI Assistant.
 * Covers Saudi real estate regulations, tenant rights, landlord obligations,
 * and maintenance responsibilities.
 */

export interface KnowledgeEntry {
  id: string;
  keywordsAr: string[];
  keywordsEn: string[];
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  source: string;
  category: 'tenant' | 'owner' | 'office' | 'general';
}

export const knowledgeBase: KnowledgeEntry[] = [
  // ─── Tenant Questions ───
  {
    id: 'tenant-plumbing-repair',
    keywordsAr: ['سباكة', 'إصلاح', 'أنابيب', 'تسريب', 'مياه', 'صيانة السباكة'],
    keywordsEn: ['plumbing', 'repair', 'pipes', 'leak', 'water', 'plumbing maintenance'],
    questionAr: 'من يدفع تكاليف إصلاح السباكة؟',
    questionEn: 'Who pays for plumbing repairs?',
    answerAr:
      'عادة يتحمل المالك تكاليف إصلاح السباكة إلا إذا كان الضرر ناتجاً عن سوء استخدام المستأجر. يجب على المالك صيانة الأنظمة الأساسية للعقار وفقاً لنظام المعاملات المدنية السعودي.',
    answerEn:
      'Usually the landlord pays for plumbing repairs unless the tenant caused the damage. The landlord must maintain the basic systems of the property per the Saudi Civil Transactions Law.',
    source: 'نظام المعاملات المدنية السعودي',
    category: 'tenant',
  },
  {
    id: 'tenant-rent-increase',
    keywordsAr: ['زيادة', 'إيجار', 'رفع الإيجار', 'زيادة الأجرة', 'سعر الإيجار'],
    keywordsEn: ['rent', 'increase', 'raise', 'rent hike', 'price increase'],
    questionAr: 'هل يمكن للمالك زيادة الإيجار أثناء العقد؟',
    questionEn: 'Can the landlord increase rent mid-contract?',
    answerAr:
      'لا، لا يحق للمالك زيادة الإيجار خلال مدة العقد الساري. يمكن تعديل الإيجار فقط عند تجديد العقد وفقاً لأنظمة منصة إيجار.',
    answerEn:
      'No, the landlord cannot increase rent during the active contract period. Rent can only be adjusted at renewal per Ejar regulations.',
    source: 'أنظمة منصة إيجار (ejar.sa)',
    category: 'tenant',
  },
  {
    id: 'tenant-urgent-repair',
    keywordsAr: ['إصلاح عاجل', 'المالك لا يصلح', 'مشكلة عاجلة', 'تأخر الصيانة', 'إهمال المالك'],
    keywordsEn: [
      'urgent repair',
      'landlord not fixing',
      'emergency',
      'delayed maintenance',
      'landlord neglect',
    ],
    questionAr: 'ماذا أفعل إذا لم يقم المالك بإصلاح مشكلة عاجلة؟',
    questionEn: 'What if the landlord does not fix urgent issues?',
    answerAr:
      'يمكنك تقديم شكوى عبر منصة إيجار. كما يحق لك إجراء الإصلاح على نفقتك وخصم التكلفة من الإيجار مع توفير الوثائق اللازمة (فواتير، صور، تقارير). ينصح بإرسال إشعار كتابي للمالك أولاً.',
    answerEn:
      'You can file a complaint via the Ejar platform. You also have the right to fix the issue yourself and deduct the cost from rent with proper documentation (invoices, photos, reports). It is recommended to send a written notice to the landlord first.',
    source: 'منصة إيجار، نظام المعاملات المدنية',
    category: 'tenant',
  },
  {
    id: 'tenant-early-termination',
    keywordsAr: ['إنهاء العقد', 'فسخ العقد', 'إلغاء العقد', 'ترك الشقة', 'مغادرة'],
    keywordsEn: ['terminate', 'lease', 'early', 'cancel', 'break contract', 'leave apartment'],
    questionAr: 'هل يمكنني إنهاء عقد الإيجار قبل انتهاء مدته؟',
    questionEn: 'Can I terminate my lease early?',
    answerAr:
      'لا يمكن إنهاء العقد مبكراً إلا باتفاق متبادل بين المالك والمستأجر، أو من خلال آلية تسوية النزاعات في منصة إيجار. الإنهاء من طرف واحد قد يترتب عليه غرامات وفقاً لشروط العقد.',
    answerEn:
      'Early termination is only possible with mutual agreement between landlord and tenant, or through Ejar dispute resolution. Unilateral termination may result in penalties per contract terms.',
    source: 'أنظمة منصة إيجار',
    category: 'tenant',
  },
  {
    id: 'tenant-ac-maintenance',
    keywordsAr: ['تكييف', 'مكيف', 'صيانة التكييف', 'تنظيف الفلتر', 'عطل المكيف'],
    keywordsEn: ['ac', 'air conditioning', 'hvac', 'filter', 'cooling', 'ac maintenance'],
    questionAr: 'من المسؤول عن صيانة التكييف؟',
    questionEn: 'Who is responsible for AC maintenance?',
    answerAr:
      'المالك مسؤول عن الإصلاحات الكبيرة والاستبدال (مثل تغيير الكمبروسر أو الوحدة بالكامل). المستأجر مسؤول عن الصيانة الدورية مثل تنظيف الفلاتر والغسيل الموسمي.',
    answerEn:
      'The landlord is responsible for major repairs and replacements (compressor, full unit). The tenant is responsible for regular maintenance like cleaning filters and seasonal servicing.',
    source: 'نظام المعاملات المدنية، العرف العقاري السعودي',
    category: 'tenant',
  },
  {
    id: 'tenant-deposit-refund',
    keywordsAr: ['تأمين', 'استرداد التأمين', 'مبلغ الضمان', 'وديعة'],
    keywordsEn: ['deposit', 'refund', 'security deposit', 'guarantee'],
    questionAr: 'متى يتم استرداد مبلغ التأمين؟',
    questionEn: 'When is the security deposit refunded?',
    answerAr:
      'يجب إعادة مبلغ التأمين عند انتهاء العقد وتسليم الوحدة بحالة جيدة مع مراعاة الاستهلاك الطبيعي. يحق للمالك خصم تكاليف الأضرار التي سببها المستأجر فقط مع تقديم إثبات.',
    answerEn:
      'The deposit must be returned when the lease ends and the unit is handed over in good condition, accounting for normal wear and tear. The landlord may only deduct for tenant-caused damage with proof.',
    source: 'نظام المعاملات المدنية السعودي',
    category: 'tenant',
  },
  {
    id: 'tenant-privacy-entry',
    keywordsAr: ['خصوصية', 'دخول المالك', 'دخول الشقة', 'إذن الدخول'],
    keywordsEn: ['privacy', 'landlord entry', 'enter apartment', 'permission'],
    questionAr: 'هل يحق للمالك دخول الوحدة بدون إذني؟',
    questionEn: 'Can the landlord enter my unit without permission?',
    answerAr:
      'لا يحق للمالك دخول الوحدة المؤجرة بدون إذن المستأجر إلا في حالات الطوارئ (حريق، تسريب مياه خطير). يجب الإشعار المسبق قبل أي زيارة صيانة أو معاينة.',
    answerEn:
      'The landlord cannot enter the rented unit without tenant permission except in emergencies (fire, serious water leak). Prior notice is required for maintenance visits or inspections.',
    source: 'نظام المعاملات المدنية السعودي',
    category: 'tenant',
  },
  {
    id: 'tenant-ejar-contract',
    keywordsAr: ['عقد إيجار', 'إيجار إلكتروني', 'تسجيل العقد', 'عقد إلكتروني'],
    keywordsEn: ['ejar', 'contract', 'electronic', 'registration', 'digital contract'],
    questionAr: 'هل يجب أن يكون عقد الإيجار مسجلاً في إيجار؟',
    questionEn: 'Must the lease be registered on Ejar?',
    answerAr:
      'نعم، تسجيل عقود الإيجار السكنية على منصة إيجار إلزامي منذ عام 2020. العقود غير المسجلة لا تُعتبر رسمية ولا يمكن الاستفادة من خدمات التسوية والتنفيذ.',
    answerEn:
      'Yes, registering residential lease contracts on Ejar has been mandatory since 2020. Unregistered contracts are not considered official and cannot benefit from settlement and enforcement services.',
    source: 'منصة إيجار (ejar.sa)',
    category: 'tenant',
  },

  // ─── Owner Questions ───
  {
    id: 'owner-eviction',
    keywordsAr: ['إخلاء', 'طرد', 'مستأجر لا يدفع', 'عدم السداد', 'تأخر الدفع'],
    keywordsEn: ['evict', 'eviction', 'tenant not paying', 'non-payment', 'late payment'],
    questionAr: 'هل يمكنني إخلاء مستأجر لا يدفع الإيجار؟',
    questionEn: 'Can I evict a tenant who does not pay rent?',
    answerAr:
      'نعم، لكن يجب المرور عبر آلية التنفيذ في منصة إيجار. يتطلب الأمر إرسال إشعار للمستأجر بمهلة 15 يوماً. إذا لم يستجب، يمكن رفع طلب إخلاء عبر المنصة ليتم تنفيذه من الجهات المختصة.',
    answerEn:
      'Yes, but you must go through the Ejar enforcement mechanism. A 15-day notice must be sent to the tenant. If they do not respond, you can file an eviction request through the platform for execution by authorities.',
    source: 'منصة إيجار، نظام التنفيذ',
    category: 'owner',
  },
  {
    id: 'owner-maintenance-costs',
    keywordsAr: ['تكاليف الصيانة', 'من يدفع الصيانة', 'نسبة الصيانة', 'تحميل المستأجر'],
    keywordsEn: [
      'maintenance costs',
      'who pays maintenance',
      'charge tenant',
      'maintenance percentage',
    ],
    questionAr: 'ما نسبة تكاليف الصيانة التي يمكنني تحميلها للمستأجر؟',
    questionEn: 'What maintenance costs can I charge tenants?',
    answerAr:
      'يعتمد الأمر على سبب الصيانة. الاستهلاك الطبيعي والأعطال الناتجة عن التقادم تكون على المالك. الأضرار الناتجة عن سوء استخدام المستأجر تكون على المستأجر. يُنصح بتوثيق حالة الوحدة عند التسليم.',
    answerEn:
      "It depends on the cause. Normal wear and tear is the owner's responsibility. Damage caused by tenant misuse is the tenant's responsibility. Documenting the unit condition at handover is recommended.",
    source: 'نظام المعاملات المدنية السعودي',
    category: 'owner',
  },
  {
    id: 'owner-ejar-registration',
    keywordsAr: ['تسجيل إيجار', 'منصة إيجار', 'تسجيل العقد', 'إلزامي'],
    keywordsEn: ['ejar registration', 'register ejar', 'mandatory registration'],
    questionAr: 'هل يجب علي التسجيل في منصة إيجار؟',
    questionEn: 'Do I need to register on Ejar?',
    answerAr:
      'نعم، التسجيل في منصة إيجار إلزامي لجميع عقود الإيجار السكنية منذ عام 2020. عدم التسجيل يعرضك لغرامات مالية ويحرمك من الحماية القانونية التي توفرها المنصة.',
    answerEn:
      'Yes, Ejar registration is mandatory for all residential leases since 2020. Non-registration exposes you to financial penalties and denies you the legal protection the platform provides.',
    source: 'منصة إيجار (ejar.sa)',
    category: 'owner',
  },
  {
    id: 'owner-contract-renewal',
    keywordsAr: ['تجديد العقد', 'تمديد العقد', 'إعادة التعاقد'],
    keywordsEn: ['contract renewal', 'lease renewal', 'extend contract'],
    questionAr: 'كيف يتم تجديد عقد الإيجار؟',
    questionEn: 'How is a lease contract renewed?',
    answerAr:
      'يتم تجديد العقد عبر منصة إيجار بموافقة الطرفين. يمكن تعديل شروط العقد بما في ذلك قيمة الإيجار عند التجديد. يُنصح بالتواصل مع المستأجر قبل انتهاء العقد بفترة كافية.',
    answerEn:
      "Contract renewal is done through Ejar with both parties' agreement. Terms including rent can be modified at renewal. It is recommended to communicate with the tenant well before contract expiry.",
    source: 'منصة إيجار (ejar.sa)',
    category: 'owner',
  },
  {
    id: 'owner-property-inspection',
    keywordsAr: ['معاينة', 'فحص العقار', 'تفتيش', 'حالة الوحدة'],
    keywordsEn: ['inspection', 'property check', 'unit condition', 'walkthrough'],
    questionAr: 'كيف أوثق حالة الوحدة عند تأجيرها؟',
    questionEn: 'How do I document the unit condition when renting it out?',
    answerAr:
      'يُنصح بإعداد محضر استلام وتسليم مفصل يشمل صوراً ومقاطع فيديو لكل غرفة والأجهزة. يوقع عليه الطرفان عند التسليم. هذا يحمي حقوقك في حال وجود أضرار عند نهاية العقد.',
    answerEn:
      'Prepare a detailed handover report with photos and videos of every room and appliance. Both parties sign at handover. This protects your rights in case of damage at contract end.',
    source: 'أفضل الممارسات العقارية، نظام المعاملات المدنية',
    category: 'owner',
  },

  // ─── Office Questions ───
  {
    id: 'office-ejar-penalties',
    keywordsAr: ['غرامات', 'عقوبات', 'عدم تسجيل', 'مخالفات إيجار'],
    keywordsEn: ['penalties', 'fines', 'not registering', 'ejar violations'],
    questionAr: 'ما هي غرامات عدم تسجيل العقود في إيجار؟',
    questionEn: 'What are the penalties for not registering contracts on Ejar?',
    answerAr:
      'تصل الغرامات إلى 25,000 ريال سعودي لكل عقد غير مسجل. بالإضافة إلى ذلك، لن يتمكن المالك من الاستفادة من خدمات التنفيذ والتسوية التي توفرها المنصة.',
    answerEn:
      'Fines can reach up to 25,000 SAR per unregistered contract. Additionally, the landlord cannot benefit from the enforcement and settlement services provided by the platform.',
    source: 'الهيئة العامة للعقار (rega.gov.sa)',
    category: 'office',
  },
  {
    id: 'office-dispute-handling',
    keywordsAr: ['نزاع', 'خلاف', 'شكوى', 'وساطة', 'تسوية'],
    keywordsEn: ['dispute', 'conflict', 'complaint', 'mediation', 'settlement'],
    questionAr: 'كيف أتعامل مع النزاعات بين المستأجر والمالك؟',
    questionEn: 'How to handle disputes between tenant and owner?',
    answerAr:
      'ابدأ بالوساطة بين الطرفين كخطوة أولى. إذا لم تنجح الوساطة، يمكن تصعيد النزاع إلى آلية تسوية النزاعات في منصة إيجار. المنصة توفر إجراءات واضحة وملزمة للطرفين.',
    answerEn:
      'Start with mediation between both parties as a first step. If mediation fails, escalate the dispute to Ejar dispute resolution. The platform provides clear and binding procedures for both parties.',
    source: 'منصة إيجار، الهيئة العامة للعقار',
    category: 'office',
  },
  {
    id: 'office-fal-license',
    keywordsAr: ['رخصة فال', 'ترخيص وساطة', 'وسيط عقاري', 'رخصة عقارية'],
    keywordsEn: ['fal license', 'brokerage license', 'real estate license', 'fal'],
    questionAr: 'هل أحتاج رخصة فال لإدارة العقارات؟',
    questionEn: 'Do I need a Fal license for property management?',
    answerAr:
      'نعم، يجب الحصول على رخصة فال من الهيئة العامة للعقار لممارسة أنشطة الوساطة وإدارة العقارات. الرخصة إلزامية وتتطلب اجتياز اختبار ودورة تدريبية معتمدة.',
    answerEn:
      'Yes, a Fal license from the General Authority for Real Estate is required for brokerage and property management activities. The license is mandatory and requires passing an exam and accredited training.',
    source: 'الهيئة العامة للعقار (rega.gov.sa)',
    category: 'office',
  },
  {
    id: 'office-mullak-registration',
    keywordsAr: ['ملاك', 'اتحاد الملاك', 'جمعية الملاك', 'إدارة مشتركة'],
    keywordsEn: ['mullak', 'owners association', 'joint management', 'homeowners'],
    questionAr: 'ما هو نظام اتحادات الملاك (ملاك)؟',
    questionEn: 'What is the Mullak (Owners Association) system?',
    answerAr:
      'منصة ملاك هي المنصة الرسمية لتسجيل وإدارة اتحادات الملاك في المملكة. تساعد في تنظيم إدارة المباني والمرافق المشتركة وتحصيل رسوم الخدمات من الملاك.',
    answerEn:
      'Mullak is the official platform for registering and managing owners associations in the Kingdom. It helps organize building management, shared facilities, and collecting service fees from owners.',
    source: 'منصة ملاك (mullak.sa)',
    category: 'office',
  },

  // ─── General Questions ───
  {
    id: 'general-ejar-platform',
    keywordsAr: ['إيجار', 'منصة إيجار', 'ما هي إيجار'],
    keywordsEn: ['ejar', 'ejar platform', 'what is ejar'],
    questionAr: 'ما هي منصة إيجار؟',
    questionEn: 'What is the Ejar platform?',
    answerAr:
      'إيجار هي المنصة الإلكترونية الرسمية لتسجيل وتوثيق عقود الإيجار في المملكة العربية السعودية. تتبع لوزارة الشؤون البلدية والقروية والإسكان. توفر حماية قانونية للمالك والمستأجر وآليات لتسوية النزاعات.',
    answerEn:
      'Ejar is the official electronic platform for registering and documenting lease contracts in Saudi Arabia. It falls under the Ministry of Municipal, Rural Affairs and Housing. It provides legal protection for landlords and tenants and dispute resolution mechanisms.',
    source: 'منصة إيجار (ejar.sa)',
    category: 'general',
  },
  {
    id: 'general-sakani',
    keywordsAr: ['سكني', 'دعم سكني', 'برنامج سكني', 'تملك'],
    keywordsEn: ['sakani', 'housing support', 'home ownership', 'housing program'],
    questionAr: 'ما هو برنامج سكني؟',
    questionEn: 'What is the Sakani program?',
    answerAr:
      'سكني هو برنامج حكومي يهدف لتمكين المواطنين من تملك المساكن. يوفر حلولاً سكنية متنوعة تشمل وحدات سكنية جاهزة، أراضٍ مجانية، وتمويل سكني مدعوم. يمكن التقديم عبر منصة سكني.',
    answerEn:
      'Sakani is a government program aimed at enabling citizens to own homes. It offers various housing solutions including ready units, free land, and subsidized housing finance. Applications can be made through the Sakani platform.',
    source: 'منصة سكني (sakani.sa)',
    category: 'general',
  },
  {
    id: 'general-electricity-water',
    keywordsAr: ['كهرباء', 'مياه', 'فواتير', 'حساب الخدمات', 'نقل الحساب'],
    keywordsEn: ['electricity', 'water', 'utilities', 'bills', 'transfer account'],
    questionAr: 'من المسؤول عن فواتير الكهرباء والمياه؟',
    questionEn: 'Who is responsible for electricity and water bills?',
    answerAr:
      'المستأجر مسؤول عن دفع فواتير الكهرباء والمياه خلال فترة الإيجار. يجب نقل الحساب باسم المستأجر عند بدء العقد. يتحمل المالك تكلفة أي استهلاك قبل تسليم الوحدة.',
    answerEn:
      "The tenant is responsible for electricity and water bills during the lease period. The account should be transferred to the tenant's name at contract start. The landlord bears costs for any consumption before unit handover.",
    source: 'العرف العقاري السعودي، شروط العقد',
    category: 'general',
  },
  {
    id: 'general-structural-issues',
    keywordsAr: ['شقوق', 'تصدع', 'هيكلي', 'أساسات', 'مبنى آيل'],
    keywordsEn: ['cracks', 'structural', 'foundation', 'building safety', 'structural damage'],
    questionAr: 'ماذا أفعل إذا ظهرت شقوق في الجدران؟',
    questionEn: 'What should I do if cracks appear in walls?',
    answerAr:
      'يجب إبلاغ المالك أو شركة الإدارة فوراً. المشاكل الهيكلية مسؤولية المالك بالكامل. إذا كانت تمثل خطراً على السلامة، يمكن التقدم بشكوى عبر منصة بلدي لطلب فحص هندسي.',
    answerEn:
      "Notify the landlord or management company immediately. Structural issues are entirely the landlord's responsibility. If they pose a safety risk, you can file a complaint via Balady platform for an engineering inspection.",
    source: 'منصة بلدي (balady.gov.sa)، نظام المعاملات المدنية',
    category: 'general',
  },
  {
    id: 'general-pest-control',
    keywordsAr: ['حشرات', 'مكافحة حشرات', 'صراصير', 'نمل', 'قوارض'],
    keywordsEn: ['pest', 'pest control', 'cockroach', 'ants', 'rodents', 'insects'],
    questionAr: 'من المسؤول عن مكافحة الحشرات؟',
    questionEn: 'Who is responsible for pest control?',
    answerAr:
      'إذا كانت الحشرات موجودة قبل التأجير أو بسبب مشاكل في البناء (تصريف، شقوق)، فالمالك مسؤول. إذا ظهرت بسبب إهمال المستأجر في النظافة، فالمستأجر مسؤول. المناطق المشتركة تكون على المالك أو اتحاد الملاك.',
    answerEn:
      "If pests existed before the lease or due to building issues (drainage, cracks), the landlord is responsible. If they appeared due to tenant negligence in cleanliness, the tenant is responsible. Common areas are the landlord's or owners' association's responsibility.",
    source: 'نظام المعاملات المدنية، أنظمة بلدي',
    category: 'general',
  },
  {
    id: 'general-elevator-maintenance',
    keywordsAr: ['مصعد', 'صيانة المصعد', 'مصعد عالق', 'تعطل المصعد'],
    keywordsEn: ['elevator', 'lift', 'elevator maintenance', 'stuck elevator'],
    questionAr: 'من المسؤول عن صيانة المصعد؟',
    questionEn: 'Who is responsible for elevator maintenance?',
    answerAr:
      'صيانة المصعد مسؤولية المالك أو اتحاد الملاك. يجب إجراء فحص دوري كل 6 أشهر وتجديد شهادة السلامة سنوياً. يمكن الإبلاغ عن مصعد غير آمن عبر منصة بلدي.',
    answerEn:
      "Elevator maintenance is the landlord's or owners' association's responsibility. Regular inspection every 6 months and annual safety certificate renewal are required. Unsafe elevators can be reported via Balady platform.",
    source: 'الدفاع المدني، منصة بلدي (balady.gov.sa)',
    category: 'general',
  },
  {
    id: 'general-parking',
    keywordsAr: ['موقف', 'مواقف سيارات', 'جراج', 'موقف سيارة'],
    keywordsEn: ['parking', 'car park', 'garage', 'parking space'],
    questionAr: 'هل من حقي الحصول على موقف سيارة؟',
    questionEn: 'Am I entitled to a parking space?',
    answerAr:
      'يعتمد على شروط العقد. إذا نص العقد على توفير موقف سيارة، فهو حق للمستأجر. المواقف المشتركة تخضع لنظام إدارة المبنى. يُنصح بتحديد تفاصيل الموقف في العقد.',
    answerEn:
      "It depends on the contract terms. If the contract specifies a parking space, it is the tenant's right. Shared parking is subject to building management rules. Specifying parking details in the contract is recommended.",
    source: 'شروط عقد الإيجار',
    category: 'general',
  },
  {
    id: 'general-noise-complaints',
    keywordsAr: ['ضوضاء', 'إزعاج', 'جيران', 'صوت عالي', 'شكوى إزعاج'],
    keywordsEn: ['noise', 'disturbance', 'neighbors', 'loud', 'noise complaint'],
    questionAr: 'كيف أتعامل مع الضوضاء من الجيران؟',
    questionEn: 'How do I handle noise from neighbors?',
    answerAr:
      'تواصل مع شركة إدارة المبنى أولاً. إذا لم تحل المشكلة، يمكنك التقدم بشكوى عبر تطبيق كلنا أمن. الأنظمة السعودية تحمي حق السكن الهادئ خاصة بين الساعة 10 مساءً و7 صباحاً.',
    answerEn:
      'Contact the building management company first. If unresolved, you can file a complaint via Kulluna Amn app. Saudi regulations protect the right to quiet enjoyment especially between 10 PM and 7 AM.',
    source: 'تطبيق كلنا أمن، أنظمة الإمارة',
    category: 'general',
  },
  {
    id: 'general-subletting',
    keywordsAr: ['تأجير من الباطن', 'إعادة التأجير', 'تأجير فرعي'],
    keywordsEn: ['sublet', 'subletting', 'sublease', 'relet'],
    questionAr: 'هل يمكنني تأجير الوحدة من الباطن؟',
    questionEn: 'Can I sublet the unit?',
    answerAr:
      'لا يجوز التأجير من الباطن إلا بموافقة كتابية من المالك. التأجير بدون إذن يعتبر مخالفة ويمكن أن يؤدي إلى فسخ العقد. يُنصح بتضمين هذا البند بوضوح في العقد.',
    answerEn:
      'Subletting is not allowed without written consent from the landlord. Unauthorized subletting is a violation and can lead to contract termination. Including this clause clearly in the contract is recommended.',
    source: 'نظام المعاملات المدنية السعودي',
    category: 'general',
  },
  {
    id: 'general-building-insurance',
    keywordsAr: ['تأمين المبنى', 'تأمين العقار', 'حريق', 'تأمين ممتلكات'],
    keywordsEn: ['building insurance', 'property insurance', 'fire insurance'],
    questionAr: 'هل تأمين المبنى إلزامي؟',
    questionEn: 'Is building insurance mandatory?',
    answerAr:
      'تأمين المبنى ضد الحريق إلزامي في المملكة. يتحمل المالك تكلفة التأمين الأساسي على المبنى. يمكن للمستأجر الحصول على تأمين إضافي على ممتلكاته الشخصية.',
    answerEn:
      'Fire insurance for buildings is mandatory in the Kingdom. The landlord bears the cost of basic building insurance. The tenant can obtain additional insurance for personal belongings.',
    source: 'الدفاع المدني، مؤسسة النقد العربي السعودي',
    category: 'general',
  },
];

/**
 * Search the knowledge base using keyword matching.
 * Returns entries ranked by match score.
 */
export function searchKnowledgeBase(
  query: string,
  language: 'ar' | 'en',
): { entry: KnowledgeEntry; score: number }[] {
  const normalizedQuery = query.toLowerCase().trim();
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 1);

  if (queryWords.length === 0) return [];

  const results: { entry: KnowledgeEntry; score: number }[] = [];

  for (const entry of knowledgeBase) {
    let score = 0;
    const keywords = language === 'ar' ? entry.keywordsAr : entry.keywordsEn;
    const question = language === 'ar' ? entry.questionAr : entry.questionEn;
    const answer = language === 'ar' ? entry.answerAr : entry.answerEn;

    // Also check the other language keywords for cross-language matching
    const allKeywords = [...entry.keywordsAr, ...entry.keywordsEn];
    const allText = `${entry.questionAr} ${entry.questionEn} ${entry.answerAr} ${entry.answerEn}`;

    for (const word of queryWords) {
      // Exact keyword match (highest weight)
      if (allKeywords.some((k) => k.includes(word) || word.includes(k))) {
        score += 3;
      }
      // Question contains word
      if (
        question.toLowerCase().includes(word) ||
        entry.questionAr.includes(word) ||
        entry.questionEn.toLowerCase().includes(word)
      ) {
        score += 2;
      }
      // Answer contains word
      if (allText.toLowerCase().includes(word)) {
        score += 1;
      }
    }

    if (score > 0) {
      results.push({ entry, score });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}
