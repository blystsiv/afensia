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
import { formatCurrency, formatNumber } from '../lib/format'
import type { DashboardPreferences, ThemeMode, UILanguage } from '../types'

export function SettingsPage() {
  const {
    company,
    supportedLanguages,
    usageTiers,
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
  const currentUsageTier = usageTiers.find((tier) => tier.id === balance.usageTierId) ?? usageTiers[0]

  return (
    <div className="page-stack">
      <PageHeader title={t('navSettings')} description={t('settingsDescription')} />

      <section className="settings-grid settings-grid-expanded">
        <Card title={t('accountSettings')} subtitle="Admin access">
          <div className="form-grid two-col">
            <InputField label={t('adminName')} value={adminName} onChange={(event) => setAdminName(event.target.value)} />
            <InputField label={t('adminEmail')} type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} />
          </div>
          <div className="form-actions align-start compact-actions">
            <Button onClick={() => saveCompanyProfile({ adminName, adminEmail })}>{t('save')}</Button>
            <Button variant="secondary" onClick={() => showToast('Password reset', 'Reset flow shown in prototype.', 'info')}>
              {t('sendPasswordReset')}
            </Button>
          </div>
        </Card>

        <Card title={t('themeSettings')} subtitle="Light and dark">
          <SegmentedControl
            value={theme}
            onChange={setTheme}
            options={[
              { label: t('lightMode'), value: 'light' },
              { label: t('darkMode'), value: 'dark' },
            ]}
          />
          <div className="form-actions align-start compact-actions">
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
          <div className="form-actions align-start compact-actions">
            <Button onClick={() => saveInterfacePreferences({ language, theme })}>{t('save')}</Button>
          </div>
        </Card>

        <Card title={t('pricingSummary')} subtitle="Usage-based account model">
          <div className="summary-list compact-summary-list">
            <div className="summary-row compact-row">
              <span className="row-title">{t('workspaceFee')}</span>
              <span className="row-meta">{formatCurrency(balance.workspaceFee, balance.currency)}</span>
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
              <span className="row-title">{t('creditsUsed')}</span>
              <span className="row-meta">{formatNumber(balance.usedCredits)}</span>
            </div>
          </div>
        </Card>

        <Card title={t('invitationSettings')} subtitle="Mobile invite flow">
          <div className="form-grid single-col">
            <SelectField label="Invitation behavior" value={inviteBehavior} onChange={(event) => setInviteBehavior(event.target.value)}>
              <option>Email + secure mobile invite link</option>
              <option>Copy invite link first</option>
              <option>Mobile link only</option>
            </SelectField>
            <TextareaField label="Link sharing controls" rows={4} value={inviteControls} onChange={(event) => setInviteControls(event.target.value)} />
          </div>
          <div className="form-actions align-start compact-actions">
            <Button onClick={() => saveInvitationSettings({ invitationBehavior: inviteBehavior, inviteLinkControls: inviteControls })}>{t('save')}</Button>
          </div>
        </Card>

        <Card title={t('featureVisibility')} subtitle="Overview blocks">
          <div className="form-grid single-col">
            <CheckboxField checked={visibility.showModuleBreakdown} onChange={(checked) => setVisibility((current) => ({ ...current, showModuleBreakdown: checked }))} label="Show module breakdown" />
            <CheckboxField checked={visibility.showEmployeeSummary} onChange={(checked) => setVisibility((current) => ({ ...current, showEmployeeSummary: checked }))} label="Show employee summary" />
            <CheckboxField checked={visibility.showRiskSummary} onChange={(checked) => setVisibility((current) => ({ ...current, showRiskSummary: checked }))} label="Show risk summary" />
            <CheckboxField checked={visibility.showUsageSummary} onChange={(checked) => setVisibility((current) => ({ ...current, showUsageSummary: checked }))} label="Show pricing summary" />
          </div>
          <div className="form-actions align-start compact-actions">
            <Button onClick={() => saveDashboardPreferences(visibility)}>{t('save')}</Button>
          </div>
        </Card>

        <Card title={t('dangerZone')} subtitle="Destructive action" className="danger-card">
          <div className="danger-row">
            <div>
              <div className="row-title">Delete business account</div>
              <div className="row-meta">Prototype confirmation only.</div>
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
