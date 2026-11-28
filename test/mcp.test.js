// MCP 接口测试（2026-11-28 M8ven 审计建议）：5 个工具全部经 stdio JSON-RPC 按名调用验证。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

function callMcp(toolName, args) {
  return new Promise((resolve, reject) => {
    const srv = spawn(process.execPath, ['src/mcp.js'], { stdio: ['pipe', 'pipe', 'pipe'] });
    const timer = setTimeout(() => { srv.kill(); reject(new Error('mcp timeout')); }, 15000);
    srv.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'test', version: '1' } } }) + '\n');
    srv.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    srv.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: toolName, arguments: args } }) + '\n');
    let buf = '';
    srv.stdout.on('data', (d) => {
      buf += d.toString();
      for (const line of buf.split('\n').filter(Boolean)) {
        try {
          const j = JSON.parse(line);
          if (j.id === 2) {
            clearTimeout(timer); srv.kill();
            if (j.error) return reject(new Error(j.error.message));
            resolve(JSON.parse(j.result.content[0].text));
          }
        } catch { /* 半行 */ }
      }
    });
    srv.on('error', reject);
  });
}

test('MCP era_years 按名调用', async () => {
  const r = await callMcp('era_years', { year: 2027 });
  assert.equal(r.era, '九运');
  assert.equal(r.phase, '丁未·总结年');
});

test('MCP era_supply 按名调用', async () => {
  const r = await callMcp('era_supply', { era: '九运' });
  assert.deepEqual(r.gives, ['金', '水']);
});

test('MCP classify_era 按名调用（校准案① 癸丑甲子己亥甲戌）', async () => {
  const r = await callMcp('classify_era', {
    wuxingScore: { 木: 2.5, 火: 0.3, 土: 2, 金: 0.8, 水: 3.5 },
    dayMasterWuxing: '土', isStrong: false, hanNuan: '寒',
    flow: { shuMu: true, xieJin: false, runShui: true },
  });
  assert.equal(r.baYun, '得世·扶立');
  assert.equal(r.flowState.state, 'leaking');
  assert.equal(r.jiuYun.verdict, 'jiuyun.supply-cut');
});

test('MCP overlay_dayun 按名调用', async () => {
  const r = await callMcp('overlay_dayun', { daYunList: [{ ganZhi: '己未', startYear: 2016, endYear: 2025 }], currentYear: 2026 });
  assert.equal(r[0].sweetSpot, true);
  assert.ok(r[0].spans.includes('八运') && r[0].spans.includes('九运'));
});

test('MCP year_markers 按名调用', async () => {
  const r = await callMcp('year_markers', { year: 2027 });
  assert.equal(r.isSummaryYear, true);
  assert.equal(r.window, '2027-2031');
});
