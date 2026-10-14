import { Then, When } from '../../support/fixtures';

function confirmationToken(token: string | null | undefined): string {
  if (!token) throw new Error('A reserva do cenário não tem token de confirmação (a API não o devolveu).');
  return token;
}

When('abro o link de aprovação da solicitação', async ({ ctx, approvalPage }) => {
  await approvalPage.open(confirmationToken(ctx.get('booking').tokenConfirmacao));
});

When('abro um link de aprovação adulterado', async ({ ctx, approvalPage }) => {
  const token = confirmationToken(ctx.get('booking').tokenConfirmacao);
  const tampered = `${token.slice(0, -1)}${token.endsWith('x') ? 'y' : 'x'}`;
  await approvalPage.open(tampered);
});

When('aprovo a solicitação', async ({ approvalPage }) => {
  await approvalPage.approve();
});

When('recuso a solicitação informando o motivo {string}', async ({ approvalPage }, motivo: string) => {
  await approvalPage.decline(motivo);
});

When(
  'sigo para "Entrar como Anfitrião" e entro com a conta do anfitrião da cabana',
  async ({ ctx, approvalPage, loginPage }) => {
    const host = ctx.get('cabin').host;
    await approvalPage.followLoginLink();
    await loginPage.expectLoaded();
    await loginPage.loginWith(host.email, host.senha);
  },
);

Then('vejo a solicitação pendente com os dados do hóspede', async ({ ctx, approvalPage }) => {
  await approvalPage.expectScreen('pending');
  await approvalPage.expectGuestData(ctx.get('booking').guest.nome);
});

Then('vejo que a reserva foi aprovada', async ({ approvalPage }) => {
  await approvalPage.expectScreen('approved');
});

Then('vejo que a solicitação foi recusada', async ({ approvalPage }) => {
  await approvalPage.expectScreen('declined');
});

Then('não há mais botões de aprovar ou recusar', async ({ approvalPage }) => {
  await approvalPage.expectDecisionButtonsHidden();
});

Then('vejo a tela de acesso restrito ao anfitrião', async ({ approvalPage }) => {
  await approvalPage.expectScreen('restricted');
});

Then('vejo a tela de acesso não autorizado', async ({ approvalPage }) => {
  await approvalPage.expectScreen('unauthorized');
});

Then('os dados do hóspede não aparecem', async ({ ctx, approvalPage }) => {
  await approvalPage.expectGuestDataHidden(ctx.get('booking').guest.nome);
});
