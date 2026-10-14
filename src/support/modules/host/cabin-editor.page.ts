import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { cabinEditorLocators as L, cabinEditorRoutes } from './cabin-editor.locators';

export class CabinEditorPage extends BasePage {
  async openCreate(): Promise<void> {
    await this.visit(cabinEditorRoutes.create);
    await expect(this.el(L.createHeading)).toBeVisible();
  }

  async openEdit(cabinId: string): Promise<void> {
    await this.visit(cabinEditorRoutes.edit(cabinId));
  }

  async expectEditFormVisible(): Promise<void> {
    await expect(this.el(L.editHeading)).toBeVisible();
  }

  async fillName(name: string): Promise<void> {
    await this.el(L.nameInput).fill(name);
  }

  async fillCep(cep: string): Promise<void> {
    await this.el(L.cepInput).fill(cep);
  }

  /** Digita a diária tecla a tecla, como uma pessoa faria (o campo reage a cada tecla). */
  async typePrice(text: string): Promise<void> {
    const input = this.el(L.priceInput);
    await input.clear();
    await input.pressSequentially(text);
  }

  /**
   * O campo precisa representar o valor digitado. Aceita centavos ("380,50")
   * ou o valor arredondado ("380"); nunca o valor multiplicado por 100.
   */
  async expectPriceFieldNear(reais: number): Promise<void> {
    const raw = await this.el(L.priceInput).inputValue();
    const parsed = Number(
      raw
        .replace(/[^\d,.]/g, '')
        .replace(/\./g, '')
        .replace(',', '.'),
    );
    expect(Math.abs(parsed - reais), `campo de diária mostra "${raw}"`).toBeLessThan(1);
  }

  async publish(): Promise<void> {
    await this.el(L.publishButton).click();
    await this.expectPath(/\/painel\?cabanaId=/);
  }

  /** Depois de publicar, o painel abre com `?cabanaId=<id da cabana nova>`. */
  selectedCabinIdFromUrl(): string {
    const id = new URL(this.page.url()).searchParams.get('cabanaId');
    if (!id) throw new Error(`O painel não indicou a cabana selecionada: ${this.page.url()}`);
    return id;
  }

  /** O painel mostra o selo "Em análise" na cabana recém-cadastrada. */
  async expectUnderReviewBadge(cabinName: string): Promise<void> {
    const card = this.page.getByRole('button').filter({ hasText: cabinName });
    await expect(card.getByText('Em análise')).toBeVisible();
  }

  async saveEdit(): Promise<void> {
    const actionDone = this.page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().includes('/painel/cabanas/'),
      { timeout: 30_000 },
    );
    await this.el(L.saveButton).click();
    await actionDone;
  }

  async extractAddressFrom(mapsLink: string): Promise<void> {
    await this.el(L.mapsLinkInput).fill(mapsLink);
    const actionDone = this.page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().includes('/painel/cabanas/'),
      { timeout: 30_000 },
    );
    await this.el(L.extractAddressButton).click();
    await actionDone;
  }
}
