import { randomBytes } from 'node:crypto';

/**
 * Identificador curto e único entre workers e execuções paralelas no CI.
 * Formato: <timestamp base36><4 bytes aleatórios hex> — ordenável e legível no banco.
 */
export function createUniqueId(prefix = ''): string {
  const id = `${Date.now().toString(36)}${randomBytes(4).toString('hex')}`;
  return prefix ? `${prefix}-${id}` : id;
}

/** Sufixo apenas alfabético — para campos que rejeitam dígitos (ex.: nomes próprios). */
export function createUniqueWord(length = 6): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}
