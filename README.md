# shiyun-engine · 世运引擎

> 三元九运 × 个人命盘的可计算叠加模型 × 生命温度与时代标尺。
> Deterministic era-luck (三元九运) overlay engine with a meaning & values core.

[![M8ven Score](https://m8ven.ai/badge/mcp/mingjing-me/shiyun-engine)](https://m8ven.ai/mcp/mingjing-me/shiyun-engine?s=readme)

## 核心要义（为什么要这样做）

传统命理的工具箱里只有算法——排盘、生克、断语。算法可以精确到分，
却回答不了「准了之后呢」：它能算出你何时得财、何时受阻，算不出你心里暖不暖、
此刻活得充不充实。**算法的上限是清楚的——它给出结构，给不了活法。**
而时代的评价体系与标准、不同时代的生活意义与价值观的活法，恰恰是算法给不了的。

所以我们说，未来的命理，一定要在算法之上加两套系统：

- **生命温度**：以人的内心为判定对象——活得充不充实、幸福不幸福、开心不开心、温暖不温暖。
  这是命的「体感」，不是盘的「参数」。
- **时代标尺**：评价体系不再仅以事业成功、财富变现、名利权情的世俗坐标为体现。
  八运用「拥有多少」量人，九运要用「安放在哪里」量人——九运的价值观与体系，
  正在经历一次极大的重新定义。

如果仍然走老路、只「注重算法」，命学预测的目的性与意义性就会被局限住——
它终将沦为精密的占卜，而不是人的镜子。
**先有「为什么要这样做」，才有「应该怎么做」。**
本模型把这套双重标准写进判定层：算法给出结构，温度与标尺给出读法——
所以它不是一个更准的算命机，而是一套世运价值观引擎。

**公理（本模型第一页）**：世运判定不看"含量"看"喜用"。
盘里火土多未必是火土人，金水多未必是金水人——判定看这个盘**需不需要**：

- **八运（2004-2023 艮土·真土）看"用不用土"**：以土为主要喜用者得世；火为辅者间接受惠；
  需土但火炎土燥者**反埋**（燥上加燥、土不生金）；需火土但水多土流火灭者**托不住**（名义用神、实际无效药）；
  身旺火土已壅者**要泄不要补**；不用土者不济。**强弱不主导**——土日主走综合流通喜忌：
  满盘土而有疏泄（木疏/金泄/水润）仍要土；身弱土而无流通，不能再添土，主吃火。
- **「卡存」第三态**：能量不流通或喜忌不明的盘，金水不会好、火土也不会好——
  走什么运都只是以不同方式活着（滴天髓「有病方为贵」：病=有流通、有指向、有出口）。
- **九运（2024-2043 离运）看"能用火而非用土"**：火为辅用（需火者得火之辅，小吉非大发）；
  九运主供金水之气，**土生金而非埋金**——虽名离运，火已成银河AI之火：
  平权（土）之垄断，主真智之流（水）与个人能拿得出的真东西（金），而非八运的资源与特权。
  金水为喜用者得主场；八运被埋者（火炎土燥）待金水解燥而救。
- **木为中间调剂，不作八九运判定依据。**

## 安装 / Install

```bash
npm install shiyun-engine   # 发布后可用；当前为源码引入
```

零依赖。Node 18+ / 浏览器 ESM 均可。

## 用法 / Usage

```js
import { eraYears, eraSupply, classifyEra, overlayDaYun, yearMarkers } from 'shiyun-engine';

// 1) 世运周期（数据层，逐年可更新）
eraYears(2027);
// → { era:'九运', eraRange:[2024,2043], element:'火', phase:'丁未·总结年',
//     phaseNote:'旧筹码作废——断供年，「回不去了」的集体确认' }

// 2) 每一运"供什么气"
eraSupply('八运'); // → { gives:['土'], texture:'真土', note:'培木、生金、晦火、挡水，社会气质=堆' }
eraSupply('九运'); // → { gives:['金','水'], texture:'灰土', note:'土死之后的形态：只剩混和埋……' }

// 3) 个人叠加判定（喜用判定版·核心接口）
classifyEra({
  wuxingScore: { 木: 1, 火: 3.5, 土: 3, 金: 0.5, 水: 0 },  // 含量仅作参考，不主导
  dayMasterWuxing: '土',
  isStrong: null,        // 土日主判通塞时不以强弱论，传 null
  hanNuan: '燥',
  congGe: { isCong: true, wangElement: '火', joint: '火土' },
  flow: { shuMu: false, xieJin: false, runShui: false },   // 木疏/金泄/水润
});
// → {
//   needsEarth: true, dryOverload: true,
//   baYun: '反埋', baYunKey: 'bayun.buried',
//   jiuYun: { fireAux: true, metalWaterMain: true, buried: true, verdict:'jiuyun.rescue' },
//   keys: ['era.needs-earth', 'era.dry-overload', 'bayun.buried', 'jiuyun.metal-water-main', 'jiuyun.fire-aux', 'jiuyun.rescue'],
// }

// 4) 大运落段（八运段按红利读、九运段按灰土读、甜点区）
overlayDaYun([{ ganZhi:'己未', startYear:2016, endYear:2025 }], 2026);
// → [{ ganZhi:'己未', startYear:2016, endYear:2025, spans:['八运','九运'], sweetSpot:true, note:'…' }]

// 5) 流年节点（总结年/动荡窗口/换运叠加标记）
yearMarkers(2027); // → { isSummaryYear:true, window:'2027-2031', level:10, notes:[…] }
```

## 判定模型详解（中文）

### 「托不住」与「通塞」（二校，校准案①②）

**缺好断，「有而不通」难断**——缺，补就行；不通，得先找到堵在哪一段，而堵点常在两个字中间。

- **漏 leaking（案① 癸丑甲子己亥甲戌）**：需之神到位而底下渗。火土来时身能立住、事能办，
  但「扶着站着」——人托着就能站，人一撤就塌。八运判 `bayun.propped`（得世·扶立）：
  好，但好得不彻底。**漏不是卡存**——供应有效，只是不彻底。
  更要紧的一层：此类盘**比九运更适合八运**——八运土当令，时代在替他补土，
  他不必自己走火土运；九运土退，供应断档（`jiuyun.supply-cut`）。
  这正是「世运补缺不补喜」：补的是缺、不是喜，运一走就没有了。
- **断 blocked（案② 己酉丙寅戊午癸丑）**：所供之神在盘而接不上。
  金水都在（酉/丑中辛、癸/丑中癸），但金在年、水在时，中间寅午半合火把路烧成火土——
  金水各自孤着，生不起来。泄不通、补不得，两头都堵，此为「卡存」的正解。
  九运供金水也接不上（`jiuyun.blocked`）。
  位置类信号由集成方排盘层提供：`flow.blocked` / `flow.metalWaterLinked`。

两案同病：一个漏、一个断——**土这行，判的从来不是多和少，是通不通**（与规则#209「土判通塞不判旺衰」同血脉）。

### 「卡存」第三态（东森 2026-11-24 定）

大运不是非黑即白。**有格局的盘才有好运坏运可言**；两头都堵或喜忌不明的盘，
金水不会好、火土也不会好——走什么运都只是以不同的方式活着，而不是好。
《滴天髓》「有病方为贵，无伤不是奇」：病 = 有流通、有指向、有出口。
引擎对这类盘输出 `era.stagnant` 键，B 端应据此时刻度降调（不断「不济」，断「卡存」）。

### 意义观照轴（定风波层 · 东森 2026-11-24 定）

> 也无风雨也无晴——每一段大运的人生体会，都不可复刻，每一步都值得回味。
> 所谓的好，都是世俗名利情权色上的好；生命的观照意义在于观，一切相毕是非相。

**九运判定必须双轴。** 八运是单轴世界：成没成、有钱没有、房有没有——世俗供应逻辑。
九运是真意义回归的高阶时空：世俗物质功名作为判定标准大幅降低，
精神境界、感受生命意义、生活幸福——这件虚无且实际的事——有了新的定义。

- `jiuyun.meaning-native`：精神有根（印气足）、感受有出口（食伤有气）、天生离相（空亡/华盖重），
  以及**卡存之盘**——被成败判刑多年的人，九运给的是「存在的正当性」：
  以不同方式活着，本身就是正当，不是失败态。
- `jiuyun.meaning-learning`：财官结构为主的八运舞台盘——九运要学的是下场，
  换一副尺子量自己。

**80/20 观察（东森）**：任何时代，舞台上只有 20% 的人，80% 的人在看戏或幕后；
但几乎所有故事与算法工具都在为那 20% 服务。本轴为那 80% 而设——
他们的生命里不会有剧情，但有比剧情更贵的东西：观照。

### 附记：木

木日主多用火土（泄秀、疏土），能用到金水的木少——推导木盘世运时建议以火土侧为主，
或用 `yongOverride` 直接指定喜用。

### 八运判定轴：用不用土

| 盘的喜用（综合流通喜忌，不以强弱为主） | 八运结论 | 键 |
|---|---|---|
| 以土为主要喜用（需湿土堤防/培金/制水、从土势、满盘土有流通） | 得世 | `bayun.favored` |
| 以火为辅（火生土、暖局而不主事） | 间接受惠 | `bayun.fire-assisted` |
| 需土但火炎土燥 | 反埋——燥上加燥、土不生金 | `bayun.buried` |
| 需土而底下渗（水多土流） | 得世·扶立——好而不彻底 | `bayun.propped` |
| 身旺火土已壅（满盘火土忌火土，要泄） | 不济 | `bayun.off` |
| 不用土 | 不济 | `bayun.off` |

「满盘土仍要土」（有流通）与「身旺火土已壅」（要泄不要补，校准案②：己酉丙寅戊午癸丑）是两端。

### 九运判定轴（能用火而非用土）

- `jiuyun.fire-aux`：火为辅用——寒局、需调候之火、身弱土主吃火者，九运的火断小吉、不断大发。
- `jiuyun.metal-water-main`：九运主供金水之气——金水为喜用者得主场。
- `jiuyun.earth-bears-metal`：九运**土生金而非埋金**——个人能拿得出的真东西（金）出土；
  火已成银河AI之火：平权（土）垄断、主真智流（水），与八运的资源特权相反。
- `jiuyun.rescue`：八运被埋者（火炎土燥），九运金水解燥而救。
- 木不参与判定（中间调剂）。

## B 端集成指引

本引擎输出的是**判定键（keys）**，不输出断语文案。集成方将键映射为自身体系的语言。
`classifyEra` 的输入特征建议由你方排盘引擎计算（五行分值、寒暖、从格、流通信号）。

## 边界声明（基础模式，非商业版）

- 本包是东森世运模型的**基础底座（基础模式）**：三元九运机制、供需模型、喜用叠加判定、
  时间窗数据、价值观内核。
- **它不是商业版本**——明镜解ME 主站（mingjing.me）运行的完整判定版
  （129+ 结构规则、强弱从格、断语生成、AI 主脑）不在本包范围，亦不出售。
- 使用者请知悉：本包输出的是**判定键（keys）与价值观标尺**；
  命盘的完整判定与解读，由各家自己的引擎、与本站的商业体系各自承接。
- 判定阈值为作者体系实战校准口径，标记 `// CALIB` 处为可调参数。
- **价值观内核见 [VALUES.md](./VALUES.md)**——本引擎的判定键（尤其卡存、意义轴）须配合
  《九运价值观内核》的断语纪律使用：算法让人看，价值观教人活。


## 联系 / Contact

- 作者：**东森**（明镜解ME 命理体系）
- 项目主页：[明镜解ME · mingjing.me](https://mingjing.me)（命理产品主站，本引擎的完整判定版在此运行）
- 邮箱：**mingjing.oss@qq.com**（合作、勘误、集成咨询）
- Issue：[GitHub Issues](https://github.com/mingjing-me/shiyun-engine/issues)（bug 与规则校准讨论）

## License

Apache-2.0 © 明镜解ME (mingjing.me)

---

## English Summary

A deterministic "era-luck" (三元九运) overlay engine for BaZi/Four-Pillars charts.
Core axiom: **chart affinity to an era is judged by what the chart *needs* (喜用), not by element *content*.**
- 8th Era (2004-2023, Earth): does the chart *use* earth? Holistic flow assessment for earth day-masters
  (earth-heavy but ventilated still uses earth; weak earth with no flow needs fire instead;
  strong earth already clogged with fire-earth needs to drain, not to refill).
- "Cannot-hold / 漏 (leaking)": supply arrives but seeps away — the chart is *propped*, not cured
  (`bayun.propped`). Such charts fit the 8th era better: the era itself was topping up their earth;
  the 9th era cuts the supply (`jiuyun.supply-cut`).
- "Blocked / 断 (blocked)": the needed elements exist in the chart but cannot connect — metal in the
  year pillar, water in the hour pillar, with fire-earth burning the bridge between
  (`jiuyun.blocked`, `era.stagnant`). Absence is easy to judge; *presence without passage* is the hard part.
- 9th Era (2024-2043, Fire): fire assists; metal & water are also usable. Dry/overheated charts buried
  in the 8th era get rescued by metal & water.
- Wood is a neutral modifier and is excluded from era verdicts.
- **Meaning axis (定风波 layer)**: the 9th era is a return of meaning itself. Material and fame-based
  judgment standards drop sharply; spiritual depth, felt experience, and quiet happiness are
  redefined. Verdicts are dual-axis now — worldly supply plus meaning (`jiuyun.meaning-native` for
  those rooted in spirit, expression, or detachment, and for long-"stagnant" charts finally granted
  existential legitimacy; `jiuyun.meaning-learning` for 8th-era stage players who must learn to
  leave the stage). Built for the 80% who were never in the spotlight.
Outputs are structured verdict keys (`keys`) for integrators to map into their own wording.
Zero dependencies. Apache-2.0.
