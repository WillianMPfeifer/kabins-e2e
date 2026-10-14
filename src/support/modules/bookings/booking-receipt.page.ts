import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import {
  bookingReceiptLocators as L,
  bookingReceiptRoutes,
  bookingReceiptUrlPattern,
  bookingReceiptTexts,
} from './booking-receipt.locators';

export type ReceiptState = keyof typeof bookingReceiptTexts;

export class BookingReceiptPage extends BasePage {
  async open(bookingId: string): Promise<void> {
    await this.visit(bookingReceiptRoutes.byId(bookingId));
  }

  async expectLoaded(): Promise<void> {
    await this.expectPath(bookingReceiptUrlPattern);
    await expect(this.el(L.statusBadge)).toBeVisible();
  }

  async expectState(state: ReceiptState): Promise<void> {
    const texts = bookingReceiptTexts[state];
    await expect(this.el(L.statusBadge)).toHaveText(texts.badge);
    await expect(this.el(L.heading)).toHaveText(texts.heading);
  }

  /** Lê o código curto exibido (CB-XXXXXX) — passa a ser a referência da reserva no cenário. */
  async bookingCode(): Promise<string> {
    const code = this.el(L.bookingCode).first();
    await expect(code).toBeVisible();
    return (await code.innerText()).trim();
  }

  /** Id da reserva extraído da URL do comprovante. */
  bookingIdFromUrl(): string {
    const match = new URL(this.page.url()).pathname.match(/\/reserva\/([0-9a-f-]{36})/);
    if (!match) throw new Error(`URL não é de comprovante de reserva: ${this.page.url()}`);
    return match[1];
  }

  async expectDetail(label: string, value: string | RegExp): Promise<void> {
    await expect(this.el(L.detailValue(label))).toHaveText(value);
  }
}
