// src/config/AppConfig.js
// LearnDaily アプリケーション全体設定（Firebase環境変数・Geminiモデル・科目ラベル・管理者権限）

export const AppConfig = {
  // アプリ基本情報
  APP_TITLE: 'LearnDaily',
  APP_SUBTITLE: '未来を生き抜く思考力＆英語トレーニング',

  // 管理者メールアドレス（保護者ダッシュボード・AI問題再作成権限）
  ADMIN_EMAIL: 'peruqsidiq@gmail.com',

  // Gemini API モデル設定（最新推奨モデル）
  GEMINI_MODEL: 'gemini-3.8-flash',
  GEMINI_FALLBACK_MODELS: [
    'gemini-3.8-flash',
    'gemini-3.8-flash-lite',
    'gemini-3-flash',
    'gemini-2.5-flash'
  ],

  // テスト基本設定
  QUIZ_DURATION_SECONDS: 600, // 制限時間：10分（600秒）
  QUESTIONS_PER_QUIZ: 10,     // 1回あたりの出題数：10問
  PASSING_PERCENTAGE: 70,     // 目標クリアライン：70%

  // 対象学年設定
  GRADES: [
    { id: '2', label: '小学2年生' },
    { id: '5', label: '小学5年生' }
  ],

  // 科目別表示ラベル（全画面共通）
  SUBJECT_LABELS: {
    math: '算数・思考力',
    japanese: '国語・読解＆ことば',
    english: '英語（English）入門',
    english_listening: '英語リスニング集中',
    mixed: '総合思考力チャレンジ'
  },

  // Firebase 接続設定（Vite / Vercel 環境変数から自動読み込み）
  FIREBASE_CONFIG: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  }
};

export default AppConfig;
