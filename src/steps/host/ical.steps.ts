import { defaultStay } from '../../support/data/test-data.factory';
import { Given, Then, When } from '../../support/fixtures';

Given('outra reserva da cabana foi cancelada', async ({ ctx, data }) => {
  const guest = await data.createClient();
  const booking = await data.createBooking(guest, ctx.get('cabin'), defaultStay(20, 2));
  ctx.set('cancelledBooking', await data.cancelBookingAsGuest(booking));
});

Then('o feed traz a reserva confirmada', async ({ ctx, publicApi }) => {
  await publicApi.expectFeedHasReservation(ctx.get('cabin').slug, ctx.get('booking').codigo);
});

Then('o feed não traz a reserva cancelada', async ({ ctx, publicApi }) => {
  await publicApi.expectFeedLacksReservation(ctx.get('cabin').slug, ctx.get('cancelledBooking').codigo);
});

When('copio o link de exportação iCal no painel', async ({ ctx, hostCalendarPage }) => {
  await hostCalendarPage.open(ctx.get('cabin').id);
  await hostCalendarPage.openIcal();
  ctx.set('icalExportUrl', await hostCalendarPage.exportFeedUrl());
});

Then('o link entrega um calendário válido', async ({ ctx, publicApi }) => {
  await publicApi.expectServesCalendar(ctx.get('icalExportUrl'));
});

When('importo o calendário do endereço {string} pelo painel', async ({ ctx, hostCalendarPage }, endereco: string) => {
  await hostCalendarPage.open(ctx.get('cabin').id);
  await hostCalendarPage.openIcal();
  await hostCalendarPage.importFrom(endereco);
});

Then('vejo que o endereço foi recusado, sem detalhes técnicos', async ({ hostCalendarPage }) => {
  await hostCalendarPage.expectImportRejectedWithoutTechnicalDetails();
});
