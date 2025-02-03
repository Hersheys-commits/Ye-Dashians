import React, { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl";
import Header from "../components/Header";
import axios from "axios";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_STYLE = "mapbox://styles/mapbox/dark-v11";



function MeetingPage() {
        const [places, setPlaces] = useState([]);

      
        useEffect(() => {
          const fetchPlaces = async () => {
            try {
            //   const res = await axios.get(
            //     "https://api.foursquare.com/v3/places/search?query=restaurant&ll=25.454181,81.834783&radius=1000",
            //     {
            //       headers: {
            //         Authorization: `${import.meta.env.VITE_FOURSQUARE_API_KEY}`,
            //         Accept: "application/json",
            //       },
            //     }
            //   );
            //   console.log(res.data); // Log response data
            //   setPlaces(res.data.results); // Store places in state


            //   const res2=await axios.get("https://api.foursquare.com/v3/places/4de65b57e4cde71744bda9ff",
            //     {
            //         headers: {
            //           Authorization: `${import.meta.env.VITE_FOURSQUARE_API_KEY}`,
            //           Accept: "application/json",
            //         },
            //     }
            //   );
            //   console.log(res2.data);

            //   const res3=await axios.get("https://api.foursquare.com/v3/places/4de65b57e4cde71744bda9ff/photos",
            //     {
            //         headers: {
            //           Authorization: `${import.meta.env.VITE_FOURSQUARE_API_KEY}`,
            //           Accept: "application/json",
            //         },
            //     }
            //   );
            //   console.log(res3.data)

            //   const res4=await axios.get("https://api.foursquare.com/v3/places/4de65b57e4cde71744bda9ff/tips",
            //     {
            //         headers: {
            //           Authorization: `${import.meta.env.VITE_FOURSQUARE_API_KEY}`,
            //           Accept: "application/json",
            //         },
            //     }
            //   );
            //   console.log(res4.data);
            } catch (error) {
              console.error("Error fetching places:", error);
            }
          };
      
          fetchPlaces();
        }, []);

  const [currentLocation, setCurrentLocation] = useState({ lat: 0, lng: 0 });
  const [selectedAddress1, setSelectedAddress1] = useState("");
  const [addressCoordinates1, setAddressCoordinates1] = useState({
    lat: 0,
    lng: 0,
  });

  const [selectedAddress2, setSelectedAddress2] = useState("");
  const [addressCoordinates2, setAddressCoordinates2] = useState({
    lat: 0,
    lng: 0,
  });

  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 12,
  });

  const [venuePreference, setVenuePreference] = useState("");
  const [nearbyVenues, setNearbyVenues] = useState([]);
  const [searchText1, setSearchText1] = useState("");
  const [searchText2, setSearchText2] = useState("");
  const [searchSuggestions1, setSearchSuggestions1] = useState([]);
  const [searchSuggestions2, setSearchSuggestions2] = useState([]);
  const [isOverlayMinimized, setIsOverlayMinimized] = useState(false);

  const toggleOverlay = () => {
    setIsOverlayMinimized((prev) => !prev);
  };

  // New state to track form submission
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Get current location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(location);
        setViewport({
          latitude: location.lat,
          longitude: location.lng,
          zoom: 12,
        });
      },
      (error) => {
        console.error("Error fetching location:", error);
        const defaultLocation = { lat: 28.6139, lng: 77.209 };
        setCurrentLocation(defaultLocation);
        setViewport({
          latitude: defaultLocation.lat,
          longitude: defaultLocation.lng,
          zoom: 12,
        });
      }
    );
  }, []);

  // Adjust viewport when both addresses are set
  useEffect(() => {
    if (
      addressCoordinates1.lat !== 0 &&
      addressCoordinates1.lng !== 0 &&
      addressCoordinates2.lat !== 0 &&
      addressCoordinates2.lng !== 0
    ) {
      const centerLat =
        (addressCoordinates1.lat + addressCoordinates2.lat) / 2;
      const centerLng =
        (addressCoordinates1.lng + addressCoordinates2.lng) / 2;
      const distance = calculateDistance(addressCoordinates1, addressCoordinates2);
      const zoom = getZoomLevel(distance);

      setViewport({
        latitude: centerLat,
        longitude: centerLng,
        zoom,
      });
    }
  }, [addressCoordinates1, addressCoordinates2]);

  // Search locations using Mapbox Geocoding API
  const searchLocations = async (searchText, setSearchSuggestions) => {
    if (!searchText) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchText
        )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
      );
      const data = await response.json();
      setSearchSuggestions(data.features);
    } catch (error) {
      console.error("Error searching locations:", error);
    }
  };

  // Search nearby venues using Foursquare API
  const searchNearbyVenues = async () => {
    if (
      addressCoordinates1.lat === 0 ||
      addressCoordinates2.lat === 0 ||
      !venuePreference
    )
      return;

    const midpoint = findMidpoint(addressCoordinates1, addressCoordinates2);

    try {
      const response = await fetch(
        `https://api.foursquare.com/v3/places/search?ll=${midpoint.lat},${midpoint.lng}&radius=2000&categories=${getVenueCategory()}&limit=15`,
        {
          headers: {
            Authorization: import.meta.env.VITE_FOURSQUARE_API_KEY,
          },
        }
      );
      const data = await response.json();

      const venuesWithDetails = await Promise.all(
        data.results.map(async (venue) => {
          const detailsResponse = await fetch(
            `https://api.foursquare.com/v3/places/${venue.fsq_id}`,
            {
              headers: {
                Authorization: import.meta.env.VITE_FOURSQUARE_API_KEY,
              },
            }
          );
          const details = await detailsResponse.json();
          return {
            name: venue.name,
            address: venue.location.formatted_address,
            location: {
              lat: venue.geocodes.main.latitude,
              lng: venue.geocodes.main.longitude,
            },
            rating: details.rating || "N/A",
          };
        })
      );

      setNearbyVenues(venuesWithDetails);
      // After successful search, mark the form as submitted.
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  };

  // Helper function to get Foursquare category ID
  const getVenueCategory = () => {
    const categories = {
      restaurant: "13065",
      bar: "13003",
      park: "16032",
      cafe: "13035",
    };
    return categories[venuePreference.toLowerCase()];
  };

  // Calculate distance (Haversine formula)
  const calculateDistance = (coord1, coord2) => {
    const R = 6371;
    const dLat = toRadians(coord2.lat - coord1.lat);
    const dLon = toRadians(coord2.lng - coord1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(coord1.lat)) *
        Math.cos(toRadians(coord2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const getZoomLevel = (distance) => {
    if (distance < 1) return 14;
    if (distance < 5) return 12;
    if (distance < 10) return 10;
    if (distance < 20) return 8;
    return 6;
  };

  const findMidpoint = (coord1, coord2) => ({
    lat: (coord1.lat + coord2.lat) / 2,
    lng: (coord1.lng + coord2.lng) / 2,
  });

  // Handler to reset the form overlay back to its initial state.
  const handleResetForm = () => {
    setFormSubmitted(false);
    // Optionally, clear venues and/or other fields here if desired:
    // setNearbyVenues([]);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="relative flex-grow">
        <Map
          {...viewport}
          mapStyle={MAPBOX_STYLE}
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
          onMove={(evt) => setViewport(evt.viewport)}
          style={{ width: "100%", height: "100%" }}
        >
          {/* Location markers */}
          <Marker 
            latitude={25.450829}
            longitude={81.833702}
            color="#FF0000"
            />
          {addressCoordinates1.lat !== 0 && (
            <Marker
              latitude={addressCoordinates1.lat}
              longitude={addressCoordinates1.lng}
              color="#FF0000"
            />
          )}
          {addressCoordinates2.lat !== 0 && (
            <Marker
              latitude={addressCoordinates2.lat}
              longitude={addressCoordinates2.lng}
              color="#FF0000"
            />
          )}
          {/* Venue markers */}
          {nearbyVenues.map((venue, index) => (
            <Marker
              key={index}
              latitude={venue.location.lat}
              longitude={venue.location.lng}
              color="#0000FF"
            />
          ))}
        </Map>

        {/* Form Overlay */}
        <div
            className={`absolute top-4 left-4 bg-gray-900 text-white p-5 shadow-lg rounded-lg z-10 w-[90%] max-w-lg transition-transform duration-300 ${
            isOverlayMinimized ? "translate-x-[-320px]" : "translate-x-0"
            }`}
        >
            <button
            className="absolute -right-10 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-full shadow-md hover:bg-gray-700 transition duration-300"
            onClick={toggleOverlay}
            >
            {isOverlayMinimized ? "➜" : "⏴"}
            </button>

            <h2 className="text-lg font-semibold mb-3">Find a Meeting Place</h2>
            <form
            className="space-y-3"
            onSubmit={(e) => {
                e.preventDefault();
                // your searchNearbyVenues() logic here
            }}
            >
            {/* Location 1 Input */}
            <div className="relative">
                <input
                type="text"
                // value, onChange, etc.
                placeholder="Enter your location"
                className="border p-2 rounded w-full bg-gray-800 text-white placeholder-gray-400"
                />
                <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-xs"
                onClick={() => {
                    // your current location logic here
                }}
                >
                Use Current
                </button>
            </div>

            {/* Location 2 Input */}
            <div className="relative">
                <input
                type="text"
                // value, onChange, etc.
                placeholder="Enter other user's location"
                className="border p-2 rounded w-full bg-gray-800 text-white placeholder-gray-400"
                />
            </div>

            {/* Venue Preference Dropdown */}
            <select
                className="border p-2 rounded w-full bg-gray-800 text-white"
                // value, onChange, etc.
            >
                <option value="">Select Venue Type</option>
                <option value="restaurant">Restaurant</option>
                <option value="bar">Bar</option>
                <option value="park">Park</option>
                <option value="cafe">Café</option>
            </select>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition duration-300"
                // disabled logic if needed
            >
                Find Venues
            </button>
            </form>
        </div>

      </div>
    </div>
  );
}

export default MeetingPage;
