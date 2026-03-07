import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  InputField,
  Modal,
  PageHeader,
  SelectField,
  SkeletonBlock,
} from '../components/ui'
import { DataTable } from '../components/dataTable'
import { usePrototype } from '../context/PrototypeContext'
import { createInviteLink, formatDate, formatNumber } from '../lib/format'
import { useSimulatedLoading } from '../lib/useSimulatedLoading'
import type { Employee, EmployeeStatus } from '../types'

function EmployeesSkeleton() {
  return (
    <Card>
      <SkeletonBlock lines={10} />
    </Card>
  )
}

export function EmployeesPage() {
  const { employees, modules, inviteEmployee, resendInvite, removeEmployee, copyInviteValue, t } = usePrototype()
  const loading = useSimulatedLoading('employees-console', 260)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | EmployeeStatus>('All')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviteSuccess, setInviteSuccess] = useState<Employee | null>(null)
  const [employeeToRemove, setEmployeeToRemove] = useState<Employee | null>(null)

  const moduleNameMap = useMemo(
    () => Object.fromEntries(modules.map((module) => [module.id, module.name])),
    [modules],
  )

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesFilter = statusFilter === 'All' || employee.status === statusFilter
      const source = `${employee.name} ${employee.email}`.toLowerCase()
      return matchesFilter && source.includes(query.trim().toLowerCase())
    })
  }, [employees, query, statusFilter])

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        id: 'name',
        header: t('navEmployees'),
        accessorFn: (employee) => employee.name,
        cell: ({ row }) => (
          <div className="row-person">
            <Avatar name={row.original.name} />
            <div>
              <div className="row-title">{row.original.name}</div>
              <div className="row-meta">{row.original.role}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: t('businessEmail'),
      },
      {
        id: 'status',
        header: t('status'),
        accessorFn: (employee) => employee.status,
        cell: ({ row }) => (
          <Badge tone={row.original.status === 'Active' ? 'success' : row.original.status === 'Invited' ? 'warning' : 'neutral'}>
            {row.original.status === 'Active' ? t('active') : row.original.status === 'Invited' ? t('invited') : t('inactive')}
          </Badge>
        ),
      },
      {
        id: 'joinedDate',
        header: t('joinedDate'),
        accessorFn: (employee) => employee.joinedDate ?? '9999-12-31',
        cell: ({ row }) => formatDate(row.original.joinedDate),
      },
      {
        id: 'assignedModules',
        header: t('assignedAccess'),
        accessorFn: (employee) => employee.assignedModules.length,
        cell: ({ row }) => {
          const assignedLabels = row.original.assignedModules.map((moduleId) => moduleNameMap[moduleId]).filter(Boolean)

          return (
            <div className="module-pill-row">
              {assignedLabels.slice(0, 2).map((label) => (
                <Badge key={label} tone="neutral">
                  {label}
                </Badge>
              ))}
              {assignedLabels.length > 2 ? <span className="row-meta">+{assignedLabels.length - 2}</span> : null}
            </div>
          )
        },
      },
      {
        id: 'totalChecks',
        header: t('checksUsed'),
        accessorFn: (employee) => employee.totalChecks,
        cell: ({ row }) => formatNumber(row.original.totalChecks),
      },
      {
        id: 'actions',
        header: t('actions'),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="table-actions">
            {row.original.status === 'Invited' ? (
              <>
                <button type="button" className="text-link" onClick={() => resendInvite(row.original.id)}>
                  {t('resendInvite')}
                </button>
                <button type="button" className="text-link" onClick={() => copyInviteValue(row.original.inviteLink)}>
                  {t('copyInviteLink')}
                </button>
              </>
            ) : null}
            <button type="button" className="text-link danger-link" onClick={() => setEmployeeToRemove(row.original)}>
              {t('remove')}
            </button>
          </div>
        ),
      },
    ],
    [copyInviteValue, moduleNameMap, resendInvite, t],
  )

  const resetInviteModal = () => {
    setInviteModalOpen(false)
    setInviteEmail('')
    setInviteLink('')
    setInviteError('')
    setInviteSuccess(null)
  }

  const generateInviteLink = () => {
    if (!inviteEmail.trim()) {
      setInviteError('Enter an employee email.')
      return
    }

    setInviteError('')
    setInviteLink(createInviteLink(inviteEmail.trim()))
  }

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      setInviteError('Enter an employee email.')
      return
    }

    setInviteError('')
    const employee = inviteEmployee(inviteEmail.trim())
    setInviteSuccess(employee)
    setInviteLink(employee.inviteLink)
  }

  return (
    <div className="page-stack">
      <PageHeader
        title={t('navEmployees')}
        description={t('manageTeamAccess')}
        action={<Button onClick={() => setInviteModalOpen(true)}>{t('inviteEmployee')}</Button>}
      />

      <div className="toolbar-row employee-toolbar-row">
        <InputField label={t('search')} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search employees" />
        <SelectField label={t('status')} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'All' | EmployeeStatus)}>
          <option value="All">All</option>
          <option value="Active">{t('active')}</option>
          <option value="Invited">{t('invited')}</option>
          <option value="Inactive">{t('inactive')}</option>
        </SelectField>
      </div>

      {loading ? (
        <EmployeesSkeleton />
      ) : (
        <Card className="table-card">
          <DataTable
            data={filteredEmployees}
            columns={columns}
            getRowId={(employee) => employee.id}
            tableClassName="employee-table"
            summary={
              <div className="data-table-summary-row">
                <span>{formatNumber(filteredEmployees.length)} shown</span>
                <span>{formatNumber(employees.length)} total</span>
                <span>{formatNumber(employees.filter((employee) => employee.status === 'Invited').length)} invited</span>
              </div>
            }
            emptyState={
              employees.length ? (
                <EmptyState title="No matching employees" description="Try a different search or status filter." />
              ) : (
                <EmptyState
                  title={t('noEmployeesYet')}
                  description={t('inviteEmployeesToStart')}
                  action={<Button onClick={() => setInviteModalOpen(true)}>{t('inviteEmployee')}</Button>}
                />
              )
            }
          />
        </Card>
      )}

      <Modal
        open={inviteModalOpen}
        onClose={resetInviteModal}
        title={t('inviteEmployee')}
        description={t('employeesJoinMobile')}
        footer={
          inviteSuccess ? (
            <Button onClick={resetInviteModal}>{t('close')}</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={resetInviteModal}>
                {t('cancel')}
              </Button>
              <Button onClick={handleInvite}>{t('inviteEmployee')}</Button>
            </>
          )
        }
      >
        {inviteSuccess ? (
          <div className="modal-success-panel modal-success-panel-refined">
            <div className="modal-success-title">{t('inviteSent')}</div>
            <div className="modal-success-copy">{inviteSuccess.email} can join with the mobile deep link.</div>
            <div className="invite-link-row compact-invite-row">
              <div className="inline-code">{inviteLink}</div>
              <Button variant="secondary" onClick={() => copyInviteValue(inviteLink)}>
                {t('copyLink')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="page-stack compact-stack">
            <InputField
              label="Employee email"
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              error={inviteError || undefined}
            />
            <div className="invite-link-row compact-invite-row">
              <div className="inline-code muted-code">{inviteLink || 'Generate a secure invite link if needed.'}</div>
              <div className="button-row">
                <Button variant="secondary" onClick={generateInviteLink}>
                  {t('generateLink')}
                </Button>
                {inviteLink ? (
                  <Button variant="ghost" onClick={() => copyInviteValue(inviteLink)}>
                    {t('copyLink')}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(employeeToRemove)}
        onClose={() => setEmployeeToRemove(null)}
        title={t('remove')}
        description="This removes the employee from the business account."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEmployeeToRemove(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (employeeToRemove) {
                  removeEmployee(employeeToRemove.id)
                }
                setEmployeeToRemove(null)
              }}
            >
              {t('remove')}
            </Button>
          </>
        }
      >
        {employeeToRemove ? (
          <div className="delete-confirm-copy">
            <div>{employeeToRemove.name}</div>
            <div className="subtle-copy">{employeeToRemove.email}</div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
