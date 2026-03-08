import { Card, PageHeader, SkeletonBlock, StatCard, Avatar } from '../components/ui'
import { UsageTrendChart } from '../components/charts'
import { usePrototype } from '../context/PrototypeContext'
import { formatCurrency, formatNumber } from '../lib/format'
import { useSimulatedLoading } from '../lib/useSimulatedLoading'

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
  const {
    employees,
    modules,
    balance,
    analyticsSnapshots,
    dashboardPreferences,
    t,
  } = usePrototype()
  const loading = useSimulatedLoading('overview-console', 260)
  const snapshot = analyticsSnapshots['30d']
  const enabledModules = modules.filter((module) => module.enabled)
  const activeEmployees = employees.filter((employee) => employee.status === 'Active')
  const invitedEmployees = employees.filter((employee) => employee.status === 'Invited')
  const topEmployees = [...activeEmployees].sort((a, b) => b.totalChecks - a.totalChecks).slice(0, 4)
  const topModules = [...enabledModules].sort((a, b) => b.usageCount - a.usageCount).slice(0, 4)
  const riskRate = ((snapshot.riskyFindings / snapshot.totalChecks) * 100).toFixed(1)
  const usageProgress = Math.min(100, Math.round((balance.usedCredits / balance.monthlyAllowance) * 100))

  if (loading) {
    return <OverviewSkeleton />
  }

  const sideBlocks = [
    dashboardPreferences.showUsageSummary ? (
      <Card key="usage" title={t('pricingSummary')} subtitle="Current usage and credits">
        <div className="summary-list compact-summary-list">
          <div className="summary-row compact-row">
            <span className="row-title">{t('creditRate')}</span>
            <span className="row-value">{formatCurrency(balance.creditUnitPrice, balance.currency)} / credit</span>
          </div>
          <div className="summary-row compact-row">
            <span className="row-title">{t('workspaceFee')}</span>
            <span className="row-meta">{formatCurrency(balance.workspaceFee, balance.currency)} / month</span>
          </div>
          <div className="summary-row compact-row">
            <span className="row-title">{t('creditsUsed')}</span>
            <span className="row-meta">{formatNumber(balance.usedCredits)} / {formatNumber(balance.monthlyAllowance)}</span>
          </div>
          <div className="usage-meter">
            <div className="usage-meter-head">
              <span>{usageProgress}% used</span>
              <strong>{formatNumber(balance.monthlyAllowance - balance.usedCredits)} left</strong>
            </div>
            <div className="usage-meter-track">
              <span style={{ width: `${usageProgress}%` }} />
            </div>
          </div>
          <div className="summary-row compact-row">
            <span className="row-title">Renewal</span>
            <span className="row-meta">{balance.renewalDate}</span>
          </div>
        </div>
      </Card>
    ) : null,
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
    dashboardPreferences.showRiskSummary ? (
      <Card key="risk" title={t('riskSummary')} subtitle="Current period">
        <div className="summary-list compact-summary-list">
          <div className="summary-row compact-row">
            <span className="row-title">{t('riskyFindings')}</span>
            <span className="row-value">{formatNumber(snapshot.riskyFindings)}</span>
          </div>
          <div className="summary-row compact-row">
            <span className="row-title">{t('riskRate')}</span>
            <span className="row-value">{riskRate}%</span>
          </div>
          <div className="summary-row compact-row">
            <span className="row-title">{t('pendingInvites')}</span>
            <span className="row-value">{formatNumber(invitedEmployees.length)}</span>
          </div>
        </div>
      </Card>
    ) : null,
  ].filter(Boolean)

  return (
    <div className="page-stack">
      <PageHeader title={t('navOverview')} description={t('overviewDescription')} />

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
