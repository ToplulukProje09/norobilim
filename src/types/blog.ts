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
