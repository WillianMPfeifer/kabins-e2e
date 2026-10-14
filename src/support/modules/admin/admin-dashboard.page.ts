import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { adminDashboardLocators as L, adminDashboardRoutes } from './admin-dashboard.locators';

export class AdminDashboardPage extends BasePage {
  async open(): Promise<void> {
    await this.visit(adminDashboardRoutes.page);
  }

  async expectLoaded(): Promise<void> {
    await this.expectPath(adminDashboardRoutes.page);
    await expect(this.el(L.heading)).toBeVisible();
  }

  /** Perfil sem privilégio: a tela de gestão nunca é renderizada (redireciona ou nega). */
  async expectNotAccessible(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await expect(this.el(L.heading)).toHaveCount(0);
  }

  async expectHostsSectionVisible(): Promise<void> {
    await expect(this.el(L.hostsSection)).toBeVisible();
  }

  async openCuradoriaTab(): Promise<void> {
    await this.el(L.curadoriaTab).click();
  }

  async approveCabin(nome: string): Promise<void> {
    const approve = this.el(L.approveCabin(nome));
    await approve.click();
    await expect(approve).toHaveCount(0);
  }

  async expectTextListed(text: string): Promise<void> {
    await expect(this.el(L.textOnPage(text)).first()).toBeVisible();
  }
}
