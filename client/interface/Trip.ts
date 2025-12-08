import { Event } from "./TripEvent";

export interface Trip {
  trip_id: string,
  owner_id: string,
  title: string,
  description: string,
  start_date: Date,
  end_date: Date,
  events: Event[],
}
