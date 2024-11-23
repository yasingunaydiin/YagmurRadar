'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Controls from './Controls';
import Timestamp from './Timestamp';

// Dynamically import the Map component, disabling server-side rendering (SSR)
// and showing a loading message while the map is being loaded.
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div>Harita yükleniyor...</div>,
});

export default function WeatherMapClient() {
  // State to track the current timestamp displayed on the map.
  const [timestamp, setTimestamp] = useState<number>(0);

  // State to store weather data fetched from the RainViewer API.
  const [apiData, setApiData] = useState<any>(null);

  // State to hold the sequence of map frames for animation.
  const [mapFrames, setMapFrames] = useState<any[]>([]);

  // State to track the current animation frame position.
  const [animationPosition, setAnimationPosition] = useState(0);

  // State to control whether the animation is playing or paused.
  const [isPlaying, setIsPlaying] = useState(false);

  // State to manage map visualization options (e.g., radar/satellite type, color scheme).
  const [options, setOptions] = useState({
    kind: 'radar', // Default to radar map.
    colorScheme: 2, // Default color scheme.
    tileSize: 256, // Tile size for map tiles.
    smoothData: 1, // Enable smoothing for radar data.
    snowColors: 1, // Enable snow color visualization.
    extension: 'webp', // Tile image format.
  });

  // Fetch weather map data from the RainViewer API when the component mounts.
  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((res) => res.json())
      .then((data) => {
        setApiData(data); // Store the fetched data.
        initialize(data, options.kind); // Initialize map frames based on data.
      });
  }, []);

  // Function to initialize map frames and set up animation based on map kind (radar or satellite).
  const initialize = (api: any, kind: string) => {
    if (!api) return;

    let frames = [];
    if (kind === 'satellite' && api.satellite?.infrared) {
      // Use infrared frames for satellite visualization.
      frames = api.satellite.infrared;
      const lastPastFrame = frames.length - 1;
      setAnimationPosition(lastPastFrame); // Set the animation to the last past frame.
    } else if (api.radar?.past) {
      // Use past radar frames, and append nowcast frames if available.
      frames = [...api.radar.past];
      if (api.radar.nowcast) {
        frames = frames.concat(api.radar.nowcast);
      }
      const lastPastFrame = api.radar.past.length - 1;
      setAnimationPosition(lastPastFrame); // Set the animation to the last past frame.
    }
    setMapFrames(frames); // Update the state with the new frames.
  };

  // Function to handle updates to map options, reinitializing map frames if necessary.
  const handleUpdateOptions = (newOptions: typeof options) => {
    setOptions(newOptions);
    if (apiData) {
      initialize(apiData, newOptions.kind);
    }
  };

  // Play/pause animation logic: advances animation frame at a regular interval when playing.
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isPlaying && mapFrames.length > 0) {
      intervalId = setInterval(() => {
        setAnimationPosition((prev) => {
          if (prev >= mapFrames.length - 1) return 0; // Loop back to the start.
          return prev + 1; // Advance to the next frame.
        });
      }, 1000); // Update frame every 1 second.
    }
    return () => clearInterval(intervalId); // Clear the interval when the component unmounts or `isPlaying` changes.
  }, [isPlaying, mapFrames.length]);

  return (
    <>
      <Controls
        options={options}
        onUpdateOptions={handleUpdateOptions}
        onPlayStop={() => setIsPlaying(!isPlaying)} // Toggle play/pause state.
        onPrevFrame={() => setAnimationPosition((prev) => prev - 1)} // Go to previous frame.
        onNextFrame={() => setAnimationPosition((prev) => prev + 1)} // Go to next frame.
        isPlaying={isPlaying} // Pass current play state to Controls.
      />

      <Timestamp timestamp={timestamp} />

      <Map
        apiData={apiData} // Pass weather API data.
        mapFrames={mapFrames} // Pass the frames for the animation.
        options={options} // Pass the visualization options.
        animationPosition={animationPosition} // Pass the current frame position.
        isPlaying={isPlaying} // Pass the play state.
        onSetTimestamp={setTimestamp} // Function to update the timestamp.
        timeOffset={0} // Unused but passed as a placeholder.
        activeLayer={'clouds'} // Unused but passed as a placeholder.
      />
    </>
  );
}
