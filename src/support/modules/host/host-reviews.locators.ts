import type { LocatorMap } from '../../core/locator.types';

/** Aba "Avaliações & Feedbacks" do painel do anfitrião. */
export const hostReviewsLocators = {
  reviewsTab: { role: 'button', name: /Avaliações & Feedbacks/ },
  reviewComment: (comment: string) => ({ text: comment }),
  replyButton: { role: 'button', name: 'Responder' },
  replyInput: { placeholder: 'Escreva sua resposta...' },
  publishReplyButton: { role: 'button', name: /^Publicar/ },
  publishedReply: (reply: string) => ({ text: reply }),
} satisfies LocatorMap;
