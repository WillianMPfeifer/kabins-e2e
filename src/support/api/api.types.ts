/**
 * Contratos da cabanas-api consumidos pela suíte.
 *
 * Declaramos só os campos que os testes usam: o tipo documenta a dependência
 * real da suíte em relação à API, e um campo removido no backend quebra aqui,
 * no typecheck, em vez de virar `undefined` silencioso num teste.
 */

export type Papel = 'CLIENTE' | 'ANFITRIAO';
export type StatusCabana = 'ATIVA' | 'INATIVA' | 'EM_ANALISE';
export type StatusReserva = 'PENDENTE' | 'HELD' | 'CONFIRMADA' | 'RECUSADA' | 'EXPIRADA' | 'CANCELADA' | 'CONCLUIDA';

export interface ContaResumo {
  id: string;
  nome: string;
  email: string;
  admin: boolean;
  papeis?: Papel[];
  papelAtivo?: Papel;
  cadastroCompleto: boolean;
  deveTrocarSenha?: boolean;
  tipo?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiraEm: number;
  conta: ContaResumo;
}

export interface RegistroPayload {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  dataNascimento: string;
  telefone: string;
}

export interface CriarHostPayload {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
  senha: string;
}

export interface HostResponse {
  id: string;
  nome: string;
  email: string;
}

export interface CriarCabanaPayload {
  anfitriaoId: string;
  nome: string;
  descricao?: string;
  cidade: string;
  estado: string;
  capacidade?: number;
  precoBase?: number;
  horarioCheckin?: string;
  horarioCheckout?: string;
}

export interface CabanaResponse {
  id: string;
  slug: string;
  nome: string;
  cidade: string;
  estado: string;
  capacidade: number;
  status: StatusCabana;
  anfitriaoId: string;
}

export interface DiaDisponibilidade {
  data: string;
  preco: number;
  disponivel?: boolean;
  motivoBloqueio?: 'DONO' | 'RESERVA' | 'ICAL';
  /** Observação privada do anfitrião sobre o bloqueio. */
  detalhesBloqueio?: string;
}

export interface CriarReservaPayload {
  cabanaId: string;
  checkin: string;
  checkout: string;
  observacoes?: string;
  /** Confirma conscientemente uma reserva no mesmo período de outra, em outra cabana. */
  confirmarConflito?: boolean;
}

export interface CriarAvaliacaoPayload {
  nota: number;
  comentario?: string;
}

export interface AvaliacaoResponse {
  id: string;
  nota: number;
  comentario?: string | null;
}

export interface ReservaResponse {
  id: string;
  codigo: string;
  cabanaId: string;
  cabanaNome: string;
  checkin: string;
  checkout: string;
  noites: number;
  valorTotal: string;
  status: StatusReserva;
  tokenConfirmacao?: string | null;
}

export interface CriarOfertaPayload {
  titulo: string;
  tipoRegra: 'MEIO_DE_SEMANA' | 'FIM_DE_SEMANA' | 'EPOCA_PERIODO' | 'ESTADIA_LONGA' | 'PERSONALIZADA';
  tipoDesconto: 'PERCENTUAL' | 'VALOR_FIXO_DESCONTO' | 'DIARIA_FIXA';
  descontoPercentual?: number;
  dataInicio?: string;
  dataFim?: string;
  ativo?: boolean;
}
