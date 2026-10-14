import type { ApiClient } from '../api-client';
import type { CriarHostPayload, HostResponse } from '../api.types';

/** Endpoints `/admin/*` — exigem token de AdminPlataforma. */
export class AdminAdapter {
  constructor(
    private readonly api: ApiClient,
    private readonly adminToken: () => Promise<string>,
  ) {}

  async createHost(payload: CriarHostPayload): Promise<HostResponse> {
    return this.api.post<HostResponse>('/admin/hosts', { token: await this.adminToken(), body: payload });
  }

  /** Ativa/inativa o cadastro de uma Pessoa (cliente ou anfitrião). */
  async setUserActive(personId: string, ativo: boolean): Promise<void> {
    await this.api.patch(`/admin/usuarios/${personId}/status`, { token: await this.adminToken(), body: { ativo } });
  }
}
