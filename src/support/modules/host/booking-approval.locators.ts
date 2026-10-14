import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const bookingApprovalRoutes = {
  byToken: (token: string) => `/c/${token}`,
} satisfies RouteMap;

/** Link assinado /c/[token] enviado ao anfitrião para aprovar ou recusar a solicitação. */
export const bookingApprovalLocators = {
  heading: { role: 'heading', level: 1 },
  loginAsHostLink: { role: 'link', name: /Entrar como Anfitrião/ },
  goToDashboardLink: { role: 'link', name: /Ir para o meu Painel/ },
  confirmButton: { role: 'button', name: /Confirmar Reserva|Confirmando/ },
  declineButton: { role: 'button', name: 'Recusar Solicitação' },
  declineReasonInput: { placeholder: /Manutenção agendada/ },
  confirmDeclineButton: { role: 'button', name: /Confirmar Recusa|Recusando/ },
  detailValue: (label: string) => ({ css: `dt:text-is("${label}") + dd` }),
  exactText: (text: string) => ({ text, exact: true }),
  allBookingsLink: { role: 'link', name: /Ver Todas as Reservas no Painel/ },
} satisfies LocatorMap;

export const bookingApprovalHeadings = {
  restricted: 'Acesso Restrito ao Anfitrião',
  unauthorized: 'Acesso Não Autorizado',
  pending: 'Nova Solicitação de Reserva',
  approved: 'Reserva Aprovada com Sucesso',
  declined: 'Esta solicitação foi recusada',
  expired: 'O tempo de hold desta solicitação expirou',
  cancelled: 'Esta reserva foi cancelada',
} as const;
