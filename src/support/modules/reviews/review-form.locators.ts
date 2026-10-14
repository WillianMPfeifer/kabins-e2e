import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const reviewFormRoutes = {
  forBooking: (bookingId: string) => `/avaliar/${bookingId}`,
} satisfies RouteMap;

/** Tela /avaliar/[id]: nota em estrelas + comentário opcional. */
export const reviewFormLocators = {
  star: (stars: number) => ({ role: 'button', name: `Avaliar com ${stars} estrelas` }),
  commentInput: { label: 'Conte os detalhes da sua estadia (opcional)' },
  publishButton: { role: 'button', name: /Publicar minha Avaliação|Publicando|Enviando/ },
  successHeading: { role: 'heading', name: 'Avaliação enviada com sucesso!' },
  message: (text: string | RegExp) => ({ text }),
} satisfies LocatorMap;
