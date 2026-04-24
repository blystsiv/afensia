import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
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
  const navigate = useNavigate()
  const {
    company,
    supportedLanguages,
    balance,
    dashboardPreferences,
    themeMode,
    uiLanguage,
    saveCompanyProfile,
    saveInvitationSettings,
    saveInterfacePreferences,
    saveDashboardPreferences,
    simulateDangerAction,
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
            <Button variant="secondary" onClick={() => navigate('/forgot-password')}>
              {t('sendResetLink')}
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
          <div className="form-grid single-col">
            <SelectField label={t('language')} value={language} onChange={(event) => setLanguage(event.target.value as UILanguage)}>
              {supportedLanguages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.nativeLabel}
                </option>
              ))}
            </SelectField>
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
              <span className="row-title">{t('creditRate')}</span>
              <span className="row-meta">{formatCurrency(balance.creditUnitPrice, balance.currency)} / credit</span>
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

        <Card title={t('invitationSettings')} subtitle="Email invite flow">
          <div className="form-grid single-col">
            <SelectField label="Invitation behavior" value={inviteBehavior} onChange={(event) => setInviteBehavior(event.target.value)}>
              <option>Send email invite automatically</option>
              <option>Review email invite before sending</option>
              <option>Email invite only</option>
            </SelectField>
            <TextareaField label="Invite controls" rows={4} value={inviteControls} onChange={(event) => setInviteControls(event.target.value)} />
          </div>
          <div className="form-actions align-start compact-actions">
            <Button onClick={() => saveInvitationSettings({ invitationBehavior: inviteBehavior, inviteLinkControls: inviteControls })}>{t('save')}</Button>
          </div>
        </Card>

        <Card title={t('featureVisibility')} subtitle="Overview blocks">
          <div className="form-grid single-col">
            <CheckboxField checked={visibility.showModuleBreakdown} onChange={(checked) => setVisibility((current) => ({ ...current, showModuleBreakdown: checked }))} label="Show module breakdown" />
            <CheckboxField checked={visibility.showEmployeeSummary} onChange={(checked) => setVisibility((current) => ({ ...current, showEmployeeSummary: checked }))} label="Show employee summary" />
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
