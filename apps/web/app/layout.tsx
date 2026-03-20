import type { Metadata } from 'next';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'فسيل | منصة إدارة المباني',
  description: 'منصة متكاملة لإدارة المباني وعمليات الصيانة في المملكة العربية السعودية',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${ibmPlexSansArabic.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
