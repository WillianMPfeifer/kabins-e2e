import type { Locator, Page } from '@playwright/test';
import type { LocatorDef } from './locator.types';

type Root = Page | Locator;

/**
 * Converte um `LocatorDef` (dado puro) num `Locator` do Playwright.
 * Único ponto da suíte que conhece a API de seleção do framework.
 */
export function resolveLocator(root: Root, def: LocatorDef): Locator {
  const scope = def.within ? resolveLocator(root, def.within).first() : root;
  const { exact } = def;

  let locator: Locator;
  if ('role' in def) {
    locator = scope.getByRole(def.role, { name: def.name, exact, level: def.level });
  } else if ('label' in def) {
    locator = scope.getByLabel(def.label, { exact });
  } else if ('placeholder' in def) {
    locator = scope.getByPlaceholder(def.placeholder, { exact });
  } else if ('text' in def) {
    locator = scope.getByText(def.text, { exact });
  } else if ('testId' in def) {
    locator = scope.getByTestId(def.testId);
  } else {
    locator = scope.locator(def.css);
  }

  if (def.hasText !== undefined) locator = locator.filter({ hasText: def.hasText });
  if (def.nth === undefined) return locator;
  return def.nth === -1 ? locator.last() : locator.nth(def.nth);
}
