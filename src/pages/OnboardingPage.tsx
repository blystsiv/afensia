import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Badge,
  Button,
  Card,
  InputField,
  PageHeader,
  SegmentedControl,
  SelectField,
} from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { createInviteLink } from '../lib/format'
import type { OnboardingDraft } from '../types'

const steps = ['Welcome', 'Features', 'Company', 'Invite', 'Preferences', 'Finish']

export function OnboardingPage() {
  const navigate = useNavigate()
  const { onboardingDraft, completeOnboarding, activeLanguages, modules, copyInviteValue } = usePrototype()
  const [step, setStep] = useState(0)
  const [inviteInput, setInviteInput] = useState('')
  const [draft, setDraft] = useState<OnboardingDraft>(onboardingDraft)

  const inviteLink = useMemo(
    () => draft.inviteLink || createInviteLink(draft.companyName || 'afensia-business'),
    [draft.companyName, draft.inviteLink],
  )

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
    <div className="onboarding-layout expanded-onboarding-layout">
      <Card className="onboarding-card onboarding-card-wide">
        <PageHeader title="Set up Afensia" description={`Step ${step + 1} of ${steps.length}`} />

        <div className="stepper-row six-step-row">
          {steps.map((label, index) => (
            <div key={label} className={index === step ? 'step-item step-item-active' : 'step-item'}>
              <span>{index + 1}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>

        {step === 0 ? (
          <div className="onboarding-panel">
            <h2>Welcome</h2>
            <div className="summary-list compact-summary-list">
              <div>Protect your business from digital threats</div>
              <div>Manage your team from one admin console</div>
              <div>Use multiple security modules</div>
              <div>Monitor usage and balance</div>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="onboarding-panel">
            <h2>Afensia features</h2>
            <div className="feature-grid feature-grid-wide">
              {modules.map((module) => (
                <div key={module.id} className="feature-tile">
                  <div className="feature-tile-head">
                    <strong>{module.name}</strong>
                    <Badge tone={module.enabled ? 'success' : module.status === 'Preview' ? 'info' : 'neutral'}>
                      {module.status}
                    </Badge>
                  </div>
                  <p className="row-meta">{module.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="onboarding-panel form-grid two-col">
            <InputField
              label="Company name"
              value={draft.companyName}
              onChange={(event) => setDraft((current) => ({ ...current, companyName: event.target.value }))}
            />
            <InputField
              label="Industry"
              value={draft.industry}
              onChange={(event) => setDraft((current) => ({ ...current, industry: event.target.value }))}
            />
            <SelectField
              label="Team size"
              value={draft.teamSize}
              onChange={(event) => setDraft((current) => ({ ...current, teamSize: event.target.value }))}
            >
              <option>1-10 employees</option>
              <option>11-50 employees</option>
              <option>51-200 employees</option>
              <option>201-500 employees</option>
              <option>500+ employees</option>
            </SelectField>
            <InputField
              label="Country / region"
              value={draft.countryRegion}
              onChange={(event) => setDraft((current) => ({ ...current, countryRegion: event.target.value }))}
            />
            <InputField
              label="Company website"
              value={draft.website}
              onChange={(event) => setDraft((current) => ({ ...current, website: event.target.value }))}
            />
            <InputField
              label="LinkedIn"
              value={draft.linkedIn}
              onChange={(event) => setDraft((current) => ({ ...current, linkedIn: event.target.value }))}
            />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="onboarding-panel">
            <div className="invite-toolbar">
              <InputField
                label="Employee email"
                value={inviteInput}
                onChange={(event) => setInviteInput(event.target.value)}
                placeholder="employee@company.com"
              />
              <Button variant="secondary" onClick={addInvite}>
                Add
              </Button>
            </div>
            <div className="invite-link-row">
              <div className="invite-link-stack">
                <span className="field-label">Invite link</span>
                <div className="inline-code">{inviteLink}</div>
                <span className="field-hint">Employees join through the mobile app deep link.</span>
              </div>
              <div className="button-row">
                <Button variant="secondary" onClick={() => setDraft((current) => ({ ...current, inviteLink: createInviteLink(`${current.companyName}-${Date.now()}`) }))}>
                  Generate link
                </Button>
                <Button variant="ghost" onClick={() => copyInviteValue(inviteLink)}>
                  Copy link
                </Button>
              </div>
            </div>
            <div className="invite-list">
              {draft.invitedEmails.length ? (
                draft.invitedEmails.map((email) => (
                  <div key={email} className="invite-row">
                    <span>{email}</span>
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
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-inline-state">No employees added yet.</div>
              )}
            </div>
            <button type="button" className="text-link" onClick={() => setStep(4)}>
              Skip this step
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="onboarding-panel form-grid two-col">
            <div>
              <div className="field-label">Theme</div>
              <SegmentedControl
                value={draft.theme}
                onChange={(value) => setDraft((current) => ({ ...current, theme: value }))}
                options={[
                  { label: 'Light mode', value: 'light' },
                  { label: 'Dark mode', value: 'dark' },
                ]}
              />
            </div>
            <SelectField
              label="Language"
              value={draft.language}
              onChange={(event) => setDraft((current) => ({ ...current, language: event.target.value as OnboardingDraft['language'] }))}
            >
              {activeLanguages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </SelectField>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="onboarding-panel">
            <h2>Finish setup</h2>
            <div className="summary-list compact-summary-list">
              <div>Business account ready</div>
              <div>{draft.companyName}</div>
              <div>{draft.invitedEmails.length} employees invited</div>
              <div>Theme: {draft.theme}</div>
              <div>Language: {activeLanguages.find((item) => item.code === draft.language)?.label}</div>
            </div>
          </div>
        ) : null}

        <div className="form-actions">
          <Button variant="ghost" onClick={previousStep}>
            {step === 0 ? 'Back to sign in' : 'Back'}
          </Button>
          <Button onClick={nextStep}>{step === steps.length - 1 ? 'Go to dashboard' : 'Continue'}</Button>
        </div>
      </Card>
    </div>
  )
}
