import { useState } from 'react'
import { Button, Card, InputField, PageHeader, SelectField, SkeletonBlock, StatCard, TextareaField } from '../components/ui'
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
  const { company, employees, modules, balance, pricingPlans, supportedLanguages, uiLanguage, themeMode, saveCompanyProfile, t } = usePrototype()
  const loading = useSimulatedLoading('company-console', 260)
  const [companyName, setCompanyName] = useState(company.companyName)
  const [industry, setIndustry] = useState(company.industry)
  const [teamSize, setTeamSize] = useState(company.teamSize)
  const [countryRegion, setCountryRegion] = useState(company.countryRegion)
  const [website, setWebsite] = useState(company.website)
  const [linkedIn, setLinkedIn] = useState(company.linkedIn)
  const [adminEmail, setAdminEmail] = useState(company.adminEmail)
  const [description, setDescription] = useState(company.description)
  const currentPlan = pricingPlans.find((plan) => plan.id === balance.planId) ?? pricingPlans[0]
  const currentLanguage = supportedLanguages.find((language) => language.code === uiLanguage)

  if (loading) {
    return <CompanySkeleton />
  }

  return (
    <div className="page-stack">
      <PageHeader title={t('navCompany')} description={t('companyDescription')} />

      <section className="stats-grid four-up">
        <StatCard label={t('navEmployees')} value={String(employees.length)} />
        <StatCard label={t('navModules')} value={String(modules.filter((module) => module.enabled).length)} />
        <StatCard label={t('language')} value={currentLanguage?.nativeLabel ?? uiLanguage.toUpperCase()} />
        <StatCard label={t('currentPlan')} value={currentPlan.name} />
      </section>

      <section className="company-grid company-grid-expanded">
        <Card title="Company details" subtitle="Edit managed account information">
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
            <InputField label={t('theme')} value={themeMode} readOnly />
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
              {t('save')}
            </Button>
          </div>
        </Card>

        <Card title="Account summary" subtitle="Managed business entity view">
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
              <span className="row-title">{t('language')}</span>
              <span className="row-meta">{currentLanguage?.nativeLabel ?? uiLanguage.toUpperCase()}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">{t('currentPlan')}</span>
              <span className="row-meta">{currentPlan.priceLabel}</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
