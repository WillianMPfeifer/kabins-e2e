import { defaultStay } from '../../support/data/test-data.factory';
import { Given } from '../../support/fixtures';
import { ensureGuest } from '../../support/fixtures/scenario-helpers';

/*
 * Massa de reservas via API: estes steps preparam o "mundo" para cenários que
 * começam depois da solicitação. A solicitação pela UI é coberta em
 * `solicitar-reserva.feature`.
 */

Given(
  'outro hóspede já solicitou {int} noites com chegada daqui a {int} dias',
  async ({ ctx, data }, noites: number, dias: number) => {
    const otherGuest = await data.createClient();
    ctx.set('otherGuest', otherGuest);
    ctx.set('booking', await data.createBooking(otherGuest, ctx.get('cabin'), defaultStay(dias, noites)));
  },
);

Given(
  'um hóspede solicitou {int} noites com chegada daqui a {int} dias',
  async ({ ctx, data }, noites: number, dias: number) => {
    const guest = await data.createClient();
    ctx.set('booking', await data.createBooking(guest, ctx.get('cabin'), defaultStay(dias, noites)));
  },
);

Given(
  'que tenho uma solicitação de {int} noites com chegada daqui a {int} dias',
  async ({ ctx, data }, noites: number, dias: number) => {
    const guest = await ensureGuest(ctx, data);
    ctx.set('booking', await data.createBooking(guest, ctx.get('cabin'), defaultStay(dias, noites)));
  },
);

Given(
  'que tenho uma reserva confirmada de {int} noites com chegada daqui a {int} dias',
  async ({ ctx, data }, noites: number, dias: number) => {
    const guest = await ensureGuest(ctx, data);
    const booking = await data.createBooking(guest, ctx.get('cabin'), defaultStay(dias, noites));
    ctx.set('booking', await data.confirmBooking(booking));
  },
);

Given(
  'existe uma reserva confirmada de {int} noites com chegada daqui a {int} dias',
  async ({ ctx, data }, noites: number, dias: number) => {
    const guest = await data.createClient();
    const booking = await data.createBooking(guest, ctx.get('cabin'), defaultStay(dias, noites));
    ctx.set('booking', await data.confirmBooking(booking));
  },
);

Given('que o anfitrião já aprovou essa solicitação', async ({ ctx, data }) => {
  ctx.set('booking', await data.confirmBooking(ctx.get('booking')));
});
