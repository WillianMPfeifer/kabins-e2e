import { Then, When } from '../../support/fixtures';

When('saio da conta pelo menu do cabeçalho', async ({ ctx, header }) => {
  await header.logout(ctx.get('account').firstName);
});

When('a pessoa alterna para o perfil de anfitrião pelo menu do cabeçalho', async ({ ctx, header }) => {
  await header.switchRole(ctx.get('account').firstName);
});

When('a pessoa alterna para o perfil de hóspede pelo menu do cabeçalho', async ({ ctx, header }) => {
  await header.switchRole(ctx.get('account').firstName);
});

Then('o cabeçalho mostra a opção de entrar', async ({ header }) => {
  await header.expectLoggedOut();
});

Then('vejo a área "Minhas reservas"', async ({ myBookingsPage }) => {
  await myBookingsPage.expectLoaded();
});
