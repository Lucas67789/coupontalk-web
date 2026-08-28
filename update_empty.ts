import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
const env: any = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

const storeUpdates = [
    { id: 'mootoon', description: '무협/액션/판타지 웹툰 전문 플랫폼 무툰! 신규 가입 혜택과 매월 업데이트되는 독점 할인코드로 인기 웹툰을 더 저렴하게 감상하세요.' },
    { id: 'qtoon', description: '여성향, 로맨스 판타지, BL 특화 웹툰 플랫폼 큐툰. 쿠폰톡 단독 프로모션 코드를 통해 코인 충전 시 추가 보너스 혜택을 받아보세요.' },
    { id: 'snaps', description: '포토북, 굿즈, 달력 제작 1위 스냅스! 나만의 특별한 굿즈를 만들 때 놓치지 말아야 할 이달의 특가 할인코드와 무료배송 쿠폰을 총정리했습니다.' },
    { id: 'traveloka', description: '항공권부터 호텔, 액티비티까지 한 번에! 트래블로카(Traveloka)에서 동남아시아 여행 준비할 때 꼭 필요한 시크릿 할인쿠폰을 확인하세요.' },
    { id: 'usimsa', description: '해외여행 필수품 eSIM 1위 유심사! 전 세계 어디서든 끊김 없는 데이터를 위한 유심사 20% 특별 할인코드와 구매 팁을 제공합니다.' },
    { id: 'smk', description: '나이키, 아디다스, 뉴발란스 등 인기 브랜드 신발 멀티숍 슈마커. 이번 달 한정 추가 할인코드와 클리어런스 세일 혜택으로 스마트하게 쇼핑하세요.' },
    { id: 'hotelskr', description: '전 세계 수백만 개의 숙소를 최저가로 예약하세요. 호텔스닷컴 쿠폰톡 단독 10% 추가 할인코드와 리워드 혜택으로 더욱 알뜰한 여행을 준비할 수 있습니다.' },
    { id: 'myrealtrip', description: '해외 투어, 패스, 항공권 특가 예약은 마이리얼트립! 이달의 프로모션 코드와 결제일 할인 혜택을 모아 가장 저렴하게 여행을 떠나보세요.' },
    { id: 'clubclio', description: '클리오, 페리페라, 구달 등 인기 뷰티 브랜드 공식몰 클럽클리오. 뷰티템 구매 시 즉시 적용 가능한 장바구니 쿠폰과 꿀조합 세일 정보를 확인하세요.' },
    { id: 'ctrip', description: '중국 및 아시아 여행 전문 글로벌 플랫폼 씨트립(트립닷컴). 항공권과 호텔을 동시에 예약할 때 사용 가능한 특별 프로모션 코드를 제공합니다.' },
    { id: 'expedia', description: '항공권+호텔 에어텔 패키지 예약의 최강자 익스피디아. 매월 새롭게 업데이트되는 익스피디아 단독 쿠폰으로 전 세계 숙소를 특가에 예약하세요.' },
    { id: 'charlesnk', description: '트렌디한 감각의 글로벌 패션 브랜드 찰스앤키스. 가방, 신발, 액세서리 신상 구매 시 적용 가능한 할인쿠폰과 무료배송 혜택을 모았습니다.' },
    { id: '롯데온', description: '백화점 상품부터 마트 장보기까지 롯데온(LOTTE ON)에서 한 번에! 매일 쏟아지는 카드사 할인과 등급별 시크릿 쿠폰 혜택을 모두 확인하세요.' },
    { id: 'aliexpress', description: '해외직구 열풍의 중심 알리익스프레스! 꽁돈대첩, 초이스데이, 메가세일 기간에 꼭 챙겨야 할 결제 할인코드와 프로모션 혜택을 매일 업데이트합니다.' },
    { id: 'coupang', description: '오늘 주문하면 내일 도착하는 로켓배송 쿠팡! 와우 멤버십 전용 시크릿 할인, 반품마켓 특가 등 쿠팡에서 더 알뜰하게 쇼핑하는 숨겨진 팁을 알려드립니다.' },
    { id: '야놀자-nol', description: '국내외 숙소, 레저, 항공권 예약 1위 야놀자! 놀(NOL) 카드 전용 혜택과 선착순 쿠폰 등 여행 떠나기 전 꼭 챙겨야 할 야놀자 할인 정보를 총정리했습니다.' },
    { id: 'klook-test', description: '테마파크, 투어, 교통패스까지 전 세계 여행 액티비티 예약 1위 클룩! 여행 경비를 확 줄여주는 이달의 프로모션 코드와 카드사 결제 할인을 확인하세요.' }
];

const couponUpdates = [
    {
        id: 'ali-2',
        content_body: '알리익스프레스에서 100달러 이상 구매 시 즉시 15달러가 할인되는 프로모션 코드입니다. 결제 단계에서 프로모션 코드를 입력하면 즉시 할인이 적용됩니다. 인기 전자기기나 생활용품 직구 시 활용하기 좋습니다.',
        condition: 'ID당 1회 사용 가능 / 일부 품목 제외 / 선착순 마감'
    },
    {
        id: 'coupang-1',
        content_body: '쿠팡의 멤버십 서비스 `로켓와우`를 아직 이용해보지 않으셨나요? 지금 가입하시면 첫 달(30일) 동안 배송비 무료, 무료 반품, 쿠팡플레이 무료 시청 혜택을 100% 무료로 체험할 수 있습니다.',
        condition: '신규 가입 고객 대상 / 30일 후 자동 결제'
    },
    {
        id: 'coupon-1772096403651-2bwfv',
        title: '클룩 전 세계 액티비티 5% 할인',
        content_body: '클룩(Klook)에서 유니버셜 스튜디오, 디즈니랜드, 각종 패스권 및 투어 상품 예약 시 조건 없이 5% 할인을 받을 수 있는 스페셜 쿠폰입니다. 여행 출발 전 필수 액티비티를 미리 예약하고 경비를 절약해 보세요.',
        condition: '일부 유니버셜/디즈니 상품 제외 / 앱 전용 결제 시 적용'
    },
    {
        id: 'coupon-1774361999205-q7kk6',
        content_body: '서울 잠실 롯데월드 아쿠아리움 입장권을 현장 구매보다 훨씬 저렴하게 예약할 수 있는 특가 혜택입니다. 가족 단위 방문객이나 데이트 코스로 강력 추천하며, 모바일 티켓으로 대기 없이 바로 입장 가능합니다.',
        condition: '온라인 사전 예약 필수 / 주말 및 공휴일 사용 가능'
    },
    {
        id: 'coupon-1773208197911-mae3m',
        title: '아고다 전 세계 숙소 추가 할인',
        content_body: '아고다에서 전 세계 모든 숙소 예약 시 즉시 할인되는 시크릿 할인코드입니다. 특가 상품에도 중복 적용이 가능하여 최저가 수준으로 호텔을 예약할 수 있습니다. 결제 창에서 할인코드를 입력하세요.',
        condition: '원화(KRW) 결제 시 적용 / 쿠폰톡 전용 링크 접속 필수'
    },
    {
        id: 'coupon-1773214114918-rhp07',
        content_body: '강원도 속초 지역의 인기 호텔 및 펜션 예약 시 사용할 수 있는 전용 할인쿠폰입니다. 오션뷰 숙소를 합리적인 가격에 예약하고 완벽한 힐링 여행을 떠나보세요.',
        condition: '속초 지역 숙박 한정 / 체크인 날짜 무관'
    }
];

async function run() {
    console.log("Updating Stores...");
    for (const store of storeUpdates) {
        const { error } = await supabase.from('stores').update({ description: store.description }).eq('id', store.id);
        if (error) console.error(`Error updating store ${store.id}:`, error.message);
    }

    console.log("Updating Coupons...");
    for (const coupon of couponUpdates) {
        const payload: any = { content_body: coupon.content_body, condition: coupon.condition };
        if (coupon.title) payload.title = coupon.title;
        const { error } = await supabase.from('coupons').update(payload).eq('id', coupon.id);
        if (error) console.error(`Error updating coupon ${coupon.id}:`, error.message);
    }
    
    console.log("Done updating!");
}

run();
