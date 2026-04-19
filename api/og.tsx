/* @jsxImportSource react */
import { unstable_createNodejsStream } from '@vercel/og';

const GOLD = '#E7C16A';
const GOLD_DIM = '#B98E3B';
const GOLD_DEEP = '#7A5D1D';
const CREAM = '#F5EDE0';
const FELT_0 = '#0F2419';
const FELT_1 = '#152E22';
const TEXT_DIM = '#B8AC94';
const NEON_RED = '#E26560';
const NEON_GREEN = '#6FC48B';

async function loadFont(family: string, weight: number, text: string): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}&display=swap`;
  // Google Fonts returns different formats (woff2 / woff / truetype) depending
  // on the User-Agent. We want truetype/opentype for satori. Linux UA reliably
  // returns truetype; Chrome Mac returns woff2.
  // Simple User-Agent makes Google Fonts fall back to TTF (satori requires TTF/OTF, not WOFF/WOFF2).
  const cssRes = await fetch(cssUrl, {
    headers: { 'User-Agent': 'Node.js' },
  });
  if (!cssRes.ok) throw new Error(`Failed to fetch Google Fonts CSS for ${family} ${weight}: ${cssRes.status}`);
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) throw new Error(`Font URL not found in CSS for ${family} ${weight}: ${css.slice(0, 200)}`);
  const fontUrl = match[1].replace(/['"]/g, '');
  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) throw new Error(`Failed to fetch font for ${family} ${weight}: ${fontRes.status}`);
  return await fontRes.arrayBuffer();
}

export default async function handler(req: any, res: any): Promise<void> {
  console.log('[og] handler entry', req.url);
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const p = url.searchParams;

    const name = (p.get('name') || '').slice(0, 32) || 'あなた';
    const amount = parseInt(p.get('amount') || '0', 10) || 0;
    const expected = parseInt(p.get('expected') || '0', 10) || 0;
    const strategy = (p.get('strategy') || 'stable').toLowerCase();
    const seed = (p.get('seed') || '').slice(0, 12);
    const tier = (p.get('tier') || 'neutral').toLowerCase();
    const hueRaw = parseInt(p.get('hue') || '85', 10);
    const hue = Number.isFinite(hueRaw) ? ((hueRaw % 360) + 360) % 360 : 85;
    const verse = (p.get('verse') || '').slice(0, 64);

    const STRATEGY_JA: Record<string, string> = {
      stable: '安定志向',
      gambler: '一発屋',
      chaos: '運任せ',
      risk: 'リスク志向',
      fortune: '富裕志向',
    };
    const TIER_LABEL: Record<string, string> = {
      miracle: 'MIRACLE',
      blessed: 'BLESSED',
      neutral: 'NEUTRAL',
      pain: 'PAIN',
      doom: 'DOOM',
    };
    const DEFAULT_VERSE: Record<string, string> = {
      miracle: 'ほぼ無料。神に愛されし者。',
      blessed: 'つつましい勝利、されど勝利。',
      neutral: '可もなく不可もなく、粛々と。',
      pain: 'ちょっと痛い。だが耐えられぬほどではない。',
      doom: 'あなたの献身で会は成り立ちました。',
    };

    const tierLabel = TIER_LABEL[tier] || 'NEUTRAL';
    const strategyJa = STRATEGY_JA[strategy] || strategy;
    const strategyEn = strategy.toUpperCase();
    const subtitle = verse || DEFAULT_VERSE[tier] || '可もなく不可もなく、粛々と。';

    const amountStr = amount.toLocaleString('en-US');
    const expectedStr = '¥' + expected.toLocaleString('en-US');
    const delta = amount - expected;
    const deltaStr = (delta >= 0 ? '+' : '') + delta.toLocaleString('en-US');
    const deltaColor = delta >= 0 ? NEON_RED : NEON_GREEN;

    const accent = `hsl(${hue}, 60%, 65%)`;
    const accentSoft = `hsla(${hue}, 60%, 65%, 0.15)`;

    const jpText =
      '大人のビッくらポン相場—SETTLEMENT·EXPECTEDDELTASEED' +
      name +
      strategyJa +
      tierLabel +
      strategyEn +
      subtitle +
      '¥' +
      amountStr +
      expectedStr +
      deltaStr +
      seed;

    const [fontSans500, fontSans700, fontSerif700] = await Promise.all([
      loadFont('Noto Sans JP', 500, jpText),
      loadFont('Noto Sans JP', 700, jpText),
      loadFont('Noto Serif JP', 700, jpText),
    ]);

    const stream = await unstable_createNodejsStream(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `radial-gradient(circle at 50% 40%, hsl(${hue}, 25%, 22%) 0%, ${FELT_1} 55%, ${FELT_0} 100%)`,
            fontFamily: 'NotoSans',
            color: CREAM,
            position: 'relative',
            padding: '40px 60px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 28,
              left: 28,
              right: 28,
              bottom: 28,
              border: `1.5px solid ${GOLD_DEEP}`,
              borderRadius: 10,
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 38,
              left: 38,
              right: 38,
              bottom: 38,
              border: `0.5px solid ${GOLD_DEEP}`,
              borderRadius: 8,
              opacity: 0.6,
              display: 'flex',
            }}
          />

          <div
            style={{
              fontFamily: 'NotoSerif',
              fontSize: 28,
              letterSpacing: '0.35em',
              color: GOLD,
              opacity: 0.92,
              marginBottom: 6,
            }}
          >
            大 人 の ビ ッ く ら ポ ン
          </div>
          <div style={{ width: 280, height: 1, background: GOLD_DIM, opacity: 0.5, marginBottom: 18 }} />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 28px',
              borderRadius: 999,
              border: `1px solid ${accent}`,
              background: accentSoft,
              fontFamily: 'NotoSerif',
              fontSize: 22,
              letterSpacing: '0.28em',
              color: accent,
              marginBottom: 22,
            }}
          >
            {`相場 — ${tierLabel} · ${strategyEn}`}
          </div>

          <div
            style={{
              fontFamily: 'NotoSerif',
              fontSize: 36,
              fontWeight: 700,
              color: CREAM,
              marginBottom: 2,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 13,
              letterSpacing: '0.4em',
              color: TEXT_DIM,
              marginBottom: 18,
            }}
          >
            {`SETTLEMENT  ·  ${strategyJa}`}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              fontFamily: 'NotoSerif',
              fontWeight: 700,
              color: CREAM,
              marginBottom: 24,
            }}
          >
            <span style={{ color: GOLD, fontSize: 80, lineHeight: 1, marginRight: 6 }}>¥</span>
            <span style={{ fontSize: 148, lineHeight: 1 }}>{amountStr}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', width: 880, marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 260 }}>
              <div style={{ fontSize: 13, letterSpacing: '0.35em', color: GOLD_DIM }}>EXPECTED</div>
              <div style={{ fontFamily: 'NotoSerif', fontSize: 32, color: CREAM, marginTop: 4 }}>{expectedStr}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 260 }}>
              <div style={{ fontSize: 13, letterSpacing: '0.35em', color: GOLD_DIM }}>DELTA</div>
              <div style={{ fontFamily: 'NotoSerif', fontSize: 32, color: deltaColor, marginTop: 4 }}>{deltaStr}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 260 }}>
              <div style={{ fontSize: 13, letterSpacing: '0.35em', color: GOLD_DIM }}>SEED</div>
              <div style={{ fontSize: 26, color: GOLD, marginTop: 4, letterSpacing: '0.1em' }}>{seed || '--------'}</div>
            </div>
          </div>

          <div
            style={{
              fontFamily: 'NotoSerif',
              fontStyle: 'italic',
              fontSize: 18,
              color: TEXT_DIM,
              marginTop: 6,
            }}
          >
            {subtitle}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'NotoSans', data: fontSans500, style: 'normal', weight: 500 },
          { name: 'NotoSans', data: fontSans700, style: 'normal', weight: 700 },
          { name: 'NotoSerif', data: fontSerif700, style: 'normal', weight: 700 },
        ],
      }
    );

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=31536000, stale-while-revalidate=86400');
    res.statusCode = 200;
    stream.pipe(res);
  } catch (err) {
    console.error('OG generation failed', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`OG generation failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
