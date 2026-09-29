export const DEFAULT_OPERATING_HOURS = {
  0: [{ start: '10:00', end: '17:00' }],
  1: [{ start: '10:00', end: '19:30' }],
  2: [{ start: '10:00', end: '19:30' }],
  3: [{ start: '10:00', end: '19:30' }],
  4: [{ start: '10:00', end: '19:30' }],
  5: [{ start: '10:00', end: '19:30' }],
  6: [{ start: '10:00', end: '18:00' }],
}

export const DEFAULT_PRACTITIONER_HOURS = structuredClone(DEFAULT_OPERATING_HOURS)

const blockingAppointmentStatuses = new Set([
  'held',
  'pending_payment',
  'confirmed',
  'arrived',
  'in_service',
  'completed',
])

export function parseClockTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value ?? '')) throw new Error(`Invalid time: ${value}`)
  const [hour, minute] = value.split(':').map(Number)
  if (hour > 23 || minute > 59) throw new Error(`Invalid time: ${value}`)
  return (hour * 60) + minute
}

export function minutesToClock(totalMinutes) {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0 || totalMinutes >= 24 * 60) {
    throw new Error(`Invalid minutes: ${totalMinutes}`)
  }
  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function formatClockTime(value) {
  const totalMinutes = typeof value === 'number' ? value : parseClockTime(value)
  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`
}

export function weekdayForDateKey(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey ?? '')) throw new Error(`Invalid date key: ${dateKey}`)
  return new Date(`${dateKey}T12:00:00Z`).getUTCDay()
}

export function intervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB
}

function normalizeWindows(hours, dateKey) {
  const windows = hours?.[weekdayForDateKey(dateKey)] ?? []
  return windows.map((window) => {
    const startMinutes = parseClockTime(window.start)
    const endMinutes = parseClockTime(window.end)
    if (startMinutes >= endMinutes) throw new Error(`Invalid working window: ${window.start}-${window.end}`)
    return { startMinutes, endMinutes }
  })
}

function intersectWindows(leftWindows, rightWindows) {
  const intersections = []
  leftWindows.forEach((left) => {
    rightWindows.forEach((right) => {
      const startMinutes = Math.max(left.startMinutes, right.startMinutes)
      const endMinutes = Math.min(left.endMinutes, right.endMinutes)
      if (startMinutes < endMinutes) intersections.push({ startMinutes, endMinutes })
    })
  })
  return intersections.sort((a, b) => a.startMinutes - b.startMinutes)
}

function normalizeBusyEvent(event) {
  const startMinutes = parseClockTime(event.start)
  const endMinutes = parseClockTime(event.end)
  if (startMinutes >= endMinutes) throw new Error(`Invalid busy event: ${event.start}-${event.end}`)
  return { ...event, startMinutes, endMinutes }
}

function eventBlocksAvailability(event) {
  if (event.type !== 'appointment') return true
  return blockingAppointmentStatuses.has(event.status)
}

function reasonForConflict(event) {
  if (event.type === 'break') return 'Unavailable · staff break'
  if (event.type === 'blocked') return 'Unavailable · blocked time'
  return 'Unavailable · protected time'
}

export function getAvailabilityForDate({
  dateKey,
  service,
  operatingHours,
  practitionerHours,
  busyEvents = [],
  slotIntervalMinutes = 30,
  excludeEventId = null,
}) {
  const durationMinutes = Number(service?.duration ?? service?.durationMinutes)
  const bufferBeforeMinutes = Number(service?.bufferBefore ?? service?.bufferBeforeMinutes ?? 0)
  const bufferAfterMinutes = Number(service?.bufferAfter ?? service?.bufferAfterMinutes ?? 0)

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) throw new Error('Service duration must be positive')
  if (bufferBeforeMinutes < 0 || bufferAfterMinutes < 0) throw new Error('Service buffers cannot be negative')
  if (!Number.isFinite(slotIntervalMinutes) || slotIntervalMinutes <= 0) throw new Error('Slot interval must be positive')

  const businessWindows = normalizeWindows(operatingHours, dateKey)
  const staffWindows = normalizeWindows(practitionerHours, dateKey)
  const windows = intersectWindows(businessWindows, staffWindows)
  const busy = busyEvents
    .filter((event) => event.dateKey === dateKey && event.id !== excludeEventId && eventBlocksAvailability(event))
    .map(normalizeBusyEvent)
  const slotsByStart = new Map()

  windows.forEach((window) => {
    for (let startMinutes = window.startMinutes; startMinutes < window.endMinutes; startMinutes += slotIntervalMinutes) {
      const serviceEndMinutes = startMinutes + durationMinutes
      const blockedStartMinutes = startMinutes - bufferBeforeMinutes
      const blockedEndMinutes = serviceEndMinutes + bufferAfterMinutes
      let available = true
      let reason = null

      if (blockedStartMinutes < window.startMinutes || blockedEndMinutes > window.endMinutes) {
        available = false
        reason = `Ends after ${formatClockTime(window.endMinutes)} closing`
      } else {
        const conflict = busy.find((event) => intervalsOverlap(
          blockedStartMinutes,
          blockedEndMinutes,
          event.startMinutes,
          event.endMinutes,
        ))
        if (conflict) {
          available = false
          reason = reasonForConflict(conflict)
        }
      }

      slotsByStart.set(startMinutes, {
        start: minutesToClock(startMinutes),
        end: serviceEndMinutes < 24 * 60 ? minutesToClock(serviceEndMinutes) : null,
        blockedStart: blockedStartMinutes >= 0 ? minutesToClock(blockedStartMinutes) : null,
        blockedEnd: blockedEndMinutes < 24 * 60 ? minutesToClock(blockedEndMinutes) : null,
        available,
        reason,
      })
    }
  })

  return {
    windows,
    slots: [...slotsByStart.values()].sort((a, b) => parseClockTime(a.start) - parseClockTime(b.start)),
  }
}

export function endTimeForAppointment(appointment) {
  return minutesToClock(parseClockTime(appointment.startTime) + Number(appointment.duration))
}

export function blockedEndTimeForAppointment(appointment) {
  return minutesToClock(
    parseClockTime(appointment.startTime)
      + Number(appointment.duration)
      + Number(appointment.bufferAfter ?? 0),
  )
}
