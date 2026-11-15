// src/components/PageViews.jsx
// 全5画面ビュー（ホーム・テスト実行・結果・学習履歴・保護者管理）統合コンポーネント

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Sparkles,
  Calendar,
  TrendingUp,
  Award,
  AlertCircle,
  Shield,
  Key,
  Save,
  Trash2,
  Home,
  Flame,
  Target,
  Check,
  Globe
} from 'lucide-react';
import { AppConfig } from '../config/AppConfig';
import { QuizUtils } from '../utils/QuizUtils';

// =========================================================================
// 共通ヘルパー（AppConfig / QuizUtils の定義差異を吸収する安全ラッパー）
// =========================================================================
const SUBJECT_META = {
  math: {
    label: AppConfig?.SUBJECT_LABELS?.math || '算数・思考力',
    badgeClass: 'bg-blue-100 text-blue-700',
    buttonClass: 'bg-blue-600 hover:bg-blue-700'
  },
  japanese: {
    label: AppConfig?.SUBJECT_LABELS?.japanese || '国語・読解＆語彙',
    badgeClass: 'bg-rose-100 text-rose-700',
    buttonClass: 'bg-rose-600 hover:bg-rose-700'
  },
  english: {
    label: AppConfig?.SUBJECT_LABELS?.english || '英語（English）入門',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700'
  },
  mixed: {
    label: AppConfig?.SUBJECT_LABELS?.mixed || '総合思考力チャレンジ',
    badgeClass: 'bg-purple-100 text-purple-700',
    buttonClass: 'bg-purple-600 hover:bg-purple-700'
  }
};

const formatSeconds = (sec) => {
  if (QuizUtils && typeof QuizUtils.formatTime === 'function') {
    return QuizUtils.formatTime(sec);
  }
  const safe = Math.max(0, Number(sec) || 0);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getStageBadge = (percentage) => {
  if (QuizUtils && typeof QuizUtils.getRankInfo === 'function') {
    return QuizUtils.getRankInfo(percentage);
  }
  if (percentage >= 90) {
    return {
      title: '未来クリエイター級',
      color: 'text-amber-600 bg-amber-50 border-amber-300',
      message: 'すばらしい思考力と集中力です！自信を持って次のステージへ進みましょう。'
    };
  }
  if (percentage >= 70) {
    return {
      title: 'イノベーター級',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-300',
      message: 'とても良くできています！まちがえた問題を1つずつ確認するとさらに伸びます。'
    };
  }
  if (percentage >= 50) {
    return {
      title: 'チャレンジャー級',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-300',
      message: 'ナイスチャレンジ！解説を読んでコツをつかめば次はもっと高得点が狙えます。'
    };
  }
  return {
    title: 'ルーキー級',
    color: 'text-sky-600 bg-sky-50 border-sky-300',
    message: 'はじめの一歩をクリアしました！毎日続けることで必ず力が身につきます。'
  };
};

// =========================================================================
// 1. ホーム画面（HomeView）
// =========================================================================
export function HomeView({
  user,
  customDisplayName,
  grade = '2',
  setGrade,
  onSelectGrade,
  onStartQuiz,
  startQuiz,
  onStartWeaknessQuiz,
  startWeaknessQuiz,
  history = [],
  records = [],
  isLoadingQuiz = false
}) {
  const [startingSubject, setStartingSubject] = useState(null);

  const handleGradeChange = (nextGrade) => {
    if (typeof setGrade === 'function') setGrade(nextGrade);
    if (typeof onSelectGrade === 'function') onSelectGrade(nextGrade);
  };

  const triggerStart = async (subject) => {
    const starter = onStartQuiz || startQuiz;
    if (typeof starter !== 'function') {
      console.error('onStartQuiz / startQuiz prop is not provided to HomeView');
      return;
    }
    try {
      setStartingSubject(subject);
      await starter(subject);
    } finally {
      setStartingSubject(null);
    }
  };

  const triggerWeakness = async () => {
    const weakStarter = onStartWeaknessQuiz || startWeaknessQuiz;
    if (typeof weakStarter === 'function') {
      await weakStarter();
    } else {
      await triggerStart('mixed');
    }
  };

  const allHistory = history.length > 0 ? history : records;
  const todayStr = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const todayCount = allHistory.filter((item) => {
      const d = item.date || item.createdAt || '';
      return String(d).startsWith(todayStr);
    }).length;

    const totalCount = allHistory.length;
    const avgRate =
      totalCount > 0
        ? Math.round(
            allHistory.reduce((acc, item) => {
              const total = item.total || 10;
              const score = item.score || 0;
              return acc + (score / total) * 100;
            }, 0) / totalCount
          )
        : 0;

    const wrongPoolCount = allHistory.reduce((acc, item) => {
      if (Array.isArray(item.wrongQuestions)) return acc + item.wrongQuestions.length;
      return acc;
    }, 0);

    return { todayCount, totalCount, avgRate, wrongPoolCount };
  }, [allHistory, todayStr]);

  const displayName =
    customDisplayName || user?.displayName || user?.email?.split('@')[0] || 'チャレンジャー';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* ウェルカム＆学年切り替えバナー */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              毎日の習慣が未来をつくる
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              こんにちは、{displayName} さん！
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              学年を選んで今日の思考力・語学トレーニングを始めましょう。
            </p>
          </div>

          {/* 学年セレクター */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl shrink-0 self-start sm:self-center">
            {['2', '5'].map((g) => {
              const active = String(grade) === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGradeChange(g)}
                  className={`px-4 py-2 rounded-lg text-sm font-extrabold transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  小学{g}年生
                </button>
              );
            })}
          </div>
        </div>

        {/* 今日の学習サマリー */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              今日の完了
            </div>
            <div className="text-xl font-black text-slate-800 mt-0.5">
              {stats.todayCount} <span className="text-xs font-bold text-slate-500">回</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              累計チャレンジ
            </div>
            <div className="text-xl font-black text-slate-800 mt-0.5">
              {stats.totalCount} <span className="text-xs font-bold text-slate-500">回</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              平均正答率
            </div>
            <div className="text-xl font-black text-indigo-600 mt-0.5">
              {stats.avgRate} <span className="text-xs font-bold text-slate-500">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 弱点克服モードバナー（過去の誤答がある場合のみ表示） */}
      {stats.wrongPoolCount > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">
                弱点克服リベンジモード（ストック {stats.wrongPoolCount} 問）
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                これまでにまちがえた問題をもう一度解き直して、確実な得意分野に変えましょう！
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={triggerWeakness}
            disabled={isLoadingQuiz || startingSubject !== null}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold text-sm rounded-xl transition shrink-0 shadow-sm"
          >
            弱点復習スタート
          </button>
        </div>
      )}

      {/* 分野別・総合思考トレーニング一覧 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-extrabold text-slate-800">
            分野別・総合思考トレーニング（{grade}年生向け / 英語は全学年共通）
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. 算数カード */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  小学{grade}年生
                </span>
                <span className="text-xs font-semibold text-slate-400">全10問・制限時間10分</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1">
                算数・思考力トレーニング
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                計算の工夫・図形・文章題など、筋道を立てて考え抜く力を毎日鍛えます。
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerStart('math')}
              disabled={isLoadingQuiz || startingSubject !== null}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4" />
              {startingSubject === 'math' ? '問題を準備中...' : '算数トレーニングを開始'}
            </button>
          </div>

          {/* 2. 国語カード */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                  小学{grade}年生
                </span>
                <span className="text-xs font-semibold text-slate-400">全10問・制限時間10分</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1">
                国語・読解＆語彙トレーニング
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                言葉の意味・漢字・文のつながり・文章読解力をバランスよく伸ばします。
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerStart('japanese')}
              disabled={isLoadingQuiz || startingSubject !== null}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4" />
              {startingSubject === 'japanese' ? '問題を準備中...' : '国語トレーニングを開始'}
            </button>
          </div>

          {/* 3. 英語（English）入門カード（全学年共通） */}
          <div className="bg-white rounded-2xl p-5 border-2 border-emerald-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  <Globe className="w-3.5 h-3.5" />
                  全学年共通・入門
                </span>
                <span className="text-xs font-semibold text-slate-400">全10問・制限時間10分</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1">
                英語（English）入門トレーニング
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                あいさつ・数字・色・動物・日常フレーズをゼロから楽しく身につけます。
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerStart('english')}
              disabled={isLoadingQuiz || startingSubject !== null}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4" />
              {startingSubject === 'english' ? '英語問題を準備中...' : '英語テストを開始する'}
            </button>
          </div>

          {/* 4. 総合チャレンジカード */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  小学{grade}年生
                </span>
                <span className="text-xs font-semibold text-slate-400">全10問・制限時間10分</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mb-1">
                総合思考力チャレンジ
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                算数5問＋国語5問のミックス出題で、頭を切り替える応用力を試します。
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerStart('mixed')}
              disabled={isLoadingQuiz || startingSubject !== null}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4" />
              {startingSubject === 'mixed' ? '問題を準備中...' : '総合チャレンジを開始'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. テスト実行画面（QuizRunnerView）
// =========================================================================
export function QuizRunnerView({
  questions = [],
  currentIndex,
  setCurrentIndex,
  answers,
  userAnswers,
  onSelectAnswer,
  handleSelectAnswer,
  onSubmitQuiz,
  onFinishQuiz,
  finishQuiz,
  onCancelQuiz,
  onBackHome,
  setView,
  timeLeft = 600,
  subject = 'math',
  grade = '2'
}) {
  const [internalIndex, setInternalIndex] = useState(0);
  const [internalAnswers, setInternalAnswers] = useState({});

  const activeIndex = typeof currentIndex === 'number' ? currentIndex : internalIndex;
  const activeAnswers = answers || userAnswers || internalAnswers;

  const currentQuestion = questions[activeIndex];
  const selectedChoice = activeAnswers[activeIndex];
  const isAnswered = selectedChoice !== undefined && selectedChoice !== null;
  const isLastQuestion = activeIndex >= questions.length - 1;

  const meta = SUBJECT_META[subject] || SUBJECT_META.math;

  if (!questions || questions.length === 0 || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-slate-800 mb-2">
            問題データを読み込めませんでした
          </h3>
          <p className="text-sm text-slate-600 mb-6">
            ホーム画面に戻って、もう一度テストを選択してください。
          </p>
          <button
            type="button"
            onClick={() => {
              if (typeof onBackHome === 'function') onBackHome();
              else if (typeof setView === 'function') setView('home');
            }}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  const handleChoiceClick = (choice) => {
    if (isAnswered) return;
    const updated = { ...activeAnswers, [activeIndex]: choice };
    setInternalAnswers(updated);
    if (typeof onSelectAnswer === 'function') onSelectAnswer(activeIndex, choice);
    if (typeof handleSelectAnswer === 'function') handleSelectAnswer(activeIndex, choice);
  };

  const handleNextOrFinish = () => {
    if (!isLastQuestion) {
      const nextIdx = activeIndex + 1;
      setInternalIndex(nextIdx);
      if (typeof setCurrentIndex === 'function') setCurrentIndex(nextIdx);
      return;
    }

    const submitter = onFinishQuiz || onSubmitQuiz || finishQuiz;
    if (typeof submitter === 'function') {
      submitter(activeAnswers);
    } else if (typeof setView === 'function') {
      setView('results');
    }
  };

  const handleQuit = () => {
    if (typeof onCancelQuiz === 'function') onCancelQuiz();
    else if (typeof onBackHome === 'function') onBackHome();
    else if (typeof setView === 'function') setView('home');
  };

  const progressPercent = Math.round(((activeIndex + 1) / questions.length) * 100);
  const isLowTime = Number(timeLeft) <= 60;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* 上部ステータスバー */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${meta.badgeClass}`}>
              {meta.label}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
              {subject === 'english' ? '全学年共通' : `小学${grade}年生`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-1.5 font-mono text-sm font-extrabold px-3 py-1 rounded-lg ${
                isLowTime ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              {formatSeconds(timeLeft)}
            </div>
            <button
              type="button"
              onClick={handleQuit}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
            >
              中断して戻る
            </button>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
          <span>
            第 {activeIndex + 1} 問 / 全 {questions.length} 問
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="mb-3">
          <span className="inline-block px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-extrabold">
            分野：{currentQuestion.category || '思考力'}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-relaxed whitespace-pre-line mb-6">
          {currentQuestion.question}
        </h3>

        {/* 4択選択肢 */}
        <div className="space-y-3">
          {(currentQuestion.choices || []).map((choice, idx) => {
            const optionLetters = ['A', 'B', 'C', 'D'];
            const isSelected = selectedChoice === choice;
            const isCorrect = choice === currentQuestion.answer;

            let cardStyle =
              'border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-800';
            if (isAnswered) {
              if (isCorrect) {
                cardStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200';
              } else if (isSelected && !isCorrect) {
                cardStyle = 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-200';
              } else {
                cardStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-70';
              }
            }

            return (
              <button
                key={`${idx}_${choice}`}
                type="button"
                onClick={() => handleChoiceClick(choice)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border-2 transition flex items-center justify-between gap-3 font-bold ${cardStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                      isAnswered && isCorrect
                        ? 'bg-emerald-600 text-white'
                        : isAnswered && isSelected
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {optionLetters[idx] || idx + 1}
                  </span>
                  <span className="text-base sm:text-lg">{choice}</span>
                </div>

                {isAnswered && isCorrect && (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* 回答後の即時解説＆次へボタン */}
        {isAnswered && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div
              className={`rounded-xl p-4 mb-5 ${
                selectedChoice === currentQuestion.answer
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2 font-extrabold text-base mb-1">
                {selectedChoice === currentQuestion.answer ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>大正解！すばらしい！</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>おしい！正解は「{currentQuestion.answer}」です</span>
                  </>
                )}
              </div>
              <p className="text-sm leading-relaxed mt-1">
                {currentQuestion.explanation || 'ポイントを確認して次の問題へ進みましょう！'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNextOrFinish}
              className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>{isLastQuestion ? 'テスト結果を見る' : '次の問題へ進む'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 3. テスト結果画面（ResultsView）
// =========================================================================
export function ResultsView({
  result,
  latestResult,
  questions = [],
  answers = {},
  userAnswers = {},
  subject = 'math',
  grade = '2',
  onRetry,
  onStartQuiz,
  startQuiz,
  onBackHome,
  onNavigate,
  setView
}) {
  const activeResult = result || latestResult;
  const activeQuestions = activeResult?.questions || questions;
  const activeAnswers = activeResult?.answers || answers || userAnswers || {};
  const activeSubject = activeResult?.subject || subject;
  const activeGrade = activeResult?.grade || grade;

  const totalCount = activeResult?.total || activeQuestions.length || 10;
  const correctCount =
    typeof activeResult?.score === 'number'
      ? activeResult.score
      : activeQuestions.reduce((acc, q, idx) => {
          return acc + (activeAnswers[idx] === q.answer ? 1 : 0);
        }, 0);

  const percentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const stage = getStageBadge(percentage);
  const meta = SUBJECT_META[activeSubject] || SUBJECT_META.math;

  const handleRetry = () => {
    if (typeof onRetry === 'function') {
      onRetry(activeSubject);
      return;
    }
    const starter = onStartQuiz || startQuiz;
    if (typeof starter === 'function') {
      starter(activeSubject);
    }
  };

  const handleHome = () => {
    if (typeof onBackHome === 'function') onBackHome();
    else if (typeof onNavigate === 'function') onNavigate('home');
    else if (typeof setView === 'function') setView('home');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* スコア＆ステージ判定カード */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700 mb-3">
          <span>{meta.label}</span>
          <span>・</span>
          <span>{activeSubject === 'english' ? '全学年共通' : `小学${activeGrade}年生`}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-4">
          トレーニング完了！
        </h2>

        <div className="flex items-center justify-center gap-6 my-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-4">
            <div className="text-xs font-bold text-indigo-600 mb-1">今回のスコア</div>
            <div className="text-4xl font-black text-indigo-700">
              {correctCount}
              <span className="text-lg font-bold text-indigo-400"> / {totalCount}</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4">
            <div className="text-xs font-bold text-slate-500 mb-1">正答率</div>
            <div className="text-4xl font-black text-slate-800">
              {percentage}
              <span className="text-lg font-bold text-slate-400">%</span>
            </div>
          </div>
        </div>

        <div className={`inline-block px-5 py-2 rounded-xl border-2 font-black text-base mb-3 ${stage.color}`}>
          <Award className="w-5 h-5 inline-block mr-1.5 -mt-0.5" />
          認定ステージ：{stage.title}
        </div>

        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed mb-6">
          {stage.message}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            同じ科目にもう一度挑戦
          </button>
          <button
            type="button"
            onClick={handleHome}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            ホーム画面へ戻る
          </button>
        </div>
      </div>

      {/* 全問ふりかえりリスト */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          問題のふりかえりと解説
        </h3>

        <div className="space-y-4">
          {activeQuestions.map((q, idx) => {
            const userAns = activeAnswers[idx];
            const isCorrect = userAns === q.answer;

            return (
              <div
                key={q.id || idx}
                className={`p-4 rounded-xl border ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-rose-200 bg-rose-50/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-extrabold text-slate-500">
                    第 {idx + 1} 問（{q.category || '思考力'}）
                  </span>
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 正解
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700">
                      <XCircle className="w-3.5 h-3.5" /> 復習ポイント
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-bold text-slate-800 mb-2">
                  {q.question}
                </p>

                <div className="text-xs sm:text-sm space-y-1 mb-2">
                  <div>
                    <span className="font-semibold text-slate-500">あなたの答え：</span>
                    <span
                      className={`font-extrabold ${
                        isCorrect ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {userAns || '未回答'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div>
                      <span className="font-semibold text-slate-500">正解：</span>
                      <span className="font-extrabold text-emerald-700">{q.answer}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-600 bg-white/80 rounded-lg p-2.5 border border-slate-100">
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 4. 学習履歴・成長分析画面（HistoryView）
// =========================================================================
export function HistoryView({
  history = [],
  records = [],
  onBackHome,
  onNavigate,
  setView
}) {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [gradeFilter, setGradeFilter] = useState('all');

  const allHistory = history.length > 0 ? history : records;

  const filteredHistory = useMemo(() => {
    const now = new Date();
    return allHistory.filter((item) => {
      if (gradeFilter !== 'all' && item.subject !== 'english') {
        if (String(item.grade) !== gradeFilter) return false;
      }

      if (periodFilter === 'all') return true;
      const itemDate = new Date(item.date || item.createdAt || now);
      if (Number.isNaN(itemDate.getTime())) return true;

      if (periodFilter === 'month') {
        return (
          itemDate.getFullYear() === now.getFullYear() &&
          itemDate.getMonth() === now.getMonth()
        );
      }
      if (periodFilter === 'week') {
        const diffDays = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }
      return true;
    });
  }, [allHistory, periodFilter, gradeFilter]);

  const subjectStats = useMemo(() => {
    const subjects = ['math', 'japanese', 'english', 'mixed'];
    return subjects.map((subj) => {
      const items = filteredHistory.filter((r) => r.subject === subj);
      const count = items.length;
      const avg =
        count > 0
          ? Math.round(
              items.reduce((acc, r) => acc + ((r.score || 0) / (r.total || 10)) * 100, 0) /
                count
            )
          : 0;
      return {
        subject: subj,
        label: SUBJECT_META[subj].label,
        count,
        avg
      };
    });
  }, [filteredHistory]);

  // 直近30日間の学習スタンプカレンダー
  const last30Days = useMemo(() => {
    const studiedSet = new Set(
      allHistory.map((item) => String(item.date || item.createdAt || '').slice(0, 10))
    );
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({
        iso,
        dayNum: d.getDate(),
        studied: studiedSet.has(iso)
      });
    }
    return days;
  }, [allHistory]);

  const handleHome = () => {
    if (typeof onBackHome === 'function') onBackHome();
    else if (typeof onNavigate === 'function') onNavigate('home');
    else if (typeof setView === 'function') setView('home');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            学習の記録と成長バランス
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            日々の積み重ねと科目ごとの正答率を確認できます。
          </p>
        </div>

        <button
          type="button"
          onClick={handleHome}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" />
          ホームへ戻る
        </button>
      </div>

      {/* 期間・学年フィルター */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: '全期間' },
            { id: 'month', label: '今月' },
            { id: 'week', label: '最近7日間' }
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriodFilter(p.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                periodFilter === p.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: 'すべて' },
            { id: '2', label: '2年生' },
            { id: '5', label: '5年生' }
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGradeFilter(g.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                gradeFilter === g.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* 科目別達成度バー */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
        <h3 className="text-base font-extrabold text-slate-800 mb-4">
          科目別トレーニング達成状況（対象 {filteredHistory.length} 回）
        </h3>
        <div className="space-y-4">
          {subjectStats.map((st) => (
            <div key={st.subject}>
              <div className="flex items-center justify-between text-sm font-bold mb-1">
                <span className="text-slate-700">{st.label}</span>
                <span className="text-slate-600">
                  平均 <strong className="text-indigo-600">{st.avg}%</strong>（{st.count}回実施）
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${st.avg}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 直近30日間の学習カレンダー */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
        <h3 className="text-base font-extrabold text-slate-800 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          最近30日間の学習スタンプ
        </h3>
        <div className="grid grid-cols-10 sm:grid-cols-15 gap-2">
          {last30Days.map((d) => (
            <div
              key={d.iso}
              title={d.iso}
              className={`h-9 rounded-lg flex flex-col items-center justify-center text-xs font-extrabold border ${
                d.studied
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span>{d.dayNum}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 履歴一覧テーブル */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-800 mb-4">最近のトレーニング履歴</h3>

        {filteredHistory.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            該当する期間の学習記録はまだありません。
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredHistory.slice(0, 20).map((item, idx) => {
              const meta = SUBJECT_META[item.subject] || SUBJECT_META.math;
              return (
                <div
                  key={item.id || idx}
                  className="py-3.5 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${meta.badgeClass}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {item.subject === 'english' ? '全学年共通' : `${item.grade || '2'}年生`}
                    </span>
                    <span className="text-xs text-slate-400">
                      {String(item.date || item.createdAt || '').slice(0, 10)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-800">
                      {item.score ?? 0} / {item.total ?? 10} 問正解
                    </span>
                    {typeof item.timeSpent === 'number' && (
                      <span className="text-xs font-mono text-slate-500">
                        {formatSeconds(item.timeSpent)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================================
// 5. 保護者・管理者画面（AdminView）
// =========================================================================
export function AdminView({
  user,
  isAdmin = false,
  history = [],
  allRecords = [],
  customApiKey = '',
  onSaveApiKey,
  saveApiKey,
  onBackHome,
  onNavigate,
  setView
}) {
  const [apiKeyInput, setApiKeyInput] = useState(
    customApiKey ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '')
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const adminEmail = AppConfig?.ADMIN_EMAIL || 'peruqsidiq@gmail.com';
  const hasAdminAccess = isAdmin || user?.email === adminEmail;

  const handleHome = () => {
    if (typeof onBackHome === 'function') onBackHome();
    else if (typeof onNavigate === 'function') onNavigate('home');
    else if (typeof setView === 'function') setView('home');
  };

  if (!hasAdminAccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
          <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-extrabold text-slate-800 mb-2">
            管理者専用ページです
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            この画面は登録された保護者アカウント（{adminEmail}）のみアクセスできます。
          </p>
          <button
            type="button"
            onClick={handleHome}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
          >
            ホーム画面へ戻る
          </button>
        </div>
      </div>
    );
  }

  const handleSave = (e) => {
    e.preventDefault();
    const trimmed = apiKeyInput.trim();
    if (typeof localStorage !== 'undefined') {
      if (trimmed) localStorage.setItem('gemini_api_key', trimmed);
      else localStorage.removeItem('gemini_api_key');
    }
    if (typeof onSaveApiKey === 'function') onSaveApiKey(trimmed);
    if (typeof saveApiKey === 'function') saveApiKey(trimmed);

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleClearKey = () => {
    setApiKeyInput('');
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('gemini_api_key');
    }
    if (typeof onSaveApiKey === 'function') onSaveApiKey('');
    if (typeof saveApiKey === 'function') saveApiKey('');
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const combinedRecords = allRecords.length > 0 ? allRecords : history;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-extrabold mb-1">
            <Shield className="w-3.5 h-3.5" />
            保護者・管理者ダッシュボード
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
            AI出題設定と学習管理
          </h2>
        </div>

        <button
          type="button"
          onClick={handleHome}
          className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl transition flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" />
          ホームへ戻る
        </button>
      </div>

      {/* Gemini APIキー設定カード */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
        <h3 className="text-base font-extrabold text-slate-800 mb-2 flex items-center gap-2">
          <Key className="w-5 h-5 text-amber-500" />
          Gemini APIキー設定（AI新作問題の自動生成）
        </h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          APIキーを設定すると、算数・国語・英語のすべてでAIが毎回新しい問題を自動作成します。未設定の場合でも内蔵問題エンジンで全機能が無料で動作します。
        </p>

        <form onSubmit={handleSave} className="space-y-3">
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy...（Gemini APIキーを入力）"
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
          />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              設定を保存する
            </button>

            {apiKeyInput && (
              <button
                type="button"
                onClick={handleClearKey}
                className="px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-sm rounded-xl transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                キーを削除
              </button>
            )}

            {savedNotice && (
              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-emerald-600">
                <Check className="w-4 h-4" />
                設定を保存しました！
              </span>
            )}
          </div>
        </form>
      </div>

      {/* 全体の学習実施サマリー */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-800 mb-4">
          登録済み学習データ一覧（合計 {combinedRecords.length} 件）
        </h3>

        {combinedRecords.length === 0 ? (
          <p className="text-sm text-slate-500 py-4">まだ学習データがありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-extrabold text-slate-500">
                  <th className="py-2.5 px-3">日付</th>
                  <th className="py-2.5 px-3">学習者</th>
                  <th className="py-2.5 px-3">科目</th>
                  <th className="py-2.5 px-3">対象</th>
                  <th className="py-2.5 px-3">スコア</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {combinedRecords.slice(0, 30).map((rec, idx) => {
                  const meta = SUBJECT_META[rec.subject] || SUBJECT_META.math;
                  return (
                    <tr key={rec.id || idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-xs text-slate-500">
                        {String(rec.date || rec.createdAt || '').slice(0, 10)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-700">
                        {rec.userName || rec.displayName || 'メンバー'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-xs font-bold text-slate-600">
                        {rec.subject === 'english' ? '全学年共通' : `${rec.grade || '2'}年生`}
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-slate-800">
                        {rec.score ?? 0} / {rec.total ?? 10}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
