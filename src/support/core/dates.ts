/**
 * Datas de calendário (sem hora) em YYYY-MM-DD.
 *
 * A API e o front tratam diárias como datas civis. Calcular com `Date` local
 * reintroduz o bug de fuso que a suíte de integração da API protege — por isso
 * tudo aqui usa UTC explicitamente.
 */

export const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

export type IsoDate = string;

/** Hoje no fuso de São Paulo — o mesmo "hoje" que o usuário vê no calendário. */
export function todayIso(timeZone = 'America/Sao_Paulo'): IsoDate {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
    new Date(),
  );
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Dias a partir de hoje (D+n). */
export function daysFromToday(days: number): IsoDate {
  return addDays(todayIso(), days);
}

/** Lista [from, to) — cada noite de uma estadia. */
export function nightsBetween(from: IsoDate, to: IsoDate): IsoDate[] {
  const nights: IsoDate[] = [];
  for (let cursor = from; cursor < to; cursor = addDays(cursor, 1)) nights.push(cursor);
  return nights;
}

export function dateParts(iso: IsoDate): { year: number; monthIndex: number; day: number; monthName: string } {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, monthIndex: month - 1, day, monthName: MONTH_NAMES_PT[month - 1] };
}

/** "20261013" — formato de data do iCalendar (RFC 5545). */
export function toIcalDate(iso: IsoDate): string {
  return iso.replace(/-/g, '');
}

/** "13/10/2026" — formato exibido em formulários brasileiros. */
export function toBrazilianDate(iso: IsoDate): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Data de nascimento de alguém com exatamente `years` anos completados hoje + `offsetDays`. */
export function birthDateForAge(years: number, offsetDays = 0): IsoDate {
  const [y, m, d] = todayIso().split('-').map(Number);
  return new Date(Date.UTC(y - years, m - 1, d + offsetDays)).toISOString().slice(0, 10);
}
