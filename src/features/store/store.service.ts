import { StoreRepo } from "./store.repo";
import { AdminService } from "../../utils/admin.service";
import { ApiError } from "../../utils/utils";

export class StoreService {
  storeRepo: StoreRepo;
  // customerService: CustomerService;
  // orderRepo: OrdersRepo;
  constructor() {
    this.storeRepo = new StoreRepo();
    // this.customerService = new CustomerService();
    // this.orderRepo = new OrdersRepo();
  }

  // async addCustomer(requestBody: any) {
  //   const storeId = requestBody.storeId;
  //   const customerPhone = requestBody.customerPhone;
  //   const customerName = requestBody.customerName;

  //   if (!storeId || !customerName || !customerPhone) {
  //     return "invalid";
  //   }

  //   if (!this.customerService.validatePhoneNumber(customerPhone)) {
  //     return "invalid";
  //   }

  //   return "success";
  // }

  // async linkUsername(
  //   storeId: string,
  //   usernameToLink: string
  // ): Promise<boolean> {
  //   const usernameRepo = new UsernameRepo();
  //   const previousLinkStoreId = await usernameRepo.fetchStoreId(usernameToLink);
  //   if (previousLinkStoreId && previousLinkStoreId !== storeId) {
  //     return false;
  //   }

  //   const storeRtRepo = new StoreRtRepo();
  //   await storeRtRepo.linkExtraUsername(storeId, usernameToLink);
  //   return true;
  // }

  // async updateStoreLinkSlugs(
  //   storeId: string,
  //   newUsername: string
  // ): Promise<string> {
  //   const storeRepo = new MetaRepo();
  //   const meta = await storeRepo.get(storeId);
  //   if (!meta) {
  //     return `Invalid storeId: ${storeId}`;
  //   }

  //   // check if already taken then expire for that store
  //   await this.storeRepo.checkStoreLinkSlugTaken(storeId, newUsername);

  //   const oldUsername = meta.username || "";
  //   if (!oldUsername) {
  //     return "skipped";
  //   }

  //   // invalidChars: rtdb Keys can't contain ".", "#", "$", "/", "[", or "]"
  //   const invalidChars = [".", "#", "$", "/", "[", "]"];
  //   const invalidSlug =
  //     invalidChars
  //       .map((char) => oldUsername.includes(char))
  //       .filter((res) => res).length > 0;
  //   if (invalidSlug) {
  //     return "skipped";
  //   }

  //   const updatedSlugs: Slugs = { names: [], validTill: {} };
  //   const slugs = meta.slugs || updatedSlugs;
  //   const date = Timestamp.now().toDate();
  //   date.setDate(date.getDate() + 30);
  //   const slugValidTill = Timestamp.fromDate(date);

  //   if (slugs.names.indexOf(oldUsername) !== -1) {
  //     // skip, slug already exist
  //     functions.logger.info(`skip update slug! ${oldUsername} for ${storeId}`);
  //     return "skipped";
  //   } else if (slugs.names.length === 0) {
  //     updatedSlugs.names.push(oldUsername);
  //     updatedSlugs.validTill[oldUsername] = slugValidTill;
  //   } else {
  //     // there should be maximum 2 slugs
  //     const currentSlug = slugs.names[slugs.names.length - 1];
  //     if (slugs.validTill[currentSlug]["_seconds"] > Timestamp.now().seconds) {
  //       updatedSlugs.names.push(currentSlug);
  //       updatedSlugs.validTill[currentSlug] = slugs.validTill[currentSlug];
  //     }
  //     updatedSlugs.names.push(oldUsername);
  //     updatedSlugs.validTill[oldUsername] = slugValidTill;
  //   }

  //   functions.logger.info(
  //     `updating slugs=${updatedSlugs.names} for ${storeId}`
  //   );
  //   await storeRepo.updateSlugs(storeId, updatedSlugs);
  //   return "success";
  // }

  // async fetchOrders(body: GetOrdersRequest): Promise<DbOrder[]> {
  //   const [ordersByUserId, ordersByCustomerId] = await Promise.all([
  //     this.orderRepo.fetchOrdersByUserId(
  //       body.storeId,
  //       body.customerId,
  //       body.authId
  //     ),
  //     this.orderRepo.fetchOrdersByCustomerId(
  //       body.storeId,
  //       body.customerId,
  //       body.authId
  //     ),
  //   ]);
  //   const allOrders = ordersByUserId.concat(ordersByCustomerId);
  //   allOrders.sort(
  //     (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  //   );
  //   const hash: any = {};
  //   for (const order of allOrders) {
  //     hash[order.id] = order;
  //   }
  //   const orders: DbOrder[] = Object.values(hash);
  //   return orders;
  // }

  // async fetchMultipleStoreInfo(vendorInfo: VendorInfo[]): Promise<any> {
  //   const stores = await this.storeRepo.fetchMultipleStoreInfo(vendorInfo);
  //   return stores;
  // }

  async createStoreByPhone(
    phoneNumber: string
  ): Promise<ApiError | { storeId: string }> {
    if (phoneNumber?.length !== 10) {
      return new ApiError("phoneNumber should be 10 digits!", 400);
    }

    try {
      // get user if exists or create a new one
      const _phoneNumber = `+91${phoneNumber}`;
      const adminService = new AdminService();
      const storeId = await adminService.getOrCreateUserByPhone(_phoneNumber);
      if (!storeId) {
        return new ApiError("10 digit valid phoneNumber required!", 400);
      }

      // check if store already exists
      const alreadyExists = await this.storeRepo.get(storeId);
      if (alreadyExists?.id) {
        return new ApiError(
          `store already exists for ${phoneNumber} with storeId: ${storeId}!`,
          400
        );
      }

      // store not exists let's create new one
      const meta = {
        id: storeId,
        name: _phoneNumber,
        username: storeId,
        phoneNumber: _phoneNumber,
        createdViaAdminDB: true,
      };
      await this.storeRepo.saveMeta(storeId, meta);
      return { storeId };
    } catch (error) {
      console.log(error);
      return new ApiError("Something went wrong, Please try again", 500);
    }
  }

  // // It will delete the user from primary and secondary firebase projects
  // async deleteUser(phoneNumber: string): Promise<DeleteStoreResponse> {
  //   const phone = phoneNumber?.slice(-10) || "";
  //   // Only for test phoneNumbers
  //   if (!phone.includes("33333333") && phone !== "5432154321") {
  //     return ApiHelper.invalidParams();
  //   }

  //   try {
  //     const data = await getSecondaryApp()
  //       .auth()
  //       .getUserByPhoneNumber(`+91${phone}`);
  //     await getSecondaryApp().auth().deleteUser(data.uid);
  //     await admin.auth().deleteUser(data.uid);
  //     return ApiHelper.success();
  //   } catch (error) {
  //     return ApiHelper.callFailed(JSON.stringify(error));
  //   }
  // }

  // async initV2(username: string) {
  //   const storeRepo = new StoreRepo();
  //   const storeRtRepo = new StoreRtRepo();
  //   const redisService = new RedisAppService();
  //   const [storeNew, store] = await Promise.all([
  //     storeRepo.getFromUsernameNewV2(username),
  //     storeRepo.getFromUsername(username),
  //   ]);
  //   if (!store || !store.meta) {
  //     const regExCheck: RegExp = /[.#$\[\]\s]/;
  //     if (regExCheck.test(username)) {
  //       return ApiHelper.callFailed(
  //         'username can"t contain ".", "#", "$", "[", or "]"'
  //       );
  //     }
  //     const usernameService = new UsernameRepo();
  //     const storeId = await usernameService.fetchStoreId(username);
  //     if (storeId) {
  //       const wingMate = new WingmateService();
  //       const indiaSwiftMigrator = new DbUsaSwiftMigrator();
  //       const payload = {
  //         apiName: "syncStore",
  //         region: REGIONS.US_CENTRAL1,
  //         delaySeconds: 0,
  //         apiPayload: {
  //           storeId,
  //         },
  //       };
  //       const [, data] = await Promise.all([
  //         wingMate.scheduleTask(payload),
  //         indiaSwiftMigrator.storeRef(username).get(),
  //         storeRtRepo.updateAsMigrated(storeId, false),
  //       ]);
  //       return { store: data.data() };
  //     }
  //   }

  //   if (storeNew && storeNew.meta) {
  //     functions.logger.debug(`${storeNew?.meta?.id} is using new infra`);
  //     const storeList = [
  //       "aurumcookies,com",
  //       "paagalpantee,com",
  //       "aadhyacoffee,com",
  //     ];
  //     //let isEnabled = false;
  //     // isEnabled = await (
  //     //   await UnleashService.get()
  //     // ).checkFeatureEnabledForStoreId('test1', username);
  //     if (storeList.includes(username.trim())) {
  //       redisService.cacheData(username, { store: storeNew }, 15 * 60);
  //       functions.logger.debug(`caching for ${username}`);
  //     }
  //     return { store: storeNew };
  //   }
  //   return { store };
  // }

  // async fetchTags(storeId: string) {
  //   return await this.storeRepo.fetchTags(storeId);
  // }

  // async fetchMediaInfoEntireStore(storeId: string) {
  //   return await this.storeRepo.fetchMediaInfoEntireStore(storeId);
  // }
}
