// Haversine formula: calculate distance (in km) between two coordinates
export const calculateDistance = (coord1, coord2) => {
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
