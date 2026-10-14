import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { reviewFormLocators as L, reviewFormRoutes } from './review-form.locators';

export class ReviewFormPage extends BasePage {
  async open(bookingId: string): Promise<void> {
    await this.visit(reviewFormRoutes.forBooking(bookingId));
  }

  async submit(stars: number, comment?: string): Promise<void> {
    await this.el(L.star(stars)).click();
    if (comment !== undefined) await this.el(L.commentInput).fill(comment);
    await this.el(L.publishButton).click();
  }

  async typeComment(text: string): Promise<void> {
    await this.el(L.commentInput).fill(text);
  }

  async expectSuccess(): Promise<void> {
    await expect(this.el(L.successHeading)).toBeVisible({ timeout: 30_000 });
  }

  async expectMessage(text: string | RegExp): Promise<void> {
    await expect(this.el(L.message(text)).first()).toBeVisible({ timeout: 30_000 });
  }

  async expectCommentLength(max: number): Promise<void> {
    const value = await this.el(L.commentInput).inputValue();
    expect(value.length).toBeLessThanOrEqual(max);
  }
}
