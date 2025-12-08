interface Event {
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
  cost: string;
  image: string;
  timeRange?: string;
  travelTime?: string;
  distance?: string;
}
export interface Trip {
  trip_id: string,
  owner_id: string,
  title: string,
  description: string,
  start_date: Date,
  end_date: Date,
  events: Event[],
}
