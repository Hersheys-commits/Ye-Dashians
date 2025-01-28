import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';
import Header from '../components/Header';

// Move these outside the component to prevent recreating on each render
const mapContainerStyle = {
  width: '100%',
  height: '100%',
};


const darkModeStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];


// Define libraries array outside component to maintain consistent reference
const libraries = ['places'];

function MeetingPage() {
  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [selectedAddress1, setSelectedAddress1] = useState('');
  const [addressCoordinates1, setAddressCoordinates1] = useState({ lat: 0, lng: 0 });
  
  const [selectedAddress2, setSelectedAddress2] = useState('');
  const [addressCoordinates2, setAddressCoordinates2] = useState({ lat: 0, lng: 0 });
  
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [mapZoom, setMapZoom] = useState(12);
  const [venuePreference, setVenuePreference] = useState('');
  const [nearbyVenues, setNearbyVenues] = useState([]);

  const autocompleteRef1 = useRef(null);
  const autocompleteRef2 = useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
    libraries, // Use the constant libraries array
  });

  // Existing location and map center logic remains the same...
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(location);
        setMapCenter(location);
      },
      (error) => {
        console.error('Error fetching location:', error);
        const defaultLocation = { lat: 28.6139, lng: 77.209 };
        setCurrentLocation(defaultLocation);
        setMapCenter(defaultLocation);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // Adjust map center and zoom when addresses change
  useEffect(() => {
    if (addressCoordinates1.lat !== 0 && addressCoordinates1.lng !== 0 &&
        addressCoordinates2.lat !== 0 && addressCoordinates2.lng !== 0) {
      // Calculate center between two points
      const centerLat = (addressCoordinates1.lat + addressCoordinates2.lat) / 2;
      const centerLng = (addressCoordinates1.lng + addressCoordinates2.lng) / 2;
      setMapCenter({ lat: centerLat, lng: centerLng });
      
      // Calculate zoom level based on distance between points
      const distance = calculateDistance(addressCoordinates1, addressCoordinates2);
      setMapZoom(getZoomLevel(distance));
    } else if (addressCoordinates1.lat !== 0 && addressCoordinates1.lng !== 0) {
      // If only first address is set
      setMapCenter(addressCoordinates1);
      setMapZoom(12);
    } else if (addressCoordinates2.lat !== 0 && addressCoordinates2.lng !== 0) {
      // If only second address is set
      setMapCenter(addressCoordinates2);
      setMapZoom(12);
    }
  }, [addressCoordinates1, addressCoordinates2]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (coord1, coord2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(coord2.lat - coord1.lat);
    const dLon = toRadians(coord2.lng - coord1.lng);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Convert degrees to radians
  const toRadians = (degrees) => {
    return degrees * (Math.PI/180);
  };

  // Determine zoom level based on distance
  const getZoomLevel = (distance) => {
    if (distance < 1) return 14;   // Very close
    if (distance < 5) return 12;   // Close
    if (distance < 10) return 10;  // Moderate distance
    if (distance < 20) return 8;   // Farther apart
    return 6;                      // Very far apart
  };

  // Handle place selection for both locations
  const handlePlaceSelect = (autocomplete, userIndex) => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      if (userIndex === 1) {
        setSelectedAddress1(place.formatted_address);
        setAddressCoordinates1({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      } else if (userIndex === 2) {
        setSelectedAddress2(place.formatted_address);
        setAddressCoordinates2({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    } else {
      console.error("Place details not available");
    }
  };

  // Handle 'Use Current Location' button click
  const handleUseCurrentLocation = (userIndex) => {
    if (userIndex === 1) {
      setAddressCoordinates1(currentLocation);
      setSelectedAddress1('Current Location');
    } else if (userIndex === 2) {
      setAddressCoordinates2(currentLocation);
      setSelectedAddress2('Current Location');
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  // Function to find midpoint between two coordinates
  const findMidpoint = (coord1, coord2) => {
    return {
      lat: (coord1.lat + coord2.lat) / 2,
      lng: (coord1.lng + coord2.lng) / 2
    };
  };

  // Function to search for nearby venues
  const searchNearbyVenues = () => {
    if (!isLoaded || 
        addressCoordinates1.lat === 0 || 
        addressCoordinates2.lat === 0) return;

    // Find midpoint
    const midpoint = findMidpoint(addressCoordinates1, addressCoordinates2);

    // Create a Places service
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    // Search for nearby restaurants
    service.nearbySearch(
      {
        location: midpoint,
        radius: 2000, // 2 km radius
        type: [venuePreference.toLowerCase()],
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          // Limit to 15 venues
          const limitedVenues = results.slice(0, 15).map(venue => ({
            name: venue.name,
            vicinity: venue.vicinity,
            location: {
              lat: venue.geometry.location.lat(),
              lng: venue.geometry.location.lng()
            },
            rating: venue.rating || 'N/A'
          }));
          
          setNearbyVenues(limitedVenues);
          
          // Center map to include all venues
          if (limitedVenues.length > 0) {
            setMapCenter(midpoint);
            setMapZoom(12);
          }
        }
      }
    );
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="relative flex-grow">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={mapCenter}
          zoom={mapZoom}
          options={{
            styles: darkModeStyle,
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {/* Existing markers */}
          {addressCoordinates1.lat !== 0 && addressCoordinates1.lng !== 0 && (
            <Marker position={addressCoordinates1} />
          )}

          {addressCoordinates2.lat !== 0 && addressCoordinates2.lng !== 0 && (
            <Marker position={addressCoordinates2} />
          )}

          {/* Blue markers for nearby venues */}
          {nearbyVenues.map((venue, index) => (
            <Marker
              key={index}
              position={venue.location}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />
          ))}
        </GoogleMap>

        {/* Form Overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white p-5 shadow-lg rounded-lg z-10 w-[90%] max-w-6xl">
          <form className="flex items-center space-x-4">
            {/* User 1 Location Input */}
            <div className="relative flex-1">
              <Autocomplete 
                onLoad={(autocomplete) => (autocompleteRef1.current = autocomplete)} 
                onPlaceChanged={() => handlePlaceSelect(autocompleteRef1.current, 1)}
              >
                <input
                  type="text"
                  placeholder="Enter your location"
                  className="border p-2 rounded w-full pr-24"
                />
              </Autocomplete>
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                onClick={() => handleUseCurrentLocation(1)}
              >
                Current
              </button>
            </div>

            {/* User 2 Location Input */}
            <div className="relative flex-1">
              <Autocomplete
                onLoad={(autocomplete) => (autocompleteRef2.current = autocomplete)}
                onPlaceChanged={() => handlePlaceSelect(autocompleteRef2.current, 2)}
              >
                <input
                  type="text"
                  placeholder="Enter other user's location"
                  className="border p-2 rounded w-full"
                />
              </Autocomplete>
            </div>

            {/* Venue Preference Dropdown */}
            <select 
              className="border p-2 rounded flex-1"
              value={venuePreference}
              onChange={(e) => setVenuePreference(e.target.value)}
            >
              <option value="">Venue Preference</option>
              <option value="restaurant">Restaurant</option>
              <option value="bar">Bar</option>
              <option value="park">Park</option>
              <option value="cafe">Café</option>
            </select>

            {/* Submit Button */}
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={searchNearbyVenues}
              disabled={!venuePreference || 
                       addressCoordinates1.lat === 0 || 
                       addressCoordinates2.lat === 0}
            >
              Submit
            </button>
          </form>

          {/* Venues List */}
          {nearbyVenues.length > 0 && (
            <div className="mt-4 max-h-40 overflow-y-auto">
              <h3 className="font-bold mb-2">Nearby Venues:</h3>
              {nearbyVenues.map((venue, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
                  <p className="font-semibold">{venue.name}</p>
                  <p className="text-sm text-gray-600">{venue.vicinity}</p>
                  <p className="text-sm">Rating: {venue.rating}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MeetingPage;