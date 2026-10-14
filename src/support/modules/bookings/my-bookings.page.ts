import { expect, type Locator } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { bookingStatusLabels, myBookingsLocators as L, myBookingsRoutes } from './my-bookings.locators';

export type BookingStatusLabel = keyof typeof bookingStatusLabels;

function statusText(status: string): string {
  const label = bookingStatusLabels[status as BookingStatusLabel];
  if (!label)
    throw new Error(
      `Status de reserva desconhecido: "${status}". Use: ${Object.keys(bookingStatusLabels).join(', ')}.`,
    );
  return label;
}

export class MyBookingsPage extends BasePage {
  async open(): Promise<void> {
    await this.visit(myBookingsRoutes.page);
    await this.expectLoaded();
  }

  /** Só navega — para cenários em que a área pode recusar o acesso. */
  async visitOnly(): Promise<void> {
    await this.visit(myBookingsRoutes.page);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.el(L.heading)).toBeVisible();
  }

  async expectEmpty(): Promise<void> {
    await expect(this.el(L.emptyState)).toBeVisible();
  }

  async expectBookingListed(code: string): Promise<void> {
    await expect(this.card(code)).toBeVisible();
  }

  async expectBookingNotListed(code: string): Promise<void> {
    await expect(this.card(code)).toHaveCount(0);
  }

  async expectBookingStatus(code: string, status: string): Promise<void> {
    await expect(this.elIn(this.card(code), L.cardStatus(statusText(status)))).toBeVisible();
  }

  async cancelBooking(code: string, reason?: string): Promise<void> {
    const card = this.card(code);
    await this.elIn(card, L.cancelButton).click();
    if (reason) await this.elIn(card, L.cancelReasonInput).fill(reason);
    const confirm = this.elIn(card, L.confirmCancelButton);
    await confirm.click();
    // A Server Action revalida a página e o formulário de confirmação some.
    // Esperar por isso evita navegar no meio da ação (o que a cancelaria).
    await expect(confirm).toHaveCount(0, { timeout: 30_000 });
  }

  /** Tenta cancelar sem esperar sucesso — para regras que recusam o cancelamento. */
  async tryToCancel(code: string): Promise<void> {
    const card = this.card(code);
    await this.elIn(card, L.cancelButton).click();
    await this.elIn(card, L.confirmCancelButton).click();
  }

  async expectCardMessage(code: string, text: string | RegExp): Promise<void> {
    await expect(this.elIn(this.card(code), L.cardText(text)).first()).toBeVisible({ timeout: 30_000 });
  }

  async expectCancelUnavailable(code: string): Promise<void> {
    await expect(this.elIn(this.card(code), L.cancelButton)).toHaveCount(0);
  }

  private card(code: string): Locator {
    return this.el(L.bookingCard(code));
  }
}
