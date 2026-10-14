import { createUniqueWord } from '../../support/core/unique-id';
import { Given, Then, When } from '../../support/fixtures';

When('cadastro pelo painel uma cabana nova', async ({ ctx, cabinEditorPage }) => {
  await cabinEditorPage.openCreate();
  const name = `[E2E] Nova pelo painel ${createUniqueWord(8)}`;
  ctx.set('newCabinName', name);
  await cabinEditorPage.fillName(name);
  await cabinEditorPage.fillCep('95670000');
  await cabinEditorPage.publish();
});

Then('volto ao painel com a cabana nova selecionada', async ({ navigation }) => {
  await navigation.expectAt(/\/painel\?cabanaId=[0-9a-f-]{36}/);
});

Then('a cabana nova aparece no painel com o selo "Em análise"', async ({ ctx, cabinEditorPage }) => {
  await cabinEditorPage.expectUnderReviewBadge(ctx.get('newCabinName'));
});

Then(
  'um visitante não encontra a página pública da cabana nova',
  async ({ ctx, session, cabinEditorPage, navigation }) => {
    const cabinId = cabinEditorPage.selectedCabinIdFromUrl();
    ctx.set('newCabinId', cabinId);
    await session.signOut();
    await navigation.goTo(`/cabana/${cabinId}`);
    await navigation.expectNotFound();
  },
);

When('a equipe aprova a cabana nova na curadoria', async ({ ctx, data, session, adminPage }) => {
  await session.signOut();
  await session.signInAs(await data.adminPersona());
  await adminPage.open();
  await adminPage.expectLoaded();
  await adminPage.openCuradoriaTab();
  await adminPage.approveCabin(ctx.get('newCabinName'));
});

Then('um visitante encontra a página pública da cabana nova', async ({ ctx, session, navigation, cabinPage }) => {
  const cabinId = ctx.get('newCabinId');
  await session.signOut();
  await navigation.goTo(`/cabana/${cabinId}`);
  await cabinPage.expectTitleVisible(ctx.get('newCabinName'));
});

When('digito a diária {string} na edição da cabana', async ({ ctx, cabinEditorPage }, diaria: string) => {
  await cabinEditorPage.openEdit(ctx.get('cabin').id);
  await cabinEditorPage.expectEditFormVisible();
  await cabinEditorPage.typePrice(diaria);
});

Then('o campo de diária representa R$ {float}', async ({ cabinEditorPage }, valor: number) => {
  await cabinEditorPage.expectPriceFieldNear(valor);
});

When('abro a edição dessa cabana pelo endereço', async ({ ctx, cabinEditorPage }) => {
  await cabinEditorPage.openEdit(ctx.get('cabin').id);
});

// ─── SSRF ────────────────────────────────────────────────────────────────────

Given('um servidor-canário escutando na rede interna', async ({ canary }) => {
  // A fixture já sobe o canário; o passo deixa a pré-condição explícita no cenário.
  void canary;
});

When(
  'colo o endereço do canário como link do Google Maps no cadastro de cabana',
  async ({ canary, cabinEditorPage }) => {
    await cabinEditorPage.openCreate();
    await cabinEditorPage.extractAddressFrom(canary.mapsLikeUrl);
  },
);

Then('o canário não recebe nenhuma requisição', async ({ canary }) => {
  canary.expectNoRequests();
});
