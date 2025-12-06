import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

interface Location {
  latitude: number;
  longitude: number;
}

interface UseGeolocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  getLocation: () => Promise<Location | null>;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback((): Promise<Location | null> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const err = "Geolocation is not supported by your browser";
        setError(err);
        setLoading(false);
        toast.error(err);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
          setLoading(false);
          resolve(newLocation);
        },
        (error) => {
          let errorMessage = "Unable to retrieve your location";
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "Location permission denied";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = "Location information is unavailable";
          } else if (error.code === error.TIMEOUT) {
            errorMessage = "The request to get user location timed out";
          }
          setError(errorMessage);
          setLoading(false);
          toast.error(errorMessage);
          resolve(null);
        }
      );
    });
  }, []);

  return { location, loading, error, getLocation };
};
