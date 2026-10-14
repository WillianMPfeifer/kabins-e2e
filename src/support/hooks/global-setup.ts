import { request } from '@playwright/test';
import { env } from '../core/env';

/**
 * Falha rápido, com mensagem acionável, se o ambiente-alvo não estiver de pé.
 * Sem isso, cada cenário quebraria com timeout — 60 s × N cenários de ruído.
 */
export default async function globalSetup(): Promise<void> {
  console.warn(`[e2e] Ambiente: ${env.name} — web ${env.baseUrl} · api ${env.apiUrl}`);
  if (env.real) {
    console.warn(
      `[e2e] ⚠️  "${env.name}" tem dados reais: a suíte cria contas, cabanas e reservas de teste ` +
        `(prefixo [E2E], e-mails @${env.emailDomain}). Prefira rodar só @smoke.`,
    );
  }
  if (env.skipHealthCheck) return;

  const ctx = await request.newContext();
  try {
    await expectUp(ctx, `${env.apiUrl}/health`, 'cabanas-api', (body) => body.includes('"status":"ok"'));
    await expectUp(ctx, env.baseUrl, 'cabanas-web');

    const login = await ctx.post(`${env.apiUrl}/auth/login`, {
      data: { email: env.admin.email, senha: env.admin.password, tipo: 'admin' },
    });
    if (!login.ok()) {
      throw new Error(
        `[global-setup] Login do admin falhou (${login.status()}). ` +
          'Confira E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD no .env e, no ambiente local, se o seed da cabanas-api foi aplicado.',
      );
    }
  } finally {
    await ctx.dispose();
  }
}

async function expectUp(
  ctx: Awaited<ReturnType<typeof request.newContext>>,
  url: string,
  name: string,
  check: (body: string) => boolean = () => true,
): Promise<void> {
  try {
    const response = await ctx.get(url, { timeout: 60_000 });
    if (response.ok() && check(await response.text())) return;
    throw new Error(`status ${response.status()}`);
  } catch (error) {
    throw new Error(
      `[global-setup] ${name} indisponível em ${url} (${(error as Error).message}). ` +
        `Suba o ambiente "${env.name}" ou troque E2E_ENV no .env.`,
    );
  }
}
