import { defaultStay } from '../../support/data/test-data.factory';
import { Given, Then, When } from '../../support/fixtures';
import { ensureGuest } from '../../support/fixtures/scenario-helpers';

/*
 * O guia é gravado pela web direto no banco (não há endpoint na API), então a
 * massa de guia é criada pelo editor do painel, com a sessão do anfitrião.
 */

Given(
  'o anfitrião configurou o guia da cabana com Wi-Fi {string}, senha {string} e fechadura {string}',
  async ({ ctx, session, guideEditorPage }, wifiName: string, wifiPassword: string, lockCode: string) => {
    const cabin = ctx.get('cabin');
    ctx.set('guideSecrets', { wifiName, wifiPassword, lockCode });
    await session.signInAs(cabin.host);
    await guideEditorPage.open(cabin.id);
    await guideEditorPage.fill({ wifiName, wifiPassword, lockCode });
    await guideEditorPage.saveAndConfirm();
    await session.signOut();
  },
);

Given(
  'que existe outra cabana, de outro anfitrião, com o mesmo nome e guia configurado',
  async ({ ctx, data, session, guideEditorPage }) => {
    const otherCabin = await data.createCabin({ name: ctx.get('cabin').nome });
    ctx.set('otherCabin', otherCabin);
    await session.signInAs(otherCabin.host);
    await guideEditorPage.open(otherCabin.id);
    await guideEditorPage.fill({ wifiName: 'OutraRede', wifiPassword: 'outraSenha99', lockCode: '9090#' });
    await guideEditorPage.saveAndConfirm();
    await session.signOut();
  },
);

Given(
  /^que tive uma reserva (recusada pelo anfitrião|cancelada por mim) nesta cabana$/,
  async ({ ctx, data }, situacao: string) => {
    const guest = await ensureGuest(ctx, data);
    const booking = await data.createBooking(guest, ctx.get('cabin'), defaultStay(3, 2));
    ctx.set(
      'booking',
      situacao.startsWith('recusada') ? await data.refuseBooking(booking) : await data.cancelBookingAsGuest(booking),
    );
  },
);

Given('que outro anfitrião está editando o guia da própria cabana', async ({ ctx, data, session, guideEditorPage }) => {
  const otherCabin = await data.createCabin();
  ctx.set('otherCabin', otherCabin);
  ctx.set('otherHost', otherCabin.host);
  await session.signInAs(otherCabin.host);
  await guideEditorPage.open(otherCabin.id);
});

When(
  'ele envia o formulário do guia com a rede {string} apontando para a cabana do primeiro anfitrião',
  async ({ ctx, guideEditorPage }, rede: string) => {
    await guideEditorPage.fill({ wifiName: rede, wifiPassword: 'senhaInvasora1' });
    await guideEditorPage.submitTargeting(ctx.get('cabin').id);
  },
);

When('abro o guia da cabana', async ({ ctx, guidePage }) => {
  await guidePage.open(ctx.get('cabin').slug);
});

When('abro o guia da outra cabana', async ({ ctx, guidePage }) => {
  await guidePage.open(ctx.get('otherCabin').slug);
});

When('sigo para entrar e entro com a minha conta de hóspede', async ({ ctx, guidePage, loginPage }) => {
  const guest = ctx.get('guest');
  await guidePage.followLoginLink();
  await loginPage.expectLoaded();
  await loginPage.loginWith(guest.email, guest.senha);
});

Then('vejo que o guia será liberado no dia do check-in', async ({ guidePage }) => {
  await guidePage.expectCountdown();
});

Then('o guia não afirma que a estadia está confirmada', async ({ guidePage }) => {
  await guidePage.expectNoConfirmationClaim();
});

Then('vejo que não tenho reserva ativa nesta cabana', async ({ guidePage }) => {
  await guidePage.expectNoActiveBooking();
});

Then('vejo o aviso de visualização do anfitrião', async ({ guidePage }) => {
  await guidePage.expectHostPreview();
});

Then('vejo a senha do Wi-Fi do guia', async ({ ctx, guidePage }) => {
  await guidePage.expectSecretVisible(ctx.get('guideSecrets').wifiPassword);
});

Then('não vejo a senha do Wi-Fi do guia', async ({ ctx, guidePage }) => {
  await guidePage.expectSecretHidden(ctx.get('guideSecrets').wifiPassword);
});

Then('não vejo a senha da fechadura do guia', async ({ ctx, guidePage }) => {
  await guidePage.expectSecretHidden(ctx.get('guideSecrets').lockCode);
});

Then('o guia da cabana continua com a rede Wi-Fi configurada pelo anfitrião', async ({ ctx, session, guidePage }) => {
  const cabin = ctx.get('cabin');
  await session.signOut();
  await session.signInAs(cabin.host);
  await guidePage.open(cabin.slug);
  await guidePage.expectSecretVisible(ctx.get('guideSecrets').wifiName);
  await guidePage.expectSecretHidden('RedeInvasora');
});

Then('vejo que o guia é exclusivo para hóspedes', async ({ guidePage }) => {
  await guidePage.expectGuestOnlyGate();
});

Then('volto para o guia da cabana', async ({ ctx, guidePage }) => {
  await guidePage.expectAt(ctx.get('cabin').slug);
});

Then('vejo que o guia digital ainda não está disponível e posso falar com o anfitrião', async ({ guidePage }) => {
  await guidePage.expectComingSoon();
});
