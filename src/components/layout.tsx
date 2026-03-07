import { LogOut, ShieldCheck } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { usePrototype } from '../context/PrototypeContext'
import { formatCurrency } from '../lib/format'
import { cx } from '../lib/format'
import { Button, ToastViewport } from './ui'

export function AuthLayout() {
  return (
    <div className="auth-layout auth-layout-refined">
      <div className="auth-brand-row">
        <span className="brand-mark">
          <ShieldCheck size={16} />
        </span>
        <div>
          <strong>Afensia</strong>
          <span className="subtle-copy">Business Security Console</span>
        </div>
      </div>
      <main className="auth-main">
        <Outlet />
      </main>
    </div>
  )
}

export function DashboardLayout() {
  const navigate = useNavigate()
  const { company, modules, balance, pricingPlans, themeMode, uiLanguage, toasts, dismissToast, t, supportedLanguages } = usePrototype()
  const enabledModules = modules.filter((module) => module.enabled).length
  const currentPlan = pricingPlans.find((plan) => plan.id === balance.planId)
  const currentLanguage = supportedLanguages.find((language) => language.code === uiLanguage)
  const navigation = [
    { label: t('navOverview'), to: '/app/overview' },
    { label: t('navEmployees'), to: '/app/employees' },
    { label: t('navModules'), to: '/app/modules' },
    { label: t('navAnalytics'), to: '/app/analytics' },
    { label: t('navCompany'), to: '/app/company' },
    { label: t('navSettings'), to: '/app/settings' },
  ]

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div>
          <div className="sidebar-brand">
            <span className="brand-mark">
              <ShieldCheck size={16} />
            </span>
            <div>
              <strong>Afensia</strong>
              <span className="subtle-copy">Business Security Console</span>
            </div>
          </div>

          <div className="sidebar-company-panel sidebar-company-panel-rich">
            <div className="sidebar-company-header">
              <div>
                <div className="sidebar-company-name">{company.companyName}</div>
                <div className="subtle-copy">{company.adminEmail}</div>
              </div>
            </div>
            <div className="sidebar-plan-chip">
              <span>{t('currentPlan')}</span>
              <strong>{currentPlan?.name}</strong>
            </div>
            <div className="sidebar-company-stats">
              <div>
                <span>{t('remainingBalance')}</span>
                <strong>{formatCurrency(balance.remainingBalance, balance.currency)}</strong>
              </div>
              <div>
                <span>{t('navModules')}</span>
                <strong>{enabledModules}</strong>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav" aria-label="Primary">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => cx('sidebar-link', isActive && 'sidebar-link-active')}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-meta sidebar-meta-rich">
            <span>{currentLanguage?.nativeLabel ?? uiLanguage.toUpperCase()}</span>
            <span>{themeMode}</span>
          </div>
          <Button variant="ghost" className="logout-button" onClick={() => navigate('/signin')}>
            <LogOut size={16} />
            <span>{t('navLogout')}</span>
          </Button>
        </div>
      </aside>

      <main className="dashboard-content">
        <Outlet />
      </main>

      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
