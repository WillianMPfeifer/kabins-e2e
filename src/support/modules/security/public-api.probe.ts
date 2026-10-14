import { expect, type APIRequestContext } from '@playwright/test';
import { toIcalDate, type IsoDate } from '../../core/dates';
import { publicApiRoutes as R } from './public-api.locators';

/** Dados pessoais que nunca podem sair numa resposta pública. */
export interface PrivateGuestData {
  telefone: string;
  email: string;
  token?: string | null;
}

/**
 * Checagens HTTP feitas de fora, sem login e sem navegador.
 *
 * Usa um `APIRequestContext` próprio, sem cookies nem token: é exatamente o que
 * um visitante anônimo (ou um robô) consegue ler da API.
 */
export class PublicApiProbe {
  constructor(private readonly request: APIRequestContext) {}

  async expectBookingRequestDenied(identifier: string, guest: PrivateGuestData): Promise<void> {
    const response = await this.request.get(R.bookingRequest(identifier));
    const body = await response.text();
    expect(response.status(), `GET ${R.bookingRequest(identifier)} sem login`).toBeGreaterThanOrEqual(400);
    this.expectNoPrivateData(body, guest);
  }

  async expectBookingRequestHidesGuest(identifier: string, guest: PrivateGuestData): Promise<void> {
    const response = await this.request.get(R.bookingRequest(identifier));
    this.expectNoPrivateData(await response.text(), guest);
  }

  async expectAvailabilityHides(cabinId: string, date: IsoDate, secret: string): Promise<void> {
    const response = await this.request.get(R.availability(cabinId, date, date));
    expect(response.ok(), 'consulta pública de disponibilidade').toBe(true);
    expect(await response.text(), 'observação privada do anfitrião').not.toContain(secret);
  }

  async expectFeedMarksNightUnavailable(slug: string, date: IsoDate): Promise<void> {
    expect(await this.feed(slug)).toContain(`DTSTART;VALUE=DATE:${toIcalDate(date)}`);
  }

  async expectFeedHides(slug: string, secret: string): Promise<void> {
    expect(await this.feed(slug), 'observação privada do anfitrião').not.toContain(secret);
  }

  async expectFeedHasReservation(slug: string, code: string): Promise<void> {
    expect(await this.feed(slug)).toContain(`#${code}`);
  }

  async expectFeedLacksReservation(slug: string, code: string): Promise<void> {
    expect(await this.feed(slug)).not.toContain(code);
  }

  /** O link copiado do painel precisa servir um calendário que o Airbnb consiga ler. */
  async expectServesCalendar(absoluteUrl: string): Promise<void> {
    const response = await this.request.get(absoluteUrl);
    expect(response.status(), `GET ${absoluteUrl}`).toBe(200);
    expect(await response.text()).toContain('BEGIN:VCALENDAR');
  }

  private async feed(slug: string): Promise<string> {
    const response = await this.request.get(R.icalFeed(slug));
    expect(response.ok(), `GET ${R.icalFeed(slug)}`).toBe(true);
    return response.text();
  }

  private expectNoPrivateData(body: string, guest: PrivateGuestData): void {
    const digits = guest.telefone.replace(/\D/g, '');
    expect(body.replace(/\D/g, ''), 'telefone do hóspede').not.toContain(digits.slice(-8));
    expect(body.toLowerCase(), 'e-mail do hóspede').not.toContain(guest.email.toLowerCase());
    if (guest.token) expect(body, 'token de confirmação').not.toContain(guest.token);
  }
}
