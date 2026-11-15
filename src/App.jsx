import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppConfig } from './config/AppConfig.js';
import { QuizUtils } from './utils/QuizUtils.js';
import { QuestionEngine } from './data/QuestionEngine.js';
import { firebaseService } from './services/FirebaseService.js';
import { LoginGateView, EditNameModal, AppHeader } from './components/CommonUI.jsx';
import { HomeView, QuizRunnerView, ResultsView, HistoryView, AdminView } from './components/PageViews.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [customDisplayName, setCustomDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);

  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState(() => {
    try {
      return localStorage.getItem(AppConfig.LOCAL_GEMINI_KEY) || '';
    } catch {
      return '';
    }
  });
  const [apiKeySavedToast, setApiKeySavedToast] = useState(false);

  const [activeTab, setActiveTab] = useState('home');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedGrade, setSelectedGrade] = useState('grade2');
  const [sessionAttemptCount, setSessionAttemptCount] = useState(0);
  const [adminSelectedChildName, setAdminSelectedChildName] = useState('ALL');
  const [historyPeriodFilter, setHistoryPeriodFilter] = useState('ALL');
  const [customSearchDate, setCustomSearchDate] = useState('');

  const [isTimerEnabled, setIsTimerEnabled] = useState(true);
  const [timeLeftSec, setTimeLeftSec] = useState(900);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [wasAutoSubmittedByTimeout, setWasAutoSubmittedByTimeout] = useState(false);
  const [timedOutTrigger, setTimedOutTrigger] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [historyDocs, setHistoryDocs] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  const latestQuizStateRef = useRef({ userAnswers: [], currentIdx: 0, selectedOption: null });
  useEffect(() => {
    latestQuizStateRef.current = { userAnswers, currentIdx, selectedOption };
  }, [userAnswers, currentIdx, selectedOption]);

  const isParentAdmin = useMemo(() => {
    return Boolean(
      user &&
      !user.isAnonymous &&
      user.email &&
      user.email.toLowerCase() === AppConfig.ADMIN_EMAIL
    );
  }, [user]);

  const currentUserDisplayName = useMemo(() => {
    if (!user) return '';
    if (customDisplayName && customDisplayName.trim()) return customDisplayName.trim();
    if (user.displayName && user.displayName.trim()) return user.displayName.trim();
    if (user.email) return user.email.split('@')[0];
    return '学習メンバー';
  }, [user, customDisplayName]);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeAuth((currentUser) => {
      setUser(currentUser);
      setCustomDisplayName(currentUser?.displayName || '');
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeTab === 'admin' && !isParentAdmin) {
      setActiveTab('home');
    }
  }, [activeTab, isParentAdmin]);

  useEffect(() => {
    if (!user || user.isAnonymous) {
      setHistoryDocs([]);
      return;
    }
    const unsubscribe = firebaseService.subscribeFamilyResults(
      (items) => setHistoryDocs(items),
      (fallbackItems) => setHistoryDocs(fallbackItems)
    );
    return () => unsubscribe();
  }, [user]);

  const myHistoryDocs = useMemo(() => {
    if (!user) return [];
    if (isParentAdmin) return historyDocs;
    return historyDocs.filter(
      d => d.userUid === user.uid || (user.email && d.userEmail === user.email)
    );
  }, [historyDocs, user, isParentAdmin]);

  const wrongQuestionsPool = useMemo(() => {
    if (!myHistoryDocs || myHistoryDocs.length === 0) return [];
    const seenQuestions = new Set();
    const collected = [];

    myHistoryDocs.forEach((docItem) => {
      if (!Array.isArray(docItem.answeredBreakdown)) return;
      docItem.answeredBreakdown.forEach((entry) => {
        if (!entry.isCorrect && entry.question && Array.isArray(entry.options) && !seenQuestions.has(entry.question)) {
          seenQuestions.add(entry.question);
          collected.push({
            id: entry.questionId || `weak_${collected.length}`,
            category: `${entry.category || '復習'}（${docItem.gradeLabel || '過去問'}）`,
            categoryName: entry.category || "思考力",
            question: entry.question,
            options: entry.options,
            correctIndex: entry.correctIndex,
            explanation: entry.explanation || "解説を確認して解き直しましょう。"
          });
        }
      });
    });

    return collected;
  }, [myHistoryDocs]);

  const streakInfo = useMemo(() => {
    const todayStr = QuizUtils.getTodayDateString();
    if (!myHistoryDocs || myHistoryDocs.length === 0) return { streak: 0, testedToday: false };

    const dates = Array.from(new Set(
      myHistoryDocs.map(item => {
        if (item.dateIso) return item.dateIso;
        if (!item.timestamp) return null;
        const d = new Date(item.timestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }).filter(Boolean)
    )).sort().reverse();

    const testedToday = dates.includes(todayStr);
    let streak = 0;
    let checkDate = new Date();
    if (!testedToday) checkDate.setDate(checkDate.getDate() - 1);

    while (true) {
      const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (dates.includes(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { streak, testedToday };
  }, [myHistoryDocs]);

  useEffect(() => {
    if (activeTab !== 'quiz' || currentQuestions.length === 0) return;

    const intervalId = setInterval(() => {
      setElapsedSec(prev => prev + 1);
      if (isTimerEnabled) {
        setTimeLeftSec(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setTimedOutTrigger(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeTab, isTimerEnabled, currentQuestions.length]);

  useEffect(() => {
    if (!timedOutTrigger || activeTab !== 'quiz') return;
    setTimedOutTrigger(false);
    const { userAnswers: curAns, currentIdx: curIdx, selectedOption: curOpt } = latestQuizStateRef.current;
    const finalized = [...curAns];
    if (curOpt !== null) finalized[curIdx] = curOpt;
    finishQuiz(finalized, true);
  }, [timedOutTrigger, activeTab]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await firebaseService.loginWithGoogle();
    } catch (err) {
      if (err.code === 'auth/unauthorized-domain') {
        setLoginError("現在のWebドメインがFirebaseで未承認です。Firebase Console の Authentication → 設定 → 承認済みドメイン に現在のURLを追加してください。");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setLoginError("ログイン画面が閉じられました。もう一度ボタンを押してログインしてください。");
      } else {
        setLoginError(`Googleログインに失敗しました（${err.code || 'エラー'}）。`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuthSubmit = async ({ authMode, emailInput, passwordInput, childNameInput }) => {
    if (!emailInput.trim() || !passwordInput.trim()) {
      setLoginError("メールアドレスとパスワードを入力してください。");
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      if (authMode === 'register') {
        if (!childNameInput.trim()) {
          setLoginError("お子様のお名前（表示名）を入力してください。");
          setIsLoggingIn(false);
          return;
        }
        const registeredUser = await firebaseService.registerWithEmail(emailInput, passwordInput, childNameInput);
        setUser(registeredUser);
        setCustomDisplayName(childNameInput.trim());
      } else {
        await firebaseService.loginWithEmail(emailInput, passwordInput);
      }
    } catch (err) {
      if (err.code === 'auth/operation-not-allowed') {
        setLoginError("Firebase側でメール/パスワード認証がまだ有効化されていません。「Googleアカウントでログイン」をご利用ください。");
      } else if (err.code === 'auth/email-already-in-use') {
        setLoginError("このメールアドレスは既に登録されています。「ログイン」タブからログインしてください。");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setLoginError("メールアドレスまたはパスワードが正しくありません。");
      } else if (err.code === 'auth/weak-password') {
        setLoginError("パスワードは6文字以上で設定してください。");
      } else {
        setLoginError(`認証エラーが発生しました（${err.code}）。`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSaveDisplayName = async (newName) => {
    if (!user) return;
    try {
      await firebaseService.updateUserDisplayName(user, newName);
      setCustomDisplayName(newName.trim());
    } catch (err) {
      console.error("Failed to update display name:", err);
    } finally {
      setIsEditingName(false);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseService.logout();
      setActiveTab('home');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSaveGeminiApiKey = () => {
    try {
      localStorage.setItem(AppConfig.LOCAL_GEMINI_KEY, geminiApiKeyInput.trim());
      setApiKeySavedToast(true);
      setTimeout(() => setApiKeySavedToast(false), 3000);
    } catch {}
  };

  const initializeQuizSession = (questions, subjectKey) => {
    setSelectedSubject(subjectKey);
    setCurrentQuestions(questions);
    setCurrentIdx(0);
    setUserAnswers(new Array(questions.length).fill(null));
    setSelectedOption(null);
    setQuizStartTime(Date.now());
    setElapsedSec(0);
    setTimeLeftSec(questions.length * 90);
    setWasAutoSubmittedByTimeout(false);
    setTimedOutTrigger(false);
    setActiveTab('quiz');
  };

  const startSubjectQuiz = (subject) => {
    if (!user) return;
    const nextAttempt = sessionAttemptCount + 1;
    setSessionAttemptCount(nextAttempt);
    const questions = QuestionEngine.getSubjectQuestions(subject, selectedGrade, nextAttempt);
    initializeQuizSession(questions, subject);
  };

  const startDailyTest = async () => {
    if (!user) return;
    const nextAttempt = sessionAttemptCount + 1;
    setSessionAttemptCount(nextAttempt);
    setIsGeneratingAI(true);
    const questions = await QuestionEngine.fetchDailyQuestions(selectedGrade, nextAttempt);
    setIsGeneratingAI(false);
    initializeQuizSession(questions, 'daily');
  };

  const startWeaknessQuiz = () => {
    if (!user || wrongQuestionsPool.length === 0) return;
    const selectedWeak = QuizUtils.shuffleArray(wrongQuestionsPool)
      .slice(0, 10)
      .map(QuizUtils.randomizeQuestionOptions);
    initializeQuizSession(selectedWeak, 'weakness');
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIdx] = selectedOption;
    setUserAnswers(updatedAnswers);

    if (currentIdx + 1 < currentQuestions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(updatedAnswers[currentIdx + 1]);
    } else {
      finishQuiz(updatedAnswers, false);
    }
  };

  const finishQuiz = async (finalAnswers, isTimeout = false) => {
    setWasAutoSubmittedByTimeout(isTimeout);
    const durationSec = Math.round((Date.now() - (quizStartTime || Date.now())) / 1000);
    const now = new Date();
    const dateIsoStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let correctCount = 0;
    const categoryStats = {};

    const answeredBreakdown = currentQuestions.map((q, idx) => {
      const uAns = finalAnswers[idx];
      const isCorrect = uAns !== null && uAns === q.correctIndex;
      if (isCorrect) correctCount++;

      const cat = q.categoryName || "思考力";
      if (!categoryStats[cat]) categoryStats[cat] = { correct: 0, total: 0 };
      categoryStats[cat].total += 1;
      if (isCorrect) categoryStats[cat].correct += 1;

      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        userAnswerIndex: uAns,
        correctIndex: q.correctIndex,
        isCorrect: isCorrect,
        category: cat,
        explanation: q.explanation
      };
    });

    const totalQ = currentQuestions.length;
    const percentage = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

    const recordData = {
      timestamp: Date.now(),
      dateIso: dateIsoStr,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      dateStr: now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      subject: selectedSubject,
      grade: selectedGrade,
      gradeLabel: selectedGrade === 'grade2' ? '小学2年生' : '小学5年生',
      score: correctCount,
      totalQuestions: totalQ,
      percentage: percentage,
      durationSec: durationSec,
      wasTimeout: isTimeout,
      categoryStats: categoryStats,
      answeredBreakdown: answeredBreakdown,
      userUid: user?.uid || '',
      userDisplayName: currentUserDisplayName,
      userEmail: user?.email || ''
    };

    await firebaseService.saveQuizResult(recordData);

    try {
      const newHistory = [recordData, ...historyDocs];
      setHistoryDocs(newHistory);
      localStorage.setItem(AppConfig.LOCAL_HISTORY_KEY, JSON.stringify(newHistory));
    } catch {}

    setSelectedHistoryItem(recordData);
    setActiveTab('results');
  };

  const filteredHistoryDocs = useMemo(() => {
    let list = activeTab === 'admin' ? [...historyDocs] : [...myHistoryDocs];

    if (activeTab === 'admin' && adminSelectedChildName !== 'ALL') {
      list = list.filter(item => item.userDisplayName === adminSelectedChildName);
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (historyPeriodFilter === 'THIS_MONTH') {
      list = list.filter(item => item.year === currentYear && item.month === currentMonth);
    } else if (historyPeriodFilter === 'LAST_MONTH') {
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      list = list.filter(item => item.year === lastMonthYear && item.month === lastMonth);
    } else if (historyPeriodFilter === 'LAST_30') {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      list = list.filter(item => (item.timestamp || 0) >= thirtyDaysAgo);
    } else if (historyPeriodFilter === 'CUSTOM_DATE' && customSearchDate) {
      list = list.filter(item => item.dateIso === customSearchDate);
    }

    return list;
  }, [activeTab, historyDocs, myHistoryDocs, adminSelectedChildName, historyPeriodFilter, customSearchDate]);

  const childNamesList = useMemo(() => {
    return Array.from(new Set(historyDocs.map(d => d.userDisplayName).filter(Boolean)));
  }, [historyDocs]);

  const calendar30Days = useMemo(() => {
    const days = [];
    const testedDates = new Set(filteredHistoryDocs.map(item => item.dateIso));
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        iso,
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        isTested: testedDates.has(iso)
      });
    }
    return days;
  }, [filteredHistoryDocs]);

  const radarData = useMemo(() => {
    const totals = {};
    filteredHistoryDocs.forEach(doc => {
      if (!doc.categoryStats) return;
      Object.entries(doc.categoryStats).forEach(([cat, val]) => {
        if (!totals[cat]) totals[cat] = { correct: 0, total: 0 };
        totals[cat].correct += val.correct;
        totals[cat].total += val.total;
      });
    });

    return AppConfig.RADAR_CATEGORIES.map(cat => ({
      subject: cat,
      score: totals[cat] && totals[cat].total > 0
        ? Math.round((totals[cat].correct / totals[cat].total) * 100)
        : 75
    }));
  }, [filteredHistoryDocs]);

  const scoreTrendData = useMemo(() => {
    return [...filteredHistoryDocs].reverse().map(item => ({
      date: item.dateStr || '前',
      score: item.percentage
    }));
  }, [filteredHistoryDocs]);

  const averageScore = filteredHistoryDocs.length > 0
    ? Math.round(filteredHistoryDocs.reduce((acc, curr) => acc + curr.percentage, 0) / filteredHistoryDocs.length)
    : 0;

  const currentRank = QuizUtils.getRankBadge(averageScore);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl mb-4 animate-bounce">
          {AppConfig.APP_BADGE_CHAR}
        </div>
        <p className="text-sm font-bold text-slate-300">認証状態を確認しています...</p>
      </div>
    );
  }

  if (!user || user.isAnonymous) {
    return (
      <LoginGateView
        onGoogleLogin={handleGoogleLogin}
        onEmailSubmit={handleEmailAuthSubmit}
        isLoggingIn={isLoggingIn}
        loginError={loginError}
        setLoginError={setLoginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {isEditingName && (
        <EditNameModal
          currentName={currentUserDisplayName}
          onSave={handleSaveDisplayName}
          onCancel={() => setIsEditingName(false)}
        />
      )}

      <AppHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isParentAdmin={isParentAdmin}
        displayName={currentUserDisplayName}
        userEmail={user?.email}
        onEditName={() => setIsEditingName(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'home' && (
          <HomeView
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
            isTimerEnabled={isTimerEnabled}
            setIsTimerEnabled={setIsTimerEnabled}
            displayName={currentUserDisplayName}
            streakInfo={streakInfo}
            isGeneratingAI={isGeneratingAI}
            onStartDailyTest={startDailyTest}
            wrongQuestionsCount={wrongQuestionsPool.length}
            onStartWeaknessQuiz={startWeaknessQuiz}
            onStartSubjectQuiz={startSubjectQuiz}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizRunnerView
            currentQuestions={currentQuestions}
            currentIdx={currentIdx}
            selectedSubject={selectedSubject}
            selectedGrade={selectedGrade}
            isTimerEnabled={isTimerEnabled}
            timeLeftSec={timeLeftSec}
            elapsedSec={elapsedSec}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
            onNextQuestion={handleNextQuestion}
          />
        )}

        {activeTab === 'results' && (
          <ResultsView
            item={selectedHistoryItem}
            wasAutoSubmittedByTimeout={wasAutoSubmittedByTimeout}
            wrongQuestionsCount={wrongQuestionsPool.length}
            onGoHome={() => setActiveTab('home')}
            onStartWeaknessQuiz={startWeaknessQuiz}
            onGoHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            displayName={currentUserDisplayName}
            currentRank={currentRank}
            historyPeriodFilter={historyPeriodFilter}
            setHistoryPeriodFilter={setHistoryPeriodFilter}
            customSearchDate={customSearchDate}
            setCustomSearchDate={setCustomSearchDate}
            radarData={radarData}
            scoreTrendData={scoreTrendData}
            filteredHistoryDocs={filteredHistoryDocs}
            onSelectHistoryItem={(item) => {
              setSelectedHistoryItem(item);
              setActiveTab('results');
            }}
          />
        )}

        {activeTab === 'admin' && isParentAdmin && (
          <AdminView
            userEmail={user?.email}
            onLogout={handleLogout}
            geminiApiKeyInput={geminiApiKeyInput}
            setGeminiApiKeyInput={setGeminiApiKeyInput}
            onSaveGeminiApiKey={handleSaveGeminiApiKey}
            apiKeySavedToast={apiKeySavedToast}
            adminSelectedChildName={adminSelectedChildName}
            setAdminSelectedChildName={setAdminSelectedChildName}
            childNamesList={childNamesList}
            historyPeriodFilter={historyPeriodFilter}
            setHistoryPeriodFilter={setHistoryPeriodFilter}
            customSearchDate={customSearchDate}
            setCustomSearchDate={setCustomSearchDate}
            calendar30Days={calendar30Days}
            radarData={radarData}
            scoreTrendData={scoreTrendData}
            filteredHistoryDocs={filteredHistoryDocs}
            onSelectHistoryItem={(item) => {
              setSelectedHistoryItem(item);
              setActiveTab('results');
            }}
          />
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 text-center">
        <div className="max-w-6xl mx-auto px-4">
          {AppConfig.APP_TITLE}・家族学習システム (独立ファイル分割・モジュール版)
        </div>
      </footer>
    </div>
  );
}
