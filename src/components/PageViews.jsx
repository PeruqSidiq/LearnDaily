import React from 'react';
import {
  Trophy, BookOpen, Calculator, CheckCircle2, User, LogOut, BarChart2,
  ChevronRight, Sparkles, Check, History, ArrowRight, Calendar, Flame,
  RefreshCw, Zap, ShieldCheck, Users, Filter, CalendarDays, Timer, Target, RotateCcw
} from 'lucide-react';
import { QuizUtils } from '../utils/QuizUtils.js';
import { PeriodFilterButtons, AnalyticsChartsGrid } from './CommonUI.jsx';

export function HomeView({
  selectedGrade,
  setSelectedGrade,
  isTimerEnabled,
  setIsTimerEnabled,
  displayName,
  streakInfo,
  isGeneratingAI,
  onStartDailyTest,
  wrongQuestionsCount,
  onStartWeaknessQuiz,
  onStartSubjectQuiz
}) {
  return (
    <div className="space-y-6">
      {/* Grade & Timer Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 mr-1">
            <User className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-sm text-slate-800">対象学年:</span>
          </div>
          <button
            onClick={() => setSelectedGrade('grade2')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              selectedGrade === 'grade2'
                ? 'bg-amber-400 text-slate-950 shadow-sm ring-2 ring-amber-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🌱 小学2年生
          </button>
          <button
            onClick={() => setSelectedGrade('grade5')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              selectedGrade === 'grade5'
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🚀 小学5年生
          </button>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <Timer className={`w-4 h-4 ${isTimerEnabled ? 'text-rose-600' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-extrabold text-slate-800">本番制限時間タイマー</div>
              <div className="text-[10px] text-slate-500">
                {isTimerEnabled ? 'ON (10問=15分 / 20問=30分)' : 'OFF (時間無制限でじっくり)'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsTimerEnabled(!isTimerEnabled)}
            className={`w-12 h-6 rounded-full transition-colors p-0.5 flex items-center ${
              isTimerEnabled ? 'bg-rose-600 justify-end' : 'bg-slate-300 justify-start'
            }`}
            aria-label="タイマー切り替え"
          >
            <span className="w-5 h-5 rounded-full bg-white shadow block" />
          </button>
        </div>
      </div>

      {/* Daily Streak & Hero Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-15 pointer-events-none transform translate-x-10 -translate-y-6">
          <Flame className="w-80 h-80" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-amber-100 border border-white/30">
              <Calendar className="w-4 h-4 text-amber-200" />
              【{selectedGrade === 'grade2' ? '小学2年生用' : '小学5年生用'}】本日の20問模試（毎回数値・問題自動生成）
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              毎日1回の習慣で差がつく！<br />算数10問・国語10問の日替わり模試
            </h2>

            <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
              {displayName} さん専用の日替わり問題（算数10問・国語10問）を毎回新しい数値・組み合わせで自動生成します。本番さながらのタイマー意識で実力を出し切りましょう！
            </p>

            <div className="flex items-center gap-4 pt-2 flex-wrap">
              <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <Flame className="w-6 h-6 text-amber-300 animate-bounce" />
                <div>
                  <div className="text-[10px] text-amber-200 uppercase font-bold tracking-wider">連続学習記録</div>
                  <div className="text-lg font-black leading-none">{streakInfo.streak} 日連続中！</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <CheckCircle2 className={`w-6 h-6 ${streakInfo.testedToday ? 'text-emerald-300' : 'text-slate-300'}`} />
                <div>
                  <div className="text-[10px] text-amber-200 uppercase font-bold tracking-wider">本日のテスト</div>
                  <div className="text-sm font-bold leading-none">
                    {streakInfo.testedToday ? '完了済み ✓' : '未完了'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={onStartDailyTest}
              disabled={isGeneratingAI}
              className="w-full md:w-auto bg-white hover:bg-amber-50 text-slate-900 font-extrabold px-8 py-4 rounded-2xl text-base shadow-2xl transition transform active:scale-95 flex items-center justify-center gap-3 border-2 border-amber-200"
            >
              {isGeneratingAI ? (
                <>
                  <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
                  <span>新しい20問を作成中...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span>{streakInfo.testedToday ? '新しい問題でもう一度20問解く' : '本日の20問テストを開始'}</span>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Weakness Conquest Banner */}
      <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 border-2 border-rose-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-slate-900 text-base">
                🔥 弱点克服モード（今まで間違えた問題だけ復習）
              </h3>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                wrongQuestionsCount > 0 ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {wrongQuestionsCount > 0 ? `弱点ストック: ${wrongQuestionsCount} 問` : '弱点ゼロ達成中 🎉'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {wrongQuestionsCount > 0
                ? '過去のテストで間違えた問題だけを自動ピックアップ！本番前に苦手をつぶして得点力を底上げしましょう（最大10問出題）。'
                : 'まだ間違えた問題のストックがありません。テストを受けると間違えた問題が自動的にここへ集まります！'}
            </p>
          </div>
        </div>

        <button
          onClick={onStartWeaknessQuiz}
          disabled={wrongQuestionsCount === 0}
          className={`w-full sm:w-auto flex-shrink-0 px-6 py-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 shadow ${
            wrongQuestionsCount > 0
              ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>
            {wrongQuestionsCount > 0 ? `間違えた問題（${Math.min(10, wrongQuestionsCount)}問）に挑戦` : '復習問題なし'}
          </span>
        </button>
      </div>

      {/* Subject Cards Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          分野別・総合練習テスト（{selectedGrade === 'grade2' ? '2年生向け' : '5年生向け'}）
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Calculator className="w-6 h-6" />
                </div>
                <span className="bg-blue-50 text-blue-700 font-semibold text-xs px-2.5 py-1 rounded-full border border-blue-200">
                  算数 10問 / 15分
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg mb-1 group-hover:text-blue-600 transition">
                算数 実戦対策テスト
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                {selectedGrade === 'grade2'
                  ? 'たし算ひき算の工夫、九九・かけ算、長さ・時間・水のかさ、図形など毎回新しい数値で10問出題します。'
                  : '計算の工夫、逆算、植木算、和差算、つるかめ算、過不足算、周期算、図形など毎回新しい数値で10問出題します。'}
              </p>
            </div>
            <button
              onClick={() => onStartSubjectQuiz('math')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              算数10問テストを開始
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="bg-rose-50 text-rose-700 font-semibold text-xs px-2.5 py-1 rounded-full border border-rose-200">
                  国語 10問 / 15分
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg mb-1 group-hover:text-rose-600 transition">
                国語 実戦対策テスト
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                {selectedGrade === 'grade2'
                  ? '2年生の漢字、反対の言葉、ものの数え方、言葉のつなぎ方、気持ちの理解などから毎回ランダムに10問出題します。'
                  : '漢字、部首、対義語、類義語、四字熟語、接続詞、指示語、心情理解・要旨把握などから毎回10問出題します。'}
              </p>
            </div>
            <button
              onClick={() => onStartSubjectQuiz('japanese')}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              国語10問テストを開始
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="bg-emerald-50 text-emerald-700 font-semibold text-xs px-2.5 py-1 rounded-full border border-emerald-200">
                  ウイグル語 10問 / 15分
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg mb-1 group-hover:text-emerald-600 transition">
                ウイグル語 (ئۇيغۇرچە) テスト
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed mb-4">
                ウイグル文字（アラビア文字表記）、日常単語（くだもの・家族・数・水・動物）、挨拶、自己紹介など10問出題します。
              </p>
            </div>
            <button
              onClick={() => onStartSubjectQuiz('uyghur')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
            >
              ウイグル語10問テストを開始
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between group relative overflow-hidden border border-indigo-700">
            <div className="absolute -right-4 -bottom-4 opacity-20 pointer-events-none">
              <Trophy className="w-32 h-32" />
            </div>
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
                  <Trophy className="w-6 h-6" />
                </div>
                <span className="bg-amber-400/20 text-amber-300 font-semibold text-xs px-2.5 py-1 rounded-full border border-amber-400/30">
                  全20問 / 30分
                </span>
              </div>
              <h4 className="font-extrabold text-white text-lg mb-1">
                算国 20問 総合実戦模試
              </h4>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                算数10問と国語10問（合計20問）のフルセット模試。毎回新しい数値と出題セットで実力を測ります。
              </p>
            </div>
            <button
              onClick={() => onStartSubjectQuiz('combined')}
              className="w-full bg-amber-400 hover:bg-amber-500 text-blue-950 font-extrabold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg"
            >
              総合模試（20問）を開始
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuizRunnerView({
  currentQuestions,
  currentIdx,
  selectedSubject,
  selectedGrade,
  isTimerEnabled,
  timeLeftSec,
  elapsedSec,
  selectedOption,
  onSelectOption,
  onNextQuestion
}) {
  const question = currentQuestions[currentIdx];
  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            {selectedSubject === 'weakness'
              ? '🔥 弱点克服復習'
              : `${selectedGrade === 'grade2' ? '2年生' : '5年生'} / ${QuizUtils.getSubjectLabel(selectedSubject)}`}
          </span>
          <span className="text-xs font-semibold text-slate-600">
            第 {currentIdx + 1} / {currentQuestions.length} 問
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isTimerEnabled ? (
            <div
              className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 border ${
                timeLeftSec <= 60
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : timeLeftSec <= 180
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-900 text-amber-300 border-slate-700'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>残り {QuizUtils.formatSeconds(timeLeftSec)}</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200">
              <Timer className="w-3.5 h-3.5 text-slate-400" />
              <span>経過 {QuizUtils.formatSeconds(elapsedSec)}</span>
            </div>
          )}

          <div className="w-20 sm:w-28 bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / currentQuestions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="text-xs font-bold text-indigo-500 mb-2">
          【{question.category}】
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line mb-6">
          {question.question}
        </h3>

        <div className="space-y-3 mb-8">
          {question.options.map((opt, optIdx) => {
            const isSelected = selectedOption === optIdx;
            return (
              <button
                key={optIdx}
                onClick={() => onSelectOption(optIdx)}
                className={`w-full text-left p-4 rounded-xl border-2 font-medium text-sm transition flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <span>{opt}</span>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                  isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                }`}>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onNextQuestion}
          disabled={selectedOption === null}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition shadow-md flex items-center justify-center gap-2 ${
            selectedOption !== null
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {currentIdx + 1 < currentQuestions.length ? '次の問題へ' : 'テストを提出して結果を見る'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ResultsView({
  item,
  wasAutoSubmittedByTimeout,
  wrongQuestionsCount,
  onGoHome,
  onStartWeaknessQuiz,
  onGoHistory
}) {
  if (!item) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {(wasAutoSubmittedByTimeout || item.wasTimeout) && (
        <div className="bg-amber-100 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-sm">
          <Timer className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            制限時間が終了したため、自動的に提出されました！本番ではわからない問題を飛ばして時間内に解き切る練習を続けましょう。
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md text-center relative overflow-hidden">
        <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
          {QuizUtils.getSubjectLabel(item.subject)} ({item.gradeLabel || '標準'} - {item.dateStr})
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4">採点結果発表</h2>

        <div className="flex items-center justify-center gap-6 my-4">
          <div>
            <div className="text-xs text-slate-500 font-semibold">正解数</div>
            <div className="text-3xl font-black text-slate-800">
              {item.score} <span className="text-sm font-normal text-slate-500">/ {item.totalQuestions} 問</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-200"></div>
          <div>
            <div className="text-xs text-slate-500 font-semibold">正答率</div>
            <div className="text-4xl font-black text-indigo-600">{item.percentage}%</div>
          </div>
          {item.durationSec !== undefined && (
            <>
              <div className="h-10 w-px bg-slate-200"></div>
              <div>
                <div className="text-xs text-slate-500 font-semibold">解答時間</div>
                <div className="text-xl font-black text-slate-700">{QuizUtils.formatSeconds(item.durationSec)}</div>
              </div>
            </>
          )}
        </div>

        <div className="max-w-sm mx-auto bg-slate-50 rounded-xl p-3 border border-slate-200 mt-4">
          <div className="text-xs text-slate-500">四谷大塚 クラス判定目安</div>
          <div className="font-extrabold text-sm text-indigo-900 mt-0.5">
            {QuizUtils.getRankBadge(item.percentage).title}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
          <button
            onClick={onGoHome}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow"
          >
            トップ画面へ戻る
          </button>
          {wrongQuestionsCount > 0 && (
            <button
              onClick={onStartWeaknessQuiz}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              <span>弱点克服モードで解き直す</span>
            </button>
          )}
          <button
            onClick={onGoHistory}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs transition"
          >
            全体の学習成績・分析を見る
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          問題ごとの詳細と解説
        </h3>

        {item.answeredBreakdown.map((entry, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border ${
              entry.isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  entry.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                }`}>
                  {idx + 1}
                </span>
                <span className="font-bold text-xs text-slate-700">【{entry.category}】</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                entry.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {entry.isCorrect ? '正解 ○' : '不正解 ×'}
              </span>
            </div>

            <p className="font-semibold text-xs sm:text-sm text-slate-800 whitespace-pre-line mb-3">
              {entry.question}
            </p>

            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
              <div>
                <span className="text-slate-500">あなたの回答: </span>
                <span className={entry.isCorrect ? 'font-bold text-emerald-700' : 'font-bold text-rose-600'}>
                  {entry.userAnswerIndex !== null && entry.options[entry.userAnswerIndex]
                    ? entry.options[entry.userAnswerIndex]
                    : '未回答（時間切れ）'}
                </span>
              </div>
              {!entry.isCorrect && (
                <div>
                  <span className="text-slate-500">正しい解答: </span>
                  <span className="font-bold text-emerald-700">{entry.options[entry.correctIndex]}</span>
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-slate-100 text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-2 rounded">
                <strong className="text-indigo-900 block mb-1">【解説】</strong>
                {entry.explanation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoryView({
  displayName,
  currentRank,
  historyPeriodFilter,
  setHistoryPeriodFilter,
  customSearchDate,
  setCustomSearchDate,
  radarData,
  scoreTrendData,
  filteredHistoryDocs,
  onSelectHistoryItem
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            学習実績・成績ダッシュボード
          </h2>
          <p className="text-xs text-slate-500">
            {displayName} さんのテスト履歴と全期間・月別の分析結果です。
          </p>
        </div>

        <div className={`px-4 py-2 rounded-xl border text-xs font-bold ${currentRank.border} ${currentRank.color}`}>
          判定: {currentRank.title}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-xs text-slate-700">期間絞り込み:</span>
        </div>
        <PeriodFilterButtons
          historyPeriodFilter={historyPeriodFilter}
          setHistoryPeriodFilter={setHistoryPeriodFilter}
          customSearchDate={customSearchDate}
          setCustomSearchDate={setCustomSearchDate}
        />
      </div>

      <AnalyticsChartsGrid
        radarData={radarData}
        scoreTrendData={scoreTrendData}
        radarTitle="指定期間の分野別理解度（レーダー）"
        trendTitle="得点率の推移（成長グラフ）"
      />

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          テスト履歴一覧 ({filteredHistoryDocs.length} 件)
        </h3>

        {filteredHistoryDocs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            該当する期間のテスト履歴がありません。
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistoryDocs.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => onSelectHistoryItem(item)}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900">
                      【{item.gradeLabel || '標準'}】{QuizUtils.getSubjectLabel(item.subject)}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.dateStr}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    正解: {item.score} / {item.totalQuestions} 問 ({item.durationSec ? `${QuizUtils.formatSeconds(item.durationSec)}` : ''})
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-extrabold text-base text-indigo-600">{item.percentage}%</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      {item.percentage >= 60 ? '合格基準達成' : '要復習'}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminView({
  userEmail,
  onLogout,
  geminiApiKeyInput,
  setGeminiApiKeyInput,
  onSaveGeminiApiKey,
  apiKeySavedToast,
  adminSelectedChildName,
  setAdminSelectedChildName,
  childNamesList,
  historyPeriodFilter,
  setHistoryPeriodFilter,
  customSearchDate,
  setCustomSearchDate,
  calendar30Days,
  radarData,
  scoreTrendData,
  filteredHistoryDocs,
  onSelectHistoryItem
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between flex-wrap gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-block bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/30 mb-1">
              管理者認証済み: {userEmail}
            </div>
            <h2 className="text-xl font-black text-white">家族全員の学習分析・歴史管理</h2>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition border border-slate-700 flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>ログアウト</span>
        </button>
      </div>

      {/* Gemini API Key Settings */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Gemini AI 問題生成キー設定（任意）</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            未設定でも内蔵の「毎日自動問題生成エンジン」で毎回異なる問題が出題されます。APIキーを設定するとAIによる完全オリジナル問題も生成できます。
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="password"
            value={geminiApiKeyInput}
            onChange={(e) => setGeminiApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono outline-none focus:border-indigo-600 w-44"
          />
          <button
            type="button"
            onClick={onSaveGeminiApiKey}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition whitespace-nowrap"
          >
            {apiKeySavedToast ? '保存済み ✓' : '保存'}
          </button>
        </div>
      </div>

      {/* Child & Historical Period Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-sm text-slate-800">対象のお子様を選択:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setAdminSelectedChildName('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                adminSelectedChildName === 'ALL'
                  ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全員表示
            </button>
            {childNamesList.map((name, idx) => (
              <button
                key={idx}
                onClick={() => setAdminSelectedChildName(name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  adminSelectedChildName === name
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-xs text-slate-700">歴史データ期間指定:</span>
          </div>
          <PeriodFilterButtons
            historyPeriodFilter={historyPeriodFilter}
            setHistoryPeriodFilter={setHistoryPeriodFilter}
            customSearchDate={customSearchDate}
            setCustomSearchDate={setCustomSearchDate}
          />
        </div>
      </div>

      {/* 30-Day Habit Calendar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" />
          直近30日間の学習実施カレンダー（緑色＝受検完了）
        </h3>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {calendar30Days.map((d, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-xl text-center border text-xs font-bold transition ${
                d.isTested
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              <div className="text-[9px] opacity-80">{d.monthNum}/{d.dayNum}</div>
              <div className="text-sm font-black">{d.isTested ? '✓' : '•'}</div>
            </div>
          ))}
        </div>
      </div>

      <AnalyticsChartsGrid
        radarData={radarData}
        scoreTrendData={scoreTrendData}
        radarTitle="選択したお子様・期間の分野別理解度"
        trendTitle="得点成長グラフ"
      />

      {/* Full History List */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" />
          全テスト履歴詳細・誤答復習 ({filteredHistoryDocs.length} 件)
        </h3>

        {filteredHistoryDocs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            該当するテスト記録がありません。
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistoryDocs.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => onSelectHistoryItem(item)}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-sm text-slate-900">
                      {item.userDisplayName || '生徒'} - 【{item.gradeLabel || '標準'}】{QuizUtils.getSubjectLabel(item.subject)}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.dateStr}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    正解: {item.score} / {item.totalQuestions} 問 ({item.percentage}%)
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-indigo-600 hover:underline">
                    問題と解答・解説を見る →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
