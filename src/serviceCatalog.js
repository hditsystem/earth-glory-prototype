export const TREATMENT_CATEGORIES = [
  'Massage',
  'Nails',
  'Facials',
  'Brows & lashes',
  'Other',
]

function trimmed(value) {
  return String(value ?? '').trim()
}

function numericValue(value) {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function slugify(value) {
  return trimmed(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'treatment'
}

export function uniqueTreatmentId(name, services = []) {
  const base = slugify(name)
  const existingIds = new Set(services.map((service) => service.id))
  if (!existingIds.has(base)) return base

  let suffix = 2
  while (existingIds.has(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}

export function validateTreatment(values, services = [], intent = 'publish') {
  const errors = {}
  const name = trimmed(values.name)
  const category = trimmed(values.category)
  const description = trimmed(values.description)
  const duration = numericValue(values.duration)
  const bufferAfter = numericValue(values.bufferAfter)
  const price = numericValue(values.price)
  const publishing = intent === 'publish'

  if (name.length < 2 || name.length > 80) {
    errors.name = 'Enter a treatment name between 2 and 80 characters.'
  } else if (services.some((service) => service.name.trim().toLowerCase() === name.toLowerCase())) {
    errors.name = 'A treatment with this name already exists.'
  }

  if (publishing && !TREATMENT_CATEGORIES.includes(category)) {
    errors.category = 'Choose a treatment category.'
  }

  if (publishing && (description.length < 10 || description.length > 300)) {
    errors.description = 'Enter a client description between 10 and 300 characters.'
  } else if (!publishing && description && description.length > 300) {
    errors.description = 'Keep the client description to 300 characters or fewer.'
  }

  if (publishing || trimmed(values.duration)) {
    if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
      errors.duration = 'Use a whole number from 5 to 480 minutes.'
    }
  }

  if (publishing || trimmed(values.bufferAfter)) {
    if (!Number.isInteger(bufferAfter) || bufferAfter < 0 || bufferAfter > 120) {
      errors.bufferAfter = 'Use a whole number from 0 to 120 minutes.'
    }
  }

  if (publishing || trimmed(values.price)) {
    if (price === null || price < 0.01 || price > 9999.99 || Math.abs(Math.round(price * 100) - (price * 100)) > 1e-8) {
      errors.price = 'Enter a price from £0.01 to £9,999.99, with up to 2 decimals.'
    }
  }

  return errors
}

export function createTreatmentRecord(values, services = [], status = 'draft') {
  const duration = numericValue(values.duration)
  const bufferAfter = numericValue(values.bufferAfter)
  const price = numericValue(values.price)

  return {
    id: uniqueTreatmentId(values.name, services),
    name: trimmed(values.name),
    category: trimmed(values.category) || 'Uncategorised',
    description: trimmed(values.description),
    duration: Number.isInteger(duration) ? duration : 0,
    bufferAfter: Number.isInteger(bufferAfter) ? bufferAfter : 0,
    price: price ?? 0,
    status,
    practitionerIds: ['avni'],
  }
}

export function publishedTreatments(services = []) {
  return services.filter((service) => service.status === 'published')
}
