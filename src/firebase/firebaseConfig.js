import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {

  apiKey: "AIzaSyB60CzD9fQgRec7CJi_aYdkulFQIzRpYt4",

  authDomain: "musteri-geri-bildirim.firebaseapp.com",

  projectId: "musteri-geri-bildirim",

  storageBucket: "musteri-geri-bildirim.firebasestorage.app",

  messagingSenderId: "898030075332",

  appId: "1:898030075332:web:139336c8a2cae8673c7891"

};



const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
