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

export class FirebaseService {
  constructor() {
    const config = AppConfig.getFirebaseConfig();
    this.app = getApps().length > 0 ? getApp() : initializeApp(config);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
  }

  subscribeAuth(onUserChanged) {
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
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(this.auth, provider);
    } catch (err) {
      if (err.code === 'auth/popup-blocked') {
        await signInWithRedirect(this.auth, provider);
        return;
      }
      throw err;
    }
  }

  async loginWithEmail(email, password) {
    return signInWithEmailAndPassword(this.auth, email.trim(), password);
  }

  async registerWithEmail(email, password, displayName) {
    const cred = await createUserWithEmailAndPassword(this.auth, email.trim(), password);
    await updateProfile(cred.user, { displayName: displayName.trim() });
    return cred.user;
  }

  async updateUserDisplayName(user, newName) {
    await updateProfile(user, { displayName: newName.trim() });
  }

  async logout() {
    await signOut(this.auth);
  }

  subscribeFamilyResults(onData, onFallback) {
    const familyResultsRef = collection(this.db, 'artifacts', AppConfig.APP_ID, 'family_results');
    return onSnapshot(
      familyResultsRef,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        onData(items);
        try {
          localStorage.setItem(AppConfig.LOCAL_HISTORY_KEY, JSON.stringify(items));
        } catch {}
      },
      (error) => {
        console.warn("Firestore listener error, reading local cache:", error);
        try {
          const saved = localStorage.getItem(AppConfig.LOCAL_HISTORY_KEY);
          if (saved && onFallback) onFallback(JSON.parse(saved));
        } catch {}
      }
    );
  }

  async saveQuizResult(recordData) {
    try {
      const familyResultsRef = collection(this.db, 'artifacts', AppConfig.APP_ID, 'family_results');
      await addDoc(familyResultsRef, recordData);
    } catch (e) {
      console.warn("Firestore write failed, relying on local backup:", e);
    }
  }
}

export const firebaseService = new FirebaseService();
