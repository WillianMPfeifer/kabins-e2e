import { Then, When } from '../../support/fixtures';
import { currentBookingCode } from '../../support/fixtures/scenario-helpers';

When('abro "Minhas reservas"', async ({ myBookingsPage }) => {
  await myBookingsPage.open();
});

When(
  /^cancelo essa reserva em "Minhas reservas"(?: informando o motivo "([^"]*)")?$/,
  async ({ ctx, myBookingsPage }, motivo?: string) => {
    await myBookingsPage.open();
    await myBookingsPage.cancelBooking(currentBookingCode(ctx), motivo);
  },
);

Then('a reserva aparece em "Minhas reservas" como {string}', async ({ ctx, myBookingsPage }, status: string) => {
  await myBookingsPage.open();
  await myBookingsPage.expectBookingStatus(currentBookingCode(ctx), status);
});

Then(
  'o hóspede vê a reserva em "Minhas reservas" como {string}',
  async ({ ctx, session, myBookingsPage }, status: string) => {
    await session.signOut();
    await session.signInAs(ctx.get('booking').guest);
    await myBookingsPage.open();
    await myBookingsPage.expectBookingStatus(currentBookingCode(ctx), status);
  },
);

Then('não consigo mais cancelar essa reserva', async ({ ctx, myBookingsPage }) => {
  await myBookingsPage.expectCancelUnavailable(currentBookingCode(ctx));
});

Then('a reserva do outro hóspede não aparece na lista', async ({ ctx, myBookingsPage }) => {
  await myBookingsPage.expectBookingNotListed(ctx.get('booking').codigo);
});

When('acesso o comprovante da reserva do outro hóspede', async ({ ctx, bookingReceiptPage }) => {
  await bookingReceiptPage.open(ctx.get('booking').id);
});
