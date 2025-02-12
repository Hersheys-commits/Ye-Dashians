import React, { useEffect, useState, useRef } from "react";
import {
    GoogleMap,
    Marker,
    useLoadScript,
    Autocomplete,
} from "@react-google-maps/api";
import { darkModeStyle } from "../utils/constants";
import Header from "../components/Header";
import axios from "axios";
import useMeetingHook from "../utils/meetingUtil";
import { useDispatch } from "react-redux";
import { setSelectedFriend } from "../store/chatSlice";
import useSendMessage from "../hooks/useSendMessage";
import { useSocket } from "../hooks/socketHook";
import toast from "react-hot-toast";
import useGetAllFriends from "../hooks/useGetAllFriends";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosRequest";
import Loading from "../components/Loading";
import { venueOptions } from "../utils/constants";

const mapContainerStyle = {
    width: "100%",
    height: "100%",
};

const libraries = ["places"];

function MeetingPage() {
    // 1. All useState hooks
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
    const [isOverlayMinimized, setIsOverlayMinimized] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedVenues, setSelectedVenues] = useState([]);
    const [currentAddress, setCurrentAddress] = useState("");
    const [hoveredVenue, setHoveredVenue] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);

    // 2. All useRef hooks
    const autocompleteRef1 = useRef(null);
    const autocompleteRef2 = useRef(null);

    // 3. Custom hooks and other hooks
    const navigateTo = useNavigate();
    const {
        calculateDistance,
        getZoomLevel,
        findMidpoint,
        getVenueHtmlString,
        getPhotoUrl,
    } = useMeetingHook();
    const [allFriends, friendLoading] = useGetAllFriends();
    const { selectedFriend, onlineUsers } = useSocket();
    const { sendMessageLoading, sendMessage } = useSendMessage();
    const dispatch = useDispatch();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
        libraries,
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // 4. All useEffect hooks

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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

    useEffect(() => {
        if (formSubmitted && window.google) {
            const map = document.querySelector('[aria-label="Map"]');
            if (map) {
                window.google.maps.event.trigger(map, "resize");
            }
        }
    }, [formSubmitted]);

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

    // Update the MarkerHoverInfo component
    const MarkerHoverInfo = ({ venue, position }) => {
        if (!venue || !position) return null;

        return (
            <div
                className="fixed z-[999] bg-white rounded-lg shadow-lg p-3 w-64"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    transform: "translate(-50%, -120%)",
                    pointerEvents: "none",
                }}
            >
                <div className="flex flex-col">
                    <div className="w-full h-32 mb-2">
                        <img
                            src={getPhotoUrl(venue)}
                            alt={venue.name}
                            className="w-full h-full object-cover rounded"
                        />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900">
                            {venue.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {venue.vicinity}
                        </p>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-700">
                                Rating: {venue.rating}
                            </span>
                            {venue.user_ratings_total && (
                                <span className="text-xs text-gray-500 ml-1">
                                    ({venue.user_ratings_total} reviews)
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Update the handleMarkerMouseOver function
    const handleMarkerMouseOver = (venue, marker) => {
        // Get the map container element
        const mapContainer = document.querySelector('[aria-label="Map"]');
        if (!mapContainer) return;

        // Get the marker's DOM element
        const markerElement = Array.from(
            mapContainer.querySelectorAll("img")
        ).find((img) => img.src.includes("blue-dot"));
        if (!markerElement) return;

        // Get the marker's position relative to the viewport
        const rect = markerElement.getBoundingClientRect();

        // Account for mobile viewport scroll
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // Calculate position relative to the document
        const pos = {
            x: rect.left + scrollX + rect.width / 2,
            y: rect.top + scrollY,
        };

        setHoveredVenue(venue);
        setMarkerPosition(pos);
    };

    // Add new function to get address from coordinates
    const getAddressFromCoordinates = async (lat, lng) => {
        try {
            const response = await api.get("/api/geocode", {
                params: {
                    latlng: `${lat},${lng}`,
                },
                withCredentials: true,
            });
            if (response.data && response.data.results) {
                return response.data.results[0].formatted_address;
            }
        } catch (error) {
            console.error("Error fetching address:", error);
        }
        return "";
    };

    const handleShare = async (venue) => {
        if (!selectedFriend) {
            alert("Please select a friend first");
            return;
        }

        const htmlStringManual = getVenueHtmlString(
            venue,
            selectedFriend,
            getPhotoUrl
        );
        console.log("Manual HTML string:", htmlStringManual);

        if (!htmlStringManual) {
            console.log("there is no html string generated.");
            return;
        }

        try {
            await sendMessage({
                text: htmlStringManual,
                image: null,
                isTemplate: true,
            });
            toast.success("Venue Shared Successfully.");
        } catch (error) {
            console.log(error);
            toast.error("Unable to share venue.");
        }
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

    // Modify handleUseCurrentLocation
    const handleUseCurrentLocation = async (userIndex) => {
        if (userIndex === 1) {
            const address = await getAddressFromCoordinates(
                currentLocation.lat,
                currentLocation.lng
            );
            setAddressCoordinates1(currentLocation);
            setSelectedAddress1("Current Location");
            if (autocompleteRef1.current) {
                const input = autocompleteRef1.current
                    .getContainer()
                    .querySelector("input");
                if (input) input.value = address;
            }
        } else if (userIndex === 2) {
            const address = await getAddressFromCoordinates(
                currentLocation.lat,
                currentLocation.lng
            );
            setAddressCoordinates2(currentLocation);
            setSelectedAddress2("Current Location");
            if (autocompleteRef2.current) {
                const input = autocompleteRef2.current
                    .getContainer()
                    .querySelector("input");
                if (input) input.value = address;
            }
        }
    };

    // Toggle the overlay minimize state
    const toggleOverlay = () => {
        setIsOverlayMinimized((prev) => !prev);
    };

    if (!isLoaded)
        return (
            <div className="flex justify-center items-center mt-10">
                <Loading />
            </div>
        );

    // Modify searchNearbyVenues
    const searchNearbyVenues = async () => {
        if (
            addressCoordinates1.lat === 0 ||
            addressCoordinates1.lng === 0 ||
            addressCoordinates2.lat === 0 ||
            addressCoordinates2.lng === 0
        ) {
            toast.error("Both locations must be set.");
            return;
        }

        if (selectedVenues.length === 0) {
            toast.error("Please select at least one venue type");
            return;
        }

        const midpoint = findMidpoint(addressCoordinates1, addressCoordinates2);
        const distanceKm = calculateDistance(
            addressCoordinates1,
            addressCoordinates2
        );
        const radius = Math.max(100, Math.floor(distanceKm * 1000 * 0.5));

        try {
            const venuePromises = selectedVenues.map((venue) =>
                api.get("/api/nearbyplaces", {
                    params: {
                        location: `${midpoint.lat},${midpoint.lng}`,
                        radius: radius,
                        type: venue,
                    },
                    withCredentials: true,
                })
            );

            const responses = await Promise.all(venuePromises);
            const allVenues = responses.flatMap(
                (response) => response.data.results || []
            );

            // Remove duplicates based on place_id
            const uniqueVenues = Array.from(
                new Map(allVenues.map((venue) => [venue.place_id, venue]))
            ).map(([_, venue]) => venue);

            const venuesWithDistance = await Promise.all(
                uniqueVenues.map(async (venue) => {
                    try {
                        const [response1, response2] = await Promise.all([
                            api.get("/api/distance", {
                                params: {
                                    origin: `${addressCoordinates1.lat},${addressCoordinates1.lng}`,
                                    destination: `${venue.geometry.location.lat},${venue.geometry.location.lng}`,
                                },
                                withCredentials: true,
                            }),
                            api.get("/api/distance", {
                                params: {
                                    origin: `${addressCoordinates2.lat},${addressCoordinates2.lng}`,
                                    destination: `${venue.geometry.location.lat},${venue.geometry.location.lng}`,
                                },
                                withCredentials: true,
                            }),
                        ]);

                        return {
                            ...venue,
                            distanceInfo: {
                                user1: response1.data,
                                user2: response2.data,
                            },
                        };
                    } catch (error) {
                        console.error("Error fetching distance info:", error);
                        return venue;
                    }
                })
            );

            setNearbyVenues(venuesWithDistance);
            setMapCenter(midpoint);
            setMapZoom(12);
            setFormSubmitted(true);
        } catch (error) {
            console.error("Error fetching nearby places:", error);
            toast.error("Error fetching venues");
        }
    };

    const handleMarkerMouseOut = () => {
        setHoveredVenue(null);
        setMarkerPosition(null);
    };

    // Layout: If the form has been submitted, display a two-column layout:
    // Left: Map (70%), Right: Venue List (30%)
    // Otherwise, the map takes the full width.
    // Modify the main render layout
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 relative flex overflow-hidden flex-col md:flex-row">
                {/* Map container */}
                <div
                    className={`h-[60vh] md:h-full relative transition-all duration-300 ease-in-out ${
                        formSubmitted ? "md:w-[70%]" : "w-full"
                    }`}
                >
                    <div className="w-full h-full">
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
                            onLoad={(map) => {
                                if (formSubmitted) {
                                    setTimeout(() => {
                                        google.maps.event.trigger(
                                            map,
                                            "resize"
                                        );
                                        map.setCenter(mapCenter);
                                    }, 100);
                                }
                            }}
                        >
                            {addressCoordinates1.lat !== 0 && (
                                <Marker
                                    position={addressCoordinates1}
                                    icon={{
                                        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                    }}
                                />
                            )}
                            {addressCoordinates2.lat !== 0 && (
                                <Marker
                                    position={addressCoordinates2}
                                    icon={{
                                        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
                                    }}
                                />
                            )}
                            {nearbyVenues.map((venue, index) => (
                                <Marker
                                    key={index}
                                    position={{
                                        lat: venue.geometry.location.lat,
                                        lng: venue.geometry.location.lng,
                                    }}
                                    icon={{
                                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                                    }}
                                    onMouseOver={(marker) =>
                                        !isMobile &&
                                        handleMarkerMouseOver(venue, marker)
                                    }
                                    onMouseOut={
                                        !isMobile
                                            ? handleMarkerMouseOut
                                            : undefined
                                    }
                                    onTouchStart={(marker) =>
                                        isMobile &&
                                        handleMarkerMouseOver(venue, marker)
                                    }
                                    onTouchEnd={
                                        isMobile
                                            ? handleMarkerMouseOut
                                            : undefined
                                    }
                                />
                            ))}
                        </GoogleMap>
                        {/* Hover Info Window */}
                        {hoveredVenue && markerPosition && (
                            <MarkerHoverInfo
                                venue={hoveredVenue}
                                position={markerPosition}
                            />
                        )}
                    </div>
                </div>

                {/* Venue suggestions */}
                {formSubmitted && (
                    <div className="h-[40vh] md:h-full w-full md:w-[30%] overflow-hidden flex flex-col border-t md:border-t-0 md:border-l border-gray-200">
                        <div className="bg-gray-100 p-4 flex-1 overflow-y-auto">
                            <h3 className="font-bold text-lg mb-3 text-slate-900 sticky top-0 bg-gray-100 py-2">
                                Nearby Venues
                            </h3>
                            <div className="space-y-4">
                                {nearbyVenues.map((venue, index) => (
                                    <div
                                        key={index}
                                        className="p-3 bg-white rounded shadow flex flex-col md:flex-row"
                                    >
                                        <div className="flex-1">
                                            <p
                                                className="font-semibold cursor-pointer"
                                                onClick={() =>
                                                    navigateTo(
                                                        `/place/${venue.reference}`
                                                    )
                                                }
                                            >
                                                {venue.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {venue.vicinity}
                                            </p>
                                            <p className="text-sm">
                                                Rating: {venue.rating}
                                            </p>
                                            {venue.distanceInfo?.user1 && (
                                                <p className="text-xs text-gray-700">
                                                    From Location 1:{" "}
                                                    {
                                                        venue.distanceInfo.user1
                                                            .distance
                                                    }{" "}
                                                    (
                                                    {
                                                        venue.distanceInfo.user1
                                                            .duration
                                                    }
                                                    )
                                                </p>
                                            )}
                                            {venue.distanceInfo?.user2 && (
                                                <p className="text-xs text-gray-700">
                                                    From Location 2:{" "}
                                                    {
                                                        venue.distanceInfo.user2
                                                            .distance
                                                    }{" "}
                                                    (
                                                    {
                                                        venue.distanceInfo.user2
                                                            .duration
                                                    }
                                                    )
                                                </p>
                                            )}
                                            <div className="mt-2 flex flex-col md:flex-row items-start gap-2">
                                                <select
                                                    className="p-1 text-sm border rounded w-full md:w-auto"
                                                    defaultValue=""
                                                    onChange={(e) => {
                                                        const friend =
                                                            allFriends.find(
                                                                (friend) =>
                                                                    friend._id ===
                                                                    e.target
                                                                        .value
                                                            );
                                                        dispatch(
                                                            setSelectedFriend(
                                                                friend
                                                            )
                                                        );
                                                    }}
                                                >
                                                    <option value="">
                                                        Select friend
                                                    </option>
                                                    {allFriends.map(
                                                        (friend) => (
                                                            <option
                                                                key={friend._id}
                                                                value={
                                                                    friend._id
                                                                }
                                                            >
                                                                {
                                                                    friend.username
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                                <button
                                                    onClick={() =>
                                                        handleShare(venue)
                                                    }
                                                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 w-full md:w-auto"
                                                >
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-2 md:mt-0 md:ml-4 w-full md:w-24 h-24 flex-shrink-0">
                                            <img
                                                src={getPhotoUrl(venue)}
                                                alt={venue.name}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search form overlay */}
                <div
                    className={`absolute ${isMobile ? "bottom-0 inset-x-0" : "top-4 left-4"} 
                    bg-gray-900 text-white p-5 shadow-lg rounded-lg z-10 transition-transform duration-300 
                    ${
                        isOverlayMinimized
                            ? isMobile
                                ? "translate-y-full"
                                : "translate-x-[-320px]"
                            : isMobile
                              ? "translate-y-0 rounded-b-none"
                              : "translate-x-0"
                    }
                    w-full md:max-w-lg md:rounded-lg`}
                >
                    <button
                        className={`absolute ${
                            isMobile
                                ? "top-[-40px] left-1/2 transform -translate-x-1/2"
                                : "-right-10 top-1/2 -translate-y-1/2"
                        } 
                            bg-gray-800 text-white px-3 py-2 rounded-full shadow-md hover:bg-gray-700`}
                        onClick={() =>
                            setIsOverlayMinimized(!isOverlayMinimized)
                        }
                    >
                        {isOverlayMinimized
                            ? isMobile
                                ? "↑"
                                : "➜"
                            : isMobile
                              ? "↓"
                              : "⏴"}
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Select Venue Types:
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {venueOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className="flex items-center space-x-2"
                                    >
                                        <input
                                            type="checkbox"
                                            value={option.value}
                                            checked={selectedVenues.includes(
                                                option.value
                                            )}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedVenues([
                                                        ...selectedVenues,
                                                        option.value,
                                                    ]);
                                                } else {
                                                    setSelectedVenues(
                                                        selectedVenues.filter(
                                                            (v) =>
                                                                v !==
                                                                option.value
                                                        )
                                                    );
                                                }
                                            }}
                                            className="form-checkbox"
                                        />
                                        <span className="text-sm">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition duration-300"
                        >
                            Find Venues
                        </button>
                    </form>
                </div>
                {isMobile && hoveredVenue && (
                    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
                        <button
                            onClick={handleMarkerMouseOut}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg"
                        >
                            Close Details
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MeetingPage;
