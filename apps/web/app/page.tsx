'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
  Building2,
  User,
  UserCheck,
  Wrench,
  Sprout,
  MessageSquareWarning,
  CircleDollarSign,
  Clock,
  Bell,
  BarChart3,
  FileSearch,
  Users,
  ChevronDown,
  CheckCircle2,
  ArrowLeft,
  Zap,
  Scale,
  Smartphone,
  MessageCircle,
  Check,
  CheckCheck,
  Shield,
  TrendingUp,
  Camera,
  Eye,
  Receipt,
  Banknote,
  Phone,
  Star,
  Award,
  Landmark,
  FileText,
  Settings,
  Cpu,
  MapPin,
  ThumbsUp,
  ChevronUp,
  Home,
  Hammer,
  Droplets,
  Wind,
  Mail,
  Globe,
  X,
  Menu,
} from 'lucide-react';

/* ───────────────────────── Animated Counter ───────────────────────── */

function AnimatedNumber({
  value,
  suffix = '',
  prefix = '',
}: {
  value: number;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(
    spring,
    (v) => prefix + Math.round(v).toLocaleString('ar-SA') + suffix,
  );

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, spring, value]);

  useEffect(() => {
    const unsub = display.on('change', (v) => {
      if (ref.current) ref.current.textContent = v;
    });
    return unsub;
  }, [display]);

  return (
    <span ref={ref}>
      {prefix}٠{suffix}
    </span>
  );
}

/* ───────────────────────── Section Wrapper ───────────────────────── */

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-4 py-20 sm:px-6 lg:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/* ───────────────────────── Scroll Reveal ───────────────────────── */

const revealVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 18, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 120, damping: 16 },
  },
};

/* ───────────────────────── Device Mockups ───────────────────────── */

function LaptopMockup() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-t-xl border-4 border-gray-800 bg-gray-800 p-1">
        <div className="overflow-hidden rounded-lg bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 rounded-md bg-white px-3 py-1 text-center text-[10px] text-gray-400">
              faseel.sa/office/dashboard
            </div>
          </div>
          <div className="flex h-[280px] sm:h-[340px]" dir="rtl">
            <div className="hidden w-[180px] shrink-0 border-s border-gray-100 bg-gray-50/80 p-3 sm:block">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Sprout className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-[11px] font-bold text-gray-800">فسيل</span>
              </div>
              {[
                'لوحة التحكم',
                'طلبات الصيانة',
                'المباني',
                'مقدمي الخدمات',
                'التقارير',
                'الإعدادات',
              ].map((item, i) => (
                <div
                  key={i}
                  className={`mb-1 rounded-lg px-2.5 py-1.5 text-[10px] ${
                    i === 0 ? 'bg-emerald-50 font-semibold text-emerald-700' : 'text-gray-500'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="flex-1 p-3 sm:p-4">
              <div className="mb-3 text-[11px] font-bold text-gray-800">لوحة التحكم</div>
              <div className="mb-3 grid grid-cols-3 gap-2">
                {[
                  { label: 'طلبات نشطة', value: '١٢', color: 'from-brand-500 to-red-500' },
                  { label: 'تم حلها', value: '٤٧', color: 'from-emerald-500 to-teal-500' },
                  { label: 'بانتظار التكليف', value: '٥', color: 'from-amber-500 to-orange-500' },
                ].map((kpi, i) => (
                  <div key={i} className="rounded-xl bg-gray-50 p-2.5">
                    <div
                      className={`mb-1 bg-gradient-to-l text-lg font-bold ${kpi.color} bg-clip-text text-transparent`}
                    >
                      {kpi.value}
                    </div>
                    <div className="text-[9px] text-gray-500">{kpi.label}</div>
                  </div>
                ))}
              </div>
              <div className="mb-2 text-[10px] font-semibold text-gray-700">آخر الطلبات</div>
              {[
                {
                  title: 'تسريب مياه — شقة ٤٠٣',
                  status: 'قيد التنفيذ',
                  statusColor: 'bg-amber-100 text-amber-700',
                },
                {
                  title: 'عطل مكيف — شقة ٢٠١',
                  status: 'تم الحل',
                  statusColor: 'bg-emerald-100 text-emerald-700',
                },
                {
                  title: 'مصعد متوقف — البرج',
                  status: 'جديد',
                  statusColor: 'bg-brand-100 text-brand-700',
                },
              ].map((req, i) => (
                <div
                  key={i}
                  className="mb-1.5 flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-2"
                >
                  <span className="text-[10px] text-gray-700">{req.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[8px] font-semibold ${req.statusColor}`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto h-3 w-[105%] rounded-b-xl bg-gradient-to-b from-gray-700 to-gray-800" />
      <div className="mx-auto h-1 w-[60%] rounded-b bg-gray-600" />
    </div>
  );
}

function PhoneMockup({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-[260px] ${className}`}>
      <div className="rounded-[2rem] border-4 border-gray-800 bg-gray-800 p-1">
        <div className="relative">
          <div className="absolute start-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-gray-800" />
        </div>
        <div className="overflow-hidden rounded-[1.5rem] bg-white">{children}</div>
      </div>
    </div>
  );
}

function TenantPhoneMockup() {
  return (
    <PhoneMockup>
      <div className="h-[440px]" dir="rtl">
        <div className="flex items-center justify-between bg-white px-4 pb-2 pt-7 text-[9px] font-semibold text-gray-800">
          <span>٩:٤١</span>
          <div className="flex gap-1">
            <div className="h-2 w-3 rounded-sm bg-gray-800" />
            <div className="h-2.5 w-1 rounded-sm bg-gray-800" />
          </div>
        </div>
        <div className="border-b border-gray-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Sprout className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="text-[12px] font-bold text-gray-800">طلب صيانة جديد</div>
              <div className="text-[9px] text-gray-500">شقة ٤٠٣ — برج النخيل</div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="mb-5 flex items-center gap-1">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full ${step <= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`}
              />
            ))}
          </div>
          <div className="mb-3 text-[11px] font-semibold text-gray-800">اختر الفئة</div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {[
              { icon: '🔧', label: 'سباكة', active: true },
              { icon: '⚡', label: 'كهرباء', active: false },
              { icon: '❄️', label: 'تكييف', active: false },
              { icon: '🏗️', label: 'هيكلي', active: false },
            ].map((cat, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-xl border p-2.5 text-[10px] ${
                  cat.active
                    ? 'border-emerald-500 bg-emerald-50 font-semibold text-emerald-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                {cat.label}
              </div>
            ))}
          </div>
          <div className="mb-3 text-[11px] font-semibold text-gray-800">صور المشكلة</div>
          <div className="mb-4 flex gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-xl">
              📸
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-lg text-gray-400">
              +
            </div>
          </div>
          <button className="w-full rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 py-3 text-[12px] font-bold text-white">
            إرسال البلاغ
          </button>
        </div>
      </div>
    </PhoneMockup>
  );
}

function WhatsAppMockup() {
  return (
    <PhoneMockup>
      <div className="h-[440px]" dir="rtl">
        <div className="flex items-center justify-between bg-[#075E54] px-4 pb-2 pt-7 text-[9px] font-semibold text-white">
          <span>٩:٤١</span>
          <div className="flex gap-1">
            <div className="h-2 w-3 rounded-sm bg-white" />
            <div className="h-2.5 w-1 rounded-sm bg-white" />
          </div>
        </div>
        <div className="flex items-center gap-3 bg-[#075E54] px-4 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <Sprout className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-[12px] font-semibold text-white">فسيل — إشعارات المبنى</div>
            <div className="text-[9px] text-white/70">مكتب الجزيرة العقاري</div>
          </div>
        </div>
        <div
          className="flex h-full flex-col gap-2 bg-[#ECE5DD] p-3"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        >
          <div className="mx-auto rounded-lg bg-[#E2F7CB] px-3 py-1 text-[9px] text-gray-600">
            اليوم
          </div>
          <div className="max-w-[85%] self-start rounded-xl rounded-tr-none bg-white p-3 shadow-sm">
            <div className="mb-1 text-[10px] font-bold text-emerald-600">🔔 بلاغ صيانة جديد</div>
            <div className="text-[10px] leading-relaxed text-gray-800">
              <div className="font-semibold">تسريب مياه — شقة ٤٠٣</div>
              <div className="mt-1 text-gray-600">المبنى: برج النخيل السكني</div>
              <div className="text-gray-600">المستأجر: خالد المالكي</div>
              <div className="mt-1.5 rounded-lg bg-amber-50 px-2 py-1 font-semibold text-amber-700">
                💰 المسؤولية: المالك (مادة ٤١٩ نظام المعاملات المدنية)
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-end gap-1 text-[8px] text-gray-400">
              ١٠:٣٢ ص
              <CheckCheck className="h-3 w-3 text-sky-500" />
            </div>
          </div>
          <div className="max-w-[85%] self-start rounded-xl rounded-tr-none bg-white p-3 shadow-sm">
            <div className="mb-1 text-[10px] font-bold text-sky-600">👷 تم تكليف فني</div>
            <div className="text-[10px] leading-relaxed text-gray-800">
              <div>مؤسسة الفيصل للسباكة</div>
              <div className="text-gray-600">موعد الزيارة: اليوم ٢:٠٠ م</div>
              <div className="text-gray-600">التكلفة المتوقعة: ٢٠٠-٣٠٠ ر.س</div>
            </div>
            <div className="mt-1.5 flex items-center justify-end gap-1 text-[8px] text-gray-400">
              ١٠:٤٥ ص
              <CheckCheck className="h-3 w-3 text-sky-500" />
            </div>
          </div>
          <div className="max-w-[85%] self-start rounded-xl rounded-tr-none bg-white p-3 shadow-sm">
            <div className="mb-1 text-[10px] font-bold text-emerald-600">✅ تم الإصلاح</div>
            <div className="text-[10px] leading-relaxed text-gray-800">
              <div>تسريب مياه — شقة ٤٠٣</div>
              <div className="mt-1 text-gray-600">التكلفة: ٢٥٠ ر.س (على المالك)</div>
              <div className="text-gray-600">المدة: ٣ ساعات</div>
            </div>
            <div className="mt-1.5 flex items-center justify-end gap-1 text-[8px] text-gray-400">
              ٢:٣٠ م
              <CheckCheck className="h-3 w-3 text-sky-500" />
            </div>
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
}
/* ───────────────────────── Data ───────────────────────── */

const painPoints = [
  {
    icon: Clock,
    title: '٣-١٤ يوم متوسط وقت الاستجابة',
    desc: 'المستأجر يبلغ عن عطل مكيف في عز الصيف (٤٥-٥٠°م) — وينتظر أسبوعين. في السعودية، عطل التكييف ليس إزعاج، هو حالة طوارئ.',
    stat: '٣-١٤',
    statLabel: 'يوم انتظار',
    color: 'text-red-500',
    bg: 'bg-red-50',
    accent: 'border-red-200',
  },
  {
    icon: MessageSquareWarning,
    title: '٦٥٪ من المكاتب بدون نظام',
    desc: 'ثلثا المكاتب العقارية في السعودية تدير عملياتها بالواتساب والإكسل والورق. الطلبات تضيع، والمتابعة مستحيلة.',
    stat: '٦٥٪',
    statLabel: 'بدون نظام',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    accent: 'border-amber-200',
  },
  {
    icon: CircleDollarSign,
    title: 'جدال التكاليف لا ينتهي',
    desc: 'المكيف خرب — المالك يقول: "المستأجر يدفع"، والمستأجر يقول: "المالك يدفع". النظام السعودي (مادة ٤١٩) واضح، لكن ما أحد يرجعله.',
    stat: '٤١٩',
    statLabel: 'مادة نظامية',
    color: 'text-sky-500',
    bg: 'bg-sky-50',
    accent: 'border-sky-200',
  },
  {
    icon: Users,
    title: 'ما في منصة تربط ٤ أطراف',
    desc: 'المستأجر، المالك، المكتب، مقدم الخدمة — كل واحد في جزيرة. Munjz للصيانة بس، Sakani CRM بس، RAY إدارة بس. ما أحد يربط الكل.',
    stat: '٤',
    statLabel: 'أطراف منفصلة',
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    accent: 'border-violet-200',
  },
];

const solutionPoints = [
  {
    icon: Scale,
    title: 'محرك التكاليف الذكي',
    desc: 'يحدد تلقائياً مين يدفع بناءً على نظام المعاملات المدنية ونظام ملكية الوحدات المفرزة — المرجع القانوني مرفق مع كل قرار.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FileSearch,
    title: 'تتبع كامل من البلاغ للحل',
    desc: 'كل طلب له مسار واضح: بلاغ ← تصنيف ذكي ← تحديد المسؤولية ← تكليف فني ← تنفيذ ← استلام وتقييم.',
    gradient: 'from-sky-500 to-blue-600',
  },
  {
    icon: Smartphone,
    title: 'واتساب + منصة = أفضل تجربة',
    desc: 'لا نستبدل الواتساب — نعمل معاه. الإشعارات فورية على الواتساب، والتفاصيل والسجل على المنصة.',
    gradient: 'from-brand-500 to-red-500',
  },
];

const officeFeatures = [
  {
    icon: Building2,
    title: 'إدارة ٥٠ مبنى بنفس الفريق',
    desc: 'لوحة تحكم واحدة لكل المباني والوحدات — بدون ملفات إكسل متفرقة.',
  },
  {
    icon: BarChart3,
    title: 'تقارير تلقائية للملاك',
    desc: 'كل مالك يستلم تقرير شهري بالطلبات والتكاليف — بدون ما تكتب حرف.',
  },
  {
    icon: FileText,
    title: 'ربط مع إيجار',
    desc: 'مزامنة بيانات العقود مباشرة — بدون إدخال يدوي مكرر.',
  },
  {
    icon: Wrench,
    title: 'تتبع الصيانة بالأرقام',
    desc: 'متوسط وقت الحل، التكاليف الشهرية، أداء مقدمي الخدمات — كلها في لوحة واحدة.',
  },
];

const tenantFeatures = [
  {
    icon: Clock,
    title: 'بلاغ في ٣٠ ثانية',
    desc: 'فتح التطبيق، اختيار الفئة، تصوير المشكلة، إرسال. بدون اتصالات أو انتظار.',
  },
  {
    icon: Eye,
    title: 'تتبع لحظي',
    desc: 'شوف وين وصل طلبك: مُستلم، قيد التقييم، فني في الطريق، تم الإصلاح.',
  },
  {
    icon: Camera,
    title: 'بلاغ بالصور',
    desc: 'صوّر المشكلة بجوالك — الصورة أبلغ من ألف كلمة وتسرّع التشخيص.',
  },
  {
    icon: Shield,
    title: 'بدون إحراج',
    desc: 'رطوبة، حشرات، تسريب — بلّغ إلكترونياً بدون مواجهة أو حرج. خصوصيتك محفوظة.',
  },
];

const ownerFeatures = [
  {
    icon: Receipt,
    title: 'شفافية مالية كاملة',
    desc: 'كل ريال مصروف موثق — نوع الصيانة، المبنى، الوحدة، مقدم الخدمة، الفاتورة.',
  },
  {
    icon: BarChart3,
    title: 'أرباح وخسائر لكل مبنى',
    desc: 'تقرير P&L لكل عقار — إيرادات الإيجار مقابل مصاريف الصيانة والتشغيل.',
  },
  {
    icon: Smartphone,
    title: 'موافقات من الجوال',
    desc: 'طلب صيانة يحتاج موافقتك؟ وافق أو ارفض من جوالك مباشرة مع تفاصيل التكلفة.',
  },
  {
    icon: Users,
    title: 'رسوم اتحاد الملاك',
    desc: 'حساب تلقائي بنسبة المساحة حسب نظام ملكية الوحدات المفرزة (مادة ١١) — كل مالك يعرف حصته.',
  },
];

const providerFeatures = [
  {
    icon: FileText,
    title: 'تفاصيل شغل واضحة',
    desc: 'نوع العطل، الموقع، صور المشكلة، معلومات التواصل — كل شيء جاهز قبل ما توصل.',
  },
  {
    icon: Banknote,
    title: 'ضمان الدفع',
    desc: 'التكلفة متفق عليها مسبقاً، والمسؤول عن الدفع محدد بالنظام — بدون مماطلة.',
  },
  {
    icon: Phone,
    title: 'بدون مكالمات ضايعة',
    desc: 'أوامر العمل توصلك إلكترونياً — بدون اتصالات مفقودة أو رسائل واتساب تضيع.',
  },
  {
    icon: Star,
    title: 'تقييم وسمعة',
    desc: 'شغلك الممتاز يرفع تقييمك — وتقييمك العالي يجلب لك مزيد من الطلبات.',
  },
];

const features = [
  {
    icon: Zap,
    title: 'محرك توزيع التكاليف',
    desc: 'يستند لنظام المعاملات المدنية ونظام ملكية الوحدات — يحدد المسؤولية تلقائياً مع المرجع.',
  },
  {
    icon: FileSearch,
    title: 'تتبع الطلبات بالكامل',
    desc: 'من لحظة البلاغ حتى الاستلام. سجل كامل بالتواريخ والإجراءات والصور.',
  },
  {
    icon: Bell,
    title: 'إشعارات واتساب فورية',
    desc: 'كل تحديث يوصل لكل الأطراف مباشرة — بدون متابعة يدوية.',
  },
  {
    icon: Building2,
    title: 'إدارة المباني والوحدات',
    desc: 'كل مبنى بوحداته ومالكيه ومستأجريه — في مكان واحد.',
  },
  {
    icon: CircleDollarSign,
    title: 'رسوم اتحاد الملاك',
    desc: 'حساب تلقائي بنسبة المساحة. كل مالك يعرف حصته بالضبط.',
  },
  {
    icon: BarChart3,
    title: 'تقارير ولوحات تحكم',
    desc: 'طلبات مفتوحة، متوسط وقت الحل، تكاليف شهرية، أداء مقدمي الخدمات.',
  },
  {
    icon: Cpu,
    title: 'تصنيف ذكي بالذكاء الاصطناعي',
    desc: 'النظام يصنف البلاغ تلقائياً (سباكة، كهرباء، تكييف) من الوصف والصور.',
  },
  {
    icon: Camera,
    title: 'رفع مستندات وصور',
    desc: 'فواتير، عقود، صور قبل وبعد — كل شيء موثق ومحفوظ في سجل الطلب.',
  },
  {
    icon: Award,
    title: 'متوافق مع إيجار وملّاك',
    desc: 'مصمم للامتثال الكامل مع أنظمة إيجار، ملّاك، فال، وسداد.',
  },
];

const steps = [
  {
    num: '١',
    title: 'المستأجر يبلغ',
    desc: 'يفتح المنصة من جواله، يختار الفئة (تكييف، سباكة، كهرباء)، يصور المشكلة، ويرسل في ٣٠ ثانية.',
    color: 'from-brand-500 to-red-500',
    icon: MessageCircle,
  },
  {
    num: '٢',
    title: 'النظام يحدد المسؤولية',
    desc: 'محرك التكاليف الذكي يرجع لنظام المعاملات المدنية (مادة ٤١٩-٤٣٥) ويحدد: المالك يدفع أم المستأجر؟',
    color: 'from-amber-500 to-orange-500',
    icon: Scale,
  },
  {
    num: '٣',
    title: 'المكتب يكلف مقدم خدمة',
    desc: 'المكتب يختار فني مُقيّم من الشبكة، يحدد الموعد، والجميع يستلم إشعار واتساب فوري.',
    color: 'from-sky-500 to-blue-500',
    icon: Wrench,
  },
  {
    num: '٤',
    title: 'الكل يتابع حتى الحل',
    desc: 'المستأجر يشوف التقدم، المالك يشوف التكلفة ويوافق، والمكتب يضمن الجودة ويغلق الطلب.',
    color: 'from-emerald-500 to-teal-500',
    icon: CheckCircle2,
  },
];

const pricingPlans = [
  {
    name: 'مبتدئ',
    nameEn: 'Starter',
    monthlyPrice: '٠',
    annualPrice: '٠',
    period: 'للأبد',
    desc: 'ابدأ مجاناً — أثبت القيمة قبل ما تدفع',
    buildings: '١ مبنى',
    units: '١٠ وحدات',
    gradient: 'from-gray-500 to-gray-600',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    popular: false,
    features: [
      'طلبات صيانة أساسية',
      'مشرف واحد',
      'توجيه تكاليف يدوي',
      'لوحة تحكم أساسية',
      'بوابة المستأجر',
    ],
  },
  {
    name: 'نمو',
    nameEn: 'Growth',
    monthlyPrice: '١٤٩',
    annualPrice: '١٢٤',
    annualTotal: '١,٤٩٠',
    period: 'شهرياً',
    desc: 'للمكاتب الناشئة والمتنامية',
    buildings: '٥ مباني',
    units: '٧٥ وحدة',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    popular: true,
    features: [
      '٣ مشرفين',
      'إدارة مقدمي الخدمات',
      'محرك التكاليف الذكي',
      'إشعارات واتساب',
      'تقارير أساسية',
      'بوابة المالك',
    ],
  },
  {
    name: 'احترافي',
    nameEn: 'Pro',
    monthlyPrice: '٣٩٩',
    annualPrice: '٣٣٣',
    annualTotal: '٣,٩٩٠',
    period: 'شهرياً',
    desc: 'للمكاتب الكبيرة — كل شيء مؤتمت',
    buildings: '٢٥ مبنى',
    units: '٥٠٠ وحدة',
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    popular: false,
    features: [
      'مشرفين غير محدود',
      'بوابة المالك',
      'تحليلات متقدمة',
      'ربط مع إيجار',
      'تقارير P&L لكل مبنى',
      'أولوية في الدعم الفني',
    ],
  },
  {
    name: 'مؤسسي',
    nameEn: 'Enterprise',
    monthlyPrice: 'حسب الطلب',
    annualPrice: 'حسب الطلب',
    period: '',
    desc: 'للشركات الكبرى وصناديق الاستثمار',
    buildings: 'غير محدود',
    units: 'غير محدود',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    popular: false,
    features: [
      'كل مميزات الاحترافي',
      'API كامل للربط',
      'مدير حساب مخصص',
      'تدريب الفريق',
      'SLA مخصص',
      'تكاملات مخصصة',
    ],
  },
];

const otherPlans = [
  {
    name: 'إدارة ذاتية',
    nameEn: 'Owner Self-Manage',
    monthlyPrice: '٧٩',
    annualPrice: '٦٦',
    period: 'شهرياً',
    desc: 'للملاك اللي يديرون عقاراتهم بنفسهم',
    limit: '٥ مباني',
    gradient: 'from-amber-500 to-orange-500',
    icon: Home,
  },
  {
    name: 'مزود+',
    nameEn: 'Provider Pro',
    monthlyPrice: '٩٩',
    annualPrice: '٨٣',
    period: 'شهرياً',
    desc: 'لمقدمي خدمات الصيانة المحترفين',
    limit: 'طلبات غير محدودة — أولوية في الظهور',
    gradient: 'from-sky-500 to-blue-500',
    icon: Wrench,
  },
  {
    name: 'مستأجر',
    nameEn: 'Tenant',
    monthlyPrice: '٠',
    annualPrice: '٠',
    period: 'مجاني دائماً',
    desc: 'المستأجر ما يدفع شيء — أبداً',
    limit: 'بلاغات غير محدودة',
    gradient: 'from-emerald-500 to-teal-500',
    icon: User,
  },
];

const costRouterExamples = [
  {
    type: 'تسريب مياه من السقف',
    category: 'سباكة',
    cost: '٢٠٠-٥٠٠ ر.س',
    responsible: 'المالك',
    law: 'مادة ٤١٩ — نظام المعاملات المدنية',
    lawText: 'على المؤجر إتمام الإصلاحات الضرورية لإبقاء العين المؤجرة صالحة للانتفاع',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    type: 'كسر زجاج النافذة بسبب المستأجر',
    category: 'هيكلي',
    cost: '١٥٠-٤٠٠ ر.س',
    responsible: 'المستأجر',
    law: 'مادة ٤٣٠ — نظام المعاملات المدنية',
    lawText: 'يلتزم المستأجر بتعويض المؤجر عما يلحق بالعين من ضرر ناشئ عن استعمالها غير المعتاد',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    type: 'صيانة المصعد السنوية',
    category: 'مشترك',
    cost: '٢,٠٠٠-٨,٠٠٠ ر.س',
    responsible: 'الملاك (بنسبة المساحة)',
    law: 'مادة ١١ — نظام ملكية الوحدات المفرزة',
    lawText: 'تتوزع تكاليف الأجزاء المشتركة على الملاك بنسبة مساحة كل وحدة',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
];

const faqData = [
  {
    q: 'هل فسيل يشتغل مع الواتساب؟',
    a: 'نعم. الواتساب هو العصب الرئيسي للتواصل العقاري في السعودية — ما نحاول نستبدله. فسيل يرسل إشعارات فورية لكل الأطراف عبر الواتساب مع رابط للتفاصيل الكاملة على المنصة. أفضل ما في العالمين.',
  },
  {
    q: 'كيف يحدد النظام مين يدفع تكلفة الصيانة؟',
    a: 'محرك التكاليف الذكي يستند مباشرة لنظام المعاملات المدنية السعودي (المواد ٤١٩-٤٣٥) ونظام ملكية الوحدات المفرزة (مادة ١١). يصنّف نوع العطل، يحدد السبب، ويطبّق المادة النظامية المناسبة — مع ذكر المرجع القانوني في كل قرار.',
  },
  {
    q: 'هل المنصة متوافقة مع إيجار وملّاك؟',
    a: 'فسيل مصمم للتوافق الكامل مع المنظومة السعودية: نظام إيجار للعقود، ملّاك لاتحادات الملاك، فال للوساطة، وسداد للمدفوعات الرقمية (إلزامية منذ يناير ٢٠٢٤).',
  },
  {
    q: 'كم يكلف الاشتراك؟',
    a: 'يبدأ مجاناً (٣ مباني، ٣٠ وحدة) — جرّب بدون أي التزام. الأساسي بـ ١٩٩ ر.س/شهر لـ ١٥ مبنى، والاحترافي بـ ٤٩٩ ر.س/شهر لـ ٥٠ مبنى مع الذكاء الاصطناعي وربط إيجار. المعيار العالمي ١-٥ دولار/وحدة/شهر — نحن أقل بكثير.',
  },
  {
    q: 'هل يناسب المكاتب الصغيرة أو بس للكبار؟',
    a: 'صُمم أساساً للمكاتب العقارية بكل أحجامها. مكتب يدير ٥ مباني يستفيد بنفس القدر من مكتب يدير ٥٠٠. الفرق إنك بدل ما تتابع بالواتساب والإكسل، كل شيء في مكان واحد.',
  },
  {
    q: 'كيف أضمن خصوصية المستأجرين والملاك؟',
    a: 'كل طرف يشوف بس البيانات اللي تخصه. المستأجر يشوف طلباته بس، المالك يشوف مبانيه بس، ومقدم الخدمة يشوف أوامر العمل المكلف فيها بس. البيانات مشفرة ومحفوظة على سيرفرات في السعودية.',
  },
  {
    q: 'ماذا عن زيارات الصيانة للشقق — هل في اعتبار للخصوصية؟',
    a: 'نعم. النظام يتيح للمستأجر تحديد أوقات الزيارة المناسبة، وطلب فني/فنية حسب الحاجة، وإرفاق ملاحظات خصوصية. كل زيارة موثقة بالوقت والهوية.',
  },
];

const complianceBadges = [
  { name: 'إيجار', desc: 'نظام توثيق العقود', icon: FileText },
  { name: 'ملّاك', desc: 'اتحادات الملاك', icon: Building2 },
  { name: 'فال', desc: 'ترخيص الوساطة', icon: Award },
  { name: 'سداد', desc: 'المدفوعات الرقمية', icon: Banknote },
  { name: 'نفاذ', desc: 'الهوية الرقمية', icon: Shield },
  { name: 'رؤية ٢٠٣٠', desc: 'التحول الرقمي', icon: TrendingUp },
];

const portals = [
  {
    label: 'مكتب عقاري',
    sublabel: 'لوحة تحكم كاملة — طلبات، مباني، مقدمي خدمات، تقارير، تكاليف',
    href: '/office/dashboard',
    icon: Building2,
    gradient: 'from-brand-500 to-red-500',
    bg: 'bg-brand-50',
    iconColor: 'text-brand-500',
  },
  {
    label: 'مستأجر',
    sublabel: 'بلّغ عن مشكلة في ٣٠ ثانية وتابع حالتها لحظة بلحظة',
    href: '/tenant/dashboard',
    icon: User,
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50',
    iconColor: 'text-sky-500',
  },
  {
    label: 'مالك',
    sublabel: 'تابع وحداتك، وافق على الصيانة، وشوف تقارير الأرباح والخسائر',
    href: '/owner/dashboard',
    icon: UserCheck,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    label: 'مقدم خدمة',
    sublabel: 'استلم أوامر العمل بالتفاصيل والصور — ونفّذ وقيّم',
    href: '/provider/dashboard',
    icon: Wrench,
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-500',
  },
];
/* ───────────────────────── FAQ Item ───────────────────────── */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={itemVariants}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 p-5 text-start sm:p-6"
      >
        <span className="font-bold text-gray-900">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 shrink-0 text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <p className="text-sm leading-relaxed text-gray-600">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ───────────────────────── Page ───────────────────────── */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ─── Floating Nav ─── */}
      <nav className="fixed end-0 start-0 top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">فسيل</span>
          </div>
          <div className="hidden items-center gap-6 sm:flex">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              المميزات
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              كيف يعمل
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              التسعير
            </a>
            <a
              href="/resources"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              الموارد
            </a>
            <a
              href="#portals"
              className="rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-emerald-500/25"
            >
              تجربة المنصة
            </a>
          </div>
          <button className="sm:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-100 bg-white sm:hidden"
            >
              <div className="flex flex-col gap-3 px-4 py-4">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-gray-600"
                >
                  المميزات
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-gray-600"
                >
                  كيف يعمل
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-gray-600"
                >
                  التسعير
                </a>
                <a
                  href="/resources"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-gray-600"
                >
                  الموارد
                </a>
                <a
                  href="#portals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 px-5 py-2.5 text-center text-sm font-semibold text-white"
                >
                  تجربة المنصة
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── 1. Hero ─── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pt-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 start-1/4 h-[800px] w-[800px] rounded-full bg-emerald-500/[0.07] blur-3xl" />
          <div className="absolute -bottom-1/4 end-1/4 h-[600px] w-[600px] rounded-full bg-teal-500/[0.05] blur-3xl" />
          <div className="bg-brand-500/[0.04] absolute end-0 top-1/3 h-[400px] w-[400px] rounded-full blur-3xl" />
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.025]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path
                  d="M30 0L60 30L30 60L0 30Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
                <circle cx="30" cy="30" r="8" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geo)" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25"
          >
            <Sprout className="h-10 w-10 text-white" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700"
          >
            <TrendingUp className="h-4 w-4" />
            سوق إدارة العقارات في السعودية: ١٢.٥ مليار دولار ومتوقع يوصل ٢٠ مليار بحلول ٢٠٣٠
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            ١٥ مليون ساكن.
            <br />
            ١٠ مليون عقد إيجار.
            <br />
            <span className="bg-gradient-to-l from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              ولا منصة تشغيلية واحدة.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-500 sm:text-xl"
          >
            فسيل هي الطبقة التشغيلية للمبنى — تربط المستأجر والمالك والمكتب العقاري ومقدم الخدمة في
            نظام واحد. من البلاغ، للتسعير بالنظام السعودي، للحل.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <a
              href="#portals"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30"
            >
              جرّب المنصة مجاناً
              <ArrowLeft className="h-5 w-5" />
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
            >
              شوف كيف يعمل
            </a>
          </motion.div>

          {/* Hero Stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-6 sm:gap-10"
          >
            {[
              { value: 10, suffix: 'M+', label: 'عقد إيجار مسجل في إيجار' },
              { value: 65, suffix: '٪', label: 'مكاتب بدون نظام تشغيل' },
              { value: 15, suffix: 'M', label: 'ساكن في عقارات مؤجرة' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="bg-gradient-to-l from-emerald-500 to-teal-600 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-xs text-gray-500 sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400"
          >
            {['مبني على النظام السعودي', 'إشعارات واتساب', 'متوافق مع إيجار', 'بيانات مشفرة'].map(
              (item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  {item}
                </span>
              ),
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-12"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              <ChevronDown className="mx-auto h-6 w-6 text-gray-400" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── 2. Dashboard Mockup ─── */}
      <Section className="bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring', stiffness: 60, damping: 20 }}
        >
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
              لوحة التحكم
            </span>
            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">كل شيء في شاشة واحدة</h2>
            <p className="mx-auto max-w-xl text-gray-500">
              طلبات، مباني، تكاليف، مقدمي خدمات — لوحة تحكم مصممة خصيصاً للمكاتب العقارية السعودية.
            </p>
          </div>
          <LaptopMockup />
        </motion.div>
      </Section>

      {/* ─── 3. Pain Points ─── */}
      <Section id="problem">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center"
        >
          <motion.div variants={itemVariants}>
            <span className="mb-4 inline-block rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-600">
              المشكلة
            </span>
          </motion.div>
          <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
            إدارة المباني في السعودية؟ فوضى.
          </motion.h2>
          <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-2xl text-gray-500">
            الدولة فرضت اتحادات الملاك وسجّلت ١٥,٨١٠ اتحاد في ملّاك — لكن ٣١٪ منها غير نشطة. التسجيل
            موجود، لكن أدوات التشغيل غائبة. النتيجة؟ كل شيء في الواتساب.
          </motion.p>

          <div className="grid gap-4 sm:grid-cols-2">
            {painPoints.map((pain, i) => {
              const Icon = pain.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{
                    y: -4,
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  className={`rounded-2xl border ${pain.accent} bg-white p-6 text-start shadow-sm transition-shadow hover:shadow-lg`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${pain.bg}`}
                    >
                      <Icon className={`h-6 w-6 ${pain.color}`} />
                    </div>
                    <div className="text-end">
                      <div className={`text-2xl font-bold ${pain.color}`}>{pain.stat}</div>
                      <div className="text-[10px] text-gray-400">{pain.statLabel}</div>
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{pain.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{pain.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Section>

      {/* ─── 4. Solution Overview ─── */}
      <Section className="bg-gradient-to-b from-emerald-50/50 to-white" id="solution">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                الحل
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              فسيل — الطبقة التشغيلية اللي ما أحد بناها
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-2xl text-gray-500">
              Munjz يعمل صيانة بس. Sakani Pro يعمل CRM بس. RAY يعمل إدارة بس. Simaat يعمل محاسبة بس.
              ما أحد بنى الطبقة اللي تربط المستأجر بالمالك بالمكتب بمقدم الخدمة — حتى الآن.
            </motion.p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {solutionPoints.map((point, i) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div
                    className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${point.gradient}`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{point.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{point.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Section>

      {/* ─── 5. Phone + WhatsApp Mockups ─── */}
      <Section className="bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="mb-14 text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-700">
                تجربة المستخدم
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-3 text-3xl font-bold sm:text-4xl">
              بلاغ من الجوال، إشعار على الواتساب
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto max-w-xl text-gray-500">
              ٩٨٪ من السعوديين يملكون جوال ذكي — يبون راحة رقمية مع خيار التصعيد البشري. فسيل يعطيهم
              الاثنين.
            </motion.p>
          </div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-10 sm:flex-row sm:justify-center sm:gap-16"
          >
            <div className="text-center">
              <TenantPhoneMockup />
              <p className="mt-4 text-sm font-semibold text-gray-700">تطبيق المستأجر</p>
              <p className="text-xs text-gray-500">بلاغ في ٣٠ ثانية</p>
            </div>
            <div className="text-center">
              <WhatsAppMockup />
              <p className="mt-4 text-sm font-semibold text-gray-700">إشعارات واتساب</p>
              <p className="text-xs text-gray-500">كل الأطراف تعرف وش صار</p>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ─── 6. Smart Cost Router ─── */}
      <Section id="cost-router">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                محرك التكاليف الذكي
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              مين يدفع؟ النظام السعودي يقرر.
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-2xl text-gray-500">
              بدل الجدال بين المالك والمستأجر — محرك التكاليف يرجع مباشرة لنظام المعاملات المدنية
              ونظام ملكية الوحدات المفرزة ويحدد المسؤولية تلقائياً.
            </motion.p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {costRouterExamples.map((example, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                    {example.category}
                  </span>
                  <span className="text-xs text-gray-400">{example.cost}</span>
                </div>
                <h3 className="mb-3 font-bold text-gray-900">{example.type}</h3>
                <div className={`mb-3 rounded-xl ${example.bg} p-3`}>
                  <div className="mb-1 flex items-center gap-2">
                    <Scale className={`h-4 w-4 ${example.color}`} />
                    <span className={`text-sm font-bold ${example.color}`}>
                      المسؤول: {example.responsible}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-gray-600">{example.law}</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    <p className="text-[11px] leading-relaxed text-gray-500">
                      &ldquo;{example.lawText}&rdquo;
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} className="mt-8 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-gray-50 px-6 py-4 text-xs text-gray-500">
              <span className="font-semibold text-gray-700">أمثلة على التكاليف الشائعة:</span>
              <span>إصلاح مكيف سبلت: ٢٠٠-٥٠٠ ر.س</span>
              <span className="text-gray-300">|</span>
              <span>سباكة بسيطة: ١٠٠-٣٠٠ ر.س</span>
              <span className="text-gray-300">|</span>
              <span>تنظيف خزان مياه: ٣٥٠-١,٥٠٠ ر.س</span>
              <span className="text-gray-300">|</span>
              <span>عزل مائي للمبنى: ١٢,٥٠٠-٢٧,٠٠٠ ر.س</span>
            </div>
          </motion.div>
        </motion.div>
      </Section>
      {/* ─── 7. For RE Offices ─── */}
      <Section className="from-brand-50/30 bg-gradient-to-b to-white" id="for-offices">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="bg-brand-100 text-brand-600 mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">
                لمكاتب إدارة الأملاك
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              أدر ٥٠ مبنى بنفس الفريق
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-2xl text-gray-500">
              ٦٥٪ من المكاتب العقارية في السعودية لسا تدير بالواتساب والإكسل. فسيل يحوّل مكتبك من
              الفوضى اليدوية إلى نظام مؤتمت — بدون ما تغير فريقك.
            </motion.p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {officeFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="bg-brand-50 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="text-brand-500 h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Section>

      {/* ─── 8. For Tenants ─── */}
      <Section id="for-tenants">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-700">
                للمستأجرين
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              بلّغ بدون حرج، تابع بدون اتصال
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-2xl text-gray-500">
              في الثقافة السعودية، كثير مستأجرين يتحرجون يبلغون عن مشاكل مثل الرطوبة أو الحشرات —
              يحسونها غلطتهم. فسيل يخلي البلاغ إلكتروني، مهني، وبدون مواجهة.
            </motion.p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {tenantFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                    <Icon className="h-5 w-5 text-sky-500" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Section>

      {/* ─── 9. For Owners ─── */}
      <Section className="bg-gradient-to-b from-emerald-50/30 to-white" id="for-owners">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                للملاك
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              فلوسك واضحة — كل ريال موثق
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-2xl text-gray-500">
              العلاقة بين المالك والمستأجر عادةً عدائية — المكتب العقاري المفروض يكون الوسيط. فسيل
              يعطيك كمالك شفافية كاملة: وين راحت فلوسك، مين صرفها، وليش.
            </motion.p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ownerFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                    <Icon className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Section>

      {/* ─── 10. For Service Providers ─── */}
      <Section id="for-providers">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
                لمقدمي الخدمات
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              شغل واضح، دفع مضمون
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-2xl text-gray-500">
              المندوب هو الحلقة الأهم والأقل تقديراً في سلسلة الصيانة. فسيل يعطيه أوامر عمل واضحة،
              دفع مضمون، وسمعة تنمو مع كل شغلة ممتازة.
            </motion.p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {providerFeatures.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                    <Icon className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <h3 className="mb-1 font-bold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Section>

      {/* ─── 11. Features Grid ─── */}
      <Section className="bg-gradient-to-b from-gray-50 to-white" id="features">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="bg-brand-100 text-brand-600 mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold">
                المميزات
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              كل شيء تحتاجه في مكان واحد
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-2xl text-gray-500">
              من لحظة البلاغ حتى استلام الفاتورة — كل خطوة موثقة، كل تكلفة محسوبة، كل طرف مُبلّغ.
            </motion.p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{
                    y: -2,
                    transition: { type: 'spring', stiffness: 300, damping: 20 },
                  }}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-lg"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 transition-colors group-hover:bg-emerald-100">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="mb-1.5 font-bold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Section>

      {/* ─── 12. How It Works ─── */}
      <Section id="how-it-works">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-700">
                كيف يعمل
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              أربع خطوات — من المشكلة للحل
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-xl text-gray-500">
              بدون اتصالات، بدون متابعة يدوية، بدون ضياع. كل شيء واضح ومُوثّق.
            </motion.p>
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="from-brand-500 absolute start-6 top-0 hidden h-full w-0.5 bg-gradient-to-b via-amber-500 via-sky-500 to-emerald-500 sm:block" />

            <div className="flex flex-col gap-8">
              {steps.map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="relative flex gap-5 sm:gap-8"
                  >
                    <div
                      className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-xl font-bold text-white shadow-lg`}
                    >
                      {step.num}
                    </div>
                    <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="mb-1.5 flex items-center gap-2">
                        <StepIcon className="h-4 w-4 text-gray-400" />
                        <h3 className="text-lg font-bold">{step.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </Section>
      {/* ─── 13. Compliance & Integration ─── */}
      <Section className="bg-gradient-to-b from-gray-50 to-white" id="compliance">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                التوافق والأنظمة
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              مبني على المنظومة السعودية
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-2xl text-gray-500">
              إيجار إلزامي لكل عقود الإيجار السكنية منذ ٢٠٢٠. المدفوعات الرقمية إلزامية منذ يناير
              ٢٠٢٤. فسيل مصمم للامتثال الكامل من اليوم الأول.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {complianceBadges.map((badge, i) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-shadow hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                    <Icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{badge.name}</div>
                    <div className="text-[10px] text-gray-500">{badge.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Section>

      {/* ─── 14. Pricing ─── */}
      <Section id="pricing">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                التسعير
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              ابدأ مجاناً — ادفع بس لمّا تكبر
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-4 max-w-2xl text-gray-500">
              المعيار العالمي لإدارة العقارات: ١-٥ دولار/وحدة/شهر. أسعارنا أقل بكثير — والباقة
              المجانية تكفي للبداية.
            </motion.p>
            <motion.p
              variants={itemVariants}
              className="mx-auto mb-8 max-w-xl text-xs text-gray-400"
            >
              جميع الأسعار بالريال السعودي ولا تشمل ضريبة القيمة المضافة
            </motion.p>

            {/* Annual/Monthly Toggle */}
            <motion.div
              variants={itemVariants}
              className="mb-14 flex items-center justify-center gap-3"
            >
              <span
                className={`text-sm font-semibold ${!isAnnual ? 'text-gray-900' : 'text-gray-400'}`}
              >
                شهري
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative h-7 w-14 rounded-full transition-colors ${isAnnual ? 'bg-emerald-500' : 'bg-gray-300'}`}
              >
                <div
                  className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-all ${isAnnual ? 'start-0.5' : 'start-[calc(100%-1.625rem)]'}`}
                />
              </button>
              <span
                className={`text-sm font-semibold ${isAnnual ? 'text-gray-900' : 'text-gray-400'}`}
              >
                سنوي
              </span>
              {isAnnual && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  شهرين مجاناً
                </span>
              )}
            </motion.div>
          </div>

          {/* Office Plans Header */}
          <motion.div variants={itemVariants} className="mb-6 text-center">
            <h3 className="text-lg font-bold text-gray-800">باقات المكاتب العقارية</h3>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan, i) => {
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const isCustom = price === 'حسب الطلب';
              const isFree = price === '٠';
              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className={`relative rounded-2xl border ${plan.popular ? plan.border + ' ring-2 ring-emerald-500/20' : 'border-gray-200'} bg-white p-6 shadow-sm transition-shadow hover:shadow-lg`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-gradient-to-l from-emerald-500 to-teal-600 px-4 py-1 text-xs font-bold text-white">
                      الأكثر شيوعاً
                    </div>
                  )}
                  <div
                    className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${plan.gradient} px-3 py-1.5 text-xs font-bold text-white`}
                  >
                    {plan.name}
                  </div>
                  <div className="mb-1">
                    {isCustom ? (
                      <span className="text-2xl font-bold">تواصل معنا</span>
                    ) : isFree ? (
                      <span className="text-3xl font-bold">مجاني</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">{price}</span>
                        <span className="mr-1 text-sm text-gray-500">ر.س/شهرياً</span>
                        {isAnnual && plan.annualTotal && (
                          <div className="mt-1 text-xs text-gray-400">
                            {plan.annualTotal} ر.س/سنوياً
                          </div>
                        )}
                        {!isAnnual && plan.annualTotal && (
                          <div className="mt-1 text-xs text-emerald-600">
                            وفّر مع السنوي: {plan.annualTotal} ر.س/سنة
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <p className="mb-4 text-xs text-gray-500">{plan.desc}</p>
                  <div className="mb-4 flex gap-2 text-xs">
                    <span className={`rounded-lg ${plan.bg} px-2 py-1 font-medium`}>
                      {plan.buildings}
                    </span>
                    <span className={`rounded-lg ${plan.bg} px-2 py-1 font-medium`}>
                      {plan.units}
                    </span>
                  </div>
                  <div className="mb-5 flex flex-col gap-2">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <a
                    href="#portals"
                    className={`block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-l from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {isFree ? 'ابدأ مجاناً' : isCustom ? 'تواصل معنا' : 'ابدأ الآن'}
                  </a>
                </motion.div>
              );
            })}
          </div>

          {/* Overage Note */}
          <motion.p variants={itemVariants} className="mt-6 text-center text-xs text-gray-400">
            تجاوزت الحد؟ +٦٠ ر.س/مبنى، +٦ ر.س/وحدة بعد تجاوز الحد
          </motion.p>

          {/* Other Plans */}
          <motion.div variants={itemVariants} className="mt-16">
            <div className="mb-6 text-center">
              <h3 className="text-lg font-bold text-gray-800">باقات أخرى</h3>
              <p className="mt-1 text-sm text-gray-500">
                للملاك المستقلين ومقدمي الخدمات والمستأجرين
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
              {otherPlans.map((plan, i) => {
                const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                const isFree = price === '٠';
                const PlanIcon = plan.icon;
                return (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div
                      className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.gradient}`}
                    >
                      <PlanIcon className="h-5 w-5 text-white" />
                    </div>
                    <div className="mb-1 text-sm font-bold text-gray-800">{plan.name}</div>
                    <div className="mb-2">
                      {isFree ? (
                        <span className="text-xl font-bold text-emerald-600">مجاني</span>
                      ) : (
                        <>
                          <span className="text-xl font-bold">{price}</span>
                          <span className="mr-1 text-xs text-gray-500">ر.س/شهرياً</span>
                        </>
                      )}
                    </div>
                    <p className="mb-2 text-xs text-gray-500">{plan.desc}</p>
                    <div className="rounded-lg bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                      {plan.limit}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ─── 15. Market Opportunity ─── */}
      <Section className="bg-gradient-to-b from-emerald-50/50 to-white" id="market">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-teal-100 px-4 py-1.5 text-sm font-semibold text-teal-700">
                فرصة السوق
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              ليش الآن؟ لأن السوق جاهز.
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-2xl text-gray-500">
              رؤية ٢٠٣٠ تدفع التحول الرقمي في العقار. إيجار إلزامي، سداد إلزامي، ملّاك للاتحادات —
              البنية التحتية النظامية جاهزة. اللي ناقص هو طبقة التشغيل.
            </motion.p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                value: 12.58,
                suffix: 'B$',
                label: 'حجم سوق إدارة العقارات ٢٠٢٤',
                sub: 'متوقع يوصل ١٩.٩٤ مليار بحلول ٢٠٣٠',
              },
              {
                value: 891,
                suffix: 'M$',
                label: 'سوق التقنية العقارية السعودي',
                sub: 'متوقع يوصل ٢.٥ مليار بحلول ٢٠٣٢',
              },
              {
                value: 16,
                suffix: '٪',
                label: 'معدل النمو السنوي',
                sub: 'CAGR لسوق التقنية العقارية, من الأسرع عالمياً',
              },
              {
                value: 15810,
                suffix: '',
                label: 'اتحاد ملاك مسجل',
                sub: '٣١٪ منها غير نشطة — فجوة ضخمة',
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
              >
                <div className="mb-2 bg-gradient-to-l from-emerald-500 to-teal-600 bg-clip-text text-3xl font-bold text-transparent">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mb-1 text-sm font-bold text-gray-800">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ─── 16. FAQ ─── */}
      <Section id="faq">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-700">
                أسئلة شائعة
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-14 text-3xl font-bold sm:text-4xl">
              عندك سؤال؟
            </motion.h2>
          </div>

          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {faqData.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ─── 17. CTA ─── */}
      <Section className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          className="text-center"
        >
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">جاهز تنهي فوضى الصيانة؟</h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
            ابدأ مجاناً مع مبنى و ١٠ وحدات — بدون بطاقة ائتمان. شوف الفرق في أول أسبوع.
          </p>
          <a
            href="#portals"
            className="mb-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-emerald-700 shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            ابدأ الآن مجاناً
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-white/70">
            {[
              'مبني على النظام السعودي',
              'إشعارات واتساب',
              'متوافق مع إيجار وملّاك',
              'بدون بطاقة ائتمان',
              'دعم عربي كامل',
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 backdrop-blur"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ─── 18. Portal Section ─── */}
      <Section id="portals">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="text-center">
            <motion.div variants={itemVariants}>
              <span className="mb-4 inline-block rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
                تجربة المنصة
              </span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="mb-4 text-3xl font-bold sm:text-4xl">
              اختر دورك وابدأ
            </motion.h2>
            <motion.p variants={itemVariants} className="mx-auto mb-14 max-w-xl text-gray-500">
              كل طرف في المبنى له بوابته الخاصة. اختر دورك وشوف تجربتك.
            </motion.p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {portals.map((portal) => {
              const Icon = portal.icon;
              return (
                <motion.div key={portal.href} variants={itemVariants}>
                  <Link href={portal.href}>
                    <motion.div
                      whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors sm:p-8"
                    >
                      <div
                        className={`absolute end-0 start-0 top-0 h-1.5 bg-gradient-to-l ${portal.gradient}`}
                      />
                      <div
                        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${portal.bg} transition-transform group-hover:scale-110`}
                      >
                        <Icon className={`h-7 w-7 ${portal.iconColor}`} />
                      </div>
                      <h3 className="mb-1 text-xl font-bold">{portal.label}</h3>
                      <p className="text-sm text-gray-500">{portal.sublabel}</p>
                      <div className="absolute bottom-6 start-6 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 opacity-0 transition-opacity group-hover:opacity-100 sm:bottom-8 sm:start-8">
                        <ArrowLeft className="h-4 w-4" />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </Section>

      {/* ─── 19. Footer ─── */}
      <footer className="border-t border-gray-200 bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Sprout className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">فسيل</span>
              </div>
              <p className="mb-4 text-sm leading-relaxed text-gray-500">
                الطبقة التشغيلية للمبنى — صيانة، تكاليف، إشعارات. مبنية على النظام السعودي ومصممة
                للسوق المحلي.
              </p>
            </div>
            {/* Links */}
            <div>
              <h4 className="mb-4 text-sm font-bold">المنصة</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <a href="#features" className="transition-colors hover:text-gray-700">
                  المميزات
                </a>
                <a href="#how-it-works" className="transition-colors hover:text-gray-700">
                  كيف يعمل
                </a>
                <a href="#pricing" className="transition-colors hover:text-gray-700">
                  التسعير
                </a>
                <a href="#cost-router" className="transition-colors hover:text-gray-700">
                  محرك التكاليف
                </a>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold">البوابات</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <Link href="/office/dashboard" className="transition-colors hover:text-gray-700">
                  مكتب عقاري
                </Link>
                <Link href="/tenant/dashboard" className="transition-colors hover:text-gray-700">
                  مستأجر
                </Link>
                <Link href="/owner/dashboard" className="transition-colors hover:text-gray-700">
                  مالك
                </Link>
                <Link href="/provider/dashboard" className="transition-colors hover:text-gray-700">
                  مقدم خدمة
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-bold">تواصل معنا</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <a
                  href="mailto:hello@faseel.sa"
                  className="flex items-center gap-2 transition-colors hover:text-gray-700"
                >
                  <Mail className="h-4 w-4" /> hello@faseel.sa
                </a>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> جدة، المملكة العربية السعودية
                </span>
              </div>
            </div>
          </div>
          {/* Bottom */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 sm:flex-row">
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span className="cursor-pointer hover:text-gray-700">سياسة الخصوصية</span>
              <span className="cursor-pointer hover:text-gray-700">الشروط والأحكام</span>
            </div>
            <p className="text-xs text-gray-400">صُنع بـ ❤️ في جدة — ٢٠٢٦</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
