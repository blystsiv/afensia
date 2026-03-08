import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthLayout, DashboardLayout } from './components/layout'
import { PrototypeProvider } from './context/PrototypeContext'
import { CreateAccountPage, ForgotPasswordPage, SignInPage } from './pages/AuthPages'
import { CompanyPage } from './pages/CompanyPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { ModulesPage } from './pages/ModulesPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { OverviewPage } from './pages/OverviewPage'
import { SettingsPage } from './pages/SettingsPage'
import { UsageAnalyticsPage } from './pages/UsageAnalyticsPage'

function App() {
  return (
    <PrototypeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="modules" element={<ModulesPage />} />
            <Route path="analytics" element={<UsageAnalyticsPage />} />
            <Route path="company" element={<CompanyPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </BrowserRouter>
    </PrototypeProvider>
  )
}

export default App
