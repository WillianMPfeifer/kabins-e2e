import { expect, type Page } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { pageQualityLocators as L, qualityRoutes, SMALL_PHONE, type QualityPageName } from './page-quality.locators';

/** Erros que o navegador registrou desde que o cenário abriu a página. */
export type RuntimeErrorLog = string[];

/** Massa necessária para montar o endereço das telas. */
export interface QualityTarget {
  slug: string;
  bookingId: string;
  cabinId: string;
}

/** Hidratação e exceções não tratadas: o que um usuário vê como "a tela piscou ou quebrou". */
const RELEVANT_ERROR = /hydrat|did not match|Uncaught|Unhandled|TypeError|ReferenceError|is not defined/i;

function pathFor(name: string, target: QualityTarget): string {
  const route = qualityRoutes[name as QualityPageName];
  if (!route) throw new Error(`Tela desconhecida: "${name}". Use: ${Object.keys(qualityRoutes).join(', ')}.`);
  return route(target.slug, target.bookingId, target.cabinId);
}

/**
 * Checagens transversais que valem para qualquer tela: layout no celular e
 * erros de execução no navegador.
 */
export class PageQualityPage extends BasePage {
  constructor(
    page: Page,
    private readonly errors: RuntimeErrorLog,
  ) {
    super(page);
  }

  async openOnSmallPhone(name: string, target: QualityTarget): Promise<void> {
    await this.page.setViewportSize(SMALL_PHONE);
    await this.openAndSettle(name, target);
  }

  async openAndSettle(name: string, target: QualityTarget): Promise<void> {
    await this.visit(pathFor(name, target));
    await expect(this.el(L.mainContent).first()).toBeVisible();
    // Hidratação e efeitos do React rodam depois do load; espera a rede assentar.
    await this.page.waitForLoadState('networkidle');
  }

  async expectNoHorizontalScroll(): Promise<void> {
    const size = await this.page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    expect(size.content, `largura do conteúdo × tela de ${size.viewport}px`).toBeLessThanOrEqual(size.viewport + 1);
  }

  expectNoRuntimeErrors(): void {
    const relevant = this.errors.filter((message) => RELEVANT_ERROR.test(message));
    expect(relevant, 'erros de hidratação ou exceções no console').toEqual([]);
  }
}
