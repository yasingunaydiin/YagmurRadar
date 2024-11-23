'use client';

export default function Timestamp({ text }: { text: string }) {
  return (
    <div className='absolute top-[50px] left-0 right-0 h-[30px] text-center'>
      {text}
    </div>
  );
}
