import { AppConfig } from '../config/AppConfig.js';

export class QuizUtils {
  static getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  static formatSeconds(sec) {
    const safeSec = Math.max(0, sec);
    const m = Math.floor(safeSec / 60);
    const s = safeSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  static shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  static randomizeQuestionOptions(questionObj) {
    const indexed = questionObj.options.map((text, idx) => ({
      text,
      isCorrect: idx === questionObj.correctIndex
    }));
    const shuffled = QuizUtils.shuffleArray(indexed);
    return {
      ...questionObj,
      options: shuffled.map(o => o.text),
      correctIndex: shuffled.findIndex(o => o.isCorrect)
    };
  }

  static getSubjectLabel(subjectKey) {
    return AppConfig.SUBJECT_LABELS[subjectKey] || '算国総合模試';
  }

  static getRankBadge(avgPercentage) {
    if (avgPercentage >= 85) {
      return { title: "Sクラス合格圏内", color: "bg-amber-500 text-white", border: "border-amber-300" };
    }
    if (avgPercentage >= 70) {
      return { title: "Cクラス上位圏内", color: "bg-indigo-600 text-white", border: "border-indigo-300" };
    }
    if (avgPercentage >= 55) {
      return { title: "Bクラス標準圏内", color: "bg-emerald-600 text-white", border: "border-emerald-300" };
    }
    return { title: "Aクラス挑戦中", color: "bg-slate-600 text-white", border: "border-slate-300" };
  }
}
