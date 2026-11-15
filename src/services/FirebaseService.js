import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import { AppConfig } from '../config/AppConfig.js';

/**
 * Recursively removes `undefined` fields so Firestore `addDoc` never throws
 * "Unsupported field value: undefined".
 */
function sanitizeForFirestore(value) {
  if (Array.isArray(value)) {
    return value.map(item => sanitizeForFirestore(item));
  }
  if (value !== null && typeof value === 'object') {
    const cleaned = {};
    Object.entries(value).forEach(([key, val]) => {
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    });
    return cleaned;
  }
  return value === undefined ? null : value;
}

export class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.initError = null;

    try {
      const config = AppConfig.getFirebaseConfig();
      this.app = getApps().length > 0 ? getApp() : initializeApp(config);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
    } catch (err) {
      this.initError = err;
      console.error("Firebase initialization error:", err);
    }
  }

  subscribeAuth(onUserChanged) {
    if (!this.auth) {
      onUserChanged(null);
      return () => {};
    }

    getRedirectResult(this.auth).catch((err) => {
      console.warn("Redirect auth notice:", err);
    });

    return onAuthStateChanged(this.auth, async (currentUser) => {
      if (currentUser && currentUser.isAnonymous) {
        await signOut(this.auth);
        onUserChanged(null);
        return;
      }
      onUserChanged(currentUser);
    });
  }

  async loginWithGoogle() {
    if (!this.auth) {
      throw this.initError || new Error("Firebase Auth is not initialized.");
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(this.auth, provider);
    } catch (err) {
      if (
        err.code === 'auth/popup-blocked' ||
        err.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(this.auth, provider);
        return;
      }
      throw err;
    }
  }

  async loginWithEmail(email, password) {
    if (!this.auth) {
      throw this.initError || new Error("Firebase Auth is not initialized.");
    }
    return signInWithEmailAndPassword(this.auth, email.trim(), password);
  }

  async registerWithEmail(email, password, displayName) {
    if (!this.auth) {
      throw this.initError || new Error("Firebase Auth is not initialized.");
    }
    const cred = await createUserWithEmailAndPassword(this.auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: displayName.trim() });
    return cred.user;
  }

  async updateUserDisplayName(user, newName) {
    if (!this.auth || !user) return;
    await updateProfile(user, { displayName: newName.trim() });
  }

  async logout() {
    if (!this.auth) return;
    await signOut(this.auth);
  }

  subscribeFamilyResults(onData, onFallback) {
    if (!this.db) {
      try {
        const saved = localStorage.getItem(AppConfig.LOCAL_HISTORY_KEY);
        if (saved && onFallback) onFallback(JSON.parse(saved));
      } catch (e) {
        console.warn("Local cache read error:", e);
      }
      return () => {};
    }

    const familyResultsRef = collection(this.db, 'artifacts', AppConfig.APP_ID, 'family_results');
    return onSnapshot(
      familyResultsRef,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        onData(items);
        try {
          localStorage.setItem(AppConfig.LOCAL_HISTORY_KEY, JSON.stringify(items));
        } catch (e) {
          console.warn("Local cache write error:", e);
        }
      },
      (error) => {
        console.warn("Firestore listener error, reading local cache:", error);
        try {
          const saved = localStorage.getItem(AppConfig.LOCAL_HISTORY_KEY);
          if (saved && onFallback) onFallback(JSON.parse(saved));
        } catch (e) {
          console.warn("Local cache fallback error:", e);
        }
      }
    );
  }

  async saveQuizResult(recordData) {
    if (!this.db) return;
    try {
      const familyResultsRef = collection(this.db, 'artifacts', AppConfig.APP_ID, 'family_results');
      const cleanRecord = sanitizeForFirestore(recordData);
      await addDoc(familyResultsRef, cleanRecord);
    } catch (e) {
      console.warn("Firestore write failed, relying on local backup:", e);
    }
  }
}

export const firebaseService = new FirebaseService();
