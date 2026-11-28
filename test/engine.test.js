// 世运引擎回归测试（node:test，零依赖）
// 用例锚定东森口径（2026-11-24 审定）：
//  ① 满盘土有流通仍要土 ② 身弱土无流通不见土主吃火 ③ 从火土火炎土燥=八运反埋、九运金水解
//  ④ 寒局水旺需湿土堤防 ⑤ 金水为喜用=九运主场 ⑥ 木不入判定
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eraYears, eraSupply, classifyEra, overlayDaYun, yearMarkers, yearNoteOf } from '../src/index.js';

test('世运周期与三年三段', () => {
  assert.equal(eraYears(2016).era, '八运');
  assert.equal(eraYears(2027).era, '九运');
  assert.equal(eraYears(2027).phase, '丁未·总结年');
  assert.equal(eraSupply('八运').texture, '真土');
  assert.deepEqual(eraSupply('九运').gives, ['金', '水']);
});

test('① 满盘土而有流通：仍要土，八运得世', () => {
  const r = classifyEra({
    wuxingScore: { 木: 1, 火: 1, 土: 6, 金: 1, 水: 0.5 },
    dayMasterWuxing: '土', isStrong: null, hanNuan: '中和',
    flow: { shuMu: true, xieJin: false, runShui: false },
  });
  assert.equal(r.needsEarth, true);
  assert.equal(r.baYun, '得世');
  assert.equal(r.baYunKey, 'bayun.favored');
});

test('② 身弱土日主无流通：不见土、主吃火，八运不济、九运火辅', () => {
  const r = classifyEra({
    wuxingScore: { 木: 1, 火: 0.5, 土: 2, 金: 2, 水: 2.5 },
    dayMasterWuxing: '土', isStrong: false, hanNuan: '中和',
    flow: { shuMu: false, xieJin: false, runShui: false },
  });
  assert.equal(r.needsEarth, false);
  assert.equal(r.primaryNeed, '火');
  assert.equal(r.baYun, '间接受惠'); // 火为辅
  assert.equal(r.jiuYun.fireAux, true);
});

test('③ 从火土而火炎土燥：八运反埋，九运金水解燥得救', () => {
  const r = classifyEra({
    wuxingScore: { 木: 1, 火: 3.5, 土: 3, 金: 0.5, 水: 0 },
    dayMasterWuxing: '土', isStrong: null, hanNuan: '燥',
    congGe: { isCong: true, wangElement: '火', joint: '火土' },
    flow: { shuMu: false, xieJin: false, runShui: false },
  });
  assert.equal(r.needsEarth, true);
  assert.equal(r.dryOverload, true);
  assert.equal(r.baYun, '反埋');
  assert.equal(r.jiuYun.buried, true);
  assert.equal(r.jiuYun.metalWaterMain, true);
  assert.equal(r.jiuYun.verdict, 'jiuyun.rescue');
});

test('④ 寒局水旺：需湿土堤防，八运得世', () => {
  const r = classifyEra({
    wuxingScore: { 木: 0.5, 火: 0, 土: 1.5, 金: 2.5, 水: 3.5 },
    dayMasterWuxing: '金', isStrong: false, hanNuan: '寒',
    flow: { shuMu: false, xieJin: false, runShui: true },
  });
  assert.equal(r.needsEarth, true);
  assert.equal(r.baYun, '得世');
  assert.equal(r.jiuYun.fireAux, true); // 寒局需火辅
});

test('⑤ 身强金水结构：金水为泄耗喜用，九运主场', () => {
  const r = classifyEra({
    wuxingScore: { 木: 0.5, 火: 1, 土: 1, 金: 3.5, 水: 3 },
    dayMasterWuxing: '金', isStrong: true, hanNuan: '中和',
    flow: { shuMu: false, xieJin: true, runShui: true },
  });
  assert.equal(r.jiuYun.metalWaterMain, true);
  assert.notEqual(r.jiuYun.verdict, 'jiuyun.rescue');
});

test('⑥ 木不入判定：木含量多少不改变世运结论', () => {
  const base = {
    dayMasterWuxing: '木', isStrong: false, hanNuan: '中和',
    flow: { shuMu: false, xieJin: false, runShui: false },
  };
  const a = classifyEra({ ...base, wuxingScore: { 木: 5, 火: 1, 土: 1, 金: 1, 水: 1 } });
  const b = classifyEra({ ...base, wuxingScore: { 木: 0.5, 火: 1, 土: 1, 金: 5.5, 水: 1 } });
  assert.equal(a.baYun, b.baYun);
  assert.equal(a.jiuYun.verdict, b.jiuYun.verdict);
});

test('⑦ 校准案①二校（癸丑甲子己亥甲戌，东森 2026-11-24）：得世·扶立——好而不彻底，九运供应断', () => {
  // 己土生子月水当令。火土来时能立住、事能办（他自己说是好的一段），但水在底下渗——扶而不立；
  // 且他比九运更适合八运：八运土当令，时代在替他补土（世运补缺不补喜，运一走就没有）
  const r = classifyEra({
    wuxingScore: { 木: 2.5, 火: 0.3, 土: 2, 金: 0.8, 水: 3.5 },
    dayMasterWuxing: '土', isStrong: false, hanNuan: '寒',
    flow: { shuMu: true, xieJin: false, runShui: true },
  });
  assert.equal(r.needsEarth, true);
  assert.equal(r.unholdable.unholdEarth, true);
  assert.equal(r.flowState.state, 'leaking');       // 漏：扶而不立
  assert.equal(r.baYun, '得世·扶立');
  assert.equal(r.baYunKey, 'bayun.propped');
  assert.equal(r.stagnant.stagnant, false);         // 不是卡存——供应有效，只是不彻底
  assert.equal(r.jiuYun.fireAux, false);            // 水多火灭
  assert.equal(r.jiuYun.verdict, 'jiuyun.supply-cut'); // 九运供应断档
  assert.ok(r.keys.includes('era.leaking'));
});

test('⑧ 校准案②二校（己酉丙寅戊午癸丑，东森 2026-11-24）：金水在而隔断——泄不通补不得，卡存', () => {
  // 戊土坐午羊刃、丙火透、寅午半合火。金水都在盘上（酉/丑中辛、癸/丑中癸），但金在年、水在时，
  // 中间寅午半合火把路烧成火土——不是缺金水，是金水各自孤着生不起来。丙午年=最后一条泄口被切断。
  const r = classifyEra({
    wuxingScore: { 木: 2, 火: 2.8, 土: 4.3, 金: 1.3, 水: 1.5 },
    dayMasterWuxing: '土', isStrong: true, hanNuan: '燥',
    flow: { shuMu: false, xieJin: true, runShui: false, blocked: true },
  });
  assert.equal(r.needsEarth, false);                // 身旺火土已壅：要泄不要补
  assert.equal(r.baYun, '不济');
  assert.equal(r.flowState.state, 'blocked');       // 断：金水接不上
  assert.equal(r.jiuYun.blocked, true);
  assert.equal(r.jiuYun.metalWaterMain, false);     // 供了也用不上
  assert.equal(r.jiuYun.verdict, 'jiuyun.blocked');
  assert.equal(r.stagnant.stagnant, true);          // 两头都堵=卡存
  assert.ok(r.keys.includes('era.blocked') && r.keys.includes('era.stagnant'));
});

test('⑨ 意义观照轴（东森 2026-11-24·定风波层）', () => {
  // 卡存之盘：九运给「存在的正当性」= native（不再按成败判刑）
  const st = classifyEra({
    wuxingScore: { 木: 2, 火: 2.8, 土: 4.3, 金: 1.3, 水: 1.5 },
    dayMasterWuxing: '土', isStrong: true, hanNuan: '燥',
    flow: { shuMu: false, xieJin: true, runShui: false, blocked: true },
  });
  assert.equal(st.meaningAxis.axis, 'native');
  assert.ok(st.keys.includes('jiuyun.meaning-native'));
  // 印气足：精神有根 → native
  const yin = classifyEra({
    wuxingScore: { 木: 0.5, 火: 3.2, 土: 2.8, 金: 1, 水: 1 },
    dayMasterWuxing: '土', isStrong: true, hanNuan: '中和',
    flow: { shuMu: false, xieJin: false, runShui: false },
  });
  assert.equal(yin.meaningAxis.axis, 'native');
  // 财官舞台盘：八运逻辑的人九运要学下场 → learning
  const stage = classifyEra({
    wuxingScore: { 木: 0.5, 火: 1, 土: 0.5, 金: 3.5, 水: 3.5 },
    dayMasterWuxing: '火', isStrong: false, hanNuan: '中和',
    flow: { shuMu: false, xieJin: false, runShui: true },
  });
  assert.equal(stage.meaningAxis.axis, 'learning');
  assert.ok(stage.keys.includes('jiuyun.meaning-learning'));
});

test('大运落段与流年节点', () => {
  const [a] = overlayDaYun([{ ganZhi: '己未', startYear: 2016, endYear: 2025 }], 2026);
  assert.deepEqual(a.spans, ['九运', '八运'].sort());
  assert.equal(a.sweetSpot, true);
  assert.equal(yearMarkers(2027).isSummaryYear, true);
  assert.equal(yearMarkers(2029).window, '2027-2031');
});

test('⑩ 流年注记（灰土三部曲，东森 2026-11-29 定稿）', () => {
  assert.equal(yearNoteOf(2024).title, '九运开门年');
  assert.ok(yearNoteOf(2025).note.includes('AI 的发源与崛起'));
  assert.ok(yearNoteOf(2026).note.includes('炼'));
  assert.ok(yearNoteOf(2027).note.includes('丑未戌'));
  assert.ok(yearNoteOf(2028).note.includes('塌房'));
  assert.equal(yearNoteOf(2030).title, '规则冲尽');      // 区间命中 2029-2031
  assert.equal(yearNoteOf(2035).title, '新世代高束发展'); // 区间命中 2032-2037
  assert.equal(yearNoteOf(2038), null);                   // 未考年份留空不编
  const m = yearMarkers(2028);
  assert.ok(m.yearNote && m.notes[0].includes('戊申·新土生金'));
});
