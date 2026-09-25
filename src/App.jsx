import { useEffect, useMemo, useState } from 'react'
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
  Star,
  UserRound,
  X,
} from 'lucide-react'
import heroImage from './assets/earth-glory-hero.png'

const services = [
  {
    id: 'signature-facial',
    category: 'Facials',
    eyebrow: 'Most loved',
    name: 'Earth Glow Signature Facial',
    description: 'A tailored facial with double cleanse, gentle exfoliation, massage and a restorative mask.',
    duration: 75,
    price: 110,
    tone: 'sand',
    icon: Sparkles,
  },
  {
    id: 'deep-release',
    category: 'Massage',
    eyebrow: 'Full reset',
    name: 'Deep Release Massage',
    description: 'A focused, restorative massage designed around the areas holding the most tension.',
    duration: 60,
    price: 95,
    tone: 'clay',
    icon: Leaf,
  },
  {
    id: 'sculpt-ritual',
    category: 'Facials',
    eyebrow: 'Natural lift',
    name: 'Sculpt & Glow Ritual',
    description: 'Facial massage, cooling tools and hydration for a rested, softly sculpted finish.',
    duration: 50,
    price: 85,
    tone: 'sage',
    icon: Heart,
  },
  {
    id: 'back-shoulders',
    category: 'Massage',
    eyebrow: 'Quick relief',
    name: 'Back, Neck & Shoulders',
    description: 'A targeted treatment for desk tension, travel fatigue and everyday tightness.',
    duration: 35,
    price: 60,
    tone: 'rose',
    icon: Sparkles,
  },
  {
    id: 'brow-shape',
    category: 'Brows',
    eyebrow: 'Polished',
    name: 'Bespoke Brow Shape',
    description: 'Consultation, shaping and finishing designed for your natural brow and face shape.',
    duration: 30,
    price: 42,
    tone: 'moss',
    icon: Leaf,
  },
  {
    id: 'calm-combination',
    category: 'Rituals',
    eyebrow: 'Two-in-one',
    name: 'Calm Face & Body',
    description: 'A grounding back massage followed by a replenishing express facial.',
    duration: 90,
    price: 145,
    tone: 'plum',
    icon: Heart,
  },
]

const practitioners = [
  {
    id: 'amara',
    name: 'Amara',
    role: 'Founder & senior therapist',
    initials: 'AM',
    specialties: 'Facial massage · deep tissue · sensitive skin',
  },
  {
    id: 'first',
    name: 'First available',
    role: 'The soonest suitable appointment',
    initials: '→',
    specialties: 'We’ll match you with the right therapist.',
  },
]

const reviews = [
  {
    text: 'The whole treatment felt thoughtful and completely unhurried. I left feeling lighter—and my skin looked beautifully rested.',
    name: 'Maya L.',
    service: 'Signature facial',
  },
  {
    text: 'Warm, calm and so knowledgeable. Every step was explained without interrupting the peaceful feel of the appointment.',
    name: 'Elena R.',
    service: 'Deep release massage',
  },
  {
    text: 'Booking was easy, the studio is gorgeous, and I’ve already made my next appointment. A genuinely lovely experience.',
    name: 'Sofia N.',
    service: 'Sculpt & glow ritual',
  },
]

const faqs = [
  ['What should I arrive with?', 'Come as you are. For facial treatments, minimal makeup is helpful but never required. Please arrive five minutes early for your first visit.'],
  ['Can I change my appointment?', 'Yes. Your confirmation includes a private link to reschedule or cancel within the studio’s policy window.'],
  ['Do you take a deposit?', 'A $20 deposit secures online appointments. It is applied to your final balance and the policy is shown before you confirm.'],
  ['Is the studio accessible?', 'Please contact the studio before booking so we can talk through step-free access and make your visit comfortable.'],
]

function formatMoney(value) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(value)
}

function upcomingDates() {
  const days = []
  const cursor = new Date()
  for (let i = 1; i <= 7; i += 1) {
    const date = new Date(cursor)
    date.setDate(cursor.getDate() + i)
    if (date.getDay() !== 0) days.push(date)
  }
  return days.slice(0, 5)
}

function App() {
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(services[0])
  const [category, setCategory] = useState('All treatments')
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)

  const categories = ['All treatments', ...new Set(services.map((service) => service.category))]
  const filteredServices = category === 'All treatments'
    ? services
    : services.filter((service) => service.category === category)

  function startBooking(service = services[0]) {
    setSelectedService(service)
    setBookingOpen(true)
  }

  return (
    <div className="app-shell">
      <div className="concept-bar">
        <span>Private concept</span>
        <p>Sample services and imagery for review</p>
      </div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Earth Glory home">
          <span className="brand-mark">EG</span>
          <span className="brand-copy">
            <strong>Earth Glory</strong>
            <small>Beauty · Body · Balance</small>
          </span>
        </a>

        <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary navigation">
          <a href="#treatments" onClick={() => setMenuOpen(false)}>Treatments</a>
          <a href="#studio" onClick={() => setMenuOpen(false)}>Our studio</a>
          <a href="#reviews" onClick={() => setMenuOpen(false)}>Kind words</a>
          <a href="#visit" onClick={() => setMenuOpen(false)}>Visit</a>
        </nav>

        <div className="header-actions">
          <button className="text-button hide-mobile" type="button">Studio sign in</button>
          <button className="button button-dark hide-mobile" type="button" onClick={() => startBooking()}>
            Book a treatment
          </button>
          <button
            className="menu-button"
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
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
            <div className="eyebrow"><span /> Restorative beauty & body care</div>
            <h1>Your glow,<br /><em>unhurried.</em></h1>
            <p>
              Thoughtful treatments for skin, body and a quieter mind—tailored to how you want to feel today.
            </p>
            <div className="hero-actions">
              <button className="button button-dark button-large" type="button" onClick={() => startBooking()}>
                Find your treatment <ArrowRight size={17} />
              </button>
              <a className="button button-light button-large" href="#treatments">Explore the menu</a>
            </div>
            <div className="hero-details">
              <span><MapPin size={16} /> Boutique studio · Calgary</span>
              <span><Star size={16} fill="currentColor" /> 4.9 from verified visits</span>
            </div>
          </div>

          <div className="availability-card" aria-label="Next availability">
            <div className="pulse-dot" />
            <div>
              <small>Next availability</small>
              <strong>Tomorrow · 11:30 AM</strong>
            </div>
            <button type="button" aria-label="Book next available appointment" onClick={() => startBooking()}>
              <ArrowRight size={18} />
            </button>
          </div>
        </section>

        <section className="trust-row" aria-label="Studio highlights">
          <div><Leaf size={21} /><span><strong>Tailored care</strong><small>Never one-size-fits-all</small></span></div>
          <div><ShieldCheck size={21} /><span><strong>Clear & considered</strong><small>Prices and policies upfront</small></span></div>
          <div><CalendarDays size={21} /><span><strong>Easy booking</strong><small>Choose, book and manage online</small></span></div>
          <div><Heart size={21} /><span><strong>Human touch</strong><small>Warm care from start to finish</small></span></div>
        </section>

        <section className="section treatment-section" id="treatments">
          <div className="section-heading treatment-heading">
            <div>
              <div className="eyebrow dark"><span /> The treatment menu</div>
              <h2>Choose what you need today.</h2>
            </div>
            <p>Every treatment is adapted to you after a thoughtful consultation. Prices shown in CAD.</p>
          </div>

          <div className="category-tabs" role="list" aria-label="Treatment categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={category === item ? 'active' : ''}
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
                    <button type="button" onClick={() => startBooking(service)} aria-label={`Book ${service.name}`}>
                      Book <ArrowRight size={16} />
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
            <h2>Quiet expertise.<br />Visible care.</h2>
            <p>
              Beauty should never feel rushed. Your appointment begins with a real conversation, then unfolds at a considered pace with techniques chosen for you—not a template.
            </p>
            <div className="ritual-points">
              <div><span>01</span><p><strong>We listen first</strong>Tell us what feels good, what doesn’t, and what you hope to leave with.</p></div>
              <div><span>02</span><p><strong>We tailor every step</strong>Pressure, products and pace are adjusted for your comfort.</p></div>
              <div><span>03</span><p><strong>We keep it honest</strong>No hard sell. Just simple guidance for results that last beyond the room.</p></div>
            </div>
          </div>
        </section>

        <section className="section meet-section">
          <div className="meet-copy">
            <div className="eyebrow dark"><span /> Meet your therapist</div>
            <h2>A calm pair of hands,<br />and care you can feel.</h2>
            <p>Earth Glory was created around one idea: the best results happen when expertise and ease share the same room.</p>
            <div className="mini-credentials">
              <span><CheckCircle2 size={17} /> Advanced facial massage</span>
              <span><CheckCircle2 size={17} /> Holistic bodywork</span>
              <span><CheckCircle2 size={17} /> Skin-first consultations</span>
            </div>
            <button className="link-arrow" type="button" onClick={() => startBooking()}>
              Book with Amara <ArrowRight size={17} />
            </button>
          </div>
          <div className="portrait-card">
            <div className="portrait-art">
              <div className="portrait-monogram">A</div>
              <div className="botanical botanical-one" />
              <div className="botanical botanical-two" />
            </div>
            <div className="portrait-caption">
              <span><strong>Amara</strong>Founder & senior therapist</span>
              <small>Facials · Massage · Rituals</small>
            </div>
          </div>
        </section>

        <section className="review-section" id="reviews">
          <div className="section-heading centered">
            <div className="eyebrow dark"><span /> Kind words</div>
            <h2>Felt from the inside out.</h2>
            <div className="rating-line"><span>4.9</span><span className="stars">★★★★★</span><small>Verified appointments</small></div>
          </div>
          <div className="review-grid">
            {reviews.map((review) => (
              <blockquote key={review.name}>
                <span className="quote-mark">“</span>
                <p>{review.text}</p>
                <footer>
                  <span className="review-avatar">{review.name[0]}</span>
                  <span><strong>{review.name}</strong><small><Check size={12} /> {review.service}</small></span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="section visit-section" id="visit">
          <div className="visit-card">
            <div className="visit-copy">
              <div className="eyebrow light"><span /> Plan your visit</div>
              <h2>A little pause,<br />made easy.</h2>
              <p>The full address and arrival details are shared in your confirmation.</p>
              <div className="visit-facts">
                <div><MapPin size={18} /><span><strong>Calgary, Alberta</strong><small>Quiet boutique studio</small></span></div>
                <div><Clock3 size={18} /><span><strong>By appointment</strong><small>Tuesday through Saturday</small></span></div>
                <div><MessageCircle size={18} /><span><strong>Need help choosing?</strong><small>Send a message before you book</small></span></div>
              </div>
              <button className="button button-cream button-large" type="button" onClick={() => startBooking()}>
                View available times <ArrowRight size={17} />
              </button>
            </div>
            <div className="visit-map" aria-hidden="true">
              <div className="map-road road-one" />
              <div className="map-road road-two" />
              <div className="map-road road-three" />
              <div className="map-river" />
              <span className="map-label label-one">Kensington</span>
              <span className="map-label label-two">Downtown</span>
              <div className="map-pin"><span>EG</span></div>
            </div>
          </div>
        </section>

        <section className="section faq-section">
          <div className="faq-intro">
            <div className="eyebrow dark"><span /> Before you visit</div>
            <h2>A few helpful<br />things to know.</h2>
            <p>Still wondering? We’re happy to help.</p>
            <a href="mailto:hello@example.com"><Mail size={16} /> Send us a note</a>
          </div>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <div className={openFaq === index ? 'faq-item open' : 'faq-item'} key={question}>
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}>
                  <span>{question}</span><ChevronDown size={20} />
                </button>
                <div className="faq-answer"><p>{answer}</p></div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-mark light-mark">EG</span>
          <div><strong>Earth Glory</strong><small>Beauty · Body · Balance</small></div>
        </div>
        <div className="footer-links">
          <div><strong>Explore</strong><a href="#treatments">Treatments</a><a href="#studio">Our studio</a><a href="#reviews">Kind words</a></div>
          <div><strong>Useful</strong><a href="#visit">Visit & access</a><a href="#faq">Policies</a><button type="button">Studio sign in</button></div>
          <div><strong>Stay close</strong><p>Gentle notes, last-minute openings and studio news.</p><div className="email-form"><input aria-label="Email address" placeholder="Your email address" type="email" /><button aria-label="Subscribe" type="button"><ArrowRight size={17} /></button></div></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Earth Glory concept</span><span>Private prototype · Sample content</span><span>Privacy · Terms · Accessibility</span></div>
      </footer>

      <button className="mobile-book" type="button" onClick={() => startBooking()}>
        <span><small>Next opening</small>Tomorrow · 11:30 AM</span>
        <strong>Book now <ArrowRight size={16} /></strong>
      </button>

      {bookingOpen && (
        <BookingDialog
          initialService={selectedService}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  )
}

function BookingDialog({ initialService, onClose }) {
  const [step, setStep] = useState(1)
  const [service, setService] = useState(initialService)
  const [practitioner, setPractitioner] = useState(practitioners[1])
  const dates = useMemo(() => upcomingDates(), [])
  const [date, setDate] = useState(dates[0])
  const [time, setTime] = useState('11:30 AM')
  const [details, setDetails] = useState({ name: '', email: '', phone: '', consent: false })
  const [submitted, setSubmitted] = useState(false)
  const times = ['9:00 AM', '10:15 AM', '11:30 AM', '1:45 PM', '3:00 PM', '5:15 PM']

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.classList.add('modal-open')
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const deposit = 20
  const canContinue = step < 4 || (details.name && details.email && details.phone && details.consent)

  function goNext() {
    if (step < 4) setStep((current) => current + 1)
    else if (canContinue) setSubmitted(true)
  }

  return (
    <div className="booking-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="booking-dialog" role="dialog" aria-modal="true" aria-label="Book an appointment">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close booking"><X size={20} /></button>

        {submitted ? (
          <div className="booking-success">
            <div className="success-icon"><Check size={28} /></div>
            <div className="eyebrow dark"><span /> Appointment held</div>
            <h2>Your time is waiting.</h2>
            <p>This concept stops before payment. In the live product, a secure hosted checkout would collect the {formatMoney(deposit)} deposit and the payment webhook would confirm your visit.</p>
            <div className="success-card">
              <div><small>Treatment</small><strong>{service.name}</strong></div>
              <div><small>Date & time</small><strong>{date.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric' })} · {time}</strong></div>
              <div><small>Therapist</small><strong>{practitioner.name}</strong></div>
              <div><small>Due today</small><strong>{formatMoney(deposit)} demo deposit</strong></div>
            </div>
            <button className="button button-dark button-large full-width" type="button" onClick={onClose}>Return to the studio</button>
            <small className="demo-note">No appointment or payment was actually created.</small>
          </div>
        ) : (
          <>
            <div className="booking-main">
              <div className="booking-progress-mobile">
                <span>Step {step} of 4</span><strong>{['Treatment', 'Therapist', 'Date & time', 'Your details'][step - 1]}</strong>
              </div>

              {step === 1 && (
                <div className="booking-step">
                  <div className="eyebrow dark"><span /> Step one</div>
                  <h2>What would feel good?</h2>
                  <p className="step-intro">Choose one treatment for this appointment.</p>
                  <div className="choice-list service-choice-list">
                    {services.map((item) => (
                      <button key={item.id} className={service.id === item.id ? 'choice active' : 'choice'} type="button" onClick={() => setService(item)}>
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
                  <h2>Choose your therapist.</h2>
                  <p className="step-intro">Pick someone you know, or let us find the first opening.</p>
                  <div className="practitioner-grid">
                    {practitioners.map((item) => (
                      <button key={item.id} className={practitioner.id === item.id ? 'practitioner-choice active' : 'practitioner-choice'} type="button" onClick={() => setPractitioner(item)}>
                        <span className="practitioner-avatar">{item.initials}</span>
                        <span><strong>{item.name}</strong><em>{item.role}</em><small>{item.specialties}</small></span>
                        <span className="choice-radio">{practitioner.id === item.id && <span />}</span>
                      </button>
                    ))}
                  </div>
                  <div className="booking-help"><Sparkles size={18} /><p><strong>Not sure who to choose?</strong> “First available” will only show therapists who offer {service.name}.</p></div>
                </div>
              )}

              {step === 3 && (
                <div className="booking-step">
                  <div className="eyebrow dark"><span /> Step three</div>
                  <h2>Find your moment.</h2>
                  <p className="step-intro">Times are shown in Calgary local time.</p>
                  <div className="date-strip">
                    {dates.map((item) => (
                      <button key={item.toISOString()} className={date.toDateString() === item.toDateString() ? 'active' : ''} type="button" onClick={() => setDate(item)}>
                        <small>{item.toLocaleDateString('en-CA', { weekday: 'short' })}</small>
                        <strong>{item.getDate()}</strong>
                        <span>{item.toLocaleDateString('en-CA', { month: 'short' })}</span>
                      </button>
                    ))}
                  </div>
                  <div className="time-label"><span>Available times</span><small><span className="pulse-dot" /> Live availability</small></div>
                  <div className="time-grid">
                    {times.map((item, index) => (
                      <button key={item} disabled={index === 0} className={time === item ? 'active' : ''} type="button" onClick={() => setTime(item)}>{item}{index === 0 && <small>Booked</small>}</button>
                    ))}
                  </div>
                  <div className="booking-help"><Clock3 size={18} /><p>Your time is held for 10 minutes when you continue to secure payment.</p></div>
                </div>
              )}

              {step === 4 && (
                <div className="booking-step">
                  <div className="eyebrow dark"><span /> Final step</div>
                  <h2>A few details, then you’re set.</h2>
                  <p className="step-intro">We’ll use these only for your appointment and confirmation.</p>
                  <div className="details-form">
                    <label><span>Full name</span><input value={details.name} onChange={(event) => setDetails({ ...details, name: event.target.value })} autoComplete="name" placeholder="Your name" /></label>
                    <label><span>Email address</span><input value={details.email} onChange={(event) => setDetails({ ...details, email: event.target.value })} autoComplete="email" type="email" placeholder="you@example.com" /></label>
                    <label><span>Mobile number</span><input value={details.phone} onChange={(event) => setDetails({ ...details, phone: event.target.value })} autoComplete="tel" type="tel" placeholder="(403) 555-0123" /></label>
                    <label className="checkbox-label"><input checked={details.consent} onChange={(event) => setDetails({ ...details, consent: event.target.checked })} type="checkbox" /><span>I agree to the 24-hour cancellation policy and understand the {formatMoney(deposit)} deposit is applied to my final balance.</span></label>
                  </div>
                  <div className="secure-note"><LockKeyhole size={17} /><span><strong>Secure checkout</strong>Payment would be handled by Stripe. Card details never touch this website.</span></div>
                </div>
              )}
            </div>

            <aside className="booking-summary">
              <div>
                <span className="summary-kicker">Your appointment</span>
                <div
                  className="summary-art"
                  style={{ backgroundImage: `linear-gradient(145deg, rgba(97,68,53,.15), rgba(255,255,255,.38)), url(${heroImage})` }}
                ><span>EG</span></div>
                <h3>{service.name}</h3>
                <ul>
                  <li><Clock3 size={16} /><span><small>Duration</small><strong>{service.duration} minutes</strong></span></li>
                  {step >= 2 && <li><UserRound size={16} /><span><small>Therapist</small><strong>{practitioner.name}</strong></span></li>}
                  {step >= 3 && <li><CalendarDays size={16} /><span><small>Date & time</small><strong>{date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} · {time}</strong></span></li>}
                </ul>
              </div>
              <div className="summary-total">
                <div><span>Treatment</span><strong>{formatMoney(service.price)}</strong></div>
                <div><span>Deposit due today</span><strong>{formatMoney(deposit)}</strong></div>
                <div><span>Balance at appointment</span><strong>{formatMoney(service.price - deposit)}</strong></div>
              </div>
            </aside>

            <div className="booking-footer">
              <button className="back-button" type="button" onClick={() => step === 1 ? onClose() : setStep((current) => current - 1)}>
                <ArrowLeft size={17} /> {step === 1 ? 'Close' : 'Back'}
              </button>
              <div className="step-dots" aria-hidden="true">{[1, 2, 3, 4].map((item) => <span key={item} className={item <= step ? 'active' : ''} />)}</div>
              <button className="button button-dark" disabled={!canContinue} type="button" onClick={goNext}>
                {step === 4 ? `Continue to ${formatMoney(deposit)} deposit` : 'Continue'} <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
