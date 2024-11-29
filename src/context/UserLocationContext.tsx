'use client';
import { createContext, Dispatch, SetStateAction } from 'react';

// Define the shape of the UserLocation
interface UserLocation {
  lat: number;
  lng: number;
}

// Define the context type
interface UserLocationContextType {
  userLocation: UserLocation | null;
  setUserLocation: Dispatch<SetStateAction<UserLocation | null>>;
}

// Create the context with a default value of undefined
export const UserLocationContext = createContext<
  UserLocationContextType | undefined
>(undefined);
