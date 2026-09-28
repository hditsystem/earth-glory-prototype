import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileText,
  MapPin,
  ReceiptText,
  Search,
  ShieldCheck,
  Store,
  WalletCards,
} from 'lucide-react'
import './marketplace.css'

const customerSteps = [
  {
    icon: Search,
    step: '01',
    title: 'Discover',
    body: 'Search a defined service, Calgary area and time window.',
  },
  {
    icon: ShieldCheck,
    step: '02',
    title: 'Compare',
    body: 'See the provider, service variant, total price, policies and precise checks.',
  },
  {
    icon: CalendarClock,
    step: '03',
    title: 'Book',
    body: 'Choose a time that is rechecked before confirming one provider per order.',
  },
  {
    icon: ReceiptText,
    step: '04',
    title: 'Receive documents',
    body: 'Get a booking confirmation. After payment, receive a receipt naming the provider; invoices or credit notes appear only when applicable.',
  },
  {
    icon: CheckCircle2,
    step: '05',
    title: 'Get support',
    body: 'Use clear cancellation, refund, dispute and rebooking paths.',
  },
]

const moneySteps = [
  ['Order paid', 'The customer payment and booking remain separate, traceable records.'],
  ['Fee recorded', 'Channel attribution and the effective fee-policy and agreement version are snapshotted with the order.'],
  ['Outcome applied', 'Completion, cancellation, refund or dispute determines the final amount.'],
  ['Earnings available', 'Earnings eligibility is tracked separately from appointment, transfer and bank-payout status.'],
  ['Processor balance and payout', 'Eligible funds move through processor balance and bank-payout states; a transfer appears only when the approved charge model requires it.'],
  ['Reconciled', 'The order, charge, fee, refund and payout are matched without rewriting history.'],
  ['Late adjustment', 'A later refund or dispute posts as a new adjustment and can affect reserves, a negative balance or a future payout.'],
]

const documents = [
  ['Customer service invoice or receipt', 'Issued in the named beauty provider’s identity.'],
  ['Platform fee invoice', 'Issued by the platform to the provider for approved platform services.'],
  ['Provider settlement statement', 'Explains collections, fees, adjustments and payout allocation.'],
  ['Credit note', 'Adjusts an issued service or platform-fee invoice when required.'],
  ['Refund receipt', 'Confirms when money was actually returned to the customer.'],
]

function MarketplacePreview({ onBack }) {
  const [perspective, setPerspective] = useState('customer')
  const [service, setService] = useState('Facials')
  const [area, setArea] = useState('Beltline & Mission')
  const [timing, setTiming] = useState('Next 7 days')
  const titleRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    titleRef.current?.focus()
  }, [])

  function previewJourney(event) {
    event.preventDefault()
    setPerspective('customer')
    window.requestAnimationFrame(() => {
      document.getElementById('marketplace-journey')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      document.getElementById('customer-tab')?.focus({ preventScroll: true })
    })
  }

  function showProviderTools() {
    setPerspective('provider')
    window.requestAnimationFrame(() => {
      document.getElementById('marketplace-journey')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      document.getElementById('provider-tab')?.focus({ preventScroll: true })
    })
  }

  function handlePerspectiveKeyDown(event) {
    let nextPerspective
    if (event.key === 'ArrowLeft' || event.key === 'Home') nextPerspective = 'customer'
    if (event.key === 'ArrowRight' || event.key === 'End') nextPerspective = 'provider'
    if (!nextPerspective) return

    event.preventDefault()
    setPerspective(nextPerspective)
    window.requestAnimationFrame(() => document.getElementById(`${nextPerspective}-tab`)?.focus())
  }

  return (
    <div className="marketplace-shell">
      <div className="marketplace-concept-bar">
        <span>Future Calgary concept</span>
        <p>Sample structure only · No live providers, availability, payments, invoices or payouts</p>
      </div>

      <header className="marketplace-header">
        <button className="marketplace-back" type="button" onClick={onBack}>
          <ArrowLeft size={17} /> Back to Earth Glory
        </button>
        <a className="marketplace-wordmark" href="#marketplace-top" aria-label="Calgary beauty marketplace preview home">
          <span>CB</span>
          <div>
            <strong>Calgary Beauty</strong>
            <small>Working name · Marketplace preview</small>
          </div>
        </a>
        <button className="marketplace-provider-link" type="button" onClick={showProviderTools}>
          See provider tools <ArrowRight size={15} />
        </button>
      </header>

      <main id="marketplace-top">
        <section className="marketplace-hero">
          <div className="marketplace-hero-copy">
            <div className="marketplace-kicker"><span /> Planned Calgary expansion</div>
            <h1 ref={titleRef} tabIndex="-1">Beauty nearby,<br /><em>booked clearly.</em></h1>
            <p>
              A future marketplace for discovering eligible local beauty providers, comparing availability and total price, and booking one provider at a time—with availability rechecked before confirmation.
            </p>
            <div className="marketplace-hero-points">
              <span><ShieldCheck size={17} /> Precise provider checks</span>
              <span><ReceiptText size={17} /> Clear receipts and policies</span>
              <span><WalletCards size={17} /> Traceable provider earnings</span>
            </div>
          </div>

          <form className="marketplace-search" onSubmit={previewJourney} aria-label="Sample Calgary marketplace search">
            <div className="search-card-heading">
              <div>
                <small>Discovery concept</small>
                <strong>What would you like to find?</strong>
              </div>
              <span>Sample</span>
            </div>
            <label>
              <span>Service</span>
              <select value={service} onChange={(event) => setService(event.target.value)}>
                <option>Facials</option>
                <option>Lashes & brows</option>
                <option>Nails</option>
                <option>Makeup</option>
              </select>
            </label>
            <label>
              <span>Calgary area</span>
              <select value={area} onChange={(event) => setArea(event.target.value)}>
                <option>Beltline & Mission</option>
                <option>Kensington</option>
                <option>Bridgeland</option>
                <option>Northwest Calgary</option>
              </select>
            </label>
            <label>
              <span>When</span>
              <select value={timing} onChange={(event) => setTiming(event.target.value)}>
                <option>Next 7 days</option>
                <option>This weekend</option>
                <option>Evenings</option>
              </select>
            </label>
            <button className="marketplace-search-button" type="submit">
              Preview this journey <ArrowRight size={17} />
            </button>
            <p>No search is sent and no Calgary provider inventory is connected.</p>
          </form>
        </section>

        <section className="marketplace-boundary" aria-label="Marketplace readiness boundary">
          <div><strong>One launch cell at a time</strong><span>Service × area × mode × time</span></div>
          <div><strong>Authoritative checkout recheck</strong><span>Search availability may be cached</span></div>
          <div><strong>One provider per order</strong><span>No split payment in the first release</span></div>
          <div><strong>Open only after readiness gates</strong><span>Supply, safety, support and reconciliation</span></div>
        </section>

        <section className="marketplace-journey" id="marketplace-journey">
          <div className="marketplace-section-heading">
            <div>
              <div className="marketplace-kicker dark"><span /> Two sides, one clear record</div>
              <h2>See how the marketplace would work.</h2>
            </div>
            <p>Switch between the client journey and the provider’s money view. Both are conceptual; neither connects to a backend.</p>
          </div>

          <div className="perspective-tabs" role="tablist" aria-label="Marketplace perspective">
            <button
              id="customer-tab"
              type="button"
              role="tab"
              aria-selected={perspective === 'customer'}
              aria-controls="customer-panel"
              tabIndex={perspective === 'customer' ? 0 : -1}
              className={perspective === 'customer' ? 'active' : ''}
              onClick={() => setPerspective('customer')}
              onKeyDown={handlePerspectiveKeyDown}
            >
              Customer journey
            </button>
            <button
              id="provider-tab"
              type="button"
              role="tab"
              aria-selected={perspective === 'provider'}
              aria-controls="provider-panel"
              tabIndex={perspective === 'provider' ? 0 : -1}
              className={perspective === 'provider' ? 'active' : ''}
              onClick={() => setPerspective('provider')}
              onKeyDown={handlePerspectiveKeyDown}
            >
              Provider money view
            </button>
          </div>

          {perspective === 'customer' ? (
            <div id="customer-panel" role="tabpanel" aria-labelledby="customer-tab" className="customer-concept-panel">
              <div className="sample-query">
                <Search size={19} />
                <span><small>Sample search context</small><strong>{service} · {area} · {timing}</strong></span>
                <em>No results connected</em>
              </div>

              <div className="customer-step-grid">
                {customerSteps.map(({ icon: Icon, step, title, body }) => (
                  <article key={step}>
                    <div><span>{step}</span><Icon size={21} /></div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                ))}
              </div>

              <div className="result-anatomy">
                <div className="result-anatomy-copy">
                  <div className="marketplace-kicker dark"><span /> What every result must explain</div>
                  <h3>Enough information to choose with confidence.</h3>
                  <p>A real listing appears only after the provider and service meet the applicable publishing and booking requirements.</p>
                </div>
                <div className="result-requirements">
                  <div><Store size={18} /><span><strong>Named provider</strong><small>Business, practitioner and service mode</small></span></div>
                  <div><CircleDollarSign size={18} /><span><strong>Attainable total</strong><small>Service, tax and any mandatory amount</small></span></div>
                  <div><Clock3 size={18} /><span><strong>Checkout recheck</strong><small>Derived availability is confirmed against the booking source of truth</small></span></div>
                  <div><FileCheck2 size={18} /><span><strong>Precise checks</strong><small>What was checked and through which date</small></span></div>
                  <div><MapPin size={18} /><span><strong>Location mode</strong><small>Studio, home-based or mobile service area</small></span></div>
                  <div><FileText size={18} /><span><strong>Accepted policy</strong><small>Cancellation and refund wording saved with the order</small></span></div>
                </div>
              </div>
            </div>
          ) : (
            <div id="provider-panel" role="tabpanel" aria-labelledby="provider-tab" className="provider-concept-panel">
              <div className="channel-grid">
                <article>
                  <span className="channel-icon"><Building2 size={20} /></span>
                  <small>Provider direct</small>
                  <h3>Your client, your booking page.</h3>
                  <p>The business shares its own page and manages services, schedule and policies.</p>
                  <strong>Planned: 0% marketplace commission on clients the provider brings directly. Other agreed subscription, processing, messaging, tax or optional-service fees may apply.</strong>
                </article>
                <article className="marketplace-channel-card">
                  <span className="channel-icon"><Search size={20} /></span>
                  <small>Marketplace acquired</small>
                  <h3>Demand created through discovery.</h3>
                  <p>The client finds the provider through marketplace search and books through the marketplace journey.</p>
                  <strong>Any acquisition fee is agreed and shown before marketplace bookings are enabled.</strong>
                </article>
              </div>

              <div className="money-view-grid">
                <div className="money-flow-card">
                  <div className="money-card-heading">
                    <div><small>Settlement lifecycle</small><h3>From order to bank payout.</h3></div>
                    <span>Amounts hidden</span>
                  </div>
                  <div className="settlement-anatomy">
                    <small>Illustrative anatomy · not a promised fee schedule</small>
                    <p>Service + tax + tip − discount − refund − processor fee − marketplace fee ± adjustment = net earnings</p>
                    <div>
                      <span><em>Booking source</em><strong>Direct | Marketplace</strong></span>
                      <span><em>Fee policy</em><strong>Version saved with order</strong></span>
                      <span><em>Allocation</em><strong>Pending | Paid | Failed</strong></span>
                    </div>
                  </div>
                  <ol>
                    {moneySteps.map(([title, body], index) => (
                      <li key={title}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div><strong>{title}</strong><p>{body}</p></div>
                      </li>
                    ))}
                  </ol>
                  <div className="money-clarity-note">
                    <WalletCards size={19} />
                    <p><strong>Separate operational and money states</strong>Appointment, earnings eligibility, connected-account transfer and bank payout are never treated as the same thing.</p>
                  </div>
                </div>

                <aside className="document-card">
                  <div className="money-card-heading">
                    <div><small>Document trail</small><h3>Each document has one job.</h3></div>
                  </div>
                  <div className="document-list">
                    {documents.map(([title, body], index) => (
                      <div key={title}>
                        <span>{index + 1}</span>
                        <p><strong>{title}</strong><small>{body}</small></p>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            </div>
          )}

          <div className="marketplace-disclaimer">
            <ShieldCheck size={19} />
            <p><strong>Concept flow only.</strong> There are no Calgary listings, provider checks, payment processing, invoices or payouts connected to this prototype.</p>
          </div>
        </section>

        <section className="marketplace-roadmap">
          <div className="marketplace-kicker light"><span /> Build in evidence-led stages</div>
          <h2>Prove the booking core.<br />Then earn the marketplace.</h2>
          <div className="roadmap-track">
            <div><span>Now</span><strong>Earth Glory design partner</strong><small>Catalogue, journey and owner workflow</small></div>
            <div><span>Next</span><strong>Calgary direct pilot</strong><small>Live scheduling, payment and reconciliation</small></div>
            <div><span>Then</span><strong>Provider cohort</strong><small>Verified supply and current calendars</small></div>
            <div><span>Beta</span><strong>Closed launch cell</strong><small>One category and area at a time</small></div>
            <div><span>Gate</span><strong>Public marketplace</strong><small>Only after liquidity and safety targets pass</small></div>
          </div>
          <button className="marketplace-roadmap-button" type="button" onClick={onBack}>
            Return to the Earth Glory prototype <ArrowRight size={17} />
          </button>
        </section>
      </main>

      <footer className="marketplace-footer">
        <span>Calgary beauty marketplace concept · 2026</span>
        <span>Earth Glory is the design partner, not a Calgary listing</span>
        <span>No live marketplace or financial activity</span>
      </footer>
    </div>
  )
}

export default MarketplacePreview
