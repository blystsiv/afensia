import { useState } from 'react'
import { Button, Card, InputField, PageHeader, SelectField, SkeletonBlock, TextareaField } from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { useSimulatedLoading } from '../lib/useSimulatedLoading'

function CompanySkeleton() {
  return (
    <div className="page-stack">
      <Card>
        <SkeletonBlock lines={10} />
      </Card>
    </div>
  )
}

export function CompanyPage() {
  const { company, saveCompanyProfile, t } = usePrototype()
  const loading = useSimulatedLoading('company-console', 260)
  const [editing, setEditing] = useState(false)
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
      <PageHeader
        title={t('navCompany')}
        description={t('companyDescription')}
        action={<Button variant={editing ? 'secondary' : 'primary'} onClick={() => setEditing((current) => !current)}>{editing ? t('cancel') : 'Edit profile'}</Button>}
      />

      <Card className="company-profile-card" title={t('companyProfile')} subtitle="Business account details">
        <div className="company-profile-grid">
          <div className="company-profile-item">
            <span className="meta-label">{t('companyName')}</span>
            <strong>{company.companyName}</strong>
          </div>
          <div className="company-profile-item">
            <span className="meta-label">{t('industry')}</span>
            <strong>{company.industry}</strong>
          </div>
          <div className="company-profile-item">
            <span className="meta-label">{t('teamSize')}</span>
            <strong>{company.teamSize}</strong>
          </div>
          <div className="company-profile-item">
            <span className="meta-label">{t('countryRegion')}</span>
            <strong>{company.countryRegion}</strong>
          </div>
          <div className="company-profile-item">
            <span className="meta-label">{t('website')}</span>
            <strong>{company.website}</strong>
          </div>
          <div className="company-profile-item">
            <span className="meta-label">{t('linkedIn')}</span>
            <strong>{company.linkedIn}</strong>
          </div>
          <div className="company-profile-item">
            <span className="meta-label">{t('adminEmail')}</span>
            <strong>{company.adminEmail}</strong>
          </div>
          <div className="company-profile-item">
            <span className="meta-label">Support</span>
            <strong>{company.supportContact}</strong>
          </div>
        </div>
        <div className="company-profile-copy">{company.description}</div>
      </Card>

      {editing ? (
        <Card title="Edit company" subtitle="Update profile details">
          <div className="form-grid two-col">
            <InputField label={t('companyName')} value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
            <InputField label={t('adminEmail')} type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} />
            <InputField label={t('industry')} value={industry} onChange={(event) => setIndustry(event.target.value)} />
            <SelectField label={t('teamSize')} value={teamSize} onChange={(event) => setTeamSize(event.target.value)}>
              <option>1-10 employees</option>
              <option>11-50 employees</option>
              <option>51-200 employees</option>
              <option>201-500 employees</option>
              <option>500+ employees</option>
            </SelectField>
            <InputField label={t('countryRegion')} value={countryRegion} onChange={(event) => setCountryRegion(event.target.value)} />
            <InputField label={t('website')} value={website} onChange={(event) => setWebsite(event.target.value)} />
            <InputField label={t('linkedIn')} value={linkedIn} onChange={(event) => setLinkedIn(event.target.value)} />
            <InputField label="Support email" value={company.supportContact} readOnly />
            <TextareaField label="Description" rows={5} value={description} onChange={(event) => setDescription(event.target.value)} />
          </div>
          <div className="form-actions align-start">
            <Button
              onClick={() => {
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
                setEditing(false)
              }}
            >
              {t('save')}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  )
}
