import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '../components/dataTable'
import { StripePreviewModal } from '../components/stripePreviewModal'
import { Badge, Button, Card, EmptyState, PageHeader, SegmentedControl, SkeletonBlock, StatCard } from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { formatCurrency, formatDate, formatNumber } from '../lib/format'
import { useSimulatedLoading } from '../lib/useSimulatedLoading'
import type { SecurityModule, UsageTierId } from '../types'

type BillingMode = 'auto-top-up' | 'manual-top-up' | 'monthly-invoice'

function ModulesSkeleton() {
  return (
    <div className="page-stack">
      <div className="stats-grid four-up">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={3} />
          </Card>
        ))}
      </div>
      <div className="module-pricing-layout">
        <Card>
          <SkeletonBlock lines={8} />
        </Card>
        <Card>
          <SkeletonBlock lines={8} />
        </Card>
      </div>
      <Card>
        <SkeletonBlock lines={10} />
      </Card>
    </div>
  )
}

function resolveModuleStatus(module: SecurityModule) {
  if (module.status === 'Add-on' && module.enabled) {
    return { label: 'Purchased', tone: 'success' as const }
  }

  if (module.status === 'Add-on') {
    return { label: 'Add-on', tone: 'warning' as const }
  }

  if (module.status === 'Coming soon') {
    return { label: 'Coming soon', tone: 'info' as const }
  }

  return { label: 'Included', tone: 'neutral' as const }
}

function resolveCreditLabel(module: SecurityModule) {
  if (module.creditCost === null) {
    return 'Pricing later'
  }

  if (module.creditCost === 0) {
    return 'Included'
  }

  return `${module.creditCost} credits / ${module.billingUnit}`
}

export function ModulesPage() {
  const { modules, balance, usageTiers, showToast, t } = usePrototype()
  const loading = useSimulatedLoading('modules-console', 260)
  const [billingMode, setBillingMode] = useState<BillingMode>('auto-top-up')
  const [selectedTierId, setSelectedTierId] = useState<UsageTierId>(balance.usageTierId)
  const [stripePreviewOpen, setStripePreviewOpen] = useState(false)

  const purchasedAddOns = useMemo(() => modules.filter((module) => module.status === 'Add-on' && module.enabled).length, [modules])
  const includedModules = useMemo(() => modules.filter((module) => module.status === 'Included').length, [modules])
  const usagePercentage = Math.min(100, (balance.usedCredits / Math.max(balance.monthlyAllowance, 1)) * 100)
  const selectedTier = usageTiers.find((tier) => tier.id === selectedTierId) ?? usageTiers[0]
  const selectedRate = selectedTier.creditRate ?? balance.creditUnitPrice

  const pricingExamples = useMemo(
    () =>
      modules
        .filter((module) =>
          ['call-watchdog', 'qr-scanner', 'document-verification', 'deepfake-detection'].includes(module.id),
        )
        .map((module) => ({
          id: module.id,
          name: module.name,
          cost:
            module.creditCost === null
              ? 'Pricing later'
              : module.creditCost === 0
                ? 'Included'
                : `${formatCurrency(module.creditCost * selectedRate, balance.currency)} / ${module.billingUnit}`,
        })),
    [balance.currency, modules, selectedRate],
  )

  const estimatedRows = useMemo(
    () =>
      modules.map((module) => ({
        ...module,
        creditLabel: resolveCreditLabel(module),
        estimatedCost:
          module.creditCost === null
            ? 'Pricing later'
            : module.creditCost === 0
              ? 'Included in workspace access'
              : `${formatCurrency(module.creditCost * selectedRate, balance.currency)} / ${module.billingUnit}`,
        statusDisplay: resolveModuleStatus(module),
      })),
    [balance.currency, modules, selectedRate],
  )

  const columns = useMemo<ColumnDef<(typeof estimatedRows)[number]>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Module',
        cell: ({ row }) => (
          <div className="module-rate-cell">
            <div className="row-title">{row.original.name}</div>
            <div className="row-meta">{row.original.description}</div>
          </div>
        ),
      },
      {
        id: 'billing',
        header: 'Billing',
        cell: ({ row }) => (
          <div className="module-billing-cell">
            <strong>{row.original.creditLabel}</strong>
            <span>{row.original.estimatedCost}</span>
          </div>
        ),
      },
      {
        accessorKey: 'statusDisplay.label',
        header: 'Status',
        cell: ({ row }) => <Badge tone={row.original.statusDisplay.tone}>{row.original.statusDisplay.label}</Badge>,
      },
      {
        accessorKey: 'usageCount',
        header: 'Used this month',
        cell: ({ row }) => formatNumber(row.original.usageCount),
      },
    ],
    [],
  )

  if (loading) {
    return <ModulesSkeleton />
  }

  return (
    <div className="page-stack">
      <PageHeader title="Modules & pricing" description="Credits, billing, and module costs." />

      <section className="stats-grid four-up">
        <StatCard label={t('creditRate')} value={`${formatCurrency(selectedRate, balance.currency)} / credit`} meta="Applied to metered checks" />
        <StatCard label={t('workspaceFee')} value={`${formatCurrency(balance.workspaceFee, balance.currency)} / month`} meta="Base workspace access" />
        <StatCard label={t('creditAllowance')} value={formatNumber(balance.monthlyAllowance)} meta={`${formatNumber(balance.usedCredits)} used this month`} />
        <StatCard label={t('remainingBalance')} value={formatCurrency(balance.remainingBalance, balance.currency)} meta={`${formatNumber(purchasedAddOns)} active add-ons`} />
      </section>

      <section className="module-pricing-layout">
        <Card title={t('billingSetup')} subtitle={t('billingSetupSubtitle')}>
          <div className="billing-setup-grid">
            <div className="billing-provider-banner">
              <div className="billing-provider-copy">
                <div className="billing-provider-top">
                  <Badge tone="info">Stripe</Badge>
                  <span className="meta-label">Mock provider</span>
                </div>
                <strong>Visa ending 4242</strong>
                <span className="field-hint">Ready for credit top-ups and monthly workspace charges.</span>
              </div>
              <Button variant="secondary" onClick={() => setStripePreviewOpen(true)}>
                {t('connectStripe')}
              </Button>
            </div>

            <div className="billing-mode-section">
              <div className="billing-section-head">
                <strong>{t('paymentMode')}</strong>
                <span className="field-hint">Choose how credits refill.</span>
              </div>
              <SegmentedControl
                value={billingMode}
                onChange={setBillingMode}
                options={[
                  { label: t('autoTopUp'), value: 'auto-top-up' },
                  { label: t('manualTopUp'), value: 'manual-top-up' },
                  { label: t('monthlyInvoice'), value: 'monthly-invoice' },
                ]}
              />
            </div>

            <div className="credit-pack-grid">
              {usageTiers.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  className={tier.id === selectedTierId ? 'credit-pack-card credit-pack-card-active' : 'credit-pack-card'}
                  onClick={() => setSelectedTierId(tier.id)}
                >
                  <div className="credit-pack-top">
                    <strong>{tier.name}</strong>
                    {tier.highlight ? <Badge tone="info">Recommended</Badge> : null}
                  </div>
                  <div className="credit-pack-price">{tier.priceLabel}</div>
                  <div className="credit-pack-helper">{tier.billingNote}</div>
                </button>
              ))}
            </div>

            <div className="button-row">
              <Button
                onClick={() =>
                  showToast(
                    'Credits ready',
                    `${selectedTier.name} was prepared for a mock checkout flow.`,
                    'success',
                  )
                }
              >
                {t('addCredits')}
              </Button>
              <Button variant="secondary" onClick={() => showToast('Estimate ready', 'A billing estimate can be exported in a later phase.', 'info')}>
                {t('downloadEstimate')}
              </Button>
            </div>
          </div>
        </Card>

        <Card title={t('billingSummaryTitle')} subtitle={t('billingSummarySubtitle')} className="billing-summary-card">
          <div className="summary-list compact-summary-list">
            <div className="summary-row compact-row">
              <span className="row-title">{t('workspaceFee')}</span>
              <span className="row-meta">{formatCurrency(balance.workspaceFee, balance.currency)} / month</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">{t('usageTier')}</span>
              <span className="row-meta">{selectedTier.name}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">Estimated usage</span>
              <span className="row-meta">{selectedTier.priceLabel}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">{t('creditRate')}</span>
              <span className="row-meta">{formatCurrency(selectedRate, balance.currency)} / credit</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">{t('paymentMode')}</span>
              <span className="row-meta">
                {billingMode === 'auto-top-up' ? t('autoTopUp') : billingMode === 'manual-top-up' ? t('manualTopUp') : t('monthlyInvoice')}
              </span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">Renewal</span>
              <span className="row-meta">{formatDate(balance.renewalDate)}</span>
            </div>
          </div>

          <div className="usage-meter-card">
            <div className="usage-meter">
              <div className="usage-meter-head">
                <span>{t('creditsUsed')}</span>
                <strong>
                  {formatNumber(balance.usedCredits)} / {formatNumber(balance.monthlyAllowance)}
                </strong>
              </div>
              <div className="usage-meter-track">
                <span style={{ width: `${usagePercentage}%` }} />
              </div>
            </div>
          </div>

          <div className="pricing-example-list">
            {pricingExamples.map((example) => (
              <div key={example.id} className="pricing-example-row">
                <span>{example.name}</span>
                <strong>{example.cost}</strong>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card title={t('modulePricingTitle')} subtitle={t('modulePricingSubtitle')}>
        {estimatedRows.length ? (
          <DataTable
            data={estimatedRows}
            columns={columns}
            getRowId={(module) => module.id}
            summary={
              <div className="data-table-summary-row">
                <span>{formatNumber(estimatedRows.length)} modules</span>
                <span>{formatNumber(includedModules)} included</span>
                <span>{formatNumber(purchasedAddOns)} active add-ons</span>
              </div>
            }
          />
        ) : (
          <EmptyState title="No modules" description="Module pricing will appear here." />
        )}
      </Card>

      <StripePreviewModal
        open={stripePreviewOpen}
        onClose={() => setStripePreviewOpen(false)}
        workspaceFee={`${formatCurrency(balance.workspaceFee, balance.currency)} / month`}
        usageTier={selectedTier.name}
        usagePrice={selectedTier.priceLabel}
        paymentMode={billingMode === 'auto-top-up' ? t('autoTopUp') : billingMode === 'manual-top-up' ? t('manualTopUp') : t('monthlyInvoice')}
        creditRate={`${formatCurrency(selectedRate, balance.currency)} / credit`}
      />
    </div>
  )
}
