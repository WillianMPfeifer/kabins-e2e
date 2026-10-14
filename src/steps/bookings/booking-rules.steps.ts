import { addDays, daysFromToday } from '../../support/core/dates';
import { defaultStay } from '../../support/data/test-data.factory';
import { Given, Then, When } from '../../support/fixtures';
import { currentBookingCode, ensureGuest } from '../../support/fixtures/scenario-helpers';

// ─── Massa ───────────────────────────────────────────────────────────────────

Given('que existe uma cabana ativa aberta desde hoje', async ({ ctx, data }) => {
  ctx.set('cabin', await data.createCabin({ openFromToday: true }));
});

Given(
  'que existe uma cabana ativa com diária de R$ {int} e a noite de daqui a {int} dias a R$ {int}',
  async ({ ctx, data }, diaria: number, dias: number, especial: number) => {
    ctx.set(
      'cabin',
      await data.createCabin({ nightlyPrice: diaria, nightPrices: { [daysFromToday(dias)]: especial } }),
    );
  },
);

Given('que existe outra cabana ativa', async ({ ctx, data }) => {
  ctx.set('otherCabin', await data.createCabin());
});

Given('que tenho uma reserva confirmada de {int} noites com chegada hoje', async ({ ctx, data }, noites: number) => {
  const guest = await ensureGuest(ctx, data);
  const checkin = daysFromToday(0);
  const booking = await data.createBooking(guest, ctx.get('cabin'), { checkin, checkout: addDays(checkin, noites) });
  ctx.set('booking', await data.confirmBooking(booking));
});

Given('que já solicitei e cancelei {int} vezes nesta cabana na última hora', async ({ ctx, data }, vezes: number) => {
  const guest = await ensureGuest(ctx, data);
  await data.requestAndCancel(guest, ctx.get('cabin'), vezes, defaultStay(7, 2));
});

Given('que estou conectado como o anfitrião da cabana no modo hóspede', async ({ ctx, data, session }) => {
  const hostAsGuest = await data.newSessionOf(ctx.get('cabin').host, 'cliente');
  ctx.set('account', hostAsGuest);
  await session.signInAs(hostAsGuest);
});

// ─── Ações ───────────────────────────────────────────────────────────────────

When('envio a solicitação', async ({ bookingRequestPage }) => {
  await bookingRequestPage.submit();
});

When('seleciono no calendário da outra cabana as mesmas noites', async ({ ctx, bookingRequestPage }) => {
  const other = ctx.get('otherCabin');
  const { checkin, checkout } = ctx.get('booking');
  await bookingRequestPage.open(other.slug, other.nome);
  await bookingRequestPage.selectStay(checkin, checkout);
});

When('confirmo que estou ciente do conflito', async ({ bookingRequestPage }) => {
  await bookingRequestPage.acceptConflict();
});

When('tento cancelar essa reserva em "Minhas reservas"', async ({ ctx, myBookingsPage }) => {
  await myBookingsPage.open();
  await myBookingsPage.tryToCancel(currentBookingCode(ctx));
});

// ─── Verificações ────────────────────────────────────────────────────────────

Then('vejo o aviso de que já tenho reserva ativa nessas datas', async ({ bookingRequestPage }) => {
  await bookingRequestPage.expectConflictWarning();
});

Then('o comprovante mostra o total de {string}', async ({ bookingReceiptPage }, total: string) => {
  await bookingReceiptPage.expectLoaded();
  await bookingReceiptPage.expectDetail('Valor Total', total);
});

Then('vejo no card da reserva {string}', async ({ ctx, myBookingsPage }, mensagem: string) => {
  await myBookingsPage.expectCardMessage(currentBookingCode(ctx), mensagem);
});

Given(
  'o anfitrião criou uma oferta de {int}% para as próximas {int} semanas',
  async ({ ctx, data }, percentual: number, semanas: number) => {
    await data.createSeasonOffer(ctx.get('cabin'), percentual, daysFromToday(1), daysFromToday(semanas * 7));
  },
);
