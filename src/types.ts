export type EmployeeStatus = 'Active' | 'Inactive' | 'Invited'
export type ToastTone = 'info' | 'success' | 'warning' | 'danger'
export type ThemeMode = 'light' | 'dark'
export type UILanguage = 'en' | 'fr' | 'hi' | 'nl' | 'ar' | 'es' | 'de' | 'it' | 'id'
export type AnalyticsRange = '7d' | '30d' | '90d' | 'custom'
export type ModuleStatus = 'Included' | 'Add-on' | 'Coming soon'
export type ModuleTier = 'Core' | 'Advanced' | 'Enterprise'
export type PricingPlanId = 'starter' | 'growth' | 'enterprise'

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  status: EmployeeStatus
  joinedDate: string | null
  lastActivity: string
  totalChecks: number
  inviteLink: string
  assignedModules: string[]
}

export interface CompanyProfile {
  companyName: string
  industry: string
  teamSize: string
  countryRegion: string
  website: string
  linkedIn: string
  description: string
  adminName: string
  adminEmail: string
  supportContact: string
  status: string
  invitationBehavior: string
  inviteLinkControls: string
}

export interface SecurityModule {
  id: string
  name: string
  description: string
  status: ModuleStatus
  enabled: boolean
  usageCount: number
  tier: ModuleTier
  category: string
  plan: PricingPlanId | 'addon'
  priceLabel: string
  note: string
}

export interface PricingPlan {
  id: PricingPlanId
  name: string
  priceLabel: string
  billingNote: string
  description: string
  seats: string
  includedModules: string[]
  highlight?: boolean
}

export interface UsagePoint {
  label: string
  checks: number
  risky: number
  safe: number
}

export interface ModuleUsagePoint {
  name: string
  usage: number
}

export interface EmployeeUsagePoint {
  name: string
  checks: number
  safe: number
  risky: number
}

export interface EmployeeInsight {
  id: string
  name: string
  checks: number
  safe: number
  risky: number
  topModule: string
  lastActive: string
  usageShare: number
  trend: number
}

export interface EmployeeModuleHeatRow {
  name: string
  modules: Array<{
    name: string
    usage: number
  }>
}

export interface AnalyticsSnapshot {
  totalChecks: number
  activeEmployees: number
  riskyFindings: number
  safeFindings: number
  averageChecksPerEmployee: number
  usageTrend: UsagePoint[]
  moduleUsage: ModuleUsagePoint[]
  employeeUsage: EmployeeUsagePoint[]
  employeeInsights: EmployeeInsight[]
  employeeModuleHeat: EmployeeModuleHeatRow[]
}

export interface AccountBalance {
  totalBalance: number
  remainingBalance: number
  currency: string
  planId: PricingPlanId
  creditModel: string
  renewalDate: string
}

export interface DashboardPreferences {
  showModuleBreakdown: boolean
  showEmployeeSummary: boolean
  showRiskSummary: boolean
  showPlanSummary: boolean
}

export interface OnboardingDraft {
  companyName: string
  industry: string
  teamSize: string
  countryRegion: string
  website: string
  linkedIn: string
  invitedEmails: string[]
  inviteLink: string
  theme: ThemeMode
  language: UILanguage
  selectedPlan: PricingPlanId
}

export interface ToastMessage {
  id: string
  title: string
  body: string
  tone: ToastTone
}
