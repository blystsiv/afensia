import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Button, Card, PageHeader, SkeletonBlock, StatCard } from '../components/ui'
import { UsageTrendChart } from '../components/charts'
import { usePrototype } from '../context/PrototypeContext'
import { formatCurrency, formatNumber } from '../lib/format'
import { useSimulatedLoading } from '../lib/useSimulatedLoading'

interface OverviewLocationState {
  onboardingComplete?: boolean
  invitedCount?: number
}

function OverviewSkeleton() {
  return (
    <div className="page-stack">
      <div className="stats-grid overview-stats-grid seven-up">
        {Array.from({ length: 7 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={3} />
          </Card>
        ))}
      </div>
      <Card>
        <SkeletonBlock lines={7} />
      </Card>
      <div className="overview-summary-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={5} />
          </Card>
        ))}
      </div>
    </div>
  )
}

export function OverviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    company,
    employees,
    modules,
    balance,
    analyticsSnapshots,
    dashboardPreferences,
    t,
  } = usePrototype()
  const onboardingState = location.state as OverviewLocationState | null
  const [showLaunchBanner, setShowLaunchBanner] = useState(Boolean(onboardingState?.onboardingComplete))
  const loading = useSimulatedLoading('overview-console', 260)
  const snapshot = analyticsSnapshots['30d']
  const enabledModules = modules.filter((module) => module.enabled)
  const activeEmployees = employees.filter((employee) => employee.status === 'Active')
  const topEmployees = [...activeEmployees].sort((a, b) => b.totalChecks - a.totalChecks).slice(0, 4)
  const topModules = [...enabledModules].sort((a, b) => b.usageCount - a.usageCount).slice(0, 4)
  const invitedCount = onboardingState?.invitedCount ?? 0

  if (loading) {
    return <OverviewSkeleton />
  }

  const sideBlocks = [
    dashboardPreferences.showModuleBreakdown ? (
      <Card key="modules" title={t('featureUsageBreakdown')} subtitle="Top modules this month">
        <div className="summary-list compact-summary-list">
          {topModules.map((module) => (
            <div key={module.id} className="summary-row compact-row">
              <div>
                <div className="row-title">{module.name}</div>
                <div className="row-meta">{module.usageLabel}</div>
              </div>
              <div className="row-value">{formatNumber(module.usageCount)}</div>
            </div>
          ))}
        </div>
      </Card>
    ) : null,
    dashboardPreferences.showEmployeeSummary ? (
      <Card key="employees" title={t('employeeSummary')} subtitle="Most active people">
        <div className="summary-list compact-summary-list">
          {topEmployees.map((employee) => (
            <div key={employee.id} className="summary-row compact-row">
              <div className="row-person">
                <Avatar name={employee.name} />
                <div>
                  <div className="row-title">{employee.name}</div>
                  <div className="row-meta">{employee.email}</div>
                </div>
              </div>
              <div className="row-value">{formatNumber(employee.totalChecks)}</div>
            </div>
          ))}
        </div>
      </Card>
    ) : null,
  ].filter(Boolean)

  return (
    <div className="page-stack">
      <PageHeader title={t('navOverview')} description={t('overviewDescription')} />

      {showLaunchBanner ? (
        <Card
          className="dashboard-launch-card"
          title={`Congratulations, ${company.companyName} is live`}
          subtitle="Here is how Afensia works once your workspace is up and running."
          action={
            <div className="button-row">
              <Button variant="secondary" size="sm" onClick={() => navigate('/app/employees')}>
                {invitedCount ? 'Review invites' : 'Invite employees'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowLaunchBanner(false)}>
                Dismiss
              </Button>
            </div>
          }
        >
          <div className="dashboard-launch-grid">
            <div className="dashboard-launch-item">
              <span>How it works</span>
              <strong>Employees use the app to check risky links, QR codes, messages, calls, and documents before acting.</strong>
            </div>
            <div className="dashboard-launch-item">
              <span>What to watch first</span>
              <strong>Follow invite progress, onboarding activity, and which protection flows your team starts using most.</strong>
            </div>
            <div className="dashboard-launch-item">
              <span>Right now</span>
              <strong>{invitedCount ? `${invitedCount} invite${invitedCount === 1 ? '' : 's'} queued for activation.` : 'Your workspace is ready for the first employee invites.'}</strong>
            </div>
          </div>
        </Card>
      ) : null}

      <section className="stats-grid overview-stats-grid seven-up">
        <StatCard label={t('totalEmployees')} value={formatNumber(employees.length)} />
        <StatCard label={t('activeEmployees')} value={formatNumber(activeEmployees.length)} />
        <StatCard label={t('totalChecks')} value={formatNumber(snapshot.totalChecks)} meta={t('currentPeriod')} />
        <StatCard label={t('riskyFindings')} value={formatNumber(snapshot.riskyFindings)} />
        <StatCard label={t('workspaceFee')} value={formatCurrency(balance.workspaceFee, balance.currency)} />
        <StatCard label={t('creditsUsed')} value={formatNumber(balance.usedCredits)} />
        <StatCard label={t('remainingBalance')} value={formatCurrency(balance.remainingBalance, balance.currency)} />
      </section>

      <section className="overview-chart-grid">
        <Card title={t('usageOverTime')} subtitle={t('usageOverTimeSubtitle')}>
          <UsageTrendChart data={snapshot.usageTrend} />
        </Card>
      </section>

      <section className="overview-summary-grid">
        {sideBlocks.length ? (
          sideBlocks
        ) : (
          <Card title="Overview blocks hidden" subtitle="Enable summary blocks in settings.">
            <div className="empty-inline-note">No overview blocks are visible.</div>
          </Card>
        )}
      </section>
    </div>
  )
}
