import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

type SP = Record<string, string | string[] | undefined>;
type Props = { searchParams: Promise<SP> };

function one(v: string | string[] | undefined, fallback = ''): string {
  if (Array.isArray(v)) return v[0] ?? fallback;
  return v ?? fallback;
}

function buildOgPath(p: SP): string {
  const q = new URLSearchParams();
  (['name', 'amount', 'expected', 'strategy', 'seed', 'tier', 'hue', 'verse'] as const).forEach((k) => {
    const v = one(p[k]);
    if (v) q.set(k, v);
  });
  return `/og?${q.toString()}`;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = await searchParams;
  const name = one(p.name, 'あなた').slice(0, 32);
  const amount = parseInt(one(p.amount, '0'), 10) || 0;
  const expected = parseInt(one(p.expected, '0'), 10) || 0;
  const strategy = one(p.strategy, 'stable').toUpperCase();
  const delta = amount - expected;
  const deltaStr = (delta >= 0 ? '+' : '') + delta.toLocaleString('en-US');
  const amountStr = '¥' + amount.toLocaleString('en-US');

  const title = `${name} の清算: ${amountStr}（${deltaStr}）`;
  const desc = `大人のビッくらポン — 相場: ${strategy} / 期待値 ¥${expected.toLocaleString('en-US')} / 差分 ${deltaStr}`;
  const ogUrl = buildOgPath(p);

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'website',
      locale: 'ja_JP',
      siteName: '大人のビッくらポン',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [ogUrl],
    },
  };
}

function isValidPayPayUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' &&
      (u.hostname === 'qr.paypay.ne.jp' || u.hostname === 'p.paypay.ne.jp');
  } catch {
    return false;
  }
}

export default async function R({ searchParams }: Props) {
  const p = await searchParams;
  const forward = new URLSearchParams();
  (['expected', 'people', 'strategy', 'name'] as const).forEach((k) => {
    const v = one(p[k]);
    if (v) forward.set(k, v);
  });
  const paypay = one(p.paypay);
  if (paypay && isValidPayPayUrl(paypay)) forward.set('paypay', paypay);
  forward.set('result', '1');
  const target = `/?${forward.toString()}`;

  const userAgent = (await (async () => {
    const { headers } = await import('next/headers');
    const h = await headers();
    return h.get('user-agent') || '';
  })()) || '';

  const isCrawler = /bot|crawler|spider|slack|facebook|twitter|linkedin|discord|telegram|whatsapp|embed|preview/i.test(userAgent);
  if (!isCrawler) {
    redirect(target);
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <a href={target} style={{ color: '#E7C16A' }}>プレイに戻る →</a>
    </main>
  );
}
