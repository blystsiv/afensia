import { useState } from 'react'
import {
  Button,
  Card,
  InputField,
  PageHeader,
  SelectField,
  SkeletonBlock,
  StatCard,
  TextareaField,
} from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { useSimulatedLoading } from '../lib/useSimulatedLoading'

function CompanySkeleton() {
  return (
    <div className="page-stack">
      <div className="stats-grid five-up">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={3} />
          </Card>
        ))}
      </div>
      <div className="company-grid">
        <Card>
          <SkeletonBlock lines={8} />
        </Card>
        <Card>
          <SkeletonBlock lines={5} />
        </Card>
      </div>
    </div>
  )
}

export function CompanyPage() {
  const { company, employees, modules, uiLanguage, themeMode, saveCompanyProfile } = usePrototype()
  const loading = useSimulatedLoading('company-console', 260)
  const [companyName, setCompanyName] = useState(company.companyName)
  const [industry, setIndustry] = useState(company.industry)
  const [teamSize, setTeamSize] = useState(company.teamSize)
  const [countryRegion, setCountryRegion] = useState(company.countryRegion)
  const [website, setWebsite] = useState(company.website)
  const [linkedIn, setLinkedIn] = useState(company.linkedIn)
  const [adminEmail, setAdminEmail] = useState(company.adminEmail)
  const [description, setDescription] = useState(company.description)

  if (loading) {
    return <CompanySkeleton />
  }

  return (
    <div className="page-stack">
      <PageHeader title="Company" description="Managed business account" />

      <section className="stats-grid five-up">
        <StatCard label="Company status" value={company.status} />
        <StatCard label="Employees" value={String(employees.length)} />
        <StatCard label="Enabled modules" value={String(modules.filter((module) => module.enabled).length)} />
        <StatCard label="Language" value={uiLanguage.toUpperCase()} />
        <StatCard label="Theme" value={themeMode} />
      </section>

      <section className="company-grid">
        <Card title="Company details" subtitle="Edit managed account information">
          <div className="form-grid two-col">
            <InputField label="Company name" value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
            <InputField label="Admin email" type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} />
            <InputField label="Industry" value={industry} onChange={(event) => setIndustry(event.target.value)} />
            <SelectField label="Team size" value={teamSize} onChange={(event) => setTeamSize(event.target.value)}>
              <option>1-10 employees</option>
              <option>11-50 employees</option>
              <option>51-200 employees</option>
              <option>201-500 employees</option>
              <option>500+ employees</option>
            </SelectField>
            <InputField label="Country / region" value={countryRegion} onChange={(event) => setCountryRegion(event.target.value)} />
            <InputField label="Website" value={website} onChange={(event) => setWebsite(event.target.value)} />
            <InputField label="LinkedIn" value={linkedIn} onChange={(event) => setLinkedIn(event.target.value)} />
            <div />
            <TextareaField label="Business description" rows={5} value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="form-actions align-start">
            <Button
              onClick={() =>
                saveCompanyProfile({
                  companyName,
                  industry,
                  teamSize,
                  countryRegion,
                  website,
                  linkedIn,
                  adminEmail,
                  description,
                })
              }
            >
              Save company details
            </Button>
          </div>
        </Card>

        <Card title="Account summary" subtitle="Current business entity view">
          <div className="summary-list compact-summary-list">
            <div className="summary-row compact-row">
              <span className="row-title">Support contact</span>
              <span className="row-meta">{company.supportContact}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">Website</span>
              <span className="row-meta">{website}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">LinkedIn</span>
              <span className="row-meta">{linkedIn}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">Selected language</span>
              <span className="row-meta">{uiLanguage.toUpperCase()}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">Selected theme</span>
              <span className="row-meta">{themeMode}</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
