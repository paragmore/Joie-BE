import * as admin from "firebase-admin";
import fastify from "fastify";
// import fetch from "node-fetch";
// import { _generateCustomToken, getSecondaryApp } from "./auth";
// import { MetaRepo } from "./models/meta/meta.repo";
// import { StoreRepo } from "./models/store/store.repo";
import DecodedIdToken = admin.auth.DecodedIdToken;
// import { NotificationService } from "./notification/notification.service";
// import { RevokeRefreshTokenRequest } from "./revokeRefreshTokens.export.api";

// const randomstring = require("randomstring");

export class AdminService {
//   metaRepo = new MetaRepo();
//   storeRepo = new StoreRepo();

//   async generateRandomAccount(): Promise<string> {
//     const storeId =
//       "FAKE_" +
//       randomstring.generate({
//         charset: "alphanumeric",
//       });
//     await this.createUserByUid(storeId);

//     // save meta as well.
//     const meta = {
//       id: storeId,
//       isP: true,
//       packageType: "vip",
//       eD: "01/01/2050",
//       username: storeId,
//       email: "contact.curateup@gmail.com",
//       phoneNumber: "+91-9347181972",
//       name: "Demo Store",
//     };

//     await this.metaRepo.saveMeta(storeId, meta);
//     return storeId;
//   }

//   async findCustomerAdmin(body: any) {
//     const ret = [];

//     if (body.email) {
//       ret.push(...(await this.storeRepo.findMerchantByEmail(body.email)));
//       ret.push(...(await this.findByEmail(body.email)));
//     }

//     if (body.phoneNumber) {
//       ret.push(...(await this.storeRepo.findMerchantByPhone(body.phoneNumber)));
//       ret.push(...(await this.findByPhone(body.phoneNumber)));
//     }

//     if (ret.length) {
//       return [...new Set(ret)];
//     }

//     return "not-found";
//   }

//   async findByEmail(email: string) {
//     if (!email) {
//       return [];
//     }
//     try {
//       const userRecord = await admin.auth().getUserByEmail(email);
//       return [userRecord.uid];
//     } catch (e) {
//       return [];
//     }
//   }

//   async findByEmailSecondaryDatabase(email: string) {
//     if (!email) {
//       return;
//     }
//     try {
//       const app = getSecondaryApp();
//       const userRecord = await app.auth().getUserByEmail(email);
//       return userRecord.uid;
//     } catch (e) {
//       return;
//     }
//   }

//   async getOrCreateUserByEmail(email: string) {
//     if (!email) {
//       return undefined;
//     }
//     try {
//       const userRecord = await admin.auth().getUserByEmail(email);
//       fastify().log.info(
//         `getOrCreateUserByEmail User already exists for email ${email} with UID ${userRecord.uid}`
//       );
//       return userRecord.uid;
//     } catch (e) {
//       try {
//         const userRecord = await admin.auth().createUser({
//           email: email,
//         });
//         fastify().log.info(
//           `getOrCreateUserByEmail New User created for email ${email} with UID ${userRecord.uid}`
//         );
//         return userRecord.uid;
//       } catch (_) {
//         return;
//       }
//     }
//   }

//   async linkedPhoneNumber(uid: string): Promise<string | undefined> {
//     try {
//       const user = await admin.auth().getUser(uid);
//       return user.phoneNumber;
//     } catch (_) {
//       return undefined;
//     }
//   }

//   async findByPhone(phoneNumber: string) {
//     if (!phoneNumber) {
//       return [];
//     }
//     try {
//       const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
//       return [userRecord.uid];
//     } catch (e) {
//       return [];
//     }
//   }

  async getOrCreateUserByPhone(phoneNumber: string) {
    if (!phoneNumber) {
      return undefined;
    }
    try {
      const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
      fastify().log.info(
        `getOrCreateUserByPhone User already exists for phone ${phoneNumber} with UID ${userRecord.uid}`
      );
      return userRecord.uid;
    } catch (e) {
        fastify().log.error(e)

      try {
        const userRecord = await admin.auth().createUser({
          phoneNumber: phoneNumber,
        });
        fastify().log.info(
          `getOrCreateUserByPhone New User created for phone ${phoneNumber} with UID ${userRecord.uid}`
        );
        return userRecord.uid;
      } catch (err) {
        fastify().log.error(err)
        return;
      }
    }
  }

//   async createUserByUid(uid: string) {
//     if (!uid) {
//       return false;
//     }
//     try {
//       await admin.auth().createUser({
//         uid: uid,
//       });
//       return true;
//     } catch (e) {
//       return false;
//     }
//   }

//   async loginViaOpenId(paytmOpenId: string) {
//     return await _generateCustomToken(paytmOpenId);
//   }

//   async fetchPaytmAccessToken(
//     authCode: string,
//     clientId: string,
//     isStaging: boolean
//   ) {
//     const url = isStaging
//       ? "https://accounts-uat.paytm.com/oauth2/v2/token"
//       : "https://accounts.paytm.com/oauth2/v2/token";

//     const authorization = isStaging
//       ? Buffer.from(
//           "merchant-jewellerymarvels-uat:MYYtSBys2cxwXtLy0hLwcO6L21sHVzj5"
//         ).toString("base64")
//       : Buffer.from(
//           "merchant-house-prod:CKuOmn9fJp0EiT0s3BIxfzuTTka60Dzj"
//         ).toString("base64");

//     const requestBody =
//       `grant_type=authorization_code&` +
//       `code=${authCode}&client_id=${clientId}&scope=basic`;

//     const otherParams = {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//         "cache-control": "no-cache",
//         Authorization: authorization,
//       },
//       body: requestBody,
//       method: "POST",
//     };

//     const response = await fetch(url, otherParams);
//     const json = await response.json();
//     return json.access_token;
//   }

//   async fetchUserDetailsPaytm(authToken: string, isStaging: boolean) {
//     const url = isStaging
//       ? "https://accounts-uat.paytm.com/v2/user?fetch_strategy=profile_info,phone_number,email"
//       : "https://accounts.paytm.com/v2/user?fetch_strategy=profile_info,phone_number,email";

//     const authorization = isStaging
//       ? Buffer.from(
//           "merchant-jewellerymarvels-uat:MYYtSBys2cxwXtLy0hLwcO6L21sHVzj5"
//         ).toString("base64")
//       : Buffer.from(
//           "merchant-house-prod:CKuOmn9fJp0EiT0s3BIxfzuTTka60Dzj"
//         ).toString("base64");

//     const otherParams = {
//       headers: {
//         verification_type: "oauth_token",
//         data: authToken,
//         Authorization: authorization,
//       },
//       method: "GET",
//     };

//     const response = await fetch(url, otherParams);
//     const json = await response.json();
//     return json;
//   }

//   async isAdmin(idToken: string) {
//     try {
//       const app = getSecondaryApp();
//       const decodedIdToken = await app.auth().verifyIdToken(idToken);
//       const userUid = decodedIdToken.uid;
//       const user = await app.auth().getUser(userUid);
//       console.log(user.email);
//       if (
//         !user.email?.endsWith("webfastify.com") &&
//         !user.email?.endsWith("webfastify.com")
//       ) {
//         throw Error("not webfastify admin is logged in");
//       }
//       return true;
//     } catch (e) {}
//     return false;
//   }

//   async getOrCreateUserSecondaryApp(
//     uid: string
//   ): Promise<admin.auth.UserRecord> {
//     const app = getSecondaryApp();
//     try {
//       return await app.auth().getUser(uid);
//     } catch (e) {
//       return await app.auth().createUser({ uid: uid });
//     }
//   }

//   async getUser(uid: string): Promise<admin.auth.UserRecord | undefined> {
//     try {
//       return await admin.auth().getUser(uid);
//     } catch (e) {
//       return undefined;
//     }
//   }

//   async fetchSignUpDate(uid: string) {
//     const user = await admin.auth().getUser(uid);
//     return new Date(user.metadata.creationTime);
//   }

//   async fetchLastSeen(uid: string) {
//     const user = await admin.auth().getUser(uid);
//     if (!user.metadata.lastRefreshTime) {
//       return undefined;
//     }
//     return new Date(user.metadata.lastRefreshTime);
//   }

//   verifyTokenIntegrity(token: string): boolean {
//     const tokenParts: string[] = token.split(".");
//     return tokenParts && tokenParts.length === 3;
//   }

//   getTokenPartsFromRemixTokenString(remixTokenStringRec: string): string[] {
//     const randOmNoUsed = Number(
//       remixTokenStringRec.charAt(remixTokenStringRec.length - 1)
//     );
//     const remixTokenString = remixTokenStringRec.substr(
//       0,
//       remixTokenStringRec.length - 1
//     );
//     const remixTokenParts: string[] = remixTokenString.split(".");
//     const part0 = remixTokenParts[0].substr(0, randOmNoUsed);
//     const part1 = remixTokenParts[1]
//       .substr(0, randOmNoUsed)
//       .split("")
//       .reverse()
//       .join("");
//     const part2 = remixTokenParts[2]
//       .substr(0, randOmNoUsed)
//       .split("")
//       .reverse()
//       .join("");
//     remixTokenParts[0] = part2 + remixTokenParts[0].substr(randOmNoUsed);
//     remixTokenParts[1] = part0 + remixTokenParts[1].substr(randOmNoUsed);
//     remixTokenParts[2] = part1 + remixTokenParts[2].substr(randOmNoUsed);
//     return remixTokenParts;
//   }

//   async getDecodedTokensUID(tokenParts: string[]): Promise<string | undefined> {
//     try {
//       const decodedToken = await admin
//         .auth()
//         .verifyIdToken(
//           tokenParts[0] + "." + tokenParts[1] + "." + tokenParts[2]
//         );
//       return decodedToken ? decodedToken.uid : undefined;
//     } catch (error) {
//       return undefined;
//     }
//   }

//   async verifyToken(token: string): Promise<string | undefined> {
//     const user = await admin.auth().verifyIdToken(token);
//     if (!user) {
//       return;
//     }
//     return user.uid;
//   }

//   async getUserFromTokenSecondaryApp(
//     token: string
//   ): Promise<DecodedIdToken | undefined> {
//     const user: DecodedIdToken = await getSecondaryApp()
//       .auth()
//       .verifyIdToken(token);
//     if (!user) {
//       return;
//     }
//     return user;
//   }

//   async verifyTokenSecondaryApp(token: string): Promise<string | undefined> {
//     try {
//       const user = await this.getUserFromTokenSecondaryApp(token);
//       if (!user) {
//         return;
//       }
//       return user.uid;
//     } catch (error) {
//       return;
//     }
//   }

//   async verifyUser(token: string, receivedStoreId: string): Promise<boolean> {
//     const storeId = await this.verifyTokenSecondaryApp(token);
//     if (!storeId || storeId !== receivedStoreId) {
//       return false;
//     }
//     return true;
//   }

//   async logoutUser(data: RevokeRefreshTokenRequest) {
//     const notificationService = await NotificationService.withStoreId(
//       data.storeId
//     );
//     await admin.auth().revokeRefreshTokens(data.storeId);
//     await notificationService.addTitle("INTERNAL").addRoute("LOGOUT").send();
//   }
}
