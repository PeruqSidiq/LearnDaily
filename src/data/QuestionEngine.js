// src/data/QuestionEngine.js
// 1日1回自動生成＆全ユーザー同一出題（JSONモード自動フォールバック・選択肢シャッフル固定対応）

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

const DAILY_STORAGE_PREFIX = 'learndaily_daily_quiz_';
const WORKING_MODEL_CACHE_KEY = 'learndaily_working_gemini_model';
const FIRESTORE_DAILY_COLLECTION = 'daily_ai_quizzes';

export class QuestionEngine {
  static firestoreDb = null;
  static inFlightRequests = new Map();

  /**
   * Firestore の db インスタンスを登録する
   */
  static setFirestoreDb(dbInstance) {
    if (dbInstance) {
      this.firestoreDb = dbInstance;
    }
  }

  /**
   * 日本時間（JST）の今日の日付文字列（YYYY-MM-DD）を取得
   */
  static getTodayJstString() {
    const now = new Date();
    const jstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return jstDate.toISOString().slice(0, 10);
  }

  /**
   * 日付＋科目＋学年ごとの共有ドキュメントIDを生成
   */
  static getDailySetKey(grade, subject, dateStr = this.getTodayJstString()) {
    const subj = subject || 'math';
    if (subj === 'english' || subj === 'english_listening') {
      return `${dateStr}_${subj}`;
    }
    return `${dateStr}_${subj}_${String(grade || '2')}`;
  }

  /**
   * 文字列から決定論的シード値を生成（全ユーザー同一結果用）
   */
  static hashStringToSeed(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  /**
   * シード付きシャッフル（全ユーザーで全く同じ並び順にする）
   */
  static deterministicShuffle(list, seedStr) {
    if (!Array.isArray(list)) return [];
    const arr = [...list];
    let seed = this.hashStringToSeed(seedStr || this.getTodayJstString());
    const nextRand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(nextRand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * 弱点復習用の通常ランダムシャッフル
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
   * 未シャッフル状態（1番目ばかりが正解）になっていないか判定する
   */
  static hasUnshuffledFirstChoiceBias(questions) {
    if (!Array.isArray(questions) || questions.length < 3) return false;
    const firstMatchCount = questions.filter(
      (q) => Array.isArray(q?.choices) && q.choices.length > 1 && q.choices[0] === q.answer
    ).length;
    return firstMatchCount >= Math.ceil(questions.length * 0.7);
  }

  /**
   * 問題データの形式を統一し、選択肢をシード固定でシャッフルする
   */
  static normalizeQuestions(
    questions,
    subject,
    count = 10,
    preserveOrder = true,
    choiceSeedPrefix = ''
  ) {
    const baseList = preserveOrder ? [...questions] : this.shuffle(questions);
    const selected = baseList.slice(0, count);

    const normalized = selected.map((q, index) => {
      const hasAudio = Boolean(q.audioText && String(q.audioText).trim());
      const rawChoices = Array.isArray(q.choices) ? [...q.choices] : [];

      let finalChoices = rawChoices;
      if (!preserveOrder) {
        finalChoices = this.shuffle(rawChoices);
      } else if (choiceSeedPrefix) {
        finalChoices = this.deterministicShuffle(
          rawChoices,
          `${choiceSeedPrefix}_choice_${index}_${q.question || ''}`
        );
      }

      return {
        id: q.id || `${subject}_q_${index + 1}`,
        subject,
        type: q.type || (hasAudio ? 'listening' : 'standard'),
        audioText: q.audioText || '',
        category: q.category || '思考トレーニング',
        question: q.question,
        choices: finalChoices,
        answer: q.answer,
        explanation: q.explanation || '正解を確認して次に進みましょう！'
      };
    });

    if (this.hasUnshuffledFirstChoiceBias(normalized)) {
      const fixSeed = choiceSeedPrefix || `${this.getTodayJstString()}_${subject}_fix`;
      return normalized.map((q, idx) => ({
        ...q,
        choices: this.deterministicShuffle(q.choices, `${fixSeed}_q_${idx}_${q.question || ''}`)
      }));
    }

    return normalized;
  }

  /**
   * ローカルストレージから本日の日替わり問題セットを取得
   */
  static getDailySetFromLocal(dailyKey) {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`${DAILY_STORAGE_PREFIX}${dailyKey}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * ローカルストレージへ本日の日替わり問題セットを保存
   */
  static saveDailySetToLocal(dailyKey, payload) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(`${DAILY_STORAGE_PREFIX}${dailyKey}`, JSON.stringify(payload));
    } catch (e) {
      console.warn('ローカルキャッシュ保存スキップ:', e);
    }
  }

  /**
   * 本日の問題セットを Firestore ＆ ローカルに保存
   */
  static async saveDailyQuizSet(
    grade,
    subject,
    questions,
    source = 'auto_daily',
    dateStr = this.getTodayJstString()
  ) {
    if (!Array.isArray(questions) || questions.length === 0) return false;
    const dailyKey = this.getDailySetKey(grade, subject, dateStr);
    const normalizedSubject =
      subject === 'english' || subject === 'english_listening' ? 'english' : subject;

    const fixedQuestions = this.normalizeQuestions(questions, normalizedSubject, 10, true, '');

    const payload = {
      date: dateStr,
      dailyKey,
      grade: String(grade || '2'),
      subject,
      source,
      updatedAt: new Date().toISOString(),
      questions: fixedQuestions
    };

    this.saveDailySetToLocal(dailyKey, payload);

    if (this.firestoreDb) {
      try {
        const ref = doc(this.firestoreDb, FIRESTORE_DAILY_COLLECTION, dailyKey);
        await setDoc(ref, payload);
        return true;
      } catch (err) {
        console.error('Firestore日替わり問題保存エラー:', err);
        if (source === 'admin_manual') {
          throw new Error(
            `Firestoreへの保存に失敗しました（${err?.message || '権限または通信エラー'}）`
          );
        }
      }
    }
    return false;
  }

  /**
   * 本日作成済みの全科目の日替わり問題一覧を Firestore から取得
   */
  static async getTodayDailySetsMap(dateStr = this.getTodayJstString()) {
    const resultMap = {};

    if (typeof localStorage !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(`${DAILY_STORAGE_PREFIX}${dateStr}_`)) {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.dailyKey) {
                resultMap[parsed.dailyKey] = parsed;
              }
            }
          }
        }
      } catch {
        // ignore
      }
    }

    if (this.firestoreDb) {
      try {
        const colRef = collection(this.firestoreDb, FIRESTORE_DAILY_COLLECTION);
        const snapshot = await getDocs(colRef);
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.date === dateStr) {
            resultMap[docSnap.id] = data;
            this.saveDailySetToLocal(docSnap.id, data);
          }
        });
      } catch (err) {
        console.warn('Firestore日替わり問題一覧の取得スキップ:', err);
      }
    }

    return resultMap;
  }

  /**
   * 管理画面から本日の日替わり問題を削除（リセット）
   */
  static async deleteDailyQuizSet(grade, subject, dateStr = this.getTodayJstString()) {
    const dailyKey = this.getDailySetKey(grade, subject, dateStr);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(`${DAILY_STORAGE_PREFIX}${dailyKey}`);
    }
    if (this.firestoreDb) {
      const ref = doc(this.firestoreDb, FIRESTORE_DAILY_COLLECTION, dailyKey);
      await deleteDoc(ref);
    }
  }

  /**
   * 内蔵問題エンジンから「本日の固定10問」を生成
   */
  static buildDeterministicFallbackQuiz(grade, subject, dateStr) {
    const seedKey = `${dateStr}_${subject}_${grade}`;

    if (subject === 'english_listening') {
      const pool =
        (typeof QuestionBank.getEnglishQuestions === 'function'
          ? QuestionBank.getEnglishQuestions()
          : QuestionBank.ENGLISH_QUESTIONS) || [];
      const listeningPool = pool.filter((q) => q.type === 'listening' || Boolean(q.audioText));
      const target = listeningPool.length > 0 ? listeningPool : pool;
      const picked = this.deterministicShuffle(target, seedKey).slice(0, 10);
      return this.normalizeQuestions(picked, 'english', 10, true, seedKey);
    }

    if (subject === 'english') {
      const pool =
        (typeof QuestionBank.getEnglishQuestions === 'function'
          ? QuestionBank.getEnglishQuestions()
          : QuestionBank.ENGLISH_QUESTIONS) || [];
      const standardPool = pool.filter((q) => q.type !== 'listening' && !q.audioText);
      const listeningPool = pool.filter((q) => q.type === 'listening' || Boolean(q.audioText));

      if (listeningPool.length > 0 && standardPool.length > 0) {
        const pickedStd = this.deterministicShuffle(standardPool, `${seedKey}_std`).slice(0, 7);
        const pickedLis = this.deterministicShuffle(listeningPool, `${seedKey}_lis`).slice(0, 3);
        return this.normalizeQuestions([...pickedStd, ...pickedLis], 'english', 10, true, seedKey);
      }
      const picked = this.deterministicShuffle(pool, seedKey).slice(0, 10);
      return this.normalizeQuestions(picked, 'english', 10, true, seedKey);
    }

    if (subject === 'japanese') {
      const pool =
        (typeof QuestionBank.getJapaneseQuestions === 'function'
          ? QuestionBank.getJapaneseQuestions(grade)
          : String(grade) === '5'
          ? QuestionBank.GRADE5_JAPANESE
          : QuestionBank.GRADE2_JAPANESE) || [];
      const picked = this.deterministicShuffle(pool, seedKey).slice(0, 10);
      return this.normalizeQuestions(picked, 'japanese', 10, true, seedKey);
    }

    if (subject === 'math') {
      const dateSeedNumber = this.hashStringToSeed(seedKey) % 10000;
      let generated = [];
      try {
        if (MathGenerator && typeof MathGenerator.generateMathQuestions === 'function') {
          generated = MathGenerator.generateMathQuestions(grade, 10, dateSeedNumber);
        } else if (MathGenerator && typeof MathGenerator.generate === 'function') {
          generated = MathGenerator.generate(grade, 10, dateSeedNumber);
        }
      } catch (e) {
        console.warn('MathGenerator fallback:', e);
      }
      const fallback =
        (typeof QuestionBank.getMathFallbackQuestions === 'function'
          ? QuestionBank.getMathFallbackQuestions(grade)
          : String(grade) === '5'
          ? QuestionBank.GRADE5_MATH_FALLBACK
          : QuestionBank.GRADE2_MATH_FALLBACK) || [];
      const combined = generated.length >= 10 ? generated : [...generated, ...fallback];
      return this.normalizeQuestions(combined, 'math', 10, true, seedKey);
    }

    // 総合（算数5問 ＋ 国語5問）
    const mathPart = this.buildDeterministicFallbackQuiz(grade, 'math', dateStr).slice(0, 5);
    const jpPart = this.buildDeterministicFallbackQuiz(grade, 'japanese', dateStr).slice(0, 5);
    return [...mathPart, ...jpPart];
  }

  /**
   * 応答テキストから JSON 配列（[...]）を安全に抽出してパースする
   */
  static extractJsonArrayFromText(rawText) {
    const cleaned = String(rawText || '')
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    try {
      const direct = JSON.parse(cleaned);
      if (Array.isArray(direct)) return direct;
    } catch {
      // 前後に説明文が含まれる場合は最初の '[' から最後の ']' を抽出
    }

    const startIdx = cleaned.indexOf('[');
    const endIdx = cleaned.lastIndexOf(']');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const slice = cleaned.slice(startIdx, endIdx + 1);
      const parsed = JSON.parse(slice);
      if (Array.isArray(parsed)) return parsed;
    }

    throw new Error('AIの応答から問題データ（JSON配列）を読み取れませんでした。');
  }

  /**
   * APIキーで利用可能な Gemini テキスト生成モデル一覧を取得（Gemma等の非対象モデルを除外）
   */
  static async discoverAvailableGeminiModels(cleanKey) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const listEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
        cleanKey
      )}`;
      const res = await fetch(listEndpoint, { signal: controller.signal });
      if (!res.ok) return [];
      const json = await res.json();
      const models = Array.isArray(json?.models) ? json.models : [];

      return models
        .filter((m) => {
          if (
            !Array.isArray(m.supportedGenerationMethods) ||
            !m.supportedGenerationMethods.includes('generateContent') ||
            typeof m.name !== 'string'
          ) {
            return false;
          }
          const lower = m.name.toLowerCase();
          // gemini- 系のみを対象とし、特殊用途・画像・音声専用モデルを除外
          if (!lower.includes('gemini-')) return false;
          if (
            lower.includes('embedding') ||
            lower.includes('imagen') ||
            lower.includes('veo') ||
            lower.includes('tts') ||
            lower.includes('robotics') ||
            lower.includes('computer-use') ||
            lower.includes('deep-research')
          ) {
            return false;
          }
          return true;
        })
        .map((m) => m.name.replace(/^models\//, ''))
        .sort((a, b) => {
          const score = (name) => {
            let s = 0;
            if (name.includes('flash')) s += 100;
            if (name.includes('2.5-flash')) s += 60;
            else if (name.includes('2.0-flash')) s += 50;
            else if (name.includes('3-flash') || name.includes('3.8-flash')) s += 45;
            if (name.includes('lite')) s -= 5;
            if (name.includes('exp') || name.includes('preview')) s -= 15;
            return s;
          };
          return score(b) - score(a);
        });
    } catch {
      return [];
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 単一モデルへの generateContent リクエスト実行（JSONモード非対応時は自動で通常モード再試行）
   */
  static async requestGeminiWithModel(model, cleanKey, prompt, useJsonMode = true) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 18000);

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(cleanKey)}`;

      const generationConfig = {
        temperature: 0.85
      };
      if (useJsonMode) {
        generationConfig.responseMimeType = 'application/json';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig
        })
      });

      if (!response.ok) {
        let apiDetail = '';
        try {
          const errBody = await response.json();
          apiDetail = errBody?.error?.message || '';
        } catch {
          apiDetail = '';
        }

        // JSON mode が無効なモデル（400）の場合は、responseMimeType を外して即座に再試行
        if (
          useJsonMode &&
          response.status === 400 &&
          /json mode|response_mime_type|not enabled|not supported/i.test(apiDetail)
        ) {
          clearTimeout(timeoutId);
          return await this.requestGeminiWithModel(model, cleanKey, prompt, false);
        }

        const err = new Error(
          `Gemini APIエラー (${response.status}): ${apiDetail || 'APIキーまたは利用制限を確認してください。'}`
        );
        err.status = response.status;
        err.apiDetail = apiDetail;
        throw err;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const parsed = this.extractJsonArrayFromText(rawText);

      if (Array.isArray(parsed) && parsed.length > 0 && typeof localStorage !== 'undefined') {
        localStorage.setItem(WORKING_MODEL_CACHE_KEY, model);
      }
      return parsed;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * APIキー自体が無効・権限不足であるか判定する
   */
  static isFatalAuthError(err) {
    if (!err) return false;
    if (err.status === 401 || err.status === 403) return true;
    const msg = `${err.message || ''} ${err.apiDetail || ''}`.toLowerCase();
    return msg.includes('api key not valid') || msg.includes('api_key_invalid');
  }

  /**
   * Gemini API を使って新しい問題を生成（1日1回の初回作成 ＆ 管理画面からの手動再作成共用）
   */
  static async fetchQuestionsFromGemini(grade, subject, apiKey, count = 10, customTopic = '') {
    const cleanKey = String(apiKey || '').trim();
    if (!cleanKey) {
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
なお、正解の選択肢が毎回1番目にならないよう、4つの選択肢の配置位置（1〜4番目）を問題ごとにバランスよく分散させてください。

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

    const cachedWorkingModel =
      typeof localStorage !== 'undefined' ? localStorage.getItem(WORKING_MODEL_CACHE_KEY) : '';

    const initialCandidates = Array.from(
      new Set(
        [
          cachedWorkingModel,
          AppConfig && AppConfig.GEMINI_MODEL,
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-3-flash',
          'gemini-3.8-flash'
        ].filter(Boolean)
      )
    );

    const triedModels = new Set();
    let lastError = null;
    const choiceSeed = `${this.getDailySetKey(grade, subject)}_${customTopic || 'ai'}`;

    for (const model of initialCandidates) {
      triedModels.add(model);
      try {
        const parsed = await this.requestGeminiWithModel(model, cleanKey, prompt, true);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalizedSubject = isEnglish ? 'english' : subject;
          return this.normalizeQuestions(parsed, normalizedSubject, count, true, choiceSeed);
        }
      } catch (err) {
        lastError = err;
        if (model === cachedWorkingModel && typeof localStorage !== 'undefined') {
          localStorage.removeItem(WORKING_MODEL_CACHE_KEY);
        }
        if (this.isFatalAuthError(err)) {
          throw err;
        }
      }
    }

    const discoveredModels = await this.discoverAvailableGeminiModels(cleanKey);
    for (const model of discoveredModels) {
      if (triedModels.has(model)) continue;
      triedModels.add(model);
      try {
        const parsed = await this.requestGeminiWithModel(model, cleanKey, prompt, true);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalizedSubject = isEnglish ? 'english' : subject;
          return this.normalizeQuestions(parsed, normalizedSubject, count, true, choiceSeed);
        }
      } catch (err) {
        lastError = err;
        if (this.isFatalAuthError(err)) {
          throw err;
        }
      }
    }

    throw new Error(
      lastError?.message ||
        '利用可能なGeminiモデルに接続できませんでした。Google AI StudioのAPIキー設定を確認してください。'
    );
  }

  /**
   * メインの出題エントリーポイント
   * ルール：1日1回だけ作成して保存し、その日中は全ユーザーに全く同じ問題・選択肢順を出題する
   */
  static async generateQuiz(grade, subject, customApiKey = '') {
    const targetSubject = subject || 'math';
    const targetGrade = String(grade || '2');
    const today = this.getTodayJstString();
    const dailyKey = this.getDailySetKey(targetGrade, targetSubject, today);
    const normalizedSubject =
      targetSubject === 'english' || targetSubject === 'english_listening'
        ? 'english'
        : targetSubject;

    // 1. Firestore から「本日の問題セット」を確認
    if (this.firestoreDb) {
      try {
        const ref = doc(this.firestoreDb, FIRESTORE_DAILY_COLLECTION, dailyKey);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data?.questions) && data.questions.length > 0) {
            const normalized = this.normalizeQuestions(data.questions, normalizedSubject, 10, true, '');
            this.saveDailySetToLocal(dailyKey, { ...data, questions: normalized });
            return normalized;
          }
        }
      } catch (err) {
        console.warn('Firestore日替わり問題確認スキップ:', err);
      }
    }

    // 2. ローカルキャッシュに本日分がある場合はそれを返す
    const localCached = this.getDailySetFromLocal(dailyKey);
    if (localCached && Array.isArray(localCached.questions) && localCached.questions.length > 0) {
      return this.normalizeQuestions(localCached.questions, normalizedSubject, 10, true, '');
    }

    // 3. 本日まだ作成されていない場合のみ、1日1回の新規作成を実行
    if (this.inFlightRequests.has(dailyKey)) {
      return this.inFlightRequests.get(dailyKey);
    }

    const creationPromise = (async () => {
      try {
        let apiKey =
          (customApiKey && customApiKey.trim()) ||
          (typeof localStorage !== 'undefined' ? localStorage.getItem('gemini_api_key') : '') ||
          '';

        if (!apiKey && this.firestoreDb) {
          try {
            const keySnap = await getDoc(doc(this.firestoreDb, 'admin_settings', 'gemini_config'));
            if (keySnap.exists()) {
              apiKey = String(keySnap.data()?.apiKey || '').trim();
              if (apiKey && typeof localStorage !== 'undefined') {
                localStorage.setItem('gemini_api_key', apiKey);
              }
            }
          } catch {
            // ignore
          }
        }

        let createdQuestions = null;

        if (apiKey) {
          try {
            createdQuestions = await this.fetchQuestionsFromGemini(
              targetGrade,
              targetSubject,
              apiKey,
              10
            );
          } catch (err) {
            console.warn('本日のAI初回作成に失敗したため、本日の固定内蔵セットを生成します:', err);
          }
        }

        if (!createdQuestions || createdQuestions.length === 0) {
          createdQuestions = this.buildDeterministicFallbackQuiz(
            targetGrade,
            targetSubject,
            today
          );
        }

        await this.saveDailyQuizSet(
          targetGrade,
          targetSubject,
          createdQuestions,
          'auto_daily',
          today
        );

        return this.normalizeQuestions(createdQuestions, normalizedSubject, 10, true, '');
      } finally {
        this.inFlightRequests.delete(dailyKey);
      }
    })();

    this.inFlightRequests.set(dailyKey, creationPromise);
    return creationPromise;
  }

  /**
   * 互換用エイリアスメソッド
   */
  static async generateDailyQuiz(grade, subject, customApiKey = '') {
    return this.generateQuiz(grade, subject, customApiKey);
  }
}

export default QuestionEngine;
