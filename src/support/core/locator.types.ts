/**
 * Contrato dos arquivos `*.locators.ts`.
 *
 * Um locator é **dado puro**: descreve *como* encontrar o elemento, nunca
 * executa nada. Quem transforma a descrição em `Locator` do Playwright é o
 * `resolveLocator` (core). Isso mantém os locators:
 *  - independentes do framework (trocar Playwright não reescreve os mapas);
 *  - revisáveis num relance (a estratégia de seleção fica explícita);
 *  - proibidos de carregar estado ou lógica.
 *
 * Ordem de preferência das estratégias (a mesma do Testing Library):
 *   role > label > placeholder > text > testId > css
 * `css` é a saída de emergência e o check de arquitetura acusa o uso.
 */

/** Subconjunto de papéis ARIA usados pelo app. Amplie conforme a necessidade. */
export type AriaRole =
  | 'alert'
  | 'article'
  | 'banner'
  | 'button'
  | 'checkbox'
  | 'combobox'
  | 'dialog'
  | 'heading'
  | 'link'
  | 'listitem'
  | 'main'
  | 'navigation'
  | 'option'
  | 'region'
  | 'status'
  | 'tab'
  | 'textbox';

type TextMatch = string | RegExp;

interface Base {
  /** Usa match exato de texto (padrão: false, igual ao Playwright). */
  exact?: boolean;
  /** Restringe a busca ao primeiro elemento que casar com este outro locator. */
  within?: LocatorDef;
  /** Mantém só os elementos que contêm este texto (ex.: o card de uma reserva específica). */
  hasText?: TextMatch;
  /** Seleciona a n-ésima ocorrência (0 = primeira, -1 = última). */
  nth?: number;
}

export type LocatorDef =
  | (Base & { role: AriaRole; name?: TextMatch; level?: number })
  | (Base & { label: TextMatch })
  | (Base & { placeholder: TextMatch })
  | (Base & { text: TextMatch })
  | (Base & { testId: string })
  | (Base & { css: string });

/** Mapa de locators de uma tela. Valores podem ser fábricas puras para elementos dinâmicos. */
export type LocatorMap = Record<string, LocatorDef | ((...args: never[]) => LocatorDef)>;

/** Rotas de uma tela: estáticas ou construídas a partir de parâmetros. */
export type RouteMap = Record<string, string | ((...args: never[]) => string)>;
