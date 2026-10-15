import { createBdd, test as base } from 'playwright-bdd';
import { ApiClient } from '../api/api-client';
import { AuthAdapter } from '../api/adapters/auth.adapter';
import type { AuthResponse } from '../api/api.types';
import { env } from '../core/env';
import { ScenarioContext } from '../core/scenario-context';
import { TestDataFactory } from '../data/test-data.factory';
import type { Persona } from '../data/test-data.types';
import { AdminDashboardPage } from '../modules/admin/admin-dashboard.page';
import { LoginModalComponent } from '../modules/auth/login-modal.page';
import { LoginPage } from '../modules/auth/login.page';
import { ProfilePage } from '../modules/auth/profile.page';
import { SignupPage } from '../modules/auth/signup.page';
import { BookingFlow } from '../modules/bookings/booking.flow';
import { BookingReceiptPage } from '../modules/bookings/booking-receipt.page';
import { BookingRequestPage } from '../modules/bookings/booking-request.page';
import { MyBookingsPage } from '../modules/bookings/my-bookings.page';
import { CabinDetailPage } from '../modules/cabins/cabin-detail.page';
import { GuideEditorPage } from '../modules/guide/guide-editor.page';
import { GuidePage } from '../modules/guide/guide.page';
import { BookingApprovalPage } from '../modules/host/booking-approval.page';
import { CabinEditorPage } from '../modules/host/cabin-editor.page';
import { HostCalendarPage } from '../modules/host/host-calendar.page';
import { HostReviewsPage } from '../modules/host/host-reviews.page';
import { ReceivedBookingsPage } from '../modules/host/received-bookings.page';
import { ReviewFormPage } from '../modules/reviews/review-form.page';
import { CanaryProbe } from '../modules/security/canary.probe';
import { PublicApiProbe } from '../modules/security/public-api.probe';
import { HeaderComponent } from '../modules/shell/header.page';
import { NavigationPage } from '../modules/shell/navigation.page';
import { PageQualityPage, type RuntimeErrorLog } from '../modules/shell/page-quality.page';
import { clearSession, injectSession } from '../session/browser-session';
import type { ScenarioState } from './scenario-state.types';

/** Sessão do navegador do cenário. */
export interface BrowserSession {
  /** Autentica o navegador como a persona (sem passar pela tela de login). */
  signInAs(persona: Persona): Promise<void>;
  signOut(): Promise<void>;
}

/** Um segundo navegador (outro dispositivo da mesma pessoa, por exemplo). */
export interface OtherDevice {
  session: BrowserSession;
  myBookingsPage: MyBookingsPage;
  loginPage: LoginPage;
}

interface WorkerFixtures {
  api: ApiClient;
  /** Sessão do admin do seed, obtida uma vez por worker e reutilizada. */
  adminSession: () => Promise<AuthResponse>;
}

interface TestFixtures {
  ctx: ScenarioContext<ScenarioState>;
  data: TestDataFactory;
  session: BrowserSession;
  otherDevice: OtherDevice;
  /** Erros de console e exceções da página principal, coletados desde o início do cenário. */
  runtimeErrors: RuntimeErrorLog;
  // Sondas sem navegador
  publicApi: PublicApiProbe;
  canary: CanaryProbe;
  // Page Objects e Flows
  loginModal: LoginModalComponent;
  loginPage: LoginPage;
  signupPage: SignupPage;
  profilePage: ProfilePage;
  header: HeaderComponent;
  navigation: NavigationPage;
  qualityPage: PageQualityPage;
  cabinPage: CabinDetailPage;
  bookingRequestPage: BookingRequestPage;
  bookingReceiptPage: BookingReceiptPage;
  myBookingsPage: MyBookingsPage;
  bookingFlow: BookingFlow;
  approvalPage: BookingApprovalPage;
  receivedBookingsPage: ReceivedBookingsPage;
  hostCalendarPage: HostCalendarPage;
  hostReviewsPage: HostReviewsPage;
  cabinEditorPage: CabinEditorPage;
  guidePage: GuidePage;
  guideEditorPage: GuideEditorPage;
  reviewFormPage: ReviewFormPage;
  adminPage: AdminDashboardPage;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // ─── worker ────────────────────────────────────────────────────────────────
  api: [
    async ({}, use) => {
      const client = await ApiClient.create();
      await use(client);
      await client.dispose();
    },
    { scope: 'worker' },
  ],

  adminSession: [
    async ({ api }, use) => {
      let cached: Promise<AuthResponse> | undefined;
      const auth = new AuthAdapter(api);
      await use(() => (cached ??= auth.loginAdmin(env.admin.email, env.admin.password)));
    },
    { scope: 'worker' },
  ],

  // ─── cenário ───────────────────────────────────────────────────────────────
  ctx: async ({}, use) => {
    await use(new ScenarioContext<ScenarioState>());
  },

  data: async ({ api, adminSession }, use) => {
    await use(new TestDataFactory(api, adminSession));
  },

  session: async ({ context }, use) => {
    await use({
      signInAs: (persona) => injectSession(context, persona.auth),
      signOut: () => clearSession(context),
    });
  },

  otherDevice: async ({ browser }, use) => {
    const context = await browser.newContext({
      baseURL: env.baseUrl,
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
    });
    const page = await context.newPage();
    await use({
      session: {
        signInAs: (persona) => injectSession(context, persona.auth),
        signOut: () => clearSession(context),
      },
      myBookingsPage: new MyBookingsPage(page),
      loginPage: new LoginPage(page),
    });
    await context.close();
  },

  runtimeErrors: async ({ page }, use) => {
    const errors: RuntimeErrorLog = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(`console: ${message.text()}`);
    });
    await use(errors);
  },

  publicApi: async ({ playwright }, use) => {
    // Contexto próprio, sem cookies nem token: o que um visitante anônimo enxerga.
    const anonymous = await playwright.request.newContext({ baseURL: `${env.apiUrl}/` });
    await use(new PublicApiProbe(anonymous));
    await anonymous.dispose();
  },

  canary: async ({}, use) => {
    const canary = new CanaryProbe();
    await canary.start();
    await use(canary);
    await canary.stop();
  },

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  loginModal: async ({ page }, use) => use(new LoginModalComponent(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  profilePage: async ({ page }, use) => use(new ProfilePage(page)),
  header: async ({ page }, use) => use(new HeaderComponent(page)),
  navigation: async ({ page }, use) => use(new NavigationPage(page)),
  qualityPage: async ({ page, runtimeErrors }, use) => use(new PageQualityPage(page, runtimeErrors)),
  cabinPage: async ({ page }, use) => use(new CabinDetailPage(page)),
  bookingRequestPage: async ({ page }, use) => use(new BookingRequestPage(page)),
  bookingReceiptPage: async ({ page }, use) => use(new BookingReceiptPage(page)),
  myBookingsPage: async ({ page }, use) => use(new MyBookingsPage(page)),
  bookingFlow: async ({ bookingRequestPage, bookingReceiptPage }, use) =>
    use(new BookingFlow(bookingRequestPage, bookingReceiptPage)),
  approvalPage: async ({ page }, use) => use(new BookingApprovalPage(page)),
  receivedBookingsPage: async ({ page }, use) => use(new ReceivedBookingsPage(page)),
  hostCalendarPage: async ({ page }, use) => use(new HostCalendarPage(page)),
  hostReviewsPage: async ({ page }, use) => use(new HostReviewsPage(page)),
  cabinEditorPage: async ({ page }, use) => use(new CabinEditorPage(page)),
  guidePage: async ({ page }, use) => use(new GuidePage(page)),
  guideEditorPage: async ({ page }, use) => use(new GuideEditorPage(page)),
  reviewFormPage: async ({ page }, use) => use(new ReviewFormPage(page)),
  adminPage: async ({ page }, use) => use(new AdminDashboardPage(page)),
});

export const { Given, When, Then, Before, After } = createBdd(test);
