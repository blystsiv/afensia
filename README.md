# Afensia Business Security Console

Frontend-only prototype for the Afensia business admin portal.

This project represents a business security console for company admins. It is designed for client review, internal product discussions, and developer handoff.

## Product scope

The web console is for business admins only.

Employees do not use the web portal.
Employees join through invite link or deep link and use the mobile app.

The prototype covers:

- sign in
- create business account
- forgot password
- onboarding
- overview dashboard
- employee management
- modules and pricing
- analytics
- company profile
- settings

## Current UX model

### Authentication

- email and password only
- no backend integration
- forgot-password flow is mocked on the frontend

### Onboarding

The onboarding flow is structured as:

1. Welcome
2. Modules & pricing
3. Payment preview
4. Company details
5. Invite employees
6. Preferences
7. Finish

Notes:

- theme selection previews during onboarding
- language selection is available in onboarding and settings
- Arabic switches the layout direction automatically
- Stripe checkout is a frontend preview only

### Pricing model

The prototype uses a simplified usage-credit model:

- monthly workspace fee
- credit-based usage pricing
- optional add-on modules
- payment mode options
- mock Stripe billing setup

This is presentation logic only. No real billing or Stripe API calls are implemented.

## Tech stack

- React
- TypeScript
- Vite
- React Router
- TanStack Table
- Lucide React

## Project structure

```text
src/
  components/
    charts.tsx
    dataTable.tsx
    layout.tsx
    stripePreviewModal.tsx
    ui.tsx
  context/
    PrototypeContext.tsx
  data/
    mockData.ts
  lib/
    format.ts
    i18n.ts
    useSimulatedLoading.ts
  pages/
    AuthPages.tsx
    CompanyPage.tsx
    EmployeesPage.tsx
    ModulesPage.tsx
    OnboardingPage.tsx
    OverviewPage.tsx
    SettingsPage.tsx
    UsageAnalyticsPage.tsx
```

## Localization

Prototype language support includes:

- English
- French
- Hindi
- Arabic
- Dutch
- Spanish
- German
- Italian
- Indonesian

Implementation notes:

- localization keys are stored in `src/lib/i18n.ts`
- English is the fallback language
- Arabic uses RTL automatically through document direction updates

## Theme support

- light mode is the primary design target
- dark mode is supported structurally
- onboarding previews the selected theme before setup is finished

## Mock data

Key sample data:

- company: NorthHill Beverage Group
- employees: 12
- active employees: 9
- pending invites: 3
- checks this month: 1,248
- risky findings: 37
- total balance: $2,430
- remaining balance: $1,120

Mock data lives in `src/data/mockData.ts`.

## Run locally

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Build production bundle:

```bash
npm run build
```

## Important constraints

- no backend
- no real authentication
- no real Stripe checkout
- no database
- no employee-facing web experience
- all business logic is mocked in local state

## Developer handoff notes

If this moves into production implementation, the next likely integration points are:

1. real auth and password reset
2. persisted onboarding state
3. billing and Stripe integration
4. real i18n extraction and translation files
5. analytics API integration
6. employee invite backend flow
