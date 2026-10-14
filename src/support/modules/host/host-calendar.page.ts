import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { dateParts, type IsoDate } from '../../core/dates';
import { availabilityOptions, hostCalendarLocators as L, hostCalendarRoutes } from './host-calendar.locators';

const SHORT_MONTHS = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

/** "20 de out. de 2026" — como o editor intitula o dia selecionado. */
function dayLabel(date: IsoDate): string {
  const { day, monthIndex, year } = dateParts(date);
  return `${day} de ${SHORT_MONTHS[monthIndex]} de ${year}`;
}

/** Valor digitado na máscara de moeda do painel, que preenche da direita para a esquerda (centavos). */
function centsKeystrokes(reais: number): string {
  return String(Math.round(reais * 100));
}

export class HostCalendarPage extends BasePage {
  async open(cabinId: string): Promise<void> {
    await this.visit(hostCalendarRoutes.forCabin(cabinId));
    await expect(this.el(L.calendarTab)).toBeVisible();
  }

  async goToMonthOf(date: IsoDate): Promise<void> {
    const { monthName, year } = dateParts(date);
    const heading = this.el(L.monthHeading(`${monthName} ${year}`));
    for (let i = 0; i < 13 && !(await heading.isVisible()); i++) {
      await this.el(L.nextMonthButton).click();
    }
    await expect(heading).toBeVisible();
  }

  async selectDay(date: IsoDate): Promise<void> {
    await this.goToMonthOf(date);
    await this.el(L.dayButton(dateParts(date).day))
      .first()
      .click();
  }

  /**
   * Seleciona um período. O editor estende o período a partir do dia já
   * selecionado; clicar de novo num dia isolado reinicia a seleção.
   */
  async selectRange(from: IsoDate, to: IsoDate): Promise<void> {
    await this.selectDay(from);
    if (await this.el(L.rangeEditor).isVisible()) await this.selectDay(from);
    await expect(this.el(L.singleDayHeading(dayLabel(from)))).toBeVisible();
    await this.selectDay(to);
    await expect(this.el(L.rangeEditor)).toBeVisible();
  }

  async setRangePrice(reais: number): Promise<void> {
    const input = this.el(L.rangePriceInput);
    await input.clear();
    await input.pressSequentially(centsKeystrokes(reais));
  }

  async setRangeAvailability(option: keyof typeof availabilityOptions): Promise<void> {
    await this.el(L.availabilitySelect).selectOption({ label: availabilityOptions[option] });
  }

  async saveRange(): Promise<void> {
    await this.el(L.saveRangeButton).click();
    await expect(this.el(L.savedMessage).first()).toBeVisible({ timeout: 30_000 });
  }

  /** Salva o período sem esperar sucesso — para regras que recusam a alteração. */
  async trySaveRange(): Promise<void> {
    const actionDone = this.page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().includes('/painel'),
      { timeout: 30_000 },
    );
    await this.el(L.saveRangeButton).click();
    await actionDone;
  }

  async expectSaveRefused(reason: RegExp): Promise<void> {
    await expect(this.el(L.panelMessage(reason)).first()).toBeVisible({ timeout: 30_000 });
    await expect(this.el(L.savedMessage)).toHaveCount(0);
  }

  /** Conclui a estadia do dia selecionado, aceitando a confirmação do navegador se houver. */
  async completeSelectedStay(): Promise<void> {
    this.page.once('dialog', (dialog) => void dialog.accept());
    const actionDone = this.page.waitForResponse(
      (response) => response.request().method() === 'POST' && response.url().includes('/painel'),
      { timeout: 30_000 },
    );
    await this.el(L.completeStayButton).first().click();
    await actionDone;
  }

  // ─── iCal ──────────────────────────────────────────────────────────────────

  async openIcal(): Promise<void> {
    await this.el(L.icalButton).click();
    await expect(this.el(L.icalImportInput)).toBeVisible();
  }

  async exportFeedUrl(): Promise<string> {
    const field = this.el(L.icalExportField).first();
    await expect(field).toBeVisible();
    return field.inputValue();
  }

  async importFrom(url: string): Promise<void> {
    await this.el(L.icalImportInput).fill(url);
    await this.el(L.icalSyncButton).click();
  }

  async expectImportRejectedWithoutTechnicalDetails(): Promise<void> {
    await expect(this.el(L.icalRejection).first()).toBeVisible({ timeout: 30_000 });
    await expect(this.el(L.technicalLeak)).toHaveCount(0);
  }
}
