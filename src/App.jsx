import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc
} from 'firebase/firestore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import {
  Trophy, BookOpen, Calculator, CheckCircle2, User, LogIn, LogOut, BarChart2, ChevronRight, Sparkles, BrainCircuit, Check, AlertCircle, History, ArrowRight, Calendar, Flame, RefreshCw, Zap,
  ShieldCheck, Users, TrendingUp, Filter, CalendarDays, Timer, Target, RotateCcw, Mail, KeyRound, UserPlus, Edit3
} from 'lucide-react';

// ==========================================
// Firebase Configuration & Initialization
// ==========================================
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
      apiKey: "AIzaSyBbqWjybJrRu4VR90CJohRk-QsbFEFlrj8",
      authDomain: "learndaily-69355.firebaseapp.com",
      projectId: "learndaily-69355",
      storageBucket: "learndaily-69355.firebasestorage.app",
      messagingSenderId: "161457830120",
      appId: "1:161457830120:web:d8465efae2b3e95c12f15d",
      measurementId: "G-RYTSDGW0GP"
    };

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'yotsuya-otsuka-prep-app';

// Authorized Parent Admin Google Account
const ADMIN_EMAIL = 'peruqsidiq@gmail.com';

// Helper to get Today's Date String (YYYY-MM-DD)
const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Helper to format seconds as MM:SS
const formatSeconds = (sec) => {
  const safeSec = Math.max(0, sec);
  const m = Math.floor(safeSec / 60);
  const s = safeSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

// Helper: Shuffle Array (Fisher-Yates)
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Helper: Shuffle Options inside a Question while keeping correctIndex accurate
const randomizeQuestionOptions = (q) => {
  const indexedOptions = q.options.map((text, idx) => ({
    text,
    isCorrect: idx === q.correctIndex
  }));
  const shuffled = shuffleArray(indexedOptions);
  return {
    ...q,
    options: shuffled.map(o => o.text),
    correctIndex: shuffled.findIndex(o => o.isCorrect)
  };
};

// ==========================================
// Dynamic Math Generators (Produces Fresh Numbers Every Day & Every Attempt)
// ==========================================

const generateDynamicMathG2 = (seedBase) => {
  const rand = (offset, min, max) => {
    const x = Math.sin(seedBase + offset * 17.3) * 10000;
    const frac = x - Math.floor(x);
    return Math.floor(frac * (max - min + 1)) + min;
  };

  // Q1: 工夫するたし算
  const a1 = rand(1, 13, 28);
  const c1 = 40 - a1;
  const b1 = rand(2, 11, 29);
  const ans1 = 40 + b1;

  // Q2: かけ算・九九の文章題
  const perBox = rand(3, 4, 9);
  const boxes = rand(4, 3, 8);
  const ans2 = perBox * boxes;

  // Q3: 2人の合計（和差のきほん）
  const baseCards = rand(5, 22, 48);
  const moreCards = rand(6, 6, 18);
  const friendCards = baseCards + moreCards;
  const ans3 = baseCards + friendCards;

  // Q4: 長さの計算（m と cm）
  const meters = rand(7, 1, 3);
  const extraCm = rand(8, 10, 45);
  const cutCm = rand(9, 25, 85);
  const totalCm = meters * 100 + extraCm;
  const ans4 = totalCm - cutCm;

  // Q5: 100からのひき算
  const subNum = rand(10, 23, 78);
  const ans5 = 100 - subNum;

  // Q6: 数の規則性（等差）
  const startSeq = rand(11, 2, 9);
  const stepSeq = rand(12, 3, 7);
  const seqArr = [0, 1, 2, 3, 4].map(i => startSeq + stepSeq * i);
  const ans6 = startSeq + stepSeq * 5;

  // Q7: 時計・時間の進み
  const startHour = rand(13, 8, 10);
  const startMin = rand(14, 15, 40);
  const addMin = rand(15, 30, 50);
  const totalMins = startMin + addMin;
  const endHour = startHour + Math.floor(totalMins / 60);
  const endMin = totalMins % 60;
  const altMin = endMin >= 5 ? endMin - 5 : endMin + 5;
  const ans7 = `午前 ${endHour}時 ${String(endMin).padStart(2, '0')}分`;

  // Q8: 水のかさ（L と dL）
  const liters = rand(16, 2, 5);
  const deciliters = rand(17, 2, 8);
  const ans8 = liters * 10 + deciliters;

  // Q9: お買い物のおつり
  const itemA = rand(18, 120, 260);
  const itemB = rand(19, 110, 210);
  const ans9 = 500 - (itemA + itemB);

  // Q10: 図形の辺と頂点
  const shapeIdx = rand(20, 0, 2);
  const shapes = [
    { name: "三角形", corners: 3, explain: "三角形は 3つの ちょうてん（角）と 3つの へんから できています。" },
    { name: "四角形（長方形）", corners: 4, explain: "四角形は 4つの ちょうてん（角）と 4つの へんから できています。" },
    { name: "さいころ（立方体）の めん（かお）", corners: 6, explain: "さいころ（立方体）の 面の数は 全部で 6つ です。" }
  ];
  const chosenShape = shapes[shapeIdx];

  const pool = [
    {
      id: `g2_m1_${seedBase}`,
      category: "計算の工夫",
      categoryName: "算数計算",
      question: `つぎの けいさんを くふうして しなさい。\n${a1} + ${b1} + ${c1}`,
      options: [`${ans1}`, `${ans1 - 10}`, `${ans1 + 10}`, `${ans1 - 5}`],
      correctIndex: 0,
      explanation: `${a1} と ${c1} を さきに たすと ちょうど 40 になります。\n40 + ${b1} = ${ans1} です。`
    },
    {
      id: `g2_m2_${seedBase}`,
      category: "かけ算・九九",
      categoryName: "算数計算",
      question: `1ふくろに ${perBox}こずつ アメが はいっています。${boxes}ふくろでは みんなで 何こになりますか。`,
      options: [`${ans2} 個`, `${perBox + boxes} 個`, `${ans2 + perBox} 個`, `${ans2 - boxes} 個`],
      correctIndex: 0,
      explanation: `1つ分の数 × いくつ分 ＝ 全部の数 なので、\n${perBox} × ${boxes} = ${ans2} 個 になります。`
    },
    {
      id: `g2_m3_${seedBase}`,
      category: "文章題・和差",
      categoryName: "特殊算",
      question: `ゆうた君は カードを ${baseCards}まい もっています。けんた君は ゆうた君より ${moreCards}まい おおく もっています。2人あわせて 何まい もっていますか。`,
      options: [`${ans3} 枚`, `${friendCards} 枚`, `${baseCards * 2} 枚`, `${ans3 + 10} 枚`],
      correctIndex: 0,
      explanation: `まず けんた君の まい数を もとめます：${baseCards} + ${moreCards} = ${friendCards} 枚。\n2人あわせて：${baseCards} + ${friendCards} = ${ans3} 枚 です。`
    },
    {
      id: `g2_m4_${seedBase}`,
      category: "単位・長さ",
      categoryName: "思考力",
      question: `${meters}m ${extraCm}cm の リボンがあります。ここから ${cutCm}cm 切りとると、のこりは 何cm になりますか。`,
      options: [`${ans4} cm`, `${ans4 + 100} cm`, `${ans4 - 10} cm`, `${totalCm} cm`],
      correctIndex: 0,
      explanation: `1m ＝ 100cm なので、${meters}m ${extraCm}cm ＝ ${totalCm}cm です。\n${totalCm} - ${cutCm} ＝ ${ans4}cm となります。`
    },
    {
      id: `g2_m5_${seedBase}`,
      category: "たし算・ひき算",
      categoryName: "算数計算",
      question: `100 から ${subNum} を ひいた 答えは いくつですか。`,
      options: [`${ans5}`, `${ans5 + 10}`, `${ans5 - 10}`, `${100 - subNum + 1}`],
      correctIndex: 0,
      explanation: `100 - ${subNum} = ${ans5} です。たしかめ算（${ans5} + ${subNum} = 100）も してみましょう。`
    },
    {
      id: `g2_m6_${seedBase}`,
      category: "規則性",
      categoryName: "思考力",
      question: `${seqArr.join(', ')}, ◯ … と きまりよく ならんでいます。◯に はいる かずは いくつですか。`,
      options: [`${ans6}`, `${ans6 - 1}`, `${ans6 + stepSeq}`, `${ans6 + 1}`],
      correctIndex: 0,
      explanation: `${stepSeq}ずつ ふえる きまりです。\n${seqArr[4]} + ${stepSeq} = ${ans6} となります。`
    },
    {
      id: `g2_m7_${seedBase}`,
      category: "時計・時間",
      categoryName: "思考力",
      question: `午前 ${startHour}時 ${startMin}分 から ${addMin}分ごの じかんは 午前何時何分ですか。`,
      options: [
        ans7,
        `午前 ${endHour}時 ${String((endMin + 10) % 60).padStart(2, '0')}分`,
        `午前 ${endHour - 1}時 ${String(endMin).padStart(2, '0')}分`,
        `午前 ${endHour}時 ${String(altMin).padStart(2, '0')}分`
      ],
      correctIndex: 0,
      explanation: `${startMin}分 ＋ ${addMin}分 ＝ ${totalMins}分（1時間と ${endMin}分）なので、\n${ans7} になります。`
    },
    {
      id: `g2_m8_${seedBase}`,
      category: "水のかさ",
      categoryName: "思考力",
      question: `${liters}L ${deciliters}dL の 水は、全部で 何dL（デシリットル）ですか。`,
      options: [`${ans8} dL`, `${liters + deciliters} dL`, `${ans8 * 10} dL`, `${ans8 - 5} dL`],
      correctIndex: 0,
      explanation: `1L ＝ 10dL なので、${liters}L ＝ ${liters * 10}dL です。\n${liters * 10} + ${deciliters} = ${ans8}dL になります。`
    },
    {
      id: `g2_m9_${seedBase}`,
      category: "お金の計算",
      categoryName: "算数計算",
      question: `500円玉を 1まい もって 買い物に いきました。${itemA}円の ノートと ${itemB}円の えんぴつを 買うと、おつりは 何円ですか。`,
      options: [`${ans9} 円`, `${500 - itemA} 円`, `${ans9 + 50} 円`, `${ans9 + 100} 円`],
      correctIndex: 0,
      explanation: `2つの 代金の 合計は ${itemA} + ${itemB} = ${itemA + itemB} 円です。\nおつりは 500 - ${itemA + itemB} = ${ans9} 円になります。`
    },
    {
      id: `g2_m10_${seedBase}`,
      category: "図形",
      categoryName: "図形",
      question: `${chosenShape.name}は いくつ ありますか。`,
      options: [`${chosenShape.corners} つ`, `${chosenShape.corners + 2} つ`, `${chosenShape.corners - 1} つ`, `${chosenShape.corners + 4} つ`],
      correctIndex: 0,
      explanation: chosenShape.explain
    }
  ];

  return shuffleArray(pool).map(randomizeQuestionOptions);
};

const generateDynamicMathG5 = (seedBase) => {
  const rand = (offset, min, max) => {
    const x = Math.sin(seedBase + offset * 23.7) * 10000;
    const frac = x - Math.floor(x);
    return Math.floor(frac * (max - min + 1)) + min;
  };

  // Q1: 分配法則（計算の工夫）
  const multX = rand(1, 14, 49);
  const numY1 = rand(2, 22, 68);
  const numY2 = 100 - numY1;
  const ans1 = multX * 100;

  // Q2: 植木算（両端に植える）
  const interval = rand(3, 3, 8);
  const gaps = rand(4, 10, 24);
  const totalDist = interval * gaps;
  const ans2 = gaps + 1;

  // Q3: 和差算
  const younger = rand(5, 8, 15);
  const diff = rand(6, 4, 12) * 2;
  const older = younger + diff;
  const sumAge = younger + older;

  // Q4: 等差数列
  const firstTerm = rand(7, 2, 11);
  const commonDiff = rand(8, 3, 8);
  const targetN = rand(9, 10, 16);
  const seqPreview = [0, 1, 2, 3, 4].map(i => firstTerm + commonDiff * i);
  const ans4 = firstTerm + commonDiff * (targetN - 1);

  // Q5: つるかめ算
  const turtles = rand(10, 3, 9);
  const rawCranes = rand(11, 4, 11);
  const cranes = rawCranes === turtles ? rawCranes + 1 : rawCranes;
  const totalHeads = cranes + turtles;
  const totalLegs = cranes * 2 + turtles * 4;

  // Q6: 逆算（還元算）
  const origNum = rand(12, 4, 15);
  const addStep = rand(13, 3, 9);
  const multStep = rand(14, 2, 5);
  const subStep = rand(15, 4, 14);
  const finalVal = (origNum + addStep) * multStep - subStep;

  // Q7: 平面図形（四隅を切り落とした長方形の面積）
  const rectH = rand(16, 7, 12);
  const rectW = rand(17, 11, 18);
  const cutSide = rand(18, 1, 2);
  const ans7 = rectH * rectW - cutSide * cutSide * 4;

  // Q8: 立体図形（立方体の個数）
  const cubeEdge = rand(19, 3, 5);
  const ans8 = cubeEdge * cubeEdge * cubeEdge;

  // Q9: 過不足算
  const kids = rand(20, 6, 14);
  const lessGive = rand(21, 3, 5);
  const moreGive = lessGive + 2;
  const remBooks = rand(22, 6, 14);
  const shortBooks = kids * 2 - remBooks;

  // Q10: 周期算
  const targetPos = rand(23, 32, 68);
  const colors = ["赤", "青", "黄", "白", "緑"];
  const remIdx = (targetPos - 1) % 5;
  const ans10 = colors[remIdx];

  const pool = [
    {
      id: `g5_m1_${seedBase}`,
      category: "計算の工夫",
      categoryName: "算数計算",
      question: `次の計算を工夫してしなさい。\n${multX} × ${numY1} + ${multX} × ${numY2}`,
      options: [`${ans1}`, `${ans1 / 10}`, `${ans1 + 100}`, `${multX * 50}`],
      correctIndex: 0,
      explanation: `分配法則を使います。\n${multX} × (${numY1} + ${numY2}) = ${multX} × 100 = ${ans1} となります。`
    },
    {
      id: `g5_m2_${seedBase}`,
      category: "植木算",
      categoryName: "特殊算",
      question: `長さ ${totalDist}m のまっすぐな道路の片側に、端から端まで ${interval}m おきに木を植えます。木は全部で何本必要ですか。`,
      options: [`${ans2} 本`, `${gaps} 本`, `${ans2 + 1} 本`, `${gaps - 1} 本`],
      correctIndex: 0,
      explanation: `両端に植える植木算です。\n間の数 ＝ ${totalDist} ÷ ${interval} ＝ ${gaps}（個）。\n木の数 ＝ ${gaps} ＋ 1 ＝ ${ans2}（本）となります。`
    },
    {
      id: `g5_m3_${seedBase}`,
      category: "和差算",
      categoryName: "特殊算",
      question: `AさんとBさんの年齢の和は ${sumAge} 歳で、AさんはBさんより ${diff} 歳年上です。Aさんは何歳ですか。`,
      options: [`${older} 歳`, `${younger} 歳`, `${older + 2} 歳`, `${Math.floor(sumAge / 2)} 歳`],
      correctIndex: 0,
      explanation: `和差算の公式を使います。\nAさん（大きい方）＝ (${sumAge} ＋ ${diff}) ÷ 2 ＝ ${older} 歳です。`
    },
    {
      id: `g5_m4_${seedBase}`,
      category: "等差数列",
      categoryName: "思考力",
      question: `${seqPreview.join(', ')}, … のように一定の決まりで数が並んでいます。この数列の第 ${targetN} 番目の数はいくつですか。`,
      options: [`${ans4}`, `${ans4 - commonDiff}`, `${ans4 + commonDiff}`, `${ans4 + 1}`],
      correctIndex: 0,
      explanation: `はじめの数 ${firstTerm}、ふえる数 ${commonDiff} の等差数列です。\n第 ${targetN} 番目の数 ＝ ${firstTerm} ＋ ${commonDiff} × (${targetN} - 1) ＝ ${ans4} です。`
    },
    {
      id: `g5_m5_${seedBase}`,
      category: "つるかめ算",
      categoryName: "特殊算",
      question: `ツルとカメが合わせて ${totalHeads} 匹います。足の数の合計は ${totalLegs} 本です。カメは何匹いますか。`,
      options: [`${turtles} 匹`, `${cranes} 匹`, `${turtles + 2} 匹`, `${turtles + 3} 匹`],
      correctIndex: 0,
      explanation: `すべてツル（足2本）だと仮定すると足は ${totalHeads * 2} 本。\n不足分 ${totalLegs - totalHeads * 2} 本 ÷ (4 - 2) ＝ ${turtles} 匹がカメです。`
    },
    {
      id: `g5_m6_${seedBase}`,
      category: "逆算",
      categoryName: "算数計算",
      question: `ある数に ${addStep} を足し、その数に ${multStep} をかけ、そこから ${subStep} を引くと ${finalVal} になりました。はじめの数はいくつですか。`,
      options: [`${origNum}`, `${origNum + 2}`, `${Math.max(1, origNum - 2)}`, `${origNum + addStep}`],
      correctIndex: 0,
      explanation: `ゴールから逆算します。\n(${finalVal} ＋ ${subStep}) ÷ ${multStep} - ${addStep} ＝ ${origNum} となります。`
    },
    {
      id: `g5_m7_${seedBase}`,
      category: "平面図形",
      categoryName: "図形",
      question: `たて ${rectH}cm、横 ${rectW}cm の長方形の四つの角から、1辺が ${cutSide}cm の正方形を1つずつ切り落としました。残った図形の面積は何 cm² ですか。`,
      options: [`${ans7} cm²`, `${rectH * rectW} cm²`, `${ans7 - 4} cm²`, `${ans7 + 10} cm²`],
      correctIndex: 0,
      explanation: `元の長方形 ${rectH} × ${rectW} ＝ ${rectH * rectW} cm² から、切り落とした正方形4つ分（${cutSide * cutSide * 4} cm²）を引いて ${ans7} cm² です。`
    },
    {
      id: `g5_m8_${seedBase}`,
      category: "立体図形",
      categoryName: "図形",
      question: `1辺が 1cm の小立方体を積み重ねて、1辺が ${cubeEdge}cm の大きな立方体を作ります。小立方体は全部で何個必要ですか。`,
      options: [`${ans8} 個`, `${cubeEdge * cubeEdge} 個`, `${cubeEdge * 6} 個`, `${ans8 + cubeEdge} 個`],
      correctIndex: 0,
      explanation: `立方体の体積（小立方体の個数）＝ ${cubeEdge} × ${cubeEdge} × ${cubeEdge} ＝ ${ans8} 個です。`
    },
    {
      id: `g5_m9_${seedBase}`,
      category: "過不足算",
      categoryName: "特殊算",
      question: `子どもにノートを配ります。1人に ${lessGive} 冊ずつ配ると ${remBooks} 冊余り、1人に ${moreGive} 冊ずつ配ると ${shortBooks} 冊足りなくなります。子どもは何人いますか。`,
      options: [`${kids} 人`, `${kids + 2} 人`, `${Math.max(2, kids - 2)} 人`, `${remBooks + shortBooks} 人`],
      correctIndex: 0,
      explanation: `過不足算の公式：(余り ＋ 不足) ÷ 1人あたりの差 ＝ (${remBooks} ＋ ${shortBooks}) ÷ (${moreGive} - ${lessGive}) ＝ ${kids} 人です。`
    },
    {
      id: `g5_m10_${seedBase}`,
      category: "周期算",
      categoryName: "思考力",
      question: `「赤、青、黄、白、緑」の 5 種類の色紙がこの順番でくり返し並んでいます。左から数えて ${targetPos} 番目の色紙は何色ですか。`,
      options: [
        ans10,
        colors[(remIdx + 1) % 5],
        colors[(remIdx + 2) % 5],
        colors[(remIdx + 3) % 5]
      ],
      correctIndex: 0,
      explanation: `5色の周期で繰り返します。${targetPos} ÷ 5 ＝ ${Math.floor(targetPos / 5)} 余り ${targetPos % 5} なので、「${ans10}」になります。`
    }
  ];

  return shuffleArray(pool).map(randomizeQuestionOptions);
};

// ==========================================
// Expanded Japanese Question Banks (G2 & G5)
// ==========================================

const JAPANESE_QUESTIONS_G2_POOL = [
  {
    id: "j2_1",
    category: "漢字の読み",
    categoryName: "国語漢字",
    question: "「青い 空」の「青い」の かんじの よみかたは どれですか。",
    options: ["あおい", "しろい", "くろい", "あかい"],
    correctIndex: 0,
    explanation: "「青い」は「あおい」と よみます。"
  },
  {
    id: "j2_2",
    category: "反対の言葉",
    categoryName: "語彙文法",
    question: "「広い（ひろい）」の はんたいの いみの 言葉は どれですか。",
    options: ["狭い（せまい）", "高い（たかい）", "長い（ながい）", "大きい（おおきい）"],
    correctIndex: 0,
    explanation: "「広い」の はんたいは「狭い（せまい）」です。"
  },
  {
    id: "j2_3",
    category: "ことばのきまり",
    categoryName: "語彙文法",
    question: "（　）に はいる つなぎの 言葉は どれですか。\n「あさ起きて、顔を あらった。（　）あさごはんを たべた。」",
    options: ["それから", "しかし", "だから", "なぜなら"],
    correctIndex: 0,
    explanation: "じゅんじょよく つづける ときは「それから」を つかいます。"
  },
  {
    id: "j2_4",
    category: "漢字のかき",
    categoryName: "国語漢字",
    question: "「がっこう」の「こう」の かんじは どれですか。",
    options: ["校", "交", "高", "光"],
    correctIndex: 0,
    explanation: "「学校」の「校（こう）」が 正しい かんじです。"
  },
  {
    id: "j2_5",
    category: "丁寧な言葉",
    categoryName: "語彙文法",
    question: "「食べる」を ていねいな 言葉（です・ます）に すると どれになりますか。",
    options: ["食べます", "食べた", "食べろ", "食べたい"],
    correctIndex: 0,
    explanation: "「食べる」の ていねいな 言いかたは「食べます」です。"
  },
  {
    id: "j2_6",
    category: "主語と述語",
    categoryName: "語彙文法",
    question: "つぎの ぶんの「だれが」にあたる ことばは どれですか。\n「かわいい こねこが にわで 元気に あそんでいる。」",
    options: ["こねこが", "かわいい", "にわで", "あそんでいる"],
    correctIndex: 0,
    explanation: "「だれが（なにが）」にあたるのは「こねこが」です。"
  },
  {
    id: "j2_7",
    category: "擬音語・擬態語",
    categoryName: "語彙文法",
    question: "雨が はげしく ふる ようすを あらわす 言葉は どれですか。",
    options: ["ザーザー", "しとしと", "ぽつぽつ", "ニコニコ"],
    correctIndex: 0,
    explanation: "つよい雨が ふる ようすは「ザーザー」です。"
  },
  {
    id: "j2_8",
    category: "指示語",
    categoryName: "読解力",
    question: "「これ」が さしている ものは どれですか。\n「けんた君は 赤い かさを 忘れた。それに 気づいた ぼくは、これを とどけた。」",
    options: ["赤いかさ", "けんた君", "ぼく", "がっこう"],
    correctIndex: 0,
    explanation: "「これ」は 直前の「赤いかさ」を さしています。"
  },
  {
    id: "j2_9",
    category: "ことわざ",
    categoryName: "語彙文法",
    question: "「早起きは 三文の ◯」の ◯に はいる 言葉は どれですか。",
    options: ["得（とく）", "損（そん）", "円（えん）", "本（ほん）"],
    correctIndex: 0,
    explanation: "「早起きは 三文の 得（とく）」ということわざです。"
  },
  {
    id: "j2_10",
    category: "気持ちのりかい",
    categoryName: "読解力",
    question: "つぎの ぶんを よんで、下せんぶの ときの 気持ちとして 正しいものは どれですか。\n「かけっこで 1いになれた とき、ぼくは おもわず とびあがって よろこんだ。」",
    options: ["とても うれしい 気持ち", "くやしくて かなしい 気持ち", "びくびく している 気持ち", "ねむい 気持ち"],
    correctIndex: 0,
    explanation: "「1いになれて おもわず とびあがった」ことから、とても うれしい 気持ちが わかります。"
  },
  {
    id: "j2_11",
    category: "漢字の読み",
    categoryName: "国語漢字",
    question: "「毎日 元気に 走る」の「毎日」の よみかたは どれですか。",
    options: ["まいにち", "まいとし", "まいつき", "まいしゅう"],
    correctIndex: 0,
    explanation: "「毎日」は「まいにち」と よみます。"
  },
  {
    id: "j2_12",
    category: "反対の言葉",
    categoryName: "語彙文法",
    question: "「強い（つよい）」の はんたいの いみの 言葉は どれですか。",
    options: ["弱い（よわい）", "重い（おもい）", "早い（はやい）", "暗い（くらい）"],
    correctIndex: 0,
    explanation: "「強い」の はんたいは「弱い（よわい）」です。"
  },
  {
    id: "j2_13",
    category: "ものの数え方",
    categoryName: "語彙文法",
    question: "えんぴつを 数える ときに つかう 言葉は どれですか。",
    options: ["1本（いっぽん）", "1まい（いちまい）", "1さつ（いっさつ）", "1ひき（いっぴき）"],
    correctIndex: 0,
    explanation: "えんぴつのような ほそ長い ものは「本（ほん）」で 数えます。"
  },
  {
    id: "j2_14",
    category: "ことばのきまり",
    categoryName: "語彙文法",
    question: "（　）に はいる つなぎの 言葉は どれですか。\n「雨が ふりそうだ。（　）、かさを もって いこう。」",
    options: ["だから", "しかし", "ところが", "たとえば"],
    correctIndex: 0,
    explanation: "りゆうを うけて つづける ときは「だから」を つかいます。"
  },
  {
    id: "j2_15",
    category: "漢字のかき",
    categoryName: "国語漢字",
    question: "「おともだち」の「とも」の かんじは どれですか。",
    options: ["友", "右", "左", "有"],
    correctIndex: 0,
    explanation: "「友達」の「友（とも）」が 正しい かんじです。"
  },
  {
    id: "j2_16",
    category: "慣用句",
    categoryName: "語彙文法",
    question: "とても おどろいた ときの ようすを あらわす 言葉「目を ◯くする」の ◯に はいるのは どれですか。",
    options: ["丸", "三角", "四角", "細"],
    correctIndex: 0,
    explanation: "おどろいて 目を 大きく ひらく ようすを「目を 丸くする」と いいます。"
  }
];

const JAPANESE_QUESTIONS_G5_POOL = [
  {
    id: "j_1",
    category: "漢字の読み",
    categoryName: "国語漢字",
    question: "次の文の「知識」の正しい読み方はどれですか。\n「本を読んで新しい知識を得る。」",
    options: ["ちしき", "ちしん", "ちせい", "ちりょく"],
    correctIndex: 0,
    explanation: "「知識」は「ちしき」と読みます。"
  },
  {
    id: "j_2",
    category: "対義語",
    categoryName: "語彙文法",
    question: "「複雑（ふくざつ）」の対義語（反対の意味の言葉）として、最も適切なものはどれですか。",
    options: ["単純", "簡単", "容易", "明快"],
    correctIndex: 0,
    explanation: "「複雑」の対義語は「単純」です。"
  },
  {
    id: "j_3",
    category: "慣用句",
    categoryName: "語彙文法",
    question: "非常に驚いてあきれる様子を表す慣用句「開いた◯がふさがらない」の◯に入る言葉はどれですか。",
    options: ["口", "目", "耳", "手"],
    correctIndex: 0,
    explanation: "正解は「口」で、「開いた口がふさがらない」となります。"
  },
  {
    id: "j_4",
    category: "部首",
    categoryName: "国語漢字",
    question: "漢字の「泳」「海」「池」に共通する部首（へん）の名前は何ですか。",
    options: ["さんずい", "きへん", "にんべん", "うかんむり"],
    correctIndex: 0,
    explanation: "水に関係する漢字に共通する部首は「さんずい（氵）」です。"
  },
  {
    id: "j_5",
    category: "主語と述語",
    categoryName: "語彙文法",
    question: "次の文の「主語」にあたる部分はどれですか。\n「昨日、大きな黒い犬が公園で元気に走っていた。」",
    options: ["大きな黒い犬が", "昨日", "公園で", "元気に走っていた"],
    correctIndex: 0,
    explanation: "「何が（誰が）」にあたる部分は「大きな黒い犬が」です。"
  },
  {
    id: "j_6",
    category: "接続詞",
    categoryName: "語彙文法",
    question: "文中の（　）に入る最も適切な接続詞はどれですか。\n「今日は朝から強い雨が降っていた。（　）、サッカーの試合は予定通り行われた。」",
    options: ["しかし", "だから", "つまり", "また"],
    correctIndex: 0,
    explanation: "前後の文が逆の内容（雨だが実施した）をつなぐため「しかし（逆接）」が入ります。"
  },
  {
    id: "j_7",
    category: "指示語",
    categoryName: "読解力",
    question: "次の文の指示語「これ」が指している内容として最も適切なものはどれですか。\n「たけし君は毎日コツコツと漢字の練習を続けた。これがテストでの満点につながった。」",
    options: ["毎日コツコツと漢字の練習を続けたこと", "テストで満点を取ったこと", "漢字の練習問題集のこと", "たけし君のこと"],
    correctIndex: 0,
    explanation: "指示語「これ」は直前の動作「毎日コツコツと漢字の練習を続けたこと」を指しています。"
  },
  {
    id: "j_8",
    category: "ことわざ",
    categoryName: "語彙文法",
    question: "「失敗は成功の母（はは）」ということわざの意味として最も適切なものはどれですか。",
    options: [
      "失敗しても反省して原因を改善すれば次の成功につながるということ",
      "お母さんは何でも成功させてくれるということ",
      "一度失敗したら二度と成功できないということ",
      "失敗しないように何もしないのが一番であるということ"
    ],
    correctIndex: 0,
    explanation: "失敗の原因を振り返って工夫することが成功の源になるという意味です。"
  },
  {
    id: "j_9",
    category: "四字熟語",
    categoryName: "語彙文法",
    question: "「一生懸命（いっしょうけんめい）」の語源であり、命がけで物事に取り組む様子を表す元の言葉（四字熟語）はどれですか。",
    options: ["一所懸命", "一期一会", "自業自得", "試行錯誤"],
    correctIndex: 0,
    explanation: "「一所懸命（いっしょけんめい）」は武士が1つの領地を命がけで守ったことに由来します。"
  },
  {
    id: "j_10",
    category: "心情理解",
    categoryName: "読解力",
    question: "次の文章を読んで、下線部のときの「僕」の心情として最も適切なものはどれですか。\n「ライバルの健太が自分より高い点数を取ったのを知ったとき、僕は何も言わずに思わず拳を強く握りしめた。」",
    options: [
      "悔しくて次は絶対に負けたくないという強い気持ち",
      "健太の努力を素直に称えて喜んでいる気持ち",
      "テストが終わって心から安心している気持ち",
      "悲しくて何も考えられない気持ち"
    ],
    correctIndex: 0,
    explanation: "「何も言わずに思わず拳を強く握りしめた」描写から、悔しさと次への強い闘志が読み取れます。"
  },
  {
    id: "j_11",
    category: "漢字の読み",
    categoryName: "国語漢字",
    question: "「状況を正確に把握する」の「把握」の正しい読み方はどれですか。",
    options: ["はあく", "はやく", "ばあく", "はこく"],
    correctIndex: 0,
    explanation: "「把握」は「はあく」と読み、しっかりつかむという意味です。"
  },
  {
    id: "j_12",
    category: "対義語",
    categoryName: "語彙文法",
    question: "「具体的（ぐたいてき）」の対義語として最も適切なものはどれですか。",
    options: ["抽象的", "一般的", "客観的", "消極的"],
    correctIndex: 0,
    explanation: "「具体的」の対義語は「抽象的（ちゅうしょうてき）」です。"
  },
  {
    id: "j_13",
    category: "類義語",
    categoryName: "語彙文法",
    question: "「推測（すいそく）」と最も意味が近い言葉（類義語）はどれですか。",
    options: ["推察", "観測", "計測", "予測"],
    correctIndex: 0,
    explanation: "ある根拠をもとに推し量ることを「推測」「推察」といいます。"
  },
  {
    id: "j_14",
    category: "四字熟語",
    categoryName: "語彙文法",
    question: "「十人◯色（じゅうにんといろ）」の◯に入る漢字はどれですか。人それぞれ考えや好みが違うという意味です。",
    options: ["十", "百", "千", "万"],
    correctIndex: 0,
    explanation: "正解は「十人十色（じゅうにんといろ）」です。"
  },
  {
    id: "j_15",
    category: "接続詞",
    categoryName: "語彙文法",
    question: "文中の（　）に入る最も適切な接続詞はどれですか。\n「地球温暖化が進んでいる。（　）、北極の氷が年々溶け続けているのだ。」",
    options: ["つまり", "しかし", "それでも", "ところが"],
    correctIndex: 0,
    explanation: "前の文の内容を言い換えてまとめる「つまり」が最も適切です。"
  },
  {
    id: "j_16",
    category: "要旨把握",
    categoryName: "読解力",
    question: "次の文章で、筆者が最も伝えたいこと（要旨）はどれですか。\n「失敗を恐れて何もしなければ傷つくことはない。しかし、それでは成長も得られない。小さな挑戦を積み重ねることこそが未来を開く鍵なのだ。」",
    options: [
      "失敗を恐れず小さな挑戦を続けることが成長につながる",
      "傷つかないように慎重に行動することが最も大切である",
      "未来を開くためには一度も失敗しない計画が必要である",
      "大きな成功を収める人は最初から失敗をしない"
    ],
    correctIndex: 0,
    explanation: "筆者は「小さな挑戦を積み重ねることこそが未来を開く鍵」と結論づけています。"
  }
];

const UYGHUR_QUESTIONS_POOL = [
  {
    id: "u_1",
    category: "単語・意味",
    categoryName: "ウイグル語",
    question: "ウイグル語の「ئالما (Alma)」の日本語の意味はどれですか。",
    options: ["りんご", "みかん", "ぶどう", "バナナ"],
    correctIndex: 0,
    explanation: "「ئالما (Alma)」はウイグル語で「りんご」を意味します。"
  },
  {
    id: "u_2",
    category: "日常の挨拶",
    categoryName: "ウイグル語",
    question: "ウイグル語の丁寧な挨拶「こんにちは」にあたる言葉はどれですか。",
    options: ["ئەسسالامۇ ئەلەيكۇم (Assalamu alaykum)", "خەيرىخوش (Khayrikhosh)", "رەھمەت (Rahmat)", "كەچۈرۈڭ (Kechuerung)"],
    correctIndex: 0,
    explanation: "「ئەسسالامۇ ئەلەيكۇم (Assalamu alaykum)」は出会った時の最も丁寧で一般的な挨拶です。"
  },
  {
    id: "u_3",
    category: "数・数字",
    categoryName: "ウイグル語",
    question: "ウイグル語で数字の「5」を表す言葉（Besh）はどれですか。",
    options: ["بەش (Besh)", "بىر (Bir)", "ئۈچ (Oech)", "ئون (On)"],
    correctIndex: 0,
    explanation: "「بەش (Besh)」は数字の「5」を表します。"
  },
  {
    id: "u_4",
    category: "家族・人名",
    categoryName: "ウイグル語",
    question: "ウイグル語で「お母さん」を表す言葉（Ana）はどれですか。",
    options: ["ئانا (Ana)", "ئاتا (Ata)", "ئاكا (Aka)", "سىڭىل (Singil)"],
    correctIndex: 0,
    explanation: "「ئانا (Ana)」は「お母さん」を意味します。"
  },
  {
    id: "u_5",
    category: "動物・自然",
    categoryName: "ウイグル語",
    question: "ウイグル語の「ئات (At)」の日本語の意味はどれですか。",
    options: ["馬", "犬", "猫", "鳥"],
    correctIndex: 0,
    explanation: "「ئات (At)」は「馬」を意味します。"
  },
  {
    id: "u_6",
    category: "感謝・マナー",
    categoryName: "ウイグル語",
    question: "ウイグル語で「ありがとう」を意味する言葉（Rahmat）はどれですか。",
    options: ["رەھمەت (Rahmat)", "ياخشىمۇسىز (Yakhshimusiz)", "مۇبارەك (Mubarak)", "قارشى ئالىمىز (Qarshi alimiz)"],
    correctIndex: 0,
    explanation: "「رەھمەت (Rahmat)」は「感謝・ありがとう」を表す言葉です。"
  },
  {
    id: "u_7",
    category: "色・形容詞",
    categoryName: "ウイグル語",
    question: "ウイグル語で「青・空色」を表す言葉（Koek）はどれですか。",
    options: ["كۆك (Koek)", "قىزىل (Qizil)", "سېرىق (Sering)", "قارا (Qara)"],
    correctIndex: 0,
    explanation: "「كۆك (Koek)」は「青・空色」を意味します。"
  },
  {
    id: "u_8",
    category: "文・自己紹介",
    categoryName: "ウイグル語",
    question: "ウイグル語の文「مەن ئوقۇغۇچى (Men oqughuchi)」の意味はどれですか。",
    options: ["私は学生（生徒）です", "私は先生です", "私は医者です", "私は友達です"],
    correctIndex: 0,
    explanation: "「مەن (私) ئوقۇغۇچى (学生/生徒)」で「私は学生です」という意味になります。"
  },
  {
    id: "u_9",
    category: "学校・学習",
    categoryName: "ウイグル語",
    question: "ウイグル語で「本」を表す言葉（Kitab）はどれですか。",
    options: ["كىتاب (Kitab)", "قەلەم (Qelem)", "مەكتەپ (Meptep)", "ئۈستەل (Uestel)"],
    correctIndex: 0,
    explanation: "「كىتاب (Kitab)」は「本」を意味します。"
  },
  {
    id: "u_10",
    category: "挨拶・フレーズ",
    categoryName: "ウイグル語",
    question: "「خەيرلىك كۈن (Khayrlik kuen)」の日本語の意味として正しいものはどれですか。",
    options: ["良い一日を（こんにちは）", "おやすみなさい", "さようなら", "いただきます"],
    correctIndex: 0,
    explanation: "「خەيرلىك كۈن (Khayrlik kuen)」は「良い一日を / 日中の挨拶」を意味します。"
  },
  {
    id: "u_11",
    category: "家族・人名",
    categoryName: "ウイグル語",
    question: "ウイグル語で「お父さん」を表す言葉（Ata）はどれですか。",
    options: ["ئاتا (Ata)", "ئانا (Ana)", "ئاچا (Acha)", "ئىنى (Ini)"],
    correctIndex: 0,
    explanation: "「ئاتا (Ata)」は「お父さん」を意味します。"
  },
  {
    id: "u_12",
    category: "食べ物・飲み物",
    categoryName: "ウイグル語",
    question: "ウイグル語で「水」を表す言葉（Su）はどれですか。",
    options: ["سۇ (Su)", "چاي (Chay)", "نان (Nan)", "سۈت (Suet)"],
    correctIndex: 0,
    explanation: "「سۇ (Su)」は「水」を意味します。"
  }
];

// Full Dynamic Generator combining freshly generated Math + shuffled Japanese pool
const generateDailyDynamicQuestions = (grade, attemptOffset = 0) => {
  const today = new Date();
  const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate() + attemptOffset * 37;

  if (grade === 'grade2') {
    const math10 = generateDynamicMathG2(dateSeed);
    const jp10 = shuffleArray(JAPANESE_QUESTIONS_G2_POOL).slice(0, 10).map(randomizeQuestionOptions);
    return [...math10, ...jp10];
  } else {
    const math10 = generateDynamicMathG5(dateSeed);
    const jp10 = shuffleArray(JAPANESE_QUESTIONS_G5_POOL).slice(0, 10).map(randomizeQuestionOptions);
    return [...math10, ...jp10];
  }
};

// AI Question Generator with Optional User-Configured Gemini API Key & Robust Dynamic Fallback
const fetchAIDailyQuestions = async (subject = 'combined', grade = 'grade2', attemptOffset = 0) => {
  const gradeLabel = grade === 'grade2' ? '小学2年生' : '小学5年生';
  let apiKey = '';
  try {
    apiKey = localStorage.getItem('learndaily_gemini_api_key') || '';
  } catch {
    apiKey = '';
  }

  if (apiKey) {
    const systemPrompt = `あなたは四谷大塚の入塾テスト・中学受験の算数と国語の専門講師です。
${gradeLabel}対象の四谷大塚入塾テストレベルの4択問題を生成してください。
毎回異なる数値・題材を使い、レスポンスは必ず指定されたJSON配列のみで返してください。`;

    const userQuery = `四谷大塚の入塾テスト対策として、${gradeLabel}向けの算数10問と国語10問（合計20問）の完全新作テスト問題を作成してください（本日の日付: ${getTodayDateString()}、回数シード: ${attemptOffset}）。`;
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
            return parsed.map(randomizeQuestionOptions);
          }
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, using full dynamic generator:", err);
    }
  }

  return generateDailyDynamicQuestions(grade, attemptOffset);
};

// Helper to render subject display title
const getSubjectLabel = (subject) => {
  switch (subject) {
    case 'math': return '算数テスト';
    case 'japanese': return '国語テスト';
    case 'uyghur': return 'ウイグル語テスト';
    case 'daily': return '本日の日替わり模試';
    case 'weakness': return '🔥 弱点克服復習';
    default: return '算国総合模試';
  }
};

export default function App() {
  // ==========================================
  // Strict Authentication States (No Guest Mode)
  // ==========================================
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Email/Password Auth Form States
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [childNameInput, setChildNameInput] = useState('');

  // Inline Display Name Editor Modal State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameDraft, setEditNameDraft] = useState('');

  // Optional Gemini API Key in Admin Panel
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState(() => {
    try {
      return localStorage.getItem('learndaily_gemini_api_key') || '';
    } catch {
      return '';
    }
  });
  const [apiKeySavedToast, setApiKeySavedToast] = useState(false);

  // Check if current logged-in user is the Parent Admin
  const isParentAdmin = useMemo(() => {
    return Boolean(
      user &&
      !user.isAnonymous &&
      user.email &&
      user.email.toLowerCase() === ADMIN_EMAIL
    );
  }, [user]);

  // Display name of current logged-in user
  const currentUserDisplayName = useMemo(() => {
    if (!user) return '';
    if (user.displayName && user.displayName.trim()) return user.displayName.trim();
    if (user.email) return user.email.split('@')[0];
    return '学習メンバー';
  }, [user]);

  // Selected Child Filter & Historical Time Filter in Admin/History Mode
  const [adminSelectedChildName, setAdminSelectedChildName] = useState('ALL');
  const [historyPeriodFilter, setHistoryPeriodFilter] = useState('ALL');
  const [customSearchDate, setCustomSearchDate] = useState('');

  // Navigation & Grade States
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'quiz', 'results', 'history', 'admin'
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedGrade, setSelectedGrade] = useState('grade2');
  const [sessionAttemptCount, setSessionAttemptCount] = useState(0);
  
  // Exam Countdown Timer Mode States
  const [isTimerEnabled, setIsTimerEnabled] = useState(true);
  const [timeLeftSec, setTimeLeftSec] = useState(900);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [wasAutoSubmittedByTimeout, setWasAutoSubmittedByTimeout] = useState(false);
  const [timedOutTrigger, setTimedOutTrigger] = useState(false);

  // Quiz Runner States
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  // Ref for safe timer auto-submit
  const latestQuizStateRef = useRef({ userAnswers: [], currentIdx: 0, selectedOption: null });
  useEffect(() => {
    latestQuizStateRef.current = { userAnswers, currentIdx, selectedOption };
  }, [userAnswers, currentIdx, selectedOption]);

  // Unified Family History Docs
  const [historyDocs, setHistoryDocs] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Daily AI Mode States
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const todayStr = getTodayDateString();

  // Auth Observer: Enforces real login (automatically signs out any leftover anonymous/guest session)
  useEffect(() => {
    getRedirectResult(auth).catch((err) => {
      console.warn("Redirect login notice:", err);
      if (err?.code === 'auth/unauthorized-domain') {
        setLoginError("現在のWebドメインがFirebaseで未承認です。Firebase Consoleの「承認済みドメイン」に現在のURLを追加してください。");
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.isAnonymous) {
        await signOut(auth);
        setUser(null);
        setAuthLoading(false);
        return;
      }
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Redirect away from admin tab if user is not ADMIN_EMAIL
  useEffect(() => {
    if (activeTab === 'admin' && !isParentAdmin) {
      setActiveTab('home');
    }
  }, [activeTab, isParentAdmin]);

  // Sync Shared Family Results from Firestore (only when logged in)
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setHistoryDocs([]);
      return;
    }

    try {
      const familyResultsRef = collection(db, 'artifacts', appId, 'family_results');
      const unsubscribe = onSnapshot(
        familyResultsRef,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setHistoryDocs(items);
          try {
            localStorage.setItem('learn_daily_family_history', JSON.stringify(items));
          } catch {}
        },
        (error) => {
          console.warn("Firestore family results listener error:", error);
          try {
            const saved = localStorage.getItem('learn_daily_family_history');
            if (saved) setHistoryDocs(JSON.parse(saved));
          } catch {}
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore subscription error:", e);
    }
  }, [user]);

  // Filter history for current student (non-admin sees their own records, admin sees all)
  const myHistoryDocs = useMemo(() => {
    if (!user) return [];
    if (isParentAdmin) return historyDocs;
    return historyDocs.filter(
      d => d.userUid === user.uid || (user.email && d.userEmail === user.email)
    );
  }, [historyDocs, user, isParentAdmin]);

  // Extract Wrong Questions for Weakness Conquest Mode
  const wrongQuestionsPool = useMemo(() => {
    if (!myHistoryDocs || myHistoryDocs.length === 0) return [];

    const seenQuestions = new Set();
    const collected = [];

    myHistoryDocs.forEach((docItem) => {
      if (!Array.isArray(docItem.answeredBreakdown)) return;
      docItem.answeredBreakdown.forEach((entry) => {
        if (!entry.isCorrect && entry.question && Array.isArray(entry.options) && !seenQuestions.has(entry.question)) {
          seenQuestions.add(entry.question);
          collected.push({
            id: entry.questionId || `weak_${collected.length}`,
            category: `${entry.category || '復習'}（${docItem.gradeLabel || '過去問'}）`,
            categoryName: entry.category || "思考力",
            question: entry.question,
            options: entry.options,
            correctIndex: entry.correctIndex,
            explanation: entry.explanation || "解説を確認して解き直しましょう。"
          });
        }
      });
    });

    return collected;
  }, [myHistoryDocs]);

  // Compute Daily Streak for Current User
  const streakInfo = useMemo(() => {
    if (!myHistoryDocs || myHistoryDocs.length === 0) return { streak: 0, testedToday: false };

    const dates = Array.from(new Set(
      myHistoryDocs.map(item => {
        if (item.dateIso) return item.dateIso;
        if (!item.timestamp) return null;
        const d = new Date(item.timestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }).filter(Boolean)
    )).sort().reverse();

    const testedToday = dates.includes(todayStr);
    
    let streak = 0;
    let checkDate = new Date();
    
    if (!testedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (dates.includes(dStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { streak, testedToday };
  }, [myHistoryDocs, todayStr]);

  // Quiz Timer Effect (Pure state tick without nested state updates)
  useEffect(() => {
    if (activeTab !== 'quiz' || currentQuestions.length === 0) return;

    const intervalId = setInterval(() => {
      setElapsedSec(prev => prev + 1);

      if (isTimerEnabled) {
        setTimeLeftSec(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setTimedOutTrigger(true);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeTab, isTimerEnabled, currentQuestions.length]);

  // Handle Timeout Auto-Submit safely outside state updater
  useEffect(() => {
    if (!timedOutTrigger || activeTab !== 'quiz') return;
    setTimedOutTrigger(false);
    const { userAnswers: curAns, currentIdx: curIdx, selectedOption: curOpt } = latestQuizStateRef.current;
    const finalized = [...curAns];
    if (curOpt !== null) {
      finalized[curIdx] = curOpt;
    }
    finishQuiz(finalized, true);
  }, [timedOutTrigger, activeTab]);

  // ==========================================
  // Authentication Handlers (Google & Email/Password)
  // ==========================================
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError('');

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Sign-In error:", err);
      if (err.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          console.error("Redirect Sign-In error:", redirectErr);
        }
      }
      if (err.code === 'auth/unauthorized-domain') {
        setLoginError(
          "現在のWebドメインがFirebaseで未承認です。Firebase Console の Authentication → 設定 → 承認済みドメイン に現在のURLを追加してください。"
        );
      } else if (err.code === 'auth/popup-closed-by-user') {
        setLoginError("ログイン画面が閉じられました。もう一度ボタンを押してログインしてください。");
      } else {
        setLoginError(`Googleログインに失敗しました（${err.code || 'エラー'}）。`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailAuthSubmit = async (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setLoginError("メールアドレスとパスワードを入力してください。");
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      if (authMode === 'register') {
        if (!childNameInput.trim()) {
          setLoginError("お子様のお名前（表示名）を入力してください。");
          setIsLoggingIn(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        await updateProfile(cred.user, { displayName: childNameInput.trim() });
        setUser({ ...cred.user, displayName: childNameInput.trim() });
      } else {
        await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      }
    } catch (err) {
      console.error("Email auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setLoginError("Firebase側でメール/パスワード認証がまだ有効化されていません。「Googleアカウントでログイン」をご利用ください。");
      } else if (err.code === 'auth/email-already-in-use') {
        setLoginError("このメールアドレスは既に登録されています。「ログイン」タブからログインしてください。");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setLoginError("メールアドレスまたはパスワードが正しくありません。");
      } else if (err.code === 'auth/weak-password') {
        setLoginError("パスワードは6文字以上で設定してください。");
      } else {
        setLoginError(`認証エラーが発生しました（${err.code}）。`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const openEditNameModal = () => {
    setEditNameDraft(currentUserDisplayName);
    setIsEditingName(true);
  };

  const handleSaveDisplayName = async (e) => {
    e.preventDefault();
    if (!user || !editNameDraft.trim()) return;
    try {
      await updateProfile(user, { displayName: editNameDraft.trim() });
      setUser({ ...user, displayName: editNameDraft.trim() });
    } catch (err) {
      console.error("Failed to update profile name:", err);
    } finally {
      setIsEditingName(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('home');
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  const handleSaveGeminiApiKey = () => {
    try {
      localStorage.setItem('learndaily_gemini_api_key', geminiApiKeyInput.trim());
      setApiKeySavedToast(true);
      setTimeout(() => setApiKeySavedToast(false), 3000);
    } catch (e) {
      console.warn("Could not save API key:", e);
    }
  };

  // ==========================================
  // Quiz Start & Execution Handlers
  // ==========================================
  const initializeQuizSession = (questions, subjectKey) => {
    setSelectedSubject(subjectKey);
    setCurrentQuestions(questions);
    setCurrentIdx(0);
    setUserAnswers(new Array(questions.length).fill(null));
    setSelectedOption(null);
    setQuizStartTime(Date.now());
    setElapsedSec(0);
    setTimeLeftSec(questions.length * 90);
    setWasAutoSubmittedByTimeout(false);
    setTimedOutTrigger(false);
    setActiveTab('quiz');
  };

  const startQuiz = (subject) => {
    if (!user) return;
    const nextAttempt = sessionAttemptCount + 1;
    setSessionAttemptCount(nextAttempt);

    const today = new Date();
    const seedBase = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate() + nextAttempt * 41;

    let questions = [];
    if (selectedGrade === 'grade2') {
      if (subject === 'math') {
        questions = generateDynamicMathG2(seedBase);
      } else if (subject === 'japanese') {
        questions = shuffleArray(JAPANESE_QUESTIONS_G2_POOL).slice(0, 10).map(randomizeQuestionOptions);
      } else if (subject === 'uyghur') {
        questions = shuffleArray(UYGHUR_QUESTIONS_POOL).slice(0, 10).map(randomizeQuestionOptions);
      } else {
        questions = generateDailyDynamicQuestions('grade2', nextAttempt);
      }
    } else {
      if (subject === 'math') {
        questions = generateDynamicMathG5(seedBase);
      } else if (subject === 'japanese') {
        questions = shuffleArray(JAPANESE_QUESTIONS_G5_POOL).slice(0, 10).map(randomizeQuestionOptions);
      } else if (subject === 'uyghur') {
        questions = shuffleArray(UYGHUR_QUESTIONS_POOL).slice(0, 10).map(randomizeQuestionOptions);
      } else {
        questions = generateDailyDynamicQuestions('grade5', nextAttempt);
      }
    }

    initializeQuizSession(questions, subject);
  };

  const startDailyTest = async () => {
    if (!user) return;
    const nextAttempt = sessionAttemptCount + 1;
    setSessionAttemptCount(nextAttempt);

    setIsGeneratingAI(true);
    const questions = await fetchAIDailyQuestions('combined', selectedGrade, nextAttempt);
    setIsGeneratingAI(false);
    initializeQuizSession(questions, 'daily');
  };

  const startWeaknessQuiz = () => {
    if (!user || wrongQuestionsPool.length === 0) return;
    const selectedWeakQuestions = shuffleArray(wrongQuestionsPool).slice(0, 10).map(randomizeQuestionOptions);
    initializeQuizSession(selectedWeakQuestions, 'weakness');
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIdx] = selectedOption;
    setUserAnswers(updatedAnswers);

    if (currentIdx + 1 < currentQuestions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(updatedAnswers[currentIdx + 1]);
    } else {
      finishQuiz(updatedAnswers, false);
    }
  };

  const finishQuiz = async (finalAnswers, isTimeout = false) => {
    setWasAutoSubmittedByTimeout(isTimeout);
    const durationSec = Math.round((Date.now() - (quizStartTime || Date.now())) / 1000);
    const now = new Date();
    const dateIsoStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let correctCount = 0;
    const categoryStats = {};

    const answeredBreakdown = currentQuestions.map((q, idx) => {
      const uAns = finalAnswers[idx];
      const isCorrect = uAns !== null && uAns === q.correctIndex;
      if (isCorrect) correctCount++;

      const cat = q.categoryName || "思考力";
      if (!categoryStats[cat]) categoryStats[cat] = { correct: 0, total: 0 };
      categoryStats[cat].total += 1;
      if (isCorrect) categoryStats[cat].correct += 1;

      return {
        questionId: q.id,
        question: q.question,
        options: q.options,
        userAnswerIndex: uAns,
        correctIndex: q.correctIndex,
        isCorrect: isCorrect,
        category: cat,
        explanation: q.explanation
      };
    });

    const totalQ = currentQuestions.length;
    const percentage = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

    const recordData = {
      timestamp: Date.now(),
      dateIso: dateIsoStr,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      dateStr: now.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      subject: selectedSubject,
      grade: selectedGrade,
      gradeLabel: selectedGrade === 'grade2' ? '小学2年生' : '小学5年生',
      score: correctCount,
      totalQuestions: totalQ,
      percentage: percentage,
      durationSec: durationSec,
      wasTimeout: isTimeout,
      categoryStats: categoryStats,
      answeredBreakdown: answeredBreakdown,
      userUid: user?.uid || '',
      userDisplayName: currentUserDisplayName,
      userEmail: user?.email || ''
    };

    try {
      const familyResultsRef = collection(db, 'artifacts', appId, 'family_results');
      await addDoc(familyResultsRef, recordData);
    } catch (e) {
      console.warn("Could not save to Firestore, falling back to local storage:", e);
    }

    try {
      const newHistory = [recordData, ...historyDocs];
      setHistoryDocs(newHistory);
      localStorage.setItem('learn_daily_family_history', JSON.stringify(newHistory));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    setSelectedHistoryItem(recordData);
    setActiveTab('results');
  };

  // ==========================================
  // Analytics & Filtering Data
  // ==========================================
  const filteredHistoryDocs = useMemo(() => {
    let list = activeTab === 'admin' ? [...historyDocs] : [...myHistoryDocs];

    if (activeTab === 'admin' && adminSelectedChildName !== 'ALL') {
      list = list.filter(item => item.userDisplayName === adminSelectedChildName);
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (historyPeriodFilter === 'THIS_MONTH') {
      list = list.filter(item => item.year === currentYear && item.month === currentMonth);
    } else if (historyPeriodFilter === 'LAST_MONTH') {
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      list = list.filter(item => item.year === lastMonthYear && item.month === lastMonth);
    } else if (historyPeriodFilter === 'LAST_30') {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      list = list.filter(item => (item.timestamp || 0) >= thirtyDaysAgo);
    } else if (historyPeriodFilter === 'CUSTOM_DATE' && customSearchDate) {
      list = list.filter(item => item.dateIso === customSearchDate);
    }

    return list;
  }, [activeTab, historyDocs, myHistoryDocs, adminSelectedChildName, historyPeriodFilter, customSearchDate]);

  const childNamesList = useMemo(() => {
    const names = new Set(historyDocs.map(d => d.userDisplayName).filter(Boolean));
    return Array.from(names);
  }, [historyDocs]);

  const calendar30Days = useMemo(() => {
    const days = [];
    const testedDates = new Set(filteredHistoryDocs.map(item => item.dateIso));
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({
        iso: iso,
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        isTested: testedDates.has(iso)
      });
    }
    return days;
  }, [filteredHistoryDocs]);

  const radarData = useMemo(() => {
    const totals = {};
    filteredHistoryDocs.forEach(doc => {
      if (!doc.categoryStats) return;
      Object.entries(doc.categoryStats).forEach(([cat, val]) => {
        if (!totals[cat]) totals[cat] = { correct: 0, total: 0 };
        totals[cat].correct += val.correct;
        totals[cat].total += val.total;
      });
    });

    const categories = ['算数計算', '特殊算', '図形', '思考力', '国語漢字', '語彙文法', '読解力', 'ウイグル語'];
    return categories.map(cat => ({
      subject: cat,
      score: totals[cat] && totals[cat].total > 0
        ? Math.round((totals[cat].correct / totals[cat].total) * 100)
        : 75
    }));
  }, [filteredHistoryDocs]);

  const scoreTrendData = useMemo(() => {
    return [...filteredHistoryDocs]
      .reverse()
      .map(item => ({
        date: item.dateStr || '前',
        score: item.percentage
      }));
  }, [filteredHistoryDocs]);

  const totalExamsTaken = filteredHistoryDocs.length;
  const averageScore = totalExamsTaken > 0
    ? Math.round(filteredHistoryDocs.reduce((acc, curr) => acc + curr.percentage, 0) / totalExamsTaken)
    : 0;

  const getRankBadge = (avg) => {
    if (avg >= 85) return { title: "Sクラス合格圏内", color: "bg-amber-500 text-white", border: "border-amber-300" };
    if (avg >= 70) return { title: "Cクラス上位圏内", color: "bg-indigo-600 text-white", border: "border-indigo-300" };
    if (avg >= 55) return { title: "Bクラス標準圏内", color: "bg-emerald-600 text-white", border: "border-emerald-300" };
    return { title: "Aクラス挑戦中", color: "bg-slate-600 text-white", border: "border-slate-300" };
  };

  const currentRank = getRankBadge(averageScore);

  // ==========================================
  // RENDER 1: AUTH LOADING SPINNER
  // ==========================================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl mb-4 animate-bounce">
          四
        </div>
        <p className="text-sm font-bold text-slate-300">認証状態を確認しています...</p>
      </div>
    );
  }

  // ==========================================
  // RENDER 2: MANDATORY LOGIN GATE (NO GUEST MODE)
  // ==========================================
  if (!user || user.isAnonymous) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
          
          {/* Brand Header */}
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

          {/* Primary Google Sign-In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
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

          {/* Email & Password Login / Register Form */}
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

            <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  メールアドレス
                </label>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  パスワード（6文字以上）
                </label>
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
            ※ ゲスト利用は停止されています。管理者（{ADMIN_EMAIL}）でログインすると保護者管理画面が表示されます。
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER 3: AUTHENTICATED MAIN APPLICATION
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      
      {/* Inline Display Name Modal */}
      {isEditingName && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDisplayName}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4"
          >
            <h3 className="font-black text-base text-slate-900">表示名を変更</h3>
            <p className="text-xs text-slate-500">
              成績一覧や保護者画面に表示されるお名前を入力してください。
            </p>
            <input
              type="text"
              value={editNameDraft}
              onChange={(e) => setEditNameDraft(e.target.value)}
              placeholder="例: お兄ちゃん、弟"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:border-indigo-600 outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
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
      )}

      {/* Top Header Navigation */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          
          {/* Top Row: Compact Title & Mobile Logged-in User Info */}
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

            {/* Mobile User Name & Logout */}
            <div className="flex items-center gap-1.5 md:hidden shrink-0">
              <button
                onClick={openEditNameModal}
                title="表示名を変更"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 max-w-[120px]"
              >
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{currentUserDisplayName}</span>
              </button>
              <button
                onClick={handleLogout}
                title="ログアウト"
                className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs & Desktop Profile */}
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

              {/* Parent Admin Button: ONLY rendered when logged in as peruqsidiq@gmail.com */}
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

            {/* Desktop User Name & Logout */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 shrink-0">
              <button
                onClick={openEditNameModal}
                title="表示名を変更"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentUserDisplayName}</span>
                <Edit3 className="w-3 h-3 text-slate-400" />
              </button>

              <button
                onClick={handleLogout}
                title={`ログアウト (${user?.email})`}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* GRADE & EXAM TIMER SETTINGS BAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
              {/* Grade Switcher */}
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

              {/* Exam Countdown Timer Toggle */}
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

            {/* DAILY STREAK & TODAY'S TEST HERO BANNER */}
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
                    {currentUserDisplayName} さん専用の日替わり問題（算数10問・国語10問）を毎回新しい数値・組み合わせで自動生成します。本番さながらのタイマー意識で実力を出し切りましょう！
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
                    onClick={startDailyTest}
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

            {/* WEAKNESS CONQUEST MODE BANNER */}
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
                      wrongQuestionsPool.length > 0
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {wrongQuestionsPool.length > 0
                        ? `弱点ストック: ${wrongQuestionsPool.length} 問`
                        : '弱点ゼロ達成中 🎉'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {wrongQuestionsPool.length > 0
                      ? '過去のテストで間違えた問題だけを自動ピックアップ！本番前に苦手をつぶして得点力を底上げしましょう（最大10問出題）。'
                      : 'まだ間違えた問題のストックがありません。テストを受けると間違えた問題が自動的にここへ集まります！'}
                  </p>
                </div>
              </div>

              <button
                onClick={startWeaknessQuiz}
                disabled={wrongQuestionsPool.length === 0}
                className={`w-full sm:w-auto flex-shrink-0 px-6 py-3 rounded-xl font-extrabold text-xs transition flex items-center justify-center gap-2 shadow ${
                  wrongQuestionsPool.length > 0
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  {wrongQuestionsPool.length > 0
                    ? `間違えた問題（${Math.min(10, wrongQuestionsPool.length)}問）に挑戦`
                    : '復習問題なし'}
                </span>
              </button>
            </div>

            {/* Test Selection Cards */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                分野別・総合練習テスト（{selectedGrade === 'grade2' ? '2年生向け' : '5年生向け'}）
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Math Test */}
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
                    onClick={() => startQuiz('math')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    算数10問テストを開始
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Japanese Test */}
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
                    onClick={() => startQuiz('japanese')}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    国語10問テストを開始
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Uyghur Test */}
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
                    onClick={() => startQuiz('uyghur')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    ウイグル語10問テストを開始
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Combined Test */}
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between group relative overflow-hidden border border-indigo-700">
                  <div className="absolute -right-4 -bottom-4 opacity-20 pointer-events-none">
                    <Trophy className="w-32 h-32" />
                  </div>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold">
                        <BrainCircuit className="w-6 h-6" />
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
                    onClick={() => startQuiz('combined')}
                    className="w-full bg-amber-400 hover:bg-amber-500 text-blue-950 font-extrabold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    総合模試（20問）を開始
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: QUIZ RUNNER */}
        {activeTab === 'quiz' && currentQuestions.length > 0 && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Quiz Top Progress & Countdown Timer */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {selectedSubject === 'weakness' ? '🔥 弱点克服復習' : `${selectedGrade === 'grade2' ? '2年生' : '5年生'} / ${getSubjectLabel(selectedSubject)}`}
                </span>
                <span className="text-xs font-semibold text-slate-600">
                  第 {currentIdx + 1} / {currentQuestions.length} 問
                </span>
              </div>

              {/* Timer Badge */}
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
                    <span>残り {formatSeconds(timeLeftSec)}</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200">
                    <Timer className="w-3.5 h-3.5 text-slate-400" />
                    <span>経過 {formatSeconds(elapsedSec)}</span>
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

            {/* Question Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md">
              <div className="text-xs font-bold text-indigo-500 mb-2">
                【{currentQuestions[currentIdx].category}】
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line mb-6">
                {currentQuestions[currentIdx].question}
              </h3>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {currentQuestions[currentIdx].options.map((opt, optIdx) => {
                  const isSelected = selectedOption === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleOptionSelect(optIdx)}
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

              {/* Navigation Action */}
              <button
                onClick={handleNextQuestion}
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
        )}

        {/* TAB 3: QUIZ RESULTS & EXPLANATION */}
        {activeTab === 'results' && selectedHistoryItem && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {(wasAutoSubmittedByTimeout || selectedHistoryItem.wasTimeout) && (
              <div className="bg-amber-100 border-2 border-amber-400 text-amber-950 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-sm">
                <Timer className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  制限時間が終了したため、自動的に提出されました！本番ではわからない問題を飛ばして時間内に解き切る練習を続けましょう。
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md text-center relative overflow-hidden">
              <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                {getSubjectLabel(selectedHistoryItem.subject)} ({selectedHistoryItem.gradeLabel || '標準'} - {selectedHistoryItem.dateStr})
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">
                採点結果発表
              </h2>

              <div className="flex items-center justify-center gap-6 my-4">
                <div>
                  <div className="text-xs text-slate-500 font-semibold">正解数</div>
                  <div className="text-3xl font-black text-slate-800">
                    {selectedHistoryItem.score} <span className="text-sm font-normal text-slate-500">/ {selectedHistoryItem.totalQuestions} 問</span>
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">正答率</div>
                  <div className="text-4xl font-black text-indigo-600">
                    {selectedHistoryItem.percentage}%
                  </div>
                </div>
                {selectedHistoryItem.durationSec !== undefined && (
                  <>
                    <div className="h-10 w-px bg-slate-200"></div>
                    <div>
                      <div className="text-xs text-slate-500 font-semibold">解答時間</div>
                      <div className="text-xl font-black text-slate-700">
                        {formatSeconds(selectedHistoryItem.durationSec)}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="max-w-sm mx-auto bg-slate-50 rounded-xl p-3 border border-slate-200 mt-4">
                <div className="text-xs text-slate-500">四谷大塚 クラス判定目安</div>
                <div className="font-extrabold text-sm text-indigo-900 mt-0.5">
                  {getRankBadge(selectedHistoryItem.percentage).title}
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                <button
                  onClick={() => setActiveTab('home')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow"
                >
                  トップ画面へ戻る
                </button>
                {wrongQuestionsPool.length > 0 && (
                  <button
                    onClick={startWeaknessQuiz}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow flex items-center gap-1.5"
                  >
                    <Target className="w-3.5 h-3.5" />
                    <span>弱点克服モードで解き直す</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('history')}
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

              {selectedHistoryItem.answeredBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    item.isCorrect ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        item.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-700">【{item.category}】</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      item.isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.isCorrect ? '正解 ○' : '不正解 ×'}
                    </span>
                  </div>

                  <p className="font-semibold text-xs sm:text-sm text-slate-800 whitespace-pre-line mb-3">
                    {item.question}
                  </p>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div>
                      <span className="text-slate-500">あなたの回答: </span>
                      <span className={item.isCorrect ? 'font-bold text-emerald-700' : 'font-bold text-rose-600'}>
                        {item.userAnswerIndex !== null && item.options[item.userAnswerIndex] ? item.options[item.userAnswerIndex] : '未回答（時間切れ）'}
                      </span>
                    </div>
                    {!item.isCorrect && (
                      <div>
                        <span className="text-slate-500">正しい解答: </span>
                        <span className="font-bold text-emerald-700">{item.options[item.correctIndex]}</span>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-slate-100 text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-2 rounded">
                      <strong className="text-indigo-900 block mb-1">【解説】</strong>
                      {item.explanation}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: HISTORY & ANALYTICS */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-6 h-6 text-indigo-600" />
                  学習実績・成績ダッシュボード
                </h2>
                <p className="text-xs text-slate-500">
                  {currentUserDisplayName} さんのテスト履歴と全期間・月別の分析結果です。
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

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setHistoryPeriodFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    historyPeriodFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  全期間
                </button>
                <button
                  onClick={() => setHistoryPeriodFilter('THIS_MONTH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    historyPeriodFilter === 'THIS_MONTH' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  今月
                </button>
                <button
                  onClick={() => setHistoryPeriodFilter('LAST_MONTH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    historyPeriodFilter === 'LAST_MONTH' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  先月
                </button>
                <button
                  onClick={() => setHistoryPeriodFilter('LAST_30')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    historyPeriodFilter === 'LAST_30' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  直近30日
                </button>
                <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-slate-800 text-sm mb-2 w-full text-left flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  指定期間の分野別理解度（レーダー）
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
                  <Trophy className="w-4 h-4 text-amber-500" />
                  得点率の推移（成長グラフ）
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
                      該当する期間のテスト履歴がありません。
                    </div>
                  )}
                </div>
              </div>
            </div>

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
                      onClick={() => {
                        setSelectedHistoryItem(item);
                        setActiveTab('results');
                      }}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-slate-900">
                            【{item.gradeLabel || '標準'}】{getSubjectLabel(item.subject)}
                          </span>
                          <span className="text-[11px] text-slate-400">{item.dateStr}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          正解: {item.score} / {item.totalQuestions} 問 ({item.durationSec ? `${formatSeconds(item.durationSec)}` : ''})
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-extrabold text-base text-indigo-600">
                            {item.percentage}%
                          </div>
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
        )}

        {/* TAB 5: PARENT ADMIN DASHBOARD (Strictly for peruqsidiq@gmail.com) */}
        {activeTab === 'admin' && isParentAdmin && (
          <div className="space-y-6">
            
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex items-center justify-between flex-wrap gap-4 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-block bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-400/30 mb-1">
                    管理者認証済み: {user?.email}
                  </div>
                  <h2 className="text-xl font-black text-white">家族全員の学習分析・歴史管理</h2>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition border border-slate-700 flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ログアウト</span>
              </button>
            </div>

            {/* Optional Gemini API Key Setting */}
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
                  onClick={handleSaveGeminiApiKey}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition whitespace-nowrap"
                >
                  {apiKeySavedToast ? '保存済み ✓' : '保存'}
                </button>
              </div>
            </div>

            {/* CHILD SELECTOR & HISTORICAL PERIOD FILTER */}
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
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setHistoryPeriodFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      historyPeriodFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    全期間
                  </button>
                  <button
                    onClick={() => setHistoryPeriodFilter('THIS_MONTH')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      historyPeriodFilter === 'THIS_MONTH' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    今月
                  </button>
                  <button
                    onClick={() => setHistoryPeriodFilter('LAST_MONTH')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      historyPeriodFilter === 'LAST_MONTH' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    先月
                  </button>
                  <button
                    onClick={() => setHistoryPeriodFilter('LAST_30')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      historyPeriodFilter === 'LAST_30' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    直近30日
                  </button>
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
              </div>
            </div>

            {/* 30-DAY HABIT CALENDAR */}
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

            {/* VISUAL ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-slate-800 text-sm mb-2 w-full text-left flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  選択したお子様・期間の分野別理解度
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
                  得点成長グラフ
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
                      条件に一致するテストデータがありません。
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DETAILED TEST HISTORY LIST */}
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
                      onClick={() => {
                        setSelectedHistoryItem(item);
                        setActiveTab('results');
                      }}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/50 hover:border-indigo-200 transition cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold text-sm text-slate-900">
                            {item.userDisplayName || '生徒'} - 【{item.gradeLabel || '標準'}】{getSubjectLabel(item.subject)}
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
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 text-center">
        <div className="max-w-6xl mx-auto px-4">
          四谷大塚 入塾テスト実戦対策・学習実績保存システム (会員ログイン専用・日替わり自動生成対応)
        </div>
      </footer>
    </div>
  );
}
