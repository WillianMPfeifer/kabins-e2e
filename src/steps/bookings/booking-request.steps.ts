import { daysFromToday, nightsBetween } from '../../support/core/dates';
import { toPhoneMask, generateMobilePhone } from '../../support/core/documents';
import { defaultStay } from '../../support/data/test-data.factory';
import { Then, When } from '../../support/fixtures';
import { currentStay } from '../../support/fixtures/scenario-helpers';

When(
  'solicito uma reserva de {int} noites com chegada daqui a {int} dias',
  async ({ ctx, bookingFlow }, noites: number, dias: number) => {
    const stay = defaultStay(dias, noites);
    ctx.set('stay', stay);
    ctx.set('requestedBooking', await bookingFlow.requestStay(ctx.get('cabin').slug, stay));
  },
);

When('abro o formulário de reserva da cabana', async ({ ctx, bookingRequestPage }) => {
  const cabin = ctx.get('cabin');
  await bookingRequestPage.open(cabin.slug, cabin.nome);
});

When(
  'seleciono no calendário {int} noites com chegada daqui a {int} dias',
  async ({ ctx, bookingRequestPage }, noites: number, dias: number) => {
    const cabin = ctx.get('cabin');
    const stay = defaultStay(dias, noites);
    ctx.set('stay', stay);
    if (!bookingRequestPage.currentPath().startsWith(`/reservar/${cabin.slug}`)) {
      await bookingRequestPage.open(cabin.slug, cabin.nome);
    }
    await bookingRequestPage.selectStay(stay.checkin, stay.checkout);
  },
);

When('informo meus dados de contato e envio a solicitação', async ({ bookingRequestPage }) => {
  await bookingRequestPage.fillGuest({
    nome: 'Visitante Sem Login',
    telefone: toPhoneMask(generateMobilePhone()),
  });
  await bookingRequestPage.submit();
});

Then('vejo o comprovante da solicitação aguardando confirmação do anfitrião', async ({ bookingReceiptPage }) => {
  await bookingReceiptPage.expectState('HELD');
});

Then('o comprovante mostra o código da reserva', async ({ ctx, bookingReceiptPage }) => {
  await bookingReceiptPage.expectDetail('Cabana', ctx.get('cabin').nome);
  await bookingReceiptPage.bookingCode();
});

Then('o calendário indica {int} noites selecionadas', async ({ bookingRequestPage }, noites: number) => {
  await bookingRequestPage.expectNightsSelected(noites);
});

Then('o botão de envio mostra o total de {string}', async ({ bookingRequestPage }, total: string) => {
  await bookingRequestPage.expectSubmitTotal(total);
});

Then('vejo o aviso de limite de 5 noites por estadia', async ({ bookingRequestPage }) => {
  await bookingRequestPage.expectStayLimitWarning();
});

Then('vejo o aviso de que há noites ocupadas no período', async ({ bookingRequestPage }) => {
  await bookingRequestPage.expectOccupiedRangeWarning();
});

Then('não consigo enviar a solicitação', async ({ bookingRequestPage }) => {
  await bookingRequestPage.expectSubmitEnabled(false);
});

Then('o dia daqui a {int} dias aparece indisponível no calendário', async ({ bookingRequestPage }, dias: number) => {
  await bookingRequestPage.expectDayUnavailable(daysFromToday(dias));
});

Then('vejo o erro de reserva {string}', async ({ bookingRequestPage }, mensagem: string) => {
  await bookingRequestPage.expectFormError(mensagem);
});

Then(
  'as noites dessa reserva voltam a ficar disponíveis no calendário da cabana',
  async ({ ctx, bookingRequestPage }) => {
    const cabin = ctx.get('cabin');
    const { checkin, checkout } = currentStay(ctx);
    await bookingRequestPage.open(cabin.slug, cabin.nome);
    for (const night of nightsBetween(checkin, checkout)) {
      await bookingRequestPage.expectDayAvailable(night);
    }
  },
);
