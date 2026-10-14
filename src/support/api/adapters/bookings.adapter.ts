import type { ApiClient } from '../api-client';
import type { AvaliacaoResponse, CriarAvaliacaoPayload, CriarReservaPayload, ReservaResponse } from '../api.types';

/** Endpoints `/reservas/*`. */
export class BookingsAdapter {
  constructor(private readonly api: ApiClient) {}

  create(token: string, payload: CriarReservaPayload): Promise<ReservaResponse> {
    return this.api.post<ReservaResponse>('/reservas', { token, body: payload });
  }

  get(token: string, bookingId: string): Promise<ReservaResponse> {
    return this.api.get<ReservaResponse>(`/reservas/${bookingId}`, { token });
  }

  confirm(token: string, bookingId: string): Promise<ReservaResponse> {
    return this.api.patch<ReservaResponse>(`/reservas/${bookingId}/confirmar`, { token });
  }

  refuse(token: string, bookingId: string, motivo?: string): Promise<ReservaResponse> {
    return this.api.patch<ReservaResponse>(`/reservas/${bookingId}/recusar`, {
      token,
      body: motivo ? { motivo } : {},
    });
  }

  cancel(token: string, bookingId: string, motivo?: string): Promise<ReservaResponse> {
    return this.api.patch<ReservaResponse>(`/reservas/${bookingId}/cancelar`, {
      token,
      body: motivo ? { motivo } : {},
    });
  }

  complete(token: string, bookingId: string): Promise<ReservaResponse> {
    return this.api.patch<ReservaResponse>(`/reservas/${bookingId}/concluir`, { token });
  }

  review(token: string, bookingId: string, payload: CriarAvaliacaoPayload): Promise<AvaliacaoResponse> {
    return this.api.post<AvaliacaoResponse>(`/reservas/${bookingId}/avaliacao`, { token, body: payload });
  }
}
