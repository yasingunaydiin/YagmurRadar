'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Controls from './Controls';
import Timestamp from './Timestamp';

// Dynamically import the Map component with loading fallback
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div>Harita yükleniyor...</div>,
});

export default function WeatherMapClient() {
  const [timestamp, setTimestamp] = useState(0); // Current timestamp
  const [apiData, setApiData] = useState(null); // Weather data
  const [mapFrames, setMapFrames] = useState<any[]>([]); // Animation frames
  const [animationPosition, setAnimationPosition] = useState(0); // Frame position
  const [isPlaying, setIsPlaying] = useState(false); // Play/pause state

  const [options, setOptions] = useState({
    kind: 'radar',
    colorScheme: 2,
    tileSize: 256,
    smoothData: 1,
    snowColors: 1,
    extension: 'webp',
  });

  // Fetch weather map data
  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((res) => res.json())
      .then((data) => {
        setApiData(data);
        initializeFrames(data, options.kind);
      });
  }, []);

  // Initialize animation frames
  const initializeFrames = (api: any, kind: string) => {
    if (!api) return;

    const frames =
      kind === 'satellite' && api.satellite?.infrared
        ? api.satellite.infrared
        : [...(api.radar?.past || []), ...(api.radar?.nowcast || [])];

    setMapFrames(frames);
    setAnimationPosition((api.radar?.past?.length || frames.length) - 1);
  };

  // Update options and reinitialize frames
  const updateOptions = (newOptions: typeof options) => {
    setOptions(newOptions);
    apiData && initializeFrames(apiData, newOptions.kind);
  };

  // Animation logic
  useEffect(() => {
    if (!isPlaying || mapFrames.length === 0) return;

    const intervalId = setInterval(() => {
      setAnimationPosition((prev) =>
        prev >= mapFrames.length - 1 ? 0 : prev + 1
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPlaying, mapFrames]);

  return (
    <>
      <Controls
        options={options}
        onUpdateOptions={updateOptions}
        onPlayStop={() => setIsPlaying(!isPlaying)}
        onPrevFrame={() =>
          setAnimationPosition((prev) => Math.max(prev - 1, 0))
        }
        onNextFrame={() =>
          setAnimationPosition((prev) =>
            Math.min(prev + 1, mapFrames.length - 1)
          )
        }
        isPlaying={isPlaying}
      />
      <Timestamp timestamp={timestamp} />
      <Map
        apiData={apiData}
        mapFrames={mapFrames}
        options={options}
        animationPosition={animationPosition}
        isPlaying={isPlaying}
        onSetTimestamp={setTimestamp}
        timeOffset={0}
        activeLayer={'clouds'}
      />
    </>
  );
}
