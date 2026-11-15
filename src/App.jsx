// src/App.jsx
// LearnDaily メインアプリケーション（Firebase認証・Firestore履歴同期・テスト進行・5画面ルーティング統合）

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import {
  BookOpen,
  Home,
  TrendingUp,
  Shield,
  LogOut,
  LogIn,
  Sparkles,
  Edit3,
  Check,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { AppConfig } from './config/AppConfig';
import { QuestionEngine } from './data/QuestionEngine';
import {
  HomeView,
  QuizRunnerView,
  ResultsView,
  HistoryView,
  AdminView
} from './components/PageViews';

// =========================================================================
// Firebase 初期化（既存インスタンスがあれば再利用）
// =========================================================================
const firebaseConfig = AppConfig?.FIREBASE_CONFIG || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// QuestionEngine へ Firestore インスタンスを登録（AIカスタム問題の全端末同期用）
QuestionEngine.setFirestoreDb(db);

const QUIZ_DURATION_SECONDS = AppConfig?.QUIZ_DURATION_SECONDS || 600;
const ADMIN_EMAIL = AppConfig?.ADMIN_EMAIL || 'peruqsidiq@gmail.com';
const LOCAL_HISTORY_KEY = 'learndaily_local_history';

export default function App() {
  // --- 認証・ユーザー情報 ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // --- 表示名カスタマイズ ---
  const [customDisplayName, setCustomDisplayName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  // --- 画面遷移・学年・APIキー ---
  const [view, setView] = useState('home'); // 'home' | 'quiz' | 'results' | 'history' | 'admin'
  const [grade, setGrade] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('learndaily_selected_grade') || '2';
    }
    return '2';
  });
  const [customApiKey, setCustomApiKey] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || '';
    }
    return '';
  });

  // --- テスト進行状態 ---
  const [subject, setSubject] = useState('math');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [seedOffset, setSeedOffset] = useState(0);

  // --- 学習履歴・管理者用全データ ---
  const [history, setHistory] = useState([]);
  const [allRecords, setAllRecords] = useState([]);

  const isAdmin = Boolean(user && user.email === ADMIN_EMAIL);
  const finishLockRef = useRef(false);

  // =========================================================================
  // 学年変更の永続化
  // =========================================================================
  const handleSelectGrade = useCallback((nextGrade) => {
    setGrade(String(nextGrade));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('learndaily_selected_grade', String(nextGrade));
    }
  }, []);

  // =========================================================================
  // 学習履歴の読み込み（Firestore ＋ ローカルバックアップ統合）
  // =========================================================================
  const loadLearningHistory = useCallback(async (currentUser) => {
    if (!currentUser) {
      setHistory([]);
      setAllRecords([]);
      return;
    }

    let localItems = [];
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`${LOCAL_HISTORY_KEY}_${currentUser.uid}`);
        if (raw) localItems = JSON.parse(raw);
      } catch {
        localItems = [];
      }
    }

    try {
      const recordsCol = collection(db, 'learning_records');
      const userQuery = query(recordsCol, where('uid', '==', currentUser.uid));
      const userSnap = await getDocs(userQuery);

      const cloudItems = [];
      userSnap.forEach((docSnap) => {
        const data = docSnap.data();
        cloudItems.push({
          id: docSnap.id,
          ...data,
          date:
            data.date ||
            (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString())
        });
      });

      const merged = cloudItems.length > 0 ? cloudItems : localItems;
      merged.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
      setHistory(merged);

      // 管理者アカウントの場合は全メンバーの学習記録も取得
      if (currentUser.email === ADMIN_EMAIL) {
        const allSnap = await getDocs(recordsCol);
        const allList = [];
        allSnap.forEach((docSnap) => {
          const data = docSnap.data();
          allList.push({
            id: docSnap.id,
            ...data,
            date:
              data.date ||
              (data.createdAt?.toDate
                ? data.createdAt.toDate().toISOString()
                : new Date().toISOString())
          });
        });
        allList.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
        setAllRecords(allList);
      }
    } catch (err) {
      console.warn('Firestore履歴取得エラー（ローカル履歴を表示します）:', err);
      setHistory(localItems);
    }
  }, []);

  // =========================================================================
  // Firebase 認証監視
  // =========================================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const savedName =
          typeof localStorage !== 'undefined'
            ? localStorage.getItem(`learndaily_name_${firebaseUser.uid}`)
            : '';
        const initialName =
          savedName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'チャレンジャー';
        setCustomDisplayName(initialName);
        setNameDraft(initialName);
        await loadLearningHistory(firebaseUser);
      } else {
        setHistory([]);
        setAllRecords([]);
        setView('home');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [loadLearningHistory]);

  // =========================================================================
  // テスト結果の集計・保存（手動完了＆タイムアップ共通）
  // =========================================================================
  const handleFinishQuiz = useCallback(
    async (submittedAnswers) => {
      if (finishLockRef.current) return;
      finishLockRef.current = true;

      const finalAnswers = submittedAnswers || answers;
      const total = questions.length || 10;
      let score = 0;
      const wrongQuestions = [];

      questions.forEach((q, idx) => {
        const userAns = finalAnswers[idx];
        if (userAns === q.answer) {
          score += 1;
        } else {
          wrongQuestions.push({
            id: q.id || `wrong_${Date.now()}_${idx}`,
            subject: q.subject || subject,
            type: q.type || 'standard',
            audioText: q.audioText || '',
            category: q.category || '復習問題',
            question: q.question,
            choices: q.choices,
            answer: q.answer,
            explanation: q.explanation
          });
        }
      });

      const timeSpent = Math.max(1, QUIZ_DURATION_SECONDS - timeLeft);
      const nowIso = new Date().toISOString();

      const resultPayload = {
        uid: user?.uid || 'guest',
        userEmail: user?.email || '',
        userName: customDisplayName || user?.displayName || 'チャレンジャー',
        grade: String(grade),
        subject,
        score,
        total,
        percentage: Math.round((score / total) * 100),
        timeSpent,
        date: nowIso,
        questions,
        answers: finalAnswers,
        wrongQuestions
      };

      setLatestResult(resultPayload);
      setView('results');

      // ローカル履歴へ即時反映
      const updatedLocal = [resultPayload, ...history];
      setHistory(updatedLocal);
      if (user && typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(
            `${LOCAL_HISTORY_KEY}_${user.uid}`,
            JSON.stringify(updatedLocal.slice(0, 100))
          );
        } catch (e) {
          console.warn('ローカル履歴保存スキップ:', e);
        }
      }

      // Firestore へ学習記録を永続保存
      if (user) {
        try {
          const { questions: _omitQ, answers: _omitA, ...firestoreRecord } = resultPayload;
          await addDoc(collection(db, 'learning_records'), {
            ...firestoreRecord,
            createdAt: serverTimestamp()
          });
          await loadLearningHistory(user);
        } catch (err) {
          console.warn('Firestore学習記録保存エラー:', err);
        }
      }
    },
    [answers, questions, subject, timeLeft, user, customDisplayName, grade, history, loadLearningHistory]
  );

  // =========================================================================
  // 制限時間カウントダウンタイマー（テスト画面実行中のみ動作）
  // =========================================================================
  useEffect(() => {
    if (view !== 'quiz' || questions.length === 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          handleFinishQuiz(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [view, questions.length, answers, handleFinishQuiz]);

  // =========================================================================
  // テスト開始ハンドラー
  // =========================================================================
  const handleStartQuiz = async (selectedSubject) => {
    const targetSubj = selectedSubject || 'math';
    setIsLoadingQuiz(true);
    finishLockRef.current = false;

    try {
      const nextOffset = seedOffset + 1;
      setSeedOffset(nextOffset);

      const generated = await QuestionEngine.generateQuiz(
        grade,
        targetSubj,
        customApiKey,
        nextOffset
      );

      setSubject(targetSubj);
      setQuestions(generated);
      setCurrentIndex(0);
      setAnswers({});
      setTimeLeft(QUIZ_DURATION_SECONDS);
      setLatestResult(null);
      setView('quiz');
    } catch (err) {
      console.error('問題生成エラー:', err);
      alert('問題の準備中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // =========================================================================
  // 弱点克服リベンジモード開始
  // =========================================================================
  const handleStartWeaknessQuiz = async () => {
    const wrongPool = [];
    const seenQuestions = new Set();

    history.forEach((item) => {
      if (Array.isArray(item.wrongQuestions)) {
        item.wrongQuestions.forEach((wq) => {
          if (wq && wq.question && !seenQuestions.has(wq.question)) {
            seenQuestions.add(wq.question);
            wrongPool.push(wq);
          }
        });
      }
    });

    if (wrongPool.length === 0) {
      await handleStartQuiz('mixed');
      return;
    }

    finishLockRef.current = false;
    const normalized = QuestionEngine.normalizeQuestions(wrongPool, 'mixed', 10);
    setSubject('mixed');
    setQuestions(normalized);
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(QUIZ_DURATION_SECONDS);
    setLatestResult(null);
    setView('quiz');
  };

  // =========================================================================
  // 選択肢クリック・テスト中断・APIキー・表示名保存
  // =========================================================================
  const handleSelectAnswer = (qIndex, choice) => {
    setAnswers((prev) => ({
      ...prev,
      [qIndex]: choice
    }));
  };

  const handleCancelQuiz = () => {
    finishLockRef.current = false;
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setView('home');
  };

  const handleSaveApiKey = (newKey) => {
    setCustomApiKey(newKey);
    if (typeof localStorage !== 'undefined') {
      if (newKey) localStorage.setItem('gemini_api_key', newKey);
      else localStorage.removeItem('gemini_api_key');
    }
  };

  const handleSaveDisplayName = () => {
    const trimmed = nameDraft.trim();
    if (!trimmed) {
      setIsEditingName(false);
      return;
    }
    setCustomDisplayName(trimmed);
    if (user && typeof localStorage !== 'undefined') {
      localStorage.setItem(`learndaily_name_${user.uid}`, trimmed);
    }
    setIsEditingName(false);
  };

  // =========================================================================
  // 認証ハンドラー（Googleログイン / メール＆パスワード）
  // =========================================================================
  const handleGoogleLogin = async () => {
    setAuthError('');
    setIsSubmittingAuth(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Googleログインエラー:', err);
      setAuthError('Googleログインに失敗しました。ポップアップ設定を確認してください。');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput) return;
    setAuthError('');
    setIsSubmittingAuth(true);

    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      } else {
        await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      }
    } catch (err) {
      console.error('メール認証エラー:', err);
      setAuthError(
        authMode === 'signup'
          ? 'アカウント作成に失敗しました（パスワードは6文字以上必要です）。'
          : 'メールアドレスまたはパスワードが正しくありません。'
      );
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setView('home');
  };

  // =========================================================================
  // ローディング画面
  // =========================================================================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
        <p className="text-sm font-extrabold text-slate-600">LearnDaily を読み込み中...</p>
      </div>
    );
  }

  // =========================================================================
  // 未ログイン時のログイン画面
  // =========================================================================
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-sky-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              未来を生き抜く思考力＆英語トレーニング
            </div>
            <h1 className="text-2xl font-black text-slate-800">
              {AppConfig?.APP_TITLE || 'LearnDaily'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              毎日の小さな挑戦で、自分で考え抜く力と語学力を育てよう
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmittingAuth}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2.5 shadow-2xs mb-5"
          >
            <LogIn className="w-4 h-4 text-indigo-600" />
            Googleアカウントでログイン
          </button>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink mx-3 text-xs font-bold text-slate-400">
              またはメールアドレスで続ける
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="メールアドレス"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="パスワード（6文字以上）"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl transition shadow-sm"
            >
              {isSubmittingAuth
                ? '処理中...'
                : authMode === 'login'
                ? 'ログインする'
                : '新規アカウント登録'}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'signup' : 'login');
                setAuthError('');
              }}
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              {authMode === 'login'
                ? 'はじめての方はこちら（新規登録）'
                : 'すでにアカウントをお持ちの方（ログイン）'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ログイン後のメインレイアウト（共通ヘッダー ＋ 各画面ビュー）
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* 共通ナビゲーションヘッダー */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          {/* ブランドロゴ */}
          <button
            type="button"
            onClick={() => {
              if (view !== 'quiz') setView('home');
            }}
            className="flex items-center gap-2.5 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-800 block leading-none">
                {AppConfig?.APP_TITLE || 'LearnDaily'}
              </span>
              <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                思考力・英語トレーニング
              </span>
            </div>
          </button>

          {/* ナビゲーションボタン（テスト中は誤操作防止のため非表示） */}
          {view !== 'quiz' && (
            <nav className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setView('home')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center gap-1.5 ${
                  view === 'home'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>ホーム</span>
              </button>

              <button
                type="button"
                onClick={() => setView('history')}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center gap-1.5 ${
                  view === 'history'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>記録</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setView('admin')}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center gap-1.5 ${
                    view === 'admin'
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>管理</span>
                </button>
              )}
            </nav>
          )}

          {/* 右側：表示名編集 ＆ ログアウト */}
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="w-24 sm:w-32 px-2 py-1 text-xs font-bold border border-indigo-300 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveDisplayName}
                  className="p-1.5 bg-indigo-600 text-white rounded-lg"
                  title="保存"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setNameDraft(customDisplayName);
                  setIsEditingName(true);
                }}
                title="表示名を変更"
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
              >
                <span>{customDisplayName}</span>
                <Edit3 className="w-3 h-3 text-slate-400" />
              </button>
            )}

            {view !== 'quiz' && (
              <button
                type="button"
                onClick={handleLogout}
                title="ログアウト"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* メインビュー表示領域 */}
      <main className="flex-1 pb-12">
        {view === 'home' && (
          <HomeView
            db={db}
            user={user}
            customDisplayName={customDisplayName}
            grade={grade}
            setGrade={handleSelectGrade}
            onStartQuiz={handleStartQuiz}
            onStartWeaknessQuiz={handleStartWeaknessQuiz}
            history={history}
            isLoadingQuiz={isLoadingQuiz}
          />
        )}

        {view === 'quiz' && (
          <QuizRunnerView
            questions={questions}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            answers={answers}
            onSelectAnswer={handleSelectAnswer}
            onFinishQuiz={handleFinishQuiz}
            onCancelQuiz={handleCancelQuiz}
            timeLeft={timeLeft}
            subject={subject}
            grade={grade}
          />
        )}

        {view === 'results' && (
          <ResultsView
            result={latestResult}
            questions={questions}
            answers={answers}
            subject={subject}
            grade={grade}
            onRetry={(subj) => handleStartQuiz(subj || subject)}
            onBackHome={() => setView('home')}
          />
        )}

        {view === 'history' && (
          <HistoryView
            history={history}
            onBackHome={() => setView('home')}
          />
        )}

        {view === 'admin' && (
          <AdminView
            db={db}
            user={user}
            isAdmin={isAdmin}
            history={history}
            allRecords={allRecords}
            customApiKey={customApiKey}
            onSaveApiKey={handleSaveApiKey}
            onBackHome={() => setView('home')}
          />
        )}
      </main>
    </div>
  );
}
