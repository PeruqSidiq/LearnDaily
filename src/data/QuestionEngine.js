import { AppConfig } from '../config/AppConfig.js';
import { QuizUtils } from '../utils/QuizUtils.js';
import { QuestionBank } from './QuestionBank.js';
import { MathGenerator } from './MathGenerator.js';

export class QuestionEngine {
  static buildSeed(attemptOffset = 0) {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate() + attemptOffset * 41;
  }

  static getSubjectQuestions(subject, grade, attemptOffset = 0) {
    const seedBase = QuestionEngine.buildSeed(attemptOffset);
    const isGrade2 = grade === 'grade2';

    if (subject === 'math') {
      return isGrade2 ? MathGenerator.generateGrade2(seedBase) : MathGenerator.generateGrade5(seedBase);
    }
    if (subject === 'japanese') {
      const pool = isGrade2 ? QuestionBank.JAPANESE_G2 : QuestionBank.JAPANESE_G5;
      return QuizUtils.shuffleArray(pool).slice(0, 10).map(QuizUtils.randomizeQuestionOptions);
    }
    if (subject === 'uyghur') {
      return QuizUtils.shuffleArray(QuestionBank.UYGHUR).slice(0, 10).map(QuizUtils.randomizeQuestionOptions);
    }
    return QuestionEngine.generateCombinedDynamic(grade, attemptOffset);
  }

  static generateCombinedDynamic(grade, attemptOffset = 0) {
    const seedBase = QuestionEngine.buildSeed(attemptOffset);
    const isGrade2 = grade === 'grade2';
    const math10 = isGrade2 ? MathGenerator.generateGrade2(seedBase) : MathGenerator.generateGrade5(seedBase);
    const jpPool = isGrade2 ? QuestionBank.JAPANESE_G2 : QuestionBank.JAPANESE_G5;
    const jp10 = QuizUtils.shuffleArray(jpPool).slice(0, 10).map(QuizUtils.randomizeQuestionOptions);
    return [...math10, ...jp10];
  }

  static async fetchDailyQuestions(grade = 'grade2', attemptOffset = 0) {
    const gradeLabel = grade === 'grade2' ? '小学2年生' : '小学5年生';
    let apiKey = '';
    try {
      apiKey = localStorage.getItem(AppConfig.LOCAL_GEMINI_KEY) || '';
    } catch {
      apiKey = '';
    }

    if (apiKey) {
      const systemPrompt = `あなたは四谷大塚の入塾テスト・中学受験の算数と国語の専門講師です。
${gradeLabel}対象の四谷大塚入塾テストレベルの4択問題を生成してください。
毎回異なる数値・題材を使い、レスポンスは必ず指定されたJSON配列のみで返してください。`;

      const userQuery = `四谷大塚の入塾テスト対策として、${gradeLabel}向けの算数10問と国語10問（合計20問）の完全新作テスト問題を作成してください（本日の日付: ${QuizUtils.getTodayDateString()}、回数シード: ${attemptOffset}）。`;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: userQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING" },
                category: { type: "STRING" },
                categoryName: { type: "STRING" },
                question: { type: "STRING" },
                options: { type: "ARRAY", items: { type: "STRING" } },
                correctIndex: { type: "INTEGER" },
                explanation: { type: "STRING" }
              },
              required: ["id", "category", "categoryName", "question", "options", "correctIndex", "explanation"]
            }
          }
        }
      };

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            if (Array.isArray(parsed) && parsed.length >= 10) {
              return parsed.map(QuizUtils.randomizeQuestionOptions);
            }
          }
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to dynamic generator:", err);
      }
    }

    return QuestionEngine.generateCombinedDynamic(grade, attemptOffset);
  }
}
