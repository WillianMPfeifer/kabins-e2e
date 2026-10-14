import { expect } from '@playwright/test';
import { BasePage } from '../../core/base.page';
import { guideLocators as L, guideRoutes } from './guide.locators';

/** Guia digital do hóspede: o que cada perfil consegue ver. */
export class GuidePage extends BasePage {
  async open(slug: string): Promise<void> {
    await this.visit(guideRoutes.bySlug(slug));
    await expect(this.el(L.pageHeading).first()).toBeVisible();
  }

  async expectSecretVisible(value: string): Promise<void> {
    await expect(this.el(L.secret(value)).first()).toBeVisible();
  }

  async expectSecretHidden(value: string): Promise<void> {
    await expect(this.el(L.secret(value))).toHaveCount(0);
  }

  async expectCountdown(): Promise<void> {
    await expect(this.el(L.releaseNotice)).toBeVisible();
  }

  /** A tela não pode afirmar que a estadia está confirmada. */
  async expectNoConfirmationClaim(): Promise<void> {
    await expect(this.el(L.pageHeading).first()).toBeVisible();
    await expect(this.el(L.confirmedClaim)).toHaveCount(0);
  }

  async expectNoActiveBooking(): Promise<void> {
    await expect(this.el(L.noBookingHeading)).toBeVisible();
  }

  async expectHostPreview(): Promise<void> {
    await expect(this.el(L.previewBanner)).toBeVisible();
  }

  async expectComingSoon(): Promise<void> {
    await expect(this.el(L.comingSoonBadge)).toBeVisible();
    await expect(this.el(L.talkToHostLink)).toBeVisible();
  }

  async expectGuestOnlyGate(): Promise<void> {
    await expect(this.el(L.guestOnlyBadge)).toBeVisible();
  }

  async followLoginLink(): Promise<void> {
    await this.el(L.loginLink).click();
  }

  async expectAt(slug: string): Promise<void> {
    await this.expectPath(guideRoutes.bySlug(slug));
  }
}
