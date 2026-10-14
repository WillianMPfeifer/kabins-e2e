import { AdminAdapter } from '../api/adapters/admin.adapter';
import { AuthAdapter } from '../api/adapters/auth.adapter';
import { BookingsAdapter } from '../api/adapters/bookings.adapter';
import { CabinsAdapter } from '../api/adapters/cabins.adapter';
import type { ApiClient } from '../api/api-client';
import type { AuthResponse, DiaDisponibilidade } from '../api/api.types';
import { addDays, birthDateForAge, daysFromToday, nightsBetween, type IsoDate } from '../core/dates';
import { generateCpf, generateMobilePhone } from '../core/documents';
import { env } from '../core/env';
import { createUniqueId, createUniqueWord } from '../core/unique-id';
import type { Booking, Cabin, CabinOptions, Persona, RegistrationData } from './test-data.types';

/** Senha que atende às duas políticas da API (cadastro e troca de senha). */
const DEFAULT_PASSWORD = 'KabinsE2e2026';

/**
 * Fábrica de massa de dados — sempre pela API, nunca pela UI.
 *
 * Cada cenário cria as próprias contas, cabanas e reservas: nada depende de
 * dado pré-existente além do admin do seed. Isso permite rodar em paralelo,
 * em qualquer ordem, contra um banco que já tem dados de execuções anteriores.
 *
 * Toda massa nasce com o prefixo `[E2E]` no nome e e-mails em
 * `@${env.emailDomain}`, para ser identificável (e limpável) no banco.
 */
export class TestDataFactory {
  private readonly auth: AuthAdapter;
  private readonly admin: AdminAdapter;
  private readonly cabins: CabinsAdapter;
  private readonly bookings: BookingsAdapter;

  constructor(
    api: ApiClient,
    private readonly adminSession: () => Promise<AuthResponse>,
  ) {
    this.auth = new AuthAdapter(api);
    this.admin = new AdminAdapter(api, async () => (await adminSession()).accessToken);
    this.cabins = new CabinsAdapter(api);
    this.bookings = new BookingsAdapter(api);
  }

  // ─── Pessoas ──────────────────────────────────────────────────────────────

  /** Dados válidos de cadastro, sem enviar — para cenários que usam o formulário público. */
  buildRegistration(overrides: Partial<RegistrationData> = {}): RegistrationData {
    const first = capitalize(createUniqueWord(7));
    return {
      nome: `${first} Hospede`,
      email: this.uniqueEmail('cliente'),
      cpf: generateCpf(),
      telefone: generateMobilePhone(),
      dataNascimento: birthDateForAge(30),
      senha: DEFAULT_PASSWORD,
      ...overrides,
    };
  }

  /** Cliente (hóspede) cadastrado pelo fluxo público da API. */
  async createClient(overrides: Partial<RegistrationData> = {}): Promise<Persona> {
    const data = this.buildRegistration(overrides);
    const auth = await this.auth.register(data);
    return this.toPersona('cliente', data.nome, data.email, data.senha, data.telefone, auth);
  }

  /** Anfitrião criado pelo admin (único caminho que concede ANFITRIAO), já com papel ativo de anfitrião. */
  async createHost(): Promise<Persona> {
    const nome = `${capitalize(createUniqueWord(7))} Anfitriao`;
    const email = this.uniqueEmail('anfitriao');
    const telefone = generateMobilePhone();
    await this.admin.createHost({ nome, email, telefone, cidade: 'Gramado', estado: 'RS', senha: DEFAULT_PASSWORD });

    const login = await this.auth.login(email, DEFAULT_PASSWORD);
    const auth =
      login.conta.papelAtivo === 'ANFITRIAO' ? login : await this.auth.switchActiveRole(login.accessToken, 'ANFITRIAO');
    return this.toPersona('anfitriao', nome, email, DEFAULT_PASSWORD, telefone, auth);
  }

  /**
   * Segunda sessão da mesma conta: outro dispositivo, ou o anfitrião no modo
   * hóspede. Trocar o papel na sessão existente alteraria a sessão original.
   */
  async newSessionOf(persona: Persona, mode?: 'cliente' | 'anfitriao'): Promise<Persona> {
    const papel = mode === 'cliente' ? 'CLIENTE' : mode === 'anfitriao' ? 'ANFITRIAO' : undefined;
    const auth = await this.auth.newSession(persona.email, persona.senha, papel);
    return { ...persona, role: mode ?? persona.role, auth };
  }

  async adminPersona(): Promise<Persona> {
    const auth = await this.adminSession();
    return this.toPersona('admin', auth.conta.nome, env.admin.email, env.admin.password, '', auth);
  }

  async deactivate(persona: Persona): Promise<void> {
    await this.admin.setUserActive(persona.id, false);
  }

  // ─── Cabanas ──────────────────────────────────────────────────────────────

  /**
   * Cabana completa e reservável: criada pelo anfitrião, aprovada pela
   * curadoria (admin) e com calendário aberto a partir de amanhã.
   */
  async createCabin(options: CabinOptions = {}, host?: Persona): Promise<Cabin> {
    const owner = host ?? (await this.createHost());
    const nightlyPrice = options.nightlyPrice ?? 300;
    const token = owner.auth.accessToken;

    const created = await this.cabins.create(token, {
      anfitriaoId: owner.id,
      nome: options.name ?? `[E2E] Refugio ${capitalize(createUniqueWord(8))}`,
      descricao: 'Cabana criada automaticamente pela suíte E2E para validar o fluxo de reservas.',
      cidade: 'Gramado',
      estado: 'RS',
      capacidade: 2,
      precoBase: nightlyPrice,
      horarioCheckin: '14:00',
      horarioCheckout: '11:00',
    });

    const status = options.pendingApproval
      ? created.status
      : (await this.cabins.setStatus((await this.adminSession()).accessToken, created.id, 'ATIVA')).status;

    await this.cabins.setAvailability(token, created.id, buildCalendar(options, nightlyPrice));

    return { ...created, status, nightlyPrice, host: owner };
  }

  /** Oferta de temporada: desconto percentual em todas as noites do período. */
  async createSeasonOffer(cabin: Cabin, percent: number, from: IsoDate, to: IsoDate): Promise<void> {
    await this.cabins.createOffer(cabin.host.auth.accessToken, cabin.id, {
      titulo: `[E2E] Temporada -${percent}%`,
      tipoRegra: 'EPOCA_PERIODO',
      tipoDesconto: 'PERCENTUAL',
      descontoPercentual: percent,
      dataInicio: from,
      dataFim: to,
      ativo: true,
    });
  }

  /** Bloqueia uma noite como o anfitrião faz no painel, com observação opcional. */
  async blockNight(cabin: Cabin, date: IsoDate, note?: string): Promise<void> {
    await this.cabins.setAvailability(cabin.host.auth.accessToken, cabin.id, [
      { data: date, preco: cabin.nightlyPrice, disponivel: false, motivoBloqueio: 'DONO', detalhesBloqueio: note },
    ]);
  }

  // ─── Reservas ─────────────────────────────────────────────────────────────

  /** Solicitação de reserva (HELD) feita pela API — atalho para cenários que começam depois dela. */
  async createBooking(
    guest: Persona,
    cabin: Cabin,
    stay: { checkin: IsoDate; checkout: IsoDate } = defaultStay(),
  ): Promise<Booking> {
    const created = await this.bookings.create(guest.auth.accessToken, { cabanaId: cabin.id, ...stay });
    return { ...created, guest, cabin };
  }

  async confirmBooking(booking: Booking): Promise<Booking> {
    const confirmed = await this.bookings.confirm(booking.cabin.host.auth.accessToken, booking.id);
    return { ...booking, ...confirmed };
  }

  async refuseBooking(booking: Booking, reason?: string): Promise<Booking> {
    const refused = await this.bookings.refuse(booking.cabin.host.auth.accessToken, booking.id, reason);
    return { ...booking, status: refused.status };
  }

  async cancelBookingAsGuest(booking: Booking): Promise<Booking> {
    const cancelled = await this.bookings.cancel(booking.guest.auth.accessToken, booking.id);
    return { ...booking, status: cancelled.status };
  }

  async completeBooking(booking: Booking, asAdmin = false): Promise<Booking> {
    const token = asAdmin ? (await this.adminSession()).accessToken : booking.cabin.host.auth.accessToken;
    const completed = await this.bookings.complete(token, booking.id);
    return { ...booking, status: completed.status };
  }

  /**
   * Estadia concluída sem esperar o calendário: a API aceita check-in hoje e
   * permite ao admin concluir administrativamente a estadia para testes. A cabana precisa de `openFromToday`.
   */
  async createCompletedStay(guest: Persona, cabin: Cabin): Promise<Booking> {
    const checkin = daysFromToday(0);
    const requested = await this.createBooking(guest, cabin, { checkin, checkout: addDays(checkin, 1) });
    return this.completeBooking(await this.confirmBooking(requested), true);
  }

  async reviewBooking(booking: Booking, nota: number, comentario?: string): Promise<void> {
    await this.bookings.review(booking.guest.auth.accessToken, booking.id, { nota, comentario });
  }

  /** Cria e cancela solicitações seguidas, consumindo a cota por hora da cabana. */
  async requestAndCancel(
    guest: Persona,
    cabin: Cabin,
    times: number,
    stay: { checkin: IsoDate; checkout: IsoDate },
  ): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.cancelBookingAsGuest(await this.createBooking(guest, cabin, stay));
    }
  }

  async getBookingAs(persona: Persona, bookingId: string) {
    return this.bookings.get(persona.auth.accessToken, bookingId);
  }

  // ─── internos ─────────────────────────────────────────────────────────────

  private uniqueEmail(kind: string): string {
    return `${kind}.${createUniqueId()}@${env.emailDomain}`;
  }

  private toPersona(
    role: Persona['role'],
    nome: string,
    email: string,
    senha: string,
    telefone: string,
    auth: AuthResponse,
  ): Persona {
    return { id: auth.conta.id, role, nome, firstName: nome.split(' ')[0], email, senha, telefone, auth };
  }
}

/** Estadia padrão: chega em D+7, fica 2 noites. Longe o bastante de "hoje" para não esbarrar em fuso. */
export function defaultStay(checkinOffset = 7, nights = 2): { checkin: IsoDate; checkout: IsoDate } {
  const checkin = daysFromToday(checkinOffset);
  return { checkin, checkout: addDays(checkin, nights) };
}

function buildCalendar(options: CabinOptions, nightlyPrice: number): DiaDisponibilidade[] {
  const openDays = options.openDays ?? 45;
  const blocked = new Set(options.blockedDates ?? []);
  // Estadias "em andamento" e avaliações precisam da noite de hoje aberta.
  const firstDay = daysFromToday(options.openFromToday ? 0 : 1);
  return nightsBetween(firstDay, addDays(firstDay, openDays)).map((data) => {
    const preco = options.nightPrices?.[data] ?? nightlyPrice;
    return blocked.has(data)
      ? { data, preco, disponivel: false, motivoBloqueio: 'DONO' as const }
      : { data, preco, disponivel: true };
  });
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
