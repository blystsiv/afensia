import { useMemo, useState } from 'react'
import { Badge, Button, Card, Modal, PageHeader, SkeletonBlock, StatCard } from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { formatCurrency, formatNumber } from '../lib/format'
import { useSimulatedLoading } from '../lib/useSimulatedLoading'
import type { SecurityModule } from '../types'

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
          <SkeletonBlock lines={6} />
        </Card>
      </div>
      <div className="module-section-grid">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={8} />
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ModulesPage() {
  const { modules, balance, usageTiers, t } = usePrototype()
  const loading = useSimulatedLoading('modules-console', 260)
  const [selectedModule, setSelectedModule] = useState<SecurityModule | null>(null)

  const currentUsageTier = useMemo(
    () => usageTiers.find((tier) => tier.id === balance.usageTierId) ?? usageTiers[0],
    [balance.usageTierId, usageTiers],
  )
  const includedModules = useMemo(() => modules.filter((module) => module.status === 'Included'), [modules])
  const addOnModules = useMemo(() => modules.filter((module) => module.status !== 'Included'), [modules])
  const activeAddOns = useMemo(() => modules.filter((module) => module.status === 'Add-on' && module.enabled).length, [modules])
  const usageProgress = Math.min(100, Math.round((balance.usedCredits / balance.monthlyAllowance) * 100))

  if (loading) {
    return <ModulesSkeleton />
  }

  return (
    <div className="page-stack">
      <PageHeader title={t('navModules')} description={t('modulesDescription')} />

      <section className="stats-grid four-up">
        <StatCard label={t('workspaceFee')} value={formatCurrency(balance.workspaceFee, balance.currency)} />
        <StatCard label={t('usageTier')} value={currentUsageTier.name} meta={currentUsageTier.billingNote} />
        <StatCard label={t('creditsUsed')} value={formatNumber(balance.usedCredits)} meta={`${formatNumber(balance.monthlyAllowance)} included credits`} />
        <StatCard label={t('featureAddOns')} value={formatNumber(activeAddOns)} meta="Active add-ons" />
      </section>

      <section className="module-pricing-layout">
        <Card title={t('pricingAndCoverage')} subtitle="Usage volume and add-on pricing">
          <div className="usage-tier-grid">
            {usageTiers.map((tier) => (
              <div key={tier.id} className={tier.id === balance.usageTierId ? 'usage-tier-card usage-tier-card-active' : 'usage-tier-card'}>
                <div className="usage-tier-topline">
                  <strong>{tier.name}</strong>
                  {tier.highlight ? <Badge tone="info">Most used</Badge> : null}
                </div>
                <div className="usage-tier-price">{tier.priceLabel}</div>
                <div className="row-meta">{tier.billingNote}</div>
                <div className="usage-tier-copy">{tier.description}</div>
                <div className="usage-tier-foot">{tier.bestFor}</div>
              </div>
            ))}
          </div>
          <div className="pricing-rule-strip">
            <div>
              <span className="meta-label">Core modules</span>
              <strong>1 credit per check</strong>
            </div>
            <div>
              <span className="meta-label">Advanced verification</span>
              <strong>2 credits per check</strong>
            </div>
            <div>
              <span className="meta-label">Deepfake scans</span>
              <strong>5 credits per scan</strong>
            </div>
          </div>
        </Card>

        <Card title="Current pricing" subtitle="NorthHill workspace">
          <div className="usage-meter usage-meter-card">
            <div className="usage-meter-head">
              <span>{usageProgress}% used</span>
              <strong>{formatNumber(balance.monthlyAllowance - balance.usedCredits)} credits left</strong>
            </div>
            <div className="usage-meter-track">
              <span style={{ width: `${usageProgress}%` }} />
            </div>
          </div>
          <div className="summary-list compact-summary-list">
            <div className="summary-row compact-row">
              <span className="row-title">{t('workspaceFee')}</span>
              <span className="row-value">{formatCurrency(balance.workspaceFee, balance.currency)}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">{t('usageTier')}</span>
              <span className="row-meta">{currentUsageTier.name}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">{t('creditAllowance')}</span>
              <span className="row-meta">{formatNumber(balance.monthlyAllowance)} credits</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">{t('remainingBalance')}</span>
              <span className="row-meta">{formatCurrency(balance.remainingBalance, balance.currency)}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">Renewal</span>
              <span className="row-meta">{balance.renewalDate}</span>
            </div>
          </div>
        </Card>
      </section>

      <section className="module-section-grid">
        <Card title="Core protection" subtitle="Included in workspace access">
          <div className="module-grid module-grid-compact">
            {includedModules.map((module) => (
              <button key={module.id} type="button" className="module-list-card" onClick={() => setSelectedModule(module)}>
                <div className="module-list-head">
                  <strong>{module.name}</strong>
                  <Badge tone="success">{module.status}</Badge>
                </div>
                <div className="module-list-copy">{module.description}</div>
                <div className="module-list-meta">
                  <span>{module.usageLabel}</span>
                  <span>{formatNumber(module.usageCount)} checks</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card title={t('featureAddOns')} subtitle="Optional and upcoming modules">
          <div className="module-grid module-grid-compact">
            {addOnModules.map((module) => (
              <button key={module.id} type="button" className="module-list-card module-list-card-muted" onClick={() => setSelectedModule(module)}>
                <div className="module-list-head">
                  <strong>{module.name}</strong>
                  <Badge tone={module.status === 'Add-on' ? 'warning' : 'info'}>{module.status}</Badge>
                </div>
                <div className="module-list-copy">{module.description}</div>
                <div className="module-list-meta">
                  <span>{module.priceLabel}</span>
                  <span>{module.usageLabel}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </section>

      <Modal
        open={Boolean(selectedModule)}
        onClose={() => setSelectedModule(null)}
        title={selectedModule?.name ?? 'Module details'}
        description={selectedModule?.description}
        footer={
          <Button variant="ghost" onClick={() => setSelectedModule(null)}>
            {t('close')}
          </Button>
        }
      >
        {selectedModule ? (
          <div className="module-detail-grid module-detail-grid-rich">
            <div className="detail-item">
              <span>{t('status')}</span>
              <strong>{selectedModule.status}</strong>
            </div>
            <div className="detail-item">
              <span>{t('pricingAndCoverage')}</span>
              <strong>{selectedModule.priceLabel}</strong>
            </div>
            <div className="detail-item">
              <span>Usage rule</span>
              <strong>{selectedModule.usageLabel}</strong>
            </div>
            <div className="detail-item detail-item-span">
              <span>Note</span>
              <strong>{selectedModule.note}</strong>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
