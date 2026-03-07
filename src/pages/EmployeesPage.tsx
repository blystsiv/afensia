import { useMemo, useState } from 'react'
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
  const { employees, modules, inviteEmployee, resendInvite, removeEmployee, copyInviteValue } = usePrototype()
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
        title="Employees"
        description="Manage team access and invite flow"
        action={<Button onClick={() => setInviteModalOpen(true)}>Invite employee</Button>}
      />

      <div className="toolbar-row employee-toolbar-row">
        <InputField
          label="Search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search employees"
        />
        <SelectField label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'All' | EmployeeStatus)}>
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Invited">Invited</option>
          <option value="Inactive">Inactive</option>
        </SelectField>
      </div>

      {loading ? (
        <EmployeesSkeleton />
      ) : filteredEmployees.length ? (
        <Card className="table-card">
          <div className="table-wrap">
            <table className="data-table employee-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined date</th>
                  <th>Assigned access</th>
                  <th>Checks used</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const assignedLabels = employee.assignedModules.map((moduleId) => moduleNameMap[moduleId]).filter(Boolean)
                  return (
                    <tr key={employee.id}>
                      <td>
                        <div className="row-person">
                          <Avatar name={employee.name} />
                          <div>
                            <div className="row-title">{employee.name}</div>
                            <div className="row-meta">{employee.role}</div>
                          </div>
                        </div>
                      </td>
                      <td>{employee.email}</td>
                      <td>
                        <Badge
                          tone={employee.status === 'Active' ? 'success' : employee.status === 'Invited' ? 'warning' : 'neutral'}
                        >
                          {employee.status}
                        </Badge>
                      </td>
                      <td>{formatDate(employee.joinedDate)}</td>
                      <td>
                        <div className="module-pill-row">
                          {assignedLabels.slice(0, 2).map((label) => (
                            <Badge key={label} tone="neutral">
                              {label}
                            </Badge>
                          ))}
                          {assignedLabels.length > 2 ? <span className="row-meta">+{assignedLabels.length - 2}</span> : null}
                        </div>
                      </td>
                      <td>{formatNumber(employee.totalChecks)}</td>
                      <td>
                        <div className="table-actions">
                          {employee.status === 'Invited' ? (
                            <>
                              <button type="button" className="text-link" onClick={() => resendInvite(employee.id)}>
                                Resend invite
                              </button>
                              <button type="button" className="text-link" onClick={() => copyInviteValue(employee.inviteLink)}>
                                Copy invite link
                              </button>
                            </>
                          ) : null}
                          <button type="button" className="text-link danger-link" onClick={() => setEmployeeToRemove(employee)}>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <EmptyState
            title="No employees yet"
            description="Invite employees to start the mobile app rollout."
            action={<Button onClick={() => setInviteModalOpen(true)}>Invite employee</Button>}
          />
        </Card>
      )}

      <Modal
        open={inviteModalOpen}
        onClose={resetInviteModal}
        title="Invite employee"
        description="Employees join Afensia through the mobile app invite flow."
        footer={
          inviteSuccess ? (
            <Button onClick={resetInviteModal}>Close</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={resetInviteModal}>
                Cancel
              </Button>
              <Button onClick={handleInvite}>Send invite</Button>
            </>
          )
        }
      >
        {inviteSuccess ? (
          <div className="modal-success-panel">
            <div className="modal-success-title">Invite sent</div>
            <div className="modal-success-copy">{inviteSuccess.email} can join with the mobile deep link.</div>
            <div className="invite-link-row compact-invite-row">
              <div className="inline-code">{inviteLink}</div>
              <Button variant="secondary" onClick={() => copyInviteValue(inviteLink)}>
                Copy link
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
                  Generate link
                </Button>
                {inviteLink ? (
                  <Button variant="ghost" onClick={() => copyInviteValue(inviteLink)}>
                    Copy link
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
        title="Remove employee"
        description="This removes the employee from the business account."
        footer={
          <>
            <Button variant="ghost" onClick={() => setEmployeeToRemove(null)}>
              Cancel
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
              Remove
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
