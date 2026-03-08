import { languageMeta } from './i18n'

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function resolveLocale() {
  if (typeof document === 'undefined') {
    return 'en-US'
  }

  const lang = document.documentElement.lang as keyof typeof languageMeta | ''
  return (lang && languageMeta[lang]?.locale) || 'en-US'
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(resolveLocale()).format(value)
}

export function formatCurrency(value: number, currency = 'USD') {
  const fractionalDigits = Math.abs(value) < 1 ? 2 : 0
  return new Intl.NumberFormat(resolveLocale(), {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionalDigits,
    maximumFractionDigits: fractionalDigits,
  }).format(value)
}

export function formatPercentage(value: number) {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value}%`
}

export function formatDate(value: string | null) {
  if (!value) {
    return 'Pending join'
  }

  return new Intl.DateTimeFormat(resolveLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function inferNameFromEmail(email: string) {
  const [localPart] = email.split('@')

  return localPart
    .split(/[._-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function createInviteLink(seed: string) {
  const sanitized = seed.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `https://join.afensia.app/invite/${sanitized}`
}

export async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}
