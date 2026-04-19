import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: '大人のビッくらポン',
  description: '飲み会の運命を賽に委ねる',
  metadataBase: new URL('https://otonano-biglucky-pop.vercel.app'),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, background: '#0F2419', color: '#F5EDE0', fontFamily: '-apple-system, "Noto Sans JP", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
