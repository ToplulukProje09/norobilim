// types/event.ts

export interface EventDay {
  _id: string;
  date: string | Date; // ✅ Hem string hem Date kabul et
  startTime: string;
  endTime?: string | null;
  details?: string | null;
  eventId?: string | null;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  image?: string | null;
  didItHappen: boolean;
  numberOfAttendees?: number | null;
  location: string;
  estimatedAttendees?: number | null;
  eventImages: string[];
  eventDays: EventDay[];
}
