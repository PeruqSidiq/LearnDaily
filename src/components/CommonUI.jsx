import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  BookOpen, User, LogIn, LogOut, BarChart2, BrainCircuit, AlertCircle,
  ShieldCheck, TrendingUp, Mail, KeyRound, UserPlus, Edit3
} from 'lucide-react';
import { AppConfig } from '../config/AppConfig.js';

export function LoginGateView({ onGoogleLogin, onEmailSubmit, isLoggingIn, loginError, setLoginError }) {
  const [authMode, setAuthMode] = useState('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [childNameInput, setChildNameInput] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onEmailSubmit({ authMode, emailInput, passwordInput, childNameInput });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            四
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            四谷大塚 入塾テスト対策
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            学習履歴の正確な記録と管理のため、<strong className="text-slate-800">ログインが必須</strong>です。<br />
            お子様または保護者様のアカウントでログインしてください。
          </p>
        </div>

        {loginError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-xl font-bold leading-relaxed flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoggingIn}
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-lg transition flex items-center justify-center gap-2.5 disabled:opacity-60"
        >
          <LogIn className="w-4 h-4 text-amber-400" />
          <span>{isLoggingIn ? 'ログイン処理中...' : 'Googleアカウントでログイン'}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-bold text-slate-400 whitespace-nowrap">
            または メールアドレスでログイン
          </span>
          <div className="border-t border-slate-200 w-full"></div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setLoginError(''); }}
              className={`py-1.5 rounded-lg text-xs font-extrabold transition ${
                authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setLoginError(''); }}
              className={`py-1.5 rounded-lg text-xs font-extrabold transition ${
                authMode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              新規アカウント作成
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3">
            {authMode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  お子様のお名前（表示名）
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={childNameInput}
                    onChange={(e) => setChildNameInput(e.target.value)}
                    placeholder="例: お兄ちゃん / 弟"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-indigo-600 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">メールアドレス</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">パスワード（6文字以上）</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-indigo-600 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow transition flex items-center justify-center gap-1.5 disabled:opacity-60"
            >
              {authMode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>アカウントを作成してテストを始める</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>ログインしてテストを始める</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-[11px] text-center text-slate-400">
          ※ ゲスト利用は停止されています。管理者（{AppConfig.ADMIN_EMAIL}）でログインすると保護者管理画面が表示されます。
        </p>
      </div>
    </div>
  );
}

export function EditNameModal({ currentName, onSave, onCancel }) {
  const [draft, setDraft] = useState(currentName);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (draft.trim()) onSave(draft.trim());
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4"
      >
        <h3 className="font-black text-base text-slate-900">表示名を変更</h3>
        <p className="text-xs text-slate-500">
          成績一覧や保護者画面に表示されるお名前を入力してください。
        </p>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="例: お兄ちゃん、弟"
          autoFocus
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:border-indigo-600 outline-none"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 text-white hover:bg-indigo-700"
          >
            保存する
          </button>
        </div>
      </form>
    </div>
  );
}

export function AppHeader({
  activeTab,
  setActiveTab,
  isParentAdmin,
  displayName,
  userEmail,
  onEditName,
  onLogout
}) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center justify-between gap-2">
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 cursor-pointer select-none min-w-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-black text-sm shadow shrink-0">
              四
            </div>
            <div className="truncate">
              <h1 className="font-black text-sm sm:text-base leading-tight whitespace-nowrap">
                四谷大塚 入塾テスト対策
              </h1>
              <p className="hidden lg:block text-[10px] text-amber-300 font-medium whitespace-nowrap">
                毎日日替わり自動出題・タイマー＆弱点克服対応
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:hidden shrink-0">
            <button
              onClick={onEditName}
              title="表示名を変更"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 max-w-[120px]"
            >
              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">{displayName}</span>
            </button>
            <button
              onClick={onLogout}
              title="ログアウト"
              className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-1.5 sm:gap-2 pt-2 md:pt-0 border-t border-slate-800 md:border-t-0">
          <nav className={`grid ${isParentAdmin ? 'grid-cols-3' : 'grid-cols-2'} md:flex items-center gap-1.5 w-full md:w-auto`}>
            <button
              onClick={() => setActiveTab('home')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
                activeTab === 'home' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800/60 md:bg-transparent text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>ホーム</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 whitespace-nowrap ${
                activeTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800/60 md:bg-transparent text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 shrink-0" />
              <span>成績・分析</span>
            </button>

            {isParentAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1 border whitespace-nowrap ${
                  activeTab === 'admin'
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                    : 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span>保護者管理</span>
              </button>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 shrink-0">
            <button
              onClick={onEditName}
              title="表示名を変更"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{displayName}</span>
              <Edit3 className="w-3 h-3 text-slate-400" />
            </button>

            <button
              onClick={onLogout}
              title={`ログアウト (${userEmail})`}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function PeriodFilterButtons({
  historyPeriodFilter,
  setHistoryPeriodFilter,
  customSearchDate,
  setCustomSearchDate
}) {
  const buttons = [
    { key: 'ALL', label: '全期間' },
    { key: 'THIS_MONTH', label: '今月' },
    { key: 'LAST_MONTH', label: '先月' },
    { key: 'LAST_30', label: '直近30日' }
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {buttons.map(btn => (
        <button
          key={btn.key}
          onClick={() => setHistoryPeriodFilter(btn.key)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            historyPeriodFilter === btn.key
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {btn.label}
        </button>
      ))}
      <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
        <span className="text-[10px] text-slate-500 font-bold">日付指定:</span>
        <input
          type="date"
          value={customSearchDate}
          onChange={(e) => {
            setCustomSearchDate(e.target.value);
            setHistoryPeriodFilter('CUSTOM_DATE');
          }}
          className="bg-transparent text-xs outline-none font-bold text-slate-700"
        />
      </div>
    </div>
  );
}

export function AnalyticsChartsGrid({ radarData, scoreTrendData, radarTitle, trendTitle }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
        <h3 className="font-bold text-slate-800 text-sm mb-2 w-full text-left flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-600" />
          {radarTitle}
        </h3>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={256}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="正答率(%)" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
        <h3 className="font-bold text-slate-800 text-sm mb-2 w-full text-left flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" />
          {trendTitle}
        </h3>
        <div className="w-full">
          {scoreTrendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={256}>
              <LineChart data={scoreTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5, fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              該当する期間のテストデータがありません。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
