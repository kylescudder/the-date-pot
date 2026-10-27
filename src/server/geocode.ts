// Returns [lng, lat], or [] when the address can't be placed. Without a key the
// map is simply not shown.
export function createGeocoder(apiKey: string | undefined) {
  return async (address: string): Promise<number[]> => {
    if (!apiKey) return []
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.set('address', address)
    url.searchParams.set('key', apiKey)
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
      if (!response.ok) return []
      const data = (await response.json()) as {
        results?: { geometry: { location: { lat: number; lng: number } } }[]
      }
      const location = data.results?.[0]?.geometry.location
      return location ? [location.lng, location.lat] : []
    } catch {
      return []
    }
  }
}
