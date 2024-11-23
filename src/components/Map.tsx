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
// Defines the structure of the props required by the `Map` component.

const Map: FC<MapProps> = ({
  apiData,
  mapFrames,
  options,
  animationPosition,
  onSetTimestamp,
}) => {
  // Defines the `Map` functional component using the `MapProps` type.

  const mapRef = useRef<L.Map | null>(null);
  // Reference to the Leaflet map instance.

  const radarLayersRef = useRef<{ [key: string]: L.TileLayer }>({});
  // Keeps track of radar tile layers added to the map.

  const loadingTilesCount = useRef(0);
  const loadedTilesCount = useRef(0);
  // Tracks the number of tiles loading and loaded, respectively.

  useEffect(() => {
    // Initializes the Leaflet map when the component is first rendered.
    if (!mapRef.current) {
      mapRef.current = L.map('map', {
        center: [41.0082, 28.9784], // Center coordinates for Istanbul, Turkey.
        zoom: 7, // Initial zoom level.
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    return () => {
      // Cleans up by removing the map when the component unmounts.
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const startLoadingTile = () => {
    // Increments the count of tiles currently loading.
    loadingTilesCount.current++;
  };

  const finishLoadingTile = () => {
    // Delays incrementing the count of tiles loaded to improve UI performance.
    setTimeout(() => {
      loadedTilesCount.current++;
    }, 250);
  };

  const isTilesLoading = () => {
    // Returns true if there are tiles still loading.
    return loadingTilesCount.current > loadedTilesCount.current;
  };

  const addLayer = (frame: any) => {
    // Adds a radar layer to the map based on the frame information.
    if (!mapRef.current || !apiData) return;

    if (!radarLayersRef.current[frame.path]) {
      const colorScheme =
        options.kind === 'satellite'
          ? options.colorScheme === 255
            ? 255
            : 0
          : options.colorScheme; // Determines the color scheme based on the layer type.
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
      // Creates a new tile layer with properties for rendering the radar data.

      source.on('loading', startLoadingTile);
      source.on('load', finishLoadingTile);
      source.on('remove', finishLoadingTile);
      // Attaches event listeners for tile loading progress.

      radarLayersRef.current[frame.path] = source;
    }
  };

  const changeRadarPosition = (
    position: number,
    preloadOnly: boolean = false,
    force: boolean = false
  ) => {
    // Changes the radar's display position to a specified frame.

    if (!mapFrames.length || !mapRef.current) return;

    while (position >= mapFrames.length) {
      position -= mapFrames.length; // Loops the position if it exceeds the number of frames.
    }
    while (position < 0) {
      position += mapFrames.length; // Loops the position for negative values.
    }

    const currentFrame = mapFrames[animationPosition];
    const nextFrame = mapFrames[position];

    // Removes all existing layers.
    Object.entries(radarLayersRef.current).forEach(([path, layer]) => {
      if (mapRef.current?.hasLayer(layer)) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Adds the new layer and sets its opacity.
    addLayer(nextFrame);
    if (radarLayersRef.current[nextFrame.path]) {
      mapRef.current.addLayer(radarLayersRef.current[nextFrame.path]);
      radarLayersRef.current[nextFrame.path].setOpacity(100);
    }

    if ((!preloadOnly && !isTilesLoading()) || force) {
      // Updates the timestamp for the new frame if tiles are ready or forced.
      const timestamp = Number(nextFrame.time) * 1000;

      onSetTimestamp(timestamp); // Passes the timestamp to the parent component.
    }
  };

  useEffect(() => {
    // Updates layers when options such as kind or colorScheme change.
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
    // Updates the radar position when the animation position changes.
    if (mapFrames.length > 0) {
      changeRadarPosition(animationPosition, false, true);
    }
  }, [animationPosition]);

  return <div id='map' className='absolute left-0 right-0 bottom-0' />;
  // Renders a container for the map that fills the viewport.
};

export default Map;
