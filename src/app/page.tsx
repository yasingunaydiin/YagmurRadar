// This is a server component
import WeatherMapClient from '@/components/WeatherMapClient';

export default function Home() {
  return (
    <main className='relative h-screen w-full'>
      <WeatherMapClient />
    </main>
  );
}
