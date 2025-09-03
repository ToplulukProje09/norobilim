// types/event.ts

export interface EventDay {
  id: string;
  date: string | Date; // ✅ Hem string hem Date kabul et
  startTime: string;
  endTime?: string | null;
  details?: string | null;
  eventId?: string | null;
}

export interface Event {
  id: string;
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

// ✅ API Response için type
export interface EventApiResponse {
  events: Event[];
  total: number;
  success: boolean;
  message?: string;
}

// ✅ Prisma model types
export interface PrismaEvent {
  id: string;
  title: string;
  description: string;
  image: string | null;
  didItHappen: boolean;
  numberOfAttendees: number | null;
  location: string;
  estimatedAttendees: number | null;
  eventImages: string[];
  eventDays: PrismaEventDay[];
}

export interface PrismaEventDay {
  id: string;
  date: Date;
  startTime: string;
  endTime: string | null;
  details: string | null;
  eventId: string | null;
}
