import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, CheckboxField, InputField, PasswordField } from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'

function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section className="auth-card auth-card-elevated">
      <div className="auth-card-header auth-card-header-tight">
        <Badge tone="info">Afensia Admin</Badge>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

export function SignInPage() {
  const navigate = useNavigate()
  const { company, onboardingCompleted, t } = usePrototype()
  const [email, setEmail] = useState(company.adminEmail)
  const [password, setPassword] = useState('Password123!')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    const nextErrors = {
      email: email.trim() ? undefined : 'Enter your business email.',
      password: password.trim() ? undefined : 'Enter your password.',
    }

    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) {
      return
    }

    setSubmitting(true)
    window.setTimeout(() => {
      navigate(onboardingCompleted ? '/app/overview' : '/onboarding')
    }, 320)
  }

  return (
    <AuthCard title={t('signIn')} subtitle={t('businessAdminsOnly')}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <InputField
          label={t('businessEmail')}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <PasswordField
          label={t('password')}
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <div className="auth-inline-row">
          <a href="/forgot" onClick={(event) => event.preventDefault()} className="text-link">
            {t('forgotPassword')}
          </a>
        </div>
        <Button type="submit" loading={submitting}>
          {t('signIn')}
        </Button>
      </form>
      <div className="auth-footer-row">
        <span>{t('needBusinessAccount')}</span>
        <Link to="/create-account" className="text-link">
          {t('createAccount')}
        </Link>
      </div>
    </AuthCard>
  )
}

export function CreateAccountPage() {
  const navigate = useNavigate()
  const { registerBusiness, t } = usePrototype()
  const [companyName, setCompanyName] = useState('NorthHill Beverage Group')
  const [businessEmail, setBusinessEmail] = useState('avery@northhillbev.com')
  const [password, setPassword] = useState('Password123!')
  const [confirmPassword, setConfirmPassword] = useState('Password123!')
  const [accepted, setAccepted] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const passwordChecks = useMemo(
    () => ({
      length: password.length >= 8,
      case: /[a-z]/.test(password) && /[A-Z]/.test(password),
      symbol: /[0-9!@#$%^&*]/.test(password),
      match: password.length > 0 && password === confirmPassword,
    }),
    [confirmPassword, password],
  )

  const formErrors = {
    companyName: submitted && !companyName.trim() ? 'Enter your company name.' : undefined,
    businessEmail: submitted && !businessEmail.trim() ? 'Enter your business email.' : undefined,
    password: submitted && !(passwordChecks.length && passwordChecks.case && passwordChecks.symbol) ? t('checkYourPassword') : undefined,
    confirmPassword: submitted && !passwordChecks.match ? 'Passwords do not match.' : undefined,
    accepted: submitted && !accepted ? 'You must accept the terms and privacy notice.' : undefined,
  }

  const formIsValid =
    companyName.trim() &&
    businessEmail.trim() &&
    passwordChecks.length &&
    passwordChecks.case &&
    passwordChecks.symbol &&
    passwordChecks.match &&
    accepted

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)

    if (!formIsValid) {
      return
    }

    setSubmitting(true)
    registerBusiness({ companyName, businessEmail, password })
    window.setTimeout(() => {
      navigate('/onboarding')
    }, 320)
  }

  return (
    <AuthCard title={t('createAccount')} subtitle={t('createBusinessWorkspace')}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <InputField
          label={t('companyName')}
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          error={formErrors.companyName}
        />
        <InputField
          label={t('businessEmail')}
          type="email"
          value={businessEmail}
          onChange={(event) => setBusinessEmail(event.target.value)}
          error={formErrors.businessEmail}
        />
        <PasswordField
          label={t('password')}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={formErrors.password}
          hint="At least 8 characters."
        />
        <div className="password-rule-list password-rule-list-refined">
          <div className={passwordChecks.length ? 'rule-item rule-item-valid' : 'rule-item'}>{t('minimum8')}</div>
          <div className={passwordChecks.case ? 'rule-item rule-item-valid' : 'rule-item'}>{t('upperLower')}</div>
          <div className={passwordChecks.symbol ? 'rule-item rule-item-valid' : 'rule-item'}>{t('numberSymbol')}</div>
        </div>
        <PasswordField
          label={t('confirmPassword')}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={formErrors.confirmPassword}
        />
        <CheckboxField checked={accepted} onChange={setAccepted} label={t('agreeTerms')} />
        {formErrors.accepted ? <div className="field-error standalone-error">{formErrors.accepted}</div> : null}
        <Button type="submit" loading={submitting}>
          {t('createAccount')}
        </Button>
      </form>
      <div className="auth-footer-row">
        <span>{t('alreadyHaveAccount')}</span>
        <Link to="/signin" className="text-link">
          {t('signIn')}
        </Link>
      </div>
    </AuthCard>
  )
}
