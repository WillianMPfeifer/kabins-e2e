import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const loginRoutes = {
  page: '/login',
  withDestination: (destino: string) => `/login?destino=${encodeURIComponent(destino)}`,
} satisfies RouteMap;

export const loginLocators = {
  heading: { role: 'heading', name: 'Entrar', level: 1 },
  emailInput: { label: 'E-mail' },
  passwordInput: { label: 'Senha', exact: true },
  togglePasswordButton: { role: 'button', name: /Ver senha|Ocultar senha/ },
  submitButton: { role: 'button', name: /Entrar com E-mail|Entrando/ },
  googleButton: { role: 'button', name: /Continuar com Google/ },
  signupLink: { role: 'link', name: 'Cadastre-se' },
  /** hasText ignora o anunciador de rotas do Next (#__next-route-announcer__), que também é role=alert. */
  errorAlert: { role: 'alert', hasText: /\S/ },
  successStatus: { role: 'status' },
} satisfies LocatorMap;
