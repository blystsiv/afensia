import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CheckboxField,
  InputField,
  Modal,
  PageHeader,
  SegmentedControl,
  SelectField,
  TextareaField,
} from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import type { DashboardPreferences, ThemeMode, UILanguage } from '../types'

export function SettingsPage() {
  const {
    company,
    supportedLanguages,
    pricingPlans,
    balance,
    dashboardPreferences,
    themeMode,
    uiLanguage,
    saveCompanyProfile,
    saveInvitationSettings,
    saveInterfacePreferences,
    saveDashboardPreferences,
    simulateDangerAction,
    showToast,
    t,
  } = usePrototype()
  const [adminName, setAdminName] = useState(company.adminName)
  const [adminEmail, setAdminEmail] = useState(company.adminEmail)
  const [inviteBehavior, setInviteBehavior] = useState(company.invitationBehavior)
  const [inviteControls, setInviteControls] = useState(company.inviteLinkControls)
  const [theme, setTheme] = useState<ThemeMode>(themeMode)
  const [language, setLanguage] = useState<UILanguage>(uiLanguage)
  const [visibility, setVisibility] = useState<DashboardPreferences>(dashboardPreferences)
  const [dangerOpen, setDangerOpen] = useState(false)
  const currentPlan = pricingPlans.find((plan) => plan.id === balance.planId) ?? pricingPlans[0]

  return (
    <div className="page-stack">
      <PageHeader title={t('navSettings')} description={t('settingsDescription')} />

      <section className="settings-grid settings-grid-expanded">
        <Card title={t('accountSettings')} subtitle="Admin account access">
          <div className="form-grid two-col">
            <InputField label={t('adminName')} value={adminName} onChange={(event) => setAdminName(event.target.value)} />
            <InputField label={t('adminEmail')} type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} />
          </div>
          <div className="form-actions align-start">
            <Button onClick={() => saveCompanyProfile({ adminName, adminEmail })}>{t('save')}</Button>
            <Button variant="secondary" onClick={() => showToast('Password reset', 'Password reset flow is represented in the prototype.', 'info')}>
              {t('sendPasswordReset')}
            </Button>
          </div>
        </Card>

        <Card title={t('themeSettings')} subtitle="Light is primary, dark is available">
          <div className="form-grid single-col">
            <SegmentedControl
              value={theme}
              onChange={setTheme}
              options={[
                { label: t('lightMode'), value: 'light' },
                { label: t('darkMode'), value: 'dark' },
              ]}
            />
          </div>
          <div className="form-actions align-start">
            <Button onClick={() => saveInterfacePreferences({ language, theme })}>{t('save')}</Button>
          </div>
        </Card>

        <Card title={t('languageSettings')} subtitle={t('localizationReady')}>
          <div className="form-grid two-col">
            <SelectField label={t('language')} value={language} onChange={(event) => setLanguage(event.target.value as UILanguage)}>
              {supportedLanguages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.nativeLabel}
                </option>
              ))}
            </SelectField>
            <InputField label="Direction" value={supportedLanguages.find((item) => item.code === language)?.dir.toUpperCase() ?? 'LTR'} readOnly />
          </div>
          <div className="language-option-grid settings-language-grid">
            {supportedLanguages.map((item) => (
              <button key={item.code} type="button" className={item.code === language ? 'language-option language-option-active' : 'language-option'} onClick={() => setLanguage(item.code)}>
                <strong>{item.nativeLabel}</strong>
                <span>{item.label}</span>
                <Badge tone={item.dir === 'rtl' ? 'warning' : 'info'}>{item.dir.toUpperCase()}</Badge>
              </button>
            ))}
          </div>
          <div className="form-actions align-start">
            <Button onClick={() => saveInterfacePreferences({ language, theme })}>{t('save')}</Button>
          </div>
        </Card>

        <Card title="Commercial setup" subtitle="Read-only pricing direction for the prototype">
          <div className="summary-list compact-summary-list">
            <div className="summary-row compact-row">
              <span className="row-title">{t('currentPlan')}</span>
              <span className="row-meta">{currentPlan.name}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">Pricing</span>
              <span className="row-meta">{currentPlan.priceLabel}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">Credits</span>
              <span className="row-meta">{balance.creditModel}</span>
            </div>
          </div>
        </Card>

        <Card title={t('invitationSettings')} subtitle="Employee mobile invite flow">
          <div className="form-grid single-col">
            <SelectField label="Invitation behavior" value={inviteBehavior} onChange={(event) => setInviteBehavior(event.target.value)}>
              <option>Email + secure mobile invite link</option>
              <option>Copy invite link first</option>
              <option>Mobile link only</option>
            </SelectField>
            <TextareaField label="Link sharing controls" rows={4} value={inviteControls} onChange={(event) => setInviteControls(event.target.value)} />
          </div>
          <div className="form-actions align-start">
            <Button onClick={() => saveInvitationSettings({ invitationBehavior: inviteBehavior, inviteLinkControls: inviteControls })}>{t('save')}</Button>
          </div>
        </Card>

        <Card title={t('featureVisibility')} subtitle="Overview summary blocks and plan visibility">
          <div className="form-grid single-col">
            <CheckboxField
              checked={visibility.showModuleBreakdown}
              onChange={(checked) => setVisibility((current) => ({ ...current, showModuleBreakdown: checked }))}
              label="Show module breakdown on overview"
            />
            <CheckboxField
              checked={visibility.showEmployeeSummary}
              onChange={(checked) => setVisibility((current) => ({ ...current, showEmployeeSummary: checked }))}
              label="Show employee summary on overview"
            />
            <CheckboxField
              checked={visibility.showRiskSummary}
              onChange={(checked) => setVisibility((current) => ({ ...current, showRiskSummary: checked }))}
              label="Show risk summary on overview"
            />
            <CheckboxField
              checked={visibility.showPlanSummary}
              onChange={(checked) => setVisibility((current) => ({ ...current, showPlanSummary: checked }))}
              label="Show pricing and balance summary on overview"
            />
          </div>
          <div className="form-actions align-start">
            <Button onClick={() => saveDashboardPreferences(visibility)}>{t('save')}</Button>
          </div>
        </Card>

        <Card title={t('dangerZone')} subtitle="Destructive action" className="danger-card">
          <div className="danger-row">
            <div>
              <div className="row-title">Delete business account</div>
              <div className="row-meta">This is a frontend confirmation flow only.</div>
            </div>
            <Button variant="danger" onClick={() => setDangerOpen(true)}>
              {t('deleteAccount')}
            </Button>
          </div>
        </Card>
      </section>

      <Modal
        open={dangerOpen}
        onClose={() => setDangerOpen(false)}
        title="Delete business account"
        description="This action is simulated in the prototype."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDangerOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                simulateDangerAction('delete-account')
                setDangerOpen(false)
              }}
            >
              {t('deleteAccount')}
            </Button>
          </>
        }
      >
        <div className="delete-confirm-copy">
          <div>{company.companyName}</div>
          <div className="subtle-copy">Delete confirmation state only.</div>
        </div>
      </Modal>
    </div>
  )
}
