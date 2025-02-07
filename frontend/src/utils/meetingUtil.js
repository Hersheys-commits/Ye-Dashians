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

    return { calculateDistance, getZoomLevel, findMidpoint };
};

export default useMeetingHook;
