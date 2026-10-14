import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const guideRoutes = {
  bySlug: (slug: string) => `/guia/${slug}`,
} satisfies RouteMap;

/** Guia digital /guia/[slug] — cada estado de acesso tem um texto próprio. */
export const guideLocators = {
  pageHeading: { role: 'heading', level: 1 },
  confirmedClaim: { role: 'heading', level: 1, name: /está confirmada/ },
  previewBanner: { text: 'Modo Visualização de Anfitrião' },
  wifiHeading: { role: 'heading', name: 'Wi-Fi da Cabana' },
  /** Valores sensíveis (senha do Wi-Fi, código da fechadura) aparecem em <strong>. */
  secret: (value: string) => ({ text: value, exact: true }),
  releaseNotice: { text: /será liberado no dia do seu check-in/ },
  noBookingHeading: { role: 'heading', level: 1, name: 'Nenhuma reserva encontrada' },
  comingSoonBadge: { text: 'Guia Digital em Breve' },
  talkToHostLink: { role: 'link', name: 'Falar com o Anfitrião' },
  guestOnlyBadge: { text: 'Área Exclusiva de Hóspedes' },
  loginLink: { role: 'link', name: 'Entrar com Minha Conta' },
} satisfies LocatorMap;
