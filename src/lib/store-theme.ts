// Shared layout, merchant-specific accents. Unmapped brands use a neutral palette.
const accents: Record<string, string> = {
  aliexpress: '#c92135', shokz: '#bf4400', agoda: '#3755ad', tripcom: '#1762cf',
  klook: '#b8410c', kkday: '#087c81', expedia: '#172b68', hotelskr: '#a51c30',
  hcombine2: '#08759c', myrealtrip: '#1474b8', traveloka: '#077fa0', rakutentr: '#a90000',
  '야놀자-nol': '#9e2165', jejupass: '#b74600', gocity: '#097157', re4akor: '#bb241e',
  airalo: '#ad3b4e', dosirak1: '#b94300', usimsa: '#215bd7', toyotarent: '#b51d2a',
  ttangcheori: '#aa3517', coupang: '#a83e13', gmarket: '#08784c', auction: '#b12830',
  '11st': '#c42346', '롯데온': '#b51938', emart: '#876000', gseshop: '#22623d',
  hmall: '#08776c', woori: '#ac183b', nsseshop: '#a52a35', ssglive: '#71447e',
  gongyoung: '#a42677', iherb: '#43771b', daesang: '#316539', pulmuone: '#39781f',
  cjbrand: '#a23f14', momq: '#763ba3', '베이비뵨': '#273b40', boribori: '#a53466',
  lenovo: '#c02623', lgecom: '#a50034', marshall: '#3b3429', himart: '#b72330',
  arket: '#343434', stories: '#38342e', farfetch: '#252525', hbx: '#252525',
  antonioli: '#242424', charlesnk: '#292929', joseph: '#383632', operandi: '#303030',
  stockx: '#08754a', macys: '#b51f29', finishline: '#086e9b', ashford1: '#7b332f',
  benetton1: '#087b47', hfashion: '#292929', halfclub1: '#a9212c', posty: '#7131a1',
  wconcept: '#242424', smk: '#b82430', clubclio: '#a82651', naturerepublic: '#48762a',
  kbbook: '#255542', yes24: '#155694', ypbooks: '#166c49', udemy: '#7028b9',
  qtoon: '#8433b3', mootoon: '#b52b25', socar: '#087ba0', soomgo: '#007b68',
  tstation: '#a7470b', snaps: '#ac2341', newper: '#9b293d', thirtymall: '#a94710',
  eyoumall: '#3b6b25', refurlab: '#235e8b', cappstory: '#285b8b', lensbank: '#236e83',
  allcredit: '#2258a6', mycredit1: '#275ca0', signgate: '#27599c', barobill: '#225da2',
  '60saju': '#694572', nordvpn2: '#3154b9', exvpn: '#ad2227', surfshark: '#087f83',
  fanatical: '#a34800', woot: '#576d24',
};

export function storeTheme(id: string) {
  const accent = accents[id] || '#334155';
  return { '--store-accent': accent, '--store-soft': `${accent}0d`, '--store-ink': accent };
}
