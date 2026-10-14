import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { notFoundLocators } from './not-found.locators';

/**
 * Navegação genérica e asserções de roteamento que não pertencem a uma tela
 * específica (acesso direto por URL, redirecionamentos, 404).
 */
export class NavigationPage extends BasePage {
  async goTo(path: string): Promise<void> {
    await this.visit(path);
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async expectAt(path: string | RegExp): Promise<void> {
    await this.expectPath(path);
  }

  async expectNotFound(): Promise<void> {
    await expect(this.el(notFoundLocators.heading)).toBeVisible();
  }
}
