import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Heart,
  Leaf,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import heroImage from './assets/earth-glory-hero.png'
import { RoleSwitcher, RoleWorkspace } from './RoleViews'

const prototypeRoleIds = ['guest', 'client', 'practitioner', 'owner']

const services = [
  {
    id: 'back-neck-shoulders',
    category: 'Massage',
    eyebrow: 'Focused care',
    name: 'Back, Neck & Shoulders Massage',
    description: 'A focused 30-minute massage for the back, neck and shoulders.',
    duration: 30,
    price: 28,
    tone: 'sand',
    icon: Sparkles,
  },
  {
    id: 'aromatherapy-massage',
    category: 'Massage',
    eyebrow: 'Full-body care',
    name: 'Aromatherapy Massage',
    description: 'A full-body massage using aromatic oils, with pressure agreed at the start of the appointment.',
    duration: 60,
    price: 60,
    tone: 'clay',
    icon: Leaf,
  },
  {
    id: 'shellac-manicure',
    category: 'Nails',
    eyebrow: 'Long-wear colour',
    name: 'Shellac Manicure',
    description: 'A manicure for the hands, finished with Shellac colour.',
    duration: 50,
    price: 30,
    tone: 'sage',
    icon: Heart,
  },
  {
    id: 'high-frequency-facial',
    category: 'Facials',
    eyebrow: 'Targeted skincare',
    name: 'High Frequency Facial',
    description: 'A 60-minute facial that includes high-frequency equipment as part of the treatment.',
    duration: 60,
    price: 75,
    tone: 'rose',
    icon: Sparkles,
  },
  {
    id: 'eyebrow-threading',
    category: 'Brows & lashes',
    eyebrow: 'Precise shaping',
    name: 'Eyebrow Threading',
    description: 'Precise eyebrow shaping for a clean, natural-looking finish.',
    duration: 10,
    price: 8,
    tone: 'moss',
    icon: Leaf,
  },
  {
    id: 'eyelash-tint',
    category: 'Brows & lashes',
    eyebrow: 'Natural definition',
    name: 'Eyelash Tint',
    description: 'Tint applied to the natural lashes. A patch test may be required.',
    duration: 15,
    price: 15,
    tone: 'plum',
    icon: Heart,
  },
]

const practitioners = [
  {
    id: 'avni',
    name: 'Avni',
    role: 'Qualified beauty therapist',
    initials: 'A',
    specialties: 'NVQ Levels 1–4 · 14+ years of industry experience',
  },
]

const faqs = [
  ['What is the cancellation policy?', 'Earth Glory is finalising its cancellation, rescheduling and late-cancellation terms. The complete policy will appear before a client confirms a live booking.'],
  ['Will clients pay online?', 'The live booking journey will clearly show whether payment is due online or at the venue. No payment is taken in this prototype.'],
  ['What should clients know before arrival?', 'Preparation, patch-test and arrival instructions will be shown for each relevant treatment and included in the booking confirmation.'],
  ['Is step-free access available?', 'Accessibility and venue-access details are being confirmed and will be published before live booking opens.'],
]

function formatMoney(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)
}

function formatLondonDate(date, options) {
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'Europe/London' }).format(date)
}

function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

function upcomingDates() {
  const days = []
  const todayParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date())
  const part = (type) => Number(todayParts.find((item) => item.type === type)?.value)
  const cursor = new Date(Date.UTC(part('year'), part('month') - 1, part('day'), 12))

  for (let i = 1; i <= 7; i += 1) {
    const date = new Date(cursor)
    date.setUTCDate(cursor.getUTCDate() + i)
    days.push(date)
  }
  return days.slice(0, 5)
}

function roleFromLocation() {
  const requestedRole = new URL(window.location.href).searchParams.get('role')
  return prototypeRoleIds.includes(requestedRole) ? requestedRole : 'guest'
}

function App() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(services[0])
  const [category, setCategory] = useState('All treatments')
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)
  const [activeRole, setActiveRole] = useState(roleFromLocation)
  const menuButtonRef = useRef(null)

  const categories = ['All treatments', ...new Set(services.map((service) => service.category))]
  const filteredServices = category === 'All treatments'
    ? services
    : services.filter((service) => service.category === category)

  useEffect(() => {
    const url = new URL(window.location.href)
    let shouldReplaceUrl = false
    if (url.searchParams.has('view')) {
      url.searchParams.delete('view')
      shouldReplaceUrl = true
    }
    if (url.searchParams.has('role') && !prototypeRoleIds.includes(url.searchParams.get('role'))) {
      url.searchParams.delete('role')
      shouldReplaceUrl = true
    }
    if (shouldReplaceUrl) window.history.replaceState(window.history.state, '', url)

    const handleHistoryChange = () => {
      setActiveRole(roleFromLocation())
      setBookingOpen(false)
      setMenuOpen(false)
    }

    window.addEventListener('popstate', handleHistoryChange)
    return () => window.removeEventListener('popstate', handleHistoryChange)
  }, [])

  useEffect(() => {
    if (!menuOpen) return undefined

    const closeMenu = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        window.requestAnimationFrame(() => menuButtonRef.current?.focus())
      }
    }
    window.addEventListener('keydown', closeMenu)
    return () => window.removeEventListener('keydown', closeMenu)
  }, [menuOpen])

  function startBooking(service = services[0]) {
    setSelectedService(service)
    setBookingOpen(true)
  }

  function switchRole(role) {
    if (!prototypeRoleIds.includes(role)) return

    const url = new URL(window.location.href)
    url.searchParams.delete('view')
    if (role === 'guest') url.searchParams.delete('role')
    else url.searchParams.set('role', role)
    window.history.pushState({ ...window.history.state, prototypeRole: role }, '', url)
    setActiveRole(role)
    setBookingOpen(false)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <div className="concept-bar">
        <span>Feedback prototype</span>
        <p>Four connected user views · No live bookings or payments</p>
      </div>

      <RoleSwitcher activeRole={activeRole} onChange={switchRole} />

      {activeRole === 'guest' ? (
        <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Earth Glory home">
          <span className="brand-mark">EG</span>
          <span className="brand-copy">
            <strong>Earth Glory</strong>
            <small>Beauty · Massage · Nails</small>
          </span>
        </a>

        <nav id="primary-navigation" className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary navigation">
          <a href="#treatments" onClick={() => setMenuOpen(false)}>Treatments</a>
          <a href="#studio" onClick={() => setMenuOpen(false)}>Our studio</a>
          <a href="#reviews" onClick={() => setMenuOpen(false)}>Kind words</a>
          <a href="#visit" onClick={() => setMenuOpen(false)}>Visit</a>
        </nav>

        <div className="header-actions">
          <button className="text-button" type="button" onClick={() => switchRole('client')}>Client portal</button>
          <button className="button button-dark hide-mobile" type="button" onClick={() => startBooking()}>
            Try booking
          </button>
          <button
            ref={menuButtonRef}
            className="menu-button"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <img className="hero-image" src={heroImage} alt="A calm treatment room in warm morning light" />
          <div className="hero-wash" />
          <div className="hero-content">
            <div className="eyebrow"><span /> Beauty, massage & nails in West Kensington</div>
            <h1>Your glow,<br /><em>unhurried.</em></h1>
            <p>
              Thoughtful massage, facial, nail and lash treatments from a qualified, experienced beauty therapist—created to help you feel relaxed, refreshed and cared for.
            </p>
            <div className="hero-actions">
              <button className="button button-dark button-large" type="button" onClick={() => startBooking()}>
                Explore booking <ArrowRight size={17} />
              </button>
              <a className="button button-light button-large" href="#treatments">Explore the menu</a>
            </div>
            <div className="hero-details">
              <span><MapPin size={16} /> West Kensington · London</span>
              <span><CheckCircle2 size={16} /> 14+ years of industry experience</span>
            </div>
          </div>

          <div className="availability-card" aria-label="Prototype booking flow">
            <div className="pulse-dot" />
            <div>
              <small>Prototype booking flow</small>
              <strong>Try sample dates and times</strong>
            </div>
            <button type="button" aria-label="Open booking prototype" onClick={() => startBooking()}>
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <section className="trust-row" aria-label="Studio highlights">
          <div><Leaf size={21} /><span><strong>Qualified care</strong><small>NVQ Levels 1–4</small></span></div>
          <div><MapPin size={21} /><span><strong>Easy to reach</strong><small>2 minutes from West Kensington station</small></span></div>
          <div><ShieldCheck size={21} /><span><strong>Clear booking</strong><small>Price and duration shown before confirmation</small></span></div>
          <div><Heart size={21} /><span><strong>Personal service</strong><small>Treatment provided by Avni</small></span></div>
        </section>

        <section className="section treatment-section" id="treatments">
          <div className="section-heading treatment-heading">
            <div>
              <div className="eyebrow dark"><span /> Current service highlights</div>
              <h2>Find the right treatment for you.</h2>
            </div>
            <p>Browse a sample of the treatment menu. Prices and availability remain draft until Earth Glory confirms the launch catalogue.</p>
          </div>

          <div className="category-tabs" role="list" aria-label="Treatment categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? 'active' : ''}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="service-grid">
            {filteredServices.map((service) => {
              const Icon = service.icon
              return (
                <article className={`service-card tone-${service.tone}`} key={service.id}>
                  <div className="service-card-top">
                    <span>{service.eyebrow}</span>
                    <div className="service-icon"><Icon size={22} strokeWidth={1.5} /></div>
                  </div>
                  <div>
                    <small>{service.category}</small>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                  </div>
                  <div className="service-card-bottom">
                    <div>
                      <strong>{formatMoney(service.price)}</strong>
                      <span><Clock3 size={14} /> {service.duration} min</span>
                    </div>
                    <button type="button" onClick={() => startBooking(service)} aria-label={`Select ${service.name}`}>
                      Select <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="ritual-banner" id="studio">
          <div
            className="ritual-photo"
            role="img"
            aria-label="Warm, minimal beauty studio interior"
            style={{ backgroundImage: `linear-gradient(rgba(70,46,33,.1), rgba(70,46,33,.18)), url(${heroImage})` }}
          />
          <div className="ritual-copy">
            <div className="eyebrow light"><span /> The Earth Glory approach</div>
            <h2>Professional care.<br />Personal attention.</h2>
            <p>
              Avni brings professional training and more than 14 years of beauty-industry experience to each appointment. Every visit begins with a brief consultation so the treatment can reflect the client’s goals and comfort.
            </p>
            <div className="ritual-points">
              <div><span>01</span><p><strong>Start with a consultation</strong>Confirm goals, comfort and relevant sensitivities before treatment begins.</p></div>
              <div><span>02</span><p><strong>Tailor the treatment</strong>Adjust the service and approach to the client and chosen treatment.</p></div>
              <div><span>03</span><p><strong>Set clear expectations</strong>Show price, duration, preparation and policies before booking.</p></div>
            </div>
          </div>
        </section>

        <section className="section meet-section">
          <div className="meet-copy">
            <div className="eyebrow dark"><span /> Meet your therapist</div>
            <h2>Qualified care,<br />delivered with warmth.</h2>
            <p>Avni is an NVQ Levels 1–4 qualified beauty therapist with more than 14 years of industry experience, including work in Central London since 2017.</p>
            <div className="mini-credentials">
              <span><CheckCircle2 size={17} /> NVQ Levels 1–4</span>
              <span><CheckCircle2 size={17} /> 14+ years’ experience</span>
              <span><CheckCircle2 size={17} /> Skin & body care</span>
            </div>
            <button className="link-arrow" type="button" onClick={() => startBooking()}>
              Try booking with Avni <ArrowRight size={17} />
            </button>
          </div>
          <div className="portrait-card">
            <div className="portrait-art">
              <div className="portrait-monogram">A</div>
              <div className="botanical botanical-one" />
              <div className="botanical botanical-two" />
            </div>
            <div className="portrait-caption">
              <span><strong>Avni</strong>Qualified beauty therapist</span>
              <small>Massage · Nails · Facials</small>
            </div>
          </div>
        </section>

        <section className="review-section" id="reviews">
          <div className="section-heading centered">
            <div className="eyebrow dark"><span /> Kind words</div>
            <h2>A place for genuine client feedback.</h2>
          </div>
          <div className="review-grid">
            <div className="review-source-card">
              <p>Verified client feedback will appear here after Earth Glory confirms permission to publish it.</p>
              <span className="review-status"><CheckCircle2 size={16} /> Awaiting approved reviews</span>
            </div>
          </div>
        </section>

        <section className="section visit-section" id="visit">
          <div className="visit-card">
            <div className="visit-copy">
              <div className="eyebrow light"><span /> Plan your visit</div>
              <h2>West Kensington,<br />London.</h2>
              <p>Venue details are shown for prototype feedback and will be confirmed before live booking opens.</p>
              <div className="visit-facts">
                <div><MapPin size={18} /><span><strong>141 North End Road</strong><small>West Kensington, London W14 9NH</small></span></div>
                <div><Clock3 size={18} /><span><strong>Open seven days</strong><small>Mon–Fri 10:00–19:30 · Sat 10:00–18:00 · Sun 10:00–17:00</small></span></div>
                <div><MessageCircle size={18} /><span><strong>Questions before booking?</strong><small>Call 07745 241200 or email Earth Glory</small></span></div>
              </div>
              <button className="button button-cream button-large" type="button" onClick={() => startBooking()}>
                Try the booking prototype <ArrowRight size={17} />
              </button>
            </div>
            <div className="visit-map" aria-hidden="true">
              <div className="map-road road-one" />
              <div className="map-road road-two" />
              <div className="map-road road-three" />
              <div className="map-river" />
              <span className="map-label label-one">West Kensington</span>
              <span className="map-label label-two">North End Road</span>
              <div className="map-pin"><span>EG</span></div>
            </div>
          </div>
        </section>

        <section className="section faq-section" id="faq">
          <div className="faq-intro">
            <div className="eyebrow dark"><span /> Before you book</div>
            <h2>Details being finalised<br />before booking opens.</h2>
            <p>Earth Glory will confirm these details before the site accepts real bookings.</p>
            <a href="mailto:earth.glory14@gmail.com"><Mail size={16} /> Email Earth Glory</a>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <div className={openFaq === index ? 'faq-item open' : 'faq-item'} key={question}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span>{question}</span><ChevronDown size={20} />
                </button>
                <div id={`faq-answer-${index}`} className="faq-answer" aria-hidden={openFaq !== index}><p>{answer}</p></div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark light-mark">EG</span>
          <div><strong>Earth Glory</strong><small>Beauty · Massage · Nails</small></div>
        </div>
        <div className="footer-links">
          <div><strong>Explore</strong><a href="#treatments">Treatments</a><a href="#studio">Our studio</a><a href="#reviews">Kind words</a></div>
          <div><strong>Useful</strong><a href="#visit">Visit & access</a><a href="#faq">Before you book</a></div>
          <div><strong>Contact</strong><p>141 North End Road, West Kensington, London W14 9NH</p><a href="tel:+447745241200">07745 241200</a><a href="mailto:earth.glory14@gmail.com">earth.glory14@gmail.com</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Earth Glory website concept</span><span>Owner review</span><span>No live booking or payment</span></div>
      </footer>

      <button className="mobile-book" type="button" onClick={() => startBooking()}>
        <span><small>Prototype flow</small>Sample booking</span>
        <strong>Try it <ArrowRight size={16} /></strong>
      </button>

        </>
      ) : (
        <RoleWorkspace key={activeRole} role={activeRole} onStartBooking={() => startBooking()} />
      )}

      {bookingOpen && (
        <BookingDialog
          initialService={selectedService}
          visitorType={activeRole === 'client' ? 'client' : 'guest'}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  )
}

function BookingDialog({ initialService, visitorType = 'guest', onClose }) {
  const [step, setStep] = useState(1)
  const [service, setService] = useState(initialService)
  const practitioner = practitioners[0]
  const dates = useMemo(() => upcomingDates(), [])
  const [date, setDate] = useState(dates[0])
  const [time, setTime] = useState('11:30 AM')
  const [details, setDetails] = useState(visitorType === 'client'
    ? { name: 'Maya Thompson', email: 'maya@example.com', phone: '07700 900123', consent: false }
    : { name: '', email: '', phone: '', consent: false })
  const [submitted, setSubmitted] = useState(false)
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const returnFocusRef = useRef(null)
  const successTitleRef = useRef(null)
  const stepTitleRef = useRef(null)
  const previousStepRef = useRef(step)
  const times = ['9:00 AM', '10:15 AM', '11:30 AM', '1:45 PM', '3:00 PM', '5:15 PM']

  useEffect(() => {
    returnFocusRef.current = document.activeElement

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.body.classList.add('modal-open')
    window.addEventListener('keydown', onKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKeyDown)
      returnFocusRef.current?.focus?.()
    }
  }, [onClose])

  useEffect(() => {
    if (submitted) successTitleRef.current?.focus()
  }, [submitted])

  useEffect(() => {
    if (!submitted && previousStepRef.current !== step) {
      previousStepRef.current = step
      stepTitleRef.current?.focus()
    }
  }, [step, submitted])

  function goNext() {
    if (step < 4) setStep((current) => current + 1)
    else setSubmitted(true)
  }

  return (
    <div className="booking-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="booking-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-dialog-title"
        aria-describedby="booking-dialog-description"
      >
        <button ref={closeButtonRef} className="dialog-close" type="button" onClick={onClose} aria-label="Close booking"><X size={20} /></button>

        {submitted ? (
          <div className="booking-success">
            <div className="success-icon"><Check size={28} /></div>
            <div className="eyebrow dark"><span /> Prototype complete</div>
            <h2 ref={successTitleRef} id="booking-dialog-title" tabIndex="-1">That’s the full booking journey.</h2>
            <p id="booking-dialog-description">No appointment or payment has been created. A live service would first recheck availability, apply Earth Glory’s approved payment and policy rules, and then create a traceable booking record.</p>
            <div className="success-card">
              <div><small>Treatment</small><strong>{service.name}</strong></div>
              <div><small>Date & time</small><strong>{formatLondonDate(date, { weekday: 'long', month: 'long', day: 'numeric' })} · {time}</strong></div>
              <div><small>Therapist</small><strong>{practitioner.name}</strong></div>
              <div><small>Due today</small><strong>No payment in prototype</strong></div>
            </div>
            <div className="success-records" aria-label="Records a live booking may create">
              <strong>Records created only when relevant</strong>
              <div>
                <span><CheckCircle2 size={15} /> Always: appointment and confirmation</span>
                <span><CheckCircle2 size={15} /> After payment: provider receipt</span>
                <span><CheckCircle2 size={15} /> After a refund: refund record</span>
                <span><CheckCircle2 size={15} /> Processor-paid orders: earnings and payout status</span>
              </div>
            </div>
            <button className="button button-dark button-large full-width" type="button" onClick={onClose}>Return to the website</button>
            <small className="demo-note">Sample journey only — details were not submitted.</small>
          </div>
        ) : (
          <>
            <div className="booking-main">
              <div className="booking-progress-mobile" aria-live="polite">
                <span>Step {step} of 4</span><strong>{['Treatment', 'Date & time', 'Your details', 'Review'][step - 1]}</strong>
              </div>

              {step === 1 && (
                <div className="booking-step">
                  <div className="eyebrow dark"><span /> Step one</div>
                  <h2 ref={stepTitleRef} id="booking-dialog-title" tabIndex="-1">Choose a treatment.</h2>
                  <p id="booking-dialog-description" className="step-intro">Select one sample service to continue.</p>
                  <div className="choice-list service-choice-list">
                    {services.map((item) => (
                      <button
                        key={item.id}
                        className={service.id === item.id ? 'choice active' : 'choice'}
                        type="button"
                        aria-pressed={service.id === item.id}
                        onClick={() => setService(item)}
                      >
                        <span className="choice-radio">{service.id === item.id && <span />}</span>
                        <span className="choice-copy"><strong>{item.name}</strong><small>{item.description}</small><em><Clock3 size={13} /> {item.duration} min</em></span>
                        <span className="choice-price">{formatMoney(item.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="booking-step">
                  <div className="eyebrow dark"><span /> Step two</div>
                  <h2 ref={stepTitleRef} id="booking-dialog-title" tabIndex="-1">Choose a date and time.</h2>
                  <p id="booking-dialog-description" className="step-intro">Sample times are shown in London time. They are not connected to Avni’s calendar.</p>
                  <div className="date-strip">
                    {dates.map((item) => (
                      <button
                        key={item.toISOString()}
                        className={dateKey(date) === dateKey(item) ? 'active' : ''}
                        type="button"
                        aria-pressed={dateKey(date) === dateKey(item)}
                        onClick={() => setDate(item)}
                      >
                        <small>{formatLondonDate(item, { weekday: 'short' })}</small>
                        <strong>{formatLondonDate(item, { day: 'numeric' })}</strong>
                        <span>{formatLondonDate(item, { month: 'short' })}</span>
                      </button>
                    ))}
                  </div>
                  <div className="time-label"><span>Sample times</span><small><span className="pulse-dot" /> Prototype data</small></div>
                  <div className="time-grid">
                    {times.map((item, index) => (
                      <button
                        key={item}
                        disabled={index === 0}
                        className={time === item ? 'active' : ''}
                        type="button"
                        aria-pressed={time === item}
                        onClick={() => setTime(item)}
                      >
                        {item}{index === 0 && <small>Example unavailable</small>}
                      </button>
                    ))}
                  </div>
                  <div className="booking-help"><Clock3 size={18} /><p>In the live service, the server would recheck availability and temporarily reserve the selected time during checkout.</p></div>
                </div>
              )}

              {step === 3 && (
                <div className="booking-step">
                  <div className="eyebrow dark"><span /> Step three</div>
                  <h2 ref={stepTitleRef} id="booking-dialog-title" tabIndex="-1">{visitorType === 'client' ? 'Confirm your details.' : 'Enter your details.'}</h2>
                  <p id="booking-dialog-description" className="step-intro">{visitorType === 'client' ? 'Your sample client details are prefilled for this signed-in journey.' : 'No account is required. Use sample details only; nothing is submitted or stored.'}</p>
                  <form id="booking-details-form" className="details-form" onSubmit={(event) => { event.preventDefault(); goNext() }}>
                    <label><span>Full name</span><input required value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} autoComplete="name" placeholder="Your name" /></label>
                    <label><span>Email address</span><input required value={details.email} onChange={(event) => setDetails({ ...details, email: event.target.value })} autoComplete="email" type="email" placeholder="you@example.com" /></label>
                    <label><span>Mobile number</span><input required value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} autoComplete="tel" type="tel" placeholder="07700 900000" /></label>
                    <label className="checkbox-label"><input required checked={details.consent} onChange={(event) => setDetails({ ...details, consent: event.target.checked })} type="checkbox" /><span>I understand this is a non-transactional prototype and no appointment will be created.</span></label>
                  </form>
                  <div className="secure-note"><LockKeyhole size={17} /><span><strong>Prototype only</strong>These details remain only in the open booking flow and are discarded when it closes.</span></div>
                </div>
              )}

              {step === 4 && (
                <div className="booking-step">
                  <div className="eyebrow dark"><span /> Final step</div>
                  <h2 ref={stepTitleRef} id="booking-dialog-title" tabIndex="-1">Review before you finish.</h2>
                  <p id="booking-dialog-description" className="step-intro">This is the point where a live service would show the complete order, policy and payment commitment.</p>
                  <div className="booking-review">
                    <dl>
                      <div><dt>Service provider</dt><dd>Earth Glory · {practitioner.name}</dd></div>
                      <div><dt>Treatment</dt><dd>{service.name} · {service.duration} minutes</dd></div>
                      <div><dt>Date & time</dt><dd>{formatLondonDate(date, { weekday: 'long', month: 'long', day: 'numeric' })} · {time}</dd></div>
                      <div><dt>Venue</dt><dd>141 North End Road · West Kensington, London</dd></div>
                      <div><dt>Treatment price</dt><dd>{formatMoney(service.price)}</dd></div>
                      <div><dt>Payment today</dt><dd>None in this prototype</dd></div>
                    </dl>
                    <div className="review-policy">
                      <ShieldCheck size={19} />
                      <p><strong>Policies still require owner approval.</strong>The live confirmation action must show accepted cancellation, refund and payment terms before creating an appointment.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside className="booking-summary">
              <div>
                <span className="summary-kicker">Prototype appointment</span>
                <div
                  className="summary-art"
                  style={{ backgroundImage: `linear-gradient(145deg, rgba(97,68,53,.15), rgba(255,255,255,.38)), url(${heroImage})` }}
                ><span>EG</span></div>
                <h3>{service.name}</h3>
                <ul>
                  <li><Clock3 size={16} /><span><small>Duration</small><strong>{service.duration} minutes</strong></span></li>
                  <li><UserRound size={16} /><span><small>Therapist</small><strong>{practitioner.name}</strong></span></li>
                  {step >= 2 && <li><CalendarDays size={16} /><span><small>Date & time</small><strong>{formatLondonDate(date, { month: 'short', day: 'numeric' })} · {time}</strong></span></li>}
                </ul>
              </div>
              <div className="summary-total">
                <div><span>Treatment</span><strong>{formatMoney(service.price)}</strong></div>
                <div><span>Payment terms</span><strong>To confirm</strong></div>
                <div><span>Due now</span><strong>£0 in prototype</strong></div>
              </div>
            </aside>

            <div className="booking-footer">
              <button className="back-button" type="button" onClick={() => step === 1 ? onClose() : setStep((current) => current - 1)}>
                <ArrowLeft size={17} /> {step === 1 ? 'Close' : 'Back'}
              </button>
              <div className="step-dots" aria-hidden="true">{[1, 2, 3, 4].map((item) => <span key={item} className={item <= step ? 'active' : ''} />)}</div>
              <button
                className="button button-dark"
                type={step === 3 ? 'submit' : 'button'}
                form={step === 3 ? 'booking-details-form' : undefined}
                onClick={step === 3 ? undefined : goNext}
              >
                {step === 4 ? 'Complete prototype' : 'Continue'} <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
