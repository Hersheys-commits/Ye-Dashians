import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ChevronRight, Globe, Phone, Share2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setSelectedFriend } from "../store/chatSlice";
import useSendMessage from "../hooks/useSendMessage";
import toast from "react-hot-toast";
import Header from "../components/Header";
import { useSocket } from "../hooks/socketHook";
import useGetAllFriends from "../hooks/useGetAllFriends";
import api from "../utils/axiosRequest";

const PlaceDetailsPage = () => {
    const [placeDetails, setPlaceDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const { selectedFriend } = useSocket();
    const { place_id } = useParams();
    const [allFriends, friendLoading] = useGetAllFriends();
    const dispatch = useDispatch();
    const { sendMessage } = useSendMessage();

    useEffect(() => {
        const fetchPlaceDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/place/${place_id}`, {
                    withCredentials: true,
                });
                console.log(response);
                setPlaceDetails(response.data.result);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching place details:", err);
            } finally {
                setLoading(false);
            }
        };

        if (place_id) {
            fetchPlaceDetails();
        }
    }, [place_id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div
                data-theme="dark"
                className="min-h-screen flex items-center justify-center bg-base-200"
            >
                <div className="alert alert-error">
                    <span>
                        Error loading place details. Please try again later.
                    </span>
                </div>
            </div>
        );
    }

    if (!placeDetails) {
        return (
            <div
                data-theme="dark"
                className="min-h-screen flex items-center justify-center bg-base-200"
            >
                <div className="alert alert-warning">
                    <span>No place details found.</span>
                </div>
            </div>
        );
    }

    const handlePrevPhoto = () => {
        setCurrentPhotoIndex((prev) =>
            prev === 0 ? placeDetails.photos.length - 1 : prev - 1
        );
    };

    const handleNextPhoto = () => {
        setCurrentPhotoIndex((prev) =>
            prev === placeDetails.photos.length - 1 ? 0 : prev + 1
        );
    };

    const getPlaceHtmlString = (place) => {
        return `
          <div class="flex flex-row p-4 bg-white rounded-lg shadow-lg">
            <!-- Image Section -->
            <div class="flex-none mr-4 space-y-2">
              <img 
                src="${getPhotoUrl(place, 0)}" 
                alt="${place.name}" 
                class="w-[150px] h-[150px] object-cover rounded-lg" 
              />
              <img 
                src="${getPhotoUrl(place, 2)}" 
                alt="${place.name}" 
                class="w-[150px] h-[150px] object-cover rounded-lg" 
              />
              <img 
                src="${getPhotoUrl(place, 1)}" 
                alt="${place.name}" 
                class="w-[150px] h-[150px] object-cover rounded-lg" 
              />
            </div>
            <!-- Details Section -->
            <div class="flex-1">
              <h2 class="text-xl mb-2 text-indigo-500 font-semibold">
                <a 
                    class="font-semibold cursor-pointer hover:underline" 
                    href="/place/${place.reference}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    ${place.name}
                </a>
              </h2>
              ${place.vicinity ? `<p class="block mt-1 text-lg leading-tight font-medium text-black"> ${place.vicinity}</p>` : ""}
              ${place.formatted_phone_number ? `<p class="text-gray-700 mt-2"><strong>Phone:</strong> ${place.formatted_phone_number}</p>` : ""}
              ${place.website ? `<p class="mt-2"><strong>Website:</strong> <a href="${place.website}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">Visit Website</a></p>` : ""}
              ${place.rating ? `<p class="mt-2 text-gray-700"><strong>Rating:</strong> ${place.rating} (${place.user_ratings_total} reviews)</p>` : ""}
              ${place.current_opening_hours ? `<p class="mt-2 text-gray-700"><strong>Status:</strong> ${place.current_opening_hours.open_now ? "Open Now" : "Closed"}</p>` : ""}
              ${
                  place.opening_hours && place.opening_hours.weekday_text
                      ? `
                <div class="mt-2 text-gray-700">
                  <strong>Opening Hours:</strong>
                  <ul class="list-disc pl-5">
                    ${place.opening_hours.weekday_text.map((day) => `<li>${day}</li>`).join("")}
                  </ul>
                </div>`
                      : ""
              }
            </div>
          </div>
        `;
    };

    const handleShare = async () => {
        if (!selectedFriend) {
            toast.error("Please select a friend first");
            return;
        }
        const htmlString = getPlaceHtmlString(placeDetails);
        console.log("Sharing HTML string:", htmlString);
        try {
            await sendMessage({
                text: htmlString,
                image: null,
                isTemplate: true,
            });
            //   toast.success("Place details shared successfully");
        } catch (error) {
            console.error("Error sharing place details:", error);
            toast.error("Failed to share place details");
        }
        toast.success(`Place details shared to ${selectedFriend.username}`);
    };

    const getPhotoUrl = (place, index) => {
        if (
            place.photos &&
            place.photos.length > index &&
            place.photos[index].photo_reference
        ) {
            return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${place.photos[index].width}&photoreference=${place.photos[index].photo_reference}&key=${import.meta.env.VITE_GOOGLE_MAP_API}`;
        }
        // Fallback image if no valid photo exists
        return "/api/placeholder/96/96";
    };

    return (
        <div className="bg-base-100 min-h-screen">
            <Header />
            <div className="bg-base-100 text-base-content">
                {/* Header Section */}
                <div className="bg-base-200 shadow-lg p-6">
                    <div className="flex justify-between items-start max-w-6xl mx-auto">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-base-content">
                                {placeDetails?.name}
                            </h1>
                            <div className="flex items-center mt-2">
                                <div className="rating rating-sm">
                                    {[...Array(5)].map((_, i) => (
                                        <input
                                            key={i}
                                            type="radio"
                                            name="rating-2"
                                            className="mask mask-star-2 bg-warning"
                                            checked={
                                                i + 1 ===
                                                Math.round(placeDetails?.rating)
                                            }
                                            readOnly
                                        />
                                    ))}
                                </div>
                                <span className="ml-2 text-base-content/70">
                                    {placeDetails?.rating} (
                                    {placeDetails?.user_ratings_total} reviews)
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                className="select select-bordered bg-base-300 text-base-content"
                                value={selectedFriend?._id || ""}
                                onChange={(e) => {
                                    const friend = allFriends.find(
                                        (f) => f._id === e.target.value
                                    );
                                    dispatch(setSelectedFriend(friend));
                                }}
                            >
                                <option value="">Select friend</option>
                                {allFriends.map((friend) => (
                                    <option key={friend?._id} value={friend?._id}>
                                        {friend.username}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={handleShare}
                                className="btn btn-primary"
                            >
                                <Share2 className="w-4 h-4" /> Share
                            </button>
                        </div>
                    </div>
                </div>

                {/* Photos Carousel */}
                {placeDetails?.photos?.length > 0 && (
                    <div className="max-w-6xl mx-auto mt-6 bg-base-200 p-4 rounded-lg shadow">
                        <div className="relative h-96">
                            <img
                                src={getPhotoUrl(
                                    placeDetails,
                                    currentPhotoIndex
                                )}
                                alt={`${placeDetails.name} photo ${currentPhotoIndex + 1}`}
                                className="w-full h-full object-cover rounded"
                            />
                            <button
                                onClick={handlePrevPhoto}
                                className="btn btn-circle btn-ghost absolute left-2 top-1/2 -translate-y-1/2 bg-base-300/50 hover:bg-base-300"
                            >
                                <ChevronLeft />
                            </button>
                            <button
                                onClick={handleNextPhoto}
                                className="btn btn-circle btn-ghost absolute right-2 top-1/2 -translate-y-1/2 bg-base-300/50 hover:bg-base-300"
                            >
                                <ChevronRight />
                            </button>
                        </div>
                    </div>
                )}

                {/* Details Grid */}
                <div className="max-w-6xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Opening Hours */}
                    {placeDetails?.opening_hours && (
                        <div className="bg-base-200 p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-4 text-base-content">
                                Opening Hours
                            </h2>
                            <div className="space-y-2">
                                {placeDetails.opening_hours.weekday_text.map(
                                    (day, index) => (
                                        <p
                                            key={index}
                                            className="text-base-content/70"
                                        >
                                            {day}
                                        </p>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact & Additional Info */}
                    <div className="bg-base-200 p-6 rounded-lg shadow">
                        <h2 className="text-xl font-bold mb-4 text-base-content">
                            Additional Information
                        </h2>
                        <div className="space-y-4 text-base-content/70">
                            {placeDetails?.formatted_phone_number && (
                                <p className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {placeDetails.formatted_phone_number}
                                </p>
                            )}
                            {placeDetails?.website && (
                                <p className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    <a
                                        href={placeDetails.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        Visit Website
                                    </a>
                                </p>
                            )}
                            <p>
                                <strong className="text-base-content">
                                    Address:
                                </strong>{" "}
                                {placeDetails?.formatted_address}
                            </p>
                            <p>
                                <strong className="text-base-content">
                                    Type:
                                </strong>{" "}
                                {placeDetails?.types.join(", ")}
                            </p>
                            {placeDetails?.price_level && (
                                <p>
                                    <strong className="text-base-content">
                                        Price Level:
                                    </strong>{" "}
                                    {"$".repeat(placeDetails.price_level)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                {placeDetails?.reviews?.length > 0 && (
                    <div className="max-w-6xl mx-auto mt-6 mb-6">
                        <div className="bg-base-200 p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold mb-4 text-base-content">
                                Reviews
                            </h2>
                            <div className="space-y-6">
                                {placeDetails.reviews.map((review, index) => (
                                    <div
                                        key={index}
                                        className="border-base-content/10 border-b last:border-b-0 pb-4"
                                    >
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={review.profile_photo_url}
                                                alt={review.author_name}
                                                className="w-12 h-12 rounded-full bg-base-300"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src =
                                                        "/src/assets/Profile_user.png";
                                                }}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-base-content">
                                                        {review.author_name}
                                                    </h3>
                                                    <div className="rating rating-sm">
                                                        {[...Array(5)].map(
                                                            (_, i) => (
                                                                <input
                                                                    key={i}
                                                                    type="radio"
                                                                    name={`rating-${index}`}
                                                                    className="mask mask-star-2 bg-warning"
                                                                    checked={
                                                                        i +
                                                                            1 ===
                                                                        review.rating
                                                                    }
                                                                    readOnly
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-base-content/70 mt-1">
                                                    {review.text}
                                                </p>
                                                <p className="text-sm text-base-content/50 mt-2">
                                                    {
                                                        review.relative_time_description
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlaceDetailsPage;
