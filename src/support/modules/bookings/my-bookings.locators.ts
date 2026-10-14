import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const myBookingsRoutes = {
  page: '/conta/reservas',
} satisfies RouteMap;

/** Área do hóspede /conta/reservas. */
export const myBookingsLocators = {
  heading: { role: 'heading', level: 1, name: 'Minhas reservas' },
  emptyState: { text: 'Nenhuma reserva ainda' },
  heldSection: { role: 'heading', name: /Aguardando Confirmação do Anfitrião/ },
  /** Card de uma reserva, identificado pelo código curto. */
  bookingCard: (code: string) => ({ role: 'article', hasText: code }),
  cardStatus: (statusText: string) => ({ text: statusText, exact: true }),
  cancelButton: { role: 'button', name: 'Cancelar reserva' },
  cancelReasonInput: { label: /Motivo ou mensagem para o anfitrião/ },
  confirmCancelButton: { role: 'button', name: /Sim, cancelar|Cancelando/ },
  backButton: { role: 'button', name: 'Voltar' },
  detailsLink: { role: 'link', name: 'Ver detalhes' },
  reviewLink: { role: 'link', name: 'Avaliar Estadia' },
  cardText: (text: string | RegExp) => ({ text }),
} satisfies LocatorMap;

/** Status em linguagem de negócio (usada nos .feature) → rótulo exibido no card (BookingCard.tsx). */
export const bookingStatusLabels = {
  'aguardando aprovação': 'Hold (2h) • Aguardando Aprovação',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  recusada: 'Recusada',
  expirada: 'Expirada',
} as const;
