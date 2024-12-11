'use client';

import { UserLocationContext } from '@/context/UserLocationContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Dispatch,
  FC,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
} from 'react';
import ReactDOMServer from 'react-dom/server';

// Define the props for the Map component
interface MapProps {
  timeOffset: number;
  apiData: any;
  mapFrames: any[];
  options: {
    kind: string;
    colorScheme: number;
    tileSize: number;
    smoothData: number;
    snowColors: number;
    extension: string;
  };
  animationPosition: number;
  isPlaying: boolean;
  onSetTimestamp: Dispatch<SetStateAction<number>>;
}

const Map: FC<MapProps> = ({
  apiData,
  mapFrames,
  options,
  animationPosition,
  onSetTimestamp,
}) => {
  // Refs to store the map, layers, and marker instances
  const mapRef = useRef<L.Map | null>(null);
  const radarLayersRef = useRef<{ [key: string]: L.TileLayer }>({});
  const loadingTilesCount = useRef(0); // Tracks the number of loading tiles
  const loadedTilesCount = useRef(0); // Tracks the number of loaded tiles
  const markerRef = useRef<L.Marker | null>(null); // Ref for the user location marker
  const userLocationContext = useContext(UserLocationContext); // User location context

  // Create custom icon using Lucide React icon
  const customIcon = L.divIcon({
    html: ReactDOMServer.renderToString(
      <div className='relative w-7 h-7'>
        <div className='absolute inset-1 rounded-full bg-[#6a6aff] opacity-50 animate-ping' />
        <div className='absolute inset-2 rounded-full bg-[#1848d7]' />
      </div>
    ),
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  // Effect to log the user's location whenever it changes
  useEffect(() => {
    console.log('User location context:', userLocationContext);
    if (userLocationContext?.userLocation) {
      console.log('User coordinates:', userLocationContext.userLocation);
    }
  }, [userLocationContext?.userLocation]);

  useEffect(() => {
    // Initialize the map only once
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        center: [41.0082, 28.9784], // Default center
        zoom: 7, // Default zoom level
        zoomControl: false, // Disable zoom control
      });

      // Add OpenStreetMap tile layer to the map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      // Set initial timestamp
      onSetTimestamp(Date.now());
    }

    // Pan to user location when available
    if (userLocationContext?.userLocation && mapRef.current) {
      mapRef.current.setView(
        [
          userLocationContext.userLocation.lat,
          userLocationContext.userLocation.lng,
        ],
        10, // Zoom level
        { animate: true, duration: 1 } // Smooth animation to user location
      );

      // Update marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add a new marker for the user's location
      try {
        markerRef.current = L.marker(
          [
            userLocationContext.userLocation.lat,
            userLocationContext.userLocation.lng,
          ],
          { icon: customIcon }
        ).addTo(mapRef.current);

        // Bind a popup to the marker
        markerRef.current.bindPopup('Your location');
      } catch (error) {
        console.error('Error adding marker:', error);
      }
    }

    // Cleanup function to remove the marker and map when the component is unmounted
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onSetTimestamp, userLocationContext?.userLocation]);

  // Manage tile loading and loading count
  const manageTileCount = (isLoading: boolean) => {
    if (isLoading) loadingTilesCount.current++;
    else setTimeout(() => loadedTilesCount.current++, 250);
  };

  // Add a new radar layer to the map
  const addLayer = (frame: any) => {
    if (!mapRef.current || !apiData || radarLayersRef.current[frame.path])
      return;

    const colorScheme =
      options.kind === 'satellite'
        ? options.colorScheme === 255
          ? 255
          : 0
        : options.colorScheme;
    const source = new L.TileLayer(
      `${apiData.host}${frame.path}/${options.tileSize}/{z}/{x}/{y}/${colorScheme}/1_1.${options.extension}`,
      { tileSize: 256, opacity: 0.01, zIndex: frame.time }
    );

    // Handle loading and removing of tiles
    source.on('loading', () => manageTileCount(true));
    source.on('load', () => manageTileCount(false));
    source.on('remove', () => manageTileCount(false));
    radarLayersRef.current[frame.path] = source;
  };

  // Change the radar position on the map based on the animation frame
  const changeRadarPosition = (position: number, preloadOnly = false) => {
    if (!mapFrames.length || !mapRef.current) return;

    const currentFrame = mapFrames[position % mapFrames.length];

    // Remove existing radar layers
    Object.values(radarLayersRef.current).forEach((layer) =>
      mapRef.current?.removeLayer(layer)
    );

    // Add the new radar layer
    addLayer(currentFrame);

    const layer = radarLayersRef.current[currentFrame.path];
    if (layer) {
      mapRef.current.addLayer(layer);
      layer.setOpacity(100);

      // Update the timestamp if all tiles have loaded
      if (
        !preloadOnly &&
        loadingTilesCount.current <= loadedTilesCount.current
      ) {
        onSetTimestamp(currentFrame.time * 1000);
      }
    }
  };

  // Re-run the effect when options or map frames change
  useEffect(() => {
    // Cleanup existing layers
    Object.values(radarLayersRef.current).forEach((layer) =>
      mapRef.current?.removeLayer(layer)
    );
    radarLayersRef.current = {};
    loadingTilesCount.current = loadedTilesCount.current = 0;

    // Change radar position based on the animation position
    if (mapFrames.length) changeRadarPosition(animationPosition);
  }, [options.kind, options.colorScheme]);

  // Update radar position when the animation position changes
  useEffect(() => {
    if (mapFrames.length) changeRadarPosition(animationPosition);
  }, [animationPosition]);

  return <div id='map' className='absolute left-0 right-0 bottom-0' />;
};

export default Map;
