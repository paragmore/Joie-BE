import fastify from "fastify";
import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";
import { ApiError } from "../../utils/utils";
import { CreateMediaRequestI, Media, WeightRange } from "./media.types";

export class MediaRepo {
  db: admin.firestore.Firestore;

  constructor() {
    this.db = firestore();
  }
  async getMediaById(id: string) {
    try {
      const docRef = this.dbRef().doc(id);
      const doc = await docRef.get();
      if (doc.exists) {
        return { ...doc.data(), id: doc.id } as Media;
      }
      return undefined;
    } catch (error) {
      fastify().log.error("getMediaById repo: ", error);
      return new ApiError("Something went wrong, Please try again", 500);
    }
  }
  async createMedia(slug: string, media: CreateMediaRequestI) {
    try {
      await this.dbRef().doc(slug).set(media);
    } catch (error) {
      fastify().log.error("createMedia repo: ", error);
      return new ApiError("Something went wrong, Please try again", 500);
    }
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
    console.log(page, pageSize, sortingPattern);
    let query = this.dbRef()
      .where("storeId", "==", storeId)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // Add additional filtering criteria as needed

    if (sC) {
      query = query.where("sC", "==", sC);
    }

    if (gender) {
      query = query.where("gender", "==", gender);
    }
    if (max) {
      query = query.where("wtRange.max", "<=", max);
    }
    if (min) {
      query = query.where("wtRange.min", ">=", min);
    }

    try {
      const snapshot = await query.get();
      const medias = snapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id };
      });
      console.log(snapshot.size);
      return { medias, size: snapshot.size };
    } catch (error) {
      console.log("getAllStoreMedias repo: ", error);
      return new ApiError("Something went wrong, Please try again", 500);
    }
  }

  dbRef() {
    return this.db.collection("media");
  }
}
