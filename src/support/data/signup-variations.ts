import { birthDateForAge } from '../core/dates';
import { generateInvalidCpf } from '../core/documents';
import type { RegistrationData } from './test-data.types';

export interface SignupVariation {
  overrides?: Partial<RegistrationData>;
  /** Quando definido, a confirmação de senha difere da senha. */
  confirmPassword?: string;
}

/**
 * Situações inválidas citadas nos cenários de cadastro (texto do .feature → dado).
 * Centralizar aqui evita lógica condicional nos steps e documenta cada caso.
 */
export const SIGNUP_VARIATIONS: Record<string, () => SignupVariation> = {
  'o CPF com dígito verificador errado': () => ({ overrides: { cpf: generateInvalidCpf() } }),
  'a idade de 17 anos': () => ({ overrides: { dataNascimento: birthDateForAge(17) } }),
  'a senha com menos de 8 caracteres': () => ({ overrides: { senha: 'Curta12' } }),
  'a senha sem números': () => ({ overrides: { senha: 'SomenteLetrasAqui' } }),
  'a confirmação de senha diferente': () => ({ confirmPassword: 'OutraSenha2026x' }),
};

export function signupVariation(description: string): SignupVariation {
  const factory = SIGNUP_VARIATIONS[description];
  if (!factory) {
    throw new Error(
      `Situação de cadastro não mapeada: "${description}". Situações conhecidas: ${Object.keys(SIGNUP_VARIATIONS).join(' | ')}`,
    );
  }
  return factory();
}
