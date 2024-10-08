import { fallback } from "../assets";

export const transformData = (apiResponse) => {
  if (!apiResponse || !Array.isArray(apiResponse)) return [];
  return apiResponse.map((item) => ({
    id: item?.id,
    title: item?.name,
    restaurant_name: item?.restaurant_name,
    location: item?.address || "N/A",
    images:
      item?.galleries && item.galleries.length > 0
        ? item.galleries.map((gallery) => gallery?.image)
        : [fallback],
    rating:
      item?.ratings_of_hotel && item.ratings_of_hotel.length > 0
        ? item.ratings_of_hotel.reduce((acc, rate) => {
            const totalRating = parseFloat(rate.total_rating) || 0;
            const count = rate.count || 1; // Avoid division by zero
            return acc + totalRating / count;
          }, 0) / item.ratings_of_hotel.length // Average across all hotels
        : "N/A",

    cuisine:
      item?.kitchens && item.kitchens.length > 0
        ? item.kitchens.map((kitchen) => kitchen?.name).join(", ")
        : "N/A",
    timeline:
      item?.tables && item.tables.length > 0
        ? item.tables.map((table) => `Seats: ${table?.seats}`)
        : ["N/A"],
    kitchens: item?.kitchens || [],
    atmospheres: item?.atmospheres || [],
    facilities: item?.facilities || [],
    areas: item?.areas || [],
    menuTypes: item?.menuTypes || [],
    // Convert `is_approved` to boolean

    is_approved: item?.is_approved === 1,
    is_featured: item?.is_featured === 1,
    is_favorite: item?.is_favorite || false,
    status: item?.status,
    type: item?.type,
    latitude: item.latitude || null,
    longitude: item.longitude || null,
  }));
};

export const transformSingleImageData = (apiResponse) => {
  // Ensure apiResponse is always treated as an array
  const data = Array.isArray(apiResponse) ? apiResponse : [apiResponse];

  return data.map((item) => ({
    id: item?.id,
    title: item?.name || item?.title,
    restaurant_name: item?.restaurant_name,
    location: item?.address || item?.location || "N/A",
    images:
      item?.galleries && item.galleries.length > 0
        ? [item.galleries[0]?.image] // Use only the first image from galleries
        : [fallback],
    rating:
      item?.ratings_of_hotel && item.ratings_of_hotel.length > 0
        ? item.ratings_of_hotel.reduce((acc, rate) => {
            const totalRating = parseFloat(rate.total_rating) || 0;
            const count = rate.count || 1; // Avoid division by zero
            return acc + totalRating / count;
          }, 0) / item.ratings_of_hotel.length // Average across all hotels
        : "N/A",
    cuisine:
      item?.kitchens && item.kitchens.length > 0
        ? item.kitchens.map((kitchen) => kitchen?.name).join(", ")
        : "N/A",
    timeline:
      item?.tables && item.tables.length > 0
        ? item.tables.map((table) => `Seats: ${table?.seats}`)
        : ["N/A"],
    kitchens: item?.kitchens || [],
    atmospheres: item?.atmospheres || [],
    facilities: item?.facilities || [],
    areas: item?.areas || [],
    menuTypes: item?.menuTypes || [],
    // Convert `is_approved` to boolean
    is_approved: item?.is_approved === 1,
    is_featured: item?.is_featured === 1,
    is_favorite: item?.is_favorite || false,
    status: item?.status,
    type: item?.type,
    latitude: item.latitude || null,
    longitude: item.longitude || null,
  }));
};

export const getDistance = (lat1, lon1, lat2, lon2) => {
  // Convert to numbers in case they are passed as strings
  lat1 = parseFloat(lat1);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);
  lon2 = parseFloat(lon2);

  // Check if coordinates are valid
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    console.error("Invalid coordinates:", { lat1, lon1, lat2, lon2 });
    return Infinity; // Return an infinite distance if coordinates are invalid
  }

  const R = 6371e3; // Radius of the Earth in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters

  console.log("Calculated distance:", distance);
  return distance;
};
