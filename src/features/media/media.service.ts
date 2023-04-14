import { MediaRepo } from "./media.repo";
import { AdminService } from "../../utils/admin.service";
import { ApiError } from "../../utils/utils";
import fastify from "fastify";
import { CreateMediaRequestI, WeightRange } from "./media.types";
import slugify from "slugify";

export class MediaService {
  mediaRepo: MediaRepo;

  constructor() {
    this.mediaRepo = new MediaRepo();
  }

  async getAllStoreMedias(
    storeId: string,
    page: number,
    pageSize: number,
    sortingPattern: string,
    sC?: string,
    gender?: string,
    max?: number,
    min?: number
  ) {
    try {
      return await this.mediaRepo.getAllStoreMedias(
        storeId,
        page,
        pageSize,
        sortingPattern,
        sC,
        gender,
        max,
        min
      );
    } catch (error) {
      console.log("getAllStoreMedias service", error);
      return new ApiError("Something went wrong, Please try again", 500);
    }
  }

  async createMedia(media: CreateMediaRequestI) {
    try {
      const { name } = media;
      //convert the name to a unique slug
      let slug = slugify(name, { lower: true });
      const mediaWithSameSlug = await this.mediaRepo.getMediaById(slug);
      if (mediaWithSameSlug) {
        //append timestamp to make it unique
        slug = `${slug}-${new Date().getTime()}`;
      }
      await this.mediaRepo.createMedia(slug, media);
      return { id: slug, ...media };
    } catch (error) {
      fastify().log.error("getAllStoreMedias service", error);
      return new ApiError("Something went wrong, Please try again", 500);
    }
  }

  async getMediaById(mediaId: string) {
    try {
      return await this.mediaRepo.getMediaById(mediaId);
    } catch (error) {
      console.log("getMediaById service", error);
      return new ApiError("Something went wrong, Please try again", 500);
    }
  }
}
