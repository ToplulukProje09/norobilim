import { ObjectId } from "mongodb";

/* MongoDB'deki raw document tipi */
export interface AcademicDoc {
  _id: ObjectId;
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
  _id: string; // ObjectId string'e çevrilmiş
  title: string;
  description?: string; // opsiyonel ama null yerine string | undefined
  links: string[];
  files: string[];
  tags: string[];
  published: boolean;
  createdAt: Date; // ✅ senin istediğin gibi Date
  updatedAt?: Date; // ✅ varsa Date
}

/* API Response tipleri */
export interface AcademicApiResponse {
  data: Academic;
}

export interface AcademicsApiResponse {
  data: Academic[];
}
