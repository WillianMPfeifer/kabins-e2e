import { escapeRegExp } from '../../core/text';
import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const cabinDetailRoutes = {
  bySlug: (slug: string) => `/cabana/${slug}`,
} satisfies RouteMap;

export const cabinDetailLocators = {
  title: (name: string) => ({ role: 'heading', level: 1, name }),
  breadcrumb: { role: 'navigation', name: 'Trilha' },
  location: (cityAndState: string) => ({ text: cityAndState, exact: true }),
  capacity: (people: number) => ({ text: `Até ${people} pessoas` }),
  aboutSection: { role: 'heading', name: 'Sobre a cabana' },
  availabilitySection: { role: 'heading', name: 'Disponibilidade da Cabana' },
  reviewsSection: { role: 'heading', name: 'Quem já esteve aqui' },
  nightlyPrice: { text: '/ diária' },
  bookNowLink: { role: 'link', name: /Reservar agora/ },
  ratingSummary: (rating: string, count: number) => ({
    // Resumo da seção "Quem já esteve aqui": "4,0 · 1 avaliação" (o espaçamento varia no HTML).
    text: new RegExp(`^${escapeRegExp(rating)}\\s*·\\s*${count} ${count === 1 ? 'avaliação' : 'avaliações'}$`),
  }),
  reviewText: (text: string) => ({ text }),
  reviewAuthor: (name: string) => ({ text: name, exact: true }),
} satisfies LocatorMap;
