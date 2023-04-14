import { ApiError } from "../../utils/utils";
import { ApiHelper, ApiHelperHandler, IReply } from "./../../helpers/ApiHelper";
import { StoreService } from "./store.service";
import { CreateStoreByPhoneRequest } from "./store.types";

export class StoreController {
  storeService: StoreService;
  init() {
    this.storeService = new StoreService();
  }
  createStoreByPhone: ApiHelperHandler<
    CreateStoreByPhoneRequest,
    {},
    {},
    {},
    IReply
  > = async (request, reply) => {
    this.init();
    console.log('here')
    const body = request.body;
    if (!body?.phoneNumber) {
      return ApiHelper.missingParameters(reply);
    }
    try {
      const response = await this.storeService.createStoreByPhone(
        body.phoneNumber
      );
      console.log(response)
      if (response instanceof ApiError) {
        ApiHelper.callFailed(reply,response.message, response.code);
      }
      ApiHelper.success(reply,response);
    } catch (error) {
      ApiHelper.callFailed(reply,undefined, 500)
    }
  };

  getStoreByPhone: ApiHelperHandler<{}, {}, {}, {}, IReply> = async (
    request,
    reply
  ) => {
    request.body;
  };
}
