import { LogOut, ShieldCheck } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { usePrototype } from '../context/PrototypeContext'
import { formatCurrency } from '../lib/format'
import { cx } from '../lib/format'
import { Badge, Button, ToastViewport } from './ui'

const navigation = [
  { label: 'Overview', to: '/app/overview' },
  { label: 'Employees', to: '/app/employees' },
  { label: 'Modules', to: '/app/modules' },
  { label: 'Analytics', to: '/app/analytics' },
  { label: 'Company', to: '/app/company' },
  { label: 'Settings', to: '/app/settings' },
]

export function AuthLayout() {
  return (
    <div className="auth-layout">
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
  const { company, modules, balance, themeMode, uiLanguage, toasts, dismissToast } = usePrototype()
  const enabledModules = modules.filter((module) => module.enabled).length

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

          <div className="sidebar-company-panel">
            <div className="sidebar-company-header">
              <div>
                <div className="sidebar-company-name">{company.companyName}</div>
                <div className="subtle-copy">{company.adminEmail}</div>
              </div>
              <Badge tone="success">{company.status}</Badge>
            </div>
            <div className="sidebar-company-stats">
              <div>
                <span>Remaining balance</span>
                <strong>{formatCurrency(balance.remainingBalance, balance.currency)}</strong>
              </div>
              <div>
                <span>Enabled modules</span>
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
          <div className="sidebar-meta">
            <span>{uiLanguage.toUpperCase()}</span>
            <span>{themeMode}</span>
          </div>
          <Button variant="ghost" className="logout-button" onClick={() => navigate('/signin')}>
            <LogOut size={16} />
            <span>Logout</span>
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
