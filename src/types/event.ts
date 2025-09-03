// /types/event.ts
import {
  Event as PrismaEvent,
  EventDay as PrismaEventDay,
} from "@prisma/client";

// API'de kullanılacak tip (date: string olacak)
export type EventDay = {
  id?: string;
  date: string; // ISO string
  startTime: string;
  endTime?: string;
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

// Prisma'dan gelen tip (date: Date objesi)
export type EventWithDays = PrismaEvent & {
  eventDays: PrismaEventDay[];
};

// ✅ Prisma tipini API tipine dönüştürme fonksiyonu
export function normalizeEvent(e: EventWithDays): Event {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    image: e.image,
    didItHappen: e.didItHappen ?? undefined,
    numberOfAttendees: e.numberOfAttendees ?? undefined,
    estimatedAttendees: e.estimatedAttendees ?? undefined,
    location: e.location,
    eventImages: Array.isArray(e.eventImages) ? e.eventImages : [],
    eventDays: e.eventDays.map((d) => ({
      id: d.id,
      date: d.date.toISOString(),
      startTime: d.startTime,
      endTime: d.endTime ?? undefined,
      details: d.details ?? undefined,
    })),
  };
}
