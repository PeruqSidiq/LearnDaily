LearnDaily/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                     # React エントリーポイント
    ├── App.jsx                      # ① メインコントローラー（画面切り替え・状態管理）
    ├── config/
    │   └── AppConfig.js             # ② 定数・Firebase設定・科目ラベル管理クラス
    ├── utils/
    │   └── QuizUtils.js             # ③ 日付・タイマー・シャッフル・判定ユーティリティ
    ├── data/
    │   ├── QuestionBank.js          # ④ 国語（2年/5年）・ウイグル語の問題データクラス
    │   ├── MathGenerator.js         # ⑤ 算数（2年/5年）の日替わり数値自動生成クラス
    │   └── QuestionEngine.js        # ⑥ AI生成・動的生成の統合制御クラス
    ├── services/
    │   └── FirebaseService.js       # ⑦ Firebase認証・Firestoreデータ永続化クラス
    └── components/
        ├── CommonUI.jsx             # ⑧ 共通UI部品（ログイン画面・ヘッダー・グラフ等）
        └── PageViews.jsx            # ⑨ 各ページ画面（ホーム・テスト・結果・成績・管理者）
