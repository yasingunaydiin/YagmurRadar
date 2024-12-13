import { Analytics } from '@vercel/analytics/react';
import 'leaflet/dist/leaflet.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Islanacak mıyım?',
  description: 'Türkiye`nin gerçek zamanlı bulut ve yağmur haritası',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <meta
          name='google-site-verification'
          content='qdci-EoEw4rYKxJZ37SBB455jRY9X5HjlQWLk1-a4y0'
        />
        <link
          rel='stylesheet'
          href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          integrity='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          crossOrigin=''
        />
        <link rel='icon' href='/favicon.ico' />
        <meta
          name='google-site-verification'
          content='-9nXkAChkekC_pznMQROWam11ktW9DrG2Jg6bce4rgI'
        />
      </head>
      <body className={inter.className}>{children}</body>
      <Analytics />
    </html>
  );
}
