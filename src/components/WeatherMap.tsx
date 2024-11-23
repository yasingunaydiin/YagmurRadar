'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Cloud, CloudRain, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import Map from './Map';

const WeatherMap = () => {
  // State to track the current time offset for map animation (e.g., hour of the day).
  const [timeOffset, setTimeOffset] = useState(0);

  // State to control whether the animation is playing or paused.
  const [isPlaying, setIsPlaying] = useState(false);

  // State to manage the currently active layer ('clouds' or 'precipitation').
  const [activeLayer, setActiveLayer] = useState<'clouds' | 'precipitation'>(
    'precipitation'
  );

  // State to store the current timestamp for reference (default to the current time).
  const [timestamp, setTimestamp] = useState<number>(Date.now());

  // Effect to handle the animation logic when the play button is pressed.
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      // Increment the time offset every 2 seconds while playing.
      interval = setInterval(() => {
        setTimeOffset((prev) => {
          if (prev >= 24) {
            // Stop the animation if the time offset reaches its maximum.
            setIsPlaying(false);
            return 24;
          }
          return prev + 1; // Increment the time offset by 1.
        });
      }, 2000); // Animation interval set to 2 seconds.
    }

    return () => clearInterval(interval); // Clear the interval on cleanup or when `isPlaying` changes.
  }, [isPlaying]);

  // Function to handle changes to the time slider.
  const handleTimeChange = (value: number[]) => {
    setTimeOffset(value[0]); // Update the time offset to the slider's value.
    setIsPlaying(false); // Pause the animation when the slider is adjusted.
  };

  // Function to toggle play/pause animation state.
  const handlePlayPause = () => {
    if (timeOffset >= 24) {
      setTimeOffset(0); // Reset the time offset if it reaches the maximum.
    }
    setIsPlaying(!isPlaying); // Toggle the play/pause state.
  };

  return (
    <div className='h-screen w-full relative bg-background'>
      <Map
        timeOffset={timeOffset} // Pass the current time offset to the map.
        activeLayer={activeLayer} // Pass the active layer type ('clouds' or 'precipitation').
        apiData={undefined} // Placeholder for API data, currently undefined.
        mapFrames={[]} // Placeholder for map frames, currently empty.
        options={{
          kind: '', // Placeholder for map type, currently undefined.
          colorScheme: 0, // Placeholder for color scheme.
          tileSize: 0, // Placeholder for tile size.
          smoothData: 0, // Placeholder for data smoothing.
          snowColors: 0, // Placeholder for snow color visualization.
          extension: '', // Placeholder for tile format.
        }}
        animationPosition={0} // Placeholder for the current animation frame position.
        isPlaying={false} // Placeholder for animation play state.
        onSetTimestamp={setTimestamp} // Function to update the timestamp.
      />

      <Card className='fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl shadow-lg z-[9999]'>
        <CardContent className='p-4'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='icon' onClick={handlePlayPause}>
                {isPlaying ? (
                  <Pause className='h-4 w-4' /> // Show pause icon when playing.
                ) : (
                  <Play className='h-4 w-4' /> // Show play icon when paused.
                )}
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setTimeOffset(0)} // Reset the time offset to 0.
              >
                <RotateCcw className='h-4 w-4' />
              </Button>
            </div>

            <div className='w-full md:w-1/2'>
              <Slider
                min={0} // Minimum time offset value.
                max={24} // Maximum time offset value.
                step={1} // Increment step size.
                value={[timeOffset]} // Current value of the time offset.
                onValueChange={handleTimeChange} // Update time offset on slider change.
                className='w-full'
              />
            </div>

            <ToggleGroup
              type='single' // Allows only one active layer at a time.
              value={activeLayer} // Current active layer.
              onValueChange={
                (value) => setActiveLayer(value as 'clouds' | 'precipitation') // Update the active layer.
              }
            >
              <ToggleGroupItem value='clouds' aria-label='Toggle clouds'>
                <Cloud className='h-4 w-4' />
              </ToggleGroupItem>
              <ToggleGroupItem
                value='precipitation'
                aria-label='Toggle precipitation'
              >
                <CloudRain className='h-4 w-4' />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeatherMap;
