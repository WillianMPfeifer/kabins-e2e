import { Given, Then, When } from '../../support/fixtures';
import { ensureGuest } from '../../support/fixtures/scenario-helpers';

// ─── Massa ───────────────────────────────────────────────────────────────────

Given('que tenho uma estadia concluída nessa cabana', async ({ ctx, data }) => {
  const guest = await ensureGuest(ctx, data);
  ctx.set('booking', await data.createCompletedStay(guest, ctx.get('cabin')));
});

Given('que tenho uma estadia concluída e já avaliada nessa cabana', async ({ ctx, data }) => {
  const guest = await ensureGuest(ctx, data);
  const booking = await data.createCompletedStay(guest, ctx.get('cabin'));
  await data.reviewBooking(booking, 4, 'Primeira avaliação da estadia');
  ctx.set('booking', booking);
});

Given('a cabana recebeu a avaliação {string}', async ({ ctx, data }, comentario: string) => {
  const guest = await data.createClient();
  const booking = await data.createCompletedStay(guest, ctx.get('cabin'));
  await data.reviewBooking(booking, 4, comentario);
  ctx.set('booking', booking);
});

// ─── Ações ───────────────────────────────────────────────────────────────────

When(
  'avalio a estadia com {int} estrelas e o comentário {string}',
  async ({ ctx, reviewFormPage }, estrelas: number, comentario: string) => {
    await reviewFormPage.open(ctx.get('booking').id);
    await reviewFormPage.submit(estrelas, comentario);
  },
);

When('abro a avaliação da minha estadia', async ({ ctx, reviewFormPage }) => {
  await reviewFormPage.open(ctx.get('booking').id);
});

When('abro a avaliação da reserva do outro hóspede', async ({ ctx, reviewFormPage }) => {
  await reviewFormPage.open(ctx.get('booking').id);
});

When('escrevo um comentário de {int} caracteres', async ({ reviewFormPage }, tamanho: number) => {
  await reviewFormPage.typeComment('Muito bom. '.repeat(Math.ceil(tamanho / 11)).slice(0, tamanho));
});

When('concluo pelo painel a estadia que começou hoje', async ({ ctx, hostCalendarPage }) => {
  await hostCalendarPage.open(ctx.get('cabin').id);
  await hostCalendarPage.completeSelectedStay();
});

When('respondo a avaliação com {string}', async ({ ctx, hostReviewsPage }, resposta: string) => {
  await hostReviewsPage.open(ctx.get('cabin').id);
  await hostReviewsPage.reply('Cabana linda, faltou lenha', resposta);
});

// ─── Verificações ────────────────────────────────────────────────────────────

Then('vejo que a avaliação foi enviada', async ({ reviewFormPage }) => {
  await reviewFormPage.expectSuccess();
});

Then('vejo a mensagem {string}', async ({ reviewFormPage }, mensagem: string) => {
  await reviewFormPage.expectMessage(mensagem);
});

Then('o comentário fica com no máximo {int} caracteres', async ({ reviewFormPage }, maximo: number) => {
  await reviewFormPage.expectCommentLength(maximo);
});

Then(
  'a página da cabana mostra a nota {string} com {int} avaliação(ões)',
  async ({ ctx, cabinPage }, nota: string, total: number) => {
    await cabinPage.open(ctx.get('cabin').slug);
    await cabinPage.expectRating(nota, total);
  },
);

Then('a página da cabana mostra minha avaliação só com o primeiro nome', async ({ ctx, cabinPage }) => {
  const guest = ctx.get('guest');
  await cabinPage.open(ctx.get('cabin').slug);
  await cabinPage.expectReviewBy(guest.firstName, guest.nome, 'Lugar incrível, voltaremos');
});

Then('a página da cabana mostra a resposta {string}', async ({ ctx, cabinPage }, resposta: string) => {
  await cabinPage.open(ctx.get('cabin').slug);
  await cabinPage.expectTextVisible(resposta);
});
