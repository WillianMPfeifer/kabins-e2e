import type { RouteMap } from '../../core/locator.types';

/**
 * Endereços públicos da cabanas-api, relativos a `E2E_API_URL`.
 * São as portas que qualquer pessoa na internet alcança sem login.
 */
export const publicApiRoutes = {
  bookingRequest: (identifier: string) => `reservas/solicitacao/${encodeURIComponent(identifier)}`,
  availability: (cabinId: string, from: string, to: string) =>
    `cabanas/${cabinId}/disponibilidade?de=${from}&ate=${to}`,
  icalFeed: (slug: string) => `cabanas/${slug}/ical.ics`,
} satisfies RouteMap;
