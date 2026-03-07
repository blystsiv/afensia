import { Card, PageHeader, SkeletonBlock, StatCard, Badge, Avatar } from '../components/ui'
import { UsageTrendChart } from '../components/charts'
import { usePrototype } from '../context/PrototypeContext'
import { formatCurrency, formatNumber } from '../lib/format'
import { useSimulatedLoading } from '../lib/useSimulatedLoading'

function OverviewSkeleton() {
  return (
    <div className="page-stack">
      <Card>
        <SkeletonBlock lines={2} />
      </Card>
      <div className="stats-grid overview-stats-grid seven-up">
        {Array.from({ length: 7 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={3} />
          </Card>
        ))}
      </div>
      <div className="overview-main-grid">
        <Card>
          <SkeletonBlock lines={7} />
        </Card>
        <div className="page-stack compact-stack">
          <Card>
            <SkeletonBlock lines={5} />
          </Card>
          <Card>
            <SkeletonBlock lines={5} />
          </Card>
          <Card>
            <SkeletonBlock lines={4} />
          </Card>
        </div>
      </div>
    </div>
  )
}

export function OverviewPage() {
  const {
    company,
    employees,
    modules,
    balance,
    analyticsSnapshots,
    uiLanguage,
    themeMode,
    dashboardPreferences,
  } = usePrototype()
  const loading = useSimulatedLoading('overview-console', 260)
  const snapshot = analyticsSnapshots['30d']
  const enabledModules = modules.filter((module) => module.enabled)
  const activeEmployees = employees.filter((employee) => employee.status === 'Active')
  const invitedEmployees = employees.filter((employee) => employee.status === 'Invited')
  const topEmployees = [...activeEmployees].sort((a, b) => b.totalChecks - a.totalChecks).slice(0, 4)
  const topModules = [...enabledModules].sort((a, b) => b.usageCount - a.usageCount).slice(0, 4)
  const riskRate = ((snapshot.riskyFindings / snapshot.totalChecks) * 100).toFixed(1)

  if (loading) {
    return <OverviewSkeleton />
  }

  const sideBlocks = [
    dashboardPreferences.showModuleBreakdown ? (
      <Card key="modules" title="Feature usage breakdown" subtitle="Enabled modules this period">
        <div className="summary-list compact-summary-list">
          {topModules.map((module) => (
            <div key={module.id} className="summary-row compact-row">
              <div>
                <div className="row-title">{module.name}</div>
                <div className="row-meta">{module.tier}</div>
              </div>
              <div className="row-value">{formatNumber(module.usageCount)}</div>
            </div>
          ))}
        </div>
      </Card>
    ) : null,
    dashboardPreferences.showEmployeeSummary ? (
      <Card key="employees" title="Employee summary" subtitle="Top usage this month">
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
      <Card key="risk" title="Risk summary" subtitle="Business security status">
        <div className="summary-list compact-summary-list">
          <div className="summary-row compact-row">
            <span className="row-title">Risky findings</span>
            <span className="row-value">{formatNumber(snapshot.riskyFindings)}</span>
          </div>
          <div className="summary-row compact-row">
            <span className="row-title">Risk rate</span>
            <span className="row-value">{riskRate}%</span>
          </div>
          <div className="summary-row compact-row">
            <span className="row-title">Remaining balance</span>
            <span className="row-value">{formatCurrency(balance.remainingBalance, balance.currency)}</span>
          </div>
          <div className="summary-row compact-row">
            <span className="row-title">Pending invites</span>
            <span className="row-value">{formatNumber(invitedEmployees.length)}</span>
          </div>
        </div>
      </Card>
    ) : null,
  ].filter(Boolean)

  return (
    <div className="page-stack">
      <PageHeader title="Overview" description="Business security operations" />

      <Card className="console-meta-card">
        <div className="console-meta-grid">
          <div>
            <span className="meta-label">Company</span>
            <strong>{company.companyName}</strong>
          </div>
          <div>
            <span className="meta-label">Status</span>
            <Badge tone="success">{company.status}</Badge>
          </div>
          <div>
            <span className="meta-label">Language</span>
            <strong>{uiLanguage.toUpperCase()}</strong>
          </div>
          <div>
            <span className="meta-label">Theme</span>
            <strong>{themeMode}</strong>
          </div>
          <div>
            <span className="meta-label">Enabled modules</span>
            <strong>{formatNumber(enabledModules.length)}</strong>
          </div>
        </div>
      </Card>

      <section className="stats-grid overview-stats-grid seven-up">
        <StatCard label="Total employees" value={formatNumber(employees.length)} />
        <StatCard label="Active employees" value={formatNumber(activeEmployees.length)} />
        <StatCard label="Checks" value={formatNumber(snapshot.totalChecks)} meta="Current period" />
        <StatCard label="Risky findings" value={formatNumber(snapshot.riskyFindings)} />
        <StatCard label="Total balance" value={formatCurrency(balance.totalBalance, balance.currency)} />
        <StatCard label="Remaining balance" value={formatCurrency(balance.remainingBalance, balance.currency)} />
        <StatCard label="Pending invites" value={formatNumber(invitedEmployees.length)} />
      </section>

      <section className="overview-main-grid">
        <Card title="Usage over time" subtitle="Checks and risky findings">
          <UsageTrendChart data={snapshot.usageTrend} />
        </Card>

        <div className="page-stack compact-stack">
          {sideBlocks.length ? (
            sideBlocks
          ) : (
            <Card title="Overview blocks hidden" subtitle="Enable modules, employee, or risk blocks in settings.">
              <div className="empty-inline-note">No overview blocks are visible.</div>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
