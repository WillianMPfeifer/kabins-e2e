import type { BrowserContext } from '@playwright/test';
import type { AuthResponse } from '../api/api.types';
import { env } from '../core/env';

/**
 * Autentica o navegador sem passar pela tela de login.
 *
 * Reproduz exatamente o que a Server Action de login do cabanas-web grava
 * (`saveSession` em `features/auth/services/auth-session.ts`): os mesmos
 * cookies, com os mesmos nomes e flags. A sessão é real — emitida pela API e
 * registrada na tabela `session` — então o app a valida como qualquer outra.
 *
 * Por que não logar pela UI em todo cenário: o login é coberto pelos cenários
 * de `features/auth`; repeti-lo em cada teste só adiciona tempo, flakiness e
 * consumo do rate limit de credenciais (5/min por IP em produção).
 *
 * ⚠️ Se o web mudar nomes/formato dos cookies, este arquivo é o único ponto a ajustar.
 */
export const SESSION_COOKIES = {
  /** Único cookie que o Firebase Hosting repassa ao servidor em produção. */
  session: '__session',
  access: 'cb_at',
  refresh: 'cb_rt',
  account: 'cb_conta',
  betterAuth: 'better-auth.session_token',
} as const;

export async function injectSession(context: BrowserContext, auth: AuthResponse): Promise<void> {
  const url = new URL(env.baseUrl);
  const secure = url.protocol === 'https:';
  const expires = Math.floor(Date.now() / 1000) + Math.max(60, auth.expiraEm - 30);
  const base = { domain: url.hostname, path: '/', sameSite: 'Lax' as const, secure, expires };

  const conta = { ...auth.conta, tipo: accountType(auth) };

  await context.addCookies([
    { ...base, name: SESSION_COOKIES.session, value: auth.accessToken, httpOnly: true },
    { ...base, name: SESSION_COOKIES.access, value: auth.accessToken, httpOnly: true },
    { ...base, name: SESSION_COOKIES.betterAuth, value: auth.accessToken, httpOnly: true },
    { ...base, name: SESSION_COOKIES.refresh, value: auth.refreshToken, httpOnly: true },
    // Next serializa o valor com encodeURIComponent ao gravar via `cookies().set`.
    { ...base, name: SESSION_COOKIES.account, value: encodeURIComponent(JSON.stringify(conta)), httpOnly: false },
  ]);
}

export async function clearSession(context: BrowserContext): Promise<void> {
  await context.clearCookies();
}

function accountType(auth: AuthResponse): string {
  if (auth.conta.admin) return 'admin';
  return auth.conta.papelAtivo === 'ANFITRIAO' ? 'dono' : 'cliente';
}
