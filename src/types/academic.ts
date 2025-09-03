export interface Academic {
  id: string;
  title: string;
  description: string | null;
  links: string[];
  files: string[];
  tags: string[];
  published: boolean;
  createdAt: string; // ISO
  updatedAt?: string;
}

export interface AcademicApiResponse {
  data: Academic;
}

export interface AcademicsApiResponse {
  data: Academic[];
}
