// /types/event.ts

export type EventDay = {
  id?: string;
  date: string; // ISO string (API'den string gelecek)
  startTime: string; // "HH:mm"
  endTime?: string; // "HH:mm"
  details?: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  didItHappen?: boolean;
  numberOfAttendees?: number | null;
  estimatedAttendees?: number | null;
  location: string;
  eventImages?: string[];
  eventDays: EventDay[];
};
