const fs = require('fs');
const path = require('path');
const less = require('less');

const lessPath = path.resolve(__dirname, 'phone-code-with-flag.less');
const outCssPath = path.resolve(__dirname, 'phone-code-with-flag.css');
const outJsonPath = path.resolve(__dirname, 'country-codes.json');

async function compile() {
  const lessContent = fs.readFileSync(lessPath, 'utf8');

  const output = await less.render(lessContent, { filename: lessPath });
  fs.writeFileSync(outCssPath, output.css, 'utf8');
  console.log('Wrote', outCssPath);

  const insideTel = (() => {
    const m = lessContent.match(/\.tel-input\s*\{([\s\S]*)\n\}/);
    return m ? m[1] : lessContent;
  })();

  const codeRegex = /\.([a-z]{2})\s*\{[^}]*background-position\s*:/gi;
  const codes = [];
  let match;
  while ((match = codeRegex.exec(insideTel)) !== null) {
    codes.push(match[1]);
  }

  const imgMatch = insideTel.match(/background-image:\s*url\(([^)]+)\)/i);
  const imgPath = imgMatch ? imgMatch[1].replace(/['"]/g, '').trim() : null;

  const json = { codes, sprite: imgPath };
  fs.writeFileSync(outJsonPath, JSON.stringify(json, null, 2), 'utf8');
  console.log('Wrote', outJsonPath);
}

compile().catch(err => {
  console.error(err);
  process.exit(1);
});
