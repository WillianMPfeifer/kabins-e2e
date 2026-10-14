import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { guideEditorLocators as L, guideEditorRoutes } from './guide-editor.locators';

export interface GuideContent {
  wifiName?: string;
  wifiPassword?: string;
  lockCode?: string;
}

/**
 * Editor do guia no painel. Também é o único jeito de criar massa de guia:
 * a web grava o guia direto no banco, sem endpoint na cabanas-api.
 */
export class GuideEditorPage extends BasePage {
  async open(cabinId: string): Promise<void> {
    await this.visit(guideEditorRoutes.forCabin(cabinId));
    await expect(this.el(L.wifiNameInput)).toBeVisible();
  }

  async fill(content: GuideContent): Promise<void> {
    if (content.wifiName !== undefined) await this.el(L.wifiNameInput).fill(content.wifiName);
    if (content.wifiPassword !== undefined) await this.el(L.wifiPasswordInput).fill(content.wifiPassword);
    if (content.lockCode !== undefined) await this.el(L.lockCodeInput).fill(content.lockCode);
  }

  async saveAndConfirm(): Promise<void> {
    await this.el(L.saveButton).click();
    await expect(this.el(L.savedMessage)).toBeVisible({ timeout: 30_000 });
  }

  /** Envia o formulário apontando para outra cabana, como um atacante editando o HTML. */
  async submitTargeting(cabinId: string): Promise<void> {
    await this.el(L.cabinIdField).evaluate((input, id) => {
      (input as HTMLInputElement).value = id;
    }, cabinId);
    // Server Actions são um POST para a própria página; espera a resposta, com sucesso ou erro.
    const actionDone = this.page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().includes('/painel'),
      { timeout: 30_000 },
    );
    await this.el(L.saveButton).click();
    await actionDone;
  }
}
