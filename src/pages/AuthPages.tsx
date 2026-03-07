import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, CheckboxField, InputField, PasswordField } from '../components/ui'
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
    <section className="auth-card">
      <div className="auth-card-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  )
}

export function SignInPage() {
  const navigate = useNavigate()
  const { company, onboardingCompleted } = usePrototype()
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
    <AuthCard title="Sign in" subtitle="Business admins only.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <InputField
          label="Business email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <div className="auth-inline-row">
          <a href="/forgot" onClick={(event) => event.preventDefault()} className="text-link">
            Forgot password?
          </a>
        </div>
        <Button type="submit" loading={submitting}>
          Sign in
        </Button>
      </form>
      <div className="auth-footer-row">
        <span>Need a business account?</span>
        <Link to="/create-account" className="text-link">
          Create account
        </Link>
      </div>
    </AuthCard>
  )
}

export function CreateAccountPage() {
  const navigate = useNavigate()
  const { registerBusiness } = usePrototype()
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
    password: submitted && !(passwordChecks.length && passwordChecks.case && passwordChecks.symbol)
      ? 'Use a stronger password.'
      : undefined,
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
    <AuthCard title="Create account" subtitle="Set up your business workspace.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <InputField
          label="Company name"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          error={formErrors.companyName}
        />
        <InputField
          label="Business email"
          type="email"
          value={businessEmail}
          onChange={(event) => setBusinessEmail(event.target.value)}
          error={formErrors.businessEmail}
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={formErrors.password}
          hint="At least 8 characters."
        />
        <div className="password-rule-list">
          <div className={passwordChecks.length ? 'rule-item rule-item-valid' : 'rule-item'}>Minimum 8 characters</div>
          <div className={passwordChecks.case ? 'rule-item rule-item-valid' : 'rule-item'}>Uppercase and lowercase</div>
          <div className={passwordChecks.symbol ? 'rule-item rule-item-valid' : 'rule-item'}>Number or symbol</div>
        </div>
        <PasswordField
          label="Confirm password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={formErrors.confirmPassword}
        />
        <CheckboxField
          checked={accepted}
          onChange={setAccepted}
          label="I agree to the terms and privacy notice."
        />
        {formErrors.accepted ? <div className="field-error standalone-error">{formErrors.accepted}</div> : null}
        <Button type="submit" loading={submitting}>
          Create account
        </Button>
      </form>
      <div className="auth-footer-row">
        <span>Already have an account?</span>
        <Link to="/signin" className="text-link">
          Sign in
        </Link>
      </div>
    </AuthCard>
  )
}
