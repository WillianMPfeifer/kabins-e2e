import type { LocatorMap } from '../../core/locator.types';
import { escapeRegExp } from '../../core/text';

/** Cabeçalho global (Navigation + UserAccountMenu), presente em todas as telas. */
export const headerLocators = {
  root: { role: 'banner' },
  loginLink: { role: 'link', name: 'Entrar', exact: true, within: { role: 'banner' } },
  /** O gatilho do menu não tem aria-label: o nome acessível é o texto (papel + iniciais + primeiro nome). */
  accountMenuTrigger: (firstName: string) => ({
    role: 'button',
    name: new RegExp(escapeRegExp(firstName)),
    within: { role: 'banner' },
  }),
  logoutButton: { role: 'button', name: /Sair da Conta|Saindo/ },
  profileLink: { role: 'link', name: /Gerenciar Perfil/ },
  switchRoleButton: { role: 'button', name: /Alternar p\/ (Anfitrião|Hóspede)/ },
  roleBadge: (label: 'Administrador' | 'Anfitrião' | 'Hóspede') => ({ text: label, exact: true }),
} satisfies LocatorMap;
