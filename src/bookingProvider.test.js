import assert from 'node:assert/strict'
import test from 'node:test'
import { LIVE_BOOKING_PROVIDER, resolveTreatwellBookingUrl } from './bookingProvider.js'

test('uses the configured official Earth Glory Treatwell destination by default', () => {
  const bookingUrl = new URL(LIVE_BOOKING_PROVIDER.bookingUrl)

  assert.equal(LIVE_BOOKING_PROVIDER.id, 'treatwell')
  assert.equal(bookingUrl.protocol, 'https:')
  assert.equal(bookingUrl.hostname, 'widget.treatwell.co.uk')
  assert.equal(bookingUrl.pathname, '/place/earth-glory/')
})

test('accepts only the official Earth Glory Treatwell booking route as an override', () => {
  const configuredUrl = 'https://widget.treatwell.co.uk/place/earth-glory/?utm_source=earth-glory-website'

  assert.equal(resolveTreatwellBookingUrl(configuredUrl), configuredUrl)
  assert.equal(resolveTreatwellBookingUrl('http://widget.treatwell.co.uk/place/earth-glory/'), LIVE_BOOKING_PROVIDER.bookingUrl)
  assert.equal(resolveTreatwellBookingUrl('https://example.com/place/earth-glory/'), LIVE_BOOKING_PROVIDER.bookingUrl)
  assert.equal(resolveTreatwellBookingUrl('https://widget.treatwell.co.uk/place/another-studio/'), LIVE_BOOKING_PROVIDER.bookingUrl)
  assert.equal(resolveTreatwellBookingUrl('not a url'), LIVE_BOOKING_PROVIDER.bookingUrl)
})

test('does not describe the prototype as directly synchronized', () => {
  assert.equal(LIVE_BOOKING_PROVIDER.integrationStatus, 'Direct sync not connected')
})
