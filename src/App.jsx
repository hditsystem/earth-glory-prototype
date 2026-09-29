import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
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
import { LIVE_BOOKING_PROVIDER } from './bookingProvider'
import { RoleSwitcher, RoleWorkspace } from './RoleViews'
import {
  blockedEndTimeForAppointment,
  DEFAULT_OPERATING_HOURS,
  DEFAULT_PRACTITIONER_HOURS,
  formatClockTime,
  getAvailabilityForDate,
  minutesToClock,
  parseClockTime,
} from './availability'
import { createTreatmentRecord, publishedTreatments } from './serviceCatalog'

const prototypeRoleIds = ['guest', 'client', 'practitioner', 'owner']
const lotusLogo = `${import.meta.env.BASE_URL}earth-glory-lotus-logo.png`

const initialServices = [
  {
    id: 'back-neck-shoulders',
    category: 'Massage',
    eyebrow: 'Focused care',
    name: 'Back, Neck & Shoulders Massage',
    description: 'A focused 30-minute massage for the back, neck and shoulders.',
    duration: 30,
    bufferAfter: 10,
    price: 28,
    tone: 'sand',
    icon: Sparkles,
    status: 'published',
    practitionerIds: ['avni'],
  },
  {
    id: 'aromatherapy-massage',
    category: 'Massage',
    eyebrow: 'Full-body care',
    name: 'Aromatherapy Massage',
    description: 'A full-body massage using aromatic oils, with pressure agreed at the start of the appointment.',
    duration: 60,
    bufferAfter: 10,
    price: 60,
    tone: 'clay',
    icon: Leaf,
    status: 'published',
    practitionerIds: ['avni'],
  },
  {
    id: 'shellac-manicure',
    category: 'Nails',
    eyebrow: 'Long-wear colour',
    name: 'Shellac Manicure',
    description: 'A manicure for the hands, finished with Shellac colour.',
    duration: 50,
    bufferAfter: 10,
    price: 30,
    tone: 'sage',
    icon: Heart,
    status: 'published',
    practitionerIds: ['avni'],
  },
  {
    id: 'high-frequency-facial',
    category: 'Facials',
    eyebrow: 'Targeted skincare',
    name: 'High Frequency Facial',
    description: 'A 60-minute facial that includes high-frequency equipment as part of the treatment.',
    duration: 60,
    bufferAfter: 15,
    price: 75,
    tone: 'rose',
    icon: Sparkles,
    status: 'published',
    practitionerIds: ['avni'],
  },
  {
    id: 'eyebrow-threading',
    category: 'Brows & lashes',
    eyebrow: 'Precise shaping',
    name: 'Eyebrow Threading',
    description: 'Precise eyebrow shaping for a clean, natural-looking finish.',
    duration: 10,
    bufferAfter: 5,
    price: 8,
    tone: 'moss',
    icon: Leaf,
    status: 'published',
    practitionerIds: ['avni'],
  },
  {
    id: 'eyelash-tint',
    category: 'Brows & lashes',
    eyebrow: 'Natural definition',
    name: 'Eyelash Tint',
    description: 'Tint applied to the natural lashes. A patch test may be required.',
    duration: 15,
    bufferAfter: 10,
    price: 15,
    tone: 'plum',
    icon: Heart,
    status: 'published',
    practitionerIds: ['avni'],
  },
]

const servicePresentation = {
  Massage: { eyebrow: 'Restorative care', tone: 'sand', icon: Sparkles },
  Nails: { eyebrow: 'Polished finish', tone: 'sage', icon: Heart },
  Facials: { eyebrow: 'Tailored skincare', tone: 'rose', icon: Sparkles },
  'Brows & lashes': { eyebrow: 'Natural definition', tone: 'moss', icon: Leaf },
  Other: { eyebrow: 'Personal care', tone: 'clay', icon: Heart },
  Uncategorised: { eyebrow: 'Draft treatment', tone: 'clay', icon: Sparkles },
}

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
  ['What is the cancellation policy?', 'Treatwell shows the terms that apply to the current live appointment. The Earth Glory prototype uses sample wording only while the future experience is reviewed.'],
  ['Will clients pay online?', 'The current Treatwell flow shows whether payment is due online or at the venue. No payment is taken in this prototype.'],
  ['What should clients know before arrival?', 'Check the live Treatwell service and confirmation for current preparation, patch-test and arrival instructions.'],
  ['Is step-free access available?', 'Accessibility and venue-access details still need direct confirmation from Earth Glory before they are published here.'],
]

function formatMoney(value) {
  const amount = Number(value) || 0
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatLondonDate(date, options) {
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'Europe/London' }).format(date)
}

function dateKey(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const part = (type) => parts.find((item) => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

function dateFromKey(value) {
  return new Date(`${value}T12:00:00Z`)
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

function serviceSnapshot(service) {
  return {
    id: service.id,
    name: service.name,
    duration: service.duration,
    bufferAfter: service.bufferAfter ?? 0,
    price: service.price,
  }
}

function activityEvent(label, actor) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label,
    actor,
    at: new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Europe/London',
    }).format(new Date()),
  }
}

function sampleLateStart(date, occupiedMinutes, breathingRoomMinutes = 30) {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay()
  const closingTime = DEFAULT_OPERATING_HOURS[day][0].end
  const calculatedStart = parseClockTime(closingTime) - occupiedMinutes - breathingRoomMinutes
  const adjustedStart = calculatedStart < 15 * 60 + 30 && calculatedStart + occupiedMinutes > 15 * 60
    ? 15 * 60 + 30
    : calculatedStart
  return minutesToClock(adjustedStart)
}

function operatingHoursSummary(hours) {
  const labelForDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const valueForDay = (day) => {
    const window = hours[day]?.[0]
    return window ? `${window.start}–${window.end}` : 'Closed'
  }
  const weekdayValues = [1, 2, 3, 4, 5].map(valueForDay)
  const weekdaysMatch = weekdayValues.every((value) => value === weekdayValues[0])

  if (weekdaysMatch) {
    return `Mon–Fri ${weekdayValues[0]} · Sat ${valueForDay(6)} · Sun ${valueForDay(0)}`
  }
  return [1, 2, 3, 4, 5, 6, 0].map((day) => `${labelForDay[day]} ${valueForDay(day)}`).join(' · ')
}

function createInitialDemoState() {
  const dates = upcomingDates()
  const primaryDate = dateKey(dates[0])
  const secondDate = dateKey(dates[1])
  const aromatherapy = initialServices.find((service) => service.id === 'aromatherapy-massage')
  const threading = initialServices.find((service) => service.id === 'eyebrow-threading')
  const shellac = initialServices.find((service) => service.id === 'shellac-manicure')
  const facial = initialServices.find((service) => service.id === 'high-frequency-facial')
  const lateFacialStart = sampleLateStart(primaryDate, facial.duration + facial.bufferAfter)
  const lateShellacStart = sampleLateStart(secondDate, shellac.duration + shellac.bufferAfter)

  const appointment = {
    id: 'demo-appointment',
    reference: 'EG-DEMO-1048',
    client: { name: 'Maya Thompson', email: 'maya@example.com', phone: '07700 900123' },
    service: serviceSnapshot(aromatherapy),
    practitioner: { id: 'avni', name: 'Avni' },
    dateKey: primaryDate,
    startTime: '11:30',
    status: 'confirmed',
    paidAmount: 0,
    paymentMethod: null,
    serviceNote: 'Client prefers light-to-medium pressure. Confirm on arrival.',
    source: 'Online booking',
    events: [activityEvent('Sample appointment confirmed', 'Client')],
  }

  const otherAppointments = [
    {
      id: 'sample-1047',
      reference: 'EG-DEMO-1047',
      client: { name: 'Sophie Lewis' },
      service: serviceSnapshot(threading),
      practitioner: { id: 'avni', name: 'Avni' },
      dateKey: primaryDate,
      startTime: '10:00',
      status: 'completed',
      paidAmount: threading.price,
      paymentMethod: 'Card terminal',
      serviceNote: '',
      source: 'Owner booking',
      events: [],
    },
    {
      id: 'sample-1049',
      reference: 'EG-DEMO-1049',
      client: { name: 'Noah Patel' },
      service: serviceSnapshot(shellac),
      practitioner: { id: 'avni', name: 'Avni' },
      dateKey: primaryDate,
      startTime: '13:45',
      status: 'confirmed',
      paidAmount: 0,
      paymentMethod: null,
      serviceNote: '',
      source: 'Phone booking',
      events: [],
    },
    {
      id: 'sample-1050',
      reference: 'EG-DEMO-1050',
      client: { name: 'Amelia Jones' },
      service: serviceSnapshot(facial),
      practitioner: { id: 'avni', name: 'Avni' },
      dateKey: primaryDate,
      startTime: lateFacialStart,
      status: 'confirmed',
      paidAmount: 25,
      paymentMethod: 'Online deposit',
      serviceNote: '',
      source: 'Online booking',
      events: [],
    },
    {
      id: 'sample-1051',
      reference: 'EG-DEMO-1051',
      client: { name: 'Priya Shah' },
      service: serviceSnapshot(shellac),
      practitioner: { id: 'avni', name: 'Avni' },
      dateKey: secondDate,
      startTime: lateShellacStart,
      status: 'confirmed',
      paidAmount: 0,
      paymentMethod: null,
      serviceNote: '',
      source: 'Online booking',
      events: [],
    },
  ]

  return {
    revision: Date.now(),
    services: initialServices.map((service) => ({ ...service, practitionerIds: [...service.practitionerIds] })),
    appointment,
    otherAppointments,
    blocks: [
      { id: 'sample-break', dateKey: primaryDate, start: '15:00', end: '15:30', type: 'break', label: 'Afternoon break' },
    ],
    operatingHours: structuredClone(DEFAULT_OPERATING_HOURS),
    practitionerHours: structuredClone(DEFAULT_PRACTITIONER_HOURS),
    bookingRules: { slotIntervalMinutes: 30 },
  }
}

function updateAppointment(state, updater) {
  return { ...state, appointment: updater(state.appointment) }
}

function demoReducer(state, action) {
  switch (action.type) {
    case 'SET_APPOINTMENT':
      return { ...state, appointment: action.appointment }
    case 'CREATE_APPOINTMENT':
      return {
        ...state,
        appointment: action.appointment,
        otherAppointments: [...state.otherAppointments, state.appointment],
      }
    case 'SET_STATUS':
      return updateAppointment(state, (appointment) => ({
        ...appointment,
        status: action.status,
        events: [...appointment.events, activityEvent(action.label, action.actor)],
      }))
    case 'CANCEL_APPOINTMENT':
      return updateAppointment(state, (appointment) => ({
        ...appointment,
        status: 'cancelled_client',
        cancellation: { reason: 'Plans changed', refundAmount: appointment.paidAmount },
        paidAmount: 0,
        events: [...appointment.events, activityEvent('Appointment cancelled in the prototype', 'Client')],
      }))
    case 'SAVE_NOTE':
      return updateAppointment(state, (appointment) => ({
        ...appointment,
        serviceNote: action.note,
        events: [...appointment.events, activityEvent('Service note updated', 'Practitioner')],
      }))
    case 'UPDATE_CLIENT':
      return {
        ...state,
        appointment: {
          ...state.appointment,
          client: action.client,
          events: [...state.appointment.events, activityEvent('Client contact details updated', 'Client')],
        },
        otherAppointments: state.otherAppointments.map((item) => (
          item.client.email && item.client.email === state.appointment.client.email
            ? { ...item, client: action.client }
            : item
        )),
      }
    case 'RECORD_PAYMENT':
      return updateAppointment(state, (appointment) => {
        const paidAmount = Math.min(appointment.service.price, appointment.paidAmount + action.amount)
        return {
          ...appointment,
          paidAmount,
          paymentMethod: action.method,
          events: [...appointment.events, activityEvent(`${formatMoney(action.amount)} sample payment recorded`, 'Owner')],
        }
      })
    case 'ADD_BLOCK':
      return {
        ...state,
        blocks: [...state.blocks, { ...action.block, id: `block-${Date.now()}`, type: 'blocked' }],
      }
    case 'ADD_SERVICE':
      if (state.services.some((service) => service.name.toLowerCase() === action.service.name.toLowerCase())) return state
      return {
        ...state,
        services: [...state.services, action.service],
      }
    case 'UPDATE_SERVICE':
      if (state.services.some((service) => service.id !== action.service.id && service.name.toLowerCase() === action.service.name.toLowerCase())) return state
      return {
        ...state,
        services: state.services.map((service) => service.id === action.service.id ? action.service : service),
      }
    case 'UPDATE_HOURS':
      return {
        ...state,
        operatingHours: {
          ...state.operatingHours,
          [action.day]: action.closed ? [] : [{ start: action.start, end: action.end }],
        },
      }
    case 'RESET':
      return createInitialDemoState()
    default:
      return state
  }
}

function appointmentToBusyEvent(appointment) {
  return {
    id: appointment.id,
    dateKey: appointment.dateKey,
    start: appointment.startTime,
    end: blockedEndTimeForAppointment({
      startTime: appointment.startTime,
      duration: appointment.service.duration,
      bufferAfter: appointment.service.bufferAfter,
    }),
    type: 'appointment',
    status: appointment.status,
    label: `${appointment.service.name} · ${appointment.client.name}`,
  }
}

function App() {
  const [demoState, dispatch] = useReducer(demoReducer, null, createInitialDemoState)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(initialServices[0])
  const [bookingIntent, setBookingIntent] = useState({ mode: 'new', appointmentId: null })
  const [category, setCategory] = useState('All treatments')
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(0)
  const [activeRole, setActiveRole] = useState(roleFromLocation)
  const menuButtonRef = useRef(null)

  const bookableServices = useMemo(() => publishedTreatments(demoState.services), [demoState.services])
  const categories = useMemo(() => ['All treatments', ...new Set(bookableServices.map((service) => service.category))], [bookableServices])
  const visibleCategory = categories.includes(category) ? category : 'All treatments'
  const filteredServices = visibleCategory === 'All treatments'
    ? bookableServices
    : bookableServices.filter((service) => service.category === visibleCategory)
  const busyEvents = useMemo(() => [
    appointmentToBusyEvent(demoState.appointment),
    ...demoState.otherAppointments.map(appointmentToBusyEvent),
    ...demoState.blocks,
  ], [demoState.appointment, demoState.blocks, demoState.otherAppointments])

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

  function startBooking(service = bookableServices[0], options = {}) {
    const isReschedule = options.mode === 'reschedule'
    const resolvedService = isReschedule && service
      ? service
      : bookableServices.find((item) => item.id === service?.id) ?? bookableServices[0]
    if (!resolvedService) return
    setSelectedService(resolvedService)
    setBookingIntent({ mode: options.mode ?? 'new', appointmentId: options.appointmentId ?? null })
    setBookingOpen(true)
  }

  function saveTreatment(values, status, serviceId = null) {
    const existingService = demoState.services.find((service) => service.id === serviceId)
    const otherServices = demoState.services.filter((service) => service.id !== serviceId)
    const record = createTreatmentRecord(values, otherServices, status)
    const presentation = servicePresentation[record.category] ?? servicePresentation.Uncategorised
    const service = { ...existingService, ...record, ...presentation, id: existingService?.id ?? record.id }
    dispatch({ type: existingService ? 'UPDATE_SERVICE' : 'ADD_SERVICE', service })
    return service
  }

  function resetDemo() {
    dispatch({ type: 'RESET' })
    setSelectedService(initialServices[0])
    setCategory('All treatments')
    setBookingOpen(false)
  }

  function completeBooking({ service, date, time, details, mode }) {
    const previous = demoState.appointment
    const isReschedule = mode === 'reschedule'
    const referenceNumber = 1048 + demoState.otherAppointments.length
    const bookingActor = activeRole === 'owner' ? 'Owner' : activeRole === 'practitioner' ? 'Practitioner' : activeRole === 'client' ? 'Client' : 'Guest'
    const appointment = {
      ...previous,
      id: isReschedule ? previous.id : `demo-appointment-${referenceNumber}`,
      reference: isReschedule ? previous.reference : `EG-DEMO-${referenceNumber}`,
      client: isReschedule ? previous.client : {
        name: details.name.trim(),
        email: details.email.trim(),
        phone: details.phone.trim(),
      },
      service: serviceSnapshot(service),
      practitioner: { id: 'avni', name: 'Avni' },
      dateKey: dateKey(date),
      startTime: time,
      status: 'confirmed',
      paidAmount: isReschedule ? previous.paidAmount : 0,
      paymentMethod: isReschedule ? previous.paymentMethod : null,
      cancellation: null,
      serviceNote: isReschedule ? previous.serviceNote : '',
      source: isReschedule ? previous.source : `${bookingActor} prototype booking`,
      events: [
        ...(isReschedule ? previous.events : []),
        activityEvent(isReschedule ? 'Appointment rescheduled in the prototype' : 'Prototype booking confirmed', isReschedule ? 'Client' : bookingActor),
      ],
    }
    dispatch({ type: isReschedule ? 'SET_APPOINTMENT' : 'CREATE_APPOINTMENT', appointment })
    return appointment
  }

  function manageCompletedBooking() {
    setBookingOpen(false)
    switchRole('client')
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
        <p>Demo views only · Live bookings continue in Treatwell</p>
      </div>

      <RoleSwitcher activeRole={activeRole} onChange={switchRole} onReset={resetDemo} />

      {activeRole === 'guest' ? (
        <>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Earth Glory home">
          <span className="brand-mark brand-logo"><img src={lotusLogo} alt="" width="256" height="256" aria-hidden="true" /></span>
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
          <a className="nav-live-booking" href={LIVE_BOOKING_PROVIDER.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>Live booking ↗</a>
        </nav>

        <div className="header-actions">
          <button className="text-button" type="button" onClick={() => switchRole('client')}>Client portal preview</button>
          <a className="button button-dark hide-mobile" href={LIVE_BOOKING_PROVIDER.bookingUrl} target="_blank" rel="noopener noreferrer">Book on Treatwell</a>
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
              <a className="button button-dark button-large" href={LIVE_BOOKING_PROVIDER.bookingUrl} target="_blank" rel="noopener noreferrer">
                Book live on Treatwell <ArrowRight size={17} />
              </a>
              <button className="button button-light button-large" type="button" onClick={() => startBooking()}>Preview the new flow</button>
            </div>
            <div className="hero-details">
              <span><MapPin size={16} /> West Kensington · London</span>
              <span><CheckCircle2 size={16} /> 14+ years of industry experience</span>
            </div>
          </div>

          <div className="availability-card" aria-label="Current live booking calendar">
            <div className="pulse-dot" />
            <div>
              <small>Current live calendar</small>
              <strong>See availability on Treatwell</strong>
            </div>
            <a href={LIVE_BOOKING_PROVIDER.bookingUrl} target="_blank" rel="noopener noreferrer" aria-label="Open Earth Glory live booking on Treatwell">
              <ArrowRight size={18} />
            </a>
          </div>
        </section>

        <section className="trust-row" aria-label="Studio highlights">
          <div><Leaf size={21} /><span><strong>Qualified care</strong><small>NVQ Levels 1–4</small></span></div>
          <div><MapPin size={21} /><span><strong>Easy to reach</strong><small>2 minutes from West Kensington station</small></span></div>
          <div><ShieldCheck size={21} /><span><strong>Clear booking</strong><small>Price and duration shown before confirmation</small></span></div>
          <div><Heart size={21} /><span><strong>Personal service</strong><small>Treatment provided by Avni</small></span></div>
        </section>

        <section className="booking-transition" aria-labelledby="booking-transition-title">
          <div className="booking-transition-icon"><ShieldCheck size={24} /></div>
          <div className="booking-transition-copy">
            <span>Safe transition</span>
            <h2 id="booking-transition-title">One live calendar while Earth Glory evolves.</h2>
            <p>Earth Glory currently uses Treatwell as its live booking calendar. Bookings started from this website and bookings made directly on Treatwell should continue into that same calendar. The new Earth Glory flow below remains a feedback prototype and is not connected to Treatwell.</p>
          </div>
          <div className="booking-transition-actions">
            <a className="button button-dark" href={LIVE_BOOKING_PROVIDER.bookingUrl} target="_blank" rel="noopener noreferrer">Book live with Treatwell <ArrowRight size={16} /></a>
            <button className="transition-demo-link" type="button" onClick={() => startBooking()}>Try the session-only demo</button>
          </div>
        </section>

        <section className="section treatment-section" id="treatments">
          <div className="section-heading treatment-heading">
            <div>
              <div className="eyebrow dark"><span /> Current service highlights</div>
              <h2>Find the right treatment for you.</h2>
            </div>
            <p>Browse a sample of the proposed menu. Use the Treatwell link above for current live services, prices and availability.</p>
          </div>

          <div className="category-tabs" role="list" aria-label="Treatment categories">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={visibleCategory === item ? 'active' : ''}
                aria-pressed={visibleCategory === item}
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
                      <span><Clock3 size={14} /> {service.duration} min + {service.bufferAfter} min reset</span>
                    </div>
                    <a href={LIVE_BOOKING_PROVIDER.bookingUrl} target="_blank" rel="noopener noreferrer" aria-label={`Check current ${service.name} availability on Treatwell`}>
                      Check live <ArrowRight size={16} />
                    </a>
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
            <a className="link-arrow" href={LIVE_BOOKING_PROVIDER.bookingUrl} target="_blank" rel="noopener noreferrer">
              Book with Avni on Treatwell <ArrowRight size={17} />
            </a>
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
              <p>Venue details are shown for prototype feedback. Check Treatwell or contact Earth Glory directly before a live visit.</p>
              <div className="visit-facts">
                <div><MapPin size={18} /><span><strong>141 North End Road</strong><small>West Kensington, London W14 9NH</small></span></div>
                <div><Clock3 size={18} /><span><strong>Sample opening hours</strong><small>{operatingHoursSummary(demoState.operatingHours)}</small></span></div>
                <div><MessageCircle size={18} /><span><strong>Questions before booking?</strong><small>Call 07745 241200 or email Earth Glory</small></span></div>
              </div>
              <a className="button button-cream button-large" href={LIVE_BOOKING_PROVIDER.bookingUrl} target="_blank" rel="noopener noreferrer">
                Open live Treatwell booking <ArrowRight size={17} />
              </a>
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
            <h2>Useful details<br />before you book.</h2>
            <p>Treatwell is Earth Glory’s current live booking calendar. The answers below distinguish current booking information from details still awaiting owner confirmation.</p>
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
          <span className="brand-mark brand-logo light-mark"><img src={lotusLogo} alt="" width="256" height="256" aria-hidden="true" /></span>
          <div><strong>Earth Glory</strong><small>Beauty · Massage · Nails</small></div>
        </div>
        <div className="footer-links">
          <div><strong>Explore</strong><a href="#treatments">Treatments</a><a href="#studio">Our studio</a><a href="#reviews">Kind words</a></div>
          <div><strong>Useful</strong><a href="#visit">Visit & access</a><a href="#faq">Before you book</a></div>
          <div><strong>Contact</strong><p>141 North End Road, West Kensington, London W14 9NH</p><a href="tel:+447745241200">07745 241200</a><a href="mailto:earth.glory14@gmail.com">earth.glory14@gmail.com</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 Earth Glory website concept</span><span>Owner review</span><span>Demo data only · Treatwell handles live bookings</span></div>
      </footer>

      <a className="mobile-book" href={LIVE_BOOKING_PROVIDER.bookingUrl} target="_blank" rel="noopener noreferrer">
        <span><small>Current live calendar</small>Book with Earth Glory</span>
        <strong>Treatwell <ArrowRight size={16} /></strong>
      </a>

        </>
      ) : (
        <RoleWorkspace
          key={`${activeRole}-${demoState.revision}`}
          role={activeRole}
          appointment={demoState.appointment}
          otherAppointments={demoState.otherAppointments}
          blocks={demoState.blocks}
          services={demoState.services}
          operatingHours={demoState.operatingHours}
          practitionerHours={demoState.practitionerHours}
          bookingRules={demoState.bookingRules}
          onStartBooking={(service, options) => startBooking(service, options)}
          onReschedule={() => startBooking(demoState.appointment.service, { mode: 'reschedule', appointmentId: demoState.appointment.id })}
          onCancel={() => dispatch({ type: 'CANCEL_APPOINTMENT' })}
          onStatusChange={(status, label) => dispatch({ type: 'SET_STATUS', status, label, actor: 'Practitioner' })}
          onSaveNote={(note) => dispatch({ type: 'SAVE_NOTE', note })}
          onAddBlock={(block) => dispatch({ type: 'ADD_BLOCK', block })}
          onRecordPayment={(amount, method) => dispatch({ type: 'RECORD_PAYMENT', amount, method })}
          onUpdateHours={(payload) => dispatch({ type: 'UPDATE_HOURS', ...payload })}
          onUpdateClient={(client) => dispatch({ type: 'UPDATE_CLIENT', client })}
          onSaveTreatment={saveTreatment}
        />
      )}

      {bookingOpen && (
        <BookingDialog
          services={bookableServices}
          initialService={selectedService}
          visitorType={activeRole === 'client' ? 'client' : 'guest'}
          mode={bookingIntent.mode}
          existingAppointment={bookingIntent.appointmentId ? demoState.appointment : null}
          clientDetails={demoState.appointment.client}
          busyEvents={busyEvents}
          operatingHours={demoState.operatingHours}
          practitionerHours={demoState.practitionerHours}
          bookingRules={demoState.bookingRules}
          onComplete={completeBooking}
          onManage={manageCompletedBooking}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  )
}

function BookingDialog({
  services,
  initialService,
  visitorType = 'guest',
  mode = 'new',
  existingAppointment,
  clientDetails,
  busyEvents,
  operatingHours,
  practitionerHours,
  bookingRules,
  onComplete,
  onManage,
  onClose,
}) {
  const [step, setStep] = useState(mode === 'reschedule' ? 2 : 1)
  const [service, setService] = useState(initialService)
  const practitioner = practitioners[0]
  const dates = useMemo(() => upcomingDates(), [])
  const [date, setDate] = useState(() => existingAppointment ? dateFromKey(existingAppointment.dateKey) : dates[0])
  const [time, setTime] = useState(existingAppointment?.startTime ?? '')
  const [details, setDetails] = useState(existingAppointment
    ? { ...existingAppointment.client, consent: false, marketing: false }
    : visitorType === 'client'
      ? { ...clientDetails, consent: false, marketing: false }
    : { name: '', email: '', phone: '', consent: false })
  const [submitted, setSubmitted] = useState(false)
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [completedAppointment, setCompletedAppointment] = useState(null)
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const returnFocusRef = useRef(null)
  const successTitleRef = useRef(null)
  const stepTitleRef = useRef(null)
  const previousStepRef = useRef(step)
  const availability = useMemo(() => getAvailabilityForDate({
    dateKey: dateKey(date),
    service,
    operatingHours,
    practitionerHours,
    busyEvents,
    slotIntervalMinutes: bookingRules.slotIntervalMinutes,
    excludeEventId: mode === 'reschedule' ? existingAppointment?.id : null,
  }), [bookingRules.slotIntervalMinutes, busyEvents, date, existingAppointment?.id, mode, operatingHours, practitionerHours, service])
  const resolvedTime = availability.slots.some((slot) => slot.start === time && slot.available) ? time : ''
  const selectedSlot = availability.slots.find((slot) => slot.start === resolvedTime)
  const atJourneyStart = step === 1 || (mode === 'reschedule' && step === 2)

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
    else {
      const completed = onComplete({ service, date, time: resolvedTime, details, mode })
      setCompletedAppointment(completed)
      setSubmitted(true)
    }
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
            <div className="eyebrow dark"><span /> Preview complete</div>
            <h2 ref={successTitleRef} id="booking-dialog-title" tabIndex="-1">{mode === 'reschedule' ? 'Change preview complete—Treatwell was not updated.' : 'No appointment was booked.'}</h2>
            <p id="booking-dialog-description">This sample now appears in the Client, Practitioner and Owner prototype views so you can review the proposed workflow. Treatwell remains Earth Glory’s live calendar; nothing was charged, submitted or sent.</p>
            <div className="success-card">
              <div><small>Reference</small><strong>{completedAppointment?.reference}</strong></div>
              <div><small>Treatment</small><strong>{completedAppointment?.service.name}</strong></div>
              <div><small>Date & time</small><strong>{completedAppointment && formatLondonDate(dateFromKey(completedAppointment.dateKey), { weekday: 'long', month: 'long', day: 'numeric' })} · {completedAppointment && formatClockTime(completedAppointment.startTime)}</strong></div>
              <div><small>Therapist</small><strong>{practitioner.name}</strong></div>
              <div><small>Payment</small><strong>{completedAppointment && formatMoney(completedAppointment.service.price)} due at venue · simulated</strong></div>
            </div>
            <div className="success-records" aria-label="Records changed in this prototype session">
              <strong>What changed in this prototype session</strong>
              <div>
                <span><CheckCircle2 size={15} /> Client can manage this sample</span>
                <span><CheckCircle2 size={15} /> Practitioner sees the same sample time</span>
                <span><CheckCircle2 size={15} /> Owner sees the same demo status and balance</span>
                <span><CheckCircle2 size={15} /> Sample availability treats the time as occupied</span>
              </div>
            </div>
            <div className="success-actions full-width">
              <a className="button button-dark button-large" href={LIVE_BOOKING_PROVIDER.bookingUrl} target="_blank" rel="noopener noreferrer">Book for real on Treatwell</a>
              <button className="button button-light button-large" type="button" onClick={onManage}>Follow this sample across views</button>
            </div>
            <small className="demo-note">Session-only demo — no appointment, payment, email or SMS was created.</small>
          </div>
        ) : (
          <>
            <div className="booking-main">
              <div className="booking-progress-mobile" aria-live="polite">
                <span>Step {step} of 4</span><strong>{['Treatment', 'Date & time', 'Your details', 'Review'][step - 1]}</strong>
              </div>
              <div className="booking-preview-warning"><ShieldCheck size={18} /><span><strong>Preview only</strong>These are sample services and times, not Treatwell availability. No real appointment will be created.</span></div>

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
                        onClick={() => { setService(item); setTime('') }}
                      >
                        <span className="choice-radio">{service.id === item.id && <span />}</span>
                        <span className="choice-copy"><strong>{item.name}</strong><small>{item.description}</small><em><Clock3 size={13} /> {item.duration} min treatment · {item.bufferAfter} min reset</em></span>
                        <span className="choice-price">{formatMoney(item.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="booking-step">
                  <div className="eyebrow dark"><span /> Step two</div>
                  <h2 ref={stepTitleRef} id="booking-dialog-title" tabIndex="-1">{mode === 'reschedule' ? 'Choose a new time.' : 'Choose a date and time.'}</h2>
                  <p id="booking-dialog-description" className="step-intro">Sample times are calculated from the prototype’s opening hours, Avni’s working hours, treatment length, reset time, appointments, breaks and blocked time.</p>
                  <div className="date-strip">
                    {dates.map((item) => (
                      <button
                        key={item.toISOString()}
                        className={dateKey(date) === dateKey(item) ? 'active' : ''}
                        type="button"
                        aria-pressed={dateKey(date) === dateKey(item)}
                        onClick={() => { setDate(item); setTime('') }}
                      >
                        <small>{formatLondonDate(item, { weekday: 'short' })}</small>
                        <strong>{formatLondonDate(item, { day: 'numeric' })}</strong>
                        <span>{formatLondonDate(item, { month: 'short' })}</span>
                      </button>
                    ))}
                  </div>
                  <div className="time-label"><span>Calculated sample times</span><small><span className="pulse-dot" /> {availability.slots.filter((slot) => slot.available).length} available</small></div>
                  <div className="time-grid">
                    {availability.slots.map((slot) => (
                      <button
                        key={slot.start}
                        disabled={!slot.available}
                        className={resolvedTime === slot.start ? 'active' : ''}
                        type="button"
                        aria-pressed={resolvedTime === slot.start}
                        onClick={() => setTime(slot.start)}
                      >
                        {formatClockTime(slot.start)}{!slot.available && <small>{slot.reason}</small>}
                      </button>
                    ))}
                  </div>
                  {availability.slots.length === 0 && <div className="booking-help"><Clock3 size={18} /><p><strong>No sample times on this day.</strong>Select another date to continue the preview. Check Treatwell for current live availability.</p></div>}
                  {selectedSlot?.available && <div className="booking-help"><Clock3 size={18} /><p><strong>{formatClockTime(selectedSlot.start)}–{formatClockTime(selectedSlot.end)} sample treatment.</strong>The prototype protects the time until {formatClockTime(selectedSlot.blockedEnd)}, including {service.bufferAfter} minutes to reset the room.</p></div>}
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
                    <label className="checkbox-label optional"><input checked={Boolean(details.marketing)} onChange={(event) => setDetails({ ...details, marketing: event.target.checked })} type="checkbox" /><span>Send me occasional Earth Glory offers in this sample journey. Optional and separate from appointment messages.</span></label>
                  </form>
                  <div className="secure-note"><LockKeyhole size={17} /><span><strong>Prototype only</strong>These details remain only in this browser session and reset when the page is refreshed or Reset demo is selected.</span></div>
                </div>
              )}

              {step === 4 && (
                <div className="booking-step">
                  <div className="eyebrow dark"><span /> Final step</div>
                  <h2 ref={stepTitleRef} id="booking-dialog-title" tabIndex="-1">Review before you finish.</h2>
                  <p id="booking-dialog-description" className="step-intro">This previews the point where a live service would show the complete order, policy and payment commitment.</p>
                  <div className="booking-review">
                    <dl>
                      <div><dt>Service provider</dt><dd>Earth Glory · {practitioner.name}</dd></div>
                      <div><dt>Treatment</dt><dd>{service.name} · {service.duration} minutes</dd></div>
                      <div><dt>Calendar time</dt><dd>{service.duration + service.bufferAfter} minutes including room reset</dd></div>
                      <div><dt>Date & time</dt><dd>{formatLondonDate(date, { weekday: 'long', month: 'long', day: 'numeric' })} · {formatClockTime(resolvedTime)}</dd></div>
                      <div><dt>Venue</dt><dd>141 North End Road · West Kensington, London</dd></div>
                      <div><dt>Treatment price</dt><dd>{formatMoney(service.price)}</dd></div>
                      <div><dt>Payment mode</dt><dd>Pay at venue · simulated</dd></div>
                      <div><dt>Due now</dt><dd>£0 in prototype</dd></div>
                    </dl>
                    <div className="review-policy">
                      <ShieldCheck size={19} />
                      <div>
                        <p><strong>Sample policy for workflow feedback.</strong>Changes are demonstrated only. Earth Glory’s final cancellation, refund and no-show wording still requires owner approval.</p>
                        <label className="policy-check"><input type="checkbox" checked={policyAccepted} onChange={(event) => setPolicyAccepted(event.target.checked)} /><span>I accept the sample booking and cancellation terms for this prototype.</span></label>
                      </div>
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
                ><span className="summary-brand-logo"><img src={lotusLogo} alt="" width="256" height="256" aria-hidden="true" /></span></div>
                <h3>{service.name}</h3>
                <ul>
                  <li><Clock3 size={16} /><span><small>Appointment time</small><strong>{service.duration} min + {service.bufferAfter} min reset</strong></span></li>
                  <li><UserRound size={16} /><span><small>Therapist</small><strong>{practitioner.name}</strong></span></li>
                  {step >= 2 && resolvedTime && <li><CalendarDays size={16} /><span><small>Date & time</small><strong>{formatLondonDate(date, { month: 'short', day: 'numeric' })} · {formatClockTime(resolvedTime)}</strong></span></li>}
                </ul>
              </div>
              <div className="summary-total">
                <div><span>Treatment</span><strong>{formatMoney(service.price)}</strong></div>
                <div><span>Payment terms</span><strong>Pay at venue · sample</strong></div>
                <div><span>Due now</span><strong>£0 in prototype</strong></div>
              </div>
            </aside>

            <div className="booking-footer">
              <button className="back-button" type="button" onClick={() => atJourneyStart ? onClose() : setStep((current) => current - 1)}>
                <ArrowLeft size={17} /> {atJourneyStart ? 'Close' : 'Back'}
              </button>
              <div className="step-dots" aria-hidden="true">{[1, 2, 3, 4].map((item) => <span key={item} className={item <= step ? 'active' : ''} />)}</div>
              <button
                className="button button-dark"
                type={step === 3 ? 'submit' : 'button'}
                form={step === 3 ? 'booking-details-form' : undefined}
                onClick={step === 3 ? undefined : goNext}
                disabled={(step === 2 && !resolvedTime) || (step === 4 && !policyAccepted)}
              >
                {step === 4 ? (mode === 'reschedule' ? 'Finish change preview' : 'Finish preview') : 'Continue'} <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
