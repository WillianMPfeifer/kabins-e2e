import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const profileRoutes = {
  page: '/perfil',
} satisfies RouteMap;

/** /perfil — dados pessoais e troca de senha. Os campos de senha só têm placeholder como nome. */
export const profileLocators = {
  heading: { role: 'heading', level: 2, name: 'Dados Pessoais' },
  phoneInput: { placeholder: '(00) 00000-0000' },
  saveProfileButton: { role: 'button', name: /^Salvar Alterações|Salvando/ },
  currentPasswordInput: { placeholder: '••••••••' },
  newPasswordInput: { placeholder: /Mínimo \d+ caracteres/ },
  confirmPasswordInput: { placeholder: 'Repita a nova senha' },
  updatePasswordButton: { role: 'button', name: /Atualizar Senha|Atualizando/ },
  message: (text: string | RegExp) => ({ text }),
} satisfies LocatorMap;
