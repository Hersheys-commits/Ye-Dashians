const useMeetingHook = () => {
    const toRadians = (degrees) => degrees * (Math.PI / 180);

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

    const getZoomLevel = (distance) => {
        if (distance < 1) return 14;
        if (distance < 5) return 12;
        if (distance < 10) return 10;
        if (distance < 20) return 8;
        return 6;
    };

    // Find midpoint between two coordinates
    const findMidpoint = (coord1, coord2) => ({
        lat: (coord1.lat + coord2.lat) / 2,
        lng: (coord1.lng + coord2.lng) / 2,
    });

    const getVenueHtmlString = (venue, selectedFriend, getPhotoUrl) => {
        return `
          <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
            <div class="md:flex">
              <div class="p-6">
                <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                    <a 
                        class="font-semibold cursor-pointer hover:underline" 
                        href="/place/${venue.reference}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
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

    return {
        calculateDistance,
        getZoomLevel,
        findMidpoint,
        getVenueHtmlString,
        getPhotoUrl,
    };
};

export default useMeetingHook;
