import { app } from "./firebase-config.js";
import { 
  getAuth, signInWithPopup, GoogleAuthProvider, 
  signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signupWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

// Optional callback listener
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}