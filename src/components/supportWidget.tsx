import { LifeBuoy, Mail, MessageSquareText, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { usePrototype } from '../context/PrototypeContext'
import { cx } from '../lib/format'
import { getOpenSupportEventName } from '../lib/support'
import { Badge, Button } from './ui'

interface SupportPrompt {
  id: string
  label: string
  response: string
}

export function SupportWidget() {
  const location = useLocation()
  const { company } = usePrototype()
  const [open, setOpen] = useState(false)
  const supportContext = useMemo(() => {
    const pathname = location.pathname

    if (pathname.startsWith('/onboarding')) {
      return {
        badge: 'Onboarding help',
        title: 'Need help finishing setup?',
        intro: 'Use the support assistant for quick guidance on packages, payment, invites, and rollout decisions.',
        prompts: [
          {
            id: 'plan',
            label: 'Which package should I choose?',
            response: 'Start with the package that matches your first active month. The Team package is usually the safest default, and you can move up later without repeating onboarding.',
          },
          {
            id: 'payment',
            label: 'How does checkout work?',
            response: 'The payment step is designed like a hosted Stripe flow: choose the credits package, confirm billing details, and open the Stripe payment link to activate the workspace.',
          },
          {
            id: 'invite',
            label: 'How do employee invites work?',
            response: 'Add employee emails in the Invite step. Each person receives an email that opens the app, and the invite stays pending until they activate access.',
          },
        ] satisfies SupportPrompt[],
      }
    }

    if (pathname.startsWith('/app/employees')) {
      return {
        badge: 'Workspace support',
        title: 'Managing team access?',
        intro: 'This assistant can point you to the right next step for invites, pending employees, and cleanup.',
        prompts: [
          {
            id: 'pending',
            label: 'Pending invites',
            response: 'Pending employees have been invited but have not activated the app yet. You can resend or remove them if the invite was sent by mistake.',
          },
          {
            id: 'cleanup',
            label: 'Remove an employee',
            response: 'Use remove when an invite should no longer be valid or when someone should lose access to the business workspace.',
          },
          {
            id: 'rollout',
            label: 'Best rollout approach',
            response: 'Invite a small, high-activity group first, confirm the mobile flow works well, and then expand the rollout team by team.',
          },
        ] satisfies SupportPrompt[],
      }
    }

    if (pathname.startsWith('/app')) {
      return {
        badge: 'Workspace support',
        title: 'Need a hand inside the console?',
        intro: 'Use the support assistant to understand rollout, billing, or what to monitor next.',
        prompts: [
          {
            id: 'overview',
            label: 'What should I monitor first?',
            response: 'Start with pending invites, total checks, and the most-used protection areas. That gives you the clearest picture of initial adoption.',
          },
          {
            id: 'billing',
            label: 'Where does billing fit in?',
            response: 'Your selected credits package sets the monthly usage capacity, while the workspace fee covers access to the business console and account management.',
          },
          {
            id: 'analytics',
            label: 'How should I use analytics?',
            response: 'Use analytics to spot who is active, which modules are used most, and where risky findings are highest so you can target rollout coaching.',
          },
        ] satisfies SupportPrompt[],
      }
    }

    return {
      badge: 'Support chatbot',
      title: 'Need help getting back on track?',
      intro: 'The support assistant can answer quick setup questions and point you to the right page.',
      prompts: [
        {
          id: 'signin',
          label: 'I cannot sign in',
          response: 'Check that you are using the business admin email for this workspace. If needed, use the password reset flow from the sign-in screen.',
        },
        {
          id: 'setup',
          label: 'I need setup help',
          response: 'Create the account first, then follow onboarding to choose a package, confirm billing, add company details, and queue employee invites.',
        },
        {
          id: 'recovery',
          label: 'I am lost in the app',
          response: 'Use the main navigation to return to Overview or open the 404 recovery actions if you followed an outdated link.',
        },
      ] satisfies SupportPrompt[],
    }
  }, [location.pathname])
  const [selectedPromptId, setSelectedPromptId] = useState(supportContext.prompts[0]?.id ?? '')

  useEffect(() => {
    const eventName = getOpenSupportEventName()
    const handleOpen = () => setOpen(true)

    window.addEventListener(eventName, handleOpen)

    return () => {
      window.removeEventListener(eventName, handleOpen)
    }
  }, [])

  const selectedPrompt = supportContext.prompts.find((prompt) => prompt.id === selectedPromptId) ?? supportContext.prompts[0]

  return (
    <div className="support-widget">
      {open ? (
        <section id="support-panel" className="support-panel" role="dialog" aria-label="Support chatbot">
          <header className="support-panel-header">
            <div>
              <Badge tone="info">{supportContext.badge}</Badge>
              <h3>{supportContext.title}</h3>
              <p>{supportContext.intro}</p>
            </div>
            <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close support chat">
              <X size={16} />
            </button>
          </header>

          <div className="support-thread">
            <div className="support-message support-message-system">
              <div className="support-message-icon">
                <Sparkles size={15} />
              </div>
              <div>
                <strong>Afensia assistant</strong>
                <p>I can help with the current step and point you to the safest next action.</p>
              </div>
            </div>

            {selectedPrompt ? (
              <div className="support-message support-message-answer">
                <span className="support-message-label">{selectedPrompt.label}</span>
                <p>{selectedPrompt.response}</p>
              </div>
            ) : null}
          </div>

          <div className="support-chip-grid" role="list" aria-label="Suggested support topics">
            {supportContext.prompts.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                className={cx('support-chip', selectedPrompt?.id === prompt.id && 'support-chip-active')}
                onClick={() => setSelectedPromptId(prompt.id)}
              >
                {prompt.label}
              </button>
            ))}
          </div>

          <div className="support-panel-footer">
            <div className="support-contact-line">
              <LifeBuoy size={15} />
              <span>{company.supportContact}</span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                window.location.href = `mailto:${company.supportContact}?subject=Afensia%20support`
              }}
            >
              <Mail size={15} />
              <span>Email support</span>
            </Button>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        className={cx('support-launcher', open && 'support-launcher-open')}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="support-panel"
      >
        <span className="support-launcher-icon">
          <MessageSquareText size={18} />
        </span>
        <span>{open ? 'Minimize support' : 'Open support chat'}</span>
      </button>
    </div>
  )
}
