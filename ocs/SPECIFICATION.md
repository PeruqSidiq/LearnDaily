# LearnDaily システム技術仕様書（PG向けリファレンス）

本ドキュメントは、毎日学習 Web アプリケーション **LearnDaily**（`PeruqSidiq/LearnDaily`）の最新コードベースにおけるシステム構成、全機能仕様、使用技術スタック、クラス・モジュール間の依存関係、Firestore データベース設計、および内部データ構造をまとめた開発者向け技術仕様書です。

## 目次

1. [システム概要・全機能一覧](#1-システム概要全機能一覧)

2. [使用技術スタック](#2-使用技術スタック)

3. [ディレクトリ構成とファイル一覧](#3-ディレクトリ構成とファイル一覧)

4. [クラス・モジュール間の依存関係とアーキテクチャ](#4-クラスモジュール間の依存関係とアーキテクチャ)

5. [Firestore データベース設計（コレクション定義）](#5-firestore-データベース設計コレクション定義)

6. [内部データ構造（JSONスキーマ・LocalStorage・設定ファイル）](#6-内部データ構造jsonスキーマlocalstorage設定ファイル)

7. [主要処理シーケンス（問題生成・出題・結果保存フロー）](#7-主要処理シーケンス問題生成出題結果保存フロー)

## 1. システム概要・全機能一覧

LearnDaily は、小学2年生・小学5年生（および全学年共通の英語学習）を対象とした、サーバーレス構成の毎日学習 Web アプリケーションです。

### 1.1 実装機能一覧

| 機能カテゴリ | 機能名 | 概要・制御ロジック | 
| ----- | ----- | ----- | 
| **認証・認可** | Google OAuth ログイン | Firebase Authentication を使用。未ログイン時はログイン画面へ誘導。 | 
|  | 管理者権限判定 | `AppConfig.ADMIN_EMAIL`（`peruqsidiq@gmail.com`）とログインユーザーの `email` を照合し、管理者メニュー・管理画面を開放。 | 
|  | 表示名カスタマイズ | ユーザーごとに任意のニックネームを設定可能（`localStorage` に永続化）。 | 
| **日替わり問題生成** | 1日1回自動生成＆全ユーザー同一出題 | JST（日本標準時 `UTC+9`）の日付キー（`YYYY-MM-DD_科目_学年`）単位で Firestore に1回のみ保存。同日中は全ユーザーに同一の問題順・選択肢順を出題。 | 
|  | Gemini AI 問題生成 | 保存済み Gemini API キーを用いて科目・学年別の10問を JSON 配列で動的生成。JSON Mode 非対応モデル時は標準テキストモード＋正規表現抽出へ自動フォールバック。 | 
|  | 決定論的フォールバック生成 | API キー未設定または API 通信エラー時、日付シード（FNV-1a ハッシュ＋LCG 擬似乱数）を用いて内蔵バンク・算数自動生成から全ユーザー同一の10問を構築。 | 
|  | 英語混入防止フィルター | 非英語科目（算数・国語・総合）では、英語問題検出ロジック（`isEnglishQuestionItem`）により英単語・英文問題を自動除外し、不足分を算数・国語問題で補填。 | 
|  | 選択肢バイアス補正 | 正解が選択肢A（インデックス0）に偏る問題データ（70%以上一致）を自動検知し、決定論的シードで選択肢 A〜D を再シャッフル。 | 
| **テスト実行** | 5コース出題 | ① 算数・思考力（2年/5年） ② 国語・読解＆ことば（2年/5年） ③ 英語入門（通常7問＋リスニング3問・全学年共通） ④ 英語リスニング集中（10問・全学年共通） ⑤ 総合思考力（算数5問＋国語5問）。 | 
|  | Web Speech API 音声読み上げ | 英語問題の音声自動再生・通常速度（`0.85`）・ゆっくり再生（`0.6`）・選択肢個別発音再生に対応。 | 
|  | 弱点克服リベンジモード | 過去の誤答問題（`wrongQuestions`）を抽出し、ランダム順・選択肢シャッフルで再出題。 | 
|  | 制限時間タイマー | 1回10分（600秒）のカウントダウン制御。残り60秒以下で警告表示。 | 
| **結果・履歴分析** | スコア＆認定ステージ判定 | 正答率に応じて4段階（未来クリエイター級 / イノベーター級 / チャレンジャー級 / ルーキー級）を判定し、全問解説を表示。 | 
|  | 個人学習履歴（`HistoryView`） | 期間（全期間/今月/7日間）・学年フィルター、科目別達成率バー、直近30日間の学習スタンプカレンダーを表示。 | 
| **保護者管理画面** | 学習者（子ども）別比較 | アカウント単位でテスト回数・平均正答率・累計正解数・平均タイム・得意科目・強化ポイントをカード比較表示。 | 
|  | 詳細パフォーマンス分析 | 学習者・科目・期間クロスフィルター、苦手分野（カテゴリ別誤答数）トップ5ランキング、直近14日間の日別推移棒グラフ、各回の誤答詳細アコーディオン展開。 | 
|  | 手動AI再作成・上書き配信 | 任意テーマ指定での AI 10問プレビュー生成、本日の共通問題への上書き適用、および日替わりキャッシュのリセット削除。 | 

## 2. 使用技術スタック

| レイヤー | 採用技術・ライブラリ | 用途・役割 | 
| ----- | ----- | ----- | 
| **フロントエンド** | **React** | UI コンポーネント構築・Hooks（`useState`, `useEffect`, `useMemo`, `useCallback`）による状態管理。 | 
| **ビルドツール** | **Vite** | 高速な開発サーバーおよび本番バンドル（SPA ビルド）。 | 
| **スタイリング** | **Tailwind CSS** | ユーティリティファースト CSS によるレスポンシブ UI 構築。 | 
| **アイコン** | **lucide-react** | UI アイコン一式（`Shield`, `BarChart3`, `Volume2`, `Sparkles` 等）。 | 
| **BaaS / 認証 / DB** | **Firebase (v9+ Modular SDK)** | `firebase/auth`（Google OAuth 認証）、`firebase/firestore`（Cloud Firestore NoSQL DB）。 | 
| **外部 AI API** | **Google Gemini REST API** | `generativelanguage.googleapis.com/v1beta`（モデル動的検出＋`generateContent` エンドポイント）。 | 
| **ブラウザ標準 API** | **Web Speech API / Web Storage** | `window.speechSynthesis`（英語音声合成）、`localStorage`（日替わり問題・APIキーキャッシュ）。 | 
| **ホスティング** | **Vercel + GitHub** | `PeruqSidiq/LearnDaily` リポジトリ連携による自動 CI/CD デプロイ。 | 

## 3. ディレクトリ構成とファイル一覧

```
LearnDaily/
├── index.html                      # SPA エントリーHTML（フォント・タイトル設定）
├── package.json                    # 依存パッケージ・npm scripts 定義
├── vite.config.js                  # Vite ビルド設定
├── firestore.rules                 # Firestore セキュリティルール（認証・管理者権限）
├── vercel.json                     # Vercel SPA ルーティングリライト設定
├── docs/
│   └── SPECIFICATION.md            # 本システム技術仕様書
└── src/
    ├── main.jsx                    # React ルートマウント処理
    ├── App.jsx                     # アプリ全体の状態管理・画面ルーティング・Firebase初期化・テスト実行制御
    ├── index.css                   # Tailwind CSS ディレクティブ・グローバルスタイル
    ├── config/
    │   └── AppConfig.js            # アプリ定数（管理者メール・デフォルトGeminiモデル・科目ラベル・制限時間）
    ├── data/
    │   ├── QuestionEngine.js       # 問題生成・日替わりFirestore同期・決定論的シャッフル・英語混入除去エンジン
    │   ├── QuestionBank.js         # 内蔵問題バンク（小2/小5 算数・国語・英語＆リスニング問題データ配列）
    │   └── MathGenerator.js        # 算数問題の動的数値生成クラス（シード対応）
    ├── components/
    │   ├── Navigation.jsx          # ヘッダーナビゲーション（ユーザー切替・ナビメニュー・管理者タブ表示制御）
    │   └── PageViews.jsx           # 全5画面ビュー（HomeView / QuizRunnerView / ResultsView / HistoryView / AdminView）
    └── utils/
        └── QuizUtils.js            # 配列シャッフル・秒数フォーマット（MM:SS）・ランク認定判定ユーティリティ

```

## 4. クラス・モジュール間の依存関係とアーキテクチャ

### 4.1 依存関係図

```
graph TD
    Main[src/main.jsx] --> App[src/App.jsx]
    App --> Nav[src/components/Navigation.jsx]
    App --> Views[src/components/PageViews.jsx]
    App --> Engine[src/data/QuestionEngine.js]
    App --> Config[src/config/AppConfig.js]

    Views --> Engine
    Views --> Config
    Views --> Utils[src/utils/QuizUtils.js]

    Engine --> Bank[src/data/QuestionBank.js]
    Engine --> MathGen[src/data/MathGenerator.js]
    Engine --> Utils
    Engine --> Config
    Engine --> Firestore[(Firebase Firestore)]
    Engine --> Gemini[[Gemini REST API]]

    App --> Auth[(Firebase Auth)]
    App --> Firestore

```

### 4.2 各クラス・モジュールの責務と主要メソッド

#### ① `QuestionEngine`（`src/data/QuestionEngine.js`）

静的メソッド（`static`）で構成されたコアビジネスロジッククラスです。

| メソッド名 | 引数 | 戻り値 | 責務・処理概要 | 
| ----- | ----- | ----- | ----- | 
| `setFirestoreDb` | `dbInstance` | `void` | `App.jsx` で初期化した Firestore インスタンスをクラスプロパティに保持。 | 
| `getTodayJstString` | なし | `string` | JST（`UTC+9`）基準の今日の日付文字列（`YYYY-MM-DD`）を返却。 | 
| `getDailySetKey` | `grade, subject, dateStr` | `string` | 日付＋科目＋学年ごとの共有ドキュメントID（例：`2026-11-15_math_2`）を生成。英語系は学年を省き共通キー化。 | 
| `hashStringToSeed` | `str` | `number` | FNV-1a 32bit ハッシュ関数により文字列から符号なし32bit整数シードを生成。 | 
| `deterministicShuffle` | `list, seedStr` | `Array` | `hashStringToSeed` と線形合同法（LCG）を組み合わせ、全クライアントで完全に同一順序のシャッフル配列を生成。 | 
| `isEnglishQuestionItem` | `q` | `boolean` | 科目・`type`・`audioText`・正規表現（英単語フレーズ・選択肢の英字比率）から英語問題を判定（`cm`, `kg`, `mL` 等の単位は除外）。 | 
| `normalizeQuestions` | `questions, subject, count, preserveOrder, choiceSeedPrefix` | `Array<QuestionObject>` | スキーマ統一・非英語科目からの英語問題フィルタリング・選択肢シャッフル・先頭正解バイアス（70%以上一致）の自動再分散を実行。 | 
| `generateQuiz` | `grade, subject, customApiKey` | `Promise<Array>` | **メインエントリーポイント**。Firestore 確認 → ローカルキャッシュ確認 → 多重実行ロック付き新規作成 → Firestore 保存の順で制御。 | 
| `fetchQuestionsFromGemini` | `grade, subject, apiKey, count, customTopic` | `Promise<Array>` | キャッシュ済み動作モデル → 候補モデル → `/v1beta/models` 動的探索の順で Gemini API へリクエスト。 | 
| `requestGeminiWithModel` | `model, cleanKey, prompt, useJsonMode` | `Promise<Array>` | 単一モデルへの `generateContent` 実行。`400 JSON mode is not enabled` 発生時は `responseMimeType` を外して自動再試行。 | 
| `buildDeterministicFallbackQuiz` | `grade, subject, dateStr` | `Array<QuestionObject>` | API 未設定時やエラー時に、日付シードを用いて内蔵バンク・`MathGenerator` から全ユーザー同一の10問を生成。 | 

#### ② `MathGenerator`（`src/data/MathGenerator.js`）

* `generateMathQuestions(grade, count, seed)`: 学年（2年：筆算・九九・時計・長さ、5年：小数の乗除・分数の通分・割合・図形面積）に応じた算数問題とダミー選択肢をプログラム生成します。

#### ③ `QuestionBank`（`src/data/QuestionBank.js`）

* `GRADE2_MATH_FALLBACK` / `GRADE5_MATH_FALLBACK`: 算数フォールバック問題配列。

* `GRADE2_JAPANESE` / `GRADE5_JAPANESE`: 国語（漢字・語彙・読解）問題配列。

* `ENGLISH_QUESTIONS`: 小学生向け英語（`type: 'standard'` および `type: 'listening'`）問題配列。

#### ④ `QuizUtils`（`src/utils/QuizUtils.js`）

* `shuffleArray(array)`: Fisher-Yates 法による通常ランダムシャッフル（弱点克服リベンジモード用）。

* `formatTime(seconds)`: 秒数を `MM:SS` 形式へフォーマット。

* `getRankInfo(percentage)`: 正答率に応じた称号バッジ・テーマカラー・メッセージを返却。

#### ⑤ `PageViews.jsx`（`src/components/PageViews.jsx`）

* `HomeView`: 学年切替、今日の完了数・累計・平均正答率サマリー、弱点復習バナー、4科目カード。

* `QuizRunnerView`: 制限時間カウントダウン、進捗バー、Web Speech API 音声再生ボタン、4択回答＆即時解説表示。

* `ResultsView`: スコア・認定ステージ表示、全10問の正誤・ユーザー回答・解説一覧。

* `HistoryView`: 学習者個人向けの期間/学年フィルター、科目別バー、30日間スタンプカレンダー。

* `AdminView`: 保護者専用の学習者別比較カード、詳細分析ダッシュボード（KPI・科目別・苦手分野TOP5・14日間推移グラフ・誤答アコーディオン）、手動 AI 再作成＆プレビュー適用、Gemini API キー管理。

## 5. Firestore データベース設計（コレクション定義）

NoSQL（Cloud Firestore）に以下 3 つのルートコレクションを保持しています。

### 5.1 `daily_ai_quizzes`（日替わり共通問題セット）

1日1回作成され、全ユーザーで共有される問題ドキュメントです。

* **ドキュメントID**: `{YYYY-MM-DD}_{subject}_{grade}`（英語系は `{YYYY-MM-DD}_{subject}`）

  * 例：`2026-11-15_math_2`、`2026-11-15_english`

| フィールド名 | 型 | 説明 | 
| ----- | ----- | ----- | 
| `date` | `string` | 対象日付（JST `YYYY-MM-DD`） | 
| `dailyKey` | `string` | ドキュメントIDと同一の識別キー | 
| `grade` | `string` | 対象学年（`"2"` または `"5"`） | 
| `subject` | `string` | 科目コード（`"math"`, `"japanese"`, `"english"`, `"english_listening"`, `"mixed"`） | 
| `source` | `string` | 作成元区分（`"auto_daily"`: 1日1回自動生成 / `"admin_manual"`: 管理者手動再作成） | 
| `updatedAt` | `string` | 最終更新日時（ISO 8601 形式） | 
| `questions` | `Array<QuestionObject>` | 出題される問題オブジェクト10件の配列（選択肢シャッフル済み） | 

### 5.2 `learning_records`（テスト実施履歴・成績データ）

ユーザーがテストを完了するたびに 1 ドキュメント追加されます。

* **ドキュメントID**: Firestore 自動採番 ID

| フィールド名 | 型 | 説明 | 
| ----- | ----- | ----- | 
| `uid` | `string` | Firebase Auth のユーザー UID | 
| `userEmail` | `string` | 実施ユーザーのメールアドレス | 
| `userName` | `string` | 実施ユーザーの表示名（カスタム名または Google アカウント名） | 
| `grade` | `string` | 選択学年（`"2"` または `"5"`） | 
| `subject` | `string` | 実施科目コード（`"math"`, `"japanese"`, `"english"`, `"english_listening"`, `"mixed"`, `"weakness"`） | 
| `score` | `number` | 正解数（例：`8`） | 
| `total` | `number` | 総問題数（例：`10`） | 
| `timeSpent` | `number` | 所要時間（秒） | 
| `date` | `string` | 実施日時（ISO 8601 文字列） | 
| `createdAt` | `Timestamp` | Firestore サーバータイムスタンプ | 
| `wrongQuestions` | `Array<QuestionObject>` | その回で間違えた問題オブジェクトの配列（弱点復習・管理画面誤答分析に使用） | 

### 5.3 `admin_settings`（管理者システム設定）

* **ドキュメントID**: `gemini_config`（固定）

| フィールド名 | 型 | 説明 | 
| ----- | ----- | ----- | 
| `apiKey` | `string` | Google AI Studio で発行された Gemini API キー | 
| `updatedAt` | `string` | 更新日時（ISO 8601 形式） | 
| `updatedBy` | `string` | 更新した管理者のメールアドレス | 

## 6. 内部データ構造（JSONスキーマ・LocalStorage・設定ファイル）

### 6.1 問題オブジェクト（`QuestionObject`）標準 JSON スキーマ

AI 生成・内蔵バンク・Firestore 保存・画面描画のすべてで統一された内部データ形式です。

```
{
  "id": "english_q_1",
  "subject": "english",
  "type": "listening",
  "audioText": "Good morning",
  "category": "あいさつ",
  "question": "【リスニング】スピーカーボタンを押して英語の発音を聞き、正しい意味をえらぼう！",
  "choices": [
    "こんばんは",
    "おはよう",
    "さようなら",
    "ありがとう"
  ],
  "answer": "おはよう",
  "explanation": "Good morning（グッド モーニング）は朝（あさ）のあいさつ『おはよう』です。"
}

```

#### スキーマ制約ルール

* `answer` は `choices` 配列内のいずれか1要素と**完全一致**すること。

* 非英語科目（`math`, `japanese`, `mixed`）では `type` は常に `"standard"`、`audioText` は常に `""` となる。

### 6.2 `localStorage` キー一覧（ブラウザローカルキャッシュ）

| キー名 | 保存形式 | 用途 | 
| ----- | ----- | ----- | 
| `learndaily_daily_quiz_{dailyKey}` | JSON String | 本日の日替わり問題セットのローカルキャッシュ（Firestore 読み取り回数削減・高速化）。 | 
| `learndaily_working_gemini_model` | String | 直近で正常応答した Gemini モデル名（例：`gemini-2.5-flash`）をキャッシュし次回以降の試行回数を削減。 | 
| `gemini_api_key` | String | Gemini API キーのブラウザ側キャッシュ。 | 
| `learndaily_custom_name_{uid}` | String | ユーザーごとのカスタム表示名設定。 | 

### 6.3 設定・ビルド関連ファイル

| ファイル名 | 役割・主な設定内容 | 
| ----- | ----- | 
| `src/config/AppConfig.js` | `ADMIN_EMAIL`（管理者判定用メールアドレス）、`GEMINI_MODEL`（デフォルトモデル名）、`QUIZ_DURATION_SECONDS`（`600`秒）、`SUBJECT_LABELS` を一元定義。 | 
| `firestore.rules` | `learning_records` はログイン済みユーザーによる作成・本人または管理者による閲覧を許可。`daily_ai_quizzes` は全ログインユーザー読み書き許可、`admin_settings` は管理者メールのみ書き込み許可。 | 
| `vercel.json` | `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }` を定義し、SPA リロード時の 404 を防止。 | 
| `package.json` | 依存関係（`react`, `react-dom`, `firebase`, `lucide-react`, `tailwindcss`, `vite`）およびビルドコマンド（`npm run dev`, `npm run build`）を管理。 | 

## 7. 主要処理シーケンス（問題生成・出題・結果保存フロー）

```
sequenceDiagram
    actor User as 学習者（子ども）
    participant UI as HomeView / QuizRunnerView
    participant Engine as QuestionEngine
    participant Local as localStorage
    participant FS as Firestore
    participant AI as Gemini API

    User->>UI: 科目を選択してテスト開始
    UI->>Engine: generateQuiz(grade, subject)
    Engine->>FS: getDoc("daily_ai_quizzes/{dailyKey}")
    alt 本日分がFirestoreに存在する場合
        FS-->>Engine: 保存済み10問を返却
        Engine->>Engine: 英語混入チェック＆バイアス補正
        Engine->>Local: ローカルキャッシュ更新
        Engine-->>UI: 10問データを返却（全ユーザー同一）
    else 本日分が未作成の場合（その日最初の1回）
        Engine->>FS: getDoc("admin_settings/gemini_config")
        FS-->>Engine: apiKey 取得
        alt apiKey が有効な場合
            Engine->>AI: POST generateContent (10問生成)
            AI-->>Engine: JSON配列レスポンス
        else apiKey 未設定またはエラー時
            Engine->>Engine: buildDeterministicFallbackQuiz (日付シード生成)
        end
        Engine->>Engine: 英語混入除外・選択肢シードシャッフル
        Engine->>FS: setDoc("daily_ai_quizzes/{dailyKey}")
        Engine->>Local: ローカルキャッシュ保存
        Engine-->>UI: 10問データを返却
    end
    User->>UI: 10問回答完了
    UI->>FS: addDoc("learning_records", { score, wrongQuestions, ... })

```
