import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getAvailabilityForDate,
  intervalsOverlap,
  parseClockTime,
} from './availability.js'

const dateKey = '2026-10-02'
const hours = { 5: [{ start: '10:00', end: '19:30' }] }

function slotAt(result, start) {
  return result.slots.find((slot) => slot.start === start)
}

test('uses half-open intervals so adjacent bookings do not overlap', () => {
  assert.equal(intervalsOverlap(600, 660, 660, 720), false)
  assert.equal(intervalsOverlap(600, 661, 660, 720), true)
})

test('rejects a service that overlaps a later appointment', () => {
  const result = getAvailabilityForDate({
    dateKey,
    service: { duration: 60, bufferAfter: 10 },
    operatingHours: hours,
    practitionerHours: hours,
    slotIntervalMinutes: 30,
    busyEvents: [{
      id: 'late-booking',
      dateKey,
      type: 'appointment',
      status: 'confirmed',
      start: '17:45',
      end: '18:35',
    }],
  })

  assert.equal(slotAt(result, '17:00').available, false)
  assert.equal(slotAt(result, '17:00').reason, 'Unavailable · protected time')
})

test('allows a shorter service that finishes before a later appointment', () => {
  const result = getAvailabilityForDate({
    dateKey,
    service: { duration: 30, bufferAfter: 10 },
    operatingHours: hours,
    practitionerHours: hours,
    slotIntervalMinutes: 30,
    busyEvents: [{
      id: 'late-booking',
      dateKey,
      type: 'appointment',
      status: 'confirmed',
      start: '17:45',
      end: '18:35',
    }],
  })

  assert.equal(slotAt(result, '17:00').available, true)
})

test('rejects a late service when treatment and cleanup exceed closing', () => {
  const result = getAvailabilityForDate({
    dateKey,
    service: { duration: 60, bufferAfter: 10 },
    operatingHours: hours,
    practitionerHours: hours,
    slotIntervalMinutes: 30,
  })

  assert.equal(slotAt(result, '18:30').available, false)
  assert.match(slotAt(result, '18:30').reason, /Ends after 7:30 PM closing/)
})

test('breaks and blocked time remove overlapping slots', () => {
  const result = getAvailabilityForDate({
    dateKey,
    service: { duration: 30, bufferAfter: 0 },
    operatingHours: hours,
    practitionerHours: hours,
    slotIntervalMinutes: 30,
    busyEvents: [{
      id: 'break',
      dateKey,
      type: 'break',
      start: '15:00',
      end: '15:30',
    }],
  })

  assert.equal(slotAt(result, '14:30').available, true)
  assert.equal(slotAt(result, '15:00').available, false)
  assert.equal(slotAt(result, '15:30').available, true)
})

test('a cancelled appointment does not block and rescheduling can exclude itself', () => {
  const baseArgs = {
    dateKey,
    service: { duration: 30, bufferAfter: 0 },
    operatingHours: hours,
    practitionerHours: hours,
    slotIntervalMinutes: 30,
    busyEvents: [
      { id: 'cancelled', dateKey, type: 'appointment', status: 'cancelled_client', start: '11:00', end: '11:30' },
      { id: 'current', dateKey, type: 'appointment', status: 'confirmed', start: '12:00', end: '12:30' },
    ],
  }

  assert.equal(slotAt(getAvailabilityForDate(baseArgs), '11:00').available, true)
  assert.equal(slotAt(getAvailabilityForDate(baseArgs), '12:00').available, false)
  assert.equal(slotAt(getAvailabilityForDate({ ...baseArgs, excludeEventId: 'current' }), '12:00').available, true)
})

test('returns no slots when the practitioner is closed', () => {
  const result = getAvailabilityForDate({
    dateKey,
    service: { duration: 30 },
    operatingHours: hours,
    practitionerHours: { 5: [] },
  })

  assert.deepEqual(result.slots, [])
})

test('intersects practitioner hours with the wider business window', () => {
  const result = getAvailabilityForDate({
    dateKey,
    service: { duration: 30, bufferAfter: 0 },
    operatingHours: hours,
    practitionerHours: { 5: [{ start: '12:00', end: '17:00' }] },
    slotIntervalMinutes: 30,
  })

  assert.deepEqual(result.windows, [{ startMinutes: 720, endMinutes: 1020 }])
  assert.equal(result.slots[0].start, '12:00')
  assert.equal(result.slots.at(-1).start, '16:30')
  assert.equal(result.slots.every((slot) => slot.available), true)
})

test('owner-blocked time removes overlapping starts but permits adjacency', () => {
  const result = getAvailabilityForDate({
    dateKey,
    service: { duration: 30, bufferAfter: 0 },
    operatingHours: hours,
    practitionerHours: hours,
    slotIntervalMinutes: 30,
    busyEvents: [{
      id: 'owner-block',
      dateKey,
      type: 'blocked',
      start: '12:00',
      end: '13:00',
      label: 'Room preparation',
    }],
  })

  assert.equal(slotAt(result, '11:30').available, true)
  assert.equal(slotAt(result, '12:00').available, false)
  assert.equal(slotAt(result, '12:30').available, false)
  assert.equal(slotAt(result, '13:00').available, true)
})

test('clock parsing validates its input', () => {
  assert.equal(parseClockTime('17:45'), 1065)
  assert.throws(() => parseClockTime('25:00'))
})
