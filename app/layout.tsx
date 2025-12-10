import Script from 'next/script';
import type { Metadata } from 'next';
import './globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Image Generator',
  description: 'Generate images securely with server-side AI.',
  applicationName: 'Image Generator',
  keywords: [
    'image compression',
    'image converter',
    'png converter',
    'image duplication',
    'next.js image tools',
    'fast image processing',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Image Generator',
    description: 'Compress, convert, and duplicate images quickly with server-side processing.',
    url: '/',
    siteName: 'Image Generator',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Image Generator App Icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Generator',
    description: 'Compress, convert, and duplicate images quickly with server-side processing.',
    images: ['/icon.png'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}

