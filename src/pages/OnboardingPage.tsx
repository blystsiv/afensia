import { useEffect, useState } from 'react'
import { FileText, LayoutDashboard, Link2, MessageSquareText, Phone, QrCode, ShieldCheck, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, InputField, PageHeader, SegmentedControl, SelectField } from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { formatCurrency } from '../lib/format'
import type { OnboardingDraft, UsageTierId } from '../types'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function parseCurrencyAmount(value: string) {
  const match = value.match(/\$([\d,]+)/)

  if (!match) {
    return null
  }

  return Number(match[1].replaceAll(',', ''))
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const { company, onboardingDraft, completeOnboarding, supportedLanguages, usageTiers, balance, showToast, themeMode, t } = usePrototype()
  const [step, setStep] = useState(0)
  const [inviteInput, setInviteInput] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [draft, setDraft] = useState<OnboardingDraft>(onboardingDraft)

  const steps = [
    t('onboardingWelcome'),
    t('onboardingFeatures'),
    t('onboardingPayment'),
    t('onboardingCompany'),
    t('onboardingInvite'),
    t('onboardingPreferences'),
    t('onboardingFinish'),
  ]

  const selectedUsageTier = usageTiers.find((tier) => tier.id === draft.selectedUsageTier) ?? usageTiers[0]
  const selectedLanguageLabel = supportedLanguages.find((language) => language.code === draft.language)?.nativeLabel ?? draft.language
  const themeLabel = draft.theme === 'light' ? t('lightMode') : t('darkMode')
  const selectedUsageIndex = Math.max(0, usageTiers.findIndex((tier) => tier.id === draft.selectedUsageTier))
  const usageProgress = usageTiers.length > 1 ? (selectedUsageIndex / (usageTiers.length - 1)) * 100 : 0
  const selectedTierAmount = parseCurrencyAmount(selectedUsageTier.priceLabel)
  const dueToday = selectedTierAmount === null ? null : selectedTierAmount + balance.workspaceFee
  const dueTodayLabel = dueToday === null ? 'Custom quote' : formatCurrency(dueToday, balance.currency)
  const selectedPackageLabel = selectedTierAmount === null ? 'Custom pricing' : formatCurrency(selectedTierAmount, balance.currency)
  const usageCapacityLabel = selectedUsageTier.checksIncluded ? `${selectedUsageTier.name} included` : 'Custom monthly capacity'
  const welcomeHighlights = [
    {
      icon: ShieldCheck,
      eyebrow: 'Why we are good',
      title: 'Designed for real employee behavior',
      copy: 'Afensia is built around the risky moments people actually face during work: suspicious links, QR codes, messages, documents, and phone calls.',
    },
    {
      icon: Users,
      eyebrow: 'What we solve',
      title: 'One workflow instead of scattered policies',
      copy: 'Instead of telling staff to remember security rules, we give them one app that helps them verify questionable activity in the moment.',
    },
    {
      icon: LayoutDashboard,
      eyebrow: 'Why it works',
      title: 'Clear admin visibility from day one',
      copy: 'Your team can onboard quickly, invite employees by email, and then manage usage, adoption, and rollout from one business console.',
    },
  ]
  const challengePoints = [
    {
      icon: Link2,
      title: 'Links, messages, calls, and files',
      copy: 'Employees face scams across links, messages, calls, and files, not just one channel.',
    },
    {
      icon: QrCode,
      title: 'Protection that keeps up with work',
      copy: 'Distributed teams need protection that is quick enough to use during daily work.',
    },
    {
      icon: LayoutDashboard,
      title: 'Clean visibility for admins',
      copy: 'Admins need to see rollout progress and invite status without digging through multiple tools.',
    },
  ]
  const appHighlights = [
    {
      icon: Users,
      title: 'Invite by email',
      copy: 'Employees receive an email invite that opens the app and connects them to the right workspace.',
    },
    {
      icon: MessageSquareText,
      title: 'Check suspicious content in the app',
      copy: 'The mobile experience becomes the easy place to check suspicious content before they act on it.',
    },
    {
      icon: LayoutDashboard,
      title: 'Track rollout from the dashboard',
      copy: 'Admins track onboarding progress, package selection, and business-wide usage from the dashboard.',
    },
  ]
  const coverageHighlights = [
    { icon: Link2, label: 'Links' },
    { icon: QrCode, label: 'QR codes' },
    { icon: MessageSquareText, label: 'Messages' },
    { icon: Phone, label: 'Calls' },
    { icon: FileText, label: 'Documents' },
  ]
  const finishNextSteps = [
    {
      title: 'Open the dashboard',
      copy: 'You will land on a guided overview that explains what to monitor first.',
    },
    {
      title: 'Watch pending invites',
      copy: 'Your email invite list stays visible so you can follow up on anyone who has not joined yet.',
    },
    {
      title: 'Adjust later if needed',
      copy: 'Packages, language, and workspace settings can all be refined after launch.',
    },
  ]
  const tierFeatures: Record<UsageTierId, string[]> = {
    entry: ['1,000 checks included', `${formatCurrency(0.32, balance.currency)} per credit`, 'Best for smaller teams'],
    growth: ['2,500 checks included', `${formatCurrency(0.29, balance.currency)} per credit`, 'Good for initial rollout'],
    team: ['5,000 checks included', `${formatCurrency(0.27, balance.currency)} per credit`, 'Recommended for active teams'],
    high: ['10,000 checks included', `${formatCurrency(0.25, balance.currency)} per credit`, 'Better for multi-location usage'],
    scale: ['10,000+ checks', `${formatCurrency(0.23, balance.currency)} blended rate`, 'Custom rollout and support'],
  }

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

  useEffect(() => {
    document.documentElement.dataset.theme = draft.theme

    return () => {
      document.documentElement.dataset.theme = themeMode
    }
  }, [draft.theme, themeMode])

  const addInvite = () => {
    const email = inviteInput.trim().toLowerCase()

    if (!email) {
      setInviteError('Enter an employee email to queue an invite.')
      return
    }

    if (!emailPattern.test(email)) {
      setInviteError('Enter a valid work email address.')
      return
    }

    if (draft.invitedEmails.includes(email)) {
      setInviteError('This employee is already in the pending invite list.')
      return
    }

    setDraft((current) => ({ ...current, invitedEmails: [...current.invitedEmails, email] }))
    setInviteInput('')
    setInviteError('')
  }

  const nextStep = () => {
    if (step === steps.length - 1) {
      completeOnboarding(draft)
      navigate('/app/overview', {
        state: {
          onboardingComplete: true,
          invitedCount: draft.invitedEmails.length,
        },
      })
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
                <div
                  key={label}
                  className={
                    index === step
                      ? 'onboarding-step-chip onboarding-step-chip-active'
                      : index < step
                        ? 'onboarding-step-chip onboarding-step-chip-complete'
                        : 'onboarding-step-chip'
                  }
                >
                  <span>{index < step ? '✓' : index + 1}</span>
                  <strong>{label}</strong>
                </div>
              ))}
            </div>
          </aside>

          <div className="onboarding-main">
            <PageHeader title={steps[step]} description={t('onboardingStep', { current: step + 1, total: steps.length })} />

            {step === 0 ? (
              <div className="onboarding-step-layout onboarding-welcome-panel">
                <section className="welcome-story-card">
                  <div className="welcome-hero-grid">
                    <div className="welcome-hero-copy">
                      <Badge tone="info">Business-first protection</Badge>
                      <div className="welcome-hero-intro">
                        <span className="meta-label">Built for company rollout</span>
                        <h2>Security checks employees will actually use in daily work.</h2>
                        <p className="welcome-support-copy">
                          Afensia helps companies reduce digital risk without slowing teams down. Employees get one app
                          to verify suspicious content before they click, reply, scan, call back, or upload anything
                          risky. Admins get a clear rollout experience from the first invite through adoption and
                          ongoing usage.
                        </p>
                      </div>

                      <div className="welcome-metric-strip">
                        <div className="welcome-metric-card">
                          <strong>1 app</strong>
                          <span>for the risky moments employees already deal with</span>
                        </div>
                        <div className="welcome-metric-card">
                          <strong>5 risk surfaces</strong>
                          <span>links, QR codes, messages, calls, and documents</span>
                        </div>
                        <div className="welcome-metric-card">
                          <strong>1 admin console</strong>
                          <span>for invite status, rollout progress, and adoption</span>
                        </div>
                      </div>

                      <div className="welcome-coverage-strip">
                        {coverageHighlights.map((item) => {
                          const CoverageIcon = item.icon

                          return (
                            <div key={item.label} className="welcome-coverage-pill">
                              <CoverageIcon size={16} />
                              <span>{item.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="welcome-hero-aside">
                      <div className="welcome-section-header">
                        <span className="meta-label">Why companies choose Afensia</span>
                        <h3>Everything important is visible from the first rollout week.</h3>
                      </div>

                      <div className="welcome-highlight-list">
                        {welcomeHighlights.map((item) => {
                          const HighlightIcon = item.icon

                          return (
                            <div key={item.title} className="welcome-highlight-row">
                              <div className="welcome-signal-icon">
                                <HighlightIcon size={17} />
                              </div>
                              <div className="welcome-highlight-copy">
                                <span>{item.eyebrow}</span>
                                <strong>{item.title}</strong>
                                <p>{item.copy}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="welcome-detail-grid">
                  <section className="welcome-proof-card welcome-detail-card">
                    <div className="welcome-section-header">
                      <span className="meta-label">What we are solving</span>
                      <h3>Risk already lives in the channels employees use every day.</h3>
                    </div>

                    <div className="welcome-signal-grid">
                      {challengePoints.map((item) => {
                        const SignalIcon = item.icon

                        return (
                          <div key={item.title} className="welcome-signal-card">
                            <div className="welcome-signal-head">
                              <div className="welcome-signal-icon">
                                <SignalIcon size={17} />
                              </div>
                              <strong>{item.title}</strong>
                            </div>
                            <p>{item.copy}</p>
                          </div>
                        )
                      })}
                    </div>
                  </section>

                  <section className="welcome-proof-card welcome-detail-card">
                    <div className="welcome-section-header">
                      <span className="meta-label">How the app works</span>
                      <h3>Employees get a simple check flow while admins keep rollout control.</h3>
                    </div>

                    <div className="welcome-flow-list">
                      {appHighlights.map((item, index) => {
                        const FlowIcon = item.icon

                        return (
                          <div key={item.title} className="welcome-flow-step">
                            <div className="welcome-flow-step-marker">
                              <div className="welcome-flow-step-number">0{index + 1}</div>
                            </div>
                            <div className="welcome-flow-step-body">
                              <div className="welcome-signal-head">
                                <div className="welcome-signal-icon">
                                  <FlowIcon size={17} />
                                </div>
                                <strong>{item.title}</strong>
                              </div>
                              <p>{item.copy}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
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

              </div>
            ) : null}

            {step === 2 ? (
              <Card className="stripe-checkout-card" title="Checkout with Stripe" subtitle="Use a hosted Stripe payment link to activate your workspace and starting credits.">
                <div className="stripe-checkout-grid">
                  <section className="stripe-checkout-main">
                    <div className="stripe-checkout-top">
                      <div>
                        <Badge tone="info">Stripe</Badge>
                        <h3>{draft.companyName ? `${draft.companyName} checkout` : 'Workspace checkout'}</h3>
                      </div>
                      <span className="field-hint">Hosted payment link</span>
                    </div>

                    <div className="stripe-checkout-section">
                      <div className="billing-section-head">
                        <strong>Select the package to purchase</strong>
                        <span className="field-hint">You can switch packages here without leaving checkout.</span>
                      </div>
                      <div className="credit-pack-grid">
                        {usageTiers.map((tier) => (
                          <button
                            key={tier.id}
                            type="button"
                            className={tier.id === draft.selectedUsageTier ? 'credit-pack-card credit-pack-card-active' : 'credit-pack-card'}
                            onClick={() => setDraft((current) => ({ ...current, selectedUsageTier: tier.id }))}
                          >
                            <div className="pricing-tier-top">
                              <div>
                                <div className="row-title">{getTierLabel(tier.id)}</div>
                                <div className="credit-pack-helper">{tier.name}</div>
                              </div>
                              {tier.highlight ? <Badge tone="info">Popular</Badge> : null}
                            </div>
                            <div className="credit-pack-price">{tier.priceLabel}</div>
                            <div className="credit-pack-helper">{tier.billingNote}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="stripe-checkout-section">
                      <div className="billing-section-head">
                        <strong>Checkout details</strong>
                        <span className="field-hint">This mirrors the information Stripe would collect on the hosted page.</span>
                      </div>
                      <div className="checkout-field-grid">
                        <InputField label="Billing email" type="email" defaultValue={company.adminEmail} placeholder="billing@company.com" />
                        <InputField label="Company name" defaultValue={draft.companyName} placeholder="NorthHill Beverage Group" />
                        <InputField label="Cardholder name" defaultValue={company.adminName} placeholder="Avery Thompson" />
                        <InputField label="Card number" defaultValue="4242 4242 4242 4242" placeholder="4242 4242 4242 4242" />
                        <InputField label="Expiry" defaultValue="12 / 29" placeholder="MM / YY" />
                        <InputField label="CVC" defaultValue="123" placeholder="CVC" />
                      </div>
                    </div>

                    <div className="stripe-checkout-action">
                      <div>
                        <strong>{selectedTierAmount === null ? 'Request a custom quote' : `Due today ${dueTodayLabel}`}</strong>
                        <div className="field-hint">
                          Stripe would charge the workspace fee plus the selected credits package and then email the
                          receipt to your billing contact.
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          showToast(
                            'Stripe payment link',
                            'A hosted Stripe checkout link would open for the selected package in the production flow.',
                            'info',
                          )
                        }
                      >
                        {selectedTierAmount === null ? 'Request quote' : `Open Stripe link for ${dueTodayLabel}`}
                      </Button>
                    </div>
                  </section>

                  <aside className="stripe-checkout-summary">
                    <div className="stripe-checkout-summary-head">
                      <strong>Order summary</strong>
                      <span className="field-hint">Today&apos;s checkout</span>
                    </div>

                    <div className="summary-list compact-summary-list">
                      <div className="summary-row compact-row">
                        <span className="row-title">Workspace access</span>
                        <span className="row-meta">{formatCurrency(balance.workspaceFee, balance.currency)} / month</span>
                      </div>
                      <div className="summary-row compact-row">
                        <span className="row-title">Credits package</span>
                        <span className="row-meta">{selectedPackageLabel}</span>
                      </div>
                      <div className="summary-row compact-row">
                        <span className="row-title">Capacity</span>
                        <span className="row-meta">{usageCapacityLabel}</span>
                      </div>
                      <div className="summary-row compact-row">
                        <span className="row-title">Receipt email</span>
                        <span className="row-meta">{company.adminEmail}</span>
                      </div>
                    </div>

                    <div className="stripe-checkout-total">
                      <span>Total due today</span>
                      <strong>{dueTodayLabel}</strong>
                    </div>

                    <div className="stripe-checkout-note">
                      After payment, the workspace is ready immediately and your queued employee invites stay pending
                      until each user activates access from their email.
                    </div>
                  </aside>
                </div>
              </Card>
            ) : null}

            {step === 3 ? (
              <div className="onboarding-step-layout onboarding-form-layout">
                <Card title="Company profile" subtitle="Only the relevant details we need to create and configure the workspace.">
                  <div className="form-grid two-col">
                    <InputField label={t('companyName')} value={draft.companyName} onChange={(event) => setDraft((current) => ({ ...current, companyName: event.target.value }))} />
                    <InputField label={t('adminEmail')} value={company.adminEmail} readOnly />
                    <InputField label={t('industry')} value={draft.industry} onChange={(event) => setDraft((current) => ({ ...current, industry: event.target.value }))} />
                    <SelectField label={t('teamSize')} value={draft.teamSize} onChange={(event) => setDraft((current) => ({ ...current, teamSize: event.target.value }))}>
                      <option value="" disabled>
                        Select team size
                      </option>
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
                </Card>

                <Card className="setup-side-card" title="Why we ask for this" subtitle="Relevant setup details only">
                  <div className="summary-list compact-summary-list">
                    <div className="summary-row compact-row">
                      <div>
                        <div className="row-title">Workspace identity</div>
                        <div className="row-meta">Company and admin details are used across billing, support, and the console.</div>
                      </div>
                    </div>
                    <div className="summary-row compact-row">
                      <div>
                        <div className="row-title">Regional setup</div>
                        <div className="row-meta">Country and team size help tailor the onboarding and account defaults.</div>
                      </div>
                    </div>
                    <div className="summary-row compact-row">
                      <div>
                        <div className="row-title">Company links</div>
                        <div className="row-meta">Website and LinkedIn stay optional, but they help with workspace review and future support.</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="page-stack compact-stack">
                <Card className="invite-flow-card" title={t('inviteEmployee')} subtitle="Queue employee emails here. The secure app link is sent inside each invite email.">
                  <div className="invite-toolbar invite-toolbar-refined">
                    <InputField
                      label="Employee email"
                      type="email"
                      value={inviteInput}
                      onChange={(event) => {
                        setInviteInput(event.target.value)
                        if (inviteError) {
                          setInviteError('')
                        }
                      }}
                      placeholder="employee@company.com"
                      hint="Each invite email takes the user directly into the app."
                      error={inviteError || undefined}
                    />
                    <Button variant="secondary" onClick={addInvite}>
                      Add
                    </Button>
                  </div>

                  <div className="invite-list invite-list-rich">
                    {draft.invitedEmails.length ? (
                      draft.invitedEmails.map((email) => (
                        <div key={email} className="invite-row invite-row-pending">
                          <div className="invite-person">
                            <div className="row-title">{email}</div>
                            <div className="row-meta">Pending email invite</div>
                          </div>
                          <div className="button-row invite-actions-row">
                            <Badge tone="warning">Pending</Badge>
                            <button
                              type="button"
                              className="text-link"
                              onClick={() =>
                                setDraft((current) => ({
                                  ...current,
                                  invitedEmails: current.invitedEmails.filter((entry) => entry !== email),
                                }))
                              }
                            >
                              {t('remove')}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-inline-state">No invite emails queued yet.</div>
                    )}
                  </div>

                  <div className="invite-footnote">
                    There is no deep link to manage on this step. The link lives inside the employee&apos;s email, and
                    removing an invite here keeps that pending invite from staying active.
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
                <div className="finish-hero-card finish-hero-card-celebration">
                  <Badge tone="success">Ready to launch</Badge>
                  <h2>Congratulations, {draft.companyName || 'your workspace'} is ready.</h2>
                  <p className="welcome-support-copy">
                    Your package is selected, your workspace profile is configured, and your invite emails are queued.
                    Next you will land on the dashboard with a quick guide to how Afensia works after launch.
                  </p>
                  <div className="finish-summary-grid">
                    <div className="finish-summary-item">
                      <span>Package</span>
                      <strong>{selectedUsageTier.name}</strong>
                    </div>
                    <div className="finish-summary-item">
                      <span>Invites queued</span>
                      <strong>{draft.invitedEmails.length}</strong>
                    </div>
                    <div className="finish-summary-item">
                      <span>{t('theme')}</span>
                      <strong>{themeLabel}</strong>
                    </div>
                    <div className="finish-summary-item">
                      <span>{t('language')}</span>
                      <strong>{selectedLanguageLabel}</strong>
                    </div>
                  </div>
                </div>

                <Card className="setup-side-card" title="What happens next" subtitle="A quick handoff into the dashboard">
                  <div className="summary-list compact-summary-list">
                    {finishNextSteps.map((item) => (
                      <div key={item.title} className="summary-row compact-row">
                        <div>
                          <div className="row-title">{item.title}</div>
                          <div className="row-meta">{item.copy}</div>
                        </div>
                      </div>
                    ))}
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
