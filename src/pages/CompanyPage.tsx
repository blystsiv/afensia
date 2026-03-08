import { useState } from 'react'
import { Button, Card, InputField, PageHeader, SelectField, SkeletonBlock, StatCard, TextareaField } from '../components/ui'
import { usePrototype } from '../context/PrototypeContext'
import { formatCurrency, formatNumber } from '../lib/format'
import { useSimulatedLoading } from '../lib/useSimulatedLoading'

function CompanySkeleton() {
  return (
    <div className="page-stack">
      <div className="stats-grid four-up">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <SkeletonBlock lines={3} />
          </Card>
        ))}
      </div>
      <Card>
        <SkeletonBlock lines={8} />
      </Card>
    </div>
  )
}

export function CompanyPage() {
  const { company, employees, modules, balance, usageTiers, supportedLanguages, uiLanguage, themeMode, saveCompanyProfile, t } = usePrototype()
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
  const currentUsageTier = usageTiers.find((tier) => tier.id === balance.usageTierId) ?? usageTiers[0]
  const currentLanguage = supportedLanguages.find((language) => language.code === uiLanguage)
  const themeLabel = themeMode === 'light' ? 'Light' : 'Dark'
  const usageProgress = Math.min(100, Math.round((balance.usedCredits / balance.monthlyAllowance) * 100))

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

      <section className="stats-grid four-up">
        <StatCard label={t('navEmployees')} value={formatNumber(employees.length)} />
        <StatCard label={t('navModules')} value={formatNumber(modules.filter((module) => module.enabled).length)} />
        <StatCard label={t('usageTier')} value={currentUsageTier.name} />
        <StatCard label={t('remainingBalance')} value={formatCurrency(balance.remainingBalance, balance.currency)} />
      </section>

      <section className="company-profile-layout">
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

        <Card className="company-profile-side" title="Workspace summary" subtitle="Current account state">
          <div className="usage-meter usage-meter-card">
            <div className="usage-meter-head">
              <span>{usageProgress}% used</span>
              <strong>{formatNumber(balance.monthlyAllowance - balance.usedCredits)} credits left</strong>
            </div>
            <div className="usage-meter-track">
              <span style={{ width: `${usageProgress}%` }} />
            </div>
          </div>
          <div className="summary-list compact-summary-list">
            <div className="summary-row compact-row">
              <span className="row-title">{t('language')}</span>
              <span className="row-meta">{currentLanguage?.nativeLabel ?? uiLanguage.toUpperCase()}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">{t('theme')}</span>
              <span className="row-meta">{themeLabel}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">{t('usageTier')}</span>
              <span className="row-meta">{currentUsageTier.name}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">{t('creditsUsed')}</span>
              <span className="row-meta">{formatNumber(balance.usedCredits)} / {formatNumber(balance.monthlyAllowance)}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">{t('workspaceFee')}</span>
              <span className="row-meta">{formatCurrency(balance.workspaceFee, balance.currency)}</span>
            </div>
          </div>
        </Card>
      </section>

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
