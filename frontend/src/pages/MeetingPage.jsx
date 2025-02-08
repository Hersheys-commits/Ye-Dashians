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

    // 2. All useRef hooks
    const autocompleteRef1 = useRef(null);
    const autocompleteRef2 = useRef(null);

    // 3. Custom hooks and other hooks
    const navigateTo = useNavigate();
    const { calculateDistance, getZoomLevel, findMidpoint } = useMeetingHook();
    const [allFriends, friendLoading] = useGetAllFriends();
    const { selectedFriend, onlineUsers } = useSocket();
    const { sendMessageLoading, sendMessage } = useSendMessage();
    const dispatch = useDispatch();
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API,
        libraries,
    });

    // 4. All useEffect hooks
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

    const getVenueHtmlString = (venue, selectedFriend, getPhotoUrl) => {
        return `
          <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
            <div class="md:flex">
              <div class="p-6">
                <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                    <a href="/place/${venue.reference}" class="hover:underline">
                        ${venue.name}
                    </a>
                </div>
                <p class="block mt-1 text-lg leading-tight font-medium text-black">${venue.vicinity}</p>
                <p class="mt-2 text-gray-500">Rating: ${venue.rating}</p>
                ${
                    venue.distanceInfo && venue.distanceInfo.user1
                        ? `<p class="mt-2 text-gray-600 text-xs">From Location 1: ${venue.distanceInfo.user1.distance} (${venue.distanceInfo.user1.duration})</p>`
                        : ""
                }
                ${
                    venue.distanceInfo && venue.distanceInfo.user2
                        ? `<p class="mt-2 text-gray-600 text-xs">From Location 2: ${venue.distanceInfo.user2.distance} (${venue.distanceInfo.user2.duration})</p>`
                        : ""
                }
              </div>
              <div class="md:flex-shrink-0">
                <img class="h-48 w-full object-cover md:w-48" src="${getPhotoUrl(venue)}" alt="${venue.name}" />
              </div>
            </div>
          </div>
        `;
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

    // Helper function to get the photo URL for the first photo only
    const getPhotoUrl = (venue) => {
        if (
            venue.photos &&
            venue.photos.length > 0 &&
            venue.photos[0].photo_reference
        ) {
            return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${venue.photos[0].width}&photoreference=${venue.photos[0].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAP_API}`;
        }
        // Template error photo if no valid photo exists
        return "/api/placeholder/96/96";
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

    // Toggle the overlay minimize state
    const toggleOverlay = () => {
        setIsOverlayMinimized((prev) => !prev);
    };

    if (!isLoaded) return <div>Loading...</div>;

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
                "https://nexus-xwdr.onrender.com/api/nearbyplaces",
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
                // For each venue, fetch distance & duration info for both users using your backend endpoint.
                const venuesWithDistance = await Promise.all(
                    data.results.map(async (venue) => {
                        try {
                            const origin1 = `${addressCoordinates1?.lat},${addressCoordinates1?.lng}`;
                            const origin2 = `${addressCoordinates2?.lat},${addressCoordinates2?.lng}`;
                            const destination = `${venue.geometry.location?.lat},${venue.geometry.location?.lng}`;

                            const [response1, response2] = await Promise.all([
                                axios.get(
                                    "https://nexus-xwdr.onrender.com/api/distance",
                                    {
                                        params: {
                                            origin: origin1,
                                            destination: destination,
                                        },
                                        withCredentials: true,
                                    }
                                ),
                                axios.get(
                                    "https://nexus-xwdr.onrender.com/api/distance",
                                    {
                                        params: {
                                            origin: origin2,
                                            destination: destination,
                                        },
                                        withCredentials: true,
                                    }
                                ),
                            ]);

                            return {
                                ...venue,
                                distanceInfo: {
                                    user1: response1.data, // Expected: { distance: "X km", duration: "Y mins" }
                                    user2: response2.data,
                                },
                            };
                        } catch (error) {
                            console.error(
                                "Error fetching distance info:",
                                error
                            );
                            return venue;
                        }
                    })
                );

                console.log("aghsasdh", venuesWithDistance);

                setNearbyVenues(venuesWithDistance);

                if (venuesWithDistance.length > 0) {
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
                                    position={venue.geometry.location}
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
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* {console.log(venue)} */}
                                        <p
                                            className="font-semibold"
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
                                        {/* Display distance & duration info if available */}
                                        {venue.distanceInfo &&
                                            venue.distanceInfo.user1 && (
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
                                        {venue.distanceInfo &&
                                            venue.distanceInfo.user2 && (
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
                                        <div className="mt-2 flex items-center gap-2">
                                            <select
                                                className="p-1 text-sm border rounded"
                                                defaultValue=""
                                                onChange={(e) => {
                                                    const friendId =
                                                        e.target.value;
                                                    // Look for the friend using _id instead of userId
                                                    const friend =
                                                        allFriends.find(
                                                            (friend) =>
                                                                friend._id ===
                                                                friendId
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
                                                {allFriends.map((friend) => (
                                                    <option
                                                        key={friend._id}
                                                        value={friend._id}
                                                    >
                                                        {friend.username}
                                                    </option>
                                                ))}
                                            </select>

                                            <button
                                                onClick={() =>
                                                    handleShare(venue)
                                                }
                                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                                            >
                                                Share
                                            </button>
                                        </div>
                                    </div>
                                    <div className="ml-4 w-24 h-24">
                                        <img
                                            src={getPhotoUrl(venue)}
                                            alt={venue.name}
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </div>
                                </div>
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
