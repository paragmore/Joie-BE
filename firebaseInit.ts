import { initializeApp } from "firebase-admin/app";
import firebase from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json";
export const firebaseInit = () => {
  initializeApp({
    credential: firebase.credential.cert({
      privateKey: serviceAccount.private_key,
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
    }),
  });
};
