import { useState } from 'react'
import {
  EmployeeUsageChart,
  ModuleUsageChart,
  RiskSplitChart,
  UsageTrendChart,
} from '../components/charts'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  SegmentedControl,
  SkeletonBlock,
  StatCard,
} from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { formatNumber } from '../lib/format'
import { useSimulatedLoading } from '../lib/useSimulatedLoading'
import type { AnalyticsRange } from '../types'

function AnalyticsSkeleton() {
  return (
    <div className="page-stack">
      <div className="stats-grid analytics-stats-grid six-up">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={3} />
          </Card>
        ))}
      </div>
      <div className="analytics-grid analytics-grid-expanded">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={6} />
          </Card>
        ))}
      </div>
    </div>
  )
}

export function UsageAnalyticsPage() {
  const { analyticsSnapshots, modules } = usePrototype()
  const [range, setRange] = useState<AnalyticsRange>('30d')
  const loading = useSimulatedLoading(`analytics-console-${range}`, 260)
  const snapshot = range === 'custom' ? null : analyticsSnapshots[range]

  if (loading) {
    return <AnalyticsSkeleton />
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Analytics"
        description="Usage, module, and employee metrics"
        action={
          <SegmentedControl
            value={range}
            onChange={setRange}
            options={[
              { label: '7d', value: '7d' },
              { label: '30d', value: '30d' },
              { label: '90d', value: '90d' },
              { label: 'Custom', value: 'custom' },
            ]}
          />
        }
      />

      {!snapshot ? (
        <Card>
          <EmptyState
            title="No analytics for this range"
            description="Custom ranges can be added later."
            action={<Button onClick={() => setRange('30d')}>Use 30d</Button>}
          />
        </Card>
      ) : (
        <>
          <section className="stats-grid analytics-stats-grid six-up">
            <StatCard label="Total checks" value={formatNumber(snapshot.totalChecks)} />
            <StatCard label="Risky findings" value={formatNumber(snapshot.riskyFindings)} />
            <StatCard label="Safe findings" value={formatNumber(snapshot.safeFindings)} />
            <StatCard label="Employee activity" value={formatNumber(snapshot.activeEmployees)} />
            <StatCard label="Module usage" value={formatNumber(snapshot.moduleUsage.length)} meta="Active modules" />
            <StatCard label="Average / employee" value={formatNumber(snapshot.averageChecksPerEmployee)} />
          </section>

          <section className="analytics-grid analytics-grid-expanded">
            <Card title="Checks over time" subtitle="Checks and risky findings">
              <UsageTrendChart data={snapshot.usageTrend} />
            </Card>
            <Card title="Usage by module" subtitle="Top protection modules">
              <ModuleUsageChart data={snapshot.moduleUsage} />
            </Card>
            <Card title="Usage by employee" subtitle="Most active team members">
              <EmployeeUsageChart data={snapshot.employeeUsage} />
            </Card>
            <Card title="Risky vs safe" subtitle="Current period split">
              <RiskSplitChart risky={snapshot.riskyFindings} safe={snapshot.safeFindings} />
              <div className="risk-legend-row">
                <Badge tone="info">Enabled modules {modules.filter((module) => module.enabled).length}</Badge>
                <Badge tone="warning">Risky {formatNumber(snapshot.riskyFindings)}</Badge>
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
