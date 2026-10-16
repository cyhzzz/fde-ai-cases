/**
 * 把 demo-eto-equipment/index.html（引用 libs/ 的托管版）
 * 打包成内联全部依赖的单文件版，便于离线分发。
 * 用法：node build-single.js
 */
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SRC = path.join(DIR, 'index.html');
const OUT = path.join(DIR, '演示样张-单文件版.html');

let html = fs.readFileSync(SRC, 'utf8');
const before = html.length;

const inlined = [];
for (const lib of ['react.production.min.js', 'react-dom.production.min.js']) {
  const tag = `<script src="libs/${lib}"></script>`;
  const p = path.join(DIR, 'libs', lib);
  if (!html.includes(tag)) { console.log('[WARN] tag not found:', tag); continue; }
  if (!fs.existsSync(p)) { console.log('[WARN] file missing:', p); continue; }
  // 必须用 replacer 函数：库源码里含 `$&`，直接传字符串会被当成替换模式展开
  const code = fs.readFileSync(p, 'utf8');
  html = html.replace(tag, () => `<script>\n${code}\n</script>`);
  inlined.push(lib);
}

fs.writeFileSync(OUT, html);
console.log('[BUILD] ' + path.basename(OUT));
console.log('  inlined :', inlined.join(', ') || '(none)');
console.log('  size    :', (html.length / 1024).toFixed(1) + ' KB  (from ' + (before / 1024).toFixed(1) + ' KB)');
console.log('  残留外部依赖:', (html.match(/src="libs\//g) || []).length);
