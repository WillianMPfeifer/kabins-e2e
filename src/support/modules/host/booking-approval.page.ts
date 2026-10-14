import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import {
  bookingApprovalHeadings,
  bookingApprovalLocators as L,
  bookingApprovalRoutes,
} from './booking-approval.locators';

export type ApprovalScreen = keyof typeof bookingApprovalHeadings;

export class BookingApprovalPage extends BasePage {
  async open(token: string): Promise<void> {
    await this.visit(bookingApprovalRoutes.byToken(token));
  }

  async expectScreen(screen: ApprovalScreen): Promise<void> {
    await expect(this.el(L.heading)).toHaveText(bookingApprovalHeadings[screen]);
  }

  async expectGuestData(guestName: string): Promise<void> {
    await expect(this.el(L.detailValue('Hóspede'))).toHaveText(guestName);
  }

  /** Compara só os dígitos: o formato de exibição do telefone não é o assunto. */
  async expectGuestPhoneDigits(digits: string): Promise<void> {
    await expect(this.el(L.detailValue('Telefone'))).toHaveText(new RegExp(digits.split('').join('\\D*')));
  }

  async expectGuestDataHidden(guestName: string): Promise<void> {
    await expect(this.el(L.exactText(guestName))).toHaveCount(0);
    await expect(this.el(L.confirmButton)).toHaveCount(0);
  }

  async approve(): Promise<void> {
    await this.el(L.confirmButton).click();
    await this.waitForDecisionToSettle();
  }

  async decline(reason?: string): Promise<void> {
    await this.el(L.declineButton).click();
    if (reason) await this.el(L.declineReasonInput).fill(reason);
    await this.el(L.confirmDeclineButton).click();
    await this.waitForDecisionToSettle();
  }

  /** A decisão é uma Server Action: só seguimos quando os botões de decisão saem da tela. */
  private async waitForDecisionToSettle(): Promise<void> {
    await expect(this.el(L.declineButton)).toHaveCount(0, { timeout: 30_000 });
  }

  async followLoginLink(): Promise<void> {
    await this.el(L.loginAsHostLink).click();
  }

  async expectDecisionButtonsHidden(): Promise<void> {
    await expect(this.el(L.confirmButton)).toHaveCount(0);
    await expect(this.el(L.declineButton)).toHaveCount(0);
  }
}
