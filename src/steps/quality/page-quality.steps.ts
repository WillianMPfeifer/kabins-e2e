import { Given, Then, When } from '../../support/fixtures';
import type { ScenarioContext } from '../../support/core/scenario-context';
import type { ScenarioState } from '../../support/fixtures/scenario-state.types';

function target(ctx: ScenarioContext<ScenarioState>) {
  const cabin = ctx.get('cabin');
  return { slug: cabin.slug, cabinId: cabin.id, bookingId: ctx.get('booking').id };
}

Given(
  /^que estou conectado como (hóspede|anfitrião da cabana) para ver as telas$/,
  async ({ ctx, session }, perfil: string) => {
    const persona = perfil === 'hóspede' ? ctx.get('booking').guest : ctx.get('cabin').host;
    await session.signInAs(persona);
  },
);

When('abro a tela {string} num celular pequeno', async ({ ctx, qualityPage }, tela: string) => {
  await qualityPage.openOnSmallPhone(tela, target(ctx));
});

When('abro a tela {string}', async ({ ctx, qualityPage }, tela: string) => {
  await qualityPage.openAndSettle(tela, target(ctx));
});

Then('a tela não tem rolagem horizontal', async ({ qualityPage }) => {
  await qualityPage.expectNoHorizontalScroll();
});

Then('o navegador não registra erro de hidratação nem exceção', async ({ qualityPage }) => {
  qualityPage.expectNoRuntimeErrors();
});
