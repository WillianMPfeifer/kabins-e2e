import type { BookingGroup } from '../../support/modules/host/received-bookings.page';
import { Then, When } from '../../support/fixtures';

When('abro o painel de reservas recebidas', async ({ receivedBookingsPage }) => {
  await receivedBookingsPage.open();
});

Then('vejo o grupo {string}', async ({ receivedBookingsPage }, grupo: string) => {
  await receivedBookingsPage.expectGroupVisible(grupo as BookingGroup);
});

Then('a reserva aparece no painel', async ({ ctx, receivedBookingsPage }) => {
  await receivedBookingsPage.expectBookingListed(ctx.get('booking').codigo);
});

Then('a reserva não aparece no painel', async ({ ctx, receivedBookingsPage }) => {
  await receivedBookingsPage.expectBookingNotListed(ctx.get('booking').codigo);
});
