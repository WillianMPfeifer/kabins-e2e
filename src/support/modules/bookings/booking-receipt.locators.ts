import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const bookingReceiptRoutes = {
  byId: (id: string) => `/reserva/${id}`,
} satisfies RouteMap;

export const bookingReceiptUrlPattern = /\/reserva\/[0-9a-f-]{36}$/;

/** Comprovante /reserva/[id]. */
export const bookingReceiptLocators = {
  heading: { role: 'heading', level: 1 },
  statusBadge: {
    text: /Solicitação Enviada • Aguardando Confirmação|Reserva Confirmada|Reserva Cancelada ou Expirada|Concluído Estadia/,
  },
  bookingCode: { text: /^CB-[A-Z0-9]{6,10}$/ },
  /** Par <dt>/<dd> da lista de detalhes. */
  detailValue: (label: string) => ({ css: `dt:text-is("${label}") + dd` }),
  myBookingsLink: { role: 'link', name: /Minhas reservas/ },
  whatsappLink: { role: 'link', name: /WhatsApp/ },
} satisfies LocatorMap;

export const bookingReceiptTexts = {
  HELD: {
    badge: 'Solicitação Enviada • Aguardando Confirmação',
    heading: 'Falta pouco! Combine os detalhes no WhatsApp',
  },
  CONFIRMADA: { badge: 'Reserva Confirmada', heading: 'Sua estadia está 100% confirmada!' },
  CANCELADA: { badge: 'Reserva Cancelada ou Expirada', heading: 'Esta solicitação foi cancelada' },
} as const;
