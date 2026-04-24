import { ArrowLeft, Compass, MessageSquareText, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Badge, Button, Card } from '../components/ui'
import { openSupportWidget } from '../lib/support'

function NotFoundBody({
  insideApp,
  onPrimary,
  onBack,
}: {
  insideApp: boolean
  onPrimary: () => void
  onBack: () => void
}) {
  return (
    <div className="not-found-shell">
      <div className="not-found-hero">
        <div className="not-found-badge-row">
          <Badge tone="warning">404</Badge>
          <Badge tone="info">{insideApp ? 'Workspace page' : 'Public page'}</Badge>
        </div>
        <div className="not-found-icon not-found-icon-large">
          <ShieldAlert size={24} />
        </div>
        <h1>We couldn&apos;t find that page</h1>
        <p>
          The page you opened is missing, outdated, or no longer part of this flow. Your workspace is fine, and you
          can safely return to a known page from here.
        </p>
      </div>

      <div className="not-found-grid">
        <div className="not-found-panel">
          <span className="meta-label">What probably happened</span>
          <div className="not-found-list">
            <div>The link was copied from an older version of the prototype.</div>
            <div>The page path changed during the recent cleanup of the product flow.</div>
            <div>You followed a route that exists conceptually but is not available in this build.</div>
          </div>
        </div>

        <div className="not-found-panel">
          <span className="meta-label">Best next step</span>
          <div className="not-found-list">
            <div>Go back to the safest page for this area of the product.</div>
            <div>Use support chat if you want help finding the right workflow.</div>
          </div>
        </div>
      </div>

      <div className="button-row not-found-actions">
        <Button onClick={onPrimary}>
          <Compass size={16} />
          <span>{insideApp ? 'Go to overview' : 'Go to sign in'}</span>
        </Button>
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Go back</span>
        </Button>
        <Button variant="ghost" onClick={openSupportWidget}>
          <MessageSquareText size={16} />
          <span>Open support chat</span>
        </Button>
      </div>
    </div>
  )
}

export function NotFoundPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const insideApp = location.pathname.startsWith('/app')
  const body = (
    <NotFoundBody
      insideApp={insideApp}
      onPrimary={() => navigate(insideApp ? '/app/overview' : '/signin')}
      onBack={() => navigate(-1)}
    />
  )

  if (insideApp) {
    return <Card className="not-found-app-card">{body}</Card>
  }

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
        <section className="auth-card auth-card-elevated not-found-auth-card">{body}</section>
      </main>
    </div>
  )
}
