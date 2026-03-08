import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StripePreviewModal } from '../components/stripePreviewModal'
import { Badge, Button, Card, InputField, PageHeader, SegmentedControl, SelectField } from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { createInviteLink, formatCurrency } from '../lib/format'
import type { OnboardingDraft, SecurityModule, UsageTierId } from '../types'

type BillingMode = 'auto-top-up' | 'manual-top-up' | 'monthly-invoice'

export function OnboardingPage() {
  const navigate = useNavigate()
  const { onboardingDraft, completeOnboarding, supportedLanguages, modules, usageTiers, balance, copyInviteValue, themeMode, t } = usePrototype()
  const [step, setStep] = useState(0)
  const [inviteInput, setInviteInput] = useState('')
  const [draft, setDraft] = useState<OnboardingDraft>(onboardingDraft)
  const [billingMode, setBillingMode] = useState<BillingMode>('auto-top-up')
  const [paymentPreviewOpen, setPaymentPreviewOpen] = useState(false)

  const steps = [
    t('onboardingWelcome'),
    t('onboardingFeatures'),
    t('onboardingPayment'),
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
  const sampleModules = useMemo(
    () =>
      modules.filter((module) =>
        ['link-scanner', 'call-watchdog', 'document-verification', 'deepfake-detection'].includes(module.id),
      ),
    [modules],
  )
  const enabledModulesCount = useMemo(() => modules.filter((module) => module.enabled).length, [modules])
  const themeLabel = draft.theme === 'light' ? t('lightMode') : t('darkMode')
  const selectedLanguageLabel = supportedLanguages.find((language) => language.code === draft.language)?.nativeLabel ?? draft.language
  const selectedUsageIndex = Math.max(0, usageTiers.findIndex((tier) => tier.id === draft.selectedUsageTier))
  const usageProgress = usageTiers.length > 1 ? (selectedUsageIndex / (usageTiers.length - 1)) * 100 : 0
  const paymentModeLabel = billingMode === 'auto-top-up' ? t('autoTopUp') : billingMode === 'manual-top-up' ? t('manualTopUp') : t('monthlyInvoice')
  const selectedRate = selectedUsageTier.creditRate ?? balance.creditUnitPrice
  const tierFeatures: Record<UsageTierId, string[]> = {
    entry: ['1,000 checks included', `${formatCurrency(0.32, balance.currency)} per credit`, 'Best for smaller teams'],
    growth: ['2,500 checks included', `${formatCurrency(0.29, balance.currency)} per credit`, 'Good for initial rollout'],
    team: ['5,000 checks included', `${formatCurrency(0.27, balance.currency)} per credit`, 'Recommended for active teams'],
    high: ['10,000 checks included', `${formatCurrency(0.25, balance.currency)} per credit`, 'Better for multi-location usage'],
    scale: ['10,000+ checks', `${formatCurrency(0.23, balance.currency)} blended rate`, 'Custom rollout and support'],
  }
  const onboardingReviews = [
    {
      quote: 'Link Scanner became the default check before opening supplier URLs.',
      author: 'Regional operations lead',
    },
    {
      quote: 'Document Verification cut manual review time for compliance teams.',
      author: 'Business admin pilot',
    },
    {
      quote: 'Credit pricing made rollout easier to forecast across locations.',
      author: 'Finance manager',
    },
  ]

  const getTierLabel = (tierId: UsageTierId) => {
    if (tierId === 'entry') {
      return 'Starter'
    }

    if (tierId === 'growth') {
      return 'Growth'
    }

    if (tierId === 'team') {
      return 'Team'
    }

    if (tierId === 'high') {
      return 'Volume'
    }

    return 'Scale'
  }

  const getModuleExampleCost = (module: SecurityModule) => {
    if (module.creditCost === null) {
      return 'Pricing later'
    }

    if (module.creditCost === 0) {
      return 'Included'
    }

    return `${formatCurrency(module.creditCost * selectedRate, balance.currency)} / ${module.billingUnit}`
  }

  useEffect(() => {
    document.documentElement.dataset.theme = draft.theme

    return () => {
      document.documentElement.dataset.theme = themeMode
    }
  }, [draft.theme, themeMode])

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
                <strong>{selectedLanguageLabel}</strong>
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
                    <span>{t('pricingSummary')}</span>
                    <strong>Volume-based credits</strong>
                  </div>
                  <div className="mini-highlight-card accent-card-orange">
                    <span>{t('navEmployees')}</span>
                    <strong>Invite here, join on mobile</strong>
                  </div>
                  <div className="mini-highlight-card accent-card-blue">
                    <span>{t('navModules')}</span>
                    <strong>{enabledModulesCount} active modules</strong>
                  </div>
                </div>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="page-stack compact-stack">
                <div className="volume-selector-shell">
                  <div className="volume-selector-copy">
                    <h3>{t('onboardingVolumeQuestion')}</h3>
                    <p>{t('onboardingVolumeHelper')}</p>
                  </div>
                  <div className="volume-scale">
                    <div className="volume-scale-labels">
                      {usageTiers.map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          className={tier.id === draft.selectedUsageTier ? 'volume-scale-label volume-scale-label-active' : 'volume-scale-label'}
                          onClick={() => setDraft((current) => ({ ...current, selectedUsageTier: tier.id }))}
                        >
                          {tier.name}
                        </button>
                      ))}
                    </div>
                    <div className="volume-scale-track" aria-hidden="true">
                      <span className="volume-scale-line" />
                      <span className="volume-scale-progress" style={{ width: `${usageProgress}%` }} />
                      {usageTiers.map((tier, index) => (
                        <button
                          key={tier.id}
                          type="button"
                          className={tier.id === draft.selectedUsageTier ? 'volume-scale-dot volume-scale-dot-active' : 'volume-scale-dot'}
                          style={{ left: `${(index / Math.max(usageTiers.length - 1, 1)) * 100}%` }}
                          onClick={() => setDraft((current) => ({ ...current, selectedUsageTier: tier.id }))}
                          aria-label={tier.name}
                        />
                      ))}
                    </div>
                    <div className="volume-scale-selection">{selectedUsageTier.name}</div>
                  </div>
                </div>

                <div className="pricing-card-grid">
                  {usageTiers.map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      className={tier.id === draft.selectedUsageTier ? 'pricing-tier-card pricing-tier-card-active' : 'pricing-tier-card'}
                      onClick={() => setDraft((current) => ({ ...current, selectedUsageTier: tier.id }))}
                    >
                      <div className="pricing-tier-top">
                        <div>
                          <div className="pricing-tier-name">{getTierLabel(tier.id)}</div>
                          <div className="pricing-tier-volume">{tier.name}</div>
                        </div>
                        {tier.highlight ? <Badge tone="info">Recommended</Badge> : null}
                      </div>
                      <div className="pricing-tier-price">{tier.priceLabel}</div>
                      <div className="pricing-tier-note">{tier.billingNote}</div>
                      <div className="pricing-tier-list">
                        {tierFeatures[tier.id].map((item) => (
                          <div key={item} className="pricing-tier-list-item">
                            {item}
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                <Card title={t('pricingSummary')} subtitle="Selected volume and effective rate">
                  <div className="pricing-strip">
                    <div className="pricing-strip-item">
                      <span className="meta-label">Volume</span>
                      <strong>{selectedUsageTier.name}</strong>
                    </div>
                    <div className="pricing-strip-item">
                      <span className="meta-label">Estimated prepaid amount</span>
                      <strong>{selectedUsageTier.priceLabel}</strong>
                    </div>
                    <div className="pricing-strip-item">
                      <span className="meta-label">Effective rate</span>
                      <strong>{selectedUsageTier.billingNote}</strong>
                    </div>
                    <div className="pricing-strip-item">
                      <span className="meta-label">Best for</span>
                      <strong>{selectedUsageTier.bestFor}</strong>
                    </div>
                  </div>
                </Card>

                <div className="module-section-grid">
                  <Card title={t('onboardingPricingExamples')} subtitle={t('onboardingPricingChangeLater')}>
                    <div className="module-credit-grid">
                      {sampleModules.map((module) => (
                        <div key={module.id} className="module-credit-card">
                          <strong>{module.name}</strong>
                          <span>{module.usageLabel}</span>
                          <span>{getModuleExampleCost(module)}</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card title={t('onboardingReviewsTitle')} subtitle={t('onboardingReviewsSubtitle')}>
                    <div className="review-grid">
                      {onboardingReviews.map((review) => (
                        <div key={review.quote} className="review-card">
                          <p className="review-quote">{review.quote}</p>
                          <span className="review-meta">{review.author}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="onboarding-step-layout onboarding-form-layout">
                <Card title={t('onboardingPaymentTitle')} subtitle={t('onboardingPaymentSubtitle')}>
                  <div className="billing-setup-grid">
                    <div className="billing-provider-banner">
                      <div className="billing-provider-copy">
                        <div className="billing-provider-top">
                          <Badge tone="info">Stripe</Badge>
                          <span className="meta-label">Preview only</span>
                        </div>
                        <strong>Visa ending 4242</strong>
                        <span className="field-hint">{t('onboardingPaymentLater')}</span>
                      </div>
                      <Button variant="secondary" onClick={() => setPaymentPreviewOpen(true)}>
                        {t('previewStripeCheckout')}
                      </Button>
                    </div>

                    <div className="billing-mode-section">
                      <div className="billing-section-head">
                        <strong>{t('paymentMode')}</strong>
                        <span className="field-hint">Choose how credits refill after launch.</span>
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
                  </div>
                </Card>

                <Card className="setup-side-card" title={t('pricingSummary')} subtitle="Estimated monthly start">
                  <div className="summary-list compact-summary-list">
                    <div className="summary-row compact-row">
                      <span className="row-title">{t('workspaceFee')}</span>
                      <span className="row-meta">{formatCurrency(balance.workspaceFee, balance.currency)} / month</span>
                    </div>
                    <div className="summary-row compact-row">
                      <span className="row-title">{t('usageTier')}</span>
                      <span className="row-meta">{selectedUsageTier.name}</span>
                    </div>
                    <div className="summary-row compact-row">
                      <span className="row-title">Estimated usage</span>
                      <span className="row-meta">{selectedUsageTier.priceLabel}</span>
                    </div>
                    <div className="summary-row compact-row">
                      <span className="row-title">{t('creditRate')}</span>
                      <span className="row-meta">{formatCurrency(selectedRate, balance.currency)} / credit</span>
                    </div>
                    <div className="summary-row compact-row">
                      <span className="row-title">{t('paymentMode')}</span>
                      <span className="row-meta">{paymentModeLabel}</span>
                    </div>
                  </div>
                </Card>
              </div>
            ) : null}

            {step === 3 ? (
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

            {step === 4 ? (
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
                  <button type="button" className="text-link" onClick={() => setStep(5)}>
                    {t('onboardingSkip')}
                  </button>
                </Card>
              </div>
            ) : null}

            {step === 5 ? (
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
                <Card title={t('language')} subtitle="Arabic switches RTL automatically.">
                  <SelectField label={t('language')} value={draft.language} onChange={(event) => setDraft((current) => ({ ...current, language: event.target.value as OnboardingDraft['language'] }))}>
                    {supportedLanguages.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.nativeLabel}
                      </option>
                    ))}
                  </SelectField>
                </Card>
              </div>
            ) : null}

            {step === 6 ? (
              <div className="onboarding-step-layout onboarding-finish-layout">
                <div className="finish-hero-card">
                  <h2>{t('onboardingFinishTitle')}</h2>
                  <div className="summary-list compact-summary-list">
                    <div>{t('onboardingAccountReady')}</div>
                    <div>{draft.companyName}</div>
                    <div>{t('onboardingEmployeesInvited', { count: draft.invitedEmails.length })}</div>
                    <div>{t('onboardingSelectedTheme', { value: themeLabel })}</div>
                    <div>{t('onboardingSelectedLanguage', { value: selectedLanguageLabel })}</div>
                  </div>
                </div>
                <Card className="setup-side-card" title="Pricing" subtitle="Selected billing setup">
                  <div className="summary-list compact-summary-list">
                    <div className="summary-row compact-row">
                      <span className="row-title">{t('usageTier')}</span>
                      <span className="row-meta">{selectedUsageTier.name}</span>
                    </div>
                    <div className="summary-row compact-row">
                      <span className="row-title">{t('pricingSummary')}</span>
                      <span className="row-meta">{selectedUsageTier.priceLabel}</span>
                    </div>
                    <div className="summary-row compact-row">
                      <span className="row-title">Estimated usage</span>
                      <span className="row-meta">{selectedUsageTier.priceLabel}</span>
                    </div>
                    <div className="summary-row compact-row">
                      <span className="row-title">{t('creditRate')}</span>
                      <span className="row-meta">{formatCurrency(selectedRate, balance.currency)} / credit</span>
                    </div>
                    <div className="summary-row compact-row">
                      <span className="row-title">{t('paymentMode')}</span>
                      <span className="row-meta">{paymentModeLabel}</span>
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

      <StripePreviewModal
        open={paymentPreviewOpen}
        onClose={() => setPaymentPreviewOpen(false)}
        workspaceFee={`${formatCurrency(balance.workspaceFee, balance.currency)} / month`}
        usageTier={selectedUsageTier.name}
        usagePrice={selectedUsageTier.priceLabel}
        paymentMode={paymentModeLabel}
        creditRate={`${formatCurrency(selectedRate, balance.currency)} / credit`}
      />
    </div>
  )
}
