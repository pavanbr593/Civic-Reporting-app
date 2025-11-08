import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

export const getCurrentLocation = async () => {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return location.coords;
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const result = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (result && result.length > 0) {
      const address = result[0];
      return `${address.street || ''} ${address.city || ''} ${address.region || ''}`.trim();
    }
    
    return 'Unknown location';
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return 'Location unavailable';
  }
};
