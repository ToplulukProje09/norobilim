// types/db.ts

export interface Post {
  _id: string;
  title: string;
  description: string;
  paragraph?: string;
  shortText?: string;
  mainPhoto: string;
  images: string[];
  comments: Comment[];
  show: boolean;
  commentsAllowed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  text: string;
  createdAt: Date;
}

export interface Yasak {
  _id: string;
  wrongWords: string[];
}

export interface Person {
  _id: string;
  name: string;
  class?: string;
  department?: string;
  photo?: string;
  roles: Role[];
  socialMedia?: Record<string, any>;
}

export interface Role {
  _id: string;
  title: string;
  organization: string;
  startDate?: Date;
  endDate?: Date;
  personId: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  image?: string | null; // ✅ null eklendi
  didItHappen: boolean;
  numberOfAttendees?: number | null; // ✅ null eklendi
  location: string;
  estimatedAttendees?: number | null; // ✅ null eklendi
  eventImages: string[];
  eventDays: EventDay[];
}

export interface EventDay {
  _id: string;
  date: string | Date; // ✅ string de kabul et
  startTime: string;
  endTime?: string | null;
  details?: string | null;
  eventId?: string | null;
}

export interface Podcast {
  _id: string;
  title: string;
  description?: string;
  audioUrl: string;
  coverImage?: string;
  duration?: number;
  speakers: string[];
  seriesTitle?: string;
  episodeNumber?: number;
  releaseDate: Date;
  tags: string[];
  isPublished: boolean;
  listens: number;
}

export interface Academic {
  _id: string;
  title: string;
  description?: string;
  links: string[];
  files: string[];
  tags: string[];
  published: boolean;
  createdAt: Date;
}

export interface MainMenu {
  _id: string;
  titlePrimary: string;
  titleSecondary: string;
  mainLogo: string;
  mainPhoto?: string;
  aboutParagraph: string;
  mainParagraph: string;
  socialLinks: string[];
  email: string;
}

export interface Auth {
  _id: string;
  username: string;
  password: string;
}
