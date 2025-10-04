import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function toCssVars(theme) {
  const lines = [];
  const colors = theme.colors || {};
  Object.entries(colors).forEach(([key, value]) => {
    const val = typeof value === 'object' && value.value ? value.value : value;
    lines.push(`  --${key.replace(/_/g, '-')}: ${val};`);
  });
  return lines.join('\n');
}

function generateCss(design) {
  const light = design.theme?.light ?? {};
  const dark = design.theme?.dark ?? {};
  const typography = design.typography || {};

  const lightVars = toCssVars(light);
  const darkVars = toCssVars(dark);

  const fonts = [];
  if (typography['font-sans']) fonts.push(`  --font-sans: ${typography['font-sans']};`);
  if (typography['font-mono']) fonts.push(`  --font-mono: ${typography['font-mono']};`);

  return `/* AUTO-GENERATED from design.json. Do not edit by hand. */\n:root {\n${lightVars}\n${fonts.join('\n')}\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n${darkVars}\n  }\n}\n`;
}

try {
  const projectRoot = resolve(__dirname, '..');
  const candidatePaths = [
    resolve(projectRoot, '..', '..', 'design.json'),
    resolve(projectRoot, '..', 'design.json'),
    resolve(projectRoot, 'design.json'),
  ];
  let designPath = '';
  for (const p of candidatePaths) {
    try {
      // simple existence check
      readFileSync(p, 'utf8');
      designPath = p;
      break;
    } catch (_) {
      // continue
    }
  }
  if (!designPath) {
    throw new Error(`design.json not found. Tried: ${candidatePaths.join(', ')}`);
  }
  const outDir = resolve(projectRoot, 'src', 'styles');
  const outFile = resolve(outDir, 'design-tokens.css');

  const design = JSON.parse(readFileSync(designPath, 'utf8'));
  const css = generateCss(design);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, css, 'utf8');
  console.log('Design tokens generated at', outFile);
} catch (err) {
  console.error('Failed to generate design tokens:', err);
  process.exit(1);
}

