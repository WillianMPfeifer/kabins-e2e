import type { LocatorMap } from '../../core/locator.types';

const dialog = { role: 'dialog', name: 'Entre para reservar' } as const;

/** Login flutuante (modal) aberto pela reserva quando o visitante não está conectado. */
export const loginModalLocators = {
  dialog,
  emailInput: { label: 'E-mail', within: dialog },
  passwordInput: { label: 'Senha', exact: true, within: dialog },
  submitButton: { role: 'button', name: /Entrar com E-mail|Entrando/, within: dialog },
  googleButton: { role: 'button', name: /Continuar com Google|Conectando ao Google/, within: dialog },
  closeButton: { role: 'button', name: 'Fechar', within: dialog },
  errorAlert: { role: 'alert', hasText: /\S/, within: dialog },
} satisfies LocatorMap;
