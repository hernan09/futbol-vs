import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence, initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore"

// Usar valores directos en lugar de variables de entorno para evitar problemas de carga
const firebaseConfig = {
  apiKey: "AIzaSyB-3UgncIQL4whfHipCPBBl6n8fwFg0f6s",
  authDomain: "futbollogin.firebaseapp.com",
  projectId: "futbollogin",
  storageBucket: "futbollogin.appspot.com", // Corregido de firebasestorage.app a appspot.com
  messagingSenderId: "777483049666",
  appId: "1:777483049666:web:07d891d7fa3340ffc9f95b",
  measurementId: "G-QZN91E60QB",
}

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
const auth = getAuth(app)

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true
})

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
  } else if (err.code === 'unimplemented') {
    console.warn("The current browser does not support persistence.")
  }
})

export { app, auth, db }
