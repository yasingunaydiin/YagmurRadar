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

// Add marker icon configuration
const icon = L.icon({
  iconUrl: '/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/marker-icon.png',
  shadowSize: [41, 41],
});

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
  const mapRef = useRef<L.Map | null>(null);
  const radarLayersRef = useRef<{ [key: string]: L.TileLayer }>({});
  const loadingTilesCount = useRef(0);
  const loadedTilesCount = useRef(0);
  const markerRef = useRef<L.Marker | null>(null);
  const userLocationContext = useContext(UserLocationContext);

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

  useEffect(() => {
    console.log('User location context:', userLocationContext);
    if (userLocationContext?.userLocation) {
      console.log('User coordinates:', userLocationContext.userLocation);
    }
  }, [userLocationContext?.userLocation]);

  useEffect(() => {
    // Initialize map immediately with a default center
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        center: [41.0082, 28.9784], // Default center (can be changed)
        zoom: 7,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      onSetTimestamp(Date.now());
    }

    // Pan to user location when available
    if (userLocationContext?.userLocation && mapRef.current) {
      mapRef.current.setView(
        [
          userLocationContext.userLocation.lat,
          userLocationContext.userLocation.lng,
        ],
        10,
        { animate: true, duration: 1 } // Smooth animation to user location
      );

      // Update marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      try {
        markerRef.current = L.marker(
          [
            userLocationContext.userLocation.lat,
            userLocationContext.userLocation.lng,
          ],
          { icon: customIcon }
        ).addTo(mapRef.current);

        markerRef.current.bindPopup('Your location');
      } catch (error) {
        console.error('Error adding marker:', error);
      }
    }
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onSetTimestamp, userLocationContext?.userLocation]);

  const manageTileCount = (isLoading: boolean) => {
    if (isLoading) loadingTilesCount.current++;
    else setTimeout(() => loadedTilesCount.current++, 250);
  };

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

    source.on('loading', () => manageTileCount(true));
    source.on('load', () => manageTileCount(false));
    source.on('remove', () => manageTileCount(false));
    radarLayersRef.current[frame.path] = source;
  };

  const changeRadarPosition = (position: number, preloadOnly = false) => {
    if (!mapFrames.length || !mapRef.current) return;

    const currentFrame = mapFrames[position % mapFrames.length];
    Object.values(radarLayersRef.current).forEach((layer) =>
      mapRef.current?.removeLayer(layer)
    );
    addLayer(currentFrame);

    const layer = radarLayersRef.current[currentFrame.path];
    if (layer) {
      mapRef.current.addLayer(layer);
      layer.setOpacity(100);

      if (
        !preloadOnly &&
        loadingTilesCount.current <= loadedTilesCount.current
      ) {
        onSetTimestamp(currentFrame.time * 1000);
      }
    }
  };

  useEffect(() => {
    Object.values(radarLayersRef.current).forEach((layer) =>
      mapRef.current?.removeLayer(layer)
    );
    radarLayersRef.current = {};
    loadingTilesCount.current = loadedTilesCount.current = 0;

    if (mapFrames.length) changeRadarPosition(animationPosition);
  }, [options.kind, options.colorScheme]);

  useEffect(() => {
    if (mapFrames.length) changeRadarPosition(animationPosition);
  }, [animationPosition]);

  return <div id='map' className='absolute left-0 right-0 bottom-0' />;
};

export default Map;
