import Icons from '@/components/Icons';
import UserLocation from '@/components/UserLocation';
import WeatherMapClient from '@/components/WeatherMapClient';

export default function Home() {
  return (
    <main className='relative h-screen w-full'>
      <Icons />
      <UserLocation>
        <WeatherMapClient />
      </UserLocation>
    </main>
  );
}
