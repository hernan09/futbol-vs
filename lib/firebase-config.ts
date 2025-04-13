import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore"

// Usar valores directos en lugar de variables de entorno para evitar problemas de carga
const firebaseConfig = {
  apiKey: "AIzaSyB-3UgncIQL4whfHipCPBBl6n8fwFg0f6s",
  authDomain: "futbollogin.firebaseapp.com",
  projectId: "futbollogin",
  storageBucket: "futbollogin.appspot.com", // Corregido de firebasestorage.app a appspot.com
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890123456789012"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const auth = getAuth(app)
const db = getFirestore(app)

// Enable offline persistence
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab at a time.")
    } else if (err.code === "unimplemented") {
      console.warn("The current browser does not support persistence.")
    }
  })
}

export { auth, db }
