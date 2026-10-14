import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { cabinDetailLocators as L, cabinDetailRoutes } from './cabin-detail.locators';

export interface CabinSummary {
  slug: string;
  nome: string;
  cidade: string;
  estado: string;
  capacidade: number;
}

export class CabinDetailPage extends BasePage {
  async open(slug: string): Promise<void> {
    await this.visit(cabinDetailRoutes.bySlug(slug));
  }

  async expectShowing(cabin: CabinSummary): Promise<void> {
    await expect(this.el(L.title(cabin.nome))).toBeVisible();
    await expect(this.el(L.location(`${cabin.cidade}, ${cabin.estado}`)).first()).toBeVisible();
    await expect(this.el(L.capacity(cabin.capacidade))).toBeVisible();
  }

  async expectTitleVisible(nome: string): Promise<void> {
    await expect(this.el(L.title(nome))).toBeVisible();
  }

  async expectStandardSections(): Promise<void> {
    await expect(this.el(L.aboutSection)).toBeVisible();
    await expect(this.el(L.availabilitySection)).toBeVisible();
    await expect(this.el(L.reviewsSection)).toBeVisible();
  }

  async expectNightlyPriceVisible(): Promise<void> {
    await expect(this.el(L.nightlyPrice).first()).toBeVisible();
  }

  async expectRating(rating: string, count: number): Promise<void> {
    await expect(this.el(L.ratingSummary(rating, count)).first()).toBeVisible();
  }

  /** Avaliação publicada com o primeiro nome do autor, nunca o nome completo. */
  async expectReviewBy(firstName: string, fullName: string, comment: string): Promise<void> {
    await expect(this.el(L.reviewText(comment)).first()).toBeVisible();
    await expect(this.el(L.reviewAuthor(firstName)).first()).toBeVisible();
    await expect(this.el(L.reviewText(fullName))).toHaveCount(0);
  }

  async expectTextVisible(text: string): Promise<void> {
    await expect(this.el(L.reviewText(text)).first()).toBeVisible();
  }

  async startBooking(): Promise<void> {
    await this.el(L.bookNowLink).click();
  }
}
