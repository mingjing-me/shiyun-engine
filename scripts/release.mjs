#!/usr/bin/env node
/**
 * 一键发版（2026-11-25）：版本号、测试、git、GitHub Release、npm 暂存，一次跑完。
 * 用法：node scripts/release.mjs <版本号> "版本说明"
 * 跑完后只剩一件事要人工做：npmjs.com → Staged Packages → Approve（脚本会提示）。
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const [version, notes] = process.argv.slice(2);
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('用法: node scripts/release.mjs 0.5.3 "版本说明"');
  process.exit(1);
}
if (!notes) { console.error('缺版本说明'); process.exit(1); }

const run = (cmd, opts = {}) => {
  console.log('▸', cmd);
  return execSync(cmd, { stdio: 'inherit', ...opts });
};
const runQuiet = (cmd, opts = {}) => execSync(cmd, { encoding: 'utf-8', ...opts }).trim();

// 0) 读 GitHub token
const token = runQuiet(`grep '^GH_OSS_TOKEN=' "${process.env.HOME}/Desktop/东森文化/dongsenarc.com/cloudflare-worker/.keys-mingjing" | cut -d= -f2`);
if (!token) { console.error('找不到 GH_OSS_TOKEN'); process.exit(1); }
const authHeader = 'AUTHORIZATION: basic ' + Buffer.from(`mingjing-me:${token}`).toString('base64');

// 1) 版本号同步（package.json + server.json）
for (const f of ['package.json', 'server.json']) {
  const d = JSON.parse(fs.readFileSync(f, 'utf-8'));
  d.version = version;
  if (d.packages) d.packages[0].version = version;
  fs.writeFileSync(f, JSON.stringify(d, null, 2) + '\n');
}
console.log(`✓ 版本号 → ${version}`);

// 2) 回归测试（红则中止，不许带病发版）
run('npm test');
console.log('✓ 测试通过');

// 3) git 提交 + tag + 推送
run('git add -A');
run(`git -c user.name="mingjing-oss" -c user.email="mingjing.oss@qq.com" commit -m "v${version}: ${notes.split('\n')[0]}"`);
run(`git tag -a v${version} -m "${notes.split('\n')[0]}"`);
run(`git -c http.version=HTTP/1.1 -c http.extraHeader="${authHeader}" push origin main v${version}`);
console.log('✓ GitHub 代码与标签已推');

// 4) GitHub Release（tag 和 Release 是两回事——Release 才是给人看的版本页）
const releaseBody = JSON.stringify({ tag_name: `v${version}`, name: `v${version} · ${notes.split('\n')[0]}`, body: notes });
const out = runQuiet(`curl -s -X POST https://api.github.com/repos/mingjing-me/shiyun-engine/releases -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d @-`, { input: releaseBody });
const rel = JSON.parse(out);
if (!rel.html_url) { console.error('Release 失败:', out.slice(0, 300)); process.exit(1); }
console.log('✓ Release:', rel.html_url);

// 5) npm 暂存发布
run('npm stage publish');
console.log('✓ npm 已暂存');

console.log(`
═══ 发版完成 ═══
GitHub:  https://github.com/mingjing-me/shiyun-engine/releases/tag/v${version}
npm:     暂存已就绪 → 请打开 npmjs.com → Staged Packages → shiyun-engine@${version} → Approve（设备密钥按一下）
Registry: 若为结构调整性改版（新工具/新输入），另跑: node scripts/registry.mjs
`);
