/**
 * shiyun-engine · 世运引擎（三元九运 × 个人命盘叠加判定）
 * 公理：世运判定不看「含量」看「喜用」——
 *   八运看「用不用土」（强弱不主导，土日主走综合流通喜忌）；
 *   九运上乘用法「火能辅用，金水也能用」；木为中间调剂，不作判定依据。
 * 边界：本包是世运模型底座，输出判定键（keys），不输出断语文案。
 * @license Apache-2.0 © 明镜解ME (mingjing.me)
 */

export const WUXING = ['木', '火', '土', '金', '水'];
const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };

// ───────────────────────────── 1) 世运周期（数据层） ─────────────────────────────

const ERAS = [
  { name: '一运', range: [2044, 2063], element: '水', note: '坎水运' },
  { name: '九运', range: [2024, 2043], element: '火', note: '离火运：名为离火，实为无温之水、银河之水——供金水之气，土成灰土' },
  { name: '八运', range: [2004, 2023], element: '土', note: '艮土运：真土——培木生金晦火挡水，社会气质=堆（堆房、堆资产、堆身份、堆杠杆）' },
  { name: '七运', range: [1984, 2003], element: '金', note: '兑金运' },
];

// 三年三段（2024-2028 切换带的节点年份）
const PHASES = [
  { year: 2024, mark: '甲辰·牌桌换了', note: '名义切换，八运存量惯性供应，多数人无感' },
  { year: 2027, mark: '丁未·总结年', note: '旧筹码作废——断供年，「回不去了」的集体确认' },
  { year: 2028, mark: '戊申·新筹码', note: '金气回身＋大水无挡，九运真供应到货，多数人的九运从这天开始' },
];

export function eraYears(year) {
  const era = ERAS.find(e => year >= e.range[0] && year <= e.range[1]) || null;
  const phase = PHASES.find(p => p.year === year) || null;
  return {
    year,
    era: era ? era.name : null,
    eraRange: era ? era.range : null,
    element: era ? era.element : null,
    phase: phase ? phase.mark : null,
    phaseNote: phase ? phase.note : null,
    eraNote: era ? era.note : null,
  };
}

// ───────────────────────────── 2) 世运供应 ─────────────────────────────

export function eraSupply(era) {
  if (era === '八运') return { gives: ['土'], texture: '真土', note: '培木、生金、晦火、挡水——真土堤防，社会气质=堆' };
  if (era === '九运') return { gives: ['金', '水'], texture: '灰土', note: '土死之后的形态：只剩混和埋，不能培、不能制；离火其名，供金水之气其实' };
  if (era === '七运') return { gives: ['金'], texture: '兑金', note: '肃杀、收割、金融与机械之运' };
  if (era === '一运') return { gives: ['水'], texture: '坎水', note: '流动、智慧、风险之运' };
  return { gives: [], texture: '', note: '' };
}

// ───────────────────────────── 3) 个人叠加判定（喜用判定版·核心） ─────────────────────────────

/**
 * @typedef {Object} EraInput
 * @property {Record<string, number>} wuxingScore  五行分值（含量，仅作参考，不主导判定）
 * @property {string} dayMasterWuxing              日主五行
 * @property {boolean|null} [isStrong]             身强弱；土日主判通塞时传 null（不以强弱论）
 * @property {'寒'|'燥'|'湿'|'中和'} [hanNuan]
 * @property {{isCong:boolean, wangElement?:string|null, joint?:string}} [congGe]  从格信息
 * @property {{shuMu:boolean, xieJin:boolean, runShui:boolean}} [flow]  流通信号：木疏(有根未合)/金泄(透)/水润(显)
 */

const totalOf = (s) => WUXING.reduce((a, w) => a + (s[w] || 0), 0);

/** 喜用推导（粗骨架；集成方可用自己的喜用引擎结果覆盖传入 yongOverride） */
function yongElements(input) {
  const { dayMasterWuxing: dm, isStrong, hanNuan, congGe } = input;
  let yong;
  if (congGe?.isCong && congGe.wangElement) {
    yong = congGe.joint ? [...congGe.joint] : [congGe.wangElement]; // 从格顺旺神（从火土→火土）
  } else if (isStrong === true) {
    yong = WUXING.filter(w => w !== dm && w !== (Object.keys(SHENG).find(k => SHENG[k] === dm))); // 身强喜泄耗克
  } else if (isStrong === false) {
    yong = [dm, Object.keys(SHENG).find(k => SHENG[k] === dm)]; // 身弱喜生扶
  } else {
    yong = []; // 强弱不论（土日主综合派）——由流通与喜忌另行判定
  }
  if (hanNuan === '寒' && !yong.includes('火')) yong = ['火', ...yong];
  if (hanNuan === '燥' && !yong.includes('水')) yong = ['水', ...yong];
  return yong;
}

/**
 * 用土判定（修正版·强弱不主导）：
 *  - 满盘土而有流通（木疏/金泄/水润任一）→ 仍要土
 *  - 身弱土日主而无流通 → 不能再添土，第一需要是火（primaryNeed='火'）
 *  - 寒局水旺 → 需湿土堤防
 *  - 从土势/从火土 → 顺势用土
 */
function needsEarthOf(input, yong) {
  const { dayMasterWuxing: dm, isStrong, hanNuan, congGe, flow } = input;
  const sc = input.wuxingScore, total = totalOf(sc) || 1;
  const earthShare = (sc['土'] || 0) / total;
  const waterShare = (sc['水'] || 0) / total;
  const ventilated = !!(flow && (flow.shuMu || flow.xieJin || flow.runShui));

  if (congGe?.isCong) {
    const joint = congGe.joint || '';
    if (joint.includes('土') || congGe.wangElement === '土') return { needs: true, why: '从土之势' };
  }
  if (dm === '土') {
    const hotShare = ((sc['火'] || 0) + (sc['土'] || 0)) / total;
    // 校准案②（己酉丙寅戊午癸丑）：身旺火土已壅——要泄不要补，满盘火土而忌火土
    if (isStrong === true && hotShare >= 0.5) return { needs: false, why: '身旺火土已壅：要泄（金水），不要补（火土）' };
    if (ventilated) return { needs: true, why: '土日主有流通（满盘土仍要土）' };
    if (isStrong === false) return { needs: false, why: '身弱土无流通：不能再添土，主吃火', primaryNeed: '火' };
    return { needs: earthShare >= 0.34, why: earthShare >= 0.34 ? '土自成势' : '土不成势' }; // CALIB 0.34
  }
  if (hanNuan === '寒' && waterShare >= 0.3) return { needs: true, why: '寒局水旺：需湿土堤防' }; // CALIB 0.3
  if (yong.includes('土')) return { needs: true, why: '土在喜用' };
  return { needs: false, why: '不用土' };
}

/** 火炎土燥：需土者也受不住八运的燥土（埋淤） */
function dryOverloadOf(input) {
  const sc = input.wuxingScore, total = totalOf(sc) || 1;
  const hotShare = ((sc['火'] || 0) + (sc['土'] || 0)) / total;
  return input.hanNuan === '燥' && hotShare >= 0.5; // CALIB 0.5
}

/**
 * 「托不住」机制（东森 2026-11-24 校准案① 癸丑甲子己亥甲戌）：
 * 需火需土≠受得住——水多土流（土来泡烂）、水多火灭（火来浇灭）。
 * 此机制专指「土日主本体弱而被水淹」；需土制水者（堤防）不在此列。
 * 2026-11-24 二校：托不住≠无效——是「扶着站着」：好，但好得不彻底（扶而不立）。
 */
function unholdableOf(input, needsEarth, primaryNeed, yong) {
  const sc = input.wuxingScore, total = totalOf(sc) || 1;
  const waterShare = (sc['水'] || 0) / total;
  const fireShare = (sc['火'] || 0) / total;
  const earthShare = (sc['土'] || 0) / total;
  const isWeakEarthDm = input.dayMasterWuxing === '土' && input.isStrong === false;
  const unholdEarth = isWeakEarthDm && needsEarth && waterShare >= 0.34 && earthShare <= 0.3; // CALIB 0.34 / 0.3
  const unholdFire = isWeakEarthDm && (primaryNeed === '火' || yong.includes('火')) && waterShare >= 0.34 && fireShare <= 0.1; // CALIB 0.1
  const unholdable = unholdEarth || unholdFire;
  const why = unholdEarth ? '水多土流：土刚堆起，底下还在渗' : unholdFire ? '水多火灭：火来浇灭，托不住火' : '';
  return { unholdable, unholdEarth, unholdFire, why };
}

/**
 * 通塞层（东森 2026-11-24 二校）：「有而不通」比「缺」难断——缺补就行，不通要找堵在哪一段。
 *  漏 leaking：需之神到位而底下渗（托不住底）——扶而不立
 *  断 blocked：所供之神在盘而接不上（金水被火土隔断，各自孤着）——供了也用不上
 *  堵点常在两个字的中间（案②：金在年、水在时，中间寅午半合火把路烧成火土）。
 * 位置类信号由集成方排盘层提供：flow.blocked / flow.metalWaterLinked。
 */
function flowStateOf(input, unholdable, yong) {
  if (unholdable.unholdEarth || unholdable.unholdFire) return { state: 'leaking', why: unholdable.why };
  if (yong.includes('金') || yong.includes('水')) {
    const sc = input.wuxingScore, total = totalOf(sc) || 1;
    const hotShare = ((sc['火'] || 0) + (sc['土'] || 0)) / total;
    if (input.flow?.blocked || (hotShare >= 0.5 && input.flow?.metalWaterLinked === false)) {
      return { state: 'blocked', why: '金水各自孤着：位置被火土隔断，生不起来' };
    }
  }
  return { state: 'open', why: '' };
}

/**
 * 意义观照轴（东森 2026-11-24 定·定风波层）：九运=真意义回归的高阶时空——
 * 世俗物质功名作为判定标准大幅降低；精神境界、生命感受、生活幸福重新定义。
 * 八运只问世俗供应（成没成、有没有）；九运双轴：世俗供应 + 意义观照。
 * 观照轴三态：
 *  原生 native：精神有根（印气足）或感受有出口（食伤有气），或天生离相（空亡/华盖重），
 *    以及卡存之盘——被成败判刑多年者，九运给的是「存在的正当性」：以不同方式活着=正当。
 *  学习 learning：财官结构为主（八运舞台盘）——要学的是下场，从舞台逻辑切换到观照逻辑。
 * 注：舞台上永远只有 20%（东森 80/20 观察）——本轴为那 80% 而设。
 */
function meaningAxisOf(input, stagnant) {
  const sc = input.wuxingScore, total = totalOf(sc) || 1;
  const dm = input.dayMasterWuxing;
  const shengWo = Object.keys(SHENG).find(k => SHENG[k] === dm); // 生我=印（精神之根）
  const woSheng = SHENG[dm];                                     // 我生=食伤（感受出口）
  const yinShare = (sc[shengWo] || 0) / total;
  const shiShangShare = (sc[woSheng] || 0) / total;
  const caiGuanShare = ((sc[KE[dm]] || 0) + (sc[Object.keys(KE).find(k => KE[k] === dm)] || 0)) / total;
  const detached = !!(input.flow?.voidHeavy || input.flow?.huaGai); // 空亡/华盖重（集成方信号）
  if (stagnant.stagnant) return { axis: 'native', why: '卡存者九运得宽宥：存在的正当性，不再按成败判刑' };
  if (yinShare >= 0.25 || shiShangShare >= 0.25 || detached) { // CALIB 0.25
    return { axis: 'native', why: '精神有根或感受有出口——意义回归里的适者' };
  }
  if (caiGuanShare >= 0.45) { // CALIB 0.45
    return { axis: 'learning', why: '八运舞台盘：九运要学的是下场，换一副尺子量自己' };
  }
  return { axis: 'learning', why: '意义轴未明，按学习态读' };
}

/**
 * 「卡存」第三态（东森 2026-11-24 定）：
 * 有格局的盘才有好坏运；两头都堵（泄不通、补不得）或喜忌不明的盘，
 * 金水不会好、火土也不会好——走什么运都只是以不同方式活着。
 * 判据：①通塞为「断」（所供接不上）；②主气无出口（某行独大≥0.45 而喜忌不明）。
 * 注意：「漏」（扶而不立）不算卡存——供应有效，只是不彻底。
 */
function stagnantOf(input, flowState, yong) {
  const sc = input.wuxingScore, total = totalOf(sc) || 1;
  const shares = WUXING.map(w => (sc[w] || 0) / total);
  const dominantNoExit = Math.max(...shares) >= 0.45 && yong.length === 0; // CALIB 0.45
  if (flowState.state === 'blocked') return { stagnant: true, why: `两头都堵：${flowState.why}` };
  if (dominantNoExit) return { stagnant: true, why: '主气无出口：能量不流通，以堵着的方式存在' };
  return { stagnant: false, why: '' };
}

/**
 * classifyEra —— 个人×世运叠加判定
 * @param {EraInput} input
 * @param {{yongOverride?: string[]}} [opts]  yongOverride 可直接指定喜用（集成方自己算的喜用）
 */
export function classifyEra(input, opts = {}) {
  const yong = opts.yongOverride || yongElements(input);
  const ne = needsEarthOf(input, yong);
  const dryOverload = dryOverloadOf(input);
  const needsEarth = ne.needs && !false;
  const primaryNeed = ne.primaryNeed || null;
  const unholdable = unholdableOf(input, needsEarth, primaryNeed, yong);
  const flowState = flowStateOf(input, unholdable, yong);
  const stagnant = stagnantOf(input, flowState, yong);
  const meaningAxis = meaningAxisOf(input, stagnant);

  // ── 八运 ──
  let baYun, baYunKey;
  if (needsEarth && flowState.state === 'leaking') { baYun = '得世·扶立'; baYunKey = 'bayun.propped'; } // 世运补缺：扶着站着，好而不彻底
  else if (needsEarth && dryOverload) { baYun = '反埋'; baYunKey = 'bayun.buried'; }
  else if (needsEarth) { baYun = '得世'; baYunKey = 'bayun.favored'; }
  else if ((primaryNeed === '火' || yong.includes('火')) && !unholdable.unholdFire) { baYun = '间接受惠'; baYunKey = 'bayun.fire-assisted'; }
  else { baYun = '不济'; baYunKey = 'bayun.off'; }

  // ── 九运（上乘用法）──
  const fireAux = !unholdable.unholdFire && (input.hanNuan === '寒' || primaryNeed === '火' || yong.includes('火'));
  // 「断」：金水虽供，接不上——九运供应也用不上
  const blocked = flowState.state === 'blocked';
  const metalWaterMain = !blocked && (yong.includes('金') || yong.includes('水') || dryOverload);
  const buried = dryOverload;
  // 供应断档：八运得世（含扶立）而九运两头不靠——供应的来源换了（世运补缺不补喜，运一走就没有）
  const supplyCut = (baYunKey === 'bayun.favored' || baYunKey === 'bayun.propped') && !fireAux && !metalWaterMain && !buried;
  let verdict;
  if (blocked) verdict = 'jiuyun.blocked';
  else if (buried && metalWaterMain) verdict = 'jiuyun.rescue';
  else if (supplyCut) verdict = 'jiuyun.supply-cut';
  else if (metalWaterMain && fireAux) verdict = 'jiuyun.main-plus-aux';
  else if (metalWaterMain) verdict = 'jiuyun.metal-water-main';
  else if (fireAux) verdict = 'jiuyun.fire-aux';
  else verdict = 'jiuyun.neutral';

  const keys = [
    ...(needsEarth ? ['era.needs-earth'] : []),
    ...(dryOverload ? ['era.dry-overload'] : []),
    ...(primaryNeed ? [`era.primary-need-${primaryNeed}`] : []),
    ...(flowState.state !== 'open' ? [`era.${flowState.state}`] : []),
    ...(stagnant.stagnant ? ['era.stagnant'] : []),
    baYunKey, verdict,
    `jiuyun.meaning-${meaningAxis.axis}`,
    `era.yong-${yong.join('') || 'open'}`,
  ];
  return { needsEarth, dryOverload, primaryNeed, yong, baYun, baYunKey,
    unholdable, flowState, stagnant, meaningAxis,
    jiuYun: { fireAux, metalWaterMain, buried, blocked, verdict }, keys };
}

// ───────────────────────────── 4) 大运落段 ─────────────────────────────

const SWEET = [[2012, 2021], [2016, 2024]]; // 八运甜点区（覆盖段；CALIB）
export function overlayDaYun(daYunList, currentYear) {
  return daYunList.map(d => {
    const spans = ERAS.filter(e => d.endYear >= e.range[0] && d.startYear <= e.range[1]).map(e => e.name);
    const sweetSpot = SWEET.some(([a, b]) => Math.min(d.endYear, b) - Math.max(d.startYear, a) + 1 >= 5);
    const eraSwitch = d.startYear >= 2023 && d.startYear <= 2025; // 换运×换世运同线
    const note = spans.length > 1
      ? '跨世运：主体段落在哪运按哪运读；换档前后两年是清算高发期'
      : spans[0] === '八运' ? '八运段：按红利读（堆、扩、杠杆）'
      : spans[0] === '九运' ? '九运段：按灰土读（清算、沉潜、金水为用）' : '';
    return { ...d, spans, sweetSpot, eraSwitch, note,
      isCurrent: currentYear >= d.startYear && currentYear <= d.endYear };
  });
}

// ───────────────────────────── 5) 流年节点 ─────────────────────────────

export function yearMarkers(year) {
  const isSummaryYear = year === 2027;
  const inWindow = year >= 2027 && year <= 2031; // 动荡窗口（灰土三部曲：2027固化→2028-2031水漫）CALIB
  const phase = PHASES.find(p => p.year === year) || null;
  const notes = [];
  if (isSummaryYear) notes.push('总结年/考试年/大型过渡年：过去三年铺下去的事，到这年收卷');
  if (inWindow && !isSummaryYear) notes.push('动荡窗口内：不断任何人「平稳无事」，只看动荡的大小与落点');
  if (phase) notes.push(phase.note);
  return { year, isSummaryYear, window: inWindow ? '2027-2031' : null,
    level: isSummaryYear ? 10 : inWindow ? 7 : 0, notes };
}
