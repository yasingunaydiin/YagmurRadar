'use client';

import { useState } from 'react';
import Map from './Map';

const WeatherMap = () => {
  const [timeOffset, setTimeOffset] = useState(0); // Tracks animation time offset.

  return (
    <div className='h-screen w-full relative bg-background'>
      {/* Weather Map */}
      <Map
        timeOffset={timeOffset}
        // activeLayer={activeLayer}
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
    </div>
  );
};

export default WeatherMap;
