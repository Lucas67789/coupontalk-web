import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envFile = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
const env: any = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const storeId = "shokz";
    const now = new Date().toISOString();

    const markdownContent = `
안녕하세요! 요즘 날씨가 좋아서 러닝이나 야외 운동 즐기시는 분들 많으시죠?
운동할 때 음악은 필수인데, 일반 인이어 이어폰은 땀이 차기도 하고 주변 소리가 안 들려서 자전거나 러닝 시 위험할 수 있어 고민이셨던 분들 계실 겁니다.

그래서 많은 분들이 '운동용 이어폰', '러닝 이어폰' 하면 가장 먼저 떠올리는 독보적인 브랜드가 바로 **'샥즈(SHOKZ)'**일 텐데요.
드디어 샥즈에서 엄청난 신제품 2종을 출시하며 역대급 프리오더 이벤트를 진행한다고 해서 발 빠르게 소식을 정리해 왔습니다!

바로 새롭게 돌아온 **'오픈런 에어 2(OpenRun Air 2)'**와 **'오픈핏 에어 2(OpenFit Air 2)'**입니다. 
평소 무선 이어폰 구매를 망설이셨다면 이번 사전예약 혜택이 정말 좋으니 꼭 주목해 주세요.

---

### 📅 [샥즈] 신제품 프리오더 이벤트 개요

이번 프리오더 이벤트는 혜택이 정말 빵빵하게 준비되어 있습니다. 기간이 길지 않으니 평소 골전도 이어폰이나 편안한 오픈형 무선 이어폰 구매를 생각하셨던 분들이라면 절대 놓치지 마세요!

*   **이벤트 기간:** 2026.08.20 ~ 2026.08.26 (단 7일간!)
*   **대상 제품:** 샥즈 오픈런 에어 2, 오픈핏 에어 2

---

### 🎧 제품별 특징 및 100% 증정 사은품 안내

이번 프리오더 기간에 신제품을 구매하시면 러너와 일상 사용자를 모두 만족시킬 특별한 사은품을 100% 증정한다고 합니다.

#### 1. 골전도 이어폰의 대명사, 오픈런 에어 2 (OpenRun Air 2)
러닝, 사이클, 등산 등 격렬한 아웃도어 스포츠를 즐기시는 분들에게 완벽한 마스터피스입니다. 귀를 막지 않는 골전도 방식이라 주변 상황(차량 소리, 자전거 벨 소리 등)을 바로 인지할 수 있어 굉장히 안전합니다. 땀과 비에도 강한 강력한 방수 기능은 기본이죠. 한층 더 가벼워진 착용감과 업그레이드된 베이스 음질로 돌아왔다고 하니 기대가 큽니다.

*   **🎁 프리오더 구매 혜택:** 오픈런 에어 2 구매 시, 스포츠 활동 필수템인 **'스포츠 힙색'**을 증정합니다. 핸드폰이나 에너지 젤, 간단한 소지품을 넣고 뛰기에 딱 좋은 실용적인 사은품이네요!

#### 2. 구름처럼 가벼운 착용감, 오픈핏 에어 2 (OpenFit Air 2)
일상생활, 업무, 그리고 가벼운 운동에 모두 적합한 만능 공기전도 이어폰입니다. 골전도의 진동이 어색하셨던 분들, 혹은 하루 종일 귀에 꽂고 있어도 압박감 없이 편안한 무선 이어폰을 찾으셨던 분들에게 강력 추천합니다. 귀에 부드럽게 걸치는 형태라 착용감이 정말 가볍고, 안경을 쓴 상태에서도 불편함이 적습니다.

*   **🎁 프리오더 구매 혜택:** 오픈핏 에어 2 구매 시에는 일상에서 유용하게 두루두루 쓸 수 있는 **'토트백'**을 증정합니다. 깔끔한 디자인이라 운동 갈 때는 물론 데일리 백으로 쓰기에도 무리가 없어 보입니다.

---

### 🎉 놓칠 수 없는 대박 추가 이벤트 2가지!

사은품 증정에서 끝이 아닙니다! 신제품 구매 고객 및 이벤트 참여자를 위한 어마어마한 혜택이 더 기다리고 있습니다.

1.  **신제품 럭키드로우 이벤트**
    꼭 구매하지 않으셔도 참여할 수 있는 이벤트입니다! 샥즈 이벤트 페이지에 접속하셔서 럭키드로우에 참여만 하셔도, 추첨을 통해 샥즈 신제품 라인업을 무료로 득템할 수 있는 당첨의 기회가 주어집니다. 

2.  **🏃‍♂️ JTBC 마라톤 참가권 추첨 증정! (하이라이트)**
    개인적으로 이번 이벤트에서 가장 탐나는 혜택입니다. 가을 러너들의 큰 축제 중 하나인 'JTBC 마라톤' 참가권을 **신제품 구매 고객 대상**으로 추첨을 통해 증정한다고 합니다! 치열한 티켓팅 없이 새 이어폰을 끼고 대회에 나갈 수 있는 절호의 찬스네요. 러너분들이라면 이 기회를 놓쳐선 안 되겠습니다.

---

### 💡 마무리하며

이번 샥즈 신제품 라인업, 정말 이를 갈고 나온 것 같습니다. 기존 제품들의 아쉬웠던 점은 철저하게 보완하고 특유의 장점은 극대화해서 출시된 것 같아 저도 이번 기회에 하나 장만하려고 합니다.

실용적인 사은품 100% 증정 혜택에, 럭키드로우, 그리고 JTBC 마라톤 참가권 추첨까지! 
오직 프리오더 기간(8월 26일까지)에만 누릴 수 있는 풍성하고 파격적인 혜택이니, 기간 늦지 않게 확인해 보세요!
    `.trim();

    const coupons = [
        {
            id: "coupon-shokz-" + Date.now(),
            store_id: storeId,
            title: "샥즈 신제품 오픈런 에어 2 & 오픈핏 에어 2 역대급 프리오더 혜택",
            discount: "사은품 증정 + 마라톤 참가권 추첨",
            code: "프리오더",
            expiry: "2026.08.26",
            content_body: markdownContent,
            status: "published",
            published_at: now,
            condition: JSON.stringify({
                text: "단 7일간 진행",
                url: "http://app.ac/YbpXXql23",
                v: true
            })
        }
    ];

    const { data, error } = await supabase.from('coupons').insert(coupons);
    if (error) {
        console.error("Error inserting coupon:", error);
    } else {
        console.log("Successfully inserted Shokz promotion.");
    }
}

run();
