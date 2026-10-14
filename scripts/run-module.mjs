#!/usr/bin/env node
/**
 * Executa apenas as features de um módulo.
 *   npm run test:module -- bookings
 *   npm run test:module -- auth --headed
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';

const [moduleName, ...rest] = process.argv.slice(2);
const available = readdirSync('features', { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

if (!moduleName || !existsSync(`features/${moduleName}`)) {
  console.error(`Uso: npm run test:module -- <módulo> [opções do playwright]\nMódulos: ${available.join(', ')}`);
  process.exit(1);
}

const run = (cmd, args) => spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' }).status ?? 1;

const gen = run('npx', ['bddgen']);
if (gen !== 0) process.exit(gen);
process.exit(run('npx', ['playwright', 'test', `.features-gen/${moduleName}/`, ...rest]));
