'use client';

import { UserLocationContext } from '@/context/UserLocationContext';
import { useEffect, useState } from 'react';

interface UserLocation {
  lat: number;
  lng: number;
}

const UserLocation: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      function (error) {
        console.error('Error getting location:', error);
      }
    );
  };

  return (
    <UserLocationContext.Provider value={{ userLocation, setUserLocation }}>
      {children}
    </UserLocationContext.Provider>
  );
};

export default UserLocation;
