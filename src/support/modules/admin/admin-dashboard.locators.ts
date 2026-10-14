import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const adminDashboardRoutes = {
  page: '/admin',
} satisfies RouteMap;

/** Gestão da Plataforma — /admin. */
export const adminDashboardLocators = {
  heading: { role: 'heading', level: 1, name: 'Gestão da Plataforma' },
  newUserButton: { role: 'button', name: /Novo Usuário/ },
  hostsSection: { role: 'heading', name: 'Anfitriões Cadastrados' },
  usersSection: { role: 'heading', name: 'Usuários Cadastrados' },
  curadoriaTab: { role: 'button', name: /^Curadoria/ },
  approveCabin: (nome: string) => ({ role: 'button', name: `Aprovar ${nome}` }),
  textOnPage: (text: string) => ({ text }),
} satisfies LocatorMap;
