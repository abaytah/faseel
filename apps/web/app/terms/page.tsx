import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الشروط والأحكام | فسيل',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold">الشروط والأحكام</h1>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--muted-foreground)]">
          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">١. مقدمة</h2>
            <p>
              مرحباً بك في منصة فسيل لإدارة المباني. باستخدامك لهذه المنصة، فإنك توافق على الالتزام
              بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام خدماتنا.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">٢. استخدام الخدمة</h2>
            <p>
              توفر منصة فسيل أدوات لإدارة المباني والوحدات السكنية، بما في ذلك إدارة طلبات الصيانة،
              التواصل بين الأطراف، وتتبع العمليات التشغيلية. يلتزم المستخدم باستخدام المنصة للأغراض
              المشروعة فقط ووفقاً للأنظمة المعمول بها في المملكة العربية السعودية.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
              ٣. حسابات المستخدمين
            </h2>
            <p>
              أنت مسؤول عن الحفاظ على سرية بيانات حسابك وعن جميع الأنشطة التي تتم من خلاله. يجب عليك
              إخطارنا فوراً في حال اكتشاف أي استخدام غير مصرح به لحسابك.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">٤. توفر الخدمة</h2>
            <p>
              نسعى لتوفير خدمة مستقرة ومتاحة على مدار الساعة، لكننا لا نضمن عدم انقطاع الخدمة أو
              خلوها من الأخطاء. قد نقوم بإجراء صيانة دورية تؤدي إلى توقف مؤقت في الخدمة.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
              ٥. مسؤوليات المستخدم
            </h2>
            <ul className="list-inside list-disc space-y-2">
              <li>تقديم معلومات صحيحة ودقيقة عند التسجيل</li>
              <li>عدم استخدام المنصة لأي أغراض غير قانونية</li>
              <li>احترام خصوصية المستخدمين الآخرين</li>
              <li>عدم محاولة الوصول غير المصرح به إلى أنظمة المنصة</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">٦. الملكية الفكرية</h2>
            <p>
              جميع المحتويات والتصاميم والعلامات التجارية المعروضة على المنصة هي ملك لشركة فسيل أو
              مرخصة لها. لا يجوز نسخها أو توزيعها أو استخدامها دون إذن مسبق.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">٧. تعديل الشروط</h2>
            <p>
              نحتفظ بحق تعديل هذه الشروط في أي وقت. سيتم إخطار المستخدمين بأي تغييرات جوهرية.
              استمرارك في استخدام المنصة بعد التعديل يعني موافقتك على الشروط المحدثة.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">٨. التواصل</h2>
            <p>
              للاستفسارات حول هذه الشروط، يمكنك التواصل معنا عبر البريد الإلكتروني:{' '}
              <a href="mailto:ara@basamh.com" className="text-brand-500 hover:underline">
                ara@basamh.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-[var(--border)] pt-8">
          <Link href="/" className="text-brand-500 text-sm font-medium hover:underline">
            ← العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
