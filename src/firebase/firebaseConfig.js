import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {

  apiKey: "AIzaSyCNM-kFj4FGaeCWFnXNilp_7I39Q3jUTik",

  authDomain: "githubmusterisikayet.firebaseapp.com",

  projectId: "githubmusterisikayet",

  storageBucket: "githubmusterisikayet.firebasestorage.app",

  messagingSenderId: "64837782444",

  appId: "1:64837782444:web:080974d0f42681a2a7c809"

};



const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
