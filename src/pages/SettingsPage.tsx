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
    activeLanguages,
    futureLanguages,
    dashboardPreferences,
    themeMode,
    uiLanguage,
    saveCompanyProfile,
    saveInvitationSettings,
    saveInterfacePreferences,
    saveDashboardPreferences,
    simulateDangerAction,
    showToast,
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
      <PageHeader title="Settings" description="Account, localization, and console preferences" />

      <section className="settings-grid settings-grid-expanded">
        <Card title="Account settings" subtitle="Admin account access">
          <div className="form-grid two-col">
            <InputField label="Admin name" value={adminName} onChange={(event) => setAdminName(event.target.value)} />
            <InputField label="Admin email" type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} />
          </div>
          <div className="form-actions align-start">
            <Button onClick={() => saveCompanyProfile({ adminName, adminEmail })}>Save account settings</Button>
            <Button
              variant="secondary"
              onClick={() => showToast('Password reset', 'Password reset flow is represented in the prototype.', 'info')}
            >
              Send password reset
            </Button>
          </div>
        </Card>

        <Card title="Theme settings" subtitle="Light mode is the primary experience">
          <div className="form-grid single-col">
            <SegmentedControl
              value={theme}
              onChange={setTheme}
              options={[
                { label: 'Light mode', value: 'light' },
                { label: 'Dark mode', value: 'dark' },
              ]}
            />
          </div>
          <div className="form-actions align-start">
            <Button onClick={() => saveInterfacePreferences({ language, theme })}>Save theme</Button>
          </div>
        </Card>

        <Card title="Language settings" subtitle="Launch-ready and future-ready languages">
          <div className="form-grid two-col">
            <SelectField label="Active language" value={language} onChange={(event) => setLanguage(event.target.value as UILanguage)}>
              {activeLanguages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </SelectField>
            <InputField label="Localization readiness" value="RTL-ready architecture prepared for Arabic" readOnly />
          </div>
          <div className="language-group">
            <div>
              <div className="meta-label">Active languages</div>
              <div className="module-pill-row">
                {activeLanguages.map((item) => (
                  <Badge key={item.code} tone="info">
                    {item.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="meta-label">Available soon</div>
              <div className="module-pill-row">
                {futureLanguages.map((item) => (
                  <Badge key={item.code} tone="neutral">
                    {item.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="form-actions align-start">
            <Button onClick={() => saveInterfacePreferences({ language, theme })}>Save language</Button>
          </div>
        </Card>

        <Card title="Invitation settings" subtitle="Employee mobile invite flow">
          <div className="form-grid single-col">
            <SelectField label="Invitation behavior" value={inviteBehavior} onChange={(event) => setInviteBehavior(event.target.value)}>
              <option>Email + secure mobile invite link</option>
              <option>Copy invite link first</option>
              <option>Mobile link only</option>
            </SelectField>
            <TextareaField
              label="Link sharing controls"
              rows={4}
              value={inviteControls}
              onChange={(event) => setInviteControls(event.target.value)}
            />
          </div>
          <div className="form-actions align-start">
            <Button onClick={() => saveInvitationSettings({ invitationBehavior: inviteBehavior, inviteLinkControls: inviteControls })}>
              Save invitation settings
            </Button>
          </div>
        </Card>

        <Card title="Feature visibility" subtitle="Overview shortcuts and module visibility blocks">
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
          </div>
          <div className="form-actions align-start">
            <Button onClick={() => saveDashboardPreferences(visibility)}>Save visibility preferences</Button>
          </div>
        </Card>

        <Card title="Danger zone" subtitle="Destructive action" className="danger-card">
          <div className="danger-row">
            <div>
              <div className="row-title">Delete business account</div>
              <div className="row-meta">This is a frontend confirmation flow only.</div>
            </div>
            <Button variant="danger" onClick={() => setDangerOpen(true)}>
              Delete account
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
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                simulateDangerAction('delete-account')
                setDangerOpen(false)
              }}
            >
              Confirm delete
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
