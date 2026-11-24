#!/usr/bin/env node
/**
 * shiyun-engine MCP Server（stdio）
 * 让 AI 客户端（Claude/Kimi/Cursor 等）直接调用世运引擎的确定性判定。
 * 用法：客户端 MCP 配置加一行 { "command": "npx", "args": ["shiyun-engine"] }
 * @license Apache-2.0 © 明镜解ME (mingjing.me)
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { eraYears, eraSupply, classifyEra, overlayDaYun, yearMarkers } from './index.js';

const server = new McpServer({ name: 'shiyun-engine', version: '0.5.0' });

const text = (obj) => ({ content: [{ type: 'text', text: JSON.stringify(obj, null, 1) }] });

server.tool(
  'era_years',
  '查询某年所属三元九运（七/八/九/一运）、时代元素与阶段节点（2024甲辰/2027丁未/2028戊申）',
  { year: z.number().int().min(1900).max(2100).describe('公历年份') },
  async ({ year }) => text(eraYears(year)),
);

server.tool(
  'era_supply',
  '查询某一运「供什么气」：八运供真土（堆），九运供金水之气、土生金而非埋金（火为银河AI之火）',
  { era: z.enum(['七运', '八运', '九运', '一运']).describe('世运名') },
  async ({ era }) => text(eraSupply(era)),
);

server.tool(
  'classify_era',
  '个人命盘×世运叠加判定（核心）。公理：不看含量看喜用——八运看用不用土（强弱不主导），' +
  '九运能用火而非用土。输出判定键：八运（得世/扶立/反埋/不济/间接受惠）、九运（火辅/金水主场/解燥/供应断/隔断）、' +
  '通塞（漏/断）、卡存、意义观照轴（定风波层）。',
  {
    wuxingScore: z.object({
      木: z.number().default(0), 火: z.number().default(0), 土: z.number().default(0),
      金: z.number().default(0), 水: z.number().default(0),
    }).describe('五行分值（含量，仅参考不主导）'),
    dayMasterWuxing: z.enum(['木', '火', '土', '金', '水']).describe('日主五行'),
    isStrong: z.boolean().nullable().optional().describe('身强弱；土日主判通塞时传 null'),
    hanNuan: z.enum(['寒', '燥', '湿', '中和']).optional().describe('寒暖燥湿'),
    congGe: z.object({
      isCong: z.boolean(), wangElement: z.enum(['木', '火', '土', '金', '水']).nullable().optional(),
      joint: z.string().optional(),
    }).optional().describe('从格信息'),
    flow: z.object({
      shuMu: z.boolean().default(false).describe('木疏（有根未合）'),
      xieJin: z.boolean().default(false).describe('金泄（透）'),
      runShui: z.boolean().default(false).describe('水润（显）'),
      blocked: z.boolean().optional().describe('金水被火土隔断（集成方排盘层判定）'),
      metalWaterLinked: z.boolean().optional().describe('金水是否连通'),
      voidHeavy: z.boolean().optional().describe('空亡重'),
      huaGai: z.boolean().optional().describe('华盖重'),
    }).optional().describe('流通/通塞信号'),
  },
  async (input) => text(classifyEra(input)),
);

server.tool(
  'overlay_dayun',
  '大运落段：每步运跨哪几运、是否在八运甜点区、是否换运×换世运同线',
  {
    daYunList: z.array(z.object({
      ganZhi: z.string(), startYear: z.number().int(), endYear: z.number().int(),
    })).describe('大运序列'),
    currentYear: z.number().int().describe('当前年份'),
  },
  async ({ daYunList, currentYear }) => text(overlayDaYun(daYunList, currentYear)),
);

server.tool(
  'year_markers',
  '流年节点：2027丁未总结年、2027-2031动荡窗口、三年三段注记',
  { year: z.number().int().min(2020).max(2040).describe('公历年份') },
  async ({ year }) => text(yearMarkers(year)),
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('shiyun-engine MCP server ready (stdio)');
