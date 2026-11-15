// src/data/QuestionEngine.js
// 全学年共通の英語入門テスト ＋ 学年別の算数・国語・総合トレーニング統合エンジン

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
   * 問題オブジェクトの形式を統一し、選択肢をシャッフルする
   */
  static normalizeQuestions(questions, subject, count = 10) {
    const selected = this.shuffle(questions).slice(0, count);
    return selected.map((q, index) => ({
      id: q.id || `${subject}_${Date.now()}_${index + 1}`,
      subject,
      category: q.category || '思考トレーニング',
      question: q.question,
      choices: this.shuffle(q.choices || []),
      answer: q.answer,
      explanation: q.explanation || '正解を確認して次に進みましょう！'
    }));
  }

  /**
   * 英語（English）入門問題を取得（2年生・5年生共通）
   */
  static getEnglishQuiz(count = 10) {
    const pool =
      (typeof QuestionBank.getEnglishQuestions === 'function'
        ? QuestionBank.getEnglishQuestions()
        : QuestionBank.ENGLISH_QUESTIONS) || [];
    return this.normalizeQuestions(pool, 'english', count);
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
    const subjectInstruction =
      subject === 'english'
        ? '日本の小学生がゼロから楽しく学ぶための「英語入門（あいさつ・数字・色・動物・食べ物・日常フレーズ）」の問題を10問作成してください。問題文と解説はわかりやすい日本語（カタカナ読みヒント付き）にし、選択肢は4つの英単語または短い英語フレーズにしてください。'
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

    return this.normalizeQuestions(parsed, subject, count);
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
