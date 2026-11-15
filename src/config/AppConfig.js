export class AppConfig {
  static ADMIN_EMAIL = 'peruqsidiq@gmail.com';
  static APP_ID = typeof __app_id !== 'undefined' ? __app_id : 'yotsuya-otsuka-prep-app';
  static LOCAL_HISTORY_KEY = 'learn_daily_family_history';
  static LOCAL_GEMINI_KEY = 'learndaily_gemini_api_key';

  static getFirebaseConfig() {
    if (typeof __firebase_config !== 'undefined') {
      return JSON.parse(__firebase_config);
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
    math: '算数テスト',
    japanese: '国語テスト',
    uyghur: 'ウイグル語テスト',
    daily: '本日の日替わり模試',
    weakness: '🔥 弱点克服復習',
    combined: '算国総合模試'
  };

  static RADAR_CATEGORIES = [
    '算数計算', '特殊算', '図形', '思考力',
    '国語漢字', '語彙文法', '読解力', 'ウイグル語'
  ];
}
