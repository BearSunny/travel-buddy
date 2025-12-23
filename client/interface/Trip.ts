import { Event } from "./TripEvent";

export interface Trip {
  trip_id: string,
  owner_id: string,
  title: string,
  description: string,
  start_date: Date,
  end_date: Date,
  completion_status?: 'planning' | 'in_progress' | 'completed' | 'cancelled',
  completion_percentage?: number,
  completed_at?: Date,
  completion_verified?: boolean,
  events: Event[],
}
