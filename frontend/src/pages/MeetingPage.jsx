import React, { useEffect, useState, useRef } from "react";
import {
    GoogleMap,
    Marker,
    useLoadScript,
    Autocomplete,
} from "@react-google-maps/api";
import { darkModeStyle } from "../utils/constants";
// import { calculateDistance } from "../utils/calculateDistance";
import Header from "../components/Header";
import axios from "axios";

const mapContainerStyle = {
    width: "100%",
    height: "100%",
};

const libraries = ["places"];

function MeetingPage() {
    // Location, map, and venue states
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
    const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
    const [mapZoom, setMapZoom] = useState(12);
    const [venuePreference, setVenuePreference] = useState("restaurant");
    const [nearbyVenues, setNearbyVenues] = useState([]);

    // New state for overlay and form submission
    const [isOverlayMinimized, setIsOverlayMinimized] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const autocompleteRef1 = useRef(null);
    const autocompleteRef2 = useRef(null);

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
        libraries,
    });

    // Get current location and set map center
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
                console.error("Error fetching location:", error);
                const defaultLocation = { lat: 28.6139, lng: 77.209 };
                setCurrentLocation(defaultLocation);
                setMapCenter(defaultLocation);
            },
            { enableHighAccuracy: true }
        );
    }, []);

    // Adjust map center and zoom when addresses change
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
            setMapCenter({ lat: centerLat, lng: centerLng });

            const distance = calculateDistance(
                addressCoordinates1,
                addressCoordinates2
            );
            setMapZoom(getZoomLevel(distance));
        } else if (
            addressCoordinates1.lat !== 0 &&
            addressCoordinates1.lng !== 0
        ) {
            setMapCenter(addressCoordinates1);
            setMapZoom(12);
        } else if (
            addressCoordinates2.lat !== 0 &&
            addressCoordinates2.lng !== 0
        ) {
            setMapCenter(addressCoordinates2);
            setMapZoom(12);
        }
    }, [addressCoordinates1, addressCoordinates2]);

    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const getZoomLevel = (distance) => {
        if (distance < 1) return 14;
        if (distance < 5) return 12;
        if (distance < 10) return 10;
        if (distance < 20) return 8;
        return 6;
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

    const handleUseCurrentLocation = (userIndex) => {
        if (userIndex === 1) {
            setAddressCoordinates1(currentLocation);
            setSelectedAddress1("Current Location");
        } else if (userIndex === 2) {
            setAddressCoordinates2(currentLocation);
            setSelectedAddress2("Current Location");
        }
    };

    const calculateDistance = (coord1, coord2) => {
        const R = 6371;
        const dLat = toRadians(coord2.lat - coord1.lat);
        const dLon = toRadians(coord2.lng - coord1.lng);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(coord1.lat)) *
                Math.cos(toRadians(coord2.lat)) *
                Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Toggle the overlay minimize state
    const toggleOverlay = () => {
        setIsOverlayMinimized((prev) => !prev);
    };

    if (!isLoaded) return <div>Loading...</div>;

    // Find midpoint between two coordinates
    const findMidpoint = (coord1, coord2) => ({
        lat: (coord1.lat + coord2.lat) / 2,
        lng: (coord1.lng + coord2.lng) / 2,
    });

    // Use GET request via your server proxy (using Axios) to fetch nearby places
    const searchNearbyVenues = async () => {
        if (
            addressCoordinates1.lat === 0 ||
            addressCoordinates1.lng === 0 ||
            addressCoordinates2.lat === 0 ||
            addressCoordinates2.lng === 0
        ) {
            console.error("Both locations must be set.");
            return;
        }

        const midpoint = findMidpoint(addressCoordinates1, addressCoordinates2);

        // Calculate distance (in km) and use 50% of that distance in meters (adjust as needed)
        const distanceKm = calculateDistance(
            addressCoordinates1,
            addressCoordinates2
        );
        const radius = Math.max(100, Math.floor(distanceKm * 1000 * 0.5)); // at least 100 meters

        const locationParam = `${midpoint.lat},${midpoint.lng}`;
        const type = venuePreference.toLowerCase();

        try {
            const response = await axios.get(
                "http://localhost:4001/api/nearbyplaces",
                {
                    params: {
                        location: locationParam,
                        radius: radius,
                        type: type,
                    },
                    withCredentials: true,
                }
            );

            const data = response.data;

            if (data.status === "OK") {
                const limitedVenues = data.results
                    .slice(0, 15)
                    .map((venue) => ({
                        name: venue.name,
                        vicinity: venue.vicinity,
                        location: {
                            lat: venue.geometry.location.lat,
                            lng: venue.geometry.location.lng,
                        },
                        rating: venue.rating || "N/A",
                    }));

                setNearbyVenues(limitedVenues);

                if (limitedVenues.length > 0) {
                    setMapCenter(midpoint);
                    setMapZoom(12);
                    // Mark the form as submitted to trigger the new layout
                    setFormSubmitted(true);
                }
            } else {
                console.error(
                    "Places API Error:",
                    data.status,
                    data.error_message
                );
            }
        } catch (error) {
            console.error("Error fetching nearby places:", error);
        }
    };

    // Layout: If the form has been submitted, display a two-column layout:
    // Left: Map (70%), Right: Venue List (30%)
    // Otherwise, the map takes the full width.
    const renderContent = () => {
        if (formSubmitted) {
            return (
                <div className="flex h-full">
                    <div className="w-7/10 h-full">
                        <GoogleMap
                            mapContainerStyle={{
                                width: "100%",
                                height: "100%",
                            }}
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
                            {addressCoordinates1.lat !== 0 &&
                                addressCoordinates1.lng !== 0 && (
                                    <Marker position={addressCoordinates1} />
                                )}
                            {addressCoordinates2.lat !== 0 &&
                                addressCoordinates2.lng !== 0 && (
                                    <Marker position={addressCoordinates2} />
                                )}
                            {nearbyVenues.map((venue, index) => (
                                <Marker
                                    key={index}
                                    position={venue.location}
                                    icon={{
                                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                                    }}
                                />
                            ))}
                        </GoogleMap>
                    </div>
                    <div className="w-3/10 h-full overflow-y-auto p-4 bg-gray-100 text-slate-900">
                        <h3 className="font-bold text-lg mb-3">
                            Nearby Venues
                        </h3>
                        {nearbyVenues.map((venue, index) => (
                            <div
                                key={index}
                                className="mb-4 p-3 bg-white rounded shadow"
                            >
                                <p className="font-semibold">{venue.name}</p>
                                <p className="text-sm text-gray-600">
                                    {venue.vicinity}
                                </p>
                                <p className="text-sm">
                                    Rating: {venue.rating}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else {
            // Map takes full width when form is not submitted.
            return (
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
                    {addressCoordinates1.lat !== 0 &&
                        addressCoordinates1.lng !== 0 && (
                            <Marker position={addressCoordinates1} />
                        )}
                    {addressCoordinates2.lat !== 0 &&
                        addressCoordinates2.lng !== 0 && (
                            <Marker position={addressCoordinates2} />
                        )}
                    {nearbyVenues.map((venue, index) => (
                        <Marker
                            key={index}
                            position={venue.location}
                            icon={{
                                url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                            }}
                        />
                    ))}
                </GoogleMap>
            );
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <Header />
            <div className="relative flex-grow">
                {renderContent()}
                {/* Form Overlay */}
                <div
                    className={`absolute top-4 left-4 bg-gray-900 text-white p-5 shadow-lg rounded-lg z-10 transition-transform duration-300 ${
                        isOverlayMinimized
                            ? "translate-x-[-320px]"
                            : "translate-x-0"
                    } ${formSubmitted ? "max-w-lg" : "w-[90%] max-w-lg"}`}
                >
                    <button
                        className="absolute -right-10 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-2 rounded-full shadow-md hover:bg-gray-700 transition duration-300"
                        onClick={toggleOverlay}
                    >
                        {isOverlayMinimized ? "➜" : "⏴"}
                    </button>
                    <h2 className="text-lg font-semibold mb-3">
                        Find a Meeting Place
                    </h2>
                    <form
                        className="space-y-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            searchNearbyVenues();
                        }}
                    >
                        {/* Location 1 Input */}
                        <div className="relative">
                            <Autocomplete
                                onLoad={(autocomplete) =>
                                    (autocompleteRef1.current = autocomplete)
                                }
                                onPlaceChanged={() =>
                                    handlePlaceSelect(
                                        autocompleteRef1.current,
                                        1
                                    )
                                }
                            >
                                <input
                                    type="text"
                                    placeholder="Enter your location"
                                    className="border p-2 rounded w-full bg-gray-800 text-white placeholder-gray-400"
                                />
                            </Autocomplete>
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500 text-xs"
                                onClick={() => handleUseCurrentLocation(1)}
                            >
                                Use Current
                            </button>
                        </div>
                        {/* Location 2 Input */}
                        <div className="relative">
                            <Autocomplete
                                onLoad={(autocomplete) =>
                                    (autocompleteRef2.current = autocomplete)
                                }
                                onPlaceChanged={() =>
                                    handlePlaceSelect(
                                        autocompleteRef2.current,
                                        2
                                    )
                                }
                            >
                                <input
                                    type="text"
                                    placeholder="Enter other user's location"
                                    className="border p-2 rounded w-full bg-gray-800 text-white placeholder-gray-400"
                                />
                            </Autocomplete>
                        </div>
                        {/* Venue Preference Dropdown */}
                        <select
                            className="border p-2 rounded w-full bg-gray-800 text-white"
                            value={venuePreference}
                            onChange={(e) => setVenuePreference(e.target.value)}
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
