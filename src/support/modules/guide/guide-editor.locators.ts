import type { LocatorMap, RouteMap } from '../../core/locator.types';

export const guideEditorRoutes = {
  forCabin: (cabinId: string) => `/painel?cabanaId=${cabinId}&aba=guia`,
} satisfies RouteMap;

/** Aba "Guia do Hóspede" do painel do anfitrião. */
export const guideEditorLocators = {
  wifiNameInput: { label: 'Nome da Rede Wi-Fi' },
  wifiPasswordInput: { label: 'Senha do Wi-Fi (Copiável pelo hóspede)' },
  lockCodeInput: { label: 'Senha Fechadura Digital' },
  saveButton: { role: 'button', name: /Salvar Informações do Guia|Salvando Informações do Guia/ },
  savedMessage: { text: /Guia salvas com sucesso/ },
  /**
   * Campo oculto que diz à Server Action qual cabana alterar. Não tem papel
   * acessível; o cenário de segurança precisa adulterá-lo como um atacante faria.
   */
  cabinIdField: { css: 'form:has(input[name="wifiRede"]) input[type="hidden"][name="cabanaId"]' },
} satisfies LocatorMap;
