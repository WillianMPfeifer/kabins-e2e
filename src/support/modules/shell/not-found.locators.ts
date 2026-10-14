import type { LocatorMap } from '../../core/locator.types';

/** Página 404 global (app/not-found.tsx). */
export const notFoundLocators = {
  heading: { role: 'heading', level: 1, name: 'Essa página não existe' },
  homeLink: { role: 'link', name: /início|home|voltar/i },
} satisfies LocatorMap;
