const defaultTreatwellBookingUrl = 'https://widget.treatwell.co.uk/place/earth-glory/?utm_medium=partner-site-book-now-widget&utm_source=partner'

export function resolveTreatwellBookingUrl(candidate) {
  if (!candidate) return defaultTreatwellBookingUrl

  try {
    const url = new URL(candidate)
    const isOfficialEarthGloryRoute = url.protocol === 'https:'
      && url.hostname === 'widget.treatwell.co.uk'
      && url.port === ''
      && url.username === ''
      && url.password === ''
      && url.pathname === '/place/earth-glory/'

    return isOfficialEarthGloryRoute ? url.toString() : defaultTreatwellBookingUrl
  } catch {
    return defaultTreatwellBookingUrl
  }
}

export const LIVE_BOOKING_PROVIDER = Object.freeze({
  id: 'treatwell',
  name: 'Treatwell',
  bookingUrl: resolveTreatwellBookingUrl(import.meta.env?.VITE_TREATWELL_BOOKING_URL),
  accountStatus: 'Current booking calendar',
  integrationStatus: 'Direct sync not connected',
})
