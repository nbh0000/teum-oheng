/* 오행 기본 데이터 */
window.OHENG = (function () {
  var ORDER = ["wood", "fire", "earth", "metal", "water"];

  var EL = {
    wood: {
      hz: "木", tags: ["성장", "시작", "생기", "계획", "배움", "여유"], benefit: "새로운 일을 시작할 힘이 붙고 생각이 다시 자라기 시작합니다", ko: "목", en: "Wood", img: "wood",
      short: "앞으로 뻗어 나가는 기운", kw: "성장 · 도약", kwEn: "GROWTH · RISE", hex: "#9fcbba",
      lead: "목은 봄의 새순처럼 위로 자라는 기운입니다. 무언가를 시작하고 계획을 밀고 나가는 힘이 여기서 나옵니다. 목이 부족하면 새 일을 벌이기 어렵고 생각이 쉽게 굳습니다.",
      color: "푸른색, 초록", direction: "동쪽", season: "봄", habit: "아침 산책, 식물 기르기",
      vessel: "재 유약을 입힌 길고 가는 화병",
      vesselNote: "곧게 선 형태와 나뭇가지 한 줄기가 목의 기운을 공간에 들입니다. 현관이나 동쪽 창가에 두기 좋습니다."
    },
    fire: {
      hz: "火", tags: ["열정", "표현", "인연", "온기", "자신감", "활기"], benefit: "사람과의 관계에 온기가 돌고 하고 싶은 일에 불이 붙습니다", ko: "화", en: "Fire", img: "fire",
      short: "마음을 움직이고 관계를 잇는 기운", kw: "열정 · 인연", kwEn: "PASSION · CONNECTION", hex: "#f2ab9e",
      lead: "화는 한여름 햇빛처럼 밝게 드러나는 기운입니다. 표현하고 사람을 만나고 열정을 내는 힘이 여기서 나옵니다. 화가 부족하면 의욕이 쉽게 꺼지고 몸이 차가워지기 쉽습니다.",
      color: "붉은색, 자주", direction: "남쪽", season: "여름", habit: "햇볕 쬐기, 따뜻한 차",
      vessel: "장작가마에서 그을린 사발",
      vesselNote: "불길이 지나간 자국이 그대로 남은 그릇입니다. 따뜻한 차를 담아 매일 손에 쥐는 잔으로 쓰기 좋습니다."
    },
    earth: {
      hz: "土", tags: ["안정", "건강", "신뢰", "꾸준함", "중심", "포용"], benefit: "생활의 리듬이 잡히고 마음이 한곳에 머물기 시작합니다", ko: "토", en: "Earth", img: "earth",
      short: "중심을 잡고 심신을 돌보는 기운", kw: "안정 · 건강", kwEn: "BALANCE · WELLBEING", hex: "#e8cb72",
      lead: "토는 모든 것을 받아 주는 땅의 기운입니다. 중심을 잡고 신뢰를 쌓고 꾸준히 이어 가는 힘이 여기서 나옵니다. 토가 부족하면 마음이 들뜨고 일이 오래 이어지지 않습니다.",
      color: "황토색, 베이지", direction: "중앙", season: "환절기", habit: "규칙적인 식사, 흙 만지기",
      vessel: "유약 없이 구운 흙 그릇",
      vesselNote: "흙의 결이 그대로 드러나는 투박한 그릇입니다. 식탁 한가운데에 두고 매일 쓰는 그릇으로 들이기 좋습니다."
    },
    metal: {
      hz: "金", tags: ["결실", "정리", "결단", "풍요", "원칙", "집중"], benefit: "미뤄 둔 일에 매듭이 지어지고 애쓴 만큼 결실이 남습니다", ko: "금", en: "Metal", img: "metal",
      short: "쌓이고 결실을 맺는 기운", kw: "풍요 · 결실", kwEn: "ABUNDANCE · PROSPERITY", hex: "#c4beb8",
      lead: "금은 가을의 서늘한 공기처럼 맺고 끊는 기운입니다. 결단하고 정리하고 원칙을 지키는 힘이 여기서 나옵니다. 금이 부족하면 결정을 미루고 주변이 쉽게 어수선해집니다.",
      color: "흰색, 은색", direction: "서쪽", season: "가을", habit: "정리 정돈, 깊은 호흡",
      vessel: "단정한 백자 잔",
      vesselNote: "군더더기 없는 흰 형태가 금의 맑은 기운과 닮았습니다. 서쪽 선반이나 책상 위에 하나만 두어도 충분합니다."
    },
    water: {
      hz: "水", tags: ["지혜", "성취", "휴식", "유연함", "통찰", "회복"], benefit: "지친 몸과 마음이 회복되고 판단이 한결 맑아집니다", ko: "수", en: "Water", img: "water",
      short: "판단하고 원하는 곳에 도달하는 기운", kw: "지혜 · 성취", kwEn: "WISDOM · ACHIEVEMENT", hex: "#2e2d2d",
      lead: "수는 겨울 물처럼 깊이 스며드는 기운입니다. 생각하고 배우고 유연하게 흐르는 힘이 여기서 나옵니다. 수가 부족하면 쉽게 지치고 생각이 한쪽으로 치우칩니다.",
      color: "검은색, 남색", direction: "북쪽", season: "겨울", habit: "충분한 수면, 물 마시기",
      vessel: "검은 유약의 깊은 사발",
      vesselNote: "빛을 머금는 검은 유약에 물을 채워 두면 수의 기운이 고입니다. 침실이나 북쪽 공간에 두기 좋습니다."
    }
  };

  // 상생: i -> i+1, 상극: i -> i+2
  function generates(k) { return ORDER[(ORDER.indexOf(k) + 1) % 5]; }
  function controls(k) { return ORDER[(ORDER.indexOf(k) + 2) % 5]; }

  var WX = { "木": "wood", "火": "fire", "土": "earth", "金": "metal", "水": "water" };

  var GAN_KO = { "甲": "갑", "乙": "을", "丙": "병", "丁": "정", "戊": "무", "己": "기", "庚": "경", "辛": "신", "壬": "임", "癸": "계" };
  var ZHI_KO = { "子": "자", "丑": "축", "寅": "인", "卯": "묘", "辰": "진", "巳": "사", "午": "오", "未": "미", "申": "신", "酉": "유", "戌": "술", "亥": "해" };

  var SIJIN = [
    { v: 0, ko: "자시", hz: "子", range: "23:00 - 01:00", hour: 0 },
    { v: 1, ko: "축시", hz: "丑", range: "01:00 - 03:00", hour: 2 },
    { v: 2, ko: "인시", hz: "寅", range: "03:00 - 05:00", hour: 4 },
    { v: 3, ko: "묘시", hz: "卯", range: "05:00 - 07:00", hour: 6 },
    { v: 4, ko: "진시", hz: "辰", range: "07:00 - 09:00", hour: 8 },
    { v: 5, ko: "사시", hz: "巳", range: "09:00 - 11:00", hour: 10 },
    { v: 6, ko: "오시", hz: "午", range: "11:00 - 13:00", hour: 12 },
    { v: 7, ko: "미시", hz: "未", range: "13:00 - 15:00", hour: 14 },
    { v: 8, ko: "신시", hz: "申", range: "15:00 - 17:00", hour: 16 },
    { v: 9, ko: "유시", hz: "酉", range: "17:00 - 19:00", hour: 18 },
    { v: 10, ko: "술시", hz: "戌", range: "19:00 - 21:00", hour: 20 },
    { v: 11, ko: "해시", hz: "亥", range: "21:00 - 23:00", hour: 22 }
  ];

  return { ORDER: ORDER, EL: EL, WX: WX, GAN_KO: GAN_KO, ZHI_KO: ZHI_KO, SIJIN: SIJIN, generates: generates, controls: controls };
})();
