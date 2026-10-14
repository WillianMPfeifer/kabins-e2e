import type { ScenarioContext } from '../core/scenario-context';
import type { TestDataFactory } from '../data/test-data.factory';
import type { Persona, PersonaRole } from '../data/test-data.types';
import type { ScenarioState } from './scenario-state.types';

/**
 * Regras de "quem é quem" no cenário, compartilhadas pelos steps.
 * Mantém os steps declarativos: eles pedem "o hóspede", isto decide qual.
 */

/** Reutiliza o hóspede já criado no cenário (ex.: dono da reserva) ou cria um novo. */
export async function ensureGuest(ctx: ScenarioContext<ScenarioState>, data: TestDataFactory): Promise<Persona> {
  const existing = ctx.find('guest');
  if (existing) return existing;
  const guest = await data.createClient();
  ctx.set('guest', guest);
  return guest;
}

export async function personaForRole(
  role: PersonaRole,
  ctx: ScenarioContext<ScenarioState>,
  data: TestDataFactory,
): Promise<Persona> {
  switch (role) {
    case 'cliente':
      return ensureGuest(ctx, data);
    case 'anfitriao': {
      const host = await data.createHost();
      ctx.set('host', host);
      return host;
    }
    case 'admin':
      return data.adminPersona();
  }
}

/** Troca a sessão do navegador para um hóspede sem relação com a reserva em foco. */
export async function signInAsAnotherGuest(
  ctx: ScenarioContext<ScenarioState>,
  data: TestDataFactory,
  session: { signInAs(persona: Persona): Promise<void>; signOut(): Promise<void> },
): Promise<Persona> {
  const other = ctx.find('otherGuest') ?? (await data.createClient());
  ctx.set('otherGuest', other);
  await session.signOut();
  await session.signInAs(other);
  return other;
}

/** Código curto da reserva em foco — criada pela UI ou pela API. */
export function currentBookingCode(ctx: ScenarioContext<ScenarioState>): string {
  return ctx.find('requestedBooking')?.code ?? ctx.get('booking').codigo;
}

/** Noites [checkin, checkout) da reserva em foco. */
export function currentStay(ctx: ScenarioContext<ScenarioState>): { checkin: string; checkout: string } {
  return ctx.find('stay') ?? { checkin: ctx.get('booking').checkin, checkout: ctx.get('booking').checkout };
}
