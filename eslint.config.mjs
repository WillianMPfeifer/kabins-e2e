// @ts-check
import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * As regras de camada (o que cada tipo de arquivo pode fazer) vivem aqui como
 * `no-restricted-syntax` / `no-restricted-imports`, para o erro aparecer no
 * editor. O `scripts/check-architecture.mjs` cobre o que o ESLint não alcança
 * (nomes de arquivo, dependências entre pastas).
 */
export default tseslint.config(
  { ignores: ['node_modules', '.features-gen', 'reports', 'playwright-report', 'test-results'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['src/support/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-networkidle': 'off',
      'playwright/no-standalone-expect': 'off',
      'playwright/no-raw-locators': 'off',
    },
  },
  // ── Steps: cola fina. Sem Playwright cru, sem asserções, sem locators. ──────
  {
    files: ['src/steps/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              message: 'Steps não usam Playwright diretamente — delegue para um Page Object ou Flow.',
            },
          ],
          patterns: [
            {
              group: ['**/*.locators', '**/*.locators.ts'],
              message: 'Steps não importam locators — use o Page Object.',
            },
            {
              group: ['**/api/**'],
              message: 'Steps não chamam a API diretamente — use a fixture `data` (TestDataFactory).',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='page']",
          message: 'Steps não acessam `page` — delegue para um Page Object.',
        },
        {
          selector: "CallExpression[callee.name='expect']",
          message: 'Steps não fazem asserções — use um método expect* do Page Object.',
        },
      ],
    },
  },
  // ── Locators: dado puro. ────────────────────────────────────────────────────
  {
    files: ['src/support/modules/**/*.locators.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@playwright/*', '**/*.page', '**/*.flow', '**/base.page'],
              message: 'Locators são dados puros — não importam framework nem Page Objects.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        { selector: 'AwaitExpression', message: 'Locators não executam nada.' },
        { selector: 'ClassDeclaration', message: 'Locators não têm estado nem classes.' },
      ],
    },
  },
  // ── Core: técnico e reutilizável. Não conhece módulos de negócio. ───────────
  {
    files: ['src/support/core/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/modules/**', '**/data/**', '**/fixtures/**'],
              message: 'O core não depende de módulos de negócio.',
            },
          ],
        },
      ],
    },
  },
);
