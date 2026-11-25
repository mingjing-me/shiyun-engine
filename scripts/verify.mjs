#!/usr/bin/env node
/**
 * 发版全链路核验（2026-11-25）：四个面一次查完，缺哪个面报哪个。
 * 用法：node scripts/verify.mjs <版本号>
 * 教训：tag≠Release、staged≠published——每个面都要亲眼验证才算完。
 */
import { execSync } from 'node:child_process';

const version = process.argv[2];
if (!version) { console.error('用法: node scripts/verify.mjs 0.5.2'); process.exit(1); }

const get = (url, headers = {}) =>
  fetch(url, { headers }).then(r => r.json().then(j => ({ status: r.status, json: j })));

const token = execSync(`grep '^GH_OSS_TOKEN=' "${process.env.HOME}/Desktop/东森文化/dongsenarc.com/cloudflare-worker/.keys-mingjing" | cut -d= -f2`, { encoding: 'utf-8' }).trim();
const gh = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };

let fail = 0;
const check = (name, ok, detail) => {
  console.log(ok ? `✓ ${name}` : `✗ ${name} —— ${detail}`);
  if (!ok) fail++;
};

// 1) GitHub：最新 tag
const tags = await get('https://api.github.com/repos/mingjing-me/shiyun-engine/tags', gh);
check('GitHub tag', tags.json?.[0]?.name === `v${version}`, `最新 tag: ${tags.json?.[0]?.name}`);

// 2) GitHub Release（tag≠Release）
const rel = await get(`https://api.github.com/repos/mingjing-me/shiyun-engine/releases/tags/v${version}`, gh);
check('GitHub Release', rel.status === 200, rel.json?.message || 'ok');

// 3) npm：正式版号（staged 不算）
const npm = await get('https://registry.npmjs.org/shiyun-engine');
const npmVer = npm.json?.['dist-tags']?.latest;
check('npm 正式版', npmVer === version, `npm latest: ${npmVer}（暂存不算数，需网页 Approve）`);

// 4) MCP Registry
const reg = await get('https://registry.modelcontextprotocol.io/v0.1/servers/io.github.mingjing-me%2Fshiyun-engine/versions/latest');
const regVer = reg.json?.server?.version;
check('MCP Registry', regVer === version, `registry: ${regVer}`);

console.log(fail ? `\n${fail} 个面没到位——别收工，补齐再收。` : '\n四个面全部到位，收工。');
process.exit(fail ? 1 : 0);
