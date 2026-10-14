import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { receivedBookingsLocators as L, receivedBookingsRoutes } from './received-bookings.locators';

export type BookingGroup = 'Na cabana agora' | 'Próximas chegadas' | 'Encerradas';

export class ReceivedBookingsPage extends BasePage {
  async open(): Promise<void> {
    await this.visit(receivedBookingsRoutes.page);
    await expect(this.el(L.heading)).toBeVisible();
  }

  async expectGroupVisible(group: BookingGroup): Promise<void> {
    await expect(this.el(L.group(group))).toBeVisible();
  }

  async expectBookingListed(code: string): Promise<void> {
    await expect(this.el(L.bookingCard(code))).toBeVisible();
  }

  async expectBookingNotListed(code: string): Promise<void> {
    await expect(this.el(L.bookingCard(code))).toHaveCount(0);
  }
}
