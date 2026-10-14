import { signupVariation } from '../../support/data/signup-variations';
import { Given, Then, When } from '../../support/fixtures';

Given('que estou na tela de cadastro', async ({ signupPage }) => {
  await signupPage.open();
});

When('preencho o cadastro com dados válidos', async ({ ctx, data, signupPage }) => {
  const registration = data.buildRegistration();
  ctx.set('registration', registration);
  await signupPage.fillForm(registration);
});

When(/^preencho o cadastro com dados válidos, exceto (.+)$/, async ({ ctx, data, signupPage }, situacao: string) => {
  const variation = signupVariation(situacao);
  const registration = data.buildRegistration(variation.overrides);
  ctx.set('registration', registration);
  await signupPage.fillForm(registration, variation.confirmPassword);
});

When('preencho o cadastro usando o e-mail dessa conta', async ({ ctx, data, signupPage }) => {
  const registration = data.buildRegistration({ email: ctx.get('account').email });
  ctx.set('registration', registration);
  await signupPage.fillForm(registration);
});

When('envio o cadastro', async ({ signupPage }) => {
  await signupPage.submit();
});

Then('minha conta é criada e já estou conectado', async ({ ctx, header, navigation }) => {
  await navigation.expectAt('/');
  await header.expectLoggedInAs(ctx.get('registration').nome.split(' ')[0]);
});

Then('consigo acessar "Minhas reservas" sem reservas ainda', async ({ myBookingsPage }) => {
  await myBookingsPage.open();
  await myBookingsPage.expectEmpty();
});

Then('o CPF aparece formatado no campo', async ({ ctx, signupPage }) => {
  await signupPage.expectMaskedDocument(ctx.get('registration').cpf);
});

Then('vejo a mensagem de erro {string}', async ({ signupPage }, mensagem: string) => {
  await signupPage.expectErrorMessage(mensagem);
});

Then('vejo um alerta de erro no cadastro', async ({ signupPage }) => {
  await signupPage.expectErrorMessage(/.+/);
});

Then('o campo mostra a orientação {string}', async ({ signupPage }, orientacao: string) => {
  await signupPage.expectFieldError(orientacao);
});

Then('continuo na tela de cadastro', async ({ signupPage }) => {
  await signupPage.expectStillOnSignup();
});
