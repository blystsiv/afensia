import { ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Badge, Button } from '../components/ui'

export function NotFoundPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const insideApp = location.pathname.startsWith('/app')

  return (
    <div className="auth-layout auth-layout-refined">
      <div className="auth-brand-row">
        <span className="brand-mark">
          <ShieldCheck size={16} />
        </span>
        <div className="brand-copy">
          <strong className="brand-title">Afensia</strong>
          <span className="subtle-copy brand-subtitle">Business Security Console</span>
        </div>
      </div>

      <main className="auth-main">
        <section className="auth-card auth-card-elevated not-found-card">
          <div className="auth-card-header auth-card-header-tight">
            <Badge tone="warning">404</Badge>
            <div className="not-found-icon">
              <ShieldAlert size={22} />
            </div>
            <h1>Page not found</h1>
            <p>The page you requested does not exist in this prototype.</p>
          </div>

          <div className="button-row not-found-actions">
            <Button onClick={() => navigate(insideApp ? '/app/overview' : '/signin')}>
              {insideApp ? 'Go to overview' : 'Go to sign in'}
            </Button>
            <Button variant="secondary" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} />
              <span>Go back</span>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
