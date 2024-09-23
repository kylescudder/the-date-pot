import React from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

const Map = (props: { longLat: number[]; title: string }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
  })

  const [map, setMap] = React.useState<any>(null)
  const lat = props.longLat[1] || 0
  const lng = props.longLat[0] || 0
  const center = {
    lat: lat,
    lng: lng
  }
  const onLoad = React.useCallback(function callback(map: any) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center)
    map.setCenter(bounds)

    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map: any) {
    setMap(null)
  }, [])

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '400px' }}
      center={center}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      <Marker position={{ lat: lat, lng: lng }} />
    </GoogleMap>
  ) : (
    <></>
  )
}

export default Map
