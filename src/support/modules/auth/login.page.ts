import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { loginLocators as L, loginRoutes } from './login.locators';

export class LoginPage extends BasePage {
  async open(destino?: string): Promise<void> {
    await this.visit(destino ? loginRoutes.withDestination(destino) : loginRoutes.page);
    await this.expectLoaded();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.el(L.heading)).toBeVisible();
  }

  async fillCredentials(email: string, password: string): Promise<void> {
    await this.el(L.emailInput).fill(email);
    await this.el(L.passwordInput).fill(password);
  }

  async submit(): Promise<void> {
    await this.el(L.submitButton).click();
  }

  async loginWith(email: string, password: string): Promise<void> {
    await this.fillCredentials(email, password);
    await this.submit();
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.el(L.togglePasswordButton).click();
  }

  async expectPasswordVisible(visible: boolean): Promise<void> {
    await expect(this.el(L.passwordInput)).toHaveAttribute('type', visible ? 'text' : 'password');
  }

  async expectErrorMessage(message: string | RegExp): Promise<void> {
    await expect(this.el(L.errorAlert)).toContainText(message);
  }

  async errorMessage(): Promise<string> {
    const alert = this.el(L.errorAlert);
    await expect(alert).toBeVisible();
    return (await alert.innerText()).trim();
  }

  /** Mensagens de erro de login devem ser idênticas byte a byte (não revelar se o e-mail existe). */
  expectIdenticalErrorMessages(wrongPassword: string, unknownEmail: string): void {
    expect(wrongPassword, 'mensagem para senha errada').toBeTruthy();
    expect(unknownEmail, 'mensagem para e-mail inexistente deve ser idêntica').toBe(wrongPassword);
  }

  async expectStillOnLogin(): Promise<void> {
    await this.expectPath(/\/login/);
    await this.expectLoaded();
  }

  async expectDestinationParam(destino: string): Promise<void> {
    await expect(this.page).toHaveURL(
      (url) => url.pathname === '/login' && url.searchParams.get('destino') === destino,
      {
        timeout: 30_000,
      },
    );
  }
}
