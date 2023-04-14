import * as admin from "firebase-admin";
// import { ExtraConfiguration, KEYS, Meta, NormalisedAddress } from "models";
// import { SUBSCRIPTION_DETAILS, SUBSCRIPTION_PLANS } from '../../subscriptionV2/subscription.helper';
// import { Slugs } from '../store/store.model';

export const PackageType = {
  BASIC: "basic",
  PRO: "pro",
  VIP: "vip",
  ULTIMATE: "ultimate",
};

export class StoreRepo {
  cached: any; // META dalo

  // async update(storeId: string, updates: any) {
  //   await this.dbRef(storeId).update(updates);
  // }

  // async setMerchantAddress(storeId: string, address: NormalisedAddress) {
  //   await this.dbRef(storeId).child(KEYS.META.merchantAddress).set(address);
  // }

  // async setPlayStoreAppLink(storeId: string, playStoreAppLink: string) {
  //   await this.dbRef(storeId).child(KEYS.META.playStoreAppLink).set(playStoreAppLink);
  // }

  // async setCatalogMediasLimit(storeId: string, catalogMediasLimit: Number) {
  //   await this.dbRef(storeId).child(KEYS.META.catalogMediasLimit).set(catalogMediasLimit);
  // }

  // async setEndDate(storeId: string, endDate: string) {
  //   await this.dbRef(storeId).child(KEYS.META.endDate).set(endDate);
  // }

  // async setPhoneNumberLogin(storeId: string, value: boolean) {
  //   await this.dbRef(storeId).child(KEYS.META.phoneNumberBalance).set(value);
  // }

  // async updateShopifyStoreSyncConfiguration(storeId: string, syncParameter: string, value: string) {
  //   await this.dbRef(storeId)
  //     .child(
  //       `${KEYS.META.whatsappChatFlowConfiguration}/${KEYS.META.WHATSAPP_CHATFLOW_KEYS.onboardingStates}/shopifyStoreIntegrationStatus/${syncParameter}`
  //     )
  //     .set(value);
  // }

  // async setWhatsappMessage(storeId: string, value: boolean) {
  //   await this.dbRef(storeId).child(KEYS.META.whatsappBalance).set(value);
  // }

  // async setRedirectUrl(username: string, redirectUrl: string) {}

  async get(storeId: string) {
    try {
      const meta = await this.dbRef(storeId);
      return (await meta.get()).data();
    } catch (error) {}
  }

  // async getClass(storeId: string, useCache: boolean = false): Promise<Meta> {
  //   return (
  //     (await this.getClassOrUndefined(storeId, useCache)) ||
  //     new Promise(() => {
  //       throw Error();
  //     })
  //   );
  // }

  // async checkingMeta(storeId: any): Promise<boolean> {
  //   const metaJson = await this.get(storeId);
  //   if (!metaJson) {
  //     return false;
  //   }
  //   return true;
  // }

  // async getClassOrUndefined(storeId: string, useCache: boolean = false): Promise<Meta | undefined> {
  //   if (useCache && this.cached) {
  //     return this.cached;
  //   }
  //   const metaJson = await this.get(storeId);
  //   if (!metaJson) {
  //     return undefined;
  //   }
  //   const ret = new Meta();
  //   ret.load(metaJson);
  //   this.cached = ret;
  //   return ret;
  // }

  // async setThemeCode(storeId: string, themeCode: string | null) {
  //   await this.dbRef(storeId).child('theme').set(themeCode);
  // }

  // async updatePrepaidDiscount(storeId: string, prePaidDiscount: number) {
  //   await this.dbRef(storeId)
  //     .child(KEYS.META.extraConfiguration)
  //     .child('codManagmentVariables')
  //     .child('prePaidDiscount')
  //     .set(prePaidDiscount);
  // }

  // async linkPaymentGateway(storeId: string, extraConfiguration: ExtraConfiguration | null) {
  //   await this.dbRef(storeId)
  //     .child(KEYS.META.paymentInformation)
  //     .child(KEYS.META.PAYMENT_INFORMATION.xEnabled)
  //     .set(true);

  //   const toUpdateProperties: { [key: string]: string } = {};
  //   if (extraConfiguration?.paymentGatewayKey) {
  //     toUpdateProperties.paymentGatewayKey = extraConfiguration.paymentGatewayKey;
  //   }
  //   if (extraConfiguration?.paymentGatewayType) {
  //     toUpdateProperties.paymentGatewayType = extraConfiguration.paymentGatewayType;
  //   }
  //   if (Object.keys(toUpdateProperties).length) {
  //     await this.dbRef(storeId).child(KEYS.META.extraConfiguration).update(toUpdateProperties);
  //   }
  // }

  // async deletePaymentGatewayFields(storeId: string) {
  //   // delete paymentGatewayKey, paymentGatewayType from store meta IC
  //   await this.dbRef(storeId)
  //     .child(KEYS.META.paymentInformation)
  //     .child(KEYS.META.PAYMENT_INFORMATION.xEnabled)
  //     .set(false);

  //   await this.dbRef(storeId).child(KEYS.META.extraConfiguration).update({
  //     paymentGatewayKey: '',
  //     paymentGatewayType: '',
  //   });
  // }

  // async setUsername(storeId: string, username: string) {
  //   await this.dbRef(storeId).child('username').set(username);
  // }

  // async setDomain(storeId: string, domain: string) {
  //   await this.dbRef(storeId).child(KEYS.META.domain).set(domain);
  // }

  async saveMeta(storeId: string, meta: any) {
    await this.dbRef(storeId).set(meta);
  }

  // async getPhoneNumbers(storeIds: string[]): Promise<string[]> {
  //   const promises = storeIds.map(async (storeId) => await this.getClass(storeId));
  //   const response = await Promise.all(promises);
  //   return response.map((res) => res.phoneNumber).filter((no) => no);
  // }

  // async getEmails(storeIds: string[]): Promise<string[]> {
  //   const promises = storeIds.map(async (storeId) => await this.getClass(storeId));
  //   const response = await Promise.all(promises);
  //   return response.map((res) => res.email).filter((no) => no);
  // }

  // async activatePremium(
  //   storeId: string,
  //   endDate: admin.firestore.Timestamp,
  //   subscriptionToActivate: SUBSCRIPTION_PLANS
  // ) {
  //   const data: any = {};
  //   data[KEYS.META.isPremium] = true;
  //   data[KEYS.META.packageType] = SUBSCRIPTION_DETAILS[subscriptionToActivate].planCategory;
  //   data[KEYS.META.endDate] = endDate.toDate().toLocaleDateString('en-US');
  //   data[KEYS.META.isOnTrialPack] = SUBSCRIPTION_DETAILS[subscriptionToActivate].isTrialPackage;
  //   await this.dbRef(storeId).update(data);
  // }

  // async deActivatePremium(
  //   storeId: string,
  //   endDate?: admin.firestore.Timestamp,
  //   isStoreToBeDeactivated: boolean = false
  // ) {
  //   const data: any = {};
  //   data[KEYS.META.isPremium] = false;
  //   data[KEYS.META.packageType] = null;
  //   data[KEYS.META.endDate] = endDate ? endDate.toDate().toLocaleDateString('en-US') : null;
  //   if (isStoreToBeDeactivated) {
  //     data[KEYS.META.whatsappBalance] = false;
  //   }
  //   await this.dbRef(storeId).update(data);
  // }

  // async updateSlugs(storeId: string, slugs: Slugs) {
  //   await this.dbRef(storeId).update({ slugs: slugs });
  // }

  // async checkForBlockedStore(storeId: string) {
  //   if (!storeId) return 0;
  //   const meta = await this.get(storeId);
  //   if (!meta) return 0;
  //   if (meta.isBlocked) return 0;
  //   return 1;
  // }

  dbRef(storeId: string) {
    if (!storeId) {
      throw new Error("");
    }
    return admin.firestore().doc(`store/${storeId}`);
  }
}
