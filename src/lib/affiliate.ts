// Exact destinations only. LinkPrice short URLs: owner A100703639 in saved 2026-11-02 redirect receipts.
// Long URLs: owner checked 2026-11-04. Trip.com and GamsGo: user-supplied / owner dashboard.
// New or changed URLs remain blocked until ownership is verified and this registry is updated.
const verifiedAffiliateUrls = new Set([
  "http://app.ac/0AGz5W523",
  "http://app.ac/1AGAWJ543",
  "http://app.ac/1tVEwHM63",
  "http://app.ac/63MI6PJ53",
  "http://app.ac/6tVtKdM13",
  "http://app.ac/7ECEthS43",
  "http://app.ac/8AGHxa533",
  "http://app.ac/8AGzzP533",
  "http://app.ac/8ECNN5S03",
  "http://app.ac/8tVSHQM43",
  "http://app.ac/CqnQ0J293",
  "http://app.ac/GjwjqSa03",
  "http://app.ac/HECxT0S53",
  "http://app.ac/JEChvZS83",
  "http://app.ac/MqnwNu283",
  "http://app.ac/MtVObZM23",
  "http://app.ac/N3M3AzJ63",
  "http://app.ac/OtV2tAM23",
  "http://app.ac/OtVObZM03",
  "http://app.ac/Rjwjqda23",
  "http://app.ac/SAGH3Z533",
  "http://app.ac/VEMqFTS13",
  "http://app.ac/VbwKCIl53",
  "http://app.ac/WtVCG8M03",
  "http://app.ac/YECEt0S33",
  "http://app.ac/aECEtUS23",
  "http://app.ac/bECEt7S13",
  "http://app.ac/ctGrdHM73",
  "http://app.ac/gqnwyu253",
  "http://app.ac/htVtKhM53",
  "http://app.ac/iAGAWH593",
  "http://app.ac/j36qrMJ93",
  "http://app.ac/kbp2UNl23",
  "http://app.ac/mjwjq4a33",
  "http://app.ac/oqVr9v233",
  "http://app.ac/oqnq8h233",
  "http://app.ac/qEMl6CS43",
  "http://app.ac/qjwzata23",
  "http://app.ac/qtVyE4M23",
  "http://app.ac/rbp6znl53",
  "http://app.ac/rbpHE1l53",
  "http://app.ac/rqnHXf283",
  "http://app.ac/tqnaOA273",
  "http://app.ac/vECHwCS73",
  "http://app.ac/xtnq6XM23",
  "http://app.ac/ytV2bvM03",
  "https://bestmore.net/click.php?m=agoda&a=A100703639&l=0000",
  "https://bestmore.net/click.php?m=dosirak1&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fdosirakesim.com",
  "https://bestmore.net/click.php?m=gmarket&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=http%3A%2F%2Fwww.gmarket.co.kr",
  "https://bestmore.net/click.php?m=iherb&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=http%3A%2F%2Fkr.iherb.com",
  "https://bestmore.net/click.php?m=lenovo&a=A100703639&l=9999&tu=https%3A%2F%2Fwww.lenovo.com%2Fkr%2Fko%2Fpc",
  "https://bestmore.net/click.php?m=lgecom&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.lge.co.kr%2F",
  "https://bestmore.net/click.php?m=nordvpn2&a=A100703639&l=0000",
  "https://bestmore.net/click.php?m=rakutentr&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Ftravel.rakuten.com",
  "https://bestmore.net/click.php?m=shockzkr&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fshokz.co.kr%2Fshop%2Fopendotsone",
  "https://bestmore.net/click.php?m=traveloka&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.traveloka.com%2Fko-kr",
  "https://click.linkprice.com/click.php?m=clubclio&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fclubclio.co.kr%2Fevent%2FeventDetail%2F457",
  "https://click.linkprice.com/click.php?m=lotteon&a=A100703639&l=9999&l_cd1=D&l_cd2=H&tu=https%3A%2F%2Fwww.lotteon.com%2Fp%2Fproduct%2FLE1220884722",
  "https://click.linkprice.com/click.php?m=shockzkr&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fshokz.co.kr%2Fpages%2Fair-series-preheat",
  "https://click.linkprice.com/click.php?m=usimsa&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.usimsa.com%2F",
  "https://lase.kr/click.php?m=072com&a=A100703639&l=0000",
  "https://lase.kr/click.php?m=expedia&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.expedia.co.kr%2Flp%2Fb%2Flinkprice",
  "https://lase.kr/click.php?m=expedia&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.expedia.co.kr%2Flp%2Flinkprice",
  "https://lase.kr/click.php?m=hotelskr&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fkr.hotels.com%2Flp%2Fb%2Flinkprice",
  "https://lase.kr/click.php?m=hotelskr&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fkr.hotels.com%2Flp%2Fb%2Fsummer26lp",
  "https://lase.kr/click.php?m=klook&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.klook.com%2Fko%2F%3Fspm%3DTetris_Promo.TopNavigation.BackHome%26clickId%3D4afe9d9301",
  "https://lase.kr/click.php?m=klook&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.klook.com%2Fko%2F%3Fspm%3DTetris_Promo.TopNavigation.BackHome%26clickId%3Dd4a7d0e28d",
  "https://lase.kr/click.php?m=klook&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.klook.com%2Fko%2Fdestination%2Fco1012-japan%2F",
  "https://lase.kr/click.php?m=shockzkr&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fshokz.co.kr%2Fshop%2Fopenfit2plus",
  "https://lase.kr/click.php?m=socar&a=A100703639&l=0000",
  "https://lase.kr/click.php?m=toyotarent&a=A100703639&l=0000",
  "https://linkmoa.kr/click.php?m=agoda&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=http%3A%2F%2Fwww.agoda.com%2Fko-kr%2Fpartners%2Fpartnersearch.aspx",
  "https://linkmoa.kr/click.php?m=babybjorn&a=A100703639&l=0000",
  "https://linkmoa.kr/click.php?m=gocity&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fgocity.com%2Fko",
  "https://linkmoa.kr/click.php?m=hcombine2&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.hotelscombined.co.kr",
  "https://linkmoa.kr/click.php?m=smk&a=A100703639&l=0000",
  "https://linkmoa.kr/click.php?m=traveloka&a=A100703639&l=0000",
  "https://linkmoa.kr/click.php?m=usimsa&a=A100703639&l=0000",
  "https://linkmoa.kr/click.php?m=wconcept&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=http%3A%2F%2Fwww.wconcept.co.kr",
  "https://lpweb.kr/click.php?m=11st&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.11st.co.kr%2Fmain",
  "https://lpweb.kr/click.php?m=auction&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=http%3A%2F%2Fwww.auction.co.kr",
  "https://lpweb.kr/click.php?m=halfclub1&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.halfclub.com",
  "https://lpweb.kr/click.php?m=himart&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.e-himart.co.kr%2Fapp%2Fdisplay%2Fmain%3Ftab%3D10015128",
  "https://lpweb.kr/click.php?m=klook&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.klook.com%2Fko%2Ftetris%2Fpromo%2Flinkprice%2F",
  "https://lpweb.kr/click.php?m=marshall&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.marshallheadphones.com%2F",
  "https://lpweb.kr/click.php?m=re4akor&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fwww.raileurope.com%2F",
  "https://lpweb.kr/click.php?m=surfshark&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fsurfshark.com%2Fko%2Fpricing",
  "https://newtip.net/click.php?m=agoda&a=A100703639&l=0000",
  "https://newtip.net/click.php?m=dswellife&a=A100703639&l=0000",
  "https://newtip.net/click.php?m=hotelskr&a=A100703639&l=9999&l_cd1=3&l_cd2=0&tu=https%3A%2F%2Fkr.hotels.com%2Flp%2Fb%2Fsummer26lp",
  "https://newtip.net/click.php?m=kkday&a=A100703639&l=9999&tu=https%3A%2F%2Fwww.kkday.com%2Fko%2Fproduct%2Fproductlist",
  "https://newtip.net/click.php?m=qtoon&a=A100703639&l=0000",
  "https://newtip.net/click.php?m=refurlab&a=A100703639&l=0000",
  "https://www.gamsgo.com/accounts/claude/partner/rQT9a",
  "https://www.gamsgo.com/accounts/netflix/partner/rQT9a",
  "https://www.gamsgo.com/details/adobe1/partner/rQT9a",
  "https://www.gamsgo.com/details/cannva/partner/rQT9a",
  "https://www.gamsgo.com/details/capcut/partner/rQT9a",
  "https://www.gamsgo.com/details/chatgpt/partner/rQT9a",
  "https://www.gamsgo.com/details/disneyplus/partner/rQT9a",
  "https://www.gamsgo.com/details/duolingo/partner/rQT9a",
  "https://www.gamsgo.com/details/gemini/partner/rQT9a",
  "https://www.gamsgo.com/details/genspark/partner/rQT9a",
  "https://www.gamsgo.com/details/midjourney_official/partner/rQT9a",
  "https://www.gamsgo.com/details/spotify/partner/rQT9a",
  "https://www.gamsgo.com/details/suno/partner/rQT9a",
  "https://www.gamsgo.com/details/tving/partner/rQT9a",
  "https://www.gamsgo.com/details/youtube/partner/rQT9a",
  "https://www.gamsgo.com/partner/rQT9a",
  "https://www.trip.com/t/B6KdOPw6vW2"
]);

export function safeAffiliateUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && verifiedAffiliateUrls.has(url.href) ? url.href : null;
    } catch { return null; }
}

export function hasCouponCode(code?: string | null) {
    return !!code?.trim() && !['NO_CODE_REQUIRED', '없음', '코드 필요없음'].includes(code.trim()) && !/자동\s*적용|코드\s*(불필요|필요\s*없음)|본문\s*참고|금액별\s*상이/.test(code);
}

/** Internal navigation is allowed; unknown external references remain plain text. */
export function safeNavigationUrl(value: unknown): string | null {
    if (typeof value !== 'string' || /[\\\u0000-\u0020\u007f]/.test(value)) return null;
    try {
        const url = new URL(value, 'https://coupontalk.kr');
        if (url.origin === 'https://coupontalk.kr' && !url.username && !url.password) return url.pathname + url.search + url.hash;
        return safeAffiliateUrl(value);
    } catch { return null; }
}
