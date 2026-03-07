import { Eye, EyeOff, LoaderCircle, X } from 'lucide-react'
import {
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { cx } from '../lib/format'
import type { ToastMessage } from '../types'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx('ui-button', `ui-button-${variant}`, `ui-button-${size}`, className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <LoaderCircle size={16} className="spin" /> : null}
      <span>{children}</span>
    </button>
  )
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}) {
  return <span className={cx('ui-badge', `ui-badge-${tone}`)}>{children}</span>
}

export function Card({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title?: string
  subtitle?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cx('ui-card', className)}>
      {title || subtitle || action ? (
        <header className="ui-card-header">
          <div>
            {title ? <h2 className="ui-card-title">{title}</h2> : null}
            {subtitle ? <p className="ui-card-subtitle">{subtitle}</p> : null}
          </div>
          {action ? <div>{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </div>
  )
}

export function StatCard({
  label,
  value,
  meta,
}: {
  label: string
  value: string
  meta?: string
}) {
  return (
    <Card className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {meta ? <div className="stat-meta">{meta}</div> : null}
    </Card>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  )
}

export function SkeletonBlock({
  className,
  lines = 1,
}: {
  className?: string
  lines?: number
}) {
  const widths = useMemo(
    () => Array.from({ length: lines }, (_, index) => (index === lines - 1 ? '68%' : '100%')),
    [lines],
  )

  return (
    <div className={cx('skeleton-block', className)}>
      {widths.map((width, index) => (
        <span key={`${width}-${index}`} style={{ width }} />
      ))}
    </div>
  )
}

function FieldShell({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <label className="field-shell">
      <span className="field-label">{label}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  )
}

export function InputField({
  label,
  hint,
  error,
  className,
  suffix,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
  suffix?: ReactNode
}) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <span className={cx('input-frame', error && 'input-frame-error')}>
        <input className={cx('ui-input', className)} {...props} />
        {suffix ? <span className="input-suffix">{suffix}</span> : null}
      </span>
    </FieldShell>
  )
}

export function PasswordField({
  label,
  hint,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <InputField
      {...props}
      label={label}
      hint={hint}
      error={error}
      className={className}
      type={visible ? 'text' : 'password'}
      suffix={
        <button type="button" className="text-button" onClick={() => setVisible((current) => !current)}>
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{visible ? 'Hide' : 'Show'}</span>
        </button>
      }
    />
  )
}

export function SelectField({
  label,
  hint,
  error,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <span className={cx('input-frame', error && 'input-frame-error')}>
        <select className={cx('ui-input ui-select', className)} {...props}>
          {children}
        </select>
      </span>
    </FieldShell>
  )
}

export function TextareaField({
  label,
  hint,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  hint?: string
  error?: string
}) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      <span className={cx('input-frame', error && 'input-frame-error')}>
        <textarea className={cx('ui-input ui-textarea', className)} {...props} />
      </span>
    </FieldShell>
  )
}

export function CheckboxField({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
}) {
  return (
    <label className="checkbox-field">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ label: string; value: T }>
}) {
  return (
    <div className="segmented-control" role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cx('segment-button', option.value === value && 'segment-button-active')}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return <span className="avatar">{initials}</span>
}

export function Modal({
  open,
  title,
  description,
  children,
  footer,
  onClose,
}: {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
}) {
  if (!open) {
    return null
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[]
  onDismiss: (toastId: string) => void
}) {
  if (!toasts.length) {
    return null
  }

  return createPortal(
    <div className="toast-viewport">
      {toasts.map((toast) => (
        <div key={toast.id} className={cx('toast-item', `toast-item-${toast.tone}`)}>
          <div className="toast-copy">
            <strong>{toast.title}</strong>
            <span>{toast.body}</span>
          </div>
          <button type="button" className="icon-button" onClick={() => onDismiss(toast.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  )
}
