import { daysFromToday } from '../../support/core/dates';
import { Given } from '../../support/fixtures';

Given('que existe uma cabana ativa com calendário aberto', async ({ ctx, data }) => {
  ctx.set('cabin', await data.createCabin());
});

Given('que existe uma cabana ativa com diária de R$ {int}', async ({ ctx, data }, diaria: number) => {
  ctx.set('cabin', await data.createCabin({ nightlyPrice: diaria }));
});

Given(
  'que existe uma cabana ativa com a noite de daqui a {int} dias fechada pelo anfitrião',
  async ({ ctx, data }, dias: number) => {
    ctx.set('cabin', await data.createCabin({ blockedDates: [daysFromToday(dias)] }));
  },
);

Given('que existe uma cabana aguardando aprovação da curadoria', async ({ ctx, data }) => {
  ctx.set('cabin', await data.createCabin({ pendingApproval: true }));
});
