import fs from 'node:fs/promises';
import sharp from 'sharp';
import { subscriptionPrices, subscriptionPriceCheckedAt, priceDifference, won } from '../src/lib/subscription-prices.ts';

// Native SVG infographic sources: prices come from the same verified data as the page.
// No third-party logos, simulated checkout screens or copied competitor artwork.
const output = new URL('../public/subscription-images/v3/', import.meta.url);
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = (value, x, y, size = 38, color = '#fff', weight = 500) => `<text x="${x}" y="${y}" font-family="Malgun Gothic, Noto Sans CJK KR, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${escape(value)}</text>`;
function lines(value, x, y, max = 34, size = 30, color = '#b9c4d5', lineHeight = 46) {
  const rows = []; let row = '';
  for (const char of value) {
    if (row.length >= max && char !== ' ') { rows.push(row); row = ''; }
    row += char;
  }
  if (row) rows.push(row);
  return rows.map((line, index) => text(line.trim(), x, y + index * lineHeight, size, color)).join('');
}
const panel = (x, y, w, h, fill = '#17202e', radius = 26) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}"/>`;
const themes = {
  'netflix-discount': ['#ef424c','VIDEO'], 'youtube-premium-cheap': ['#ff5e50','VIDEO'],
  'disney-plus-discount': ['#5b9bff','VIDEO'], 'tving-discount': ['#ff597f','VIDEO'],
  'spotify-discount': ['#5fe19c','MUSIC'], 'suno-plans': ['#ffb26b','MUSIC'],
  'chatgpt-discount': ['#5edcc0','AI'], 'claude-discount': ['#efa77d','AI'],
  'gemini-discount': ['#a49bff','AI'], 'genspark-pricing': ['#be9cff','AI'],
  'midjourney-pricing': ['#71c8eb','DESIGN'], 'adobe-discount': ['#ff747b','DESIGN'],
  'capcut-pricing': ['#8ce7ec','EDIT'], 'canva-subscription': ['#63d3de','DESIGN'],
  'duolingo-discount-code': ['#ace963','LEARN'],
};
function shell(q, accent, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#0b1019"/><rect x="72" y="72" width="68" height="9" rx="4" fill="${accent}"/>${text('쿠폰톡 / 구독 가이드',165,91,29,'#d5deeb',600)}${body}<path d="M72 1113H1128" stroke="#344052"/>${text('COUPONTALK',72,1160,26,'#8493a7',700)}${text('독립적인 구독 비교 · 제휴 링크 포함',660,1160,23,'#8493a7')}</svg>`;
}
function cover(q, accent, category) {
  const title = q.service === '유튜브 프리미엄' ? '유튜브' : q.service;
  const subtitle = q.service === '유튜브 프리미엄' ? '프리미엄 싸게' : ['수노','미드저니','젠스파크','캡컷','캔바'].includes(q.service) ? '구독료 비교' : '구독 할인';
  const symbol = category === 'VIDEO' || category === 'EDIT'
    ? `<rect x="820" y="207" width="260" height="184" rx="24" fill="none" stroke="${accent}" stroke-width="10"/><path d="M920 250L995 300L920 349Z" fill="${accent}"/>`
    : category === 'MUSIC' ? [0,1,2,3,4].map((i)=>`<rect x="${835+i*48}" y="${235+[32,0,45,10,32][i]}" width="22" height="${150-[64,0,90,20,64][i]}" rx="11" fill="${accent}"/>`).join('')
    : `<rect x="820" y="210" width="245" height="180" rx="28" fill="none" stroke="${accent}" stroke-width="8"/>${text(category,850,324,58,accent,800)}`;
  return shell(q,accent,`${text(category+' / SUBSCRIPTION',72,180,28,accent,700)}${symbol}${text(title,72,510,title.length>6?114:142,'#fff',900)}${text(subtitle,72,680,112,accent,900)}${text('요금제부터 이용 방법까지',78,772,43,'#cad5e5',600)}${panel(72,840,1056,205)}${text('01  가격',112,911,34,'#fff',700)}${text('02  이용 조건',460,911,34,'#fff',700)}${text('03  시작 방법',830,911,34,'#fff',700)}${text(q.soldOut?'확인 옵션 품절 · 대체 상품 조건 확인':'내게 맞는 구독, 결제 전에 비교하세요',112,990,34,accent,600)}`);
}
function price(q, accent) {
  const difference = q.official ? priceDifference(q.official.total,q.total) : undefined;
  let body = text(q.service+' 가격 비교',72,195,q.service.length>6?60:73,'#fff',800)+text(`${subscriptionPriceCheckedAt} 확인 · ${q.months}개월 기준 · KRW`,76,255,31,'#afbed1');
  if (q.official) {
    body += panel(72,300,500,276)+text('공식 구독 합계',104,357,34,'#b9c4d5',600)+text(won(q.official.total),104,450,67,'#fff',800)+lines(q.official.label,104,511,24,27);
    body += panel(600,300,528,276,'#203447')+text(q.listing?'겜스고 판매 목록가':'겜스고 선택 옵션',632,357,34,accent,600)+text(won(q.total),632,450,76,'#fff',900)+lines(q.plan,632,511,24,27);
    body += text(`${won(difference.amount)} 적게`,76,670,76,accent,900)+text(`${difference.percent}% 낮음 · 동일 권한 상품의 할인율 아님`,78,730,32,'#d8e1ee',600);
  } else {
    body += panel(72,300,1056,276,'#203447')+text(q.soldOut?'품절 · 참고 가격':q.listing?'겜스고 판매 목록가':'겜스고 선택 옵션 결제액',108,365,36,q.soldOut?'#ffcd89':accent,700)+text(won(q.total),108,480,104,'#fff',900)+text(q.plan,110,543,32,'#d8e1ee');
    body += text('공식 상품과 직접 비교하지 않습니다',76,660,44,accent,700)+text('동일 플랜·권한·통화 미확인 → 할인율 미표시',78,725,31,'#d8e1ee');
  }
  body += text(`월 환산 약 ${won(q.total/q.months)} · ${q.months}개월 총액 ${won(q.total)}`,78,795,34,'#fff',700);
  body += lines(q.conditions,78,860,39,27,'#c4cfdd',42);
  body += lines(q.difference,78,978,44,24,'#aab9cd',37);
  return shell(q,accent,body);
}
function how(q, accent) {
  const steps = [
    ['상품 선택',`쿠폰톡 제휴 링크에서 ${q.service} 검색`],
    [q.soldOut?'재고부터 확인':'옵션 확인',q.soldOut?'확인한 옵션은 품절 · 재입고/다른 조건 확인':`${q.months}개월 · ${q.plan}`],
    ['결제액 확인',q.listing?'판매자·보증 기간·최종 결제액 확인':'코드 입력란이 있으면 UXA7C 적용액 비교'],
    ['이용 시작','결제 후 주문 안내에 따라 계정·초대·충전 진행'],
  ];
  return shell(q,accent,text(q.service+' 이용 방법',72,195,q.service.length>6?60:73,'#fff',800)+text('상품 선택부터 이용 시작까지',76,256,32,'#afbed1')+steps.map(([title,detail],i)=>{
    const y=302+i*177;
    return panel(72,y,1056,155)+text(String(i+1).padStart(2,'0'),102,y+81,54,accent,800)+text(title,220,y+56,39,'#fff',800)+lines(detail,220,y+106,34,28,'#c0ccdc',38);
  }).join('')+text('공유형·개인형·충전형은 이용 방식이 다릅니다.',78,1055,29,'#c0ccdc'));
}
await fs.mkdir(output,{recursive:true});
const manifest = [];
for (const [slug,q] of Object.entries(subscriptionPrices)) {
  const [accent,category] = themes[slug];
  for (const [kind,svg] of [['cover',cover(q,accent,category)],['price',price(q,accent)],['how',how(q,accent)]]) {
    await fs.writeFile(new URL(`${slug}-${kind}.svg`,output),svg);
    const name = `${slug}-${kind}.png`;
    await sharp(Buffer.from(svg)).png().toFile(new URL(name,output).pathname.replace(/^\/(\w:)/,'$1'));
    manifest.push({slug,kind,path:`/subscription-images/v3/${name}`,total:q.total,months:q.months,checkedAt:subscriptionPriceCheckedAt});
  }
}
await fs.writeFile(new URL('manifest.json',output),JSON.stringify(manifest,null,2));
console.log(`Generated ${manifest.length} subscription graphics.`);
