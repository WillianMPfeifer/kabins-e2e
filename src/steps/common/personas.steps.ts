import { roleFromLabel } from '../../support/data/persona-labels';
import { Given } from '../../support/fixtures';
import { personaForRole } from '../../support/fixtures/scenario-helpers';

Given('que existe uma conta de {string}', async ({ ctx, data }, perfil: string) => {
  ctx.set('account', await personaForRole(roleFromLabel(perfil), ctx, data));
});

Given('que estou conectado como {string}', async ({ ctx, data, session }, perfil: string) => {
  const persona = await personaForRole(roleFromLabel(perfil), ctx, data);
  ctx.set('account', persona);
  await session.signInAs(persona);
});

Given('que estou conectado como o anfitrião da cabana', async ({ ctx, session }) => {
  const host = ctx.get('cabin').host;
  ctx.set('account', host);
  await session.signInAs(host);
});

Given('que estou conectado como outro anfitrião', async ({ ctx, data, session }) => {
  const otherHost = await data.createHost();
  ctx.set('otherHost', otherHost);
  ctx.set('account', otherHost);
  await session.signInAs(otherHost);
});

Given('que estou conectado como o hóspede que fez a solicitação', async ({ ctx, session }) => {
  const guest = ctx.get('booking').guest;
  ctx.set('account', guest);
  await session.signInAs(guest);
});

Given('que não estou conectado', async ({ session }) => {
  await session.signOut();
});

Given('o administrador desativou essa conta', async ({ ctx, data }) => {
  await data.deactivate(ctx.get('account'));
});
