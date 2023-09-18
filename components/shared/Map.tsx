import { useEffect, useRef } from "react";

const GoogleMap = (props: {
  longLat: number[],
  title: string
}) => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    // Initialize the map
    const googleMapScript = document.createElement("script");
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    googleMapScript.async = true;
    googleMapScript.defer = true;

    googleMapScript.onload = () => {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: props.longLat[1], lng: props.longLat[0] }, // Change the coordinates to your desired location
        zoom: 17, // Adjust the initial zoom level as needed
      });

      // Add a marker to the map
      const marker = new window.google.maps.Marker({
        position: { lat: props.longLat[1], lng: props.longLat[0] }, // Change the coordinates to the marker's location
        map: map,
        title: "", // Replace with your desired marker title
      });
    };

    document.head.appendChild(googleMapScript);

    return () => {
      // Clean up the Google Maps script when the component unmounts
      document.head.removeChild(googleMapScript);
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: "100%", height: "400px" }} // Adjust the width and height as needed
    />
  );
};

export default GoogleMap;
