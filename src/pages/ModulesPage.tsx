import { useMemo, useState } from 'react'
import { Badge, Button, Card, EmptyState, Modal, PageHeader, SkeletonBlock, StatCard } from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { formatNumber } from '../lib/format'
import { useSimulatedLoading } from '../lib/useSimulatedLoading'
import type { SecurityModule } from '../types'

function ModulesSkeleton() {
  return (
    <div className="page-stack">
      <div className="stats-grid three-up">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={3} />
          </Card>
        ))}
      </div>
      <div className="module-grid">
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
  const { modules, enableCoreModules, toggleModule } = usePrototype()
  const loading = useSimulatedLoading('modules-console', 260)
  const [selectedModule, setSelectedModule] = useState<SecurityModule | null>(null)

  const enabledModules = useMemo(() => modules.filter((module) => module.enabled), [modules])
  const futureReadyModules = useMemo(
    () => modules.filter((module) => module.tier === 'Future-ready').length,
    [modules],
  )
  const totalUsage = useMemo(
    () => modules.reduce((total, module) => total + module.usageCount, 0),
    [modules],
  )

  if (loading) {
    return <ModulesSkeleton />
  }

  return (
    <div className="page-stack">
      <PageHeader title="Modules" description="Afensia protection modules" />

      <section className="stats-grid three-up">
        <StatCard label="Enabled modules" value={formatNumber(enabledModules.length)} />
        <StatCard label="Future-ready" value={formatNumber(futureReadyModules)} />
        <StatCard label="Module usage" value={formatNumber(totalUsage)} meta="Current period" />
      </section>

      {!enabledModules.length ? (
        <Card>
          <EmptyState
            title="No modules enabled"
            description="Enable core modules to activate the business security console."
            action={<Button onClick={enableCoreModules}>Enable core modules</Button>}
          />
        </Card>
      ) : null}

      <section className="module-grid">
        {modules.map((module) => (
          <Card key={module.id} className="module-card">
            <div className="module-card-head">
              <div>
                <h2 className="ui-card-title">{module.name}</h2>
                <p className="ui-card-subtitle">{module.description}</p>
              </div>
              <div className="module-badge-row">
                <Badge tone={module.enabled ? 'success' : module.status === 'Preview' ? 'info' : 'neutral'}>
                  {module.status}
                </Badge>
                <Badge tone={module.tier === 'Core' ? 'info' : module.tier === 'Advanced' ? 'warning' : 'neutral'}>
                  {module.tier}
                </Badge>
              </div>
            </div>
            <div className="module-usage-number">{formatNumber(module.usageCount)}</div>
            <div className="row-meta">Usage this period</div>
            <div className="module-card-actions">
              <Button variant="secondary" onClick={() => setSelectedModule(module)}>
                View details
              </Button>
              <Button
                variant={module.enabled ? 'ghost' : 'primary'}
                disabled={module.status === 'Preview'}
                onClick={() => toggleModule(module.id)}
              >
                {module.status === 'Preview' ? 'Future-ready' : module.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </Card>
        ))}
      </section>

      <Modal
        open={Boolean(selectedModule)}
        onClose={() => setSelectedModule(null)}
        title={selectedModule?.name ?? 'Module details'}
        description={selectedModule?.description}
        footer={
          selectedModule ? (
            <>
              <Button variant="ghost" onClick={() => setSelectedModule(null)}>
                Close
              </Button>
              <Button
                variant={selectedModule.enabled ? 'ghost' : 'primary'}
                disabled={selectedModule.status === 'Preview'}
                onClick={() => {
                  toggleModule(selectedModule.id)
                  setSelectedModule(null)
                }}
              >
                {selectedModule.status === 'Preview' ? 'Future-ready' : selectedModule.enabled ? 'Disable' : 'Enable'}
              </Button>
            </>
          ) : null
        }
      >
        {selectedModule ? (
          <div className="module-detail-grid">
            <div className="detail-item">
              <span>Status</span>
              <strong>{selectedModule.status}</strong>
            </div>
            <div className="detail-item">
              <span>Tier</span>
              <strong>{selectedModule.tier}</strong>
            </div>
            <div className="detail-item">
              <span>Usage</span>
              <strong>{formatNumber(selectedModule.usageCount)}</strong>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
