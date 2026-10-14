import { Given, Then, When } from '../../support/fixtures';

Given('estou na página {string}', async ({ navigation }, path: string) => {
  await navigation.goTo(path);
  await navigation.expectAt(path);
});

When('acesso {string}', async ({ navigation }, path: string) => {
  await navigation.goTo(path);
});

When('a pessoa tenta acessar {string} sem estar conectada', async ({ session, navigation }, path: string) => {
  await session.signOut();
  await navigation.goTo(path);
});

When('recarrego a página', async ({ navigation }) => {
  await navigation.reload();
});

Then('ela é levada para {string}', async ({ navigation }, path: string) => {
  await navigation.expectAt(path);
});

Then(
  /^(?:ela é redirecionada|sou redirecionado) para o login guardando o destino "([^"]*)"$/,
  async ({ loginPage }, destino: string) => {
    await loginPage.expectDestinationParam(destino);
    await loginPage.expectLoaded();
  },
);

Then('sou redirecionado para o login', async ({ loginPage }) => {
  await loginPage.expectStillOnLogin();
});

Then(
  'ao acessar {string} sou redirecionado para o login guardando o destino {string}',
  async ({ navigation, loginPage }, path: string, destino: string) => {
    await navigation.goTo(path);
    await loginPage.expectDestinationParam(destino);
  },
);

Then('vejo a página não encontrada', async ({ navigation }) => {
  await navigation.expectNotFound();
});
