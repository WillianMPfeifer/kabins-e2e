import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const cabinEditorRoutes = {
  create: '/painel/cabanas/nova',
  edit: (cabinId: string) => `/painel/cabanas/${cabinId}/editar`,
} satisfies RouteMap;

/** Formulários "Cadastrar Nova Cabana" e "Editar Chalé" do painel. */
export const cabinEditorLocators = {
  createHeading: { role: 'heading', level: 1, name: 'Cadastrar Nova Cabana' },
  editHeading: { role: 'heading', level: 1, name: /^Editar Chalé/ },
  nameInput: { label: 'Nome da Cabana / Chalé *' },
  cepInput: { label: /^CEP/ },
  priceInput: { label: 'Diária Base Padrão (R$) *' },
  mapsLinkInput: { label: /Link do Google Maps/ },
  extractAddressButton: { role: 'button', name: /Extrair Endereço|Extraindo/ },
  publishButton: { role: 'button', name: /Publicar e Cadastrar Chalé|Publicando|Cadastrando/ },
  saveButton: { role: 'button', name: /Salvar Alterações do Chalé|Salvando/ },
  savedMessage: { text: /salv[ao]s? com sucesso|atualizad[oa] com sucesso/i },
} satisfies LocatorMap;
