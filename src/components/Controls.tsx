'use client';

import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ChevronLeftIcon, DraftingCompass } from 'lucide-react';
import { useState } from 'react';
import { WeatherLegend } from './WeatherLegend';

const colorSchemes = [
  { value: 1, label: 'Orijinal' },
  { value: 2, label: 'Evrensel Mavi' },
  { value: 3, label: 'TITAN' },
  { value: 4, label: 'The Weather Channel' },
  { value: 5, label: 'NEXRAD Level-III' },
  { value: 6, label: 'Dark Sky' },
];

// Define the type of props that the Controls component will receive
interface ControlsProps {
  options: {
    kind: string; // Type of display (e.g., radar or satellite)
    colorScheme: number; // Selected color scheme
  };
  onUpdateOptions: (options: any) => void; // Callback to update options
  onPlayStop: () => void; // Callback to toggle play/pause
  onPrevFrame: () => void; // Callback for previous frame
  onNextFrame: () => void; // Callback for next frame
  isPlaying: boolean; // Boolean to track whether the animation is playing
}

export default function Controls({
  options,
  onUpdateOptions,
  onPlayStop,
  onPrevFrame,
  onNextFrame,
  isPlaying,
}: ControlsProps) {
  const [open, setOpen] = useState(false); // Local state for opening the weather legend

  const colorMapping: Record<
    // Mapping of color schemes to their corresponding weather conditions and colors
    string,
    Array<{ color: string; label: string }>
  > = {
    '1': [
      // Orjinal
      { color: '#D1D5DB', label: 'Bulutlu' },
      { color: '#BBF7D0', label: 'Çiseleme' },
      { color: '#6EE7B7', label: 'Hafif yağmur' },
      { color: '#3B82F6', label: 'Orta yağmur' },
      { color: '#F9A8D4', label: 'Yoğun yağmur' },
      { color: '#DC2626', label: 'Dolu' },
      { color: '#7fefff', label: 'Hafif Kar' },
      { color: '#5fcfff', label: 'Orta Kar' },
      { color: '#3f9fff', label: 'Yoğun Kar' },
    ],
    '2': [
      // Evrensel Mavi
      { color: '#cfbf87', label: 'Bulutlu' },
      { color: '#88ddef', label: 'Çiseleme' },
      { color: '#0277aa', label: 'Hafif yağmur' },
      { color: '#ffee00', label: 'Orta yağmur' },
      { color: '#ff4400', label: 'Yoğun yağmur' },
      { color: '#ffaaff', label: 'Dolu' },
      { color: '#a0dfff', label: 'Hafif Kar' },
      { color: '#5f9fff', label: 'Orta Kar' },
      { color: '#3e80ff', label: 'Yoğun Kar' },
    ],
    '3': [
      // TITAN
      { color: '#077fdb', label: 'Bulutlu' },
      { color: '#1d47e8', label: 'Çiseleme' },
      { color: '#c81086', label: 'Hafif yağmur' },
      { color: '#d2883b', label: 'Orta yağmur' },
      { color: '#fffb00', label: 'Yoğun yağmur' },
      { color: '#fd5f03', label: 'Dolu' },
      { color: '#a0dfff', label: 'Hafif Kar' },
      { color: '#5f9fff', label: 'Orta Kar' },
      { color: '#3e80ff', label: 'Yoğun Kar' },
    ],
    '4': [
      // The Weather Channel
      { color: '#63eb62', label: 'Bulutlu' },
      { color: '#3dc63d', label: 'Çiseleme' },
      { color: '#106719', label: 'Hafif yağmur' },
      { color: '#ffff00', label: 'Orta yağmur' },
      { color: '#e60001', label: 'Yoğun yağmur' },
      { color: '#9b0000', label: 'Dolu' },
      { color: '#a0dfff', label: 'Hafif Kar' },
      { color: '#5f9fff', label: 'Orta Kar' },
      { color: '#3e80ff', label: 'Yoğun Kar' },
    ],
    '5': [
      // NEXRAD Level-III
      { color: '#01efe7', label: 'Bulutlu' },
      { color: '#0000f7', label: 'Çiseleme' },
      { color: '#02b706', label: 'Hafif yağmur' },
      { color: '#02b706', label: 'Orta yağmur' },
      { color: '#fe9301', label: 'Yoğun yağmur' },
      { color: '#bd0000', label: 'Dolu' },
      { color: '#51cffd', label: 'Hafif Kar' },
      { color: '#1075fb', label: 'Orta Kar' },
      { color: '#103ffb', label: 'Yoğun Kar' },
    ],
    '6': [
      // Dark Sky
      { color: '#015eb6', label: 'Bulutlu' },
      { color: '#015eb6', label: 'Çiseleme' },
      { color: '#2458af', label: 'Hafif yağmur' },
      { color: '#fc5470', label: 'Orta yağmur' },
      { color: '#fffd02', label: 'Yoğun yağmur' },
      { color: '#fffd02', label: 'Dolu' },
      { color: '#a0dfff', label: 'Hafif Kar' },
      { color: '#5f9fff', label: 'Orta Kar' },
      { color: '#3e80ff', label: 'Yoğun Kar' },
    ],
  };

  // Get the current legend colors based on options.colorScheme
  const legendColors = colorMapping[options.colorScheme] || [];

  return (
    <div className='fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50'>
      <div className='bg-background/80 backdrop-blur-lg rounded-xl sm:rounded-xl border border-border shadow-lg p-2 px-4'>
        <div className='flex flex-col sm:flex-row items-center gap-4'>
          <div className='flex items-center gap-4 w-full sm:w-auto'>
            <Button
              className='h-8 w-8'
              size='icon'
              onClick={() => setOpen(true)}
              variant='ghost'
            >
              <DraftingCompass className='h-4 w-4' />
            </Button>

            <WeatherLegend
              open={open}
              onOpenChange={setOpen}
              legendColors={legendColors}
            />

            <RadioGroup
              defaultValue={options.kind}
              onValueChange={(value) =>
                onUpdateOptions({ ...options, kind: value })
              }
              className='flex items-center'
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='radar' id='radar' />
                <label htmlFor='radar' className='text-sm'>
                  Radar
                </label>
              </div>
              <div className='flex items-center space-x-2 ml-4'>
                <RadioGroupItem value='satellite' id='satellite' />
                <label htmlFor='satellite' className='text-sm'>
                  Uydu
                </label>
              </div>
            </RadioGroup>

            <Separator orientation='vertical' className='h-6 hidden sm:block' />

            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={onPrevFrame}
                className='h-8 w-8'
              >
                <ChevronLeftIcon className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={onPlayStop}
                className='h-8 w-8'
              >
                {isPlaying ? (
                  <PauseIcon className='h-4 w-4' />
                ) : (
                  <PlayIcon className='h-4 w-4' />
                )}
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={onNextFrame}
                className='h-8 w-8'
              >
                <ChevronRightIcon className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <Separator
            orientation='horizontal'
            className='w-full block sm:hidden'
          />

          {/* Updated Select for Color Scheme */}
          <Select
            value={options.colorScheme.toString()}
            onValueChange={(value) => {
              onUpdateOptions({ ...options, colorScheme: Number(value) });
            }}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Renk şeması seçin' />
            </SelectTrigger>
            <SelectContent>
              {colorSchemes.map((scheme) => (
                <SelectItem key={scheme.value} value={scheme.value.toString()}>
                  {scheme.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// Icons

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path d='m9 18 6-6-6-6' />
    </svg>
  );
}

function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <polygon points='5 3 19 12 5 21 5 3' />
    </svg>
  );
}

function PauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <rect width='4' height='16' x='6' y='4' />
      <rect width='4' height='16' x='14' y='4' />
    </svg>
  );
}
