import { Given, Then, When } from '../../support/fixtures';
import { ensureGuest } from '../../support/fixtures/scenario-helpers';

/** "+5554999990000" → "(54) 99999-0000": como um telefone brasileiro deve aparecer. */
function nationalPhone(e164: string): string {
  const digits = e164.replace(/\D/g, '').replace(/^55/, '');
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

Given('que estou conectado como "hóspede" também em outro dispositivo', async ({ ctx, data, session, otherDevice }) => {
  const guest = await ensureGuest(ctx, data);
  ctx.set('account', guest);
  await session.signInAs(guest);
  await otherDevice.session.signInAs(await data.newSessionOf(guest));
});

When('troco minha senha no perfil para {string}', async ({ ctx, profilePage }, novaSenha: string) => {
  ctx.set('newPassword', novaSenha);
  await profilePage.open();
  await profilePage.changePassword(ctx.get('account').senha, novaSenha);
  await profilePage.expectMessage(/Senha (alterada|atualizada) com sucesso/i);
});

When(
  'tento trocar a senha informando {string} como senha atual e {string} como nova',
  async ({ profilePage }, atual: string, nova: string) => {
    await profilePage.open();
    await profilePage.changePassword(atual, nova);
  },
);

When('abro meu perfil', async ({ profilePage }) => {
  await profilePage.open();
});

When('atualizo meu telefone no perfil para {string}', async ({ profilePage }, telefone: string) => {
  await profilePage.open();
  await profilePage.updatePhone(telefone);
  await profilePage.expectMessage(/atualizad|salv/i);
});

Then('vejo a confirmação de que a senha foi alterada', async ({ profilePage }) => {
  await profilePage.expectMessage(/Senha (alterada|atualizada) com sucesso/i);
});

Then('vejo no perfil a mensagem {string}', async ({ profilePage }, mensagem: string) => {
  await profilePage.expectMessage(mensagem);
});

Then('depois de sair não consigo entrar com a senha antiga', async ({ ctx, session, loginPage }) => {
  const account = ctx.get('account');
  await session.signOut();
  await loginPage.open();
  await loginPage.loginWith(account.email, account.senha);
  await loginPage.expectErrorMessage(/incorretos|inválid/i);
});

Then('consigo entrar com a nova senha', async ({ ctx, loginPage, header }) => {
  await loginPage.open();
  await loginPage.loginWith(ctx.get('account').email, ctx.get('newPassword'));
  await header.expectLoggedInAs(ctx.get('account').firstName);
});

Then('o outro dispositivo é levado ao login ao abrir "Minhas reservas"', async ({ otherDevice }) => {
  await otherDevice.myBookingsPage.visitOnly();
  await otherDevice.loginPage.expectStillOnLogin();
});

Then('o telefone aparece com o DDD e todos os dígitos', async ({ ctx, profilePage }) => {
  await profilePage.expectPhoneField(nationalPhone(ctx.get('account').telefone));
});

Then(
  'o anfitrião vê o telefone {string} no link da solicitação',
  async ({ ctx, session, approvalPage }, telefone: string) => {
    const booking = ctx.get('booking');
    if (!booking.tokenConfirmacao) throw new Error('A API não devolveu o token de confirmação da solicitação.');
    await session.signOut();
    await session.signInAs(booking.cabin.host);
    await approvalPage.open(booking.tokenConfirmacao);
    await approvalPage.expectGuestPhoneDigits(telefone);
  },
);
