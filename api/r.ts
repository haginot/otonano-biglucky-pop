export const config = { runtime: 'edge' };

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function handler(req: Request): Response {
  const u = new URL(req.url);
  const p = u.searchParams;

  const name = (p.get('name') || '').slice(0, 40);
  const amountRaw = parseInt(p.get('amount') || '0', 10);
  const amount = Number.isFinite(amountRaw) ? amountRaw : 0;
  const expected = parseInt(p.get('expected') || '0', 10) || 0;
  const strategy = (p.get('strategy') || 'stable').slice(0, 20);
  const people = parseInt(p.get('people') || '6', 10) || 6;
  const deltaSign = amount - expected;
  const deltaStr = (deltaSign >= 0 ? '+' : '') + deltaSign.toLocaleString('en-US');
  const amountStr = '¥' + amount.toLocaleString('en-US');

  const origin = `${u.protocol}//${u.host}`;
  const ogParams = new URLSearchParams({
    name,
    amount: String(amount),
    expected: String(expected),
    strategy,
    seed: p.get('seed') || '',
    tier: p.get('tier') || '',
    hue: p.get('hue') || '',
    verse: p.get('verse') || '',
  });
  const ogImageUrl = `${origin}/og.png?${ogParams.toString()}`;

  const forwardParams = new URLSearchParams({
    expected: String(expected),
    people: String(people),
    strategy,
    name,
    result: '1',
  });
  const gameUrl = `${origin}/?${forwardParams.toString()}`;

  const title = `${name || 'あなた'} の清算: ${amountStr}（${deltaStr}）`;
  const desc = `大人のビッくらポン — 相場: ${strategy.toUpperCase()} / 期待値 ¥${expected.toLocaleString('en-US')} / 差分 ${deltaStr}`;

  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${esc(u.toString())}" />
<meta property="og:image" content="${esc(ogImageUrl)}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:alt" content="${esc(title)}" />
<meta property="og:site_name" content="大人のビッくらポン" />
<meta property="og:locale" content="ja_JP" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(ogImageUrl)}" />
<style>
  html,body{margin:0;padding:0;background:#0F2419;color:#F5EDE0;font-family:-apple-system,"Noto Sans JP",sans-serif;}
  .wrap{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:24px;text-align:center;}
  .amount{font-size:64px;font-weight:700;color:#E7C16A;}
  a.cta{display:inline-block;padding:14px 28px;border-radius:8px;background:#E7C16A;color:#0F2419;text-decoration:none;font-weight:600;}
  .sub{opacity:0.7;font-size:14px;}
</style>
</head>
<body>
<div class="wrap">
  <div class="sub">${esc(name || 'あなた')} の清算</div>
  <div class="amount">${esc(amountStr)}</div>
  <div class="sub">${esc(strategy.toUpperCase())} / 期待値 ¥${expected.toLocaleString('en-US')} / ${esc(deltaStr)}</div>
  <a class="cta" href="${esc(gameUrl)}">プレイに戻る →</a>
</div>
<script>setTimeout(function(){ location.replace(${JSON.stringify(gameUrl)}); }, 800);</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=60',
    },
  });
}
