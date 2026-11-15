export class AppConfig {
  static ADMIN_EMAIL = 'peruqsidiq@gmail.com';
  static APP_ID = typeof globalThis.__app_id !== 'undefined' && globalThis.__app_id
    ? globalThis.__app_id
    : 'yotsuya-otsuka-prep-app';
  static LOCAL_HISTORY_KEY = 'learn_daily_family_history';
  static LOCAL_GEMINI_KEY = 'learndaily_gemini_api_key';

  static APP_TITLE = '未来を生き抜く 思考力トレーニング';
  static APP_SUBTITLE = '毎日1回の習慣で、自ら考え・伸び続ける頭を育てる';
  static APP_BADGE_CHAR = '未';

  static getFirebaseConfig() {
    if (typeof globalThis.__firebase_config !== 'undefined' && globalThis.__firebase_config) {
      try {
        return typeof globalThis.__firebase_config === 'string'
          ? JSON.parse(globalThis.__firebase_config)
          : globalThis.__firebase_config;
      } catch (e) {
        console.warn("Invalid __firebase_config JSON, using default config:", e);
      }
    }
    return {
      apiKey: "AIzaSyBbqWjybJrRu4VR90CJohRk-QsbFEFlrj8",
      authDomain: "learndaily-69355.firebaseapp.com",
      projectId: "learndaily-69355",
      storageBucket: "learndaily-69355.firebasestorage.app",
      messagingSenderId: "161457830120",
      appId: "1:161457830120:web:d8465efae2b3e95c12f15d",
      measurementId: "G-RYTSDGW0GP"
    };
  }

  static SUBJECT_LABELS = {
    math: '算数思考トレーニング',
    japanese: '国語ことばトレーニング',
    english: '英語入門トレーニング',
    uyghur: 'ウイグル語トレーニング',
    daily: '本日の思考力チャレンジ',
    weakness: '🔥 弱点克服トレーニング',
    combined: '算国総合思考チャレンジ'
  };

  static RADAR_CATEGORIES = [
    '算数計算', '特殊算', '図形', '思考力',
    '国語漢字', '語彙文法', '読解力', '英語', 'ウイグル語'
  ];
}
