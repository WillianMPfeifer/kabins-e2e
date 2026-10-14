import { daysFromToday } from '../../support/core/dates';
import { Given, Then, When } from '../../support/fixtures';

/*
 * Exposição por canais públicos. O "Quando" registra qual porta foi
 * consultada; a leitura anônima acontece no "Então", pela sonda `publicApi`,
 * que usa uma conexão sem cookies nem token.
 */

When(
  /^alguém sem login consulta a solicitação pelo (código|identificador) da reserva$/,
  async ({ ctx }, kind: string) => {
    ctx.set('publicLookup', kind as 'código' | 'identificador');
  },
);

Then('a consulta é recusada sem revelar telefone, e-mail nem token do hóspede', async ({ ctx, publicApi }) => {
  const booking = ctx.get('booking');
  const identifier = ctx.get('publicLookup') === 'código' ? booking.codigo : booking.id;
  await publicApi.expectBookingRequestDenied(identifier, {
    telefone: booking.guest.telefone,
    email: booking.guest.email,
    token: booking.tokenConfirmacao,
  });
});

When('abro o link de solicitação usando o código da reserva', async ({ ctx, approvalPage }) => {
  await approvalPage.open(ctx.get('booking').codigo);
});

Given(
  'o anfitrião bloqueou a noite de daqui a {int} dias com a observação {string}',
  async ({ ctx, data }, dias: number, observacao: string) => {
    ctx.set('privateNote', observacao);
    await data.blockNight(ctx.get('cabin'), daysFromToday(dias), observacao);
  },
);

When('alguém sem login baixa o feed iCal da cabana', async () => {
  // Intenção apenas: a leitura anônima do feed acontece em cada verificação.
});

When('alguém sem login consulta a disponibilidade da noite de daqui a {int} dias', async ({ ctx }, dias: number) => {
  ctx.set('consultedNight', daysFromToday(dias));
});

Then('o feed marca a noite de daqui a {int} dias como indisponível', async ({ ctx, publicApi }, dias: number) => {
  await publicApi.expectFeedMarksNightUnavailable(ctx.get('cabin').slug, daysFromToday(dias));
});

Then('o feed não contém a observação do anfitrião', async ({ ctx, publicApi }) => {
  await publicApi.expectFeedHides(ctx.get('cabin').slug, ctx.get('privateNote'));
});

Then('a resposta não contém a observação do anfitrião', async ({ ctx, publicApi }) => {
  await publicApi.expectAvailabilityHides(ctx.get('cabin').id, ctx.get('consultedNight'), ctx.get('privateNote'));
});
