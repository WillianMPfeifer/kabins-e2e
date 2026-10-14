import type { IsoDate } from '../core/dates';
import type { Booking, Cabin, Persona, RegistrationData } from '../data/test-data.types';
import type { RequestedBooking } from '../modules/bookings/booking.flow';

/**
 * Tudo o que um step pode deixar para os próximos dentro do mesmo cenário.
 * Adicionar uma chave aqui é a forma explícita de "passar dado entre steps".
 */
export interface ScenarioState {
  /** Hóspede principal do cenário. */
  guest: Persona;
  /** Segundo hóspede — cenários de isolamento entre contas. */
  otherGuest: Persona;
  /** Anfitrião dono da cabana do cenário. */
  host: Persona;
  /** Anfitrião de outra cabana — cenários de isolamento entre anfitriões. */
  otherHost: Persona;
  /** Conta cujo login está sendo exercitado no cenário. */
  account: Persona;
  cabin: Cabin;
  /** Nome da cabana cadastrada pelo painel durante o cenário. */
  newCabinName: string;
  newCabinId: string;
  /** Segunda cabana do cenário (outro anfitrião, mesmo nome, conflito de datas…). */
  otherCabin: Cabin;
  booking: Booking;
  /** Conteúdo sensível configurado no guia da cabana. */
  guideSecrets: { wifiName: string; wifiPassword: string; lockCode: string };
  /** Observação privada que o anfitrião escreveu num bloqueio. */
  privateNote: string;
  /** Nova senha definida no cenário. */
  newPassword: string;
  /** Qual identificador público da reserva foi usado numa consulta anônima. */
  publicLookup: 'código' | 'identificador';
  /** Noite consultada num canal público. */
  consultedNight: IsoDate;
  /** Reserva cancelada mantida ao lado da reserva em foco. */
  cancelledBooking: Booking;
  /** Link de exportação iCal copiado do painel. */
  icalExportUrl: string;
  /** Reserva criada pela UI (id + código lidos do comprovante). */
  requestedBooking: RequestedBooking;
  stay: { checkin: IsoDate; checkout: IsoDate };
  registration: RegistrationData;
  /** Mensagens capturadas para comparação (ex.: login não revela se o e-mail existe). */
  capturedMessages: string[];
}
