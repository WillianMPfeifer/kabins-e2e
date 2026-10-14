import { Then, When } from '../../support/fixtures';

When('abro a gestão da plataforma', async ({ adminPage }) => {
  await adminPage.open();
  await adminPage.expectLoaded();
});

Then('vejo a lista de anfitriões cadastrados', async ({ adminPage }) => {
  await adminPage.expectHostsSectionVisible();
});

Then('vejo o e-mail desse anfitrião na gestão', async ({ ctx, adminPage }) => {
  await adminPage.expectTextListed(ctx.get('host').email);
});

Then('não vejo a gestão da plataforma', async ({ adminPage }) => {
  await adminPage.expectNotAccessible();
});
