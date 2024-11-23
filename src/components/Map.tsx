'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

interface MapProps {
  apiData: any;
  mapFrames: any[];
  options: any;
  animationPosition: number;
  isPlaying: boolean;
  onSetTimestamp: (text: string) => void;
}

export default function Map({
  apiData,
  mapFrames,
  options,
  animationPosition,
  isPlaying,
  onSetTimestamp,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const radarLayersRef = useRef<{ [key: string]: L.TileLayer }>({});
  const loadingTilesCount = useRef(0);
  const loadedTilesCount = useRef(0);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([48.8566, 2.3522], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const startLoadingTile = () => {
    loadingTilesCount.current++;
  };

  const finishLoadingTile = () => {
    setTimeout(() => {
      loadedTilesCount.current++;
    }, 250);
  };

  const isTilesLoading = () => {
    return loadingTilesCount.current > loadedTilesCount.current;
  };

  const addLayer = (frame: any) => {
    if (!mapRef.current || !apiData) return;

    if (!radarLayersRef.current[frame.path]) {
      const colorScheme =
        options.kind === 'satellite'
          ? options.colorScheme === 255
            ? 255
            : 0
          : options.colorScheme;
      const smooth = options.kind === 'satellite' ? 0 : 1;
      const snow = options.kind === 'satellite' ? 0 : 1;

      const source = new L.TileLayer(
        `${apiData.host}${frame.path}/${options.tileSize}/{z}/{x}/{y}/${colorScheme}/${smooth}_${snow}.${options.extension}`,
        {
          tileSize: 256,
          opacity: 0.01,
          zIndex: frame.time,
        }
      );

      source.on('loading', startLoadingTile);
      source.on('load', finishLoadingTile);
      source.on('remove', finishLoadingTile);

      radarLayersRef.current[frame.path] = source;
    }
  };

  const changeRadarPosition = (
    position: number,
    preloadOnly: boolean = false,
    force: boolean = false
  ) => {
    if (!mapFrames.length || !mapRef.current) return;

    while (position >= mapFrames.length) {
      position -= mapFrames.length;
    }
    while (position < 0) {
      position += mapFrames.length;
    }

    const currentFrame = mapFrames[animationPosition];
    const nextFrame = mapFrames[position];

    // Remove all current layers first
    Object.entries(radarLayersRef.current).forEach(([path, layer]) => {
      if (mapRef.current?.hasLayer(layer)) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Add and setup the new layer
    addLayer(nextFrame);
    if (radarLayersRef.current[nextFrame.path]) {
      mapRef.current.addLayer(radarLayersRef.current[nextFrame.path]);
      radarLayersRef.current[nextFrame.path].setOpacity(100);
    }

    if ((!preloadOnly && !isTilesLoading()) || force) {
      const pastOrForecast =
        nextFrame.time > Date.now() / 1000 ? 'FORECAST' : 'PAST';
      onSetTimestamp(
        `${pastOrForecast}: ${new Date(nextFrame.time * 1000).toString()}`
      );
    }
  };

  useEffect(() => {
    // Clear existing layers when options change
    if (mapRef.current) {
      Object.values(radarLayersRef.current).forEach((layer) => {
        if (mapRef.current?.hasLayer(layer)) {
          mapRef.current.removeLayer(layer);
        }
      });
      radarLayersRef.current = {};
      loadingTilesCount.current = 0;
      loadedTilesCount.current = 0;

      if (mapFrames.length > 0) {
        changeRadarPosition(animationPosition, false, true);
      }
    }
  }, [options.kind, options.colorScheme, options.extension]);

  useEffect(() => {
    if (mapFrames.length > 0) {
      changeRadarPosition(animationPosition, false, true);
    }
  }, [animationPosition]);

  return (
    <div id='map' className='absolute top-[80px] left-0 right-0 bottom-0' />
  );
}
