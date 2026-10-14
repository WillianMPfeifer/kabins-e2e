import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const receivedBookingsRoutes = {
  page: '/painel/reservas',
} satisfies RouteMap;

/** Painel do anfitrião — /painel/reservas. */
export const receivedBookingsLocators = {
  heading: { role: 'heading', level: 1, name: 'Reservas recebidas' },
  emptyState: { text: 'Nenhuma reserva ainda' },
  group: (title: 'Na cabana agora' | 'Próximas chegadas' | 'Encerradas') => ({ role: 'heading', name: title }),
  bookingCard: (code: string) => ({ role: 'article', hasText: code }),
} satisfies LocatorMap;
