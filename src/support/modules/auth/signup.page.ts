import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { toBrazilianDate } from '../../core/dates';
import { formatCpf, toPhoneMask } from '../../core/documents';
import type { RegistrationData } from '../../data/test-data.types';
import { signupLocators as L, signupRoutes } from './signup.locators';

export type SignupField = 'nome' | 'email' | 'cpf' | 'telefone' | 'dataNascimento' | 'senha' | 'confirmarSenha';

export class SignupPage extends BasePage {
  async open(): Promise<void> {
    await this.visit(signupRoutes.page);
    await expect(this.el(L.heading)).toBeVisible();
  }

  /**
   * Preenche o formulário como um usuário faria: digitando (os campos têm
   * máscara — CPF, telefone e data são formatados enquanto se digita).
   */
  async fillForm(data: RegistrationData, confirmPassword = data.senha): Promise<void> {
    await this.el(L.nameInput).fill(data.nome);
    await this.el(L.emailInput).fill(data.email);
    await this.el(L.documentInput).pressSequentially(data.cpf);
    await this.el(L.phoneInput).pressSequentially(toPhoneMask(data.telefone).replace(/\D/g, ''));
    await this.el(L.birthDateInput).pressSequentially(toBrazilianDate(data.dataNascimento).replace(/\D/g, ''));
    await this.el(L.passwordInput).fill(data.senha);
    await this.el(L.confirmPasswordInput).fill(confirmPassword);
  }

  async submit(): Promise<void> {
    await this.el(L.submitButton).click();
  }

  async expectMaskedDocument(cpf: string): Promise<void> {
    await expect(this.el(L.documentInput)).toHaveValue(formatCpf(cpf));
  }

  async expectErrorMessage(message: string | RegExp): Promise<void> {
    await expect(this.el(L.errorAlert)).toContainText(message);
  }

  async expectFieldError(message: string): Promise<void> {
    await expect(this.el(L.fieldError(message)).first()).toBeVisible();
  }

  async expectStillOnSignup(): Promise<void> {
    await this.expectPath(/\/cadastro/);
    await expect(this.el(L.heading)).toBeVisible();
  }
}
