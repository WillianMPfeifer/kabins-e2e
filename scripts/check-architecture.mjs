#!/usr/bin/env node
/**
 * Verificação estática dos contratos de arquitetura (docs/architecture-standards.md).
 *
 * Complementa o ESLint com regras sobre **estrutura** que ele não enxerga:
 *  1. Nomes de arquivo em `src/support/modules` — kebab-case + sufixo aprovado.
 *  2. Todo `*.page.ts` tem um `*.locators.ts` correspondente no mesmo módulo
 *     (ou consome locators de outro arquivo do módulo). `*.probe.ts` (checagem
 *     HTTP sem navegador) não usa `page`.
 *  3. Steps ficam em `src/steps/<módulo>/*.steps.ts`.
 *  4. Features ficam em `features/<módulo>/*.feature`, declaram `# language: pt`
 *     e têm ao menos uma tag de módulo no topo.
 *  5. Uso de seletor CSS em locators é sinalizado (aviso, não erro).
 *  6. Cenários marcados com @bug precisam de @fail ou @fixme (bug conhecido nunca
 *     fica verde por acidente, nem vermelho sem explicação).
 *
 * Sai com código 1 se houver violação — roda no `npm run quality` e no CI.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODULE_SUFFIXES = ['.locators.ts', '.page.ts', '.probe.ts', '.flow.ts', '.adapter.ts', '.types.ts'];
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const errors = [];
const warnings = [];
const rel = (p) => relative(root, p).split(sep).join('/');

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

// 1 + 2 + 5 — módulos
const modulesDir = join(root, 'src', 'support', 'modules');
for (const file of walk(modulesDir)) {
  const name = basename(file);
  const suffix = MODULE_SUFFIXES.find((s) => name.endsWith(s));
  if (!suffix) {
    errors.push(`${rel(file)}: sufixo não aprovado (use ${MODULE_SUFFIXES.join(', ')}).`);
    continue;
  }
  const stem = name.slice(0, -suffix.length);
  if (!KEBAB.test(stem)) errors.push(`${rel(file)}: nome deve ser kebab-case.`);

  const source = readFileSync(file, 'utf8');
  if (suffix === '.page.ts' && !/from '\.\/[a-z0-9-]+\.locators'/.test(source)) {
    errors.push(`${rel(file)}: Page Object deve consumir seletores de um *.locators.ts do módulo.`);
  }
  if (suffix === '.page.ts' && /this\.page\.(getBy|locator)\(/.test(source)) {
    errors.push(`${rel(file)}: Page Object criou seletor inline — declare-o no *.locators.ts.`);
  }
  if (suffix === '.probe.ts' && /\bthis\.page\b/.test(source)) {
    errors.push(`${rel(file)}: Probe não usa o navegador — para telas, crie um *.page.ts.`);
  }
  if (suffix === '.locators.ts') {
    const cssUses = source.match(/\bcss:\s*[`'"]/g)?.length ?? 0;
    if (cssUses > 0) warnings.push(`${rel(file)}: ${cssUses} locator(s) por CSS — prefira role/label/testId.`);
  }
}

// 3 — steps
for (const file of walk(join(root, 'src', 'steps'))) {
  const parts = rel(file).split('/');
  if (!file.endsWith('.steps.ts')) errors.push(`${rel(file)}: arquivos em src/steps devem terminar com .steps.ts.`);
  if (parts.length !== 4) errors.push(`${rel(file)}: steps ficam em src/steps/<módulo>/<arquivo>.steps.ts.`);
}

// 4 + 6 — features
for (const file of walk(join(root, 'features'))) {
  if (!file.endsWith('.feature')) continue;
  const parts = rel(file).split('/');
  if (parts.length !== 3) errors.push(`${rel(file)}: features ficam em features/<módulo>/<arquivo>.feature.`);
  if (!KEBAB.test(basename(file, '.feature'))) errors.push(`${rel(file)}: nome deve ser kebab-case.`);

  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  if (!lines[0]?.startsWith('# language: pt')) errors.push(`${rel(file)}: primeira linha deve ser "# language: pt".`);
  const featureIdx = lines.findIndex((l) => l.trim().startsWith('Funcionalidade:'));
  if (featureIdx < 1 || !lines[featureIdx - 1].trim().startsWith('@')) {
    errors.push(`${rel(file)}: a Funcionalidade precisa de tag(s) de módulo na linha anterior.`);
  }
  lines.forEach((line, i) => {
    const tags = line.trim().startsWith('@') ? line.trim().split(/\s+/) : [];
    if (tags.includes('@bug') && !tags.includes('@fail') && !tags.includes('@fixme')) {
      errors.push(`${rel(file)}:${i + 1}: @bug exige @fail (comportamento errado conhecido) ou @fixme.`);
    }
    if (tags.includes('@only')) errors.push(`${rel(file)}:${i + 1}: @only não pode ser versionado.`);
  });
}

for (const w of warnings) console.warn(`⚠  ${w}`);
if (errors.length) {
  console.error(`\n✖ ${errors.length} violação(ões) de arquitetura:\n`);
  for (const e of errors) console.error(`  • ${e}`);
  process.exit(1);
}
console.warn(`✔ Arquitetura OK${warnings.length ? ` (${warnings.length} aviso(s))` : ''}.`);
