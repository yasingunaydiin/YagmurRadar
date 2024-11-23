'use client';

export default function Timestamp({ text }: { text: string }) {
  return (
    <div className='fixed top-8 left-1/2 transform -translate-x-1/2 z-50'>
      <div className='bg-background/80 backdrop-blur-lg rounded-full border border-border shadow-lg px-4 py-2'>
        <span className='text-sm font-medium'>{text}</span>
      </div>
    </div>
  );
}
