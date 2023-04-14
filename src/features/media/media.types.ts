export interface CreateMediaRequestI {
  storeId: string;
  name: string;
  images: [string];
  wtRange: WeightRange;
  sC: string;
  gender: string;
  catalogId?: string;
  desc?: string;
}

export interface GetMediasQueryParamsI {
  pageSize?: string;
  page?: string;
  sortingPattern?: string;
  sC?: string;
  gender?: string;
  max?: string;
  min?: string;
}

export interface Catalog {
  id: string;
  name: string;
  desc: string;
  images: string[];
}

export interface Media {
  storeId: string;
  id: string;
  catalogId: string;
  name: string;
  desc: string;
  images: [string];
  wtRange: WeightRange;
  sC: string;
  gender: string;
  views: number;
  likes: number;
}

export interface WeightRange {
  max: number;
  min: number;
}

export interface GetMediaByIdQueryParamsI{
  mediaId: string;
}
