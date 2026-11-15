// src/data/QuestionEngine.js
// 全学年共通の英語入門テスト（通常＋リスニング対応）＆学年別（算数・国語・総合）＆Firestoreクラウド同期エンジン

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs
} from 'firebase/firestore';
import { QuestionBank } from './QuestionBank';
import { MathGenerator } from './MathGenerator';
import { QuizUtils } from '../utils/QuizUtils';
import { AppConfig } from '../config/AppConfig';

const CUSTOM_AI_STORAGE_KEY = 'learndaily_custom_ai_sets';
const FIRESTORE_COLLECTION = 'custom_ai_quizzes';

export class QuestionEngine {
  // App.jsx 等から渡される Firestore インスタンスを保持
  static firestoreDb = null;

  /**
   * Firestore の db インスタンスを登録する
   */
  static setFirestoreDb(dbInstance) {
    if (dbInstance) {
      this.firestoreDb = dbInstance;
    }
  }

  /**
   * 配列を安全にシャッフルする内部ヘルパー
   */
  static shuffle(list) {
    if (!Array.isArray(list)) return [];
    if (QuizUtils && typeof QuizUtils.shuffleArray === 'function') {
      return QuizUtils.shuffleArray([...list]);
    }
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * カスタム問題セット用のキー（FirestoreドキュメントID兼用）を生成
   */
  static getCustomSetKey(grade, subject) {
    if (subject === 'english' || subject === 'english_listening') {
      return subject;
    }
    return `${subject}_${String(grade || '2')}`;
  }

  /**
   * ローカルキャッシュから全カスタムセットを読み込む
   */
  static getAllCustomAiSetsFromLocal() {
    if (typeof localStorage === 'undefined') return {};
    try {
      const raw = localStorage.getItem(CUSTOM_AI_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  /**
   * AIが再作成した問題セットをローカル＆Firestoreの両方に保存（全端末へ同期）
   */
  static async saveCustomAiQuestions(grade, subject, questions, updatedBy = '') {
    if (!Array.isArray(questions) || questions.length === 0) return false;
    const key = this.getCustomSetKey(grade, subject);
    const payload = {
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'admin',
      grade: String(grade),
      subject,
      questions
    };

    // 1. ローカルストレージへ即座に保存
    if (typeof localStorage !== 'undefined') {
      try {
        const store = this.getAllCustomAiSetsFromLocal();
        store[key] = payload;
        localStorage.setItem(CUSTOM_AI_STORAGE_KEY, JSON.stringify(store));
      } catch (e) {
        console.warn('ローカルキャッシュ保存スキップ:', e);
      }
    }

    // 2. Firestore へクラウド保存（別端末・スマホ・タブレットと共有）
    if (this.firestoreDb) {
      try {
        const ref = doc(this.firestoreDb, FIRESTORE_COLLECTION, key);
        await setDoc(ref, payload);
        return true;
      } catch (err) {
        console.error('Firestoreへのカスタム問題保存エラー:', err);
        throw new Error(
          `Firestoreへの保存に失敗しました（${err?.message || '権限または通信エラー'}）`
        );
      }
    }

    return false;
  }

  /**
   * 適用中のカスタムAI問題セットを取得（Firestore優先 → ローカルキャッシュフォールバック）
   */
  static async getCustomAiQuestions(grade, subject) {
    const key = this.getCustomSetKey(grade, subject);

    // 1. Firestore から最新を取得
    if (this.firestoreDb) {
      try {
        const ref = doc(this.firestoreDb, FIRESTORE_COLLECTION, key);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          // ローカルキャッシュも最新に更新
          if (typeof localStorage !== 'undefined') {
            const store = this.getAllCustomAiSetsFromLocal();
            store[key] = data;
            localStorage.setItem(CUSTOM_AI_STORAGE_KEY, JSON.stringify(store));
          }
          return data;
        } else {
          // Firestore上で解除済みの場合はローカル側も同期削除
          if (typeof localStorage !== 'undefined') {
            const store = this.getAllCustomAiSetsFromLocal();
            if (store[key]) {
              delete store[key];
              localStorage.setItem(CUSTOM_AI_STORAGE_KEY, JSON.stringify(store));
            }
          }
          return null;
        }
      } catch (err) {
        console.warn('Firestoreからの問題取得に失敗したためローカルキャッシュを使用します:', err);
      }
    }

    // 2. ローカルキャッシュから取得
    const localStore = this.getAllCustomAiSetsFromLocal();
    return localStore[key] || null;
  }

  /**
   * Firestore 上のすべてのカスタムAI問題セットを取得してローカルと同期（ホーム・管理画面用）
   */
  static async syncAllCustomAiSetsFromFirestore() {
    if (!this.firestoreDb) {
      return this.getAllCustomAiSetsFromLocal();
    }

    try {
      const colRef = collection(this.firestoreDb, FIRESTORE_COLLECTION);
      const snapshot = await getDocs(colRef);
      const syncedStore = {};
      snapshot.forEach((docSnap) => {
        syncedStore[docSnap.id] = docSnap.data();
      });

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CUSTOM_AI_STORAGE_KEY, JSON.stringify(syncedStore));
      }
      return syncedStore;
    } catch (err) {
      console.warn('Firestoreカスタム問題一覧の同期エラー:', err);
      return this.getAllCustomAiSetsFromLocal();
    }
  }

  /**
   * 適用中のカスタムAI問題セットをローカル＆Firestoreの両方から解除
   */
  static async clearCustomAiQuestions(grade, subject) {
    const key = subject ? this.getCustomSetKey(grade, subject) : null;

    // 1. ローカルから削除
    if (typeof localStorage !== 'undefined') {
      try {
        if (!key) {
          localStorage.removeItem(CUSTOM_AI_STORAGE_KEY);
        } else {
          const store = this.getAllCustomAiSetsFromLocal();
          delete store[key];
          localStorage.setItem(CUSTOM_AI_STORAGE_KEY, JSON.stringify(store));
        }
      } catch (e) {
        console.warn('ローカルキャッシュ削除エラー:', e);
      }
    }

    // 2. Firestore から削除
    if (this.firestoreDb && key) {
      try {
        const ref = doc(this.firestoreDb, FIRESTORE_COLLECTION, key);
        await deleteDoc(ref);
      } catch (err) {
        console.error('Firestoreのカスタム問題解除エラー:', err);
        throw new Error(
          `Firestoreからの解除に失敗しました（${err?.message || '権限または通信エラー'}）`
        );
      }
    }
  }

  /**
   * 問題オブジェクトの形式を統一し、リスニング用プロパティ（type / audioText）を保持する
   */
  static normalizeQuestions(questions, subject, count = 10) {
    const selected = this.shuffle(questions).slice(0, count);
    return selected.map((q, index) => {
      const hasAudio = Boolean(q.audioText && String(q.audioText).trim());
      return {
        id: q.id || `${subject}_${Date.now()}_${index + 1}`,
        subject,
        type: q.type || (hasAudio ? 'listening' : 'standard'),
        audioText: q.audioText || '',
        category: q.category || '思考トレーニング',
        question: q.question,
        choices: this.shuffle(q.choices || []),
        answer: q.answer,
        explanation: q.explanation || '正解を確認して次に進みましょう！'
      };
    });
  }

  /**
   * 英語（English）入門問題を取得（2年生・5年生共通）
   */
  static getEnglishQuiz(count = 10) {
    const pool =
      (typeof QuestionBank.getEnglishQuestions === 'function'
        ? QuestionBank.getEnglishQuestions()
        : QuestionBank.ENGLISH_QUESTIONS) || [];

    const standardPool = pool.filter((q) => q.type !== 'listening' && !q.audioText);
    const listeningPool = pool.filter((q) => q.type === 'listening' || Boolean(q.audioText));

    if (listeningPool.length > 0 && standardPool.length > 0 && count >= 4) {
      const listeningCount = Math.min(3, listeningPool.length);
      const standardCount = count - listeningCount;
      const pickedStandard = this.shuffle(standardPool).slice(0, standardCount);
      const pickedListening = this.shuffle(listeningPool).slice(0, listeningCount);
      return this.normalizeQuestions([...pickedStandard, ...pickedListening], 'english', count);
    }

    return this.normalizeQuestions(pool, 'english', count);
  }

  /**
   * 英語リスニング問題のみを抽出して取得
   */
  static getEnglishListeningQuiz(count = 10) {
    const pool =
      (typeof QuestionBank.getEnglishQuestions === 'function'
        ? QuestionBank.getEnglishQuestions()
        : QuestionBank.ENGLISH_QUESTIONS) || [];

    const listeningPool = pool.filter((q) => q.type === 'listening' || Boolean(q.audioText));
    const targetPool = listeningPool.length > 0 ? listeningPool : pool;
    return this.normalizeQuestions(targetPool, 'english', count);
  }

  /**
   * 国語問題を取得（学年別）
   */
  static getJapaneseQuiz(grade, count = 10) {
    const pool =
      (typeof QuestionBank.getJapaneseQuestions === 'function'
        ? QuestionBank.getJapaneseQuestions(grade)
        : String(grade) === '5'
        ? QuestionBank.GRADE5_JAPANESE
        : QuestionBank.GRADE2_JAPANESE) || [];
    return this.normalizeQuestions(pool, 'japanese', count);
  }

  /**
   * 算数問題を取得（MathGenerator ＋ 予備問題バンク）
   */
  static getMathQuiz(grade, count = 10, seedOffset = 0) {
    let generated = [];
    try {
      if (MathGenerator && typeof MathGenerator.generateMathQuestions === 'function') {
        generated = MathGenerator.generateMathQuestions(grade, count, seedOffset);
      } else if (MathGenerator && typeof MathGenerator.generate === 'function') {
        generated = MathGenerator.generate(grade, count, seedOffset);
      }
    } catch (e) {
      console.warn('MathGenerator fallback triggered:', e);
    }

    const fallback =
      (typeof QuestionBank.getMathFallbackQuestions === 'function'
        ? QuestionBank.getMathFallbackQuestions(grade)
        : String(grade) === '5'
        ? QuestionBank.GRADE5_MATH_FALLBACK
        : QuestionBank.GRADE2_MATH_FALLBACK) || [];

    const combined = [...generated, ...fallback];
    return this.normalizeQuestions(combined, 'math', count);
  }

  /**
   * Gemini API を使って新しい問題を自動生成（管理画面からのテーマ指定にも対応）
   */
  static async fetchQuestionsFromGemini(grade, subject, apiKey, count = 10, customTopic = '') {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Gemini APIキーが設定されていません。');
    }

    const isEnglish = subject === 'english' || subject === 'english_listening';
    const subjectInstruction =
      subject === 'english_listening'
        ? `日本の小学生がゼロから楽しく学ぶための「英語リスニング問題」を${count}問作成してください。すべての問題で type を "listening" にし、audioText に読み上げる英単語や短い英語フレーズを入れ、question には「【リスニング】スピーカーボタンを押して英語の発音を聞き、正しい意味をえらぼう！」と記載し、choices には4つの日本語の意味を入れてください。`
        : subject === 'english'
        ? `日本の小学生がゼロから楽しく学ぶための「英語入門」の問題を${count}問作成してください。内訳は7問を通常問題（type: "standard"、audioText: ""、日本語の問題文＋4つの英語選択肢）、3問をリスニング問題（type: "listening"、audioText: "読み上げる英語"、日本語の意味を4択から選ぶ形式）にしてください。`
        : subject === 'japanese'
        ? `小学${grade}年生向けに、未来を生き抜く読解力・語彙力・論理的思考力を育てる国語の問題を${count}問作成してください。`
        : subject === 'math'
        ? `小学${grade}年生向けに、自ら考え筋道を立てて解く思考力算数の問題を${count}問作成してください。`
        : `小学${grade}年生向けに、算数と国語の総合思考力問題を${count}問作成してください。`;

    const topicConstraint =
      customTopic && customTopic.trim()
        ? `\n【保護者・管理者からの追加テーマ指定】\n「${customTopic.trim()}」の内容や傾向を重点的に取り入れて問題を作成してください。`
        : '';

    const prompt = `あなたは子どもの未来を生き抜く思考力と語学力を育てる教育トレーナーです。
${subjectInstruction}${topicConstraint}

必ず以下のJSON配列形式のみを出力してください（マークダウン記法や余分な説明文は不要です）：
[
  {
    "type": "standard または listening",
    "audioText": "リスニング問題で読み上げる英語（通常問題の場合は空文字）",
    "category": "分野名",
    "question": "問題文",
    "choices": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
    "answer": "正解の選択肢（choices内の文字列と完全一致）",
    "explanation": "子どもにもわかりやすい丁寧な解説"
  }
]`;

    const model = (AppConfig && AppConfig.GEMINI_MODEL) || 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      apiKey.trim()
    )}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(
        `Gemini APIエラー (ステータス: ${response.status})。APIキーが正しいか確認してください。`
      );
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const parsed = JSON.parse(rawText);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('AIからの問題データの解析に失敗しました。もう一度お試しください。');
    }

    const normalizedSubject = isEnglish ? 'english' : subject;
    return this.normalizeQuestions(parsed, normalizedSubject, count);
  }

  /**
   * メインの出題エントリーポイント（App.jsx から呼び出されるメソッド）
   */
  static async generateQuiz(grade, subject, customApiKey = '', seedOffset = 0) {
    const targetSubject = subject || 'math';

    // 1. Firestore / ローカルに保存された「AI再作成カスタム問題セット」があれば最優先で出題
    const savedCustom = await this.getCustomAiQuestions(grade, targetSubject);
    if (savedCustom && Array.isArray(savedCustom.questions) && savedCustom.questions.length > 0) {
      const normalizedSubject =
        targetSubject === 'english_listening' ? 'english' : targetSubject;
      return this.normalizeQuestions(savedCustom.questions, normalizedSubject, 10);
    }

    const apiKey =
      (customApiKey && customApiKey.trim()) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('gemini_api_key') : '') ||
      '';

    // 2. Gemini APIキーが登録されている場合はAI新作問題に挑戦
    if (apiKey) {
      try {
        const aiQuestions = await this.fetchQuestionsFromGemini(grade, targetSubject, apiKey, 10);
        if (aiQuestions && aiQuestions.length > 0) {
          return aiQuestions;
        }
      } catch (err) {
        console.warn('Gemini API出題から内蔵問題エンジンへ切り替えます:', err);
      }
    }

    // 3. 内蔵問題エンジンによる出題（APIキー未設定時・オフライン時）
    if (targetSubject === 'english_listening') {
      return this.getEnglishListeningQuiz(10);
    }

    if (targetSubject === 'english') {
      return this.getEnglishQuiz(10);
    }

    if (targetSubject === 'japanese') {
      return this.getJapaneseQuiz(grade, 10);
    }

    if (targetSubject === 'math') {
      return this.getMathQuiz(grade, 10, seedOffset);
    }

    // 総合トレーニング（算数5問 ＋ 国語5問）
    const mathPart = this.getMathQuiz(grade, 5, seedOffset);
    const jpPart = this.getJapaneseQuiz(grade, 5);
    return this.shuffle([...mathPart, ...jpPart]);
  }

  /**
   * 互換用エイリアスメソッド
   */
  static async generateDailyQuiz(grade, subject, customApiKey = '', seedOffset = 0) {
    return this.generateQuiz(grade, subject, customApiKey, seedOffset);
  }
}

export default QuestionEngine;
