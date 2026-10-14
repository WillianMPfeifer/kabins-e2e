import { randomInt } from 'node:crypto';

/**
 * Gerador de CPF válido (dígitos verificadores corretos).
 * A API valida o DV de verdade — CPF "000..." ou aleatório é recusado.
 */
export function generateCpf(): string {
  const base = Array.from({ length: 9 }, () => randomInt(0, 10));
  // Evita sequências repetidas (111.111.111-11), recusadas pelo validador.
  if (base.every((digit) => digit === base[0])) return generateCpf();
  base.push(cpfCheckDigit(base));
  base.push(cpfCheckDigit(base));
  return base.join('');
}

function cpfCheckDigit(digits: number[]): number {
  const weightStart = digits.length + 1;
  const sum = digits.reduce((acc, digit, index) => acc + digit * (weightStart - index), 0);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

/** CPF com DV adulterado — para cenários de validação. */
export function generateInvalidCpf(): string {
  const valid = generateCpf();
  const lastDigit = (Number(valid[10]) + 1) % 10;
  return `${valid.slice(0, 10)}${lastDigit}`;
}

/** "529.982.247-25" */
export function formatCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

/** Celular brasileiro aleatório no formato E.164 (+55 DDD 9XXXX-XXXX). */
export function generateMobilePhone(ddd = '54'): string {
  const suffix = Array.from({ length: 8 }, () => randomInt(0, 10)).join('');
  return `+55${ddd}9${suffix}`;
}

/** "+5554991824412" → "(54) 99182-4412" — máscara usada nos formulários. */
export function toPhoneMask(e164: string): string {
  const digits = e164.replace(/\D/g, '').replace(/^55/, '');
  return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
}
