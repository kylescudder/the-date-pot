import { log } from '@logtail/next'

export const getLongLat = async (address: string) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_API_KEY_GEOCODING}`
    )

    if (!response.ok) {
      log.error('Failed to fetch data from the API')
      throw new Error()
    }

    const data = await response.json()

    const lng = data.results[0].geometry.location.lng
    const lat = data.results[0].geometry.location.lat

    return [lng, lat]
  } catch (error: any) {
    log.error(`Failed to create long/lat: ${error.message}`)
    throw new Error()
  }
}
