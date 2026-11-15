// src/services/FirebaseService.js
// Firebase 認証・Firestore 学習履歴管理サービス（CommonUI.jsx / App.jsx 完全互換版）

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { AppConfig } from '../config/AppConfig';

// -------------------------------------------------------------------------
// Firebase 初期化（環境変数 VITE_FIREBASE_* または AppConfig から自動取得）
// -------------------------------------------------------------------------
const firebaseConfig = {
  apiKey:
    import.meta.env?.VITE_FIREBASE_API_KEY ||
    AppConfig?.FIREBASE_CONFIG?.apiKey ||
    '',
  authDomain:
    import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN ||
    AppConfig?.FIREBASE_CONFIG?.authDomain ||
    '',
  projectId:
    import.meta.env?.VITE_FIREBASE_PROJECT_ID ||
    AppConfig?.FIREBASE_CONFIG?.projectId ||
    '',
  storageBucket:
    import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET ||
    AppConfig?.FIREBASE_CONFIG?.storageBucket ||
    '',
  messagingSenderId:
    import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    AppConfig?.FIREBASE_CONFIG?.messagingSenderId ||
    '',
  appId:
    import.meta.env?.VITE_FIREBASE_APP_ID ||
    AppConfig?.FIREBASE_CONFIG?.appId ||
    ''
};

let app = null;
let auth = null;
let db = null;

try {
  if (firebaseConfig.apiKey) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn('Firebase APIキーが未設定です。Vercelの環境変数（VITE_FIREBASE_*）を確認してください。');
  }
} catch (err) {
  console.error('Firebase初期化エラー:', err);
}

// Firestore書き込み時に undefined フィールドを除去するサニタイザー
function sanitizeForFirestore(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (obj !== null && typeof obj === 'object') {
    const cleaned = {};
    Object.entries(obj).forEach(([key, val]) => {
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    });
    return cleaned;
  }
  return obj;
}

export class FirebaseService {
  // -----------------------------------------------------------------------
  // 1. 認証状態の監視
  // -----------------------------------------------------------------------
  static onAuthChange(callback) {
    if (!auth) {
      if (typeof callback === 'function') callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }

  // -----------------------------------------------------------------------
  // 2. Google アカウントでログイン（CommonUI.jsx の両方の呼び出し名に対応）
  // -----------------------------------------------------------------------
  static async loginWithGoogle() {
    if (!auth) {
      throw new Error(
        'Firebase設定が読み込まれていません。Vercelの環境変数（VITE_FIREBASE_API_KEY 等）または AppConfig.js を確認してください。'
      );
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }

  static async signInWithGoogle() {
    return this.loginWithGoogle();
  }

  // -----------------------------------------------------------------------
  // 3. メールアドレス＆パスワードでログイン・新規登録
  // -----------------------------------------------------------------------
  static async loginWithEmail(email, password) {
    if (!auth) {
      throw new Error('Firebase認証が初期化されていません。設定を確認してください。');
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  static async signInWithEmail(email, password) {
    return this.loginWithEmail(email, password);
  }

  static async registerWithEmail(email, password, displayName = '') {
    if (!auth) {
      throw new Error('Firebase認証が初期化されていません。設定を確認してください。');
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  }

  static async signUpWithEmail(email, password, displayName = '') {
    return this.registerWithEmail(email, password, displayName);
  }

  // -----------------------------------------------------------------------
  // 4. 表示名更新・ログアウト
  // -----------------------------------------------------------------------
  static async updateUserDisplayName(newName) {
    if (!auth || !auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName: newName });
  }

  static async logout() {
    if (!auth) return;
    await signOut(auth);
  }

  // -----------------------------------------------------------------------
  // 5. 学習履歴の保存・取得（Firestore）
  // -----------------------------------------------------------------------
  static async saveRecord(uid, recordPayload) {
    if (!db || !uid) return null;
    const collectionName = AppConfig?.FIRESTORE_COLLECTION || 'quiz_records';
    const cleanData = sanitizeForFirestore({
      ...recordPayload,
      uid,
      createdAtServer: serverTimestamp()
    });
    const docRef = await addDoc(collection(db, collectionName), cleanData);
    return docRef.id;
  }

  static async addRecord(uid, recordPayload) {
    return this.saveRecord(uid, recordPayload);
  }

  static async getUserRecords(uid) {
    if (!db || !uid) return [];
    const collectionName = AppConfig?.FIRESTORE_COLLECTION || 'quiz_records';
    try {
      const q = query(
        collection(db, collectionName),
        where('uid', '==', uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (err) {
      // インデックス未作成時のフォールバック（whereのみで取得してJS側でソート）
      const fallbackQ = query(collection(db, collectionName), where('uid', '==', uid));
      const snapshot = await getDocs(fallbackQ);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    }
  }

  static async fetchRecords(uid) {
    return this.getUserRecords(uid);
  }
}

export default FirebaseService;
