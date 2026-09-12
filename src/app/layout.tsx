import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme-context';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: 'SS Multi-Brand Commerce & Service Platform | Coimbatore',
  description: 'Unified commercial and service hub for SS Aquarium, Kirubai Cloud Kitchen, and SS Vision 360 in Coimbatore.',
  keywords: ['SS Aquarium', 'Kirubai Cloud Kitchen', 'SS Vision 360', 'Coimbatore services', 'Aquarium Coimbatore', 'CCTV installation Coimbatore'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('ss_theme_mode');if(m==='dark'){document.documentElement.classList.add('dark');document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.classList.add('light');document.documentElement.setAttribute('data-theme','light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--color-bg-default)] text-[var(--color-text-default)] font-sans antialiased flex flex-col selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
