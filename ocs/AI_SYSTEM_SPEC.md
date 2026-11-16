# AI_SYSTEM_SPEC: LearnDaily (v2.0 - Universal LLM Context)

> **PURPOSE OF THIS DOCUMENT**
> This file is the single source of truth for any AI coding assistant (Gemini, Claude, GPT, Cursor, Copilot, Cline, Aider) working on the **LearnDaily** repository.
> Read this entire specification before generating, refactoring, or debugging any code.

---

## 1. AI Behavioral Rules & Coding Protocol (MUST FOLLOW)

1. **Preserve Core Invariants**: Never break the 5 architectural invariants defined in **Section 3** (JST daily lock, deterministic seeding across all users, non-English subject isolation, first-choice bias correction, and Gemini 400 JSON-mode fallback).
2. **Language Convention**:
   - All user-facing UI text, quiz questions, explanations, error alerts, and code comments MUST be written in **Japanese** (except English learning content inside `english` / `english_listening` subjects).
   - Variable names, function names, file names, and Firestore keys MUST remain in **English (camelCase / PascalCase / snake_case as existing)**.
3. **Output Format for Code Changes**:
   - When modifying existing files, provide **complete, drop-in replacement files** or unambiguous function-level diffs with exact file paths so the developer can apply changes without guesswork.
   - Maintain compatibility with React functional components, Hooks, and Tailwind CSS utility classes.
4. **Admin Security Gate**:
   - Administrative features (API key management, manual quiz regeneration/reset, cross-user analytics) MUST remain strictly gated to `AppConfig.ADMIN_EMAIL` (`peruqsidiq@gmail.com`) both in the UI and in `firestore.rules`.

---

## 2. Project Overview & Tech Stack

- **Application Name**: `LearnDaily`
- **Target Audience**: Japanese elementary school students — **Grade 2 (`"2"`)** and **Grade 5 (`"5"`)**, plus cross-grade **English (`"english"`, `"english_listening"`)**, managed by a parent/administrator.
- **Architecture**: Serverless Single Page Application (SPA).

| Layer | Technology / API | Details |
| :--- | :--- | :--- |
| **UI Framework** | React 18+ (Hooks) | State-driven view routing (`home`, `quiz`, `results`, `history`, `admin`) without external router overhead |
| **Build Tool** | Vite | ES Modules bundler (`VITE_FIREBASE_*` env vars supported with `AppConfig` fallback) |
| **Styling** | Tailwind CSS + `lucide-react` | Responsive mobile-first card layouts and iconography |
| **Auth & Database** | Firebase Modular SDK (`v9+`) | `firebase/auth` (Google OAuth + Email/Password), `firebase/firestore` (NoSQL) |
| **AI Generation** | Google Gemini REST API (`v1beta`) | Dynamic model discovery + `generateContent` endpoint |
| **Speech Synthesis** | Web Speech API (`window.speechSynthesis`) | `en-US` pronunciation playback (`rate: 0.85` normal, `0.6` slow) |
| **Client Cache** | `localStorage` | Offline/fast-read cache for daily quizzes, working Gemini model name, API key, custom display name |
| **Deployment** | GitHub + Vercel | SPA rewrite rule (`/(.*)` -> `/index.html`) in `vercel.json` |

---

## 3. Critical Architectural Invariants (DO NOT VIOLATE)

### Invariant 1: Once-Per-Day Generation & Global User Consistency (JST)
- All date boundaries MUST be calculated in **Japan Standard Time (`JST = UTC + 9 hours`)** formatted as `YYYY-MM-DD` (`QuestionEngine.getTodayJstString()`).
- Each `(date, subject, grade)` combination is generated **at most once per day** (by whichever user opens that quiz first) and persisted to Firestore (`daily_ai_quizzes/{dailyKey}`).
- Every user who starts that quiz on the same JST date MUST receive the **exact same 10 questions, in the exact same order, with the exact same choice order (`A, B, C, D`)**.
- **Exception**: Only the administrator (`peruqsidiq@gmail.com`) can manually regenerate and overwrite today's quiz set or reset it via `AdminView`.
- **Concurrency Lock**: `QuestionEngine.inFlightRequests` (`Map<dailyKey, Promise>`) prevents duplicate simultaneous Gemini API calls if two users start the same ungenerated quiz at the exact same second.

### Invariant 2: Deterministic Seeding (FNV-1a + LCG)
- Never use `Math.random()` when building or normalizing daily shared quizzes.
- Use `QuestionEngine.hashStringToSeed(str)` (32-bit FNV-1a hash) + `QuestionEngine.deterministicShuffle(list, seedStr)` (Linear Congruential Generator) so all clients compute identical shuffles from the same date/subject/grade key.
- Standard `Math.random()` / `QuizUtils.shuffleArray()` is ONLY permitted in **Weakness Revenge Mode** (`handleStartWeaknessQuiz`).

### Invariant 3: Strict Exclusion of English Questions from Non-English Subjects
- Subjects are divided into two categories:
  - **English Subjects**: `'english'`, `'english_listening'` (`isEnglishSubject(s) === true`)
  - **Non-English Subjects**: `'math'`, `'japanese'`, `'mixed'` (`isEnglishSubject(s) === false`)
- Non-English subjects MUST NEVER contain English vocabulary, English sentences, or listening questions.
- `QuestionEngine.isEnglishQuestionItem(q)` filters out any question matching English keywords (`英語|英単語|英文|リスニング|アルファベット|英訳|和訳|ローマ字`), multi-word English phrases (`/\b[A-Za-z]{2,}(?:\s+[A-Za-z]{2,})+\b/`), or majority English-word choices, while explicitly whitelisting math/science units and variables (`NON_ENGLISH_UNIT_TOKENS`: `cm`, `mm`, `km`, `m`, `kg`, `mg`, `g`, `ml`, `dl`, `l`, `a`, `b`, `c`, `d`, `x`, `y`, `z`, `p`, `q`).
- If filtering reduces a non-English quiz below 10 questions, `saveDailyQuizSet()` / `finalizeAiResult()` automatically backfills from `buildDeterministicFallbackQuiz()`.

### Invariant 4: First-Choice Answer Bias Auto-Correction
- Raw question banks and LLM outputs often place the correct answer at `choices[0]` (Option A).
- `QuestionEngine.hasUnshuffledFirstChoiceBias(questions)` checks if `>= 70%` of questions have `choices[0] === answer`. If detected, `normalizeQuestions()` automatically re-shuffles choices deterministically.

### Invariant 5: Gemini API Resilience & JSON-Mode Fallback
- `QuestionEngine.fetchQuestionsFromGemini()` resolves models in priority order:
  1. `localStorage.getItem('learndaily_working_gemini_model')`
  2. `AppConfig.GEMINI_MODEL`
  3. Built-in candidates (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-3-flash`, `gemini-3.8-flash`)
  4. Dynamic model list from `GET /v1beta/models?key=...` (filtered to `gemini-*` models supporting `generateContent`, excluding `embedding`, `imagen`, `veo`, `tts`, `robotics`, `computer-use`, `deep-research`).
- **HTTP 400 JSON-Mode Fallback**: If a model rejects `generationConfig.responseMimeType = 'application/json'` (`JSON mode is not enabled`), `requestGeminiWithModel()` immediately retries the same model with `useJsonMode = false` and parses the JSON array via `extractJsonArrayFromText()` (stripping markdown fences and slicing `[` to `]`).
- **Auth Errors**: HTTP `401`/`403` or `API_KEY_INVALID` aborts immediately (`isFatalAuthError`). On total API failure during auto-daily generation, `generateQuiz()` falls back seamlessly to `buildDeterministicFallbackQuiz()`.

---

## 4. Directory Structure & Module Contracts

```text
LearnDaily/
├── index.html                    # Root HTML entry
├── package.json                  # Dependencies: react, react-dom, firebase, lucide-react, tailwindcss, vite
├── vite.config.js                # Vite configuration
├── vercel.json                   # SPA rewrite: { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
├── firestore.rules               # Cloud Firestore security rules
├── docs/
│   ├── SPECIFICATION.md          # Human-readable developer specification
│   └── AI_SYSTEM_SPEC.md         # This AI-readable system specification
└── src/
    ├── main.jsx                  # ReactDOM.createRoot mount
    ├── index.css                 # Tailwind CSS imports
    ├── App.jsx                   # Root container: Auth, Firestore sync, Quiz state machine, Timer
    ├── config/
    │   └── AppConfig.js          # App constants & Firebase configuration
    ├── data/
    │   ├── QuestionEngine.js     # Core quiz generation, caching, normalization & Gemini client
    │   ├── QuestionBank.js       # Static fallback question arrays (Math, Japanese, English)
    │   └── MathGenerator.js      # Procedural seeded arithmetic/word-problem generator
    ├── components/
    │   ├── Navigation.jsx        # Optional standalone header component (if imported)
    │   └── PageViews.jsx         # All 5 views: HomeView, QuizRunnerView, ResultsView, HistoryView, AdminView
    └── utils/
        └── QuizUtils.js          # shuffleArray, formatTime, getRankInfo
```

### 4.1 Module Interface Reference

#### `src/config/AppConfig.js`
Exports `AppConfig` object:
- `APP_TITLE`: `string` (default `'LearnDaily'`)
- `ADMIN_EMAIL`: `string` (`'peruqsidiq@gmail.com'`)
- `GEMINI_MODEL`: `string` (default model identifier)
- `QUIZ_DURATION_SECONDS`: `number` (`600`)
- `SUBJECT_LABELS`: `{ math, japanese, english, english_listening, mixed }`
- `FIREBASE_CONFIG`: `{ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId }`

#### `src/App.jsx`
- Initializes Firebase (`getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)`), `auth = getAuth(firebaseApp)`, `db = getFirestore(firebaseApp)`.
- Registers `QuestionEngine.setFirestoreDb(db)` at module load.
- **State Variables**:
  - `user` (`FirebaseUser | null`), `authLoading` (`boolean`), `customDisplayName` (`string`)
  - `view`: `'home' | 'quiz' | 'results' | 'history' | 'admin'`
  - `grade`: `'2' | '5'` (persisted in `localStorage['learndaily_selected_grade']`)
  - `customApiKey`: `string` (synced from Firestore `admin_settings/gemini_config` on login)
  - `subject`: `'math' | 'japanese' | 'english' | 'english_listening' | 'mixed'`
  - `questions`: `QuestionObject[]`, `currentIndex`: `number`, `answers`: `Record<number, string>`, `timeLeft`: `number`, `latestResult`: `LearningRecord | null`
  - `history`: `LearningRecord[]` (current user), `allRecords`: `LearningRecord[]` (all users, loaded when `isAdmin === true`)
- **Key Handlers**:
  - `handleStartQuiz(selectedSubject)`: Calls `QuestionEngine.generateQuiz(grade, targetSubj, customApiKey)` and transitions `view` to `'quiz'`.
  - `handleStartWeaknessQuiz()`: Deduplicates `wrongQuestions` across `history`, shuffles randomly, and starts a 10-question review quiz.
  - `handleFinishQuiz(submittedAnswers)`: Uses `finishLockRef` mutex to prevent double-submission on timer expiry; computes `score`, `percentage`, `wrongQuestions`, `timeSpent`; updates `localStorage` and writes to Firestore `learning_records`.

#### `src/data/QuestionEngine.js`
Static utility class:
- `setFirestoreDb(dbInstance): void`
- `getTodayJstString(): string` -> `"YYYY-MM-DD"`
- `getDailySetKey(grade, subject, dateStr?): string`
- `isEnglishSubject(subject): boolean`
- `isEnglishQuestionItem(q): boolean`
- `normalizeQuestions(questions, subject, count = 10, preserveOrder = true, choiceSeedPrefix = ''): QuestionObject[]`
- `saveDailyQuizSet(grade, subject, questions, source = 'auto_daily', dateStr?): Promise<boolean>`
- `getTodayDailySetsMap(dateStr?): Promise<Record<string, DailyQuizDocument>>`
- `deleteDailyQuizSet(grade, subject, dateStr?): Promise<void>`
- `buildDeterministicFallbackQuiz(grade, subject, dateStr): QuestionObject[]`
- `fetchQuestionsFromGemini(grade, subject, apiKey, count = 10, customTopic = ''): Promise<QuestionObject[]>`
- `generateQuiz(grade, subject, customApiKey = ''): Promise<QuestionObject[]>`

#### `src/components/PageViews.jsx`
Exports 5 named React components:
1. `HomeView({ db, user, customDisplayName, grade, setGrade, onStartQuiz, onStartWeaknessQuiz, history, isLoadingQuiz })`
2. `QuizRunnerView({ questions, currentIndex, setCurrentIndex, answers, onSelectAnswer, onFinishQuiz, onCancelQuiz, timeLeft, subject, grade })`
3. `ResultsView({ result, questions, answers, subject, grade, onRetry, onBackHome })`
4. `HistoryView({ history, onBackHome })`
5. `AdminView({ db, user, isAdmin, history, allRecords, customApiKey, onSaveApiKey, onBackHome })`

---

## 5. Data Models & Firestore Schemas

### 5.1 Unified `QuestionObject` Schema (JSON)
Every question object across AI generation, `QuestionBank`, `MathGenerator`, `localStorage`, and Firestore MUST conform to this exact shape:

```json
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
  "explanation": "Good morning（グッド モーニング）は朝のあいさつ『おはよう』です。"
}
```

**Field Constraints**:
- `subject`: `'math' | 'japanese' | 'english' | 'mixed'` (Note: `'english_listening'` normalizes `subject` to `'english'` on each item).
- `type`: `'standard' | 'listening'` (MUST be `'standard'` for all non-English subjects).
- `audioText`: `string` (English text passed to `window.speechSynthesis`; MUST be `""` for non-English subjects).
- `choices`: `string[]` (Length `4`).
- `answer`: `string` (MUST strictly equal `===` one element in `choices`).

### 5.2 Firestore Collections

#### Collection 1: `daily_ai_quizzes`
- **Document ID**:
  - Non-English: `{YYYY-MM-DD}_{subject}_{grade}` (e.g., `2026-11-17_math_2`, `2026-11-17_japanese_5`, `2026-11-17_mixed_2`)
  - English: `{YYYY-MM-DD}_{subject}` (e.g., `2026-11-17_english`, `2026-11-17_english_listening`)
- **Document Schema**:
  ```typescript
  interface DailyQuizDocument {
    date: string;                 // JST "YYYY-MM-DD"
    dailyKey: string;             // Same as Document ID
    grade: string;                // "2" | "5"
    subject: string;              // "math" | "japanese" | "english" | "english_listening" | "mixed"
    source: "auto_daily" | "admin_manual";
    updatedAt: string;            // ISO 8601 timestamp
    questions: QuestionObject[];  // Exactly 10 normalized QuestionObjects
  }
  ```

#### Collection 2: `learning_records`
- **Document ID**: Auto-generated Firestore ID
- **Document Schema**:
  ```typescript
  interface LearningRecord {
    uid: string;                  // Firebase Auth UID
    userEmail: string;            // User email
    userName: string;             // Display name at time of completion
    grade: string;                // "2" | "5"
    subject: string;              // "math" | "japanese" | "english" | "english_listening" | "mixed"
    score: number;                // Correct count (0..total)
    total: number;                // Question count (typically 10)
    percentage: number;           // Math.round((score / total) * 100)
    timeSpent: number;            // Elapsed seconds (1..600)
    date: string;                 // ISO 8601 timestamp
    createdAt?: Timestamp;        // Firestore serverTimestamp()
    wrongQuestions: QuestionObject[]; // Incorrect items for weakness review & admin error breakdown
  }
  ```
  *(Note: Full `questions` and `answers` maps are kept in `latestResult` and `localStorage` history, but stripped before writing to `learning_records` in Firestore to keep documents lightweight.)*

#### Collection 3: `admin_settings`
- **Document ID**: `gemini_config`
- **Document Schema**:
  ```typescript
  interface GeminiConfigDocument {
    apiKey: string;               // Google AI Studio Gemini API Key
    updatedAt: string;            // ISO 8601 timestamp
    updatedBy: string;            // Admin email
  }
  ```

### 5.3 Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /learning_records/{recordId} {
      allow read: if request.auth != null && (
        resource.data.uid == request.auth.uid ||
        request.auth.token.email == 'peruqsidiq@gmail.com'
      );
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
    }

    match /daily_ai_quizzes/{quizId} {
      allow read, create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.token.email == 'peruqsidiq@gmail.com';
    }

    match /admin_settings/{docId} {
      allow read: if request.auth != null;
      allow write, delete: if request.auth != null && request.auth.token.email == 'peruqsidiq@gmail.com';
    }
  }
}
```

### 5.4 Browser `localStorage` Keys

| Key Pattern | Value Type | Purpose |
| :--- | :--- | :--- |
| `learndaily_daily_quiz_{dailyKey}` | `JSON.stringify(DailyQuizDocument)` | Fast local cache for today's shared quiz set |
| `learndaily_working_gemini_model` | `string` | Last known working Gemini model name (e.g. `"gemini-2.5-flash"`) |
| `gemini_api_key` | `string` | Cached Gemini API key synced from `admin_settings/gemini_config` |
| `learndaily_selected_grade` | `"2" \| "5"` | User's last selected grade level |
| `learndaily_name_{uid}` | `string` | User's custom display name |
| `learndaily_local_history_{uid}` | `JSON.stringify(LearningRecord[])` | Local backup of up to 100 recent quiz results |

---

## 6. Execution Flows (State Machines)

### 6.1 Quiz Start Resolution Flow (`QuestionEngine.generateQuiz`)
```text
User clicks Start(grade, subject)
  │
  ├─► 1. Check Firestore: daily_ai_quizzes/{dailyKey}
  │       └─► Found? ─► Sanitize (strip English if non-English subject) ─► Cache locally ─► Return 10 questions
  │
  ├─► 2. Check localStorage: learndaily_daily_quiz_{dailyKey}
  │       └─► Found? ─► Sanitize ─► Return 10 questions
  │
  └─► 3. Not created yet today (Acquire inFlightRequests mutex for dailyKey)
          ├─► Resolve API Key (argument -> localStorage -> Firestore admin_settings/gemini_config)
          ├─► If API Key exists:
          │     └─► Call fetchQuestionsFromGemini() (with JSON-mode 400 fallback & model discovery)
          ├─► If API Key missing OR Gemini fails:
          │     └─► Call buildDeterministicFallbackQuiz(grade, subject, todayJST)
          └─► Save to Firestore & localStorage (source: 'auto_daily') ─► Return 10 questions
```

### 6.2 Admin Analytics Aggregation (`AdminView`)
- Merges `liveRecords` (freshly fetched from `learning_records`), `allRecords`, and `history`.
- Groups records by learner key (`rec.uid || rec.userEmail || rec.userName`) to compute per-child KPIs: `totalTests`, `avgRate`, `totalCorrect`, `totalQuestions`, `avgTimeSec`, `todayTests`, `bestSubject`, and `weakestSubject`.
- Applies cross-filters (`selectedLearnerKey` × `statSubjectFilter` × `statPeriodFilter`) to dynamically compute:
  1. 4 summary KPI cards (`totalSessions`, `avgPercentage`, `perfectCount`, `avgTimeSpent`)
  2. Subject breakdown bars (`math`, `japanese`, `english`, `mixed` — average, best score, count)
  3. Top 5 weakness categories aggregated from `wrongQuestions[].category`
  4. 14-day daily activity & accuracy bar chart (`dailyTrend`)
  5. Expandable history table showing per-session `wrongQuestions` on row click.

---

## 7. Verification Checklist for AI-Generated Changes

Before finalizing any code modification, the AI MUST verify:
- [ ] **No English Leakage**: Does `math`, `japanese`, or `mixed` remain 100% free of English questions?
- [ ] **Deterministic Daily Consistency**: If two different users start the same quiz on the same JST day, will they still get identical questions and choice ordering?
- [ ] **No First-Choice Bias**: Are correct answers distributed across indices `0..3` rather than stuck at `choices[0]`?
- [ ] **Firestore Rule Compatibility**: Do any new Firestore reads/writes comply with `firestore.rules` for both normal users and `peruqsidiq@gmail.com`?
- [ ] **Build Safety**: Are all imported Lucide icons (`lucide-react`) valid exports and all JSX tags properly closed?
