import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { dateParts, type IsoDate } from '../../core/dates';
import { bookingRequestLocators as L, bookingRequestRoutes } from './booking-request.locators';

/** Tela /reservar/[slug]: calendário de datas + dados do hóspede + envio da solicitação. */
export class BookingRequestPage extends BasePage {
  async open(slug: string, cabinName?: string): Promise<void> {
    await this.visit(bookingRequestRoutes.bySlug(slug));
    if (cabinName) await this.expectLoaded(cabinName);
  }

  async expectLoaded(cabinName: string): Promise<void> {
    await expect(this.el(L.title(cabinName))).toBeVisible();
  }

  /** Navega o calendário até o mês da data (usa o select de mês, como o usuário faria). */
  async goToMonthOf(date: IsoDate): Promise<void> {
    const { year, monthIndex } = dateParts(date);
    await this.el(L.monthSelect).selectOption(`${year}-${monthIndex}`);
  }

  async pickDay(date: IsoDate): Promise<void> {
    await this.goToMonthOf(date);
    const { day, monthName } = dateParts(date);
    await this.el(L.dayCell(day, monthName)).click();
  }

  async selectStay(checkin: IsoDate, checkout: IsoDate): Promise<void> {
    await this.pickDay(checkin);
    await expect(this.el(L.checkoutHint)).toBeVisible();
    await this.pickDay(checkout);
  }

  async fillGuest(data: { nome?: string; telefone?: string; email?: string; observacoes?: string }): Promise<void> {
    if (data.nome !== undefined) await this.el(L.guestNameInput).fill(data.nome);
    if (data.telefone !== undefined) {
      await this.el(L.guestPhoneInput).clear();
      await this.el(L.guestPhoneInput).pressSequentially(data.telefone.replace(/\D/g, '').replace(/^55/, ''));
    }
    if (data.email !== undefined) await this.el(L.guestEmailInput).fill(data.email);
    if (data.observacoes !== undefined) await this.el(L.notesInput).fill(data.observacoes);
  }

  async submit(): Promise<void> {
    await this.el(L.submitButton).click();
  }

  async expectNightsSelected(nights: number): Promise<void> {
    await expect(this.el(L.nightsSelected(nights))).toBeVisible();
  }

  async expectSubmitEnabled(enabled: boolean): Promise<void> {
    const button = this.el(L.submitButton);
    if (enabled) await expect(button).toBeEnabled();
    else await expect(button).toBeDisabled();
  }

  async expectDayUnavailable(date: IsoDate): Promise<void> {
    await this.goToMonthOf(date);
    const { day, monthName } = dateParts(date);
    await expect(this.el(L.unavailableDayCell(day, monthName))).toBeVisible();
  }

  async expectDayAvailable(date: IsoDate): Promise<void> {
    await this.goToMonthOf(date);
    const { day, monthName } = dateParts(date);
    await expect(this.el(L.availableDayCell(day, monthName))).toBeEnabled();
  }

  async expectStayLimitWarning(): Promise<void> {
    await expect(this.el(L.stayLimitMessage)).toBeVisible();
  }

  async expectOccupiedRangeWarning(): Promise<void> {
    await expect(this.el(L.occupiedRangeMessage)).toBeVisible();
  }

  async expectFormError(message: string | RegExp): Promise<void> {
    // A mensagem vem de uma Server Action que passa pela API: mesmo prazo das demais ações.
    await expect(this.el(L.formError(message))).toBeVisible({ timeout: 30_000 });
  }

  async expectConflictWarning(): Promise<void> {
    await expect(this.el(L.conflictWarning)).toBeVisible();
  }

  async acceptConflict(): Promise<void> {
    await this.el(L.conflictCheckbox).check();
  }

  async expectSubmitTotal(formattedTotal: string): Promise<void> {
    await expect(this.el(L.submitButton)).toContainText(formattedTotal);
  }
}
