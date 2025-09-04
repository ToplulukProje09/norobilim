import { ObjectId } from "mongodb";

/* MongoDB'deki raw document tipi */
export interface AcademicDoc {
  _id: ObjectId; // ObjectId olarak saklanır
  title: string;
  description?: string | null;
  links?: string[];
  files?: string[];
  tags?: string[];
  published?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

/* API üzerinden frontend'e gönderilen tip */
export interface Academic {
  id: string; // _id string'e çevrilmiş
  title: string;
  description: string | null;
  links: string[];
  files: string[];
  tags: string[];
  published: boolean;
  createdAt: string; // ISO string
  updatedAt?: string;
}

/* API Response tipleri */
export interface AcademicApiResponse {
  data: Academic;
}

export interface AcademicsApiResponse {
  data: Academic[];
}
