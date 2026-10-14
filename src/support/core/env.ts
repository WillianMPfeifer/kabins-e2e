import 'dotenv/config';
import { DEFAULT_ENVIRONMENT, ENVIRONMENTS, type EnvironmentName, type EnvironmentProfile } from './environments';

/**
 * Leitura centralizada e validada das variáveis de ambiente.
 *
 * Nenhum outro arquivo lê `process.env` diretamente: se uma variável muda de
 * nome, muda aqui. Falhar cedo (no carregamento da config) é melhor do que um
 * teste quebrar no meio com `undefined` numa URL.
 */

function required(name: string, fallback?: string): string {
  const value = process.env[name]?.trim() || fallback;
  if (!value) {
    throw new Error(`[e2e] Variável de ambiente obrigatória ausente: ${name}. Veja .env.example.`);
  }
  return value;
}

function bool(name: string, fallback = false): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'sim'].includes(value);
}

function int(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function environmentName(): EnvironmentName {
  const value = process.env.E2E_ENV?.trim().toLowerCase() || DEFAULT_ENVIRONMENT;
  if (!Object.hasOwn(ENVIRONMENTS, value)) {
    throw new Error(`[e2e] E2E_ENV inválido: "${value}". Use: ${Object.keys(ENVIRONMENTS).join(', ')}.`);
  }
  return value as EnvironmentName;
}

const ci = bool('CI');
const name = environmentName();
const profile: EnvironmentProfile = ENVIRONMENTS[name];

export const env = {
  ci,
  /** Perfil escolhido em `E2E_ENV` (ver environments.ts). */
  name,
  /** Ambiente com dados reais: o global-setup avisa antes de rodar. */
  real: profile.real,
  /** URL do front (cabanas-web). */
  baseUrl: stripTrailingSlash(required('E2E_BASE_URL', profile.baseUrl)),
  /** URL da API já com o prefixo de versão (cabanas-api). */
  apiUrl: stripTrailingSlash(required('E2E_API_URL', profile.apiUrl)),
  // `E2E_PRODUCTION_ADMIN_EMAIL` etc. deixam as credenciais de cada ambiente
  // juntas no mesmo .env — trocar de ambiente é só mudar E2E_ENV.
  admin: {
    email: required(`E2E_${name.toUpperCase()}_ADMIN_EMAIL`, process.env.E2E_ADMIN_EMAIL?.trim() || profile.adminEmail),
    password: required(
      `E2E_${name.toUpperCase()}_ADMIN_PASSWORD`,
      process.env.E2E_ADMIN_PASSWORD?.trim() || profile.adminPassword,
    ),
  },
  /** Domínio dos e-mails gerados — facilita identificar e limpar massa de teste. */
  emailDomain: required('E2E_EMAIL_DOMAIN', 'e2e.kabins.test'),
  workers: process.env.E2E_WORKERS ? int('E2E_WORKERS', 2) : (profile.workers ?? (ci ? 2 : undefined)),
  allBrowsers: bool('E2E_ALL_BROWSERS'),
  /** Usa um navegador instalado no lugar do Chromium do Playwright (ex.: msedge, chrome). */
  browserChannel: process.env.E2E_BROWSER_CHANNEL?.trim() || undefined,
  /** Pula a checagem de saúde do global-setup (útil só para depurar a própria suíte). */
  skipHealthCheck: bool('E2E_SKIP_HEALTHCHECK'),
} as const;

export type Env = typeof env;
