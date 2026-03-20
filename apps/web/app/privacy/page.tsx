import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | فسيل',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="mb-8 text-3xl font-bold">سياسة الخصوصية</h1>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--muted-foreground)]">
          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
              ١. البيانات التي نجمعها
            </h2>
            <p className="mb-3">نقوم بجمع البيانات التالية لتقديم خدماتنا:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>رقم الجوال للتسجيل والتحقق من الهوية</li>
              <li>الاسم والبريد الإلكتروني (اختياري)</li>
              <li>بيانات المباني والوحدات السكنية المسجلة</li>
              <li>طلبات الصيانة والتواصل بين الأطراف</li>
              <li>بيانات الاستخدام لتحسين تجربة المنصة</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
              ٢. كيف نستخدم بياناتك
            </h2>
            <ul className="list-inside list-disc space-y-2">
              <li>تقديم خدمات إدارة المباني والصيانة</li>
              <li>إرسال إشعارات متعلقة بطلبات الصيانة والتحديثات</li>
              <li>تحسين وتطوير خدمات المنصة</li>
              <li>التواصل معك بشأن حسابك والخدمات المقدمة</li>
              <li>الامتثال للمتطلبات النظامية في المملكة العربية السعودية</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">٣. حماية البيانات</h2>
            <p>
              نلتزم بحماية بياناتك الشخصية باستخدام تقنيات التشفير والإجراءات الأمنية المناسبة. نحرص
              على عدم مشاركة بياناتك مع أطراف خارجية إلا بموافقتك أو عند الضرورة القانونية.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">٤. مشاركة البيانات</h2>
            <p>
              لا نبيع بياناتك الشخصية لأي طرف ثالث. قد نشارك بياناتك مع الأطراف المعنية في عملية
              إدارة المبنى (مثل المكتب العقاري، مقدم الخدمة) بالقدر اللازم لتنفيذ الخدمات المطلوبة.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">٥. حقوقك</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>طلب الوصول إلى بياناتك الشخصية</li>
              <li>طلب تصحيح أو تحديث بياناتك</li>
              <li>طلب حذف حسابك وبياناتك</li>
              <li>الاعتراض على معالجة بياناتك</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">
              ٦. ملفات تعريف الارتباط
            </h2>
            <p>
              نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربة الاستخدام وتحليل أداء المنصة. يمكنك
              التحكم في إعدادات ملفات تعريف الارتباط من خلال متصفحك.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">٧. تحديث السياسة</h2>
            <p>
              قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإخطارك بأي تغييرات جوهرية عبر المنصة
              أو البريد الإلكتروني.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold text-[var(--foreground)]">٨. التواصل</h2>
            <p>
              لأي استفسارات تتعلق بخصوصية بياناتك، يمكنك التواصل معنا عبر:{' '}
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
