export interface WeatherData {
  temperature: number;
  precipitation: number;
  cloudcover: number;
  time: string;
}

export interface City {
  name: string;
  coords: [number, number];
}
