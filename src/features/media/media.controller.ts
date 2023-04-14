import { ApiError } from "../../utils/utils";
import { ApiHelper, ApiHelperHandler, IReply } from "../../helpers/ApiHelper";
import { MediaService } from "./media.service";
import {
  CreateMediaRequestI,
  GetMediaByIdQueryParamsI,
  GetMediasQueryParamsI,
  WeightRange,
} from "./media.types";

export class MediaController {
  mediaService: MediaService;
  init() {
    this.mediaService = new MediaService();
  }
  createMedia: ApiHelperHandler<CreateMediaRequestI, {}, {}, {}, IReply> =
    async (request, reply) => {
      this.init();
      console.log("here");
      const { body } = request;
      if (
        !body?.storeId ||
        !body.gender ||
        !body.images ||
        !body.name ||
        !body.sC ||
        !body.wtRange
      ) {
        return ApiHelper.missingParameters(reply);
      }
      try {
        const response = await this.mediaService.createMedia(body);
        console.log(response);
        if (response instanceof ApiError) {
          ApiHelper.callFailed(reply, response.message, response.code);
        }
        ApiHelper.success(reply, response);
      } catch (error) {
        ApiHelper.callFailed(reply, undefined, 500);
      }
    };

  getAllStoreMedias: ApiHelperHandler<
    {},
    GetMediasQueryParamsI,
    {},
    { storeId: string },
    IReply
  > = async (request, reply) => {
    this.init();
    const { query, params } = request;
    const pageSize = (query.pageSize && parseInt(query.pageSize)) || 10;
    const page = (query.page && parseInt(query.page)) || 1;
    const nextPage = page + 1;
    const previousPage = page - 1;
    const sortingPattern = query.sortingPattern || "asc";
    const { sC, gender, max, min } = query;
    const mediasResponse = await this.mediaService.getAllStoreMedias(
      params.storeId,
      page,
      pageSize,
      sortingPattern,
      sC,
      gender,
      max ? parseInt(max) : undefined,
      min ? parseInt(min) : undefined
    );
    if (mediasResponse instanceof ApiError) {
      ApiHelper.callFailed(
        reply,
        mediasResponse.message,
        mediasResponse.code
      );
      return;
    }
    const response = {
      medias: mediasResponse.medias,
      pagination: {
        pageSize,
        page,
        nextPage,
        previousPage,
        totalPages: Math.ceil(mediasResponse.size / pageSize),
        totalResults: mediasResponse.size,
      },
    };
    ApiHelper.success(reply, response);
  };

  getMediaById: ApiHelperHandler<
    {},
    {},
    {},
    GetMediaByIdQueryParamsI,
    IReply
  > = async (request, reply) => {
    this.init();
    const { params } = request;
    if (!params.mediaId) {
      ApiHelper.missingParameters(reply);
    }
    const { mediaId } = params;
    const mediaResponse = await this.mediaService.getMediaById(mediaId);

    if (mediaResponse instanceof ApiError) {
      ApiHelper.callFailed(
        reply,
        mediaResponse.message,
        mediaResponse.code
      );
      return;
    }

    ApiHelper.success(reply, mediaResponse);
  };
}
