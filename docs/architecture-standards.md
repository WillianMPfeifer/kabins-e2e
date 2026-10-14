# Padrões de Arquitetura e Responsabilidades das Camadas

Contratos estruturais da suíte E2E. Tudo que está marcado como **Proibido** é
verificado automaticamente — por ESLint (`eslint.config.mjs`) e por
`scripts/check-architecture.mjs`, ambos no `npm run quality` e no CI.

---

## 1. O fluxo principal

```text
Feature (.feature)
       │
       ▼
Step Definition (.steps.ts)  ───────────►  Fixtures: data · session · ctx
       │
       ▼
Flow (.flow.ts)              [opcional, jornadas que cruzam telas]
       │
       ▼
Page Object (.page.ts)
       │
       ▼
Locators (.locators.ts)      ──►  core/locator-resolver  ──►  Playwright
```

### Responsabilidade de cada camada

1. **Features (`features/<módulo>/*.feature`)**
   - Gherkin em pt-BR (`# language: pt` na primeira linha).
   - Descrevem comportamento de negócio do ponto de vista de quem usa o produto.
   - Independentes da implementação: nada de seletor, URL técnica de API ou nome de enum
     (`"cancelada"`, não `"CANCELADA"`).
   - Toda `Funcionalidade` tem tag de módulo; cenários têm tag de prioridade
     (`@smoke`, `@critical`, `@regression`).
   - `Regra:` agrupa cenários pela regra de negócio que eles protegem.

2. **Step Definitions (`src/steps/<módulo>/*.steps.ts`)**
   - Cola fina entre a frase do Gherkin e Page Objects/Flows/fixtures.
   - **Proibido:** importar `@playwright/test`, acessar `page`, chamar `expect`,
     importar `*.locators` ou a camada `api/`.
   - Passam dados entre si apenas pelo `ctx` (`ScenarioContext`), nunca por variável de módulo.

3. **Flows (`src/support/modules/<módulo>/*.flow.ts`)**
   - Orquestram vários Page Objects numa jornada (ex.: escolher datas → enviar → ler comprovante).
   - Não conhecem locators.

4. **Page Objects (`src/support/modules/<módulo>/*.page.ts`)**
   - Encapsulam interações, navegação e asserções de uma tela (`expect*`).
   - Estendem `BasePage` (core).
   - Consomem seletores **exclusivamente** do `*.locators.ts` do módulo.
   - **Proibido:** criar seletor inline (`this.page.getBy…`, `this.page.locator(…)`).
   - Ações com efeito no servidor (Server Actions) esperam a tela se estabilizar antes de
     retornar — o step seguinte nunca deve navegar no meio de uma ação.

5. **Probes (`src/support/modules/<módulo>/*.probe.ts`)**
   - Checagens sem navegador, com asserções `expect*`: o que um visitante anônimo lê da API
     (`PublicApiProbe`) ou se o servidor fez uma requisição que não devia (`CanaryProbe`).
   - Usam um `APIRequestContext` próprio, sem cookies nem token, entregue pela fixture.
   - Rotas ficam num `*.locators.ts` do módulo, como nos Page Objects.
   - **Proibido:** usar `this.page`. Se precisa do navegador, é um Page Object.

6. **Locators (`src/support/modules/<módulo>/*.locators.ts`)**
   - Dados puros: rotas e descrições de seleção (`LocatorDef`).
   - Elementos dinâmicos são **fábricas puras** (`dayCell(12, 'Outubro')`).
   - Ordem de preferência: `role` › `label` › `placeholder` › `text` › `testId` › `css`.
     `css` gera aviso no check de arquitetura.
   - **Proibido:** importar Playwright/Page Objects, `await`, classes ou estado.

7. **Shared Core (`src/support/core/`)**
   - Facilidades técnicas reutilizáveis: `env`, `ScenarioContext`, `createUniqueId`,
     `resolveLocator`, `BasePage`, datas e documentos.
   - **Proibido:** importar `modules/`, `data/` ou `fixtures/`.

8. **API e massa de dados (`src/support/api/`, `src/support/data/`)**
   - `ApiClient` + `*.adapter.ts` por domínio da cabanas-api.
   - `TestDataFactory` é a única porta de entrada para criar massa; steps a usam pela fixture `data`.
   - Massa é sempre criada pela API, nunca pela UI (a UI é o que está sob teste).
   - **Exceção documentada:** o guia digital é gravado pela web direto no banco, sem endpoint na
     API. Os cenários do guia o configuram pelo editor do painel (`GuideEditorPage`), num `Dado`.

---

## 2. Convenções de nomes

Arquivos em `src/support/modules/` usam **kebab-case** e um dos sufixos aprovados:

- `*.locators.ts`
- `*.page.ts`
- `*.probe.ts`
- `*.flow.ts`
- `*.adapter.ts`
- `*.types.ts`

Demais convenções:

| Onde                  | Padrão                                                                      |
| --------------------- | --------------------------------------------------------------------------- |
| `features/<módulo>/`  | `kebab-case.feature`, um nível de pasta                                     |
| `src/steps/<módulo>/` | `kebab-case.steps.ts`, um nível de pasta                                    |
| Classes               | `PascalCase` + sufixo do papel (`LoginPage`, `BookingFlow`, `AuthAdapter`)  |
| Mapas de locators     | `<tela>Locators` e `<tela>Routes`                                           |
| Métodos de asserção   | `expect<Algo>()` — leitura direta no step: `loginPage.expectStillOnLogin()` |

---

## 3. Dados e isolamento

- Cada cenário cria as próprias pessoas, cabanas e reservas (`TestDataFactory`).
- Identificadores únicos via `createUniqueId()`; e-mails em `@${E2E_EMAIL_DOMAIN}`; nomes com prefixo `[E2E]`.
- O admin do seed é o único dado pré-existente exigido; sua sessão é obtida uma vez por worker.
- Datas são relativas a "hoje" em `America/Sao_Paulo` (`daysFromToday`) e calculadas em UTC
  para não reintroduzir bugs de fuso.

## 4. Sessão

- Login pela UI apenas em `features/auth`.
- Nos demais cenários: `session.signInAs(persona)` injeta os mesmos cookies que a Server Action
  de login grava (`cb_at`, `cb_rt`, `cb_conta`, `better-auth.session_token`).
- Mudança de nome/formato desses cookies no web exige ajuste em um único arquivo:
  `src/support/session/browser-session.ts`.

## 5. Bugs conhecidos

- Cenário que reproduz defeito: `@bug @fail` + comentário com o identificador (`BUG-E2E-00X`),
  o arquivo afetado e a causa.
- O cenário descreve o comportamento **correto**; `@fail` inverte o resultado enquanto o bug existir.
- `@bug` sem `@fail`/`@fixme`, ou `@only` versionado, quebram o check de arquitetura.
