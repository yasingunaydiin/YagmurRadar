'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Cloud, CloudRain, Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import Map from './Map';

const WeatherMap = () => {
  const [timeOffset, setTimeOffset] = useState(0); // Tracks animation time offset.
  const [isPlaying, setIsPlaying] = useState(false); // Controls play/pause state.
  const [activeLayer, setActiveLayer] = useState<'clouds' | 'precipitation'>(
    'precipitation'
  );

  // Handles animation logic for play/pause functionality.
  useEffect(() => {
    if (!isPlaying) return; // Do nothing if not playing.

    const interval = setInterval(() => {
      setTimeOffset((prev) => {
        if (prev >= 24) {
          setIsPlaying(false); // Stop animation when max offset is reached.
          return 24;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(interval); // Cleanup interval on component unmount or state change.
  }, [isPlaying]);

  // Reset animation to the beginning.
  const resetAnimation = () => {
    setTimeOffset(0);
    setIsPlaying(false);
  };

  // Toggles play/pause state and resets if animation is complete.
  const togglePlayPause = () => {
    if (timeOffset >= 24) resetAnimation();
    else setIsPlaying(!isPlaying);
  };

  return (
    <div className='h-screen w-full relative bg-background'>
      {/* Weather Map */}
      <Map
        timeOffset={timeOffset}
        activeLayer={activeLayer}
        apiData={undefined} // Placeholder for actual API data.
        mapFrames={[]} // Placeholder for map frames.
        options={{
          kind: '',
          colorScheme: 0,
          tileSize: 0,
          smoothData: 0,
          snowColors: 0,
          extension: '',
        }}
        animationPosition={0}
        isPlaying={false}
        onSetTimestamp={setTimeOffset}
      />

      {/* Controls */}
      <Card className='fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl shadow-lg z-[9999]'>
        <CardContent className='p-4'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
            {/* Play/Pause & Reset Buttons */}
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='icon' onClick={togglePlayPause}>
                {isPlaying ? (
                  <Pause className='h-4 w-4' />
                ) : (
                  <Play className='h-4 w-4' />
                )}
              </Button>
              <Button variant='outline' size='icon' onClick={resetAnimation}>
                <RotateCcw className='h-4 w-4' />
              </Button>
            </div>

            {/* Time Slider */}
            <Slider
              min={0}
              max={24}
              step={1}
              value={[timeOffset]}
              onValueChange={(value) => {
                setTimeOffset(value[0]);
                setIsPlaying(false); // Pause animation when slider is adjusted.
              }}
              className='w-full md:w-1/2'
            />

            {/* Layer Toggle */}
            <ToggleGroup
              type='single'
              value={activeLayer}
              onValueChange={(value) =>
                setActiveLayer(value as 'clouds' | 'precipitation')
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
