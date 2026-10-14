import type { PersonaRole } from './test-data.types';

/** Vocabulário de negócio usado nos .feature → papel técnico. */
const ROLE_BY_LABEL: Record<string, PersonaRole> = {
  hóspede: 'cliente',
  cliente: 'cliente',
  anfitrião: 'anfitriao',
  administrador: 'admin',
};

export function roleFromLabel(label: string): PersonaRole {
  const role = ROLE_BY_LABEL[label.trim().toLowerCase()];
  if (!role) {
    throw new Error(`Perfil desconhecido no .feature: "${label}". Use: ${Object.keys(ROLE_BY_LABEL).join(', ')}.`);
  }
  return role;
}
