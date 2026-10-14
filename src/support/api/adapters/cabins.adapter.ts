import type { ApiClient } from '../api-client';
import type {
  CabanaResponse,
  CriarCabanaPayload,
  CriarOfertaPayload,
  DiaDisponibilidade,
  StatusCabana,
} from '../api.types';

/** Endpoints `/cabanas/*`. */
export class CabinsAdapter {
  constructor(private readonly api: ApiClient) {}

  create(token: string, payload: CriarCabanaPayload): Promise<CabanaResponse> {
    return this.api.post<CabanaResponse>('/cabanas', { token, body: payload });
  }

  setStatus(token: string, cabinId: string, status: StatusCabana): Promise<CabanaResponse> {
    return this.api.patch<CabanaResponse>(`/cabanas/${cabinId}/status`, { token, body: { status } });
  }

  async setAvailability(token: string, cabinId: string, datas: DiaDisponibilidade[]): Promise<void> {
    await this.api.patch(`/cabanas/${cabinId}/disponibilidade`, { token, body: { datas } });
  }

  async createOffer(token: string, cabinId: string, payload: CriarOfertaPayload): Promise<void> {
    await this.api.post(`/cabanas/${cabinId}/ofertas`, { token, body: payload });
  }

  getPublic(idOrSlug: string): Promise<CabanaResponse> {
    return this.api.get<CabanaResponse>(`/cabanas/${idOrSlug}`);
  }
}
