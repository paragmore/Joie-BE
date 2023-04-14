import { FastifyInstance } from "fastify";
import { ApiHelper } from "../../helpers/ApiHelper";
import { MediaController } from "./media.controller";
import {
  CreateMediaRequestI,
  GetMediaByIdQueryParamsI,
  GetMediasQueryParamsI,
} from "./media.types";
const { string } = require("joi");

export default async (app: FastifyInstance) => {
  const mediaController = new MediaController();

  ApiHelper.get<{}, GetMediaByIdQueryParamsI, {}>(
    app,
    "/single/:mediaId",
    mediaController.getMediaById
  );
  ApiHelper.get<GetMediasQueryParamsI, { storeId: string }, {}>(
    app,
    "/:storeId",
    mediaController.getAllStoreMedias
  );
  ApiHelper.post<CreateMediaRequestI, {}, {}, {}>(
    app,
    "/",
    mediaController.createMedia
  );
};
