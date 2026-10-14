import type { AuthResponse, CabanaResponse, ReservaResponse } from '../api/api.types';
import type { IsoDate } from '../core/dates';

export type PersonaRole = 'cliente' | 'anfitriao' | 'admin';

/** Uma conta real, criada pela API para um cenário específico. */
export interface Persona {
  id: string;
  role: PersonaRole;
  nome: string;
  /** Primeiro nome — é o que o menu de conta exibe. */
  firstName: string;
  email: string;
  senha: string;
  telefone: string;
  /** Sessão emitida pela API; usada para injetar cookies no navegador e para chamadas de massa. */
  auth: AuthResponse;
}

/** Dados de cadastro ainda não enviados (para preencher o formulário público). */
export interface RegistrationData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: IsoDate;
  senha: string;
}

export interface CabinOptions {
  /** Quantos dias, a partir de amanhã, ficam abertos no calendário (padrão 45). */
  openDays?: number;
  /** Diária em reais (padrão 300). */
  nightlyPrice?: number;
  /** Datas fechadas manualmente pelo anfitrião (motivo DONO). */
  blockedDates?: IsoDate[];
  /** Mantém a cabana em análise (não aprovada pela curadoria). */
  pendingApproval?: boolean;
  /** Nome exato da cabana (padrão: "[E2E] Refugio <palavra única>"). */
  name?: string;
  /** Diárias diferentes da padrão, por data. */
  nightPrices?: Record<IsoDate, number>;
  /** Abre também a noite de hoje (padrão: o calendário começa amanhã). */
  openFromToday?: boolean;
}

export interface Cabin extends CabanaResponse {
  nightlyPrice: number;
  host: Persona;
}

export interface Booking extends ReservaResponse {
  guest: Persona;
  cabin: Cabin;
}
