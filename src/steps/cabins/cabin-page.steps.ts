import { Then, When } from '../../support/fixtures';

When('abro a página da cabana', async ({ ctx, cabinPage }) => {
  await cabinPage.open(ctx.get('cabin').slug);
});

When('clico em "Reservar agora"', async ({ cabinPage }) => {
  await cabinPage.startBooking();
});

Then('vejo o nome, a cidade e a capacidade da cabana', async ({ ctx, cabinPage }) => {
  await cabinPage.expectShowing(ctx.get('cabin'));
});

Then('vejo as seções de descrição, disponibilidade e avaliações', async ({ cabinPage }) => {
  await cabinPage.expectStandardSections();
});

Then('vejo o valor da diária', async ({ cabinPage }) => {
  await cabinPage.expectNightlyPriceVisible();
});

Then('vejo o formulário de reserva da cabana', async ({ ctx, bookingRequestPage, navigation }) => {
  const cabin = ctx.get('cabin');
  await navigation.expectAt(`/reservar/${cabin.slug}`);
  await bookingRequestPage.expectLoaded(cabin.nome);
});
