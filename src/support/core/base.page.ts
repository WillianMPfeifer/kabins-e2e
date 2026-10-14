import { expect, type Locator, type Page } from '@playwright/test';
import { resolveLocator } from './locator-resolver';
import type { LocatorDef } from './locator.types';
import { escapeRegExp } from './text';

/**
 * Base técnica de todos os Page Objects.
 *
 * Fornece apenas o que é genérico (resolver locators, navegar, esperar a URL).
 * Regra de negócio e asserções de tela ficam nas subclasses em `modules/`.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Resolve um locator declarativo a partir da página inteira. */
  protected el(def: LocatorDef): Locator {
    return resolveLocator(this.page, def);
  }

  /** Resolve um locator declarativo dentro de outro elemento. */
  protected elIn(root: Locator, def: LocatorDef): Locator {
    return resolveLocator(root, def);
  }

  protected async visit(path: string): Promise<void> {
    await this.page.goto(path);
  }

  protected async expectPath(path: string | RegExp): Promise<void> {
    const pattern = typeof path === 'string' ? new RegExp(`${escapeRegExp(path)}(?:[?#].*)?$`) : path;
    // Redirecionamentos passam por Server Actions + API: mais lentos que uma asserção de DOM.
    await expect(this.page).toHaveURL(pattern, { timeout: 30_000 });
  }

  /** Caminho atual (sem origem), útil para asserções de redirecionamento. */
  currentPath(): string {
    const url = new URL(this.page.url());
    return `${url.pathname}${url.search}`;
  }
}
