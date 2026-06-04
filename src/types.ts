export interface Chapter {
  id: string;
  number: number;
  title: string;
  pages: string[];
  releaseDate: string;
}

export interface Comic {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  tagline: string;
  episodeCount: number;
  status: 'Үргэлжилж буй' | 'Дууссан' | 'Ongoing' | 'Completed';
  category: string;
  author: string;
  chapters: Chapter[];
}
