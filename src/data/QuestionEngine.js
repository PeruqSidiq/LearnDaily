// src/data/QuestionEngine.js
// 全学年共通の英語入門テスト（通常＋リスニング対応）＆学年別（算数・国語・総合）統合出題エンジン

import { QuestionBank } from './QuestionBank';
import { MathGenerator } from './MathGenerator';
import { QuizUtils } from '../utils/QuizUtils';
import { AppConfig } from '../config/AppConfig';

export class QuestionEngine {
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
   * 通常問題（単語・フレーズ）とリスニング問題がバランスよく出題されます
   */
  static getEnglishQuiz(count = 10) {
    const pool =
      (typeof QuestionBank.getEnglishQuestions === 'function'
        ? QuestionBank.getEnglishQuestions()
        : QuestionBank.ENGLISH_QUESTIONS) || [];

    const standardPool = pool.filter((q) => q.type !== 'listening' && !q.audioText);
    const listeningPool = pool.filter((q) => q.type === 'listening' || Boolean(q.audioText));

    // リスニング問題が含まれている場合は、10問中3問をリスニング・7問を通常問題にしてバランスよく出題
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
   * 英語リスニング問題のみを抽出して取得（リスニング集中モード用）
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
   * Gemini API を使って新しい問題を自動生成（APIキー設定時のみ動作）
   */
  static async fetchQuestionsFromGemini(grade, subject, apiKey, count = 10) {
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

    const prompt = `あなたは子どもの未来を生き抜く思考力と語学力を育てる教育トレーナーです。
${subjectInstruction}

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
      apiKey
    )}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const parsed = JSON.parse(rawText);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Invalid Gemini response format');
    }

    const normalizedSubject = isEnglish ? 'english' : subject;
    return this.normalizeQuestions(parsed, normalizedSubject, count);
  }

  /**
   * メインの出題エントリーポイント（App.jsx から呼び出されるメソッド）
   */
  static async generateQuiz(grade, subject, customApiKey = '', seedOffset = 0) {
    const targetSubject = subject || 'math';
    const apiKey =
      (customApiKey && customApiKey.trim()) ||
      (typeof localStorage !== 'undefined' ? localStorage.getItem('gemini_api_key') : '') ||
      '';

    // 1. Gemini APIキーが登録されている場合はAI新作問題に挑戦
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

    // 2. 内蔵問題エンジンによる出題（APIキー未設定時・オフライン時）
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
   * 互換用エイリアスメソッド（呼び出し元の命名揺れに対応）
   */
  static async generateDailyQuiz(grade, subject, customApiKey = '', seedOffset = 0) {
    return this.generateQuiz(grade, subject, customApiKey, seedOffset);
  }
}

export default QuestionEngine;
