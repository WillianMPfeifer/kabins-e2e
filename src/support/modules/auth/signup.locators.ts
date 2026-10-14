import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const signupRoutes = {
  page: '/cadastro',
} satisfies RouteMap;

export const signupLocators = {
  heading: { role: 'heading', name: 'Criar Conta', level: 1 },
  nameInput: { label: /Nome Completo/ },
  emailInput: { label: /E-mail/ },
  documentInput: { label: /CPF ou CNPJ/ },
  phoneInput: { label: /Celular \/ WhatsApp/ },
  birthDateInput: { label: /Data de Nascimento/ },
  passwordInput: { label: /Senha \(mín\. 8 caracteres\)/ },
  confirmPasswordInput: { label: /Confirmar Senha/ },
  submitButton: { role: 'button', name: /Cadastrar Conta|Criando sua conta/ },
  loginLink: { role: 'link', name: 'Entrar' },
  errorAlert: { role: 'alert', hasText: /\S/ },
  /** Mensagem de validação logo abaixo de um campo (texto livre, sem papel ARIA no app). */
  fieldError: (message: string) => ({ text: message }),
} satisfies LocatorMap;
