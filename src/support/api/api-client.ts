import { request, type APIRequestContext, type APIResponse } from '@playwright/test';
import { env } from '../core/env';

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/** Corpo de erro padronizado pelo filtro global da cabanas-api. */
interface ApiErrorBody {
  statusCode?: number;
  erro?: string;
  mensagem?: string | string[];
  traceId?: string;
}

export class ApiError extends Error {
  constructor(
    readonly method: Method,
    readonly path: string,
    readonly status: number,
    readonly body: ApiErrorBody | string,
  ) {
    const detail = typeof body === 'string' ? body : [body.mensagem].flat().join('; ');
    const trace = typeof body === 'object' && body.traceId ? ` (traceId ${body.traceId})` : '';
    super(`[API] ${method} ${path} → ${status}: ${detail}${trace}`);
    this.name = 'ApiError';
  }
}

export interface RequestOptions {
  token?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

const MAX_RETRIES_ON_THROTTLE = 3;

/**
 * Cliente HTTP fino sobre o `APIRequestContext` do Playwright.
 *
 * - Requisições aparecem no trace do Playwright (depuração de massa de dados).
 * - Erros viram `ApiError` com status, mensagem e `traceId` da API — o que
 *   cruza direto com o log do backend.
 * - 429 é repetido com backoff: o throttler por IP da API é compartilhado por
 *   todos os workers, e a massa de dados não deve falhar por concorrência.
 */
export class ApiClient {
  private constructor(private readonly ctx: APIRequestContext) {}

  static async create(): Promise<ApiClient> {
    const ctx = await request.newContext({
      baseURL: `${env.apiUrl}/`,
      extraHTTPHeaders: { Accept: 'application/json', 'X-E2E-Suite': 'cabanas-e2e' },
    });
    return new ApiClient(ctx);
  }

  async dispose(): Promise<void> {
    await this.ctx.dispose();
  }

  get<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return this.send<T>('GET', path, options);
  }

  post<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.send<T>('POST', path, options);
  }

  patch<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.send<T>('PATCH', path, options);
  }

  delete<T>(path: string, options?: Omit<RequestOptions, 'body'>): Promise<T> {
    return this.send<T>('DELETE', path, options);
  }

  /** Executa sem lançar erro — para cenários que validam o próprio status HTTP. */
  async raw(method: Method, path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.ctx.fetch(path.replace(/^\//, ''), {
      method,
      data: options.body,
      params: compact(options.query),
      headers: options.token ? { Authorization: `Bearer ${options.token}` } : undefined,
    });
  }

  private async send<T>(method: Method, path: string, options: RequestOptions = {}, attempt = 0): Promise<T> {
    const response = await this.raw(method, path, options);

    if (response.status() === 429 && attempt < MAX_RETRIES_ON_THROTTLE) {
      const retryAfter = Number(response.headers()['retry-after']);
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 1500;
      await new Promise((resolve) => setTimeout(resolve, Math.min(waitMs, 15_000)));
      return this.send<T>(method, path, options, attempt + 1);
    }

    const text = await response.text();
    const parsed = text ? safeJson(text) : undefined;

    if (!response.ok()) {
      throw new ApiError(method, path, response.status(), (parsed as ApiErrorBody | undefined) ?? text);
    }
    return parsed as T;
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function compact(query?: RequestOptions['query']): Record<string, string | number | boolean> | undefined {
  if (!query) return undefined;
  return Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined)) as Record<
    string,
    string | number | boolean
  >;
}
