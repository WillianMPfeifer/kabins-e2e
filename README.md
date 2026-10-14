# cabanas-e2e

Suíte de testes ponta a ponta do **Projeto Cabanas (Kabins)** — Playwright + BDD.

Os cenários são escritos em Gherkin (pt-BR) e exercitam o produto real: front
(`cabanas-web`, Next.js) falando com a API (`cabanas-api`, NestJS) e o banco
PostgreSQL. Nada é mockado.

|           |                                                                                               |
| --------- | --------------------------------------------------------------------------------------------- |
| Runner    | [Playwright](https://playwright.dev) 1.64                                                     |
| BDD       | [playwright-bdd](https://vitalets.github.io/playwright-bdd) 9 (Gherkin → specs do Playwright) |
| Padrões   | Page Object Model · Locators declarativos · Flows · Fixtures · Massa de dados via API         |
| Linguagem | TypeScript estrito                                                                            |

## Destaques

- **122 cenários** em 23 funcionalidades: autenticação, reservas, painel do anfitrião, guia digital,
  avaliações, administração, segurança e qualidade das páginas (inclusive a 360 px no celular).
- **22 bugs encontrados e corrigidos**, dois deles críticos: vazamento de dados pessoais do hóspede
  por uma rota pública e um rate limit que bloqueava o IP para sempre. Outros: SSRF no servidor web,
  acesso ao guia (Wi-Fi e fechadura) de cabanas alheias, valores de reserva que ignoravam a oferta
  exibida. Detalhes em [docs/cobertura-e-bugs.md](docs/cobertura-e-bugs.md).
- **Bug conhecido nunca fica verde por acidente:** cenários `@bug` descrevem o comportamento correto e
  ficam marcados `@fail` até a correção, quando viram teste de regressão.
- **Arquitetura verificada no CI:** regras de camada no ESLint e um checador próprio
  ([scripts/check-architecture.mjs](scripts/check-architecture.mjs)) garantem que Page Objects só usam
  locators declarados e que os steps não tocam o navegador direto.
- **Mesma suíte, vários ambientes:** `E2E_ENV=local` ou `production`, sem mudar código.

---

## Início rápido

Pré-requisitos: Node 24 (`.nvmrc`), e o ambiente do Cabanas de pé (API + Web + banco com seed).

```bash
npm install
npx playwright install chromium   # uma vez
cp .env.example .env              # E2E_ENV=local por padrão
npm test                          # gera os specs a partir dos .feature e executa
```

### Local × produção

O ambiente-alvo é escolhido por uma linha no `.env`:

```bash
E2E_ENV=local        # padrão — localhost:3000 (web) e localhost:3333 (api)
E2E_ENV=production   # https://kabins.com.br
```

As URLs de cada ambiente ficam em
[src/support/core/environments.ts](src/support/core/environments.ts). Produção exige
`E2E_PRODUCTION_ADMIN_EMAIL` e `E2E_PRODUCTION_ADMIN_PASSWORD` no `.env` (use um admin
dedicado à automação), roda com 1 worker e tem dados reais: a suíte cria contas,
cabanas e reservas `[E2E]`. Em produção, prefira `npm run test:smoke`.

### Ambiente local

O perfil `local` espera a `cabanas-api` em `:3333` e o `cabanas-web` em `:3000`,
com o banco migrado e o seed aplicado (o seed cria o `admin@cabanas.local`).
Veja o README de cada repositório para subir os serviços.

> **Rate limit.** A API limita login/cadastro a 5 req/min por IP em produção.
> A suíte cria contas pela API e roda em paralelo, então o ambiente de E2E precisa
> de limites mais folgados — por exemplo `THROTTLE_AUTH_LIMITE=1000`,
> `THROTTLE_LIMITE=10000`, `THROTTLE_RESERVA_LIMITE=1000`, `THROTTLE_TOKEN_LIMITE=1000`.
> O cliente HTTP repete requisições que recebem 429, mas isso não substitui a configuração.

## Comandos

| Comando                           | O que faz                                                                |
| --------------------------------- | ------------------------------------------------------------------------ |
| `npm test`                        | Suíte completa                                                           |
| `npm run test:smoke`              | Só `@smoke` — o mínimo para dizer "o produto está de pé" (~15 cenários)  |
| `npm run test:critical`           | Só `@critical` — caminho do dinheiro e da privacidade                    |
| `npm run test:module -- bookings` | Uma pasta de `features/`                                                 |
| `npm run test:headed`             | Com navegador visível, 1 worker                                          |
| `npm run test:ui`                 | Modo UI do Playwright (time-travel, watch)                               |
| `npm run report`                  | Abre o relatório HTML da última execução                                 |
| `npm run steps:list`              | Lista todos os steps disponíveis (útil ao escrever features)             |
| `npm run quality`                 | Formatação + lint + tipos + arquitetura + geração BDD (o que o CI exige) |

Filtros arbitrários funcionam como no Playwright: `npx bddgen && npx playwright test --grep "@reservas and @regression"`.

## Estrutura

```text
features/<módulo>/*.feature          Comportamento em linguagem de negócio (Gherkin pt-BR)
src/
├── steps/<módulo>/*.steps.ts        Cola fina: frase do Gherkin → Page Object / Flow / massa
└── support/
    ├── core/                        Técnico e reutilizável (env, resolvedor de locators, BasePage, datas, CPF…)
    ├── api/                         Cliente HTTP + adapters por domínio (*.adapter.ts)
    ├── data/                        TestDataFactory: cria contas, cabanas e reservas pela API
    ├── session/                     Injeção da sessão no navegador (login sem UI)
    ├── fixtures/                    test.extend: Page Objects, massa, sessão e ScenarioContext
    ├── hooks/                       global-setup (health check do ambiente)
    └── modules/<módulo>/            *.locators.ts · *.page.ts · *.flow.ts
scripts/                             check-architecture.mjs · run-module.mjs
docs/                                Padrões, CI, cobertura e bugs encontrados
```

O fluxo de dependência é sempre de cima para baixo:

```text
Feature → Step → Flow (opcional) → Page Object → Locators
                  └──────────── fixtures (data / session / ctx)
```

As regras de cada camada estão em [docs/architecture-standards.md](docs/architecture-standards.md)
e são **verificadas automaticamente** (ESLint + `scripts/check-architecture.mjs`).

## Decisões que valem saber

- **Cada cenário cria a própria massa pela API.** Contas, cabanas e reservas são
  novas a cada execução — por isso os cenários rodam em paralelo, em qualquer
  ordem, contra um banco com dados de execuções anteriores. Toda massa leva o
  prefixo `[E2E]` e e-mails `@e2e.kabins.test`.
- **Login pela UI só onde o login é o assunto.** Nos demais cenários a sessão é
  emitida pela API e injetada como cookies (`src/support/session/browser-session.ts`),
  exatamente como a Server Action de login faz. É mais rápido, mais estável e não
  consome o rate limit.
- **Locators são dados, não código.** Um `*.locators.ts` descreve _como_
  encontrar o elemento (`{ role: 'button', name: 'Confirmar Reserva' }`); só o
  `resolveLocator` (core) conhece a API do Playwright. Preferência:
  role › label › placeholder › text › testId › css.
- **Bugs conhecidos ficam no código, não num post-it.** Cenário que documenta um
  defeito leva `@bug @fail`: ele passa enquanto o bug existir e **quebra quando o
  bug for corrigido**, avisando para remover a tag. Ver [docs/cobertura-e-bugs.md](docs/cobertura-e-bugs.md).

## Tags

| Tag                                                       | Uso                                                             |
| --------------------------------------------------------- | --------------------------------------------------------------- |
| `@smoke`                                                  | Verificação rápida pós-deploy                                   |
| `@critical`                                               | Dinheiro, privacidade, autorização — bloqueia release           |
| `@regression`                                             | Regressão completa (noturno)                                    |
| `@security`                                               | Autorização, isolamento entre contas, vazamento de dados        |
| `@mobile`                                                 | Também roda no projeto `mobile-chrome` (Pixel 7)                |
| `@bug` + `@fail`                                          | Defeito conhecido; cenário descreve o comportamento **correto** |
| `@fixme` / `@skip`                                        | Desligado temporariamente (exige justificativa no comentário)   |
| `@auth`, `@reservas`, `@anfitriao`, `@admin`, `@cabanas`… | Módulo                                                          |

## Relatórios

Gerados em `reports/` a cada execução:

- `reports/playwright/` — relatório HTML do Playwright (trace, vídeo e screenshot das falhas)
- `reports/cucumber/cucumber-report.html` e `.json` — visão por Funcionalidade/Cenário/Passo
- `reports/junit/results.xml` — para integrações de CI

## Variáveis de ambiente

Ver [.env.example](.env.example). Resumo: `E2E_ENV` (`local` | `production`),
`E2E_PRODUCTION_ADMIN_EMAIL`, `E2E_PRODUCTION_ADMIN_PASSWORD`, sobrescritas
(`E2E_BASE_URL`, `E2E_API_URL`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`), `E2E_WORKERS`, `E2E_ALL_BROWSERS`,
`E2E_BROWSER_CHANNEL` (ex.: `msedge`, quando políticas da máquina bloqueiam o
Chromium baixado pelo Playwright).

## Documentação

- [Padrões de arquitetura e responsabilidades](docs/architecture-standards.md)
- [Como escrever um novo cenário](docs/writing-scenarios.md)
- [CI/CD](docs/ci-setup.md)
- [Cobertura e bugs encontrados](docs/cobertura-e-bugs.md)
- [Backlog de cenários e bugs prováveis](docs/backlog-de-cenarios.md)
