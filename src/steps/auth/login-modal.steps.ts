import { roleFromLabel } from '../../support/data/persona-labels';
import { Then, When } from '../../support/fixtures';
import { personaForRole } from '../../support/fixtures/scenario-helpers';

Then('vejo o login flutuante', async ({ loginModal }) => {
  await loginModal.expectOpen();
});

Then('vejo o login flutuante sem sair da página da cabana', async ({ ctx, loginModal, cabinPage }) => {
  await loginModal.expectOpen();
  await cabinPage.expectAt(ctx.get('cabin').slug);
});

When('fecho o login flutuante', async ({ loginModal }) => {
  await loginModal.close();
});

When('entro pelo login flutuante como {string}', async ({ ctx, data, loginModal }, perfil: string) => {
  const persona = await personaForRole(roleFromLabel(perfil), ctx, data);
  ctx.set('account', persona);
  await loginModal.loginWith(persona.email, persona.senha);
  await loginModal.expectClosed();
});

Then('sou levado a completar o cadastro guardando a reserva da cabana', async ({ ctx, navigation }) => {
  const destino = encodeURIComponent(`/reservar/${ctx.get('cabin').slug}`);
  await navigation.expectAt(`/completar-perfil?destino=${destino}`);
});
