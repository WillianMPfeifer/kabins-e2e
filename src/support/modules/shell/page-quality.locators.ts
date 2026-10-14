import type { LocatorMap, RouteMap } from '../../core/locator.types';

/** Elementos usados só para saber que a página terminou de renderizar. */
export const pageQualityLocators = {
  mainContent: { role: 'main' },
} satisfies LocatorMap;

/** Telas principais, pelo nome usado nos cenários. */
export const qualityRoutes = {
  home: () => '/',
  'página da cabana': (slug: string) => `/cabana/${slug}`,
  'formulário de reserva': (slug: string) => `/reservar/${slug}`,
  comprovante: (_slug: string, bookingId: string) => `/reserva/${bookingId}`,
  'minhas reservas': () => '/conta/reservas',
  perfil: () => '/perfil',
  guia: (slug: string) => `/guia/${slug}`,
  'painel do anfitrião': (_slug: string, _bookingId: string, cabinId: string) => `/painel?cabanaId=${cabinId}`,
} satisfies RouteMap;

export type QualityPageName = keyof typeof qualityRoutes;

/** Largura de celular pequeno (Galaxy A/Moto G), o pior caso comum no Brasil. */
export const SMALL_PHONE = { width: 360, height: 780 } as const;
