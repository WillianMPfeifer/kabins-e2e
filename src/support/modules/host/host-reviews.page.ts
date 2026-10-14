import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { hostCalendarRoutes } from './host-calendar.locators';
import { hostReviewsLocators as L } from './host-reviews.locators';

export class HostReviewsPage extends BasePage {
  async open(cabinId: string): Promise<void> {
    await this.visit(hostCalendarRoutes.forCabin(cabinId));
    await this.el(L.reviewsTab).click();
  }

  async reply(toComment: string, reply: string): Promise<void> {
    await expect(this.el(L.reviewComment(toComment)).first()).toBeVisible();
    await this.el(L.replyButton).first().click();
    await this.el(L.replyInput).fill(reply);
    await this.el(L.publishReplyButton).click();
    await expect(this.el(L.replyInput)).toHaveCount(0, { timeout: 30_000 });
    await expect(this.el(L.publishedReply(reply)).first()).toBeVisible();
  }
}
