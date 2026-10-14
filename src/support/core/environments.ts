/**
 * Ambientes-alvo da suíte. Qual deles roda é escolhido por `E2E_ENV` no `.env`
 * (padrão: `local`).
 *
 * Variáveis explícitas no `.env` ou no shell (`E2E_BASE_URL`, `E2E_API_URL`,
 * `E2E_ADMIN_EMAIL`...) têm prioridade sobre o perfil — é assim que o CI
 * aponta para staging sem precisar de um perfil novo.
 *
 * Senhas de ambientes reais nunca ficam aqui: vêm do `.env` (fora do Git) ou
 * dos segredos do CI.
 */
export interface EnvironmentProfile {
  /** URL do front (cabanas-web). */
  baseUrl: string;
  /** URL da API já com o prefixo de versão (cabanas-api). */
  apiUrl: string;
  /** Credenciais do admin. Sem valor = obrigatório informar no `.env`. */
  adminEmail?: string;
  adminPassword?: string;
  /** Workers padrão do perfil (sobrescrito por `E2E_WORKERS`). */
  workers?: number;
  /** Ambiente com dados reais: o global-setup avisa antes de rodar. */
  real: boolean;
}

export const ENVIRONMENTS = {
  /** API :3333 e Web :3000 subidos na máquina, banco com o seed aplicado. */
  local: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3333/api/v1',
    adminEmail: 'admin@cabanas.local',
    adminPassword: 'Admin2026!',
    real: false,
  },
  /**
   * Produção (Firebase Hosting → Cloud Run). A API limita login/cadastro a
   * 5 req/min por IP, então o perfil roda com 1 worker — prefira `@smoke`.
   */
  production: {
    baseUrl: 'https://kabins.com.br',
    apiUrl: 'https://kabins-api-1001932262140.southamerica-east1.run.app/api/v1',
    workers: 1,
    real: true,
  },
} satisfies Record<string, EnvironmentProfile>;

export type EnvironmentName = keyof typeof ENVIRONMENTS;

export const DEFAULT_ENVIRONMENT: EnvironmentName = 'local';
