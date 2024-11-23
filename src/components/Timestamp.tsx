'use client';

import { Card } from '@/components/ui/card';

interface TimestampProps {
  timestamp: number;
}

export default function Timestamp({ timestamp }: TimestampProps) {
  const pastOrForecast = timestamp > Date.now() ? 'TAHMİN' : 'GEÇMİŞ';

  const formattedDate = new Date(timestamp).toLocaleString('tr-TR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className='fixed top-4 left-1/2 transform -translate-x-1/2 z-40'>
      <Card className='bg-background/80 backdrop-blur-lg border border-border shadow-lg'>
        <div className='px-4 py-2'>
          <span className='text-sm font-medium'>
            {`${pastOrForecast}: ${formattedDate}`}
          </span>
        </div>
      </Card>
    </div>
  );
}
