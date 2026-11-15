// src/config/AppConfig.js
// アプリケーション全体の設定・定数管理クラス

export class AppConfig {
  // =========================================================================
  // 1. アプリケーション基本情報
  // =========================================================================
  static APP_TITLE = '未来を生き抜く 思考力トレーニング';
  static APP_SUBTITLE = '毎日1回の習慣で、自ら考え・伸び続ける頭を育てる';
  static APP_ICON = '未';

  // =========================================================================
  // 2. 保護者・管理者設定
  // =========================================================================
  static ADMIN_EMAIL = 'peruqsidiq@gmail.com';
  static FIRESTORE_COLLECTION = 'quiz_records';

  // =========================================================================
  // 3. Firebase 接続設定（Vercel環境変数または直接入力用）
  // =========================================================================
  static FIREBASE_CONFIG = { 
    apiKey: "AIzaSyBbqWjybJrRu4VR90CJohRk-QsbFEFlrj8", 
    authDomain: "learndaily-69355.firebaseapp.com", 
    projectId: "learndaily-69355",
    storageBucket: "learndaily-69355.firebasestorage.app",
    messagingSenderId: "161457830120", 
    appId: "1:161457830120:web:d8465efae2b3e95c12f15d",
    measurementId: "G-RYTSDGW0GP"};
  
  static FIREBASE_CONFIG = {
    apiKey:
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) || '',
    authDomain:
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN) || '',
    projectId:
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_PROJECT_ID) || '',
    storageBucket:
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET) || '',
    messagingSenderId:
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || '',
    appId:
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_APP_ID) || ''
  };

  // =========================================================================
  // 4. 科目ラベル定義（英語科目を含む）
  // =========================================================================
  static SUBJECT_LABELS = {
    math: '算数・思考力',
    japanese: '国語・読解＆語彙',
    english: '英語（English）入門',
    mixed: '総合思考力チャレンジ'
  };

  // =========================================================================
  // 5. 分析・レーダーチャート用項目定義
  // =========================================================================
  static ANALYTICS_CATEGORIES = [
    { key: 'math', label: '算数力' },
    { key: 'japanese', label: '国語力' },
    { key: 'english', label: '英語力' },
    { key: 'mixed', label: '総合力' }
  ];

  // =========================================================================
  // 6. デフォルトAIモデル設定（Gemini API）
  // =========================================================================
  static GEMINI_MODEL = 'gemini-2.5-flash';
}

export default AppConfig;
