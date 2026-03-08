import { LogOut, ShieldCheck } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { usePrototype } from '../context/PrototypeContext'
import { formatCurrency, formatNumber } from '../lib/format'
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
  const { company, balance, usageTiers, themeMode, uiLanguage, toasts, dismissToast, t, supportedLanguages } = usePrototype()
  const currentUsageTier = usageTiers.find((tier) => tier.id === balance.usageTierId)
  const currentLanguage = supportedLanguages.find((language) => language.code === uiLanguage)
  const themeLabel = themeMode === 'light' ? 'Light' : 'Dark'
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
              <span>{t('usageTier')}</span>
              <strong>{currentUsageTier?.name}</strong>
            </div>
            <div className="sidebar-company-stats">
              <div>
                <span>{t('remainingBalance')}</span>
                <strong>{formatCurrency(balance.remainingBalance, balance.currency)}</strong>
              </div>
              <div>
                <span>{t('creditsUsed')}</span>
                <strong>{formatNumber(balance.usedCredits)}</strong>
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
            <span>{themeLabel}</span>
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
