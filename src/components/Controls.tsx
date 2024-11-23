'use client';

interface ControlsProps {
  options: any;
  onUpdateOptions: (options: any) => void;
  onPlayStop: () => void;
  onPrevFrame: () => void;
  onNextFrame: () => void;
  isPlaying: boolean;
}

export default function Controls({
  options,
  onUpdateOptions,
  onPlayStop,
  onPrevFrame,
  onNextFrame,
  isPlaying,
}: ControlsProps) {
  return (
    <ul className='absolute top-0 left-0 right-0 h-[50px] text-center z-10 p-2'>
      <li className='inline-block mr-4'>
        <input
          type='radio'
          name='kind'
          checked={options.kind === 'radar'}
          onChange={() => onUpdateOptions({ ...options, kind: 'radar' })}
        />
        <span className='mx-1'>Radar (Past + Future)</span>
        <input
          type='radio'
          name='kind'
          checked={options.kind === 'satellite'}
          onChange={() => onUpdateOptions({ ...options, kind: 'satellite' })}
        />
        <span className='ml-1'>Infrared Satellite</span>
      </li>

      <li className='inline-block mx-1'>
        <input
          type='button'
          value='<'
          onClick={onPrevFrame}
          className='px-3 py-1 border border-gray-300 rounded'
        />
      </li>
      <li className='inline-block mx-1'>
        <input
          type='button'
          value='Play / Stop'
          onClick={onPlayStop}
          className='px-3 py-1 border border-gray-300 rounded'
        />
      </li>
      <li className='inline-block mx-1'>
        <input
          type='button'
          value='>'
          onClick={onNextFrame}
          className='px-3 py-1 border border-gray-300 rounded'
        />
      </li>
    </ul>
  );
}
