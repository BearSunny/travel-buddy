export interface Event {
  id: string;
  trip_id: string;
  creator_id: string,
  title: string;
  description: string,
  start_time: Date,
  end_time: Date,
  address: string,
  city: string,
  country: string,
  status: string,
  cost: number;
  image: string;
  timeRange?: string;
  travelTime?: string;
  distance?: string;
}