import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Ban,
  BarChart3,
  Bell,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  FileText,
  Heart,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  NotebookPen,
  Plus,
  PoundSterling,
  Receipt,
  Scissors,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  UserCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { endTimeForAppointment, formatClockTime, getAvailabilityForDate, parseClockTime } from './availability'

const lotusLogo = `${import.meta.env.BASE_URL}earth-glory-lotus-logo.png`

const prototypeRoles = [
  { id: 'guest', label: 'Guest', detail: 'Discover and book' },
  { id: 'client', label: 'Client', detail: 'Manage my visits' },
  { id: 'practitioner', label: 'Practitioner', detail: 'Deliver today’s care' },
  { id: 'owner', label: 'Owner', detail: 'Run Earth Glory' },
]

const venue = '141 North End Road, West Kensington'
const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const blockingStatuses = new Set(['held', 'pending_payment', 'confirmed', 'arrived', 'in_service', 'completed'])

function formatMoney(value) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)
}

function dateFromKey(value) {
  return new Date(`${value}T12:00:00Z`)
}

function formatAppointmentDate(appointment, options = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'Europe/London' }).format(dateFromKey(appointment.dateKey))
}

function statusLabel(status) {
  return {
    confirmed: 'Confirmed',
    arrived: 'Arrived',
    in_service: 'In service',
    completed: 'Completed',
    no_show: 'No-show',
    cancelled_client: 'Cancelled',
    cancelled_business: 'Business cancelled',
  }[status] ?? status
}

function statusTone(status) {
  if (status === 'completed') return 'green'
  if (status === 'cancelled_client' || status === 'cancelled_business' || status === 'no_show') return 'rose'
  if (status === 'arrived' || status === 'in_service') return 'sand'
  return 'plain'
}

function paymentStatus(appointment) {
  if (appointment.status.startsWith('cancelled')) {
    const refunded = appointment.cancellation?.refundAmount ?? 0
    return refunded ? `Cancelled · ${formatMoney(refunded)} sample refund` : 'Cancelled · no payment collected'
  }
  const due = outstandingAmount(appointment)
  if (due === 0) return 'Paid'
  if (appointment.paidAmount > 0) return `${formatMoney(appointment.paidAmount)} paid · ${formatMoney(due)} due`
  return `${formatMoney(due)} due at venue`
}

function outstandingAmount(appointment) {
  if (appointment.status.startsWith('cancelled')) return 0
  return Math.max(0, appointment.service.price - appointment.paidAmount)
}

function canClientManage(appointment) {
  return ['held', 'pending_payment', 'confirmed'].includes(appointment.status)
}

function initialsFor(name) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function busyEventFromAppointment(appointment) {
  return {
    id: appointment.id,
    dateKey: appointment.dateKey,
    start: appointment.startTime,
    end: endTimeForAppointment({ startTime: appointment.startTime, duration: appointment.service.duration + appointment.service.bufferAfter }),
    type: 'appointment',
    status: appointment.status,
  }
}

const roleConfig = {
  client: {
    eyebrow: 'Client portal',
    title: 'Welcome back, Maya',
    subtitle: 'View and manage your Earth Glory appointments.',
    identity: 'Maya Thompson',
    initials: 'MT',
    permission: 'Only your bookings and details',
    nav: [
      ['home', 'Home', LayoutDashboard],
      ['appointments', 'Appointments', CalendarDays],
      ['payments', 'Payments & receipts', Receipt],
      ['profile', 'Your details', UserRound],
    ],
  },
  practitioner: {
    eyebrow: 'Practitioner workspace',
    title: 'Good morning, Avni',
    subtitle: 'Here’s your personal schedule for today.',
    identity: 'Avni',
    initials: 'A',
    permission: 'Assigned appointments only',
    nav: [
      ['today', 'Demo day', LayoutDashboard],
      ['calendar', 'My calendar', CalendarDays],
      ['clients', 'My clients', UsersRound],
      ['time-off', 'Time off', Timer],
    ],
  },
  owner: {
    eyebrow: 'Owner workspace',
    title: 'Earth Glory overview',
    subtitle: 'Today’s appointments, payments and business activity.',
    identity: 'Avni',
    initials: 'A',
    permission: 'Full Earth Glory access',
    nav: [
      ['overview', 'Overview', LayoutDashboard],
      ['calendar', 'Calendar', CalendarDays],
      ['appointments', 'Appointments', CalendarPlus],
      ['clients', 'Clients', UsersRound],
      ['treatments', 'Treatments', Scissors],
      ['team', 'Team', UserCheck],
      ['payments', 'Payments', CreditCard],
      ['reports', 'Reports', BarChart3],
      ['settings', 'Settings', Settings2],
    ],
  },
}

function getDemoDates() {
  const today = new Date()
  const appointmentDate = new Date(today)
  appointmentDate.setDate(today.getDate() + 3)
  const laterDate = new Date(today)
  laterDate.setDate(today.getDate() + 24)
  const format = (date, options) => new Intl.DateTimeFormat('en-GB', { ...options, timeZone: 'Europe/London' }).format(date)
  return {
    today: format(today, { weekday: 'long', day: 'numeric', month: 'long' }),
    appointment: format(appointmentDate, { weekday: 'long', day: 'numeric', month: 'long' }),
    appointmentShort: format(appointmentDate, { weekday: 'short', day: 'numeric', month: 'short' }),
    later: format(laterDate, { weekday: 'short', day: 'numeric', month: 'short' }),
  }
}

const demoDates = getDemoDates()

export function RoleSwitcher({ activeRole, onChange, onReset }) {
  return (
    <section className="role-switcher" aria-label="Choose a prototype view">
      <div className="role-switcher-intro">
        <strong>Preview as</strong>
        <span>Follow one booking through each user view</span>
      </div>
      <div className="role-options">
        {prototypeRoles.map((role) => (
          <button
            className={activeRole === role.id ? 'role-option active' : 'role-option'}
            type="button"
            key={role.id}
            aria-pressed={activeRole === role.id}
            onClick={() => onChange(role.id)}
          >
            <span>{role.label}</span>
            <small>{role.detail}</small>
          </button>
        ))}
      </div>
      <div className="role-demo-note"><span>Session-only sample data</span><button type="button" onClick={onReset}>Reset demo</button></div>
    </section>
  )
}

export function RoleWorkspace({
  role,
  appointment,
  otherAppointments,
  blocks,
  services,
  operatingHours,
  practitionerHours,
  bookingRules,
  onStartBooking,
  onReschedule,
  onCancel,
  onStatusChange,
  onSaveNote,
  onAddBlock,
  onRecordPayment,
  onUpdateHours,
  onUpdateClient,
}) {
  const baseConfig = roleConfig[role]
  const config = role === 'client'
    ? { ...baseConfig, identity: appointment.client.name, initials: initialsFor(appointment.client.name) }
    : baseConfig
  const [activePage, setActivePage] = useState(config.nav[0][0])
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [dialog, setDialog] = useState(null)
  const [notice, setNotice] = useState('')
  const allAppointments = [...otherAppointments, appointment]

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 3200)
  }

  const cancelAppointment = () => {
    onCancel()
    setDialog(null)
    showNotice('Demo appointment cancelled. Every role now shows the same state.')
  }

  const saveNote = (note) => {
    onSaveNote(note)
    setDialog(null)
    showNotice('Service note saved to this browser session.')
  }

  const addBlock = (block) => {
    onAddBlock(block)
    setDialog(null)
    showNotice('Blocked time added. Overlapping Guest slots are now unavailable.')
  }

  const recordPayment = (amount, method) => {
    onRecordPayment(amount, method)
    setDialog(null)
    showNotice('Sample payment recorded across Owner, Practitioner and Client views.')
  }

  const rescheduleAppointment = () => {
    setDialog(null)
    onReschedule()
  }

  const selectPage = (page) => {
    setActivePage(page)
    setMobileNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="workspace-shell">
      <aside className={mobileNavOpen ? 'workspace-sidebar open' : 'workspace-sidebar'}>
        <div className="workspace-brand">
          <span className="workspace-brand-mark workspace-brand-logo"><img src={lotusLogo} alt="" width="256" height="256" aria-hidden="true" /></span>
          <span><strong>Earth Glory</strong><small>{config.eyebrow}</small></span>
          <button className="workspace-nav-close" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)}><X size={20} /></button>
        </div>

        <nav className="workspace-nav" aria-label={`${config.eyebrow} navigation`}>
          {config.nav.map(([id, label, Icon]) => (
            <button className={activePage === id ? 'active' : ''} type="button" key={id} onClick={() => selectPage(id)}>
              <Icon size={18} /> <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="permission-card">
          <ShieldCheck size={18} />
          <span><strong>This view can access</strong><small>{config.permission}</small></span>
        </div>

        <div className="workspace-identity">
          <span className="workspace-avatar">{config.initials}</span>
          <span><strong>{config.identity}</strong><small>Prototype identity</small></span>
          <MoreHorizontal size={18} />
        </div>
      </aside>

      {mobileNavOpen && <button className="workspace-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}

      <div className="workspace-content">
        <header className="workspace-topbar">
          <button className="workspace-menu" type="button" aria-label="Open navigation" onClick={() => setMobileNavOpen(true)}><Menu size={21} /></button>
          <div className="workspace-mobile-brand" aria-hidden="true"><img src={lotusLogo} alt="" width="256" height="256" /><strong>Earth Glory</strong></div>
          <div className="workspace-search"><Search size={17} /><span>Search sample records</span><kbd>⌘ K</kbd></div>
          <div className="workspace-top-actions">
            <button type="button" aria-label="Notifications · preview only" disabled><Bell size={19} /><span /></button>
            <span className="workspace-top-avatar">{config.initials}</span>
          </div>
        </header>

        <main className="workspace-main" id="role-workspace-main">
          <div className="prototype-boundary"><Sparkles size={15} /><span><strong>{config.eyebrow} prototype</strong> — connected session-only data; no live booking, payment or message is created.</span></div>
          {notice && <div className="workspace-notice" role="status"><CheckCircle2 size={16} /><span>{notice}</span></div>}
          {role === 'client' && <ClientView activePage={activePage} appointment={appointment} appointments={allAppointments} onStartBooking={onStartBooking} onOpenDetail={() => setDialog('detail')} onReschedule={onReschedule} onCancel={() => setDialog('cancel')} onUpdateClient={onUpdateClient} />}
          {role === 'practitioner' && <PractitionerView activePage={activePage} appointment={appointment} appointments={allAppointments} blocks={blocks} onStartBooking={onStartBooking} onOpenDetail={() => setDialog('detail')} onStatusChange={onStatusChange} onAddNote={() => setDialog('note')} />}
          {role === 'owner' && <OwnerView activePage={activePage} appointment={appointment} appointments={allAppointments} blocks={blocks} services={services} operatingHours={operatingHours} practitionerHours={practitionerHours} bookingRules={bookingRules} onOpenDetail={() => setDialog('detail')} onAddBlock={() => setDialog('block')} onStartBooking={onStartBooking} onUpdateHours={onUpdateHours} onNavigate={selectPage} showNotice={showNotice} />}
        </main>
      </div>

      {(dialog === 'detail' || dialog === 'cancel') && <AppointmentDetailDialog role={role} appointment={appointment} confirmCancel={dialog === 'cancel'} onClose={() => setDialog(null)} onReschedule={rescheduleAppointment} onCancel={dialog === 'cancel' ? cancelAppointment : () => setDialog('cancel')} onRecordPayment={() => setDialog('payment')} />}
      {dialog === 'note' && <ServiceNoteDialog appointment={appointment} onClose={() => setDialog(null)} onSave={saveNote} />}
      {dialog === 'block' && <BlockTimeDialog appointment={appointment} appointments={allAppointments} blocks={blocks} onClose={() => setDialog(null)} onSave={addBlock} />}
      {dialog === 'payment' && <RecordPaymentDialog appointment={appointment} onClose={() => setDialog('detail')} onSave={recordPayment} />}
    </div>
  )
}

function PageHeading({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="workspace-heading">
      <div><span className="workspace-eyebrow">{eyebrow}</span><h1 tabIndex="-1">{title}</h1><p>{subtitle}</p></div>
      {actions && <div className="heading-actions">{actions}</div>}
    </div>
  )
}

function Status({ children, tone = 'green' }) {
  return <span className={`status-pill status-${tone}`}><span />{children}</span>
}

function StatCard({ label, value, detail, Icon, tone = 'plain' }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-icon"><Icon size={19} /></div>
      <span>{label}</span><strong>{value}</strong><small>{detail}</small>
    </article>
  )
}

function FlowStrip({ active = 1 }) {
  const steps = ['Guest books', 'Client manages', 'Practitioner delivers', 'Owner oversees']
  return (
    <div className="flow-strip" aria-label="Appointment lifecycle">
      <span className="flow-label">Shared demo journey</span>
      <div>
        {steps.map((step, index) => (
          <span className={index === active ? 'active' : index < active ? 'complete' : ''} key={step}>
            <i>{index < active ? <Check size={11} /> : index + 1}</i>{step}{index < steps.length - 1 && <ChevronRight size={14} />}
          </span>
        ))}
      </div>
    </div>
  )
}

function ClientView({ activePage, appointment, appointments, onStartBooking, onOpenDetail, onReschedule, onCancel, onUpdateClient }) {
  if (activePage === 'appointments') return <ClientAppointments appointment={appointment} appointments={appointments} onStartBooking={onStartBooking} onOpenDetail={onOpenDetail} onReschedule={onReschedule} onCancel={onCancel} />
  if (activePage === 'payments') return <ClientPayments appointment={appointment} onOpenDetail={onOpenDetail} />
  if (activePage === 'profile') return <ClientProfile appointment={appointment} onUpdateClient={onUpdateClient} />

  const cancelled = appointment.status.startsWith('cancelled')
  const completed = appointment.status === 'completed'
  const past = completed || appointment.status === 'no_show'
  const manageable = canClientManage(appointment)
  const due = outstandingAmount(appointment)

  return (
    <>
      <PageHeading
        eyebrow="Client portal"
        title={`Welcome back, ${appointment.client.name.split(' ')[0]}`}
        subtitle="View and manage your Earth Glory appointments."
        actions={<button className="workspace-primary" type="button" onClick={() => onStartBooking(appointment.service)}><Plus size={17} /> {cancelled || past ? 'Book again' : 'Book a treatment'}</button>}
      />
      <FlowStrip active={past ? 3 : 1} />
      <section className="client-home-grid">
        <article className="next-appointment-card">
          <div className="card-heading"><span><CalendarDays size={18} /> {cancelled || past ? 'Most recent booking' : 'Next appointment'}</span><Status tone={statusTone(appointment.status)}>{statusLabel(appointment.status)}</Status></div>
          <div className="appointment-date-block"><strong>{formatAppointmentDate(appointment)}</strong><span>{formatClockTime(appointment.startTime)}</span></div>
          <div className="appointment-main-copy">
            <span className="appointment-monogram">A</span>
            <div><h2>{appointment.service.name}</h2><p>{appointment.service.duration} minutes with {appointment.practitioner.name}</p><small><MapPin size={13} /> West Kensington · {appointment.reference}</small></div>
          </div>
          <div className="appointment-actions">
            <button className="workspace-primary" type="button" onClick={onOpenDetail}>View appointment</button>
            {manageable && <button className="workspace-secondary" type="button" onClick={onReschedule}>Reschedule</button>}
            {manageable && <button className="workspace-text-danger" type="button" onClick={onCancel}>Cancel</button>}
          </div>
        </article>

        <article className="panel quick-actions-panel">
          <div className="panel-title"><div><span>Quick actions</span><small>Everything for your next visit</small></div></div>
          <button type="button" onClick={() => onStartBooking(appointment.service)}><span className="action-icon"><CalendarPlus size={18} /></span><span><strong>Book another treatment</strong><small>Preselect {appointment.service.name}</small></span><ChevronRight size={17} /></button>
          <a href={`data:text/calendar;charset=utf-8,${encodeURIComponent(`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${appointment.service.name} at Earth Glory\nDTSTART:${appointment.dateKey.replaceAll('-', '')}T${appointment.startTime.replace(':', '')}00\nEND:VEVENT\nEND:VCALENDAR`)}`} download={`${appointment.reference}.ics`}><span className="action-icon"><CalendarDays size={18} /></span><span><strong>Add to calendar</strong><small>Download a sample reminder</small></span><ChevronRight size={17} /></a>
          <a href="https://www.google.com/maps/search/?api=1&query=141%20North%20End%20Road%20London%20W14%209NH" target="_blank" rel="noreferrer"><span className="action-icon"><MapPin size={18} /></span><span><strong>Get directions</strong><small>141 North End Road</small></span><ChevronRight size={17} /></a>
        </article>
      </section>

      <section className="lower-grid">
        <article className="panel journey-panel">
          <div className="panel-title"><div><span>Your appointment journey</span><small>One record shared across every view</small></div><button type="button" onClick={onOpenDetail}>View details</button></div>
          <div className="journey-list">
            <div className="done"><span><Check size={13} /></span><p><strong>Booking recorded in this session</strong><small>Sample confirmation for {appointment.client.email}</small></p></div>
            <div className={!completed && !cancelled ? 'current' : ''}><span><Bell size={13} /></span><p><strong>Reminder before your visit</strong><small>Preparation and arrival details</small></p></div>
            <div className={appointment.status === 'arrived' || appointment.status === 'in_service' ? 'current' : completed ? 'done' : ''}><span><Heart size={13} /></span><p><strong>Visit Earth Glory</strong><small>{formatAppointmentDate(appointment, { weekday: 'long', day: 'numeric', month: 'long' })} at {formatClockTime(appointment.startTime)}</small></p></div>
            <div className={past ? 'current' : ''}><span><MessageSquareText size={13} /></span><p><strong>{completed ? 'Review or book again' : cancelled || appointment.status === 'no_show' ? 'Book again when ready' : 'Review or book again'}</strong><small>{completed ? 'Unlocked by Practitioner completion' : appointment.status === 'no_show' ? 'The missed appointment remains in history' : 'Available after your completed visit'}</small></p></div>
          </div>
        </article>
        <article className="panel balance-panel">
          <div className="panel-title"><div><span>Payment summary</span><small>For {appointment.reference}</small></div><Receipt size={19} /></div>
          <div className="balance-row"><span>Treatment price</span><strong>{formatMoney(appointment.service.price)}</strong></div>
          <div className="balance-row"><span>Paid in prototype</span><strong>{formatMoney(appointment.paidAmount)}</strong></div>
          <div className="balance-total"><span>{cancelled ? 'Payment outcome' : due ? 'Due at venue' : 'Balance'}</span><strong>{cancelled ? paymentStatus(appointment) : due ? formatMoney(due) : 'Paid'}</strong></div>
          <p>Sample financial state only. No money was charged.</p>
        </article>
      </section>
    </>
  )
}

function ClientAppointments({ appointment, appointments, onStartBooking, onOpenDetail, onReschedule, onCancel }) {
  const belongsToClient = (item) => appointment.client.email
    ? item.client.email === appointment.client.email
    : item.client.name === appointment.client.name
  const clientAppointments = appointments.filter(belongsToClient)
  const groupFor = (item) => item.status.startsWith('cancelled')
    ? 'cancelled'
    : ['completed', 'no_show'].includes(item.status) ? 'past' : 'upcoming'
  const initialTab = groupFor(appointment)
  const [activeTab, setActiveTab] = useState(initialTab)
  const counts = {
    upcoming: clientAppointments.filter((item) => groupFor(item) === 'upcoming').length,
    past: clientAppointments.filter((item) => groupFor(item) === 'past').length,
    cancelled: clientAppointments.filter((item) => groupFor(item) === 'cancelled').length,
  }
  const visibleAppointments = clientAppointments
    .filter((item) => groupFor(item) === activeTab)
    .sort((a, b) => `${a.dateKey}-${a.startTime}`.localeCompare(`${b.dateKey}-${b.startTime}`))

  return (
    <>
      <PageHeading eyebrow="Client portal" title="Your appointments" subtitle="Manage upcoming visits and revisit past treatments." actions={<button className="workspace-primary" type="button" onClick={() => onStartBooking(appointment.service)}><Plus size={17} /> Book again</button>} />
      <div className="segmented-tabs"><button className={activeTab === 'upcoming' ? 'active' : ''} type="button" onClick={() => setActiveTab('upcoming')}>Upcoming <span>{counts.upcoming}</span></button><button className={activeTab === 'past' ? 'active' : ''} type="button" onClick={() => setActiveTab('past')}>Past <span>{counts.past}</span></button><button className={activeTab === 'cancelled' ? 'active' : ''} type="button" onClick={() => setActiveTab('cancelled')}>Cancelled <span>{counts.cancelled}</span></button></div>
      {visibleAppointments.length ? visibleAppointments.map((item) => {
        const isShared = item.id === appointment.id
        const manageable = isShared && canClientManage(item)
        return <article className="panel appointment-detail-card" key={item.id}>
          <div className="appointment-detail-date"><span>{formatAppointmentDate(item, { month: 'short' }).toUpperCase()}</span><strong>{formatAppointmentDate(item, { day: 'numeric' })}</strong><small>{formatClockTime(item.startTime)}</small></div>
          <div className="appointment-detail-copy"><Status tone={statusTone(item.status)}>{statusLabel(item.status)}</Status><h2>{item.service.name}</h2><p>{item.service.duration} minutes with {item.practitioner.name}</p><small><MapPin size={14} /> {venue}</small></div>
          <div className="appointment-detail-price"><small>{paymentStatus(item)}</small><strong>{formatMoney(item.service.price)}</strong><span>{item.reference}</span></div>
          <div className="appointment-detail-buttons"><button className="workspace-primary" type="button" disabled={!isShared} onClick={isShared ? onOpenDetail : undefined}>{isShared ? 'View appointment' : 'Read-only sample'}</button>{manageable && <button className="workspace-secondary" type="button" onClick={onReschedule}>Reschedule</button>}{manageable && <button className="workspace-secondary" type="button" onClick={onCancel}>Cancel</button>}</div>
        </article>
      }) : <article className="panel empty-state"><CalendarDays size={24} /><h2>No {activeTab} appointments</h2><p>The shared demo booking will move here when its status changes.</p></article>}
      <div className="info-note"><ShieldCheck size={18} /><p><strong>Manage securely without an app.</strong> Client access uses a secure email link. Cancellation and rescheduling options follow the policy accepted at booking.</p></div>
    </>
  )
}

function ClientPayments({ appointment, onOpenDetail }) {
  const cancelled = appointment.status.startsWith('cancelled')
  const refunded = appointment.cancellation?.refundAmount ?? 0
  const due = outstandingAmount(appointment)
  return (
    <>
      <PageHeading eyebrow="Client portal" title="Payments & receipts" subtitle="See charges and documents linked to your own appointments." />
      <section className="stats-grid three">
        <StatCard label="Collected now" value={formatMoney(appointment.paidAmount)} detail={refunded ? `${formatMoney(refunded)} refunded · ${appointment.paymentMethod || 'sample payment'}` : appointment.paymentMethod || 'No payment recorded'} Icon={CheckCircle2} />
        <StatCard label="Upcoming balance" value={formatMoney(due)} detail={cancelled ? 'Cancelled booking' : due ? 'Due at the venue' : 'Paid in full'} Icon={PoundSterling} tone="sand" />
        <StatCard label="Refunds" value={formatMoney(refunded)} detail={refunded ? 'Simulated cancellation refund' : 'No refunds recorded'} Icon={CreditCard} />
      </section>
      <article className="panel record-table-panel">
        <div className="panel-title"><div><span>Receipt history</span><small>Documents appear after payment is recorded</small></div></div>
        <div className="record-table"><div className="record-head"><span>Date</span><span>Treatment</span><span>Status</span><span>Amount</span><span /></div><div className="record-row"><span>{formatAppointmentDate(appointment, { day: 'numeric', month: 'short' })}</span><span>{appointment.service.name}</span><Status tone={cancelled ? 'rose' : due ? 'sand' : 'green'}>{cancelled ? 'Cancelled' : due ? 'Balance due' : 'Paid'}</Status><strong>{refunded ? `−${formatMoney(refunded)}` : formatMoney(appointment.paidAmount)}</strong><button type="button" aria-label="View payment details" onClick={onOpenDetail}><FileText size={17} /></button></div></div>
      </article>
    </>
  )
}

function ClientProfile({ appointment, onUpdateClient }) {
  const [saved, setSaved] = useState(false)
  const [details, setDetails] = useState(appointment.client)
  const valid = details.name.trim() && details.email.trim() && details.phone.trim()

  const updateField = (field, value) => {
    setDetails((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }

  const save = () => {
    if (!valid) return
    onUpdateClient({
      name: details.name.trim(),
      email: details.email.trim(),
      phone: details.phone.trim(),
    })
    setSaved(true)
  }
  return (
    <>
      <PageHeading eyebrow="Client portal" title="Your details" subtitle="Keep your contact information and communication choices current." actions={<button className="workspace-primary" type="button" disabled={!valid || saved} onClick={save}>{saved ? 'Saved in session' : 'Save changes'}</button>} />
      <section className="form-layout">
        <article className="panel form-panel"><div className="panel-title"><div><span>Contact details</span><small>Used for appointment messages</small></div></div><div className="mock-form"><label><span>Full name</span><input value={details.name} onChange={(event) => updateField('name', event.target.value)} /></label><label><span>Email</span><input type="email" value={details.email} onChange={(event) => updateField('email', event.target.value)} /></label><label><span>Mobile</span><input value={details.phone} onChange={(event) => updateField('phone', event.target.value)} /></label></div></article>
        <article className="panel preferences-panel"><div className="panel-title"><div><span>Communication</span><small>Transactional and marketing choices stay separate</small></div></div><label><span><strong>Appointment email</strong><small>Confirmations, changes and receipts</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>SMS reminders</strong><small>A short reminder before the visit</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>Offers and updates</strong><small>Optional marketing from Earth Glory</small></span><input type="checkbox" /></label></article>
      </section>
    </>
  )
}

function PractitionerView({ activePage, appointment, appointments, blocks, onStartBooking, onOpenDetail, onStatusChange, onAddNote }) {
  if (activePage === 'calendar') return <PractitionerCalendar appointment={appointment} appointments={appointments} blocks={blocks} onStartBooking={onStartBooking} onOpenDetail={onOpenDetail} />
  if (activePage === 'clients') return <PractitionerClients appointment={appointment} onOpenDetail={onOpenDetail} />
  if (activePage === 'time-off') return <PractitionerTimeOff />

  const nextStatus = { confirmed: 'arrived', arrived: 'in_service', in_service: 'completed' }[appointment.status]
  const actionLabel = { confirmed: 'Mark arrived', arrived: 'Start treatment', in_service: 'Complete appointment', completed: 'Appointment completed', no_show: 'Marked no-show', cancelled_client: 'Client cancelled' }[appointment.status] ?? 'No action available'
  const dateAppointments = appointments.filter((item) => item.dateKey === appointment.dateKey && !item.status.startsWith('cancelled')).sort((a, b) => parseClockTime(a.startTime) - parseClockTime(b.startTime))
  const completedCount = dateAppointments.filter((item) => item.status === 'completed').length
  const noShowCount = dateAppointments.filter((item) => item.status === 'no_show').length
  const remainingCount = dateAppointments.filter((item) => !['completed', 'no_show'].includes(item.status)).length
  const bookedMinutes = dateAppointments.filter((item) => blockingStatuses.has(item.status)).reduce((sum, item) => sum + item.service.duration + item.service.bufferAfter, 0)
  const dayBlocks = blocks.filter((block) => block.dateKey === appointment.dateKey)

  return (
    <>
      <PageHeading eyebrow={formatAppointmentDate(appointment, { weekday: 'long', day: 'numeric', month: 'long' })} title="Good morning, Avni" subtitle="Your own schedule, clients and service tasks—without owner-only settings." actions={<button className="workspace-primary" type="button" onClick={() => onStartBooking(appointment.service)}><Plus size={17} /> Add walk-in</button>} />
      <FlowStrip active={appointment.status === 'completed' ? 3 : 2} />
      <section className="stats-grid four">
        <StatCard label="Appointments" value={String(dateAppointments.length)} detail={`${remainingCount} active · ${completedCount} completed · ${noShowCount} no-show`} Icon={CalendarDays} />
        <StatCard label="Shared appointment" value={formatClockTime(appointment.startTime)} detail={`${appointment.client.name} · ${appointment.service.name}`} Icon={Clock3} tone="sand" />
        <StatCard label="Completed" value={String(completedCount)} detail={`${remainingCount} remaining on this sample day`} Icon={CheckCircle2} />
        <StatCard label="Booked time" value={`${Math.floor(bookedMinutes / 60)}h ${bookedMinutes % 60}m`} detail="Treatments plus reset buffers" Icon={Timer} />
      </section>
      <section className="practitioner-grid-layout">
        <article className="panel schedule-panel">
          <div className="panel-title"><div><span>Schedule for this demo day</span><small>London time · calculated intervals</small></div><button type="button" onClick={onOpenDetail}>Open shared booking</button></div>
          <div className="schedule-list">
            {dateAppointments.map((item) => <button className={`schedule-item ${item.id === appointment.id ? 'active' : item.status === 'completed' ? 'muted' : ''}`} type="button" key={item.id} disabled={item.id !== appointment.id} onClick={item.id === appointment.id ? onOpenDetail : undefined}><time>{formatClockTime(item.startTime)}</time><span className="schedule-line" /><span className="schedule-copy"><Status tone={statusTone(item.status)}>{statusLabel(item.status)}</Status><strong>{item.service.name}</strong><small>{item.client.name} · {item.service.duration} min + {item.service.bufferAfter} min reset</small></span><strong>{formatMoney(item.service.price)}</strong></button>)}
            {dayBlocks.map((block) => <div className="schedule-item blocked" key={block.id}><time>{formatClockTime(block.start)}</time><span className="schedule-line" /><div><strong>{block.type === 'break' ? 'Break' : 'Blocked time'}</strong><small>{formatClockTime(block.start)}–{formatClockTime(block.end)} · {block.label}</small></div></div>)}
          </div>
        </article>
        <article className="panel client-brief-panel">
          <div className="panel-title"><div><span>{appointment.status === 'in_service' ? 'Current client' : appointment.status === 'completed' ? 'Completed visit' : 'Shared demo client'}</span><small>{appointment.reference}</small></div><Status tone={statusTone(appointment.status)}>{statusLabel(appointment.status)}</Status></div>
          <div className="client-brief-person"><span>{initialsFor(appointment.client.name)}</span><div><strong>{appointment.client.name}</strong><small>Shared across Client, Practitioner and Owner views</small></div></div>
          <dl><div><dt>Treatment</dt><dd>{appointment.service.name}</dd></div><div><dt>Time</dt><dd>{formatClockTime(appointment.startTime)}–{formatClockTime(endTimeForAppointment({ startTime: appointment.startTime, duration: appointment.service.duration }))}</dd></div><div><dt>Calendar block</dt><dd>{appointment.service.duration + appointment.service.bufferAfter} minutes</dd></div><div><dt>Intake</dt><dd><CheckCircle2 size={14} /> Sample complete</dd></div><div><dt>Balance</dt><dd>{paymentStatus(appointment)}</dd></div></dl>
          <div className="prep-note"><NotebookPen size={18} /><p><strong>Operational note</strong>{appointment.serviceNote || 'No service note yet.'}</p></div>
          <button className="workspace-primary full" type="button" disabled={!nextStatus} onClick={() => nextStatus && onStatusChange(nextStatus, `${statusLabel(nextStatus)} by practitioner`)}>{actionLabel}{nextStatus && <ArrowRight size={16} />}</button>
          <div className="secondary-action-row"><button type="button" onClick={onAddNote}>Add service note</button><button type="button" disabled={!['confirmed', 'arrived'].includes(appointment.status)} onClick={() => window.confirm('Mark this sample appointment as a no-show?') && onStatusChange('no_show', 'Marked no-show by practitioner')}>Mark no-show</button></div>
        </article>
      </section>
    </>
  )
}

function PractitionerCalendar({ appointment, appointments, blocks, onStartBooking, onOpenDetail }) {
  return (
    <><PageHeading eyebrow="Practitioner workspace" title="My calendar" subtitle="Only your assigned appointments, shifts, breaks and time off." actions={<button className="workspace-primary" type="button" onClick={() => onStartBooking(appointment.service)}><Plus size={17} /> Add walk-in</button>} /><WeekCalendar personal appointment={appointment} appointments={appointments} blocks={blocks} onOpenDetail={onOpenDetail} /></>
  )
}

function PractitionerClients({ appointment, onOpenDetail }) {
  return (
    <><PageHeading eyebrow="Practitioner workspace" title="My clients" subtitle="Clients connected to your permitted appointments." /><article className="panel record-table-panel"><div className="panel-title"><div><span>Recent clients</span><small>Private treatment notes remain permission-controlled</small></div><button type="button" disabled><Search size={16} /> Search preview</button></div><div className="people-list"><PersonRow initials={initialsFor(appointment.client.name)} name={appointment.client.name} detail={`Shared demo · ${appointment.service.name}`} meta={`${formatAppointmentDate(appointment)} · ${formatClockTime(appointment.startTime)}`} onClick={onOpenDetail} /><PersonRow initials="SL" name="Sophie Lewis" detail="5 visits · Eyebrow Threading" meta="Sample history" /><PersonRow initials="NP" name="Noah Patel" detail="2 visits · Shellac Manicure" meta="Sample history" /></div></article></>
  )
}

function PractitionerTimeOff() {
  return (
    <><PageHeading eyebrow="Practitioner workspace" title="Time off" subtitle="See availability changes and request time away." actions={<button className="workspace-primary" type="button" disabled title="Planned for the next prototype batch"><Plus size={17} /> Request time off · preview</button>} /><section className="stats-grid three"><StatCard label="Regular schedule" value="7 days" detail="Sample hours mirror published opening hours" Icon={CalendarDays} /><StatCard label="Next approved time off" value={demoDates.later} detail="Full-day sample" Icon={CheckCircle2} tone="sand" /><StatCard label="Pending requests" value="0" detail="Nothing awaiting review" Icon={Clock3} /></section><div className="info-note"><ShieldCheck size={18} /><p><strong>Next prototype batch.</strong> Time-off approval will remove availability using the same overlap engine already used for appointments, breaks and blocked time.</p></div></>
  )
}

function OwnerView({ activePage, appointment, appointments, blocks, services, operatingHours, practitionerHours, bookingRules, onOpenDetail, onAddBlock, onStartBooking, onUpdateHours, onNavigate, showNotice }) {
  if (activePage === 'calendar') return <OwnerCalendar appointment={appointment} appointments={appointments} blocks={blocks} onAddBlock={onAddBlock} onStartBooking={onStartBooking} onOpenDetail={onOpenDetail} />
  if (activePage === 'appointments') return <OwnerAppointments appointment={appointment} appointments={appointments} onStartBooking={onStartBooking} onOpenDetail={onOpenDetail} />
  if (activePage === 'clients') return <OwnerClients appointment={appointment} appointments={appointments} onOpenDetail={onOpenDetail} />
  if (activePage === 'treatments') return <OwnerTreatments services={services} />
  if (activePage === 'team') return <OwnerTeam />
  if (activePage === 'payments') return <OwnerPayments appointment={appointment} appointments={appointments} onOpenDetail={onOpenDetail} />
  if (activePage === 'reports') return <OwnerReports appointments={appointments} />
  if (activePage === 'settings') return <OwnerSettings appointment={appointment} appointments={appointments} blocks={blocks} operatingHours={operatingHours} practitionerHours={practitionerHours} bookingRules={bookingRules} onUpdateHours={onUpdateHours} showNotice={showNotice} />

  const dayAppointments = appointments.filter((item) => item.dateKey === appointment.dateKey && !item.status.startsWith('cancelled')).sort((a, b) => parseClockTime(a.startTime) - parseClockTime(b.startTime))
  const bookedRevenue = dayAppointments.reduce((sum, item) => sum + item.service.price, 0)
  const collected = dayAppointments.reduce((sum, item) => sum + item.paidAmount, 0)
  const outstanding = Math.max(0, bookedRevenue - collected)
  const completed = dayAppointments.filter((item) => item.status === 'completed').length
  const noShows = dayAppointments.filter((item) => item.status === 'no_show').length
  const active = dayAppointments.filter((item) => !['completed', 'no_show'].includes(item.status)).length

  return (
    <>
      <PageHeading eyebrow={formatAppointmentDate(appointment, { weekday: 'long', day: 'numeric', month: 'long' })} title="Earth Glory overview" subtitle="One connected sample day across booking, delivery and payment." actions={<><button className="workspace-secondary" type="button" onClick={onAddBlock}>Block time</button><button className="workspace-primary" type="button" onClick={() => onStartBooking(appointment.service)}><Plus size={17} /> Create appointment</button></>} />
      <FlowStrip active={appointment.status === 'completed' ? 3 : 2} />
      <section className="stats-grid four">
        <StatCard label="Appointments" value={String(dayAppointments.length)} detail={`${active} active · ${completed} completed · ${noShows} no-show`} Icon={CalendarDays} />
        <StatCard label="Booked revenue" value={formatMoney(bookedRevenue)} detail="Visible sample appointments" Icon={TrendingUp} tone="sand" />
        <StatCard label="Collected" value={formatMoney(collected)} detail="Recorded sample payments" Icon={CheckCircle2} />
        <StatCard label="Outstanding" value={formatMoney(outstanding)} detail="Expected at the venue" Icon={PoundSterling} />
      </section>
      <section className="owner-overview-grid">
        <article className="panel owner-day-panel">
          <div className="panel-title"><div><span>Demo day at a glance</span><small>All visible Earth Glory appointments</small></div><button type="button" onClick={() => onNavigate('calendar')}>View calendar</button></div>
          <div className="owner-timeline">{dayAppointments.map((item) => <OwnerTimeline key={item.id} appointment={item} active={item.id === appointment.id} onOpen={item.id === appointment.id ? onOpenDetail : undefined} />)}</div>
        </article>
        <article className="panel attention-panel">
          <div className="panel-title"><div><span>Configuration</span><small>3 prototype areas to review</small></div></div>
          <button type="button" onClick={() => onNavigate('settings')}><span className="attention-icon rose"><CreditCard size={18} /></span><span><strong>Payment mode</strong><small>Pay at venue is the active sample rule</small></span><ChevronRight size={17} /></button>
          <button type="button" onClick={() => onNavigate('settings')}><span className="attention-icon sand"><FileText size={18} /></span><span><strong>Opening and cancellation rules</strong><small>Review calculated availability inputs</small></span><ChevronRight size={17} /></button>
          <button type="button" onClick={() => onNavigate('treatments')}><span className="attention-icon green"><CheckCircle2 size={18} /></span><span><strong>Service timing</strong><small>{services.length} treatments include duration and reset time</small></span><ChevronRight size={17} /></button>
        </article>
      </section>
      <section className="lower-grid">
        <article className="panel mini-chart-panel"><div className="panel-title"><div><span>Appointments this week</span><small>Sample business trend</small></div><strong>21 total</strong></div><div className="bar-chart" aria-label="Sample appointments by day">{[['Mon', 55], ['Tue', 76], ['Wed', 45], ['Thu', 88], ['Fri', 70], ['Sat', 95], ['Sun', 38]].map(([day, height]) => <div key={day}><span style={{ height: `${height}%` }} /><small>{day}</small></div>)}</div></article>
        <article className="panel access-panel"><div className="panel-title"><div><span>Roles at Earth Glory</span><small>Avni currently holds two roles</small></div></div><div><span className="workspace-avatar">A</span><p><strong>Avni</strong><small>Owner · Practitioner</small></p><Status>Active</Status></div><p>Role views stay separate so future practitioners cannot access business-wide settings or reports.</p></article>
      </section>
    </>
  )
}

function addDaysToKey(dateKey, days) {
  const date = dateFromKey(dateKey)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function WeekCalendar({ personal = false, appointment, appointments, blocks, onOpenDetail }) {
  const dateKeys = Array.from({ length: 5 }, (_, index) => addDaysToKey(appointment.dateKey, index))
  const positionForTime = (time) => 47 + Math.max(0, ((parseClockTime(time) - 540) / 660) * 350)
  const heightForDuration = (duration) => Math.max(34, (duration / 660) * 350)

  return (
    <article className="panel week-calendar">
      <div className="panel-title"><div><span>Five-day schedule</span><small>{personal ? 'Avni’s appointments and protected time' : 'All Earth Glory appointments and protected time'}</small></div><div className="calendar-controls"><span>London time</span></div></div>
      <div className="calendar-grid"><div className="calendar-times"><span>09:00</span><span>11:00</span><span>13:00</span><span>15:00</span><span>17:00</span><span>19:00</span></div>{dateKeys.map((key) => {
        const dayAppointments = appointments.filter((item) => item.dateKey === key && !item.status.startsWith('cancelled'))
        const dayBlocks = blocks.filter((block) => block.dateKey === key)
        return <div className="calendar-day" key={key}><strong>{new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(dateFromKey(key))}<small>{new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(dateFromKey(key))}</small></strong>{dayAppointments.map((item) => <button type="button" key={item.id} disabled={item.id !== appointment.id} className={`calendar-event dynamic ${item.id === appointment.id ? 'current' : ''}`} style={{ top: `${positionForTime(item.startTime)}px`, minHeight: `${heightForDuration(item.service.duration + item.service.bufferAfter)}px` }} onClick={item.id === appointment.id ? onOpenDetail : undefined}>{formatClockTime(item.startTime)}<small>{item.service.name} · {item.client.name}</small></button>)}{dayBlocks.map((block) => <span key={block.id} className="calendar-event dynamic blocked-event" style={{ top: `${positionForTime(block.start)}px`, minHeight: `${heightForDuration(parseClockTime(block.end) - parseClockTime(block.start))}px` }}>{formatClockTime(block.start)}<small>{block.label}</small></span>)}</div>
      })}</div>
    </article>
  )
}

function OwnerCalendar({ appointment, appointments, blocks, onAddBlock, onStartBooking, onOpenDetail }) {
  return <><PageHeading eyebrow="Owner workspace" title="Calendar" subtitle="See appointments, service buffers, breaks and blocked time." actions={<><button className="workspace-secondary" type="button" onClick={onAddBlock}>Block time</button><button className="workspace-primary" type="button" onClick={() => onStartBooking(appointment.service)}><Plus size={17} /> Create appointment</button></>} /><WeekCalendar appointment={appointment} appointments={appointments} blocks={blocks} onOpenDetail={onOpenDetail} /></>
}

function OwnerAppointments({ appointment, appointments, onStartBooking, onOpenDetail }) {
  const visible = appointments.filter((item) => item.dateKey === appointment.dateKey).sort((a, b) => parseClockTime(a.startTime) - parseClockTime(b.startTime))
  const value = visible.filter((item) => !item.status.startsWith('cancelled')).reduce((sum, item) => sum + item.service.price, 0)
  return <><PageHeading eyebrow="Owner workspace" title="Appointments" subtitle="Manage bookings, walk-ins, changes and appointment status." actions={<button className="workspace-primary" type="button" onClick={() => onStartBooking(appointment.service)}><Plus size={17} /> New appointment</button>} /><article className="panel record-table-panel"><div className="panel-title"><div><span>Bookings for {formatAppointmentDate(appointment)}</span><small>{visible.length} appointments · {formatMoney(value)} booked</small></div><button type="button" disabled><Search size={16} /> Search preview</button></div><div className="record-table five"><div className="record-head"><span>Time</span><span>Client</span><span>Treatment</span><span>Status</span><span>Value</span></div>{visible.map((item) => <AppointmentRow key={item.id} appointment={item} onClick={item.id === appointment.id ? onOpenDetail : undefined} />)}</div></article></>
}

function OwnerClients({ appointment, appointments, onOpenDetail }) {
  const clientCount = new Set(appointments.map((item) => item.client.name)).size
  return <><PageHeading eyebrow="Owner workspace" title="Clients" subtitle="Business-wide client history, consent and follow-up." actions={<button className="workspace-primary" type="button" disabled><Plus size={17} /> Add client · preview</button>} /><section className="stats-grid three"><StatCard label="Clients in records" value={String(clientCount)} detail="Across sample appointments" Icon={UsersRound} /><StatCard label="Shared client" value={appointment.client.name.split(' ')[0]} detail={appointment.reference} Icon={Heart} tone="sand" /><StatCard label="Current balance" value={formatMoney(outstandingAmount(appointment))} detail={paymentStatus(appointment)} Icon={Bell} /></section><article className="panel"><div className="panel-title"><div><span>Recent client highlights</span><small>The full directory remains a later prototype slice</small></div></div><div className="people-list"><PersonRow initials={initialsFor(appointment.client.name)} name={appointment.client.name} detail={`${appointment.service.name} · ${statusLabel(appointment.status)}`} meta={`${formatAppointmentDate(appointment)} · ${formatClockTime(appointment.startTime)}`} onClick={onOpenDetail} /><PersonRow initials="SL" name="Sophie Lewis" detail="Sample history · Eyebrow Threading" meta="Completed" /><PersonRow initials="NP" name="Noah Patel" detail="Sample history · Shellac Manicure" meta="Confirmed" /></div></article></>
}

function OwnerTreatments({ services }) {
  return <><PageHeading eyebrow="Owner workspace" title="Treatments" subtitle="Every published service has treatment time and protected reset time used by availability." actions={<button className="workspace-primary" type="button" disabled><Plus size={17} /> Add treatment · preview</button>} /><div className="info-note timing-note"><Clock3 size={18} /><p><strong>Availability uses total calendar time.</strong>A 60-minute massage with a 10-minute reset blocks 70 minutes, so it cannot be booked at 17:00 if another appointment begins at 17:45.</p></div><article className="panel service-admin-grid">{services.map((service) => <ServiceAdmin key={service.id} name={service.name} category={service.category} duration={`${service.duration} + ${service.bufferAfter} min`} price={formatMoney(service.price)} status="Published" />)}</article></>
}

function OwnerTeam() {
  return <><PageHeading eyebrow="Owner workspace" title="Team" subtitle="Manage roles, services, working hours and time off." actions={<button className="workspace-primary" type="button" disabled><Plus size={17} /> Add team member · preview</button>} /><article className="panel team-card"><div className="team-avatar">A</div><div><h2>Avni</h2><p>Owner · Practitioner</p><span>Massage · Nails · Facials · Brows & lashes</span></div><Status>Active</Status><button className="workspace-secondary" type="button" disabled>Manage · preview</button></article><div className="info-note"><ShieldCheck size={18} /><p><strong>Role separation is ready for growth.</strong> A future practitioner can manage their own day without seeing reports, refunds, policies or owner settings.</p></div></>
}

function OwnerPayments({ appointment, appointments, onOpenDetail }) {
  const collected = appointments.reduce((sum, item) => sum + item.paidAmount, 0)
  const total = appointments.filter((item) => !item.status.startsWith('cancelled')).reduce((sum, item) => sum + item.service.price, 0)
  const refunded = appointments.reduce((sum, item) => sum + (item.cancellation?.refundAmount ?? 0), 0)
  return <><PageHeading eyebrow="Owner workspace" title="Payments" subtitle="Track appointment value, collected money and balances." actions={<button className="workspace-secondary" type="button" disabled>Export · preview</button>} /><section className="stats-grid three"><StatCard label="Collected" value={formatMoney(collected)} detail="Across visible sample records" Icon={CheckCircle2} /><StatCard label="Outstanding" value={formatMoney(Math.max(0, total - collected))} detail="Due at the venue" Icon={PoundSterling} tone="sand" /><StatCard label="Refunds" value={formatMoney(refunded)} detail={refunded ? 'Simulated cancellation refunds' : 'No refunds recorded'} Icon={CreditCard} /></section><article className="panel record-table-panel"><div className="panel-title"><div><span>Payment activity</span><small>Changes to the shared appointment update every role</small></div></div><div className="record-table"><div className="record-head"><span>Reference</span><span>Client</span><span>Status</span><span>Amount</span><span /></div>{appointments.map((item) => { const cancelled = item.status.startsWith('cancelled'); const due = cancelled ? 0 : Math.max(0, item.service.price - item.paidAmount); return <div className="record-row" key={item.id}><span>{item.reference}</span><span>{item.client.name}</span><Status tone={cancelled ? 'rose' : due ? 'sand' : 'green'}>{cancelled ? 'Cancelled' : due ? 'Balance due' : 'Paid'}</Status><strong>{formatMoney(item.paidAmount)}</strong><button type="button" aria-label={`Open ${item.reference} payment`} disabled={item.id !== appointment.id} onClick={item.id === appointment.id ? onOpenDetail : undefined}><Receipt size={17} /></button></div> })}</div></article></>
}

function OwnerReports({ appointments }) {
  const booked = appointments.filter((item) => !item.status.startsWith('cancelled')).reduce((sum, item) => sum + item.service.price, 0)
  const completed = appointments.filter((item) => item.status === 'completed').length
  const noShows = appointments.filter((item) => item.status === 'no_show').length
  return <><PageHeading eyebrow="Owner workspace" title="Reports" subtitle="Metrics now reconcile to the visible sample appointments." actions={<button className="workspace-secondary" type="button" disabled>Export report · preview</button>} /><section className="stats-grid four"><StatCard label="Booked revenue" value={formatMoney(booked)} detail="Visible sample appointments" Icon={TrendingUp} /><StatCard label="Appointments" value={String(appointments.length)} detail={`${completed} completed`} Icon={CalendarDays} /><StatCard label="Collected" value={formatMoney(appointments.reduce((sum, item) => sum + item.paidAmount, 0))} detail="Sample recorded payments" Icon={BarChart3} tone="sand" /><StatCard label="No-show rate" value={`${appointments.length ? Math.round((noShows / appointments.length) * 100) : 0}%`} detail={`${noShows} no-show appointments`} Icon={UserRound} /></section><article className="panel mini-chart-panel wide"><div className="panel-title"><div><span>Prototype activity</span><small>Derived from the connected sample dataset</small></div><strong>{appointments.length} records</strong></div><div className="bar-chart tall">{[['Booked', appointments.length * 18], ['Complete', completed * 28], ['Paid', appointments.filter((item) => item.paidAmount >= item.service.price).length * 28], ['No-show', noShows * 28]].map(([day, height]) => <div key={day}><span style={{ height: `${Math.min(100, Math.max(5, height))}%` }} /><small>{day}</small></div>)}</div></article></>
}

function OwnerSettings({ appointment, appointments, blocks, operatingHours, practitionerHours, bookingRules, onUpdateHours, showNotice }) {
  const busyEvents = [...appointments.map(busyEventFromAppointment), ...blocks]
  const availability = getAvailabilityForDate({ dateKey: appointment.dateKey, service: appointment.service, operatingHours, practitionerHours, busyEvents, slotIntervalMinutes: bookingRules.slotIntervalMinutes, excludeEventId: appointment.id })
  const appointmentDay = dateFromKey(appointment.dateKey).getUTCDay()
  const appointmentStart = parseClockTime(appointment.startTime)
  const appointmentEnd = appointmentStart + appointment.service.duration + appointment.service.bufferAfter
  const appointmentWithinHours = (operatingHours[appointmentDay] ?? []).some((window) => (
    parseClockTime(window.start) <= appointmentStart && parseClockTime(window.end) >= appointmentEnd
  ))
  const applyHours = (payload) => {
    const validTimes = /^\d{2}:\d{2}$/.test(payload.start) && /^\d{2}:\d{2}$/.test(payload.end)
    let validWindow = false
    if (validTimes) {
      try {
        validWindow = parseClockTime(payload.start) < parseClockTime(payload.end)
      } catch {
        validWindow = false
      }
    }
    if (!payload.closed && !validWindow) {
      showNotice('Enter a valid opening time earlier than the closing time.')
      return
    }
    onUpdateHours(payload)
  }

  return <><PageHeading eyebrow="Owner workspace" title="Settings" subtitle="Opening-hour changes apply immediately to Guest availability in this browser session." /><section className="settings-grid"><article className="panel hours-card"><div className="panel-title"><div><span>Earth Glory operating hours</span><small>Sample owner-controlled opening window</small></div><Status>Auto-applied</Status></div><div className="hours-list">{dayNames.map((day, index) => { const window = operatingHours[index]?.[0]; return <div className="hours-row" key={day}><strong>{day}</strong><label><input type="checkbox" checked={Boolean(window)} onChange={(event) => applyHours({ day: index, closed: !event.target.checked, start: window?.start ?? '10:00', end: window?.end ?? '17:00' })} /><span>{window ? 'Open' : 'Closed'}</span></label><input aria-label={`${day} opening time`} type="time" value={window?.start ?? '10:00'} disabled={!window} onChange={(event) => applyHours({ day: index, closed: false, start: event.target.value, end: window.end })} /><span>to</span><input aria-label={`${day} closing time`} type="time" value={window?.end ?? '17:00'} disabled={!window} onChange={(event) => applyHours({ day: index, closed: false, start: window.start, end: event.target.value })} /></div> })}</div></article><article className="panel rules-card"><div className="panel-title"><div><span>Calculated booking rules</span><small>Applied immediately in the prototype</small></div><Status>Configured</Status></div><dl><div><dt>Slot interval</dt><dd>{bookingRules.slotIntervalMinutes} minutes</dd></div><div><dt>Practitioner hours</dt><dd>Intersected with business hours</dd></div><div><dt>Service occupancy</dt><dd>Treatment + reset buffer</dd></div><div><dt>Conflicts</dt><dd>Appointments, breaks and blocks</dd></div><div><dt>{appointment.service.name}</dt><dd>{appointment.service.duration} + {appointment.service.bufferAfter} minutes</dd></div><div><dt>Available starts on {formatAppointmentDate(appointment)}</dt><dd>{availability.slots.filter((slot) => slot.available).length}</dd></div></dl>{!appointmentWithinHours && <div className="dialog-warning"><Ban size={18} /><p><strong>Existing booking is now outside these hours.</strong>Changing hours does not cancel it; reschedule or review it separately.</p></div>}<div className="availability-example"><Clock3 size={18} /><p><strong>Late-booking protection is active.</strong>A candidate is unavailable when its treatment or reset buffer overlaps a later appointment, even when the proposed start itself looks free.</p></div></article></section></>
}

function OwnerTimeline({ appointment, active, onOpen }) {
  return <div className={active ? 'owner-timeline-row active' : 'owner-timeline-row'}><time>{formatClockTime(appointment.startTime)}</time><span className="person-avatar">{initialsFor(appointment.client.name)}</span><div><strong>{appointment.client.name}</strong><small>{appointment.service.name} · {appointment.practitioner.name}</small></div><Status tone={statusTone(appointment.status)}>{statusLabel(appointment.status)}</Status><b>{formatMoney(appointment.service.price)}</b><button type="button" aria-label={`Open ${appointment.client.name}'s appointment`} disabled={!onOpen} onClick={onOpen}><ChevronRight size={17} /></button></div>
}

function PersonRow({ initials, name, detail, meta, onClick }) {
  return <button className="person-row" type="button" disabled={!onClick} onClick={onClick}><span className="person-avatar">{initials}</span><span><strong>{name}</strong><small>{detail}</small></span><em>{meta}</em>{onClick && <ChevronRight size={17} />}</button>
}

function AppointmentRow({ appointment, onClick }) {
  return <button className="record-row appointment-row-button" type="button" disabled={!onClick} onClick={onClick}><strong>{formatClockTime(appointment.startTime)}</strong><span>{appointment.client.name}</span><span>{appointment.service.name}</span><Status tone={statusTone(appointment.status)}>{statusLabel(appointment.status)}</Status><strong>{formatMoney(appointment.service.price)}</strong></button>
}

function ServiceAdmin({ name, category, duration, price, status }) {
  return <div className="service-admin-row"><span className="service-admin-icon"><Scissors size={18} /></span><div><strong>{name}</strong><small>{category}</small></div><span>{duration}</span><strong>{price}</strong><Status tone={status === 'Published' ? 'green' : 'sand'}>{status}</Status><button type="button" disabled aria-label={`${name} editing is planned for the next prototype batch`}><MoreHorizontal size={18} /></button></div>
}

function PrototypeDialog({ title, description, onClose, children, footer }) {
  const closeRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    const previous = document.activeElement
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
    window.addEventListener('keydown', onKeyDown)
    document.body.classList.add('modal-open')
    closeRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('modal-open')
      previous?.focus?.()
    }
  }, [onClose])

  return <div className="booking-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section ref={dialogRef} className="prototype-dialog" role="dialog" aria-modal="true" aria-labelledby="prototype-dialog-title"><button ref={closeRef} className="dialog-close" type="button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button><header><span className="workspace-eyebrow">Connected prototype</span><h2 id="prototype-dialog-title">{title}</h2>{description && <p>{description}</p>}</header><div className="prototype-dialog-body">{children}</div>{footer && <footer>{footer}</footer>}</section></div>
}

function AppointmentDetailDialog({ role, appointment, confirmCancel, onClose, onReschedule, onCancel, onRecordPayment }) {
  const due = Math.max(0, appointment.service.price - appointment.paidAmount)
  const cancelled = appointment.status.startsWith('cancelled')
  const manageable = canClientManage(appointment)

  if (confirmCancel) {
    const cancellationMessage = appointment.paidAmount > 0
      ? `${formatMoney(appointment.paidAmount)} will be recorded as a simulated full refund and the outstanding balance will be cleared.`
      : 'No payment was recorded, so no refund is due and the outstanding balance will be cleared.'
    return <PrototypeDialog title="Cancel this demo appointment?" description="The record will remain visible, but every role will show it as cancelled." onClose={onClose} footer={<><button className="workspace-secondary" type="button" onClick={onClose}>Keep appointment</button><button className="workspace-danger" type="button" onClick={onCancel}>Cancel demo appointment</button></>}><div className="dialog-warning"><Ban size={21} /><p><strong>Sample cancellation outcome.</strong>{cancellationMessage} Live handling will use the policy accepted when the appointment was booked.</p></div><AppointmentSummary appointment={appointment} /></PrototypeDialog>
  }

  return <PrototypeDialog title={`${appointment.service.name} appointment`} description={`${appointment.reference} · one session-only record shared across all views`} onClose={onClose} footer={<><button className="workspace-secondary" type="button" onClick={onClose}>Close</button>{role === 'client' && manageable && <button className="workspace-secondary" type="button" onClick={onReschedule}>Reschedule</button>}{role === 'client' && manageable && <button className="workspace-danger" type="button" onClick={onCancel}>Cancel</button>}{role === 'owner' && due > 0 && !cancelled && <button className="workspace-primary" type="button" onClick={onRecordPayment}>Record payment</button>}</>}><AppointmentSummary appointment={appointment} />{role !== 'client' && <section className="dialog-section"><div className="panel-title"><div><span>Service note</span><small>Visible to permitted staff and owner only</small></div></div><p>{appointment.serviceNote || 'No service note has been added.'}</p></section>}<section className="dialog-section"><div className="panel-title"><div><span>Activity</span><small>Newest sample event first</small></div></div><ol className="activity-list">{[...appointment.events].reverse().map((event) => <li key={event.id}><span /><div><strong>{event.label}</strong><small>{event.actor} · {event.at}</small></div></li>)}</ol></section></PrototypeDialog>
}

function AppointmentSummary({ appointment }) {
  return <dl className="dialog-summary"><div><dt>Status</dt><dd><Status tone={statusTone(appointment.status)}>{statusLabel(appointment.status)}</Status></dd></div><div><dt>Client</dt><dd>{appointment.client.name}</dd></div><div><dt>Treatment</dt><dd>{appointment.service.name}</dd></div><div><dt>Date</dt><dd>{formatAppointmentDate(appointment, { weekday: 'long', day: 'numeric', month: 'long' })}</dd></div><div><dt>Treatment time</dt><dd>{formatClockTime(appointment.startTime)}–{formatClockTime(endTimeForAppointment({ startTime: appointment.startTime, duration: appointment.service.duration }))}</dd></div><div><dt>Protected calendar</dt><dd>{appointment.service.duration} min + {appointment.service.bufferAfter} min reset</dd></div><div><dt>Practitioner</dt><dd>{appointment.practitioner.name}</dd></div><div><dt>Payment</dt><dd>{paymentStatus(appointment)}</dd></div><div><dt>Venue</dt><dd>{venue}</dd></div></dl>
}

function ServiceNoteDialog({ appointment, onClose, onSave }) {
  const [note, setNote] = useState(appointment.serviceNote)
  return <PrototypeDialog title="Add service note" description="This sample note is shared with the Owner view and never shown to the Client." onClose={onClose} footer={<><button className="workspace-secondary" type="button" onClick={onClose}>Cancel</button><button className="workspace-primary" type="button" onClick={() => onSave(note.trim())} disabled={!note.trim()}>Save note</button></>}><label className="dialog-field"><span>Operational note</span><textarea rows="6" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Record pressure preference, products used or follow-up information" /></label></PrototypeDialog>
}

function BlockTimeDialog({ appointment, appointments, blocks, onClose, onSave }) {
  const [dateKey, setDateKey] = useState(appointment.dateKey)
  const [start, setStart] = useState('12:45')
  const [end, setEnd] = useState('13:15')
  const [label, setLabel] = useState('Room preparation')
  const candidateValid = Boolean(dateKey) && /^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(end) && parseClockTime(end) > parseClockTime(start)
  const conflict = candidateValid && [
    ...appointments.filter((item) => blockingStatuses.has(item.status)).map(busyEventFromAppointment),
    ...blocks,
  ].find((event) => event.dateKey === dateKey && parseClockTime(start) < parseClockTime(event.end) && parseClockTime(end) > parseClockTime(event.start))

  return <PrototypeDialog title="Block availability" description="The protected interval will immediately remove overlapping Guest start times." onClose={onClose} footer={<><button className="workspace-secondary" type="button" onClick={onClose}>Cancel</button><button className="workspace-primary" type="button" disabled={!candidateValid || Boolean(conflict) || !label.trim()} onClick={() => onSave({ dateKey, start, end, label: label.trim() })}>Add blocked time</button></>}><div className="dialog-form-grid"><label className="dialog-field full"><span>Date</span><input type="date" value={dateKey} onChange={(event) => setDateKey(event.target.value)} /></label><label className="dialog-field"><span>Start</span><input type="time" value={start} onChange={(event) => setStart(event.target.value)} /></label><label className="dialog-field"><span>End</span><input type="time" value={end} onChange={(event) => setEnd(event.target.value)} /></label><label className="dialog-field full"><span>Reason</span><input value={label} onChange={(event) => setLabel(event.target.value)} /></label></div>{conflict && <div className="dialog-warning"><Ban size={20} /><p><strong>This overlaps protected time.</strong>{conflict.label || 'Choose a time outside an appointment, break or existing block.'}</p></div>}</PrototypeDialog>
}

function RecordPaymentDialog({ appointment, onClose, onSave }) {
  const outstanding = Math.max(0, appointment.service.price - appointment.paidAmount)
  const [amount, setAmount] = useState(outstanding)
  const [method, setMethod] = useState('Cash')
  const validAmount = Number(amount) > 0 && Number(amount) <= outstanding

  return <PrototypeDialog title="Record a sample payment" description="No money is collected. This updates the shared prototype balance and Client receipt state." onClose={onClose} footer={<><button className="workspace-secondary" type="button" onClick={onClose}>Back</button><button className="workspace-primary" type="button" disabled={!validAmount} onClick={() => onSave(Number(amount), method)}>Record {formatMoney(Number(amount) || 0)}</button></>}><div className="dialog-form-grid"><label className="dialog-field"><span>Amount</span><input type="number" min="1" max={outstanding} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label className="dialog-field"><span>Method</span><select value={method} onChange={(event) => setMethod(event.target.value)}><option>Cash</option><option>Card terminal</option><option>Other</option></select></label></div><div className="info-note"><Receipt size={18} /><p><strong>{formatMoney(outstanding)} currently outstanding.</strong>Recording the full amount changes this appointment to Paid across Owner, Practitioner and Client views.</p></div></PrototypeDialog>
}
