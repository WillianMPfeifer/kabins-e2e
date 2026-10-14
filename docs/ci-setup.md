# Integração Contínua (CI)

Workflow: [`.github/workflows/e2e.yml`](../.github/workflows/e2e.yml).

---

## 1. Gatilhos

| Evento                                    | O que roda                                                    |
| ----------------------------------------- | ------------------------------------------------------------- |
| `push` / `pull_request` em `main`         | Quality gate + `@smoke` contra staging (se configurado)       |
| `schedule` (03:00 BRT)                    | Regressão completa                                            |
| `workflow_dispatch`                       | Manual — escolhe tags e, opcionalmente, URLs                  |
| `repository_dispatch` (`deploy-finished`) | Disparado pelo deploy do web/api                              |
| `workflow_call`                           | Reutilizável pelos repositórios `cabanas-web` e `cabanas-api` |

## 2. Quality gate

Node da `.nvmrc`, `npm ci` e `npm run quality`:
formatação (Prettier) → lint com regras de camada (ESLint) → tipos (tsc) →
check de arquitetura → geração BDD (falha se algum step não tiver definição).

Não precisa de ambiente; roda em todo PR em ~1 minuto.

## 3. Execução E2E

A suíte roda contra um ambiente **já publicado**. Configure no repositório:

| Tipo     | Nome                 | Exemplo                                    |
| -------- | -------------------- | ------------------------------------------ |
| Variable | `E2E_BASE_URL`       | `https://staging.kabins.com.br`            |
| Variable | `E2E_API_URL`        | `https://api-staging.kabins.com.br/api/v1` |
| Secret   | `E2E_ADMIN_EMAIL`    | admin dedicado à automação                 |
| Secret   | `E2E_ADMIN_PASSWORD` | —                                          |

Sem as variáveis, a etapa E2E é ignorada com um aviso (o quality gate continua obrigatório).

O ambiente-alvo precisa de **rate limit folgado** para o IP do runner (ver README) —
idealmente um ambiente de staging dedicado, com banco descartável.

Execução em 2 shards paralelos, retries = 2 no CI, Chromium com cache dos navegadores.

## 4. Disparando a partir dos outros repositórios

**Após o deploy** (no workflow de deploy do `cabanas-web` ou `cabanas-api`):

```yaml
- name: Disparar E2E
  uses: peter-evans/repository-dispatch@v3
  with:
    token: ${{ secrets.E2E_DISPATCH_TOKEN }} # PAT com acesso ao repo cabanas-e2e
    repository: WillianMPfeifer/cabanas-e2e
    event-type: deploy-finished
    client-payload: >-
      {"base_url": "https://staging.kabins.com.br",
       "api_url": "https://api-staging.kabins.com.br/api/v1",
       "grep": "@smoke"}
```

**Como job reutilizável** (bloqueando o pipeline do chamador):

```yaml
jobs:
  e2e:
    uses: WillianMPfeifer/cabanas-e2e/.github/workflows/e2e.yml@main
    with:
      base_url: https://staging.kabins.com.br
      api_url: https://api-staging.kabins.com.br/api/v1
      grep: '@critical'
    secrets:
      E2E_ADMIN_EMAIL: ${{ secrets.E2E_ADMIN_EMAIL }}
      E2E_ADMIN_PASSWORD: ${{ secrets.E2E_ADMIN_PASSWORD }}
```

## 5. Relatórios e artefatos

Cada shard publica `reports/` como artefato (14 dias):

- `reports/playwright/index.html` — relatório HTML com trace, vídeo e screenshot das falhas
- `reports/cucumber/cucumber-report.html` / `.json` — visão por Funcionalidade/Cenário/Passo
- `reports/junit/results.xml`
- `reports/artifacts/**` — traces (`npx playwright show-trace <arquivo>.zip`)

Falhas também aparecem como anotações no PR (reporter `github`).
