import { Button, Modal } from './ui'

export function StripePreviewModal({
  open,
  onClose,
  workspaceFee,
  usageTier,
  usagePrice,
  paymentMode,
  creditRate,
}: {
  open: boolean
  onClose: () => void
  workspaceFee: string
  usageTier: string
  usagePrice: string
  paymentMode: string
  creditRate: string
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Stripe checkout preview"
      description="Frontend-only billing preview. No real charges or payment processing."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose}>Confirm preview</Button>
        </>
      }
    >
      <div className="stripe-preview-grid">
        <section className="stripe-preview-panel">
          <div className="stripe-preview-head">
            <strong>Payment details</strong>
            <span className="field-hint">Preview only</span>
          </div>
          <div className="stripe-preview-fields">
            <div className="stripe-preview-field">
              <span className="meta-label">Billing email</span>
              <strong>avery@northhillbev.com</strong>
            </div>
            <div className="stripe-preview-field">
              <span className="meta-label">Cardholder</span>
              <strong>Avery Thompson</strong>
            </div>
            <div className="stripe-preview-field">
              <span className="meta-label">Card number</span>
              <strong>4242 4242 4242 4242</strong>
            </div>
            <div className="stripe-preview-row">
              <div className="stripe-preview-field">
                <span className="meta-label">Expiry</span>
                <strong>12 / 29</strong>
              </div>
              <div className="stripe-preview-field">
                <span className="meta-label">CVC</span>
                <strong>123</strong>
              </div>
            </div>
            <div className="stripe-preview-field">
              <span className="meta-label">Company</span>
              <strong>NorthHill Beverage Group</strong>
            </div>
          </div>
        </section>

        <aside className="stripe-summary-card">
          <div className="stripe-preview-head">
            <strong>Order summary</strong>
            <span className="field-hint">{paymentMode}</span>
          </div>
          <div className="summary-list compact-summary-list">
            <div className="summary-row compact-row">
              <span className="row-title">Workspace fee</span>
              <span className="row-meta">{workspaceFee}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">Usage volume</span>
              <span className="row-meta">{usageTier}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">Credit rate</span>
              <span className="row-meta">{creditRate}</span>
            </div>
            <div className="summary-row compact-row">
              <span className="row-title">Estimated charge</span>
              <span className="row-meta">{usagePrice}</span>
            </div>
          </div>
        </aside>
      </div>
    </Modal>
  )
}
