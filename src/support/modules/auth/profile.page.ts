import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { profileLocators as L, profileRoutes } from './profile.locators';

export class ProfilePage extends BasePage {
  async open(): Promise<void> {
    await this.visit(profileRoutes.page);
    await expect(this.el(L.heading)).toBeVisible();
  }

  async changePassword(current: string, next: string, confirmation = next): Promise<void> {
    await this.el(L.currentPasswordInput).fill(current);
    await this.el(L.newPasswordInput).fill(next);
    await this.el(L.confirmPasswordInput).fill(confirmation);
    await this.el(L.updatePasswordButton).click();
  }

  async updatePhone(digits: string): Promise<void> {
    const input = this.el(L.phoneInput);
    await input.clear();
    await input.pressSequentially(digits);
    await this.el(L.saveProfileButton).click();
  }

  async expectPhoneField(formatted: string): Promise<void> {
    await expect(this.el(L.phoneInput)).toHaveValue(formatted);
  }

  async expectMessage(text: string | RegExp): Promise<void> {
    await expect(this.el(L.message(text)).first()).toBeVisible({ timeout: 30_000 });
  }
}
