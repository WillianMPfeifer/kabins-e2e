import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { cucumberReporter, defineBddConfig } from 'playwright-bdd';
import { env } from './src/support/core/env';

/**
 * Gera os specs do Playwright a partir dos .feature (pasta `.features-gen`,
 * nunca versionada). Os steps são descobertos em `src/steps` e o `test`
 * estendido (fixtures de Page Objects, massa de dados e sessão) vem de
 * `src/support/fixtures`.
 */
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['src/steps/**/*.steps.ts', 'src/support/fixtures/index.ts'],
  featuresRoot: 'features',
  language: 'pt',
  missingSteps: 'fail-on-gen',
  examplesTitleFormat: '<_index_> — <_name_>',
});

const reporters: ReporterDescription[] = [
  [env.ci ? 'github' : 'list'],
  ['html', { outputFolder: 'reports/playwright', open: 'never' }],
  ['junit', { outputFile: 'reports/junit/results.xml' }],
  cucumberReporter('html', { outputFile: 'reports/cucumber/cucumber-report.html' }),
  cucumberReporter('json', { outputFile: 'reports/cucumber/cucumber-report.json' }),
];

export default defineConfig({
  testDir,
  outputDir: 'reports/artifacts',
  globalSetup: './src/support/hooks/global-setup.ts',
  fullyParallel: true,
  forbidOnly: env.ci,
  retries: env.ci ? 2 : 0,
  workers: env.workers,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: reporters,
  use: {
    baseURL: env.baseUrl,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: env.browserChannel },
    },
    {
      name: 'mobile-chrome',
      grep: /@mobile/,
      use: { ...devices['Pixel 7'], channel: env.browserChannel },
    },
    ...(env.allBrowsers
      ? [
          { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ]
      : []),
  ],
});
