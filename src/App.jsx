// src/App.jsx
// メインアプリケーションコントローラー（PageViews.jsx / QuestionEngine.js / FirebaseService.js 統合版）

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppConfig } from './config/AppConfig';
import { QuestionEngine } from './data/QuestionEngine';
import { FirebaseService } from './services/FirebaseService';
import {
  LoginGateView,
  EditNameModal,
  AppHeader
} from './components/CommonUI';
import {
  HomeView,
  QuizRunnerView,
  ResultsView,
  HistoryView,
  AdminView
} from './components/PageViews';

const DEFAULT_TIME_LIMIT = 600; // 10分（600秒）

export default function App() {
  // --- 認証・ユーザー状態 ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [customDisplayName, setCustomDisplayName] = useState('');
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);

  // --- 画面遷移・学年・APIキー状態 ---
  const [view, setView] = useState('home'); // 'home' | 'quiz' | 'results' | 'history' | 'admin'
  const [grade, setGrade] = useState('2'); // '2' | '5'
  const [customApiKey, setCustomApiKey] = useState(() => {
    try {
      return typeof localStorage !== 'undefined'
        ? localStorage.getItem('gemini_api_key') || ''
        : '';
    } catch {
      return '';
    }
  });

  // --- テスト実行状態 ---
  const [subject, setSubject] = useState('math');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIME_LIMIT);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [latestResult, setLatestResult] = useState(null);

  // --- 学習履歴状態 ---
  const [history, setHistory] = useState([]);

  // タイマー終了時の二重送信防止用Ref
  const finishingRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const adminEmail = AppConfig?.ADMIN_EMAIL || 'peruqsidiq@gmail.com';
  const isAdmin = Boolean(user?.email && user.email === adminEmail);

  // -------------------------------------------------------------------------
  // 1. Firebase 認証監視と初期データ読み込み
  // -------------------------------------------------------------------------
  const loadUserRecords = useCallback(async (uid) => {
    if (!uid) return;
    try {
      if (FirebaseService && typeof FirebaseService.getUserRecords === 'function') {
        const recs = await FirebaseService.getUserRecords(uid);
        if (Array.isArray(recs)) {
          setHistory(recs);
          return;
        }
      }
      if (FirebaseService && typeof FirebaseService.fetchRecords === 'function') {
        const recs = await FirebaseService.fetchRecords(uid);
        if (Array.isArray(recs)) {
          setHistory(recs);
          return;
        }
      }
    } catch (err) {
      console.warn('Firestoreからの履歴取得をローカルバックアップへフォールバック:', err);
    }

    // ローカルストレージのバックアップ読み込み
    try {
      const raw = localStorage.getItem(`learndaily_history_${uid}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setHistory(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let unsubscribe = null;

    if (FirebaseService && typeof FirebaseService.onAuthChange === 'function') {
      unsubscribe = FirebaseService.onAuthChange((currentUser) => {
        setUser(currentUser || null);
        if (currentUser) {
          const savedName =
            localStorage.getItem(`learndaily_name_${currentUser.uid}`) ||
            currentUser.displayName ||
            '';
          setCustomDisplayName(savedName);
          loadUserRecords(currentUser.uid);
        } else {
          setHistory([]);
          setView('home');
        }
        setAuthLoading(false);
      });
    } else {
      setAuthLoading(false);
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [loadUserRecords]);

  // -------------------------------------------------------------------------
  // 2. テスト開始ハンドラ（英語・算数・国語・総合すべてに対応）
  // -------------------------------------------------------------------------
  const handleStartQuiz = useCallback(
    async (selectedSubject) => {
      const targetSubject = selectedSubject || 'math';
      setIsLoadingQuiz(true);
      finishingRef.current = false;

      try {
        const generatedQuestions = await QuestionEngine.generateQuiz(
          grade,
          targetSubject,
          customApiKey
        );

        if (!generatedQuestions || generatedQuestions.length === 0) {
          alert('問題の読み込みに失敗しました。もう一度お試しください。');
          return;
        }

        setSubject(targetSubject);
        setQuestions(generatedQuestions);
        setCurrentIndex(0);
        setAnswers({});
        setTimeLeft(DEFAULT_TIME_LIMIT);
        setLatestResult(null);
        setView('quiz');
      } catch (error) {
        console.error('テスト開始エラー:', error);
        alert('問題の準備中にエラーが発生しました。');
      } finally {
        setIsLoadingQuiz(false);
      }
    },
    [grade, customApiKey]
  );

  // -------------------------------------------------------------------------
  // 3. 弱点克服モード開始ハンドラ
  // -------------------------------------------------------------------------
  const handleStartWeaknessQuiz = useCallback(() => {
    const wrongPool = [];
    history.forEach((rec) => {
      if (Array.isArray(rec.wrongQuestions)) {
        rec.wrongQuestions.forEach((wq) => {
          if (wq && wq.question && Array.isArray(wq.choices)) {
            wrongPool.push(wq);
          }
        });
      }
    });

    if (wrongPool.length === 0) {
      handleStartQuiz('mixed');
      return;
    }

    // 重複を除去して最大10問抽出
    const uniqueMap = new Map();
    wrongPool.forEach((q) => uniqueMap.set(q.question, q));
    const uniqueQuestions = Array.from(uniqueMap.values()).slice(0, 10);

    finishingRef.current = false;
    setSubject('mixed');
    setQuestions(uniqueQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(DEFAULT_TIME_LIMIT);
    setLatestResult(null);
    setView('quiz');
  }, [history, handleStartQuiz]);

  // -------------------------------------------------------------------------
  // 4. 回答選択＆テスト完了（採点・Firestore保存）ハンドラ
  // -------------------------------------------------------------------------
  const handleSelectAnswer = useCallback((questionIdx, choice) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIdx]: choice
    }));
  }, []);

  const handleFinishQuiz = useCallback(
    async (submittedAnswers) => {
      if (finishingRef.current) return;
      finishingRef.current = true;

      const finalAnswers = submittedAnswers || answersRef.current || {};
      const total = questions.length || 10;
      let score = 0;
      const wrongQuestions = [];

      questions.forEach((q, idx) => {
        if (finalAnswers[idx] === q.answer) {
          score += 1;
        } else {
          wrongQuestions.push(q);
        }
      });

      const timeSpent = Math.max(1, DEFAULT_TIME_LIMIT - timeLeft);
      const displayName =
        customDisplayName || user?.displayName || user?.email?.split('@')[0] || 'メンバー';

      const recordPayload = {
        uid: user?.uid || 'local',
        userName: displayName,
        userEmail: user?.email || '',
        grade: subject === 'english' ? 'common' : String(grade),
        subject,
        score,
        total,
        timeSpent,
        date: new Date().toISOString(),
        wrongQuestions
      };

      const fullResult = {
        ...recordPayload,
        questions,
        answers: finalAnswers
      };

      setLatestResult(fullResult);
      setView('results');

      // 履歴ステートとローカルストレージを即時更新
      const nextHistory = [{ id: `local_${Date.now()}`, ...recordPayload }, ...history];
      setHistory(nextHistory);

      if (user?.uid) {
        try {
          localStorage.setItem(`learndaily_history_${user.uid}`, JSON.stringify(nextHistory));
        } catch {
          // ignore
        }

        try {
          if (FirebaseService && typeof FirebaseService.saveRecord === 'function') {
            await FirebaseService.saveRecord(user.uid, recordPayload);
          } else if (FirebaseService && typeof FirebaseService.addRecord === 'function') {
            await FirebaseService.addRecord(user.uid, recordPayload);
          }
        } catch (err) {
          console.warn('Firestoreへの成績保存エラー（ローカルには保存済み）:', err);
        }
      }
    },
    [questions, timeLeft, customDisplayName, user, subject, grade, history]
  );

  // -------------------------------------------------------------------------
  // 5. カウントダウンタイマー制御
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (view !== 'quiz') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz(answersRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [view, handleFinishQuiz]);

  // -------------------------------------------------------------------------
  // 6. 表示名変更・ログアウトハンドラ
  // -------------------------------------------------------------------------
  const handleSaveDisplayName = async (newName) => {
    const trimmed = (newName || '').trim();
    if (!trimmed) return;

    setCustomDisplayName(trimmed);
    if (user?.uid) {
      try {
        localStorage.setItem(`learndaily_name_${user.uid}`, trimmed);
      } catch {
        // ignore
      }
      if (FirebaseService && typeof FirebaseService.updateUserDisplayName === 'function') {
        await FirebaseService.updateUserDisplayName(trimmed);
      }
    }
    setIsEditNameOpen(false);
  };

  const handleLogout = async () => {
    if (FirebaseService && typeof FirebaseService.logout === 'function') {
      await FirebaseService.logout();
    }
    setUser(null);
    setView('home');
  };

  // -------------------------------------------------------------------------
  // 7. 画面レンダリング
  // -------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-900 font-black text-2xl flex items-center justify-center shadow-md mb-3 animate-bounce">
          {AppConfig?.APP_ICON || '未'}
        </div>
        <p className="text-sm font-extrabold text-slate-700">
          {AppConfig?.APP_TITLE || '未来を生き抜く 思考力トレーニング'} を起動中...
        </p>
      </div>
    );
  }

  // 未ログイン時はログインゲート画面を表示
  if (!user) {
    return <LoginGateView onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* 共通ヘッダー */}
      <AppHeader
        user={user}
        customDisplayName={customDisplayName}
        isAdmin={isAdmin}
        currentView={view}
        view={view}
        setView={setView}
        onNavigate={setView}
        onOpenEditName={() => setIsEditNameOpen(true)}
        onLogout={handleLogout}
      />

      {/* メインコンテンツ領域 */}
      <main className="flex-1 pb-12">
        {view === 'home' && (
          <HomeView
            user={user}
            customDisplayName={customDisplayName}
            grade={grade}
            setGrade={setGrade}
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
            onCancelQuiz={() => setView('home')}
            onBackHome={() => setView('home')}
            setView={setView}
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
            onRetry={handleStartQuiz}
            onStartQuiz={handleStartQuiz}
            onBackHome={() => setView('home')}
            setView={setView}
          />
        )}

        {view === 'history' && (
          <HistoryView
            history={history}
            onBackHome={() => setView('home')}
            setView={setView}
          />
        )}

        {view === 'admin' && (
          <AdminView
            user={user}
            isAdmin={isAdmin}
            history={history}
            customApiKey={customApiKey}
            onSaveApiKey={setCustomApiKey}
            onBackHome={() => setView('home')}
            setView={setView}
          />
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        {AppConfig?.APP_TITLE || '未来を生き抜く 思考力トレーニング'} — LearnDaily
      </footer>

      {/* 表示名変更モーダル */}
      {isEditNameOpen && (
        <EditNameModal
          isOpen={isEditNameOpen}
          currentName={customDisplayName || user?.displayName || ''}
          onSave={handleSaveDisplayName}
          onClose={() => setIsEditNameOpen(false)}
        />
      )}
    </div>
  );
}
