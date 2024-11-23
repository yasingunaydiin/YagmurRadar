'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Dispatch, FC, SetStateAction, useEffect, useRef } from 'react';

interface MapProps {
  timeOffset: number;
  activeLayer: 'clouds' | 'precipitation';
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

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map', { center: [41.0082, 28.9784], zoom: 7 });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);

      // Set initial timestamp to "now" when the map initializes.
      onSetTimestamp(Date.now());
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [onSetTimestamp]);

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
