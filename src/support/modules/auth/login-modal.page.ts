import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { loginModalLocators as L } from './login-modal.locators';

/** Login flutuante: autentica sem tirar o visitante da página em que está. */
export class LoginModalComponent extends BasePage {
  async expectOpen(): Promise<void> {
    // Abre após a hidratação (e, no envio da reserva, após a Server Action).
    await expect(this.el(L.dialog)).toBeVisible({ timeout: 30_000 });
    await expect(this.el(L.googleButton)).toBeVisible();
  }

  async expectClosed(): Promise<void> {
    await expect(this.el(L.dialog)).toBeHidden({ timeout: 30_000 });
  }

  async loginWith(email: string, password: string): Promise<void> {
    await this.el(L.emailInput).fill(email);
    await this.el(L.passwordInput).fill(password);
    await this.el(L.submitButton).click();
  }

  async close(): Promise<void> {
    await this.el(L.closeButton).click();
    await this.expectClosed();
  }

  async expectErrorMessage(message: string | RegExp): Promise<void> {
    await expect(this.el(L.errorAlert)).toContainText(message);
  }
}
