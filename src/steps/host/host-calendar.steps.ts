import { daysFromToday } from '../../support/core/dates';
import { defaultStay } from '../../support/data/test-data.factory';
import { Then, When } from '../../support/fixtures';
import { signInAsAnotherGuest } from '../../support/fixtures/scenario-helpers';

When(
  'altero pelo painel a diária de daqui a {int} a {int} dias para R$ {int}',
  async ({ ctx, hostCalendarPage }, de: number, ate: number, diaria: number) => {
    await hostCalendarPage.open(ctx.get('cabin').id);
    await hostCalendarPage.selectRange(daysFromToday(de), daysFromToday(ate));
    await hostCalendarPage.setRangePrice(diaria);
    await hostCalendarPage.saveRange();
  },
);

When(
  'bloqueio pelo painel as noites de daqui a {int} a {int} dias',
  async ({ ctx, hostCalendarPage }, de: number, ate: number) => {
    await hostCalendarPage.open(ctx.get('cabin').id);
    await hostCalendarPage.selectRange(daysFromToday(de), daysFromToday(ate));
    await hostCalendarPage.setRangeAvailability('bloqueada');
    await hostCalendarPage.saveRange();
  },
);

Then(
  'outro hóspede vê a noite de daqui a {int} dias indisponível',
  async ({ ctx, data, session, bookingRequestPage }, dias: number) => {
    const cabin = ctx.get('cabin');
    await signInAsAnotherGuest(ctx, data, session);
    await bookingRequestPage.open(cabin.slug, cabin.nome);
    await bookingRequestPage.expectDayUnavailable(daysFromToday(dias));
  },
);

When(
  'outro hóspede seleciona {int} noites com chegada daqui a {int} dias',
  async ({ ctx, data, session, bookingRequestPage }, noites: number, dias: number) => {
    const cabin = ctx.get('cabin');
    const stay = defaultStay(dias, noites);
    await signInAsAnotherGuest(ctx, data, session);
    await bookingRequestPage.open(cabin.slug, cabin.nome);
    await bookingRequestPage.selectStay(stay.checkin, stay.checkout);
  },
);

When(
  'tento alterar pelo painel a diária de daqui a {int} a {int} dias para R$ {int}',
  async ({ ctx, hostCalendarPage }, de: number, ate: number, diaria: number) => {
    await hostCalendarPage.open(ctx.get('cabin').id);
    await hostCalendarPage.selectRange(daysFromToday(de), daysFromToday(ate));
    await hostCalendarPage.setRangePrice(diaria);
    await hostCalendarPage.trySaveRange();
  },
);

Then('vejo no painel que as datas têm solicitação pendente', async ({ hostCalendarPage }) => {
  await hostCalendarPage.expectSaveRefused(/solicitação pendente/);
});
