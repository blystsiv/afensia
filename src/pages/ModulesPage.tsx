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
      <Card>
        <SkeletonBlock lines={6} />
      </Card>
      <div className="module-grid module-grid-expanded">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={6} />
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ModulesPage() {
  const { modules, balance, pricingPlans, t } = usePrototype()
  const loading = useSimulatedLoading('modules-console', 260)
  const [selectedModule, setSelectedModule] = useState<SecurityModule | null>(null)

  const currentPlan = useMemo(() => pricingPlans.find((plan) => plan.id === balance.planId) ?? pricingPlans[0], [balance.planId, pricingPlans])
  const activeModules = useMemo(() => modules.filter((module) => module.enabled), [modules])
  const addOnModules = useMemo(() => modules.filter((module) => module.status === 'Add-on').length, [modules])
  const upcomingModules = useMemo(() => modules.filter((module) => module.status === 'Coming soon').length, [modules])

  if (loading) {
    return <ModulesSkeleton />
  }

  return (
    <div className="page-stack">
      <PageHeader title={t('navModules')} description={t('modulesDescription')} />

      <section className="stats-grid four-up">
        <StatCard label={t('currentPlan')} value={currentPlan.name} meta={currentPlan.priceLabel} />
        <StatCard label={t('remainingBalance')} value={formatCurrency(balance.remainingBalance, balance.currency)} meta={balance.creditModel} />
        <StatCard label={t('modulesIncluded')} value={formatNumber(activeModules.length)} meta={t('pricingAndCoverage')} />
        <StatCard label={t('modulesAddOn')} value={formatNumber(addOnModules + upcomingModules)} meta="Optional and roadmap modules" />
      </section>

      <Card title={t('pricingAndCoverage')} subtitle="Plan cards are shown as product direction for the developer build">
        <div className="plan-grid">
          {pricingPlans.map((plan) => (
            <div key={plan.id} className={plan.id === balance.planId ? 'plan-card plan-card-active' : 'plan-card'}>
              <div className="plan-card-head">
                <strong>{plan.name}</strong>
                {plan.id === balance.planId ? <Badge tone="info">Current</Badge> : null}
              </div>
              <div className="plan-card-price">{plan.priceLabel}</div>
              <div className="row-meta">{plan.billingNote}</div>
              <p className="plan-card-copy">{plan.description}</p>
              <div className="plan-card-meta">{plan.seats}</div>
              <div className="module-pill-row">
                {plan.includedModules.slice(0, 3).map((module) => (
                  <Badge key={module} tone="neutral">
                    {module}
                  </Badge>
                ))}
                {plan.includedModules.length > 3 ? <Badge tone="neutral">+{plan.includedModules.length - 3}</Badge> : null}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <section className="module-grid module-grid-expanded">
        {modules.map((module) => {
          const tone = module.status === 'Included' ? 'success' : module.status === 'Add-on' ? 'warning' : 'info'
          const ctaLabel = module.status === 'Included' ? 'Included in plan' : module.status === 'Add-on' ? 'Upgrade path' : 'Roadmap'

          return (
            <Card key={module.id} className="module-card module-card-refined">
              <div className="module-card-head">
                <div>
                  <div className="module-category-line">{module.category}</div>
                  <h2 className="ui-card-title">{module.name}</h2>
                  <p className="ui-card-subtitle">{module.description}</p>
                </div>
                <div className="module-badge-row">
                  <Badge tone={tone}>{module.status}</Badge>
                  <Badge tone={module.tier === 'Core' ? 'info' : module.tier === 'Advanced' ? 'warning' : 'neutral'}>{module.tier}</Badge>
                </div>
              </div>
              <div className="module-usage-strip">
                <div>
                  <span className="meta-label">{t('modulesUsageThisPeriod')}</span>
                  <strong className="module-usage-number">{formatNumber(module.usageCount)}</strong>
                </div>
                <div>
                  <span className="meta-label">{t('currentPlan')}</span>
                  <strong>{module.plan === 'addon' ? 'Add-on' : pricingPlans.find((plan) => plan.id === module.plan)?.name}</strong>
                </div>
              </div>
              <div className="module-pricing-panel">
                <div className="module-pricing-line module-pricing-line-strong">
                  <span>{module.priceLabel}</span>
                  <span>{module.note}</span>
                </div>
              </div>
              <div className="module-card-actions">
                <Button variant="secondary" onClick={() => setSelectedModule(module)}>
                  {t('modulesViewDetails')}
                </Button>
                <Button variant={module.status === 'Included' ? 'primary' : 'ghost'} disabled>
                  {ctaLabel}
                </Button>
              </div>
            </Card>
          )
        })}
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
              <span>{t('currentPlan')}</span>
              <strong>{selectedModule.plan === 'addon' ? 'Add-on' : pricingPlans.find((plan) => plan.id === selectedModule.plan)?.name}</strong>
            </div>
            <div className="detail-item">
              <span>{t('modulesUsageThisPeriod')}</span>
              <strong>{formatNumber(selectedModule.usageCount)}</strong>
            </div>
            <div className="detail-item detail-item-span">
              <span>{t('pricingAndCoverage')}</span>
              <strong>{selectedModule.priceLabel}</strong>
              <div className="row-meta">{selectedModule.note}</div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
