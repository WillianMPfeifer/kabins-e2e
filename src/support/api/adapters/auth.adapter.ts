import type { ApiClient } from '../api-client';
import type { AuthResponse, Papel, RegistroPayload } from '../api.types';

/** Endpoints `/auth/*`. */
export class AuthAdapter {
  constructor(private readonly api: ApiClient) {}

  login(email: string, senha: string): Promise<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', { body: { email, senha } });
  }

  loginAdmin(email: string, senha: string): Promise<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', { body: { email, senha, tipo: 'admin' } });
  }

  register(payload: RegistroPayload): Promise<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/registro', { body: payload });
  }

  switchActiveRole(token: string, papel: Papel): Promise<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/papel-ativo', { token, body: { papel } });
  }

  /** Abre uma segunda sessão da mesma conta (ex.: outro dispositivo). */
  async newSession(email: string, senha: string, papel?: Papel): Promise<AuthResponse> {
    const login = await this.login(email, senha);
    if (!papel || login.conta.papelAtivo === papel) return login;
    return this.switchActiveRole(login.accessToken, papel);
  }
}
