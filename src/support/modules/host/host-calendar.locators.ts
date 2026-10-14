import type { LocatorMap, RouteMap } from '../../core/locator.types';
import { escapeRegExp } from '../../core/text';

export const hostCalendarRoutes = {
  forCabin: (cabinId: string) => `/painel?cabanaId=${cabinId}`,
} satisfies RouteMap;

/** Aba "Calendário & Estadias" do painel: grade do mês + editor do dia/período selecionado. */
export const hostCalendarLocators = {
  calendarTab: { role: 'button', name: 'Calendário & Estadias' },
  monthHeading: (monthAndYear: string) => ({ role: 'heading', level: 3, name: monthAndYear }),
  nextMonthButton: { role: 'button', name: 'Próximo Mês →' },
  /** Célula do dia: o nome acessível começa pelo número ("12 R$ 300", "20 Fulano"). */
  dayButton: (day: number) => ({ role: 'button', name: new RegExp(`^${day} `) }),
  singleDayHeading: (label: string) => ({ role: 'heading', level: 4, name: new RegExp(`^${escapeRegExp(label)}`) }),
  rangeEditor: { text: 'Edição em Período' },
  rangePriceInput: { label: /Diária para o período/i },
  dayPriceInput: { label: 'Diária para este dia' },
  availabilitySelect: { label: 'Disponibilidade no Site' },
  saveRangeButton: { role: 'button', name: /Salvar Período/ },
  saveDayButton: { role: 'button', name: 'Salvar Alterações' },
  savedMessage: { text: /atualizad[oa] com sucesso/ },
  panelMessage: (text: RegExp) => ({ text }),
  completeStayButton: { role: 'button', name: /Concluir Estadia/ },
  // iCal
  icalButton: { role: 'button', name: 'Sincronização iCal (Airbnb)' },
  /** O campo de exportação é somente leitura e não tem rótulo; o valor termina em ical.ics. */
  icalExportField: { css: 'input[value$="ical.ics"]' },
  icalImportInput: { placeholder: 'https://www.airbnb.com.br/calendar/ical/...' },
  icalSyncButton: { role: 'button', name: /Sincronizar & Bloquear Datas|Sincronizando/ },
  icalRejection: {
    text: /URLs seguras|não (é )?permitid|inválid|privad|interno|não foi possível acessar|resolução DNS/i,
  },
  technicalLeak: { text: /TypeError|fetch failed|ECONN|ENOTFOUND|EAI_AGAIN|Error:/ },
} satisfies LocatorMap;

/** Rótulo de disponibilidade no select do editor. */
export const availabilityOptions = {
  disponivel: 'Disponível para Clientes Reservarem',
  bloqueada: 'Bloquear Data (Manutenção / Uso Pessoal)',
} as const;
