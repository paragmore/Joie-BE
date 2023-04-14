import { FastifyInstance } from "fastify";
import { ApiHelper } from "./../../helpers/ApiHelper"
import { StoreController } from "./store.controller";
import { CreateStoreByPhoneRequest } from "./store.types";

export default async (app: FastifyInstance) => {
    const storeController = new StoreController();

  ApiHelper.get<{ body: string }, {}, {}>(app, "/", storeController.getStoreByPhone);
  ApiHelper.post<CreateStoreByPhoneRequest,{},{},{}>(app, "/", storeController.createStoreByPhone)
};
