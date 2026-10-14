import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { headerLocators as L } from './header.locators';

export class HeaderComponent extends BasePage {
  async openAccountMenu(firstName: string): Promise<void> {
    await this.el(L.accountMenuTrigger(firstName)).click();
  }

  async logout(firstName: string): Promise<void> {
    await this.openAccountMenu(firstName);
    await this.el(L.logoutButton).click();
  }

  async switchRole(firstName: string): Promise<void> {
    await this.openAccountMenu(firstName);
    await this.el(L.switchRoleButton).click();
  }

  async expectLoggedInAs(firstName: string): Promise<void> {
    await expect(this.el(L.accountMenuTrigger(firstName))).toBeVisible();
  }

  async expectLoggedOut(): Promise<void> {
    await expect(this.el(L.loginLink)).toBeVisible();
  }
}
