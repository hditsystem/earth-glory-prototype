import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createTreatmentRecord,
  publishedTreatments,
  uniqueTreatmentId,
  validateTreatment,
} from './serviceCatalog.js'
import { getAvailabilityForDate } from './availability.js'

const validTreatment = {
  name: '  Calming Facial  ',
  category: 'Facials',
  description: 'A calming facial tailored to the client.',
  duration: '45',
  bufferAfter: '10',
  price: '42.50',
}

test('normalises a treatment record for the shared catalogue', () => {
  const treatment = createTreatmentRecord(validTreatment, [], 'published')

  assert.deepEqual(treatment, {
    id: 'calming-facial',
    name: 'Calming Facial',
    category: 'Facials',
    description: 'A calming facial tailored to the client.',
    duration: 45,
    bufferAfter: 10,
    price: 42.5,
    status: 'published',
    practitionerIds: ['avni'],
  })
})

test('rejects duplicate names and invalid publish values', () => {
  const errors = validateTreatment({
    ...validTreatment,
    name: 'CALMING FACIAL',
    duration: '-5',
    bufferAfter: '2.5',
    price: '12.345',
  }, [{ id: 'calming-facial', name: 'Calming Facial' }], 'publish')

  assert.match(errors.name, /already exists/)
  assert.match(errors.duration, /5 to 480/)
  assert.match(errors.bufferAfter, /whole number/)
  assert.match(errors.price, /up to 2 decimals/)
})

test('a draft only requires a valid unique name', () => {
  assert.deepEqual(validateTreatment({ name: 'Future treatment' }, [], 'draft'), {})
})

test('generates a collision-safe id even when names slugify alike', () => {
  assert.equal(uniqueTreatmentId('Glow & Go', [{ id: 'glow-go' }, { id: 'glow-go-2' }]), 'glow-go-3')
})

test('keeps drafts out of the Guest and booking catalogue', () => {
  const published = { id: 'one', status: 'published' }
  const draft = { id: 'two', status: 'draft' }

  assert.deepEqual(publishedTreatments([published, draft]), [published])
})

test('a newly created treatment uses its treatment and reset time in availability', () => {
  const treatment = createTreatmentRecord({
    ...validTreatment,
    duration: '45',
    bufferAfter: '15',
  }, [], 'published')
  const dateKey = '2026-10-02'
  const hours = { 5: [{ start: '10:00', end: '19:30' }] }
  const result = getAvailabilityForDate({
    dateKey,
    service: treatment,
    operatingHours: hours,
    practitionerHours: hours,
    slotIntervalMinutes: 30,
    busyEvents: [{
      id: 'later-appointment',
      dateKey,
      type: 'appointment',
      status: 'confirmed',
      start: '17:45',
      end: '18:30',
    }],
  })

  assert.equal(result.slots.find((slot) => slot.start === '17:00').available, false)
})
