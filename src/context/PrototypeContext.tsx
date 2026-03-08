/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  analyticsSnapshots,
  defaultDashboardPreferences,
  initialBalance,
  initialCompany,
  initialEmployees,
  initialModules,
  initialOnboardingDraft,
  usageTiers,
} from '../data/mockData'
import { createInviteLink, copyText, inferNameFromEmail } from '../lib/format'
import { languageMeta, supportedLanguages, translate, type TranslationKey } from '../lib/i18n'
import type {
  AccountBalance,
  CompanyProfile,
  DashboardPreferences,
  Employee,
  OnboardingDraft,
  SecurityModule,
  ThemeMode,
  ToastMessage,
  ToastTone,
  UILanguage,
  UsageTier,
} from '../types'

interface RegistrationPayload {
  companyName: string
  businessEmail: string
  password: string
}

interface InterfacePreferences {
  language: UILanguage
  theme: ThemeMode
}

interface InvitationSettingsPayload {
  invitationBehavior: string
  inviteLinkControls: string
}

interface PrototypeContextValue {
  company: CompanyProfile
  employees: Employee[]
  modules: SecurityModule[]
  balance: AccountBalance
  usageTiers: UsageTier[]
  onboardingDraft: OnboardingDraft
  onboardingCompleted: boolean
  dashboardPreferences: DashboardPreferences
  toasts: ToastMessage[]
  themeMode: ThemeMode
  uiLanguage: UILanguage
  direction: 'ltr' | 'rtl'
  supportedLanguages: typeof supportedLanguages
  analyticsSnapshots: typeof analyticsSnapshots
  registerBusiness: (payload: RegistrationPayload) => void
  completeOnboarding: (draft: OnboardingDraft) => void
  inviteEmployee: (email: string) => Employee
  resendInvite: (employeeId: string) => void
  removeEmployee: (employeeId: string) => void
  saveCompanyProfile: (updates: Partial<CompanyProfile>) => void
  saveInvitationSettings: (payload: InvitationSettingsPayload) => void
  saveInterfacePreferences: (preferences: InterfacePreferences) => void
  saveDashboardPreferences: (preferences: DashboardPreferences) => void
  simulateDangerAction: (action: 'delete-account') => void
  copyInviteValue: (value: string, title?: string, body?: string) => Promise<void>
  showToast: (title: string, body: string, tone?: ToastTone) => void
  dismissToast: (toastId: string) => void
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const PrototypeContext = createContext<PrototypeContextValue | null>(null)

function createToast(title: string, body: string, tone: ToastTone): ToastMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    body,
    tone,
  }
}

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState(initialCompany)
  const [employees, setEmployees] = useState(initialEmployees)
  const [modules] = useState(initialModules)
  const [balance, setBalance] = useState(initialBalance)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [onboardingDraft, setOnboardingDraft] = useState(initialOnboardingDraft)
  const [onboardingCompleted, setOnboardingCompleted] = useState(true)
  const [themeMode, setThemeMode] = useState<ThemeMode>('light')
  const [uiLanguage, setUiLanguage] = useState<UILanguage>('en')
  const [dashboardPreferences, setDashboardPreferences] = useState(defaultDashboardPreferences)

  const direction = languageMeta[uiLanguage].dir
  const enabledModuleIds = useMemo(
    () => modules.filter((module) => module.enabled).map((module) => module.id),
    [modules],
  )

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(uiLanguage, key, vars),
    [uiLanguage],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    document.documentElement.lang = uiLanguage
    document.documentElement.dir = direction
  }, [direction, themeMode, uiLanguage])

  const dismissToast = useCallback((toastId: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId))
  }, [])

  const pushToast = useCallback(
    (title: string, body: string, tone: ToastTone = 'info') => {
      const nextToast = createToast(title, body, tone)
      setToasts((current) => [nextToast, ...current].slice(0, 4))
      window.setTimeout(() => dismissToast(nextToast.id), 3200)
    },
    [dismissToast],
  )

  const copyInviteValue = useCallback(
    async (
      value: string,
      title = 'Invite link copied',
      body = 'Employees join Afensia through the mobile app invite flow.',
    ) => {
      try {
        await copyText(value)
        pushToast(title, body, 'success')
      } catch {
        pushToast('Copy unavailable', 'The invite link is ready to share from this prototype.', 'warning')
      }
    },
    [pushToast],
  )

  const registerBusiness = useCallback(
    (payload: RegistrationPayload) => {
      setCompany((current) => ({
        ...current,
        companyName: payload.companyName,
        adminEmail: payload.businessEmail,
      }))
      setOnboardingDraft((current) => ({
        ...current,
        companyName: payload.companyName,
      }))
      setOnboardingCompleted(false)
      pushToast('Account created', 'Continue with onboarding to finish setup.', 'success')
    },
    [pushToast],
  )

  const inviteEmployee = useCallback(
    (email: string) => {
      const employee: Employee = {
        id: `${Date.now()}-${email}`,
        name: inferNameFromEmail(email),
        email,
        role: 'Pending assignment',
        status: 'Invited',
        joinedDate: null,
        lastActivity: 'Invite sent now',
        totalChecks: 0,
        inviteLink: createInviteLink(email),
        assignedModules: enabledModuleIds.slice(0, 3),
      }

      setEmployees((current) => [employee, ...current])
      pushToast('Invite sent', `${employee.email} was added to the workspace.`, 'success')
      return employee
    },
    [enabledModuleIds, pushToast],
  )

  const resendInvite = useCallback(
    (employeeId: string) => {
      const employee = employees.find((entry) => entry.id === employeeId)
      if (!employee) {
        return
      }

      pushToast('Invite resent', `${employee.name} received a new mobile invite link.`, 'info')
    },
    [employees, pushToast],
  )

  const removeEmployee = useCallback(
    (employeeId: string) => {
      const employee = employees.find((entry) => entry.id === employeeId)
      if (!employee) {
        return
      }

      setEmployees((current) => current.filter((entry) => entry.id !== employeeId))
      pushToast('Employee removed', `${employee.name} was removed from the business account.`, 'warning')
    },
    [employees, pushToast],
  )

  const saveCompanyProfile = useCallback(
    (updates: Partial<CompanyProfile>) => {
      setCompany((current) => ({ ...current, ...updates }))
      pushToast('Company saved', 'Company details were updated.', 'success')
    },
    [pushToast],
  )

  const saveInvitationSettings = useCallback(
    (payload: InvitationSettingsPayload) => {
      setCompany((current) => ({
        ...current,
        invitationBehavior: payload.invitationBehavior,
        inviteLinkControls: payload.inviteLinkControls,
      }))
      pushToast('Invitation settings saved', 'Invite behavior was updated.', 'success')
    },
    [pushToast],
  )

  const saveInterfacePreferences = useCallback(
    (preferences: InterfacePreferences) => {
      setUiLanguage(preferences.language)
      setThemeMode(preferences.theme)
      pushToast('Preferences saved', `${languageMeta[preferences.language].label} and ${preferences.theme} mode applied.`, 'success')
    },
    [pushToast],
  )

  const saveDashboardPreferences = useCallback(
    (preferences: DashboardPreferences) => {
      setDashboardPreferences(preferences)
      pushToast('View preferences saved', 'Dashboard visibility preferences were updated.', 'success')
    },
    [pushToast],
  )

  const completeOnboarding = useCallback(
    (draft: OnboardingDraft) => {
      setCompany((current) => ({
        ...current,
        companyName: draft.companyName,
        industry: draft.industry,
        teamSize: draft.teamSize,
        countryRegion: draft.countryRegion,
        website: draft.website,
        linkedIn: draft.linkedIn,
      }))
      draft.invitedEmails.forEach((email) => {
        const exists = employees.some((entry) => entry.email.toLowerCase() === email.toLowerCase())
        if (!exists) {
          inviteEmployee(email)
        }
      })
      setBalance((current) => ({
        ...current,
        usageTierId: draft.selectedUsageTier,
        monthlyAllowance:
          usageTiers.find((tier) => tier.id === draft.selectedUsageTier)?.checksIncluded ?? current.monthlyAllowance,
        creditUnitPrice:
          usageTiers.find((tier) => tier.id === draft.selectedUsageTier)?.creditRate ?? current.creditUnitPrice,
      }))
      setThemeMode(draft.theme)
      setUiLanguage(draft.language)
      setOnboardingDraft(draft)
      setOnboardingCompleted(true)
      pushToast('Setup complete', 'The business security console is ready.', 'success')
    },
    [employees, inviteEmployee, pushToast],
  )

  const simulateDangerAction = useCallback(
    (action: 'delete-account') => {
      if (action !== 'delete-account') {
        return
      }
      pushToast('Confirmation recorded', 'Business account deletion was confirmed in the prototype.', 'danger')
    },
    [pushToast],
  )

  const value = useMemo(
    () => ({
      company,
      employees,
      modules,
      balance,
      usageTiers,
      onboardingDraft,
      onboardingCompleted,
      dashboardPreferences,
      toasts,
      themeMode,
      uiLanguage,
      direction,
      supportedLanguages,
      analyticsSnapshots,
      registerBusiness,
      completeOnboarding,
      inviteEmployee,
      resendInvite,
      removeEmployee,
      saveCompanyProfile,
      saveInvitationSettings,
      saveInterfacePreferences,
      saveDashboardPreferences,
      simulateDangerAction,
      copyInviteValue,
      showToast: pushToast,
      dismissToast,
      t,
    }),
    [
      balance,
      company,
      completeOnboarding,
      copyInviteValue,
      dashboardPreferences,
      direction,
      dismissToast,
      employees,
      inviteEmployee,
      modules,
      onboardingCompleted,
      onboardingDraft,
      registerBusiness,
      removeEmployee,
      resendInvite,
      saveCompanyProfile,
      saveDashboardPreferences,
      saveInterfacePreferences,
      saveInvitationSettings,
      pushToast,
      themeMode,
      toasts,
      uiLanguage,
      simulateDangerAction,
      t,
    ],
  )

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>
}

export function usePrototype() {
  const context = useContext(PrototypeContext)

  if (!context) {
    throw new Error('usePrototype must be used within PrototypeProvider')
  }

  return context
}
