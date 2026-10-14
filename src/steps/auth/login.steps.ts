import { env } from '../../support/core/env';
import { createUniqueId } from '../../support/core/unique-id';
import { Given, Then, When } from '../../support/fixtures';

const WRONG_PASSWORD = 'SenhaErrada2026x';

Given('que estou na tela de login', async ({ loginPage }) => {
  await loginPage.open();
});

When('a pessoa entra com o e-mail e a senha corretos', async ({ ctx, loginPage }) => {
  const account = ctx.get('account');
  if (!loginPage.currentPath().startsWith('/login')) await loginPage.open();
  await loginPage.loginWith(account.email, account.senha);
});

When('a pessoa tenta entrar com a senha errada', async ({ ctx, loginPage }) => {
  await loginPage.open();
  await loginPage.loginWith(ctx.get('account').email, WRONG_PASSWORD);
  ctx.set('capturedMessages', [await loginPage.errorMessage()]);
});

When('alguém tenta entrar com um e-mail que não está cadastrado', async ({ ctx, loginPage }) => {
  await loginPage.open();
  await loginPage.loginWith(`inexistente.${createUniqueId()}@${env.emailDomain}`, WRONG_PASSWORD);
  ctx.set('capturedMessages', [...(ctx.find('capturedMessages') ?? []), await loginPage.errorMessage()]);
});

Then('as duas tentativas exibem exatamente a mesma mensagem de erro', async ({ ctx, loginPage }) => {
  const [wrongPassword, unknownEmail] = ctx.get('capturedMessages');
  loginPage.expectIdenticalErrorMessages(wrongPassword, unknownEmail);
});

Then('a pessoa continua na tela de login', async ({ loginPage }) => {
  await loginPage.expectStillOnLogin();
});

Then('o login é recusado com uma mensagem de erro', async ({ loginPage }) => {
  await loginPage.expectErrorMessage(/.+/);
});

Then('o cabeçalho mostra que ela está conectada', async ({ ctx, header }) => {
  await header.expectLoggedInAs(ctx.get('account').firstName);
});

When('digito a senha {string}', async ({ loginPage }, senha: string) => {
  await loginPage.fillCredentials('', senha);
});

When(/^peço para (?:ver|ocultar) a senha$/, async ({ loginPage }) => {
  await loginPage.togglePasswordVisibility();
});

Then('a senha fica visível', async ({ loginPage }) => {
  await loginPage.expectPasswordVisible(true);
});

Then('a senha fica oculta', async ({ loginPage }) => {
  await loginPage.expectPasswordVisible(false);
});
