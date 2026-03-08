import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, InputField, PageHeader, SegmentedControl, SelectField } from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { createInviteLink } from '../lib/format'
import type { OnboardingDraft } from '../types'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { onboardingDraft, completeOnboarding, supportedLanguages, modules, usageTiers, copyInviteValue, t } = usePrototype()
  const [step, setStep] = useState(0)
  const [inviteInput, setInviteInput] = useState('')
  const [draft, setDraft] = useState<OnboardingDraft>(onboardingDraft)

  const steps = [
    t('onboardingWelcome'),
    t('onboardingFeatures'),
    t('onboardingCompany'),
    t('onboardingInvite'),
    t('onboardingPreferences'),
    t('onboardingFinish'),
  ]

  const inviteLink = useMemo(
    () => draft.inviteLink || createInviteLink(draft.companyName || 'afensia-business'),
    [draft.companyName, draft.inviteLink],
  )
  const selectedUsageTier = usageTiers.find((tier) => tier.id === draft.selectedUsageTier) ?? usageTiers[0]
  const featuredModules = modules.slice(0, 6)
  const themeLabel = draft.theme === 'light' ? t('lightMode') : t('darkMode')

  const addInvite = () => {
    const email = inviteInput.trim().toLowerCase()
    if (!email || draft.invitedEmails.includes(email)) {
      return
    }

    setDraft((current) => ({ ...current, invitedEmails: [...current.invitedEmails, email] }))
    setInviteInput('')
  }

  const nextStep = () => {
    if (step === steps.length - 1) {
      completeOnboarding({ ...draft, inviteLink })
      navigate('/app/overview')
      return
    }

    setStep((current) => current + 1)
  }

  const previousStep = () => {
    if (step === 0) {
      navigate('/signin')
      return
    }

    setStep((current) => current - 1)
  }

  return (
    <div className="onboarding-layout onboarding-layout-refined">
      <Card className="onboarding-card onboarding-card-expanded onboarding-shell-card">
        <div className="onboarding-shell-grid">
          <aside className="onboarding-rail">
            <div className="onboarding-rail-top">
              <Badge tone="info">Afensia setup</Badge>
              <h2>{t('onboardingTitle')}</h2>
              <p>{t('onboardingPlanSubtitle')}</p>
            </div>
            <div className="onboarding-step-list">
              {steps.map((label, index) => (
                <div key={label} className={index === step ? 'onboarding-step-chip onboarding-step-chip-active' : 'onboarding-step-chip'}>
                  <span>{index + 1}</span>
                  <strong>{label}</strong>
                </div>
              ))}
            </div>
            <div className="onboarding-rail-summary">
              <div className="summary-block">
                <span>{t('usageTier')}</span>
                <strong>{selectedUsageTier.name}</strong>
              </div>
              <div className="summary-block">
                <span>{t('language')}</span>
                <strong>{supportedLanguages.find((language) => language.code === draft.language)?.nativeLabel}</strong>
              </div>
              <div className="summary-block">
                <span>{t('theme')}</span>
                <strong>{themeLabel}</strong>
              </div>
              <div className="summary-block">
                <span>{t('inviteEmployee')}</span>
                <strong>{draft.invitedEmails.length}</strong>
              </div>
            </div>
          </aside>

          <div className="onboarding-main">
            <PageHeader title={steps[step]} description={t('onboardingStep', { current: step + 1, total: steps.length })} />

            {step === 0 ? (
              <div className="onboarding-step-layout onboarding-welcome-panel">
                <div className="welcome-hero-card">
                  <h2>{t('onboardingWelcome')}</h2>
                  <div className="welcome-list">
                    <div>{t('onboardingWelcomeLine1')}</div>
                    <div>{t('onboardingWelcomeLine2')}</div>
                    <div>{t('onboardingWelcomeLine3')}</div>
                    <div>{t('onboardingWelcomeLine4')}</div>
                  </div>
                </div>
                <div className="welcome-side-grid">
                  <div className="mini-highlight-card accent-card-blue">
                    <span>{t('workspaceFee')}</span>
                    <strong>$290 / month</strong>
                  </div>
                  <div className="mini-highlight-card accent-card-green">
                    <span>{t('usageTier')}</span>
                    <strong>{selectedUsageTier.name}</strong>
                  </div>
                  <div className="mini-highlight-card accent-card-orange">
                    <span>{t('navEmployees')}</span>
                    <strong>Mobile invite only</strong>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="page-stack compact-stack">
                <div className="feature-grid feature-grid-wide feature-grid-colored compact-feature-grid">
                  {featuredModules.map((module) => (
                    <div key={module.id} className="feature-tile feature-tile-colored compact-feature-tile">
                      <div className="feature-tile-head">
                        <strong>{module.name}</strong>
                        <Badge tone={module.status === 'Included' ? 'success' : module.status === 'Add-on' ? 'warning' : 'info'}>
                          {module.status}
                        </Badge>
                      </div>
                      <div className="module-pricing-line compact-module-pricing-line">
                        <span>{module.priceLabel}</span>
                        <span>{module.usageLabel}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="usage-tier-grid usage-tier-grid-compact">
                  {usageTiers.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      className={tier.id === draft.selectedUsageTier ? 'usage-tier-card usage-tier-card-active' : 'usage-tier-card'}
                      onClick={() => setDraft((current) => ({ ...current, selectedUsageTier: tier.id }))}
                    >
                      <div className="usage-tier-topline">
                        <strong>{tier.name}</strong>
                        {tier.highlight ? <Badge tone="info">Most used</Badge> : null}
                      </div>
                      <div className="usage-tier-price">{tier.priceLabel}</div>
                      <div className="row-meta">{tier.billingNote}</div>
                      <div className="usage-tier-foot">{tier.bestFor}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="onboarding-step-layout onboarding-form-layout">
                <div className="form-grid two-col">
                  <InputField label={t('companyName')} value={draft.companyName} onChange={(event) => setDraft((current) => ({ ...current, companyName: event.target.value }))} />
                  <InputField label={t('industry')} value={draft.industry} onChange={(event) => setDraft((current) => ({ ...current, industry: event.target.value }))} />
                  <SelectField label={t('teamSize')} value={draft.teamSize} onChange={(event) => setDraft((current) => ({ ...current, teamSize: event.target.value }))}>
                    <option>1-10 employees</option>
                    <option>11-50 employees</option>
                    <option>51-200 employees</option>
                    <option>201-500 employees</option>
                    <option>500+ employees</option>
                  </SelectField>
                  <InputField label={t('countryRegion')} value={draft.countryRegion} onChange={(event) => setDraft((current) => ({ ...current, countryRegion: event.target.value }))} />
                  <InputField label={t('website')} value={draft.website} onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))} />
                  <InputField label={t('linkedIn')} value={draft.linkedIn} onChange={(event) => setDraft((current) => ({ ...current, linkedIn: event.target.value }))} />
                </div>
                <Card className="setup-side-card" title="Profile" subtitle="Used for account setup">
                  <div className="summary-list compact-summary-list">
                    <div className="summary-row compact-row">
                      <span className="row-title">Region</span>
                      <span className="row-meta">Used for locale and account context.</span>
                    </div>
                    <div className="summary-row compact-row">
                      <span className="row-title">Company links</span>
                      <span className="row-meta">Used for account review.</span>
                    </div>
                  </div>
                </Card>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="page-stack compact-stack">
                <div className="invite-toolbar invite-toolbar-refined">
                  <InputField label="Employee email" value={inviteInput} onChange={(event) => setInviteInput(event.target.value)} placeholder="employee@company.com" />
                  <Button variant="secondary" onClick={addInvite}>
                    Add
                  </Button>
                </div>
                <Card className="invite-flow-card" title={t('inviteEmployee')} subtitle={t('employeesJoinMobile')}>
                  <div className="invite-link-row invite-link-row-refined">
                    <div className="invite-link-stack">
                      <span className="field-label">Invite link</span>
                      <div className="inline-code">{inviteLink}</div>
                      <span className="field-hint">{t('onboardingInviteHint')}</span>
                    </div>
                    <div className="button-row">
                      <Button variant="secondary" onClick={() => setDraft((current) => ({ ...current, inviteLink: createInviteLink(`${current.companyName}-${Date.now()}`) }))}>
                        {t('generateLink')}
                      </Button>
                      <Button variant="ghost" onClick={() => copyInviteValue(inviteLink)}>
                        {t('copyLink')}
                      </Button>
                    </div>
                  </div>
                  <div className="invite-list invite-list-rich">
                    {draft.invitedEmails.length ? (
                      draft.invitedEmails.map((email) => (
                        <div key={email} className="invite-row">
                          <span>{email}</span>
                          <button type="button" className="text-link" onClick={() => setDraft((current) => ({ ...current, invitedEmails: current.invitedEmails.filter((entry) => entry !== email) }))}>
                            {t('remove')}
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="empty-inline-state">No employees added yet.</div>
                    )}
                  </div>
                  <button type="button" className="text-link" onClick={() => setStep(4)}>
                    {t('onboardingSkip')}
                  </button>
                </Card>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="onboarding-step-layout onboarding-form-layout">
                <Card title={t('theme')} subtitle="Applies to the console">
                  <SegmentedControl
                    value={draft.theme}
                    onChange={(value) => setDraft((current) => ({ ...current, theme: value }))}
                    options={[
                      { label: t('lightMode'), value: 'light' },
                      { label: t('darkMode'), value: 'dark' },
                    ]}
                  />
                </Card>
                <Card title={t('language')} subtitle="All requested languages are available">
                  <div className="language-option-grid">
                    {supportedLanguages.map((language) => (
                      <button key={language.code} type="button" className={language.code === draft.language ? 'language-option language-option-active' : 'language-option'} onClick={() => setDraft((current) => ({ ...current, language: language.code }))}>
                        <strong>{language.nativeLabel}</strong>
                        <span>{language.label}</span>
                        <Badge tone={language.dir === 'rtl' ? 'warning' : 'info'}>{language.dir.toUpperCase()}</Badge>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="onboarding-step-layout onboarding-finish-layout">
                <div className="finish-hero-card">
                  <h2>{t('onboardingFinishTitle')}</h2>
                  <div className="summary-list compact-summary-list">
                    <div>{t('onboardingAccountReady')}</div>
                    <div>{draft.companyName}</div>
                    <div>{t('onboardingEmployeesInvited', { count: draft.invitedEmails.length })}</div>
                    <div>{t('onboardingSelectedTheme', { value: themeLabel })}</div>
                    <div>{t('onboardingSelectedLanguage', { value: supportedLanguages.find((item) => item.code === draft.language)?.nativeLabel ?? draft.language })}</div>
                  </div>
                </div>
                <Card className="setup-side-card" title="Pricing" subtitle="Selected usage model">
                  <div className="summary-list compact-summary-list">
                    <div className="summary-row compact-row">
                      <span className="row-title">{t('usageTier')}</span>
                      <span className="row-meta">{selectedUsageTier.name}</span>
                    </div>
                    <div className="summary-row compact-row">
                      <span className="row-title">{t('pricingSummary')}</span>
                      <span className="row-meta">{selectedUsageTier.priceLabel}</span>
                    </div>
                  </div>
                </Card>
              </div>
            ) : null}

            <div className="form-actions onboarding-actions">
              <Button variant="ghost" onClick={previousStep}>
                {step === 0 ? 'Back to sign in' : t('back')}
              </Button>
              <Button onClick={nextStep}>{step === steps.length - 1 ? t('goToDashboard') : t('continue')}</Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
