import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  EmployeeRiskChart,
  EmployeeUsageChart,
  ModuleUsageChart,
  RiskSplitChart,
  UsageTrendChart,
} from '../components/charts'
import { DataTable } from '../components/dataTable'
import { Badge, Button, Card, EmptyState, PageHeader, SegmentedControl, SkeletonBlock, StatCard } from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { formatNumber, formatPercentage } from '../lib/format'
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
      <div className="analytics-grid analytics-grid-dashboard">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={6} />
          </Card>
        ))}
      </div>
      <div className="analytics-grid analytics-grid-bottom">
        {Array.from({ length: 1 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={8} />
          </Card>
        ))}
      </div>
    </div>
  )
}

export function UsageAnalyticsPage() {
  const { analyticsSnapshots, modules, t } = usePrototype()
  const [range, setRange] = useState<AnalyticsRange>('30d')
  const loading = useSimulatedLoading(`analytics-console-${range}`, 260)
  const snapshot = range === 'custom' ? null : analyticsSnapshots[range]

  const employeeColumns = useMemo<ColumnDef<NonNullable<typeof snapshot>['employeeInsights'][number]>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('navEmployees'),
        cell: ({ row }) => <div className="row-title">{row.original.name}</div>,
      },
      {
        accessorKey: 'checks',
        header: t('totalChecks'),
        cell: ({ row }) => formatNumber(row.original.checks),
      },
      {
        accessorKey: 'risky',
        header: t('riskyFindings'),
        cell: ({ row }) => formatNumber(row.original.risky),
      },
      {
        accessorKey: 'topModule',
        header: t('analyticsTopModule'),
      },
      {
        accessorKey: 'lastActive',
        header: t('analyticsLastActive'),
      },
      {
        accessorKey: 'usageShare',
        header: t('analyticsUsageShare'),
        cell: ({ row }) => (
          <div className="usage-share-cell">
            <span>{row.original.usageShare}%</span>
            <Badge tone={row.original.trend >= 0 ? 'success' : 'warning'}>{formatPercentage(row.original.trend)}</Badge>
          </div>
        ),
      },
    ],
    [t],
  )

  if (loading) {
    return <AnalyticsSkeleton />
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={t('navAnalytics')}
        description={t('analyticsDescription')}
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
            description={t('analyticsNoCustom')}
            action={<Button onClick={() => setRange('30d')}>{t('analyticsUse30d')}</Button>}
          />
        </Card>
      ) : (
        <>
          <section className="stats-grid analytics-stats-grid six-up">
            <StatCard label={t('totalChecks')} value={formatNumber(snapshot.totalChecks)} />
            <StatCard label={t('riskyFindings')} value={formatNumber(snapshot.riskyFindings)} />
            <StatCard label={t('safeFindings')} value={formatNumber(snapshot.safeFindings)} />
            <StatCard label={t('activeEmployees')} value={formatNumber(snapshot.activeEmployees)} />
            <StatCard label="Module usage" value={formatNumber(snapshot.moduleUsage.length)} meta="Tracked modules" />
            <StatCard label="Average / employee" value={formatNumber(snapshot.averageChecksPerEmployee)} />
          </section>

          <section className="analytics-grid analytics-grid-dashboard">
            <Card className="analytics-card-wide" title={t('usageOverTime')} subtitle={t('usageOverTimeSubtitle')}>
              <UsageTrendChart data={snapshot.usageTrend} />
            </Card>
            <Card title={t('riskyFindings')} subtitle={t('analyticsEmployeeRiskView')}>
              <RiskSplitChart risky={snapshot.riskyFindings} safe={snapshot.safeFindings} />
              <div className="risk-legend-row">
                <Badge tone="info">Modules {modules.filter((module) => module.enabled).length}</Badge>
                <Badge tone="warning">Risky {formatNumber(snapshot.riskyFindings)}</Badge>
              </div>
            </Card>
            <Card title="Usage by module" subtitle="Most used protection areas">
              <ModuleUsageChart data={snapshot.moduleUsage} />
            </Card>
            <Card title="Checks by employee" subtitle="Most active people this period">
              <EmployeeUsageChart data={snapshot.employeeUsage} />
            </Card>
            <Card title={t('analyticsEmployeeRiskView')} subtitle="Safe vs risky checks by employee">
              <EmployeeRiskChart data={snapshot.employeeUsage.slice(0, 5)} />
            </Card>
          </section>

          <section>
            <Card title={t('analyticsEmployeeLeaderboard')} subtitle="Who is using Afensia most this period">
              <DataTable
                data={snapshot.employeeInsights}
                columns={employeeColumns}
                getRowId={(employee) => employee.id}
                tableClassName="analytics-table"
                dense
                summary={
                  <div className="data-table-summary-row">
                    <span>{formatNumber(snapshot.employeeInsights.length)} tracked employees</span>
                    <span>{formatNumber(snapshot.totalChecks)} total checks</span>
                    <span>{formatNumber(snapshot.riskyFindings)} risky findings</span>
                  </div>
                }
              />
            </Card>
          </section>
        </>
      )}
    </div>
  )
}
