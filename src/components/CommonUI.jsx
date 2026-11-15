// src/components/CommonUI.jsx
// 共通UIコンポーネント（ログインゲート・表示名変更モーダル・共通ヘッダー）

import React, { useState, useEffect } from 'react';
import {
  LogIn,
  Mail,
  Lock,
  UserPlus,
  Home,
  History,
  Shield,
  Edit3,
  LogOut,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { AppConfig } from '../config/AppConfig';
import { FirebaseService } from '../services/FirebaseService';

// =========================================================================
// 1. ログインゲート画面（LoginGateView）
// =========================================================================
export function LoginGateView({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const appTitle = AppConfig?.APP_TITLE || '未来を生き抜く 思考力トレーニング';
  const appSubtitle =
    AppConfig?.APP_SUBTITLE || '毎日1回の習慣で、自ら考え・伸び続ける頭を育てる';
  const appIcon = AppConfig?.APP_ICON || '未';

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      let loggedInUser = null;
      if (FirebaseService && typeof FirebaseService.loginWithGoogle === 'function') {
        loggedInUser = await FirebaseService.loginWithGoogle();
      } else if (FirebaseService && typeof FirebaseService.signInWithGoogle === 'function') {
        loggedInUser = await FirebaseService.signInWithGoogle();
      } else {
        throw new Error('Googleログイン機能が初期化されていません。');
      }
      if (loggedInUser && typeof onLoginSuccess === 'function') {
        onLoginSuccess(loggedInUser);
      }
    } catch (err) {
      console.error('Googleログインエラー:', err);
      setErrorMsg(err?.message || 'Googleログインに失敗しました。設定を確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('メールアドレスとパスワードを入力してください。');
      return;
    }

    setLoading(true);
    try {
      let loggedInUser = null;
      if (isSignUp) {
        if (FirebaseService && typeof FirebaseService.registerWithEmail === 'function') {
          loggedInUser = await FirebaseService.registerWithEmail(
            email.trim(),
            password,
            displayName.trim()
          );
        } else if (FirebaseService && typeof FirebaseService.signUpWithEmail === 'function') {
          loggedInUser = await FirebaseService.signUpWithEmail(
            email.trim(),
            password,
            displayName.trim()
          );
        } else {
          throw new Error('新規登録機能が初期化されていません。');
        }
      } else {
        if (FirebaseService && typeof FirebaseService.loginWithEmail === 'function') {
          loggedInUser = await FirebaseService.loginWithEmail(email.trim(), password);
        } else if (FirebaseService && typeof FirebaseService.signInWithEmail === 'function') {
          loggedInUser = await FirebaseService.signInWithEmail(email.trim(), password);
        } else {
          throw new Error('メールログイン機能が初期化されていません。');
        }
      }

      if (loggedInUser && typeof onLoginSuccess === 'function') {
        onLoginSuccess(loggedInUser);
      }
    } catch (err) {
      console.error('メール認証エラー:', err);
      setErrorMsg(
        err?.message ||
          (isSignUp
            ? 'アカウント登録に失敗しました。パスワード（6文字以上）などをご確認ください。'
            : 'ログインに失敗しました。メールアドレスとパスワードをご確認ください。')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* 上部ブランドヘッダー */}
        <div className="bg-slate-950 px-6 py-7 text-center border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg mx-auto mb-3">
            {appIcon}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {appTitle}
          </h1>
          <p className="text-xs sm:text-sm text-amber-300 font-medium mt-1.5">
            {appSubtitle}
          </p>
        </div>

        {/* フォーム本体 */}
        <div className="p-6 sm:p-8">
          <h2 className="text-base font-extrabold text-slate-800 text-center mb-5">
            {isSignUp ? '新しい学習アカウントを作成' : 'メンバーログイン'}
          </h2>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Googleログインボタン */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2.5 shadow-sm mb-5 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4 text-indigo-600" />
            <span>Googleアカウントでログイン</span>
          </button>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-xs font-bold text-slate-400">
              またはメールアドレスで続ける
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* メールアドレス＆パスワードフォーム */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  表示名（ニックネーム）
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="例：Firdavs"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                パスワード（6文字以上）
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md mt-2"
            >
              {isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? '登録処理中...' : '新規アカウント登録'}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{loading ? 'ログイン中...' : 'ログインする'}</span>
                </>
              )}
            </button>
          </form>

          {/* ログイン・新規登録切り替え */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp((prev) => !prev);
                setErrorMsg('');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
            >
              {isSignUp
                ? 'すでにアカウントをお持ちの方はこちら（ログイン）'
                : '初めての方はこちら（新規アカウント作成）'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. 表示名変更モーダル（EditNameModal）
// =========================================================================
export function EditNameModal({ isOpen, currentName = '', onSave, onClose }) {
  const [nameInput, setNameInput] = useState(currentName);

  useEffect(() => {
    setNameInput(currentName || '');
  }, [currentName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    if (typeof onSave === 'function') {
      onSave(trimmed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 border border-slate-200 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-600" />
            表示名の変更
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              新しい表示名（お子様のお名前など）
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="名前を入力"
              maxLength={24}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =========================================================================
// 3. 共通ナビゲーションヘッダー（AppHeader）
// =========================================================================
export function AppHeader({
  user,
  customDisplayName,
  isAdmin = false,
  currentView,
  view,
  setView,
  onNavigate,
  onOpenEditName,
  onLogout
}) {
  const activeView = currentView || view || 'home';
  const appTitle = AppConfig?.APP_TITLE || '未来を生き抜く 思考力トレーニング';
  const appSubtitle =
    AppConfig?.APP_SUBTITLE || '毎日日替わり自動出題・タイマー＆弱点克服対応';
  const appIcon = AppConfig?.APP_ICON || '未';

  const displayName =
    customDisplayName || user?.displayName || user?.email?.split('@')[0] || 'メンバー';

  const navigateTo = (nextView) => {
    if (typeof onNavigate === 'function') onNavigate(nextView);
    else if (typeof setView === 'function') setView(nextView);
  };

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* 左側：ブランドロゴ（未）＆新タイトル */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition">
            {appIcon}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight">
              {appTitle}
            </h1>
            <p className="text-[11px] sm:text-xs text-amber-300 font-medium">
              {appSubtitle}
            </p>
          </div>
        </button>

        {/* 右側：ナビゲーション＆ユーザー操作 */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
              activeView === 'home'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>ホーム</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
              activeView === 'history'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>学習記録</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => navigateTo('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 ${
                activeView === 'admin'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-amber-300 hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>管理</span>
            </button>
          )}

          {/* 表示名編集ボタン */}
          <button
            type="button"
            onClick={onOpenEditName}
            title="表示名を変更"
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition flex items-center gap-1.5"
          >
            <span className="max-w-[90px] truncate">{displayName}</span>
            <Edit3 className="w-3 h-3 text-slate-400" />
          </button>

          {/* ログアウトボタン */}
          <button
            type="button"
            onClick={onLogout}
            title="ログアウト"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
