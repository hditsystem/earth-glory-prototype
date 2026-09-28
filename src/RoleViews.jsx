import { useState } from 'react'
import {
  ArrowRight,
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

const prototypeRoles = [
  { id: 'guest', label: 'Guest', detail: 'Discover and book' },
  { id: 'client', label: 'Client', detail: 'Manage my visits' },
  { id: 'practitioner', label: 'Practitioner', detail: 'Deliver today’s care' },
  { id: 'owner', label: 'Owner', detail: 'Run Earth Glory' },
]

const appointment = {
  reference: 'EG-1048',
  client: 'Maya Thompson',
  service: 'Aromatherapy Massage',
  time: '11:30',
  endTime: '12:30',
  duration: '60 minutes',
  price: '£60',
  practitioner: 'Avni',
  venue: '141 North End Road, West Kensington',
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
      ['today', 'Today', LayoutDashboard],
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

export function RoleSwitcher({ activeRole, onChange }) {
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
      <span className="role-demo-note">Sample data · Nothing is saved</span>
    </section>
  )
}

export function RoleWorkspace({ role, onStartBooking }) {
  const config = roleConfig[role]
  const [activePage, setActivePage] = useState(config.nav[0][0])
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [appointmentStatus, setAppointmentStatus] = useState('Confirmed')

  const selectPage = (page) => {
    setActivePage(page)
    setMobileNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="workspace-shell">
      <aside className={mobileNavOpen ? 'workspace-sidebar open' : 'workspace-sidebar'}>
        <div className="workspace-brand">
          <span className="workspace-brand-mark">EG</span>
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
          <div className="workspace-search"><Search size={17} /><span>Search sample records</span><kbd>⌘ K</kbd></div>
          <div className="workspace-top-actions">
            <button type="button" aria-label="Sample notifications"><Bell size={19} /><span /></button>
            <span className="workspace-top-avatar">{config.initials}</span>
          </div>
        </header>

        <main className="workspace-main" id="role-workspace-main">
          <div className="prototype-boundary"><Sparkles size={15} /><span><strong>{config.eyebrow} prototype</strong> — sample data only; actions reset when you change views.</span></div>
          {role === 'client' && <ClientView activePage={activePage} onStartBooking={onStartBooking} />}
          {role === 'practitioner' && <PractitionerView activePage={activePage} status={appointmentStatus} setStatus={setAppointmentStatus} />}
          {role === 'owner' && <OwnerView activePage={activePage} />}
        </main>
      </div>
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

function ClientView({ activePage, onStartBooking }) {
  if (activePage === 'appointments') return <ClientAppointments onStartBooking={onStartBooking} />
  if (activePage === 'payments') return <ClientPayments />
  if (activePage === 'profile') return <ClientProfile />

  return (
    <>
      <PageHeading
        eyebrow="Client portal"
        title="Welcome back, Maya"
        subtitle="View and manage your Earth Glory appointments."
        actions={<button className="workspace-primary" type="button" onClick={onStartBooking}><Plus size={17} /> Book a treatment</button>}
      />
      <FlowStrip active={1} />
      <section className="client-home-grid">
        <article className="next-appointment-card">
          <div className="card-heading"><span><CalendarDays size={18} /> Next appointment</span><Status>Confirmed</Status></div>
          <div className="appointment-date-block"><strong>{demoDates.appointmentShort}</strong><span>{appointment.time}</span></div>
          <div className="appointment-main-copy">
            <span className="appointment-monogram">A</span>
            <div><h2>{appointment.service}</h2><p>{appointment.duration} with {appointment.practitioner}</p><small><MapPin size={13} /> West Kensington · {appointment.reference}</small></div>
          </div>
          <div className="appointment-actions">
            <button className="workspace-primary" type="button">View appointment</button>
            <button className="workspace-secondary" type="button">Reschedule</button>
            <button className="workspace-text-danger" type="button">Cancel</button>
          </div>
        </article>

        <article className="panel quick-actions-panel">
          <div className="panel-title"><div><span>Quick actions</span><small>Everything for your next visit</small></div></div>
          <button type="button" onClick={onStartBooking}><span className="action-icon"><CalendarPlus size={18} /></span><span><strong>Book another treatment</strong><small>Use your saved contact details</small></span><ChevronRight size={17} /></button>
          <button type="button"><span className="action-icon"><CalendarDays size={18} /></span><span><strong>Add to calendar</strong><small>Download a calendar reminder</small></span><ChevronRight size={17} /></button>
          <button type="button"><span className="action-icon"><MapPin size={18} /></span><span><strong>Get directions</strong><small>141 North End Road</small></span><ChevronRight size={17} /></button>
        </article>
      </section>

      <section className="lower-grid">
        <article className="panel journey-panel">
          <div className="panel-title"><div><span>Your appointment journey</span><small>What happens next</small></div><button type="button">View details</button></div>
          <div className="journey-list">
            <div className="done"><span><Check size={13} /></span><p><strong>Booking confirmed</strong><small>Confirmation sent to maya@example.com</small></p></div>
            <div className="current"><span><Bell size={13} /></span><p><strong>Reminder before your visit</strong><small>Preparation and arrival details</small></p></div>
            <div><span><Heart size={13} /></span><p><strong>Visit Earth Glory</strong><small>{demoDates.appointment} at {appointment.time}</small></p></div>
            <div><span><MessageSquareText size={13} /></span><p><strong>Review or book again</strong><small>Available after your completed visit</small></p></div>
          </div>
        </article>
        <article className="panel balance-panel">
          <div className="panel-title"><div><span>Payment summary</span><small>For {appointment.reference}</small></div><Receipt size={19} /></div>
          <div className="balance-row"><span>Treatment price</span><strong>{appointment.price}</strong></div>
          <div className="balance-row"><span>Paid online</span><strong>£0</strong></div>
          <div className="balance-total"><span>Due at venue</span><strong>{appointment.price}</strong></div>
          <p>Payment terms remain subject to Earth Glory’s final approval.</p>
        </article>
      </section>
    </>
  )
}

function ClientAppointments({ onStartBooking }) {
  return (
    <>
      <PageHeading eyebrow="Client portal" title="Your appointments" subtitle="Manage upcoming visits and revisit past treatments." actions={<button className="workspace-primary" type="button" onClick={onStartBooking}><Plus size={17} /> Book again</button>} />
      <div className="segmented-tabs"><button className="active" type="button">Upcoming <span>1</span></button><button type="button">Past <span>2</span></button><button type="button">Cancelled</button></div>
      <article className="panel appointment-detail-card">
        <div className="appointment-detail-date"><span>OCT</span><strong>{demoDates.appointmentShort.match(/\d+/)?.[0]}</strong><small>{appointment.time}</small></div>
        <div className="appointment-detail-copy"><Status>Confirmed</Status><h2>{appointment.service}</h2><p>{appointment.duration} with {appointment.practitioner}</p><small><MapPin size={14} /> {appointment.venue}</small></div>
        <div className="appointment-detail-price"><small>Due at venue</small><strong>{appointment.price}</strong><span>{appointment.reference}</span></div>
        <div className="appointment-detail-buttons"><button className="workspace-primary" type="button">View appointment</button><button className="workspace-secondary" type="button">Reschedule</button><button className="workspace-secondary" type="button">Cancel</button></div>
      </article>
      <div className="info-note"><ShieldCheck size={18} /><p><strong>Manage securely without an app.</strong> Client access uses a secure email link. Cancellation and rescheduling options follow the policy accepted at booking.</p></div>
    </>
  )
}

function ClientPayments() {
  return (
    <>
      <PageHeading eyebrow="Client portal" title="Payments & receipts" subtitle="See charges and documents linked to your own appointments." />
      <section className="stats-grid three">
        <StatCard label="Paid to date" value="£75" detail="Across 2 completed visits" Icon={CheckCircle2} />
        <StatCard label="Upcoming balance" value="£60" detail="Due at the venue" Icon={PoundSterling} tone="sand" />
        <StatCard label="Refunds" value="£0" detail="No refunds recorded" Icon={CreditCard} />
      </section>
      <article className="panel record-table-panel">
        <div className="panel-title"><div><span>Receipt history</span><small>Documents appear after payment is recorded</small></div></div>
        <div className="record-table"><div className="record-head"><span>Date</span><span>Treatment</span><span>Status</span><span>Amount</span><span /></div><div className="record-row"><span>12 Aug</span><span>High Frequency Facial</span><Status>Paid</Status><strong>£75</strong><button type="button" aria-label="View receipt"><FileText size={17} /></button></div></div>
      </article>
    </>
  )
}

function ClientProfile() {
  return (
    <>
      <PageHeading eyebrow="Client portal" title="Your details" subtitle="Keep your contact information and communication choices current." actions={<button className="workspace-primary" type="button">Save changes</button>} />
      <section className="form-layout">
        <article className="panel form-panel"><div className="panel-title"><div><span>Contact details</span><small>Used for appointment messages</small></div></div><div className="mock-form"><label><span>Full name</span><input defaultValue="Maya Thompson" /></label><label><span>Email</span><input defaultValue="maya@example.com" /></label><label><span>Mobile</span><input defaultValue="07700 900123" /></label></div></article>
        <article className="panel preferences-panel"><div className="panel-title"><div><span>Communication</span><small>Transactional and marketing choices stay separate</small></div></div><label><span><strong>Appointment email</strong><small>Confirmations, changes and receipts</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>SMS reminders</strong><small>A short reminder before the visit</small></span><input type="checkbox" defaultChecked /></label><label><span><strong>Offers and updates</strong><small>Optional marketing from Earth Glory</small></span><input type="checkbox" /></label></article>
      </section>
    </>
  )
}

function PractitionerView({ activePage, status, setStatus }) {
  if (activePage === 'calendar') return <PractitionerCalendar />
  if (activePage === 'clients') return <PractitionerClients />
  if (activePage === 'time-off') return <PractitionerTimeOff />

  const nextStatus = { Confirmed: 'Arrived', Arrived: 'In service', 'In service': 'Completed' }[status]
  const actionLabel = { Confirmed: 'Mark arrived', Arrived: 'Start treatment', 'In service': 'Complete appointment', Completed: 'Rebook client' }[status]
  const statusTone = status === 'Completed' ? 'green' : status === 'In service' ? 'rose' : 'sand'

  return (
    <>
      <PageHeading eyebrow={demoDates.today} title="Good morning, Avni" subtitle="Your own schedule, clients and service tasks—without owner-only settings." actions={<button className="workspace-primary" type="button"><Plus size={17} /> Add walk-in</button>} />
      <FlowStrip active={2} />
      <section className="stats-grid four">
        <StatCard label="Appointments today" value="5" detail="4 confirmed · 1 completed" Icon={CalendarDays} />
        <StatCard label="Next appointment" value="11:30" detail="Maya · Aromatherapy" Icon={Clock3} tone="sand" />
        <StatCard label="Completed" value="1" detail="4 remaining today" Icon={CheckCircle2} />
        <StatCard label="Working time" value="5h 10m" detail="Including 40m buffer" Icon={Timer} />
      </section>
      <section className="practitioner-grid-layout">
        <article className="panel schedule-panel">
          <div className="panel-title"><div><span>Today’s schedule</span><small>London time</small></div><button type="button">Open calendar</button></div>
          <div className="schedule-list">
            <div className="schedule-item muted"><time>09:30</time><span className="schedule-line" /><div><Status>Completed</Status><strong>Eyebrow Threading</strong><small>Sophie L. · 10 minutes</small></div><strong>£8</strong></div>
            <div className="schedule-item active"><time>{appointment.time}</time><span className="schedule-line" /><div><Status tone={statusTone}>{status}</Status><strong>{appointment.service}</strong><small>{appointment.client} · {appointment.duration}</small></div><strong>{appointment.price}</strong></div>
            <div className="schedule-item"><time>13:45</time><span className="schedule-line" /><div><Status tone="plain">Confirmed</Status><strong>Shellac Manicure</strong><small>Noah P. · 50 minutes</small></div><strong>£30</strong></div>
            <div className="schedule-item blocked"><time>15:00</time><span className="schedule-line" /><div><strong>Break</strong><small>30 minutes · unavailable</small></div></div>
          </div>
        </article>
        <article className="panel client-brief-panel">
          <div className="panel-title"><div><span>Next client</span><small>{appointment.reference}</small></div><Status tone={statusTone}>{status}</Status></div>
          <div className="client-brief-person"><span>MT</span><div><strong>{appointment.client}</strong><small>3rd visit · Last visit 8 weeks ago</small></div></div>
          <dl><div><dt>Treatment</dt><dd>{appointment.service}</dd></div><div><dt>Time</dt><dd>{appointment.time}–{appointment.endTime}</dd></div><div><dt>Intake</dt><dd><CheckCircle2 size={14} /> Complete</dd></div><div><dt>Balance</dt><dd>{appointment.price} at venue</dd></div></dl>
          <div className="prep-note"><NotebookPen size={18} /><p><strong>Operational note</strong>Client prefers light-to-medium pressure. Confirm on arrival.</p></div>
          <button className="workspace-primary full" type="button" onClick={() => nextStatus ? setStatus(nextStatus) : undefined}>{actionLabel}<ArrowRight size={16} /></button>
          <div className="secondary-action-row"><button type="button">Add service note</button><button type="button">More actions</button></div>
        </article>
      </section>
    </>
  )
}

function PractitionerCalendar() {
  return (
    <><PageHeading eyebrow="Practitioner workspace" title="My calendar" subtitle="Only your assigned appointments, shifts, breaks and time off." actions={<button className="workspace-primary" type="button"><Plus size={17} /> Add walk-in</button>} /><WeekCalendar personal /></>
  )
}

function PractitionerClients() {
  return (
    <><PageHeading eyebrow="Practitioner workspace" title="My clients" subtitle="Clients connected to your permitted appointments." /><article className="panel record-table-panel"><div className="panel-title"><div><span>Recent clients</span><small>Private treatment notes remain permission-controlled</small></div><button type="button"><Search size={16} /> Search</button></div><div className="people-list"><PersonRow initials="MT" name="Maya Thompson" detail="3 visits · Aromatherapy Massage" meta="Next: 11:30" /><PersonRow initials="SL" name="Sophie Lewis" detail="5 visits · Eyebrow Threading" meta="Visited today" /><PersonRow initials="NP" name="Noah Patel" detail="2 visits · Shellac Manicure" meta="Next: 13:45" /></div></article></>
  )
}

function PractitionerTimeOff() {
  return (
    <><PageHeading eyebrow="Practitioner workspace" title="Time off" subtitle="See availability changes and request time away." actions={<button className="workspace-primary" type="button"><Plus size={17} /> Request time off</button>} /><section className="stats-grid three"><StatCard label="Regular schedule" value="5 days" detail="Monday to Friday" Icon={CalendarDays} /><StatCard label="Next approved time off" value={demoDates.later} detail="Full day" Icon={CheckCircle2} tone="sand" /><StatCard label="Pending requests" value="0" detail="Nothing awaiting review" Icon={Clock3} /></section><div className="info-note"><ShieldCheck size={18} /><p><strong>Schedule protection.</strong> Approved time off removes availability before clients can choose those slots.</p></div></>
  )
}

function OwnerView({ activePage }) {
  if (activePage === 'calendar') return <OwnerCalendar />
  if (activePage === 'appointments') return <OwnerAppointments />
  if (activePage === 'clients') return <OwnerClients />
  if (activePage === 'treatments') return <OwnerTreatments />
  if (activePage === 'team') return <OwnerTeam />
  if (activePage === 'payments') return <OwnerPayments />
  if (activePage === 'reports') return <OwnerReports />
  if (activePage === 'settings') return <OwnerSettings />

  return (
    <>
      <PageHeading eyebrow={demoDates.today} title="Earth Glory overview" subtitle="Today’s appointments, payments and business activity." actions={<><button className="workspace-secondary" type="button">Block time</button><button className="workspace-primary" type="button"><Plus size={17} /> Create appointment</button></>} />
      <FlowStrip active={3} />
      <section className="stats-grid four">
        <StatCard label="Appointments today" value="5" detail="4 confirmed · 1 completed" Icon={CalendarDays} />
        <StatCard label="Booked revenue" value="£248" detail="Today’s appointment value" Icon={TrendingUp} tone="sand" />
        <StatCard label="Collected" value="£83" detail="Recorded payments today" Icon={CheckCircle2} />
        <StatCard label="Outstanding" value="£165" detail="Expected at the venue" Icon={PoundSterling} />
      </section>
      <section className="owner-overview-grid">
        <article className="panel owner-day-panel">
          <div className="panel-title"><div><span>Today at a glance</span><small>All Earth Glory appointments</small></div><button type="button">View calendar</button></div>
          <div className="owner-timeline"><OwnerTimeline time="09:30" initials="SL" name="Sophie Lewis" service="Eyebrow Threading" status="Completed" price="£8" /><OwnerTimeline time="11:30" initials="MT" name={appointment.client} service={appointment.service} status="Confirmed" price={appointment.price} active /><OwnerTimeline time="13:45" initials="NP" name="Noah Patel" service="Shellac Manicure" status="Confirmed" price="£30" /></div>
        </article>
        <article className="panel attention-panel">
          <div className="panel-title"><div><span>Needs attention</span><small>2 tasks for the owner</small></div></div>
          <button type="button"><span className="attention-icon rose"><CreditCard size={18} /></span><span><strong>Payment terms need approval</strong><small>Choose deposit, prepay or pay at venue</small></span><ChevronRight size={17} /></button>
          <button type="button"><span className="attention-icon sand"><FileText size={18} /></span><span><strong>Cancellation policy is a draft</strong><small>Review before accepting live bookings</small></span><ChevronRight size={17} /></button>
          <button type="button"><span className="attention-icon green"><CheckCircle2 size={18} /></span><span><strong>Service catalogue</strong><small>6 sample treatments ready for review</small></span><ChevronRight size={17} /></button>
        </article>
      </section>
      <section className="lower-grid">
        <article className="panel mini-chart-panel"><div className="panel-title"><div><span>Appointments this week</span><small>Sample business trend</small></div><strong>21 total</strong></div><div className="bar-chart" aria-label="Sample appointments by day">{[['Mon', 55], ['Tue', 76], ['Wed', 45], ['Thu', 88], ['Fri', 70], ['Sat', 95], ['Sun', 38]].map(([day, height]) => <div key={day}><span style={{ height: `${height}%` }} /><small>{day}</small></div>)}</div></article>
        <article className="panel access-panel"><div className="panel-title"><div><span>Roles at Earth Glory</span><small>Avni currently holds two roles</small></div></div><div><span className="workspace-avatar">A</span><p><strong>Avni</strong><small>Owner · Practitioner</small></p><Status>Active</Status></div><p>Role views stay separate so future practitioners cannot access business-wide settings or reports.</p></article>
      </section>
    </>
  )
}

function WeekCalendar({ personal = false }) {
  return (
    <article className="panel week-calendar">
      <div className="panel-title"><div><span>This week</span><small>{personal ? 'Avni’s schedule' : 'All practitioners'}</small></div><div className="calendar-controls"><button type="button">Today</button><button type="button">‹</button><button type="button">›</button></div></div>
      <div className="calendar-grid"><div className="calendar-times"><span>09:00</span><span>11:00</span><span>13:00</span><span>15:00</span><span>17:00</span></div>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => <div className="calendar-day" key={day}><strong>{day}<small>{index + 5}</small></strong>{index === 1 && <span className="calendar-event first">09:30<small>Eyebrow Threading</small></span>}{index === 2 && <span className="calendar-event current">11:30<small>Aromatherapy · Maya</small></span>}{index === 3 && <span className="calendar-event second">13:45<small>Shellac Manicure</small></span>}</div>)}</div>
    </article>
  )
}

function OwnerCalendar() {
  return <><PageHeading eyebrow="Owner workspace" title="Calendar" subtitle="See all appointments, availability and blocked time." actions={<button className="workspace-primary" type="button"><Plus size={17} /> Create appointment</button>} /><WeekCalendar /></>
}

function OwnerAppointments() {
  return <><PageHeading eyebrow="Owner workspace" title="Appointments" subtitle="Manage bookings, walk-ins, changes and appointment status." actions={<button className="workspace-primary" type="button"><Plus size={17} /> New appointment</button>} /><article className="panel record-table-panel"><div className="panel-title"><div><span>Today’s bookings</span><small>5 appointments · £248 booked</small></div><button type="button"><Search size={16} /> Search</button></div><div className="record-table five"><div className="record-head"><span>Time</span><span>Client</span><span>Treatment</span><span>Status</span><span>Value</span></div><AppointmentRow time="09:30" client="Sophie Lewis" service="Eyebrow Threading" status="Completed" price="£8" /><AppointmentRow time={appointment.time} client={appointment.client} service={appointment.service} status="Confirmed" price={appointment.price} /><AppointmentRow time="13:45" client="Noah Patel" service="Shellac Manicure" status="Confirmed" price="£30" /></div></article></>
}

function OwnerClients() {
  return <><PageHeading eyebrow="Owner workspace" title="Clients" subtitle="Business-wide client history, consent and follow-up." actions={<button className="workspace-primary" type="button"><Plus size={17} /> Add client</button>} /><section className="stats-grid three"><StatCard label="Total clients" value="128" detail="Sample client records" Icon={UsersRound} /><StatCard label="Returning clients" value="68%" detail="Booked more than once" Icon={Heart} tone="sand" /><StatCard label="Due to rebook" value="12" detail="Based on service interval" Icon={Bell} /></section><article className="panel"><div className="people-list"><PersonRow initials="MT" name="Maya Thompson" detail="3 visits · £135 lifetime value" meta="Next: 11:30" /><PersonRow initials="SL" name="Sophie Lewis" detail="5 visits · £82 lifetime value" meta="Visited today" /><PersonRow initials="NP" name="Noah Patel" detail="2 visits · £60 lifetime value" meta="Next: 13:45" /></div></article></>
}

function OwnerTreatments() {
  return <><PageHeading eyebrow="Owner workspace" title="Treatments" subtitle="Control what clients can book, including price, duration and availability." actions={<button className="workspace-primary" type="button"><Plus size={17} /> Add treatment</button>} /><article className="panel service-admin-grid"><ServiceAdmin name="Aromatherapy Massage" category="Massage" duration="60 min" price="£60" status="Published" /><ServiceAdmin name="High Frequency Facial" category="Facials" duration="60 min" price="£75" status="Published" /><ServiceAdmin name="Shellac Manicure" category="Nails" duration="50 min" price="£30" status="Published" /><ServiceAdmin name="Eyelash Tint" category="Brows & lashes" duration="15 min" price="£15" status="Draft review" /></article></>
}

function OwnerTeam() {
  return <><PageHeading eyebrow="Owner workspace" title="Team" subtitle="Manage roles, services, working hours and time off." actions={<button className="workspace-primary" type="button"><Plus size={17} /> Add team member</button>} /><article className="panel team-card"><div className="team-avatar">A</div><div><h2>Avni</h2><p>Owner · Practitioner</p><span>Massage · Nails · Facials · Brows & lashes</span></div><Status>Active</Status><button className="workspace-secondary" type="button">Manage</button></article><div className="info-note"><ShieldCheck size={18} /><p><strong>Role separation is ready for growth.</strong> A future practitioner can manage their own day without seeing reports, refunds, policies or owner settings.</p></div></>
}

function OwnerPayments() {
  return <><PageHeading eyebrow="Owner workspace" title="Payments" subtitle="Track appointment value, collected money, balances and refunds." actions={<button className="workspace-secondary" type="button">Export</button>} /><section className="stats-grid three"><StatCard label="Collected today" value="£83" detail="2 recorded payments" Icon={CheckCircle2} /><StatCard label="Outstanding today" value="£165" detail="Due at the venue" Icon={PoundSterling} tone="sand" /><StatCard label="Refunds this month" value="£0" detail="No refunds recorded" Icon={CreditCard} /></section><article className="panel record-table-panel"><div className="panel-title"><div><span>Payment activity</span><small>Sample financial records</small></div></div><div className="record-table"><div className="record-head"><span>Reference</span><span>Client</span><span>Status</span><span>Amount</span><span /></div><div className="record-row"><span>EG-1047</span><span>Sophie Lewis</span><Status>Paid</Status><strong>£8</strong><button type="button"><Receipt size={17} /></button></div><div className="record-row"><span>{appointment.reference}</span><span>{appointment.client}</span><Status tone="sand">Due at venue</Status><strong>{appointment.price}</strong><button type="button"><ChevronRight size={17} /></button></div></div></article></>
}

function OwnerReports() {
  return <><PageHeading eyebrow="Owner workspace" title="Reports" subtitle="Understand booking activity without exposing this data to practitioners." actions={<button className="workspace-secondary" type="button">Export report</button>} /><section className="stats-grid four"><StatCard label="Booked revenue" value="£3,480" detail="Sample current month" Icon={TrendingUp} /><StatCard label="Appointments" value="72" detail="64 completed" Icon={CalendarDays} /><StatCard label="Fill rate" value="74%" detail="Of available time" Icon={BarChart3} tone="sand" /><StatCard label="No-show rate" value="1.4%" detail="1 appointment" Icon={UserRound} /></section><article className="panel mini-chart-panel wide"><div className="panel-title"><div><span>Monthly activity</span><small>Illustrative data for feedback only</small></div><strong>+12%</strong></div><div className="bar-chart tall">{[['W1', 48], ['W2', 65], ['W3', 72], ['W4', 88]].map(([day, height]) => <div key={day}><span style={{ height: `${height}%` }} /><small>{day}</small></div>)}</div></article></>
}

function OwnerSettings() {
  return <><PageHeading eyebrow="Owner workspace" title="Settings" subtitle="Configure Earth Glory’s booking rules and public information." actions={<button className="workspace-primary" type="button">Save settings</button>} /><section className="settings-grid"><article className="panel setting-card"><span><MapPin size={19} /></span><div><strong>Business & location</strong><small>Address, contact, access and opening hours</small></div><Status tone="sand">Review</Status></article><article className="panel setting-card"><span><CalendarDays size={19} /></span><div><strong>Booking rules</strong><small>Notice, booking horizon, buffers and slot interval</small></div><Status>Configured</Status></article><article className="panel setting-card"><span><FileText size={19} /></span><div><strong>Policies</strong><small>Cancellation, rescheduling and no-show terms</small></div><Status tone="rose">Draft</Status></article><article className="panel setting-card"><span><CreditCard size={19} /></span><div><strong>Payment rules</strong><small>Deposit, prepayment or pay at venue</small></div><Status tone="rose">Not approved</Status></article></section></>
}

function OwnerTimeline({ time, initials, name, service, status, price, active }) {
  return <div className={active ? 'owner-timeline-row active' : 'owner-timeline-row'}><time>{time}</time><span className="person-avatar">{initials}</span><div><strong>{name}</strong><small>{service} · Avni</small></div><Status tone={status === 'Completed' ? 'green' : 'plain'}>{status}</Status><b>{price}</b><button type="button" aria-label={`Open ${name}'s appointment`}><ChevronRight size={17} /></button></div>
}

function PersonRow({ initials, name, detail, meta }) {
  return <button className="person-row" type="button"><span className="person-avatar">{initials}</span><span><strong>{name}</strong><small>{detail}</small></span><em>{meta}</em><ChevronRight size={17} /></button>
}

function AppointmentRow({ time, client, service, status, price }) {
  return <div className="record-row"><strong>{time}</strong><span>{client}</span><span>{service}</span><Status tone={status === 'Completed' ? 'green' : 'plain'}>{status}</Status><strong>{price}</strong></div>
}

function ServiceAdmin({ name, category, duration, price, status }) {
  return <div className="service-admin-row"><span className="service-admin-icon"><Scissors size={18} /></span><div><strong>{name}</strong><small>{category}</small></div><span>{duration}</span><strong>{price}</strong><Status tone={status === 'Published' ? 'green' : 'sand'}>{status}</Status><button type="button"><MoreHorizontal size={18} /></button></div>
}
