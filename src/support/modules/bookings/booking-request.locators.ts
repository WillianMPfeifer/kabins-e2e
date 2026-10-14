import type { LocatorMap, RouteMap } from '../../core/locator.types';
import { escapeRegExp } from '../../core/text';

export const bookingRequestRoutes = {
  bySlug: (slug: string) => `/reservar/${slug}`,
} satisfies RouteMap;

export const bookingRequestLocators = {
  title: (cabinName: string) => ({ role: 'heading', level: 1, name: `Reservar ${cabinName}` }),
  monthSelect: { role: 'combobox', name: 'Selecionar mês de reserva' },
  nextMonthButton: { role: 'button', name: 'Próximo mês' },
  previousMonthButton: { role: 'button', name: 'Mês anterior' },
  /**
   * Célula do calendário. O app expõe "12 de Outubro, R$ 300,00" (livre) ou
   * "12 de Outubro, indisponível" como nome acessível — o teste usa o mesmo
   * texto que um leitor de tela anunciaria.
   */
  dayCell: (day: number, monthName: string) => ({
    role: 'button',
    name: new RegExp(`^${day} de ${escapeRegExp(monthName)},`),
  }),
  availableDayCell: (day: number, monthName: string) => ({
    role: 'button',
    name: new RegExp(`^${day} de ${escapeRegExp(monthName)}, R\\$`),
  }),
  unavailableDayCell: (day: number, monthName: string) => ({
    role: 'button',
    name: new RegExp(`^${day} de ${escapeRegExp(monthName)}, indisponível`),
  }),
  checkinHint: { text: /Clique no dia de chegada/ },
  checkoutHint: { text: /Agora clique no dia de saída/ },
  nightsSelected: (nights: number) => ({
    text: nights === 1 ? '1 noite selecionada' : `${nights} noites selecionadas`,
  }),
  guestNameInput: { label: /Nome Completo/ },
  guestPhoneInput: { label: /WhatsApp \/ Telefone/ },
  guestEmailInput: { label: /E-mail/ },
  notesInput: { label: /Recado para o anfitrião/ },
  submitButton: {
    role: 'button',
    name: /Solicitar Reserva|Selecione as datas e preencha seus dados|Enviando solicitação|Confirme o aviso de reserva simultânea/,
  },
  stayLimitMessage: { text: /no máximo 5 noites por estadia/ },
  occupiedRangeMessage: { text: /Algumas noites neste período estão ocupadas/ },
  conflictWarning: { text: /Você já possui uma reserva ativa para estas datas/ },
  conflictCheckbox: { role: 'checkbox', name: /Sim, estou ciente e confirmo/ },
  /** Erro devolvido pela Server Action (ex.: sessão ausente, conflito de datas). */
  formError: (message: string | RegExp) => ({ text: message }),
} satisfies LocatorMap;
