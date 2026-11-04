import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  signInWithPopup,
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
  ShieldCheck, Lock, Unlock, Users, TrendingUp
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'yotsuya-otsuka-prep-app';

// Helper to get Today's Date String (YYYY-MM-DD)
const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// ==========================================
// Base Question Datasets (Grade 2 & Grade 3-5)
// ==========================================

// --- GRADE 2 QUESTIONS ---
const MATH_QUESTIONS_G2 = [
  {
    id: "m2_1",
    category: "計算の工夫",
    categoryName: "算数計算",
    question: "つぎの けいさんを くふうして しなさい。\n28 + 15 + 12",
    options: ["55", "50", "45", "60"],
    correctIndex: 1,
    explanation: "28 と 12 を さきに たすと 40 になります。\n40 + 15 = 55 ではなく 50 と かんたんに けいさんできます。"
  },
  {
    id: "m2_2",
    category: "かけ算・九九",
    categoryName: "算数計算",
    question: "1はこに 6こずつ まんじゅうが はいっています。4はこでは みんなで 何こになりますか。",
    options: ["20 個", "24 個", "18 個", "30 個"],
    correctIndex: 1,
    explanation: "かけ算の ぶんしょうだいです。\n6 × 4 = 24 個 になります。"
  },
  {
    id: "m2_3",
    category: "文章題・和差",
    categoryName: "特殊算",
    question: "たかし君は シールを 35まい もっています。あきら君は たかし君より 8まい おおく もっています。2人あわせて 何まい もっていますか。",
    options: ["43 枚", "78 枚", "70 枚", "82 枚"],
    correctIndex: 1,
    explanation: "まず あきら君の まい数を もとめます。\nあきら君：35 + 8 = 43 枚。\n2人あわせて：35 + 43 = 78 枚 です。"
  },
  {
    id: "m2_4",
    category: "単位・長さ",
    categoryName: "思考力",
    question: "1m 20cm の テープがあります。ここから 40cm 切りとると、のこりは 何cm になりますか。",
    options: ["60 cm", "80 cm", "100 cm", "70 cm"],
    correctIndex: 1,
    explanation: "1m ＝ 100cm なので、1m 20cm ＝ 120cm です。\n120 - 40 ＝ 80cm となります。"
  },
  {
    id: "m2_5",
    category: "図形",
    categoryName: "図形",
    question: "三角形には 角（かど）が いくつ ありますか。",
    options: ["2 つ", "3 つ", "4 つ", "5 つ"],
    correctIndex: 1,
    explanation: "三角形は 3つの ちょうてん（角）と 3つの へんから できています。"
  },
  {
    id: "m2_6",
    category: "規則性",
    categoryName: "思考力",
    question: "2, 5, 8, 11, 14, ◯ … と きまりよく ならんでいます。◯に はいる かずは いくつですか。",
    options: ["16", "17", "18", "15"],
    correctIndex: 1,
    explanation: "3ずつ ふえる きまりです。\n14 + 3 = 17 となります。"
  },
  {
    id: "m2_7",
    category: "たし算・ひき算",
    categoryName: "算数計算",
    question: "100 から 37 を ひいた 答えは いくつですか。",
    options: ["63", "73", "53", "67"],
    correctIndex: 0,
    explanation: "100 - 37 = 63 です。"
  },
  {
    id: "m2_8",
    category: "水のかさ",
    categoryName: "思考力",
    question: "1L（リットル）は 何dL（デシリットル）ですか。",
    options: ["10 dL", "100 dL", "1000 dL", "5 dL"],
    correctIndex: 0,
    explanation: "1L ＝ 10dL です。"
  },
  {
    id: "m2_9",
    category: "時計・時間",
    categoryName: "思考力",
    question: "午前 9時 30分 から 45分ごの じかんは 午前何時何分ですか。",
    options: ["午前 10時 00分", "午前 10時 15分", "午前 10時 30分", "午前 9時 75分"],
    correctIndex: 1,
    explanation: "30分たったら 午前10時になります。\nあと 15分あるので、午前 10時 15分 です。"
  },
  {
    id: "m2_10",
    category: "図形・はこの形",
    categoryName: "図形",
    question: "さいころの 形（きれいな 正方体の はこ）には、めん（かお）が 全部で いくつ ありますか。",
    options: ["4 つ", "6 つ", "8 つ", "12 つ"],
    correctIndex: 1,
    explanation: "さいころ（立方体）の 面の数は 全部で 6つ です。"
  }
];

const JAPANESE_QUESTIONS_G2 = [
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
    options: ["しかし", "それから", "だから", "なぜなら"],
    correctIndex: 1,
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
    options: ["かわいい", "こねこが", "にわで", "あそんでいる"],
    correctIndex: 1,
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
    question: "「これ」が さしている ものは どれですか。\n「けんた君は 赤い かさを 忘れた。それに 気づいた ぼくは、これ（赤いかさ）を とどけた。」",
    options: ["けんた君", "赤いかさ", "ぼく", "がっこう"],
    correctIndex: 1,
    explanation: "「これ」は 直前の「赤いかさ」を さしています。"
  },
  {
    id: "j2_9",
    category: "ことわざ・慣用句",
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
    question: "つぎの ぶんを よんで、下せんぶの ときの 気持ちとして 正しいものは どれですか。\n「かけっこで 1いになれた とき、ぼくは <u>おもわず とびあがって よろこんだ</u>。」",
    options: ["とても うれしい 気持ち", "くやしくて かなしい 気持ち", "びくびく している 気持ち", "ねむい 気持ち"],
    correctIndex: 0,
    explanation: "「1いになれて おもわず とびあがった」ことから、とても うれしい 気持ちが わかります。"
  }
];

// --- GRADE 3-5 QUESTIONS ---
const MATH_QUESTIONS = [
  {
    id: "m_1",
    category: "計算の工夫",
    categoryName: "算数計算",
    question: "次の計算をしなさい。\n37 × 28 + 37 × 72",
    options: ["3700", "370", "7400", "3600"],
    correctIndex: 0,
    explanation: "分配法則 (a × b + a × c = a × (b + c)) を使います。\n37 × (28 + 72) = 37 × 100 = 3700 となります。"
  },
  {
    id: "m_2",
    category: "植木算",
    categoryName: "特殊算",
    question: "長さ 60m のまっすぐな道路の片側に、端から端まで 5m おきに木を植えます。木は全部で何本必要ですか。",
    options: ["12 本", "13 本", "14 本", "11 本"],
    correctIndex: 1,
    explanation: "両端に植える植木算です。\n間の数 ＝ 60 ÷ 5 ＝ 12（個）。\n木の数 ＝ 12 ＋ 1 ＝ 13（本）となります。"
  },
  {
    id: "m_3",
    category: "和差算",
    categoryName: "特殊算",
    question: "AさんとBさんの年齢の和は 28 歳で、AさんはBさんより 6 歳年上です。Aさんは何歳ですか。",
    options: ["11 歳", "17 歳", "22 歳", "14 歳"],
    correctIndex: 1,
    explanation: "和差算の公式を使います。\nAさん（大きい方）＝ (和 ＋ 差) ÷ 2 ＝ (28 ＋ 6) ÷ 2 ＝ 17 歳です。"
  },
  {
    id: "m_4",
    category: "等差数列",
    categoryName: "思考力",
    question: "3, 7, 11, 15, 19, … のように一定の決まりで数が並んでいます。この数列の第 10 番目の数はいくつですか。",
    options: ["35", "39", "43", "36"],
    correctIndex: 1,
    explanation: "初項 3、公差 4 の等差数列です。\n第 10 番目の数 ＝ 3 ＋ 4 × (10 - 1) ＝ 3 ＋ 36 ＝ 39 です。"
  },
  {
    id: "m_5",
    category: "つるかめ算",
    categoryName: "特殊算",
    question: "ツルとカメが合わせて 10 匹います。足の数の合計は 28 本です。カメは何匹いますか。",
    options: ["2 匹", "4 匹", "6 匹", "8 匹"],
    correctIndex: 1,
    explanation: "すべてツル（足2本）だと仮定すると、足は 10 × 2 ＝ 20 本。\n不足分 ＝ 28 - 20 ＝ 8 本。\nツル1匹をカメ（足4本）に変えると足が2本増えるので、カメ ＝ 8 ÷ (4 - 2) ＝ 4 匹です。"
  },
  {
    id: "m_6",
    category: "逆算",
    categoryName: "算数計算",
    question: "ある数に 5 を足し、その数に 3 をかけ、そこから 8 を引き、最後に 2 で割ると 11 になりました。はじめの数はいくつですか。",
    options: ["3", "5", "7", "9"],
    correctIndex: 1,
    explanation: "逆算（ゴールから逆算）します。\n11 × 2 ＝ 22\n22 ＋ 8 ＝ 30\n30 ÷ 3 ＝ 10\n10 - 5 ＝ 5 となります。"
  },
  {
    id: "m_7",
    category: "平面図形",
    categoryName: "図形",
    question: "たて 6cm、横 10cm の長方形の四つの角から、1辺が 1cm の正方形を1つずつ切り落としました。残った図形の面積は何 cm² ですか。",
    options: ["52 cm²", "56 cm²", "60 cm²", "48 cm²"],
    correctIndex: 1,
    explanation: "元の長方形の面積 ＝ 6 × 10 ＝ 60 cm²。\n切り落とした正方形4つの面積 ＝ 1 × 1 × 4 ＝ 4 cm²。\n残りの面積 ＝ 60 - 4 ＝ 56 cm² です。"
  },
  {
    id: "m_8",
    category: "立体図形",
    categoryName: "図形",
    question: "1辺が 1cm の小立方体を積み重ねて、1辺が 3cm の大きな立方体を作ります。小立方体は全部で何個必要ですか。",
    options: ["9 個", "18 個", "27 個", "36 個"],
    correctIndex: 2,
    explanation: "立方体の体積（小立方体の個数）＝ 3 × 3 × 3 ＝ 27 個です。"
  },
  {
    id: "m_9",
    category: "過不足算",
    categoryName: "特殊算",
    question: "子どもにノートを配ります。1人に 4 冊ずつ配ると 10 冊余り、1人に 6 冊ずつ配ると 4 冊足りなくなります。子どもは何人いますか。",
    options: ["5 人", "7 人", "10 人", "12 人"],
    correctIndex: 1,
    explanation: "差集め算・過不足算の考え方です。\n(余り ＋ 不足) ÷ 1人あたりの配る差 ＝ 子どもの人数。\n(10 ＋ 4) ÷ (6 - 4) ＝ 14 ÷ 2 ＝ 7 人となります。"
  },
  {
    id: "m_10",
    category: "周期算",
    categoryName: "思考力",
    question: "「赤、青、黄、白、緑」の 5 種類の色紙がこの順番でくり返し並んでいます。左から数えて 43 番目の色紙は何色ですか。",
    options: ["赤", "青", "黄", "白"],
    correctIndex: 2,
    explanation: "5色の周期（赤・青・黄・白・緑）で繰り返します。\n43 ÷ 5 ＝ 8 周期 余り 3。\n余りが 3 なので、3 番目の色である「黄」になります。"
  }
];

const JAPANESE_QUESTIONS = [
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
    options: ["簡単", "単純", "容易", "明快"],
    correctIndex: 1,
    explanation: "「複雑」の対義語は「単純」です。"
  },
  {
    id: "j_3",
    category: "慣用句",
    categoryName: "語彙文法",
    question: "非常に驚いてあきれる様子を表す慣用句「開いた◯がふさがらない」の◯に入る言葉はどれですか。",
    options: ["目", "口", "耳", "手"],
    correctIndex: 1,
    explanation: "正解は「口」で、「開いた口がふさがらない」となります。"
  },
  {
    id: "j_4",
    category: "部首",
    categoryName: "国語漢字",
    question: "漢字の「泳」「海」「池」に共通する部首（へん）の名前は何ですか。",
    options: ["きへん", "さんずい", "にんべん", "うかんむり"],
    correctIndex: 1,
    explanation: "水に関係する漢字に共通する部首は「さんずい（氵）」です。"
  },
  {
    id: "j_5",
    category: "主語と述語",
    categoryName: "語彙文法",
    question: "次の文の「主語」にあたる部分はどれですか。\n「昨日、大きな黒い犬が公園で元気に走っていた。」",
    options: ["昨日", "大きな黒い犬が", "公園で", "元気に走っていた"],
    correctIndex: 1,
    explanation: "「何が（誰が）」にあたる部分は「大きな黒い犬が」です。"
  },
  {
    id: "j_6",
    category: "接続詞",
    categoryName: "語彙文法",
    question: "文中の（　）に入る最も適切な接続詞はどれですか。\n「今日は朝から強い雨が降っていた。（　）、サッカーの試合は予定通り行われた。」",
    options: ["だから", "しかし", "つまり", "また"],
    correctIndex: 1,
    explanation: "前後の文が逆の内容（雨だが実施した）をつなぐため「しかし（逆接）」が入ります。"
  },
  {
    id: "j_7",
    category: "指示語",
    categoryName: "読解力",
    question: "次の文の指示語「これ」が指している内容として最も適切なものはどれですか。\n「たけし君は毎日コツコツと漢字の練習を続けた。これがテストでの満点につながった。」",
    options: ["テストで満点を取ったこと", "毎日コツコツと漢字の練習を続けたこと", "漢字の練習問題集のこと", "たけし君のこと"],
    correctIndex: 1,
    explanation: "指示語「これ」は直前の動作「毎日コツコツと漢字の練習を続けたこと」を指しています。"
  },
  {
    id: "j_8",
    category: "ことわざ",
    categoryName: "語彙文法",
    question: "「失敗は成功の母（はは）」ということわざの意味として最も適切なものはどれですか。",
    options: ["お母さんは何でも成功させてくれるということ", "失敗しても反省して原因を改善すれば次の成功につながるということ", "一度失敗したら二度と成功できないということ", "失敗しないように何もしないのが一番であるということ"],
    correctIndex: 1,
    explanation: "失敗の原因を振り返って工夫することが成功の源になるという意味です。"
  },
  {
    id: "j_9",
    category: "四字熟語",
    categoryName: "語彙文法",
    question: "「一生懸命（いっしょうけんめい）」の語源であり、命がけで物事に取り組む様子を表す元の言葉（四字熟語）はどれですか。",
    options: ["一期一会", "一所懸命", "自業自得", "試行錯誤"],
    correctIndex: 1,
    explanation: "「一所懸命（いっしょけんめい）」は武士が1つの領地を命がけで守ったことに由来し、「一生懸命」の語源となった四字熟語です。"
  },
  {
    id: "j_10",
    category: "心情理解",
    categoryName: "読解力",
    question: "次の文章を読んで、下線部のときの「僕」の心情として最も適切なものはどれですか。\n「ライバルの健太が自分より高い点数を取ったのを知ったとき、僕は何も言わずに思わず拳を強く握りしめた。」",
    options: [
      "健太の努力を素直に称えて喜んでいる気持ち",
      "悔しくて次は絶対に負けたくないという強い気持ち",
      "テストが終わって心から安心している気持ち",
      "悲しくて何も考えられない気持ち"
    ],
    correctIndex: 1,
    explanation: "「何も言わずに思わず拳を強く握りしめた」という身体的描写から、悔しさと次への強いライバル心・闘志が読み取れます。"
  }
];

// --- UYGHUR LANGUAGE QUESTIONS ---
const UYGHUR_QUESTIONS = [
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
    options: ["بىر (Bir - 1)", "ئۈچ (Oech - 3)", "بەش (Besh - 5)", "ئون (On - 10)"],
    correctIndex: 2,
    explanation: "「بەش (Besh)」は数字の「5」を表します。"
  },
  {
    id: "u_4",
    category: "家族・人名",
    categoryName: "ウイグル語",
    question: "ウイグル語で「お母さん」を表す言葉（Ana）はどれですか。",
    options: ["ئانا (Ana)", "أتا (Ata)", "ئاكا (Aka)", "سىڭىل (Singil)"],
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
  }
];

// Daily Question Generator using Gemini API with Local Fallback
const fetchAIDailyQuestions = async (subject = 'combined', grade = 'grade3_4') => {
  const gradeLabel = grade === 'grade2' ? '小学2年生' : grade === 'grade5' ? '小学5年生' : '小学3〜4年生';
  
  const systemPrompt = `あなたは四谷大塚の入塾テスト・中学受験の算数と国語の専門講師です。
${gradeLabel}対象の四谷大塚入塾テストレベルの選択肢付き問題を生成してください。
レスポンスは必ず指定されたJSONフォーマットのみで返してください。`;

  const userQuery = `四谷大塚の入塾テスト対策として、${gradeLabel}向けの${subject === 'math' ? '算数10問' : subject === 'japanese' ? '国語10問' : '算数10問と国語10問（合計20問）'}の新作テスト問題を作成してください。`;

  const apiKey = "";
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

    if (!response.ok) throw new Error("API call failed");

    const result = await response.json();
    const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (jsonText) {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("AI Question generation falling back to dynamic pool:", err);
  }

  // Fallback Dynamic Generator
  if (grade === 'grade2') {
    return [...MATH_QUESTIONS_G2, ...JAPANESE_QUESTIONS_G2];
  }
  return [...MATH_QUESTIONS, ...JAPANESE_QUESTIONS];
};

export default function App() {
  // Auth & User States
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({ name: 'ゲスト生徒', avatar: '' });
  const [authError, setAuthError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Parent Admin Auth States (Fixed credentials: admin / family123)
  const [isParentAdmin, setIsParentAdmin] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminUsernameInput, setAdminUsernameInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');

  // Navigation & Grade States
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'quiz', 'results', 'history', 'admin'
  const [selectedSubject, setSelectedSubject] = useState('math'); // 'math', 'japanese', 'uyghur', 'combined', 'daily'
  const [selectedGrade, setSelectedGrade] = useState('grade3_4'); // 'grade2', 'grade3_4', 'grade5'
  
  // Quiz Runner States
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  // History & Storage
  const [historyDocs, setHistoryDocs] = useState([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  // Daily AI Mode States
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const todayStr = getTodayDateString();

  // Initialize Local Storage Fallback
  useEffect(() => {
    try {
      const saved = localStorage.getItem('learn_daily_quiz_history');
      if (saved) {
        setHistoryDocs(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not load local history:", e);
    }
  }, []);

  // Compute Daily Streak
  const streakInfo = useMemo(() => {
    if (!historyDocs || historyDocs.length === 0) return { streak: 0, testedToday: false };

    const dates = Array.from(new Set(
      historyDocs.map(item => {
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
  }, [historyDocs, todayStr]);

  // Auth Observer
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth initialization notice:", err);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserProfile({
          name: currentUser.displayName || (currentUser.isAnonymous ? 'ゲスト生徒' : '学習メンバー'),
          avatar: currentUser.photoURL || ''
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync Firestore History
  useEffect(() => {
    if (!user || user.isAnonymous) return;

    try {
      const resultsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'quiz_results');
      const unsubscribe = onSnapshot(
        resultsRef,
        (snapshot) => {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setHistoryDocs(items);
          localStorage.setItem('learn_daily_quiz_history', JSON.stringify(items));
        },
        (error) => {
          console.warn("Firestore listener error:", error);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn("Firestore subscription error:", e);
    }
  }, [user]);

  // Google Login Handler
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
      setAuthError("Googleログインに失敗しました。名前を直接登録してデータ保存することも可能です。");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSetLocalProfileName = () => {
    const name = prompt("お子様またはご家族の名前を入力してください:", userProfile.name);
    if (name && name.trim()) {
      setUserProfile(prev => ({ ...prev, name: name.trim() }));
      setAuthError(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth);
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  // Admin Login Handler
  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    if (adminUsernameInput.trim() === 'admin' && adminPasswordInput.trim() === 'family123') {
      setIsParentAdmin(true);
      setShowAdminLoginModal(false);
      setAdminAuthError('');
      setAdminUsernameInput('');
      setAdminPasswordInput('');
      setActiveTab('admin');
    } else {
      setAdminAuthError('ユーザー名またはパスワードが違います（初期設定: admin / family123）');
    }
  };

  const handleAdminLogout = () => {
    setIsParentAdmin(false);
    setActiveTab('home');
  };

  // Start Quiz
  const startQuiz = (subject) => {
    setSelectedSubject(subject);
    let questions = [];

    if (selectedGrade === 'grade2') {
      if (subject === 'math') questions = MATH_QUESTIONS_G2;
      else if (subject === 'japanese') questions = JAPANESE_QUESTIONS_G2;
      else if (subject === 'uyghur') questions = UYGHUR_QUESTIONS;
      else questions = [...MATH_QUESTIONS_G2, ...JAPANESE_QUESTIONS_G2];
    } else {
      if (subject === 'math') questions = MATH_QUESTIONS;
      else if (subject === 'japanese') questions = JAPANESE_QUESTIONS;
      else if (subject === 'uyghur') questions = UYGHUR_QUESTIONS;
      else questions = [...MATH_QUESTIONS, ...JAPANESE_QUESTIONS];
    }

    setCurrentQuestions(questions);
    setCurrentIdx(0);
    setUserAnswers(new Array(questions.length).fill(null));
    setSelectedOption(null);
    setQuizStartTime(Date.now());
    setActiveTab('quiz');
  };

  // Start Daily AI Test
  const startDailyTest = async () => {
    setIsGeneratingAI(true);
    setSelectedSubject('daily');
    
    const questions = await fetchAIDailyQuestions('combined', selectedGrade);
    
    setCurrentQuestions(questions);
    setCurrentIdx(0);
    setUserAnswers(new Array(questions.length).fill(null));
    setSelectedOption(null);
    setQuizStartTime(Date.now());
    setIsGeneratingAI(false);
    setActiveTab('quiz');
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
      finishQuiz(updatedAnswers);
    }
  };

  const finishQuiz = async (finalAnswers) => {
    const durationSec = Math.round((Date.now() - (quizStartTime || Date.now())) / 1000);

    let correctCount = 0;
    const categoryStats = {};

    const answeredBreakdown = currentQuestions.map((q, idx) => {
      const uAns = finalAnswers[idx];
      const isCorrect = uAns === q.correctIndex;
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
      dateStr: new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      subject: selectedSubject,
      grade: selectedGrade,
      gradeLabel: selectedGrade === 'grade2' ? '小学2年生' : selectedGrade === 'grade5' ? '小学5年生' : '小学3〜4年生',
      score: correctCount,
      totalQuestions: totalQ,
      percentage: percentage,
      durationSec: durationSec,
      categoryStats: categoryStats,
      answeredBreakdown: answeredBreakdown,
      userDisplayName: userProfile.name,
      userEmail: user?.email || 'ゲスト'
    };

    setHistoryDocs(prev => {
      const updated = [recordData, ...(prev || [])];
      try {
        localStorage.setItem('learn_daily_quiz_history', JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to write to localStorage:", e);
      }
      return updated;
    });

    if (user && !user.isAnonymous) {
      try {
        const resultsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'quiz_results');
        await addDoc(resultsRef, recordData);
      } catch (e) {
        console.warn("Failed to save result to Firestore:", e);
      }
    }

    setActiveTab('results');
    setSelectedHistoryItem(recordData);
  };

  // Analytics Data
  const radarData = useMemo(() => {
    if (!historyDocs || historyDocs.length === 0) {
      return [
        { subject: '算数計算', score: 80 },
        { subject: '特殊算', score: 70 },
        { subject: '図形', score: 75 },
        { subject: '国語漢字', score: 85 },
        { subject: '語彙文法', score: 65 },
        { subject: '読解力', score: 90 },
        { subject: 'ウイグル語', score: 80 }
      ];
    }

    const totals = {};
    historyDocs.forEach(docItem => {
      if (!docItem?.categoryStats) return;
      Object.entries(docItem.categoryStats).forEach(([cat, val]) => {
        if (!totals[cat]) totals[cat] = { correct: 0, total: 0 };
        totals[cat].correct += val.correct || 0;
        totals[cat].total += val.total || 0;
      });
    });

    return Object.entries(totals).map(([cat, val]) => ({
      subject: cat,
      score: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0
    }));
  }, [historyDocs]);

  const scoreTrendData = useMemo(() => {
    return [...(historyDocs || [])]
      .reverse()
      .map((item) => ({
        date: item.dateStr || '前',
        score: item.percentage || 0
      }));
  }, [historyDocs]);

  const totalExamsTaken = historyDocs ? historyDocs.length : 0;
  const averageScore = totalExamsTaken > 0 
    ? Math.round(historyDocs.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalExamsTaken)
    : 0;

  const getRankBadge = (avg) => {
    if (avg >= 85) return { title: "Sクラス合格圏内", color: "bg-amber-500 text-white", border: "border-amber-300" };
    if (avg >= 70) return { title: "Cクラス上位圏内", color: "bg-indigo-600 text-white", border: "border-indigo-300" };
    if (avg >= 55) return { title: "Bクラス標準圏内", color: "bg-emerald-600 text-white", border: "border-emerald-300" };
    return { title: "Aクラス挑戦中", color: "bg-slate-600 text-white", border: "border-slate-300" };
  };

  const currentRank = getRankBadge(averageScore);

  // Parent Analytics
  const familyMemberAnalytics = useMemo(() => {
    if (!historyDocs || historyDocs.length === 0) return [];

    const memberMap = {};
    historyDocs.forEach(item => {
      const name = item.userDisplayName || '家族メンバー';
      if (!memberMap[name]) {
        memberMap[name] = {
          name: name,
          email: item.userEmail || '',
          totalExams: 0,
          totalScorePercent: 0,
          lastExamDate: item.dateStr || '',
          lastExamTimestamp: item.timestamp || 0,
          records: []
        };
      }
      memberMap[name].totalExams += 1;
      memberMap[name].totalScorePercent += (item.percentage || 0);
      memberMap[name].records.push(item);

      if ((item.timestamp || 0) > memberMap[name].lastExamTimestamp) {
        memberMap[name].lastExamTimestamp = item.timestamp;
        memberMap[name].lastExamDate = item.dateStr;
      }
    });

    return Object.values(memberMap).map(m => {
      const avgScore = Math.round(m.totalScorePercent / m.totalExams);
      const dates = Array.from(new Set(
        m.records.map(r => {
          if (!r.timestamp) return null;
          const d = new Date(r.timestamp);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }).filter(Boolean)
      )).sort().reverse();

      const testedToday = dates.includes(todayStr);

      let streak = 0;
      let checkDate = new Date();
      if (!testedToday) checkDate.setDate(checkDate.getDate() - 1);

      while (true) {
        const dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
        if (dates.includes(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      return {
        ...m,
        avgScore: avgScore,
        rankTitle: getRankBadge(avgScore).title,
        rankColor: getRankBadge(avgScore).color,
        testedToday: testedToday,
        streak: streak,
        dates: dates
      };
    });
  }, [historyDocs, todayStr]);

  const past14Days = useMemo(() => {
    const list = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      list.push({ dStr, label });
    }
    return list;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      
      {/* Top Header Navigation */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-black shadow-md">
              四
            </div>
            <div>
              <h1 className="font-black text-sm sm:text-base leading-tight">四谷大塚 入塾テスト対策</h1>
              <p className="text-[10px] text-amber-300 font-medium">ご家族学習・保護者管理ダッシュボード対応</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'home' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ホーム</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>成績・分析</span>
            </button>

            {/* Parent Admin Button */}
            <button
              onClick={() => {
                if (isParentAdmin) setActiveTab('admin');
                else setShowAdminLoginModal(true);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 border ${
                activeTab === 'admin'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                  : isParentAdmin
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                  : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isParentAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isParentAdmin ? '保護者管理画面' : '🔒 保護者管理'}</span>
            </button>

            {/* Auth User Info */}
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt="" className="w-7 h-7 rounded-full border border-amber-400" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  title="ログアウト"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoggingIn}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 border border-slate-700"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Google連携</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Admin Login Modal */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 mb-1">保護者管理ログイン</h3>
            <p className="text-xs text-slate-500 mb-6">
              ご家族の毎日のテスト習慣化状況や成績の伸びを確認できます。
            </p>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ユーザー名</label>
                <input
                  type="text"
                  value={adminUsernameInput}
                  onChange={(e) => setAdminUsernameInput(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">パスワード</label>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  placeholder="family123"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              {adminAuthError && (
                <div className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {adminAuthError}
                </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                💡 初期ログイン情報:<br />
                ・ユーザー名: <code className="font-mono bg-white px-1 rounded border">admin</code><br />
                ・パスワード: <code className="font-mono bg-white px-1 rounded border">family123</code>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminLoginModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white shadow transition"
                >
                  ログイン
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Notification / Fallback Toast */}
      {authError && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs p-3 text-center flex items-center justify-center gap-2 flex-wrap">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{authError}</span>
          <button 
            onClick={handleSetLocalProfileName}
            className="bg-amber-600 text-white font-bold px-2 py-0.5 rounded text-[11px] hover:bg-amber-700 ml-1"
          >
            名前だけ登録して保存
          </button>
          <button onClick={() => setAuthError(null)} className="underline ml-2 font-bold text-slate-500">閉じる</button>
        </div>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Grade Selector */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-sm text-slate-800">お子様の対象学年を選択:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedGrade('grade2')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                    selectedGrade === 'grade2'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  小学2年生（低学年向け）
                </button>
                <button
                  onClick={() => setSelectedGrade('grade3_4')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                    selectedGrade === 'grade3_4'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  小学3・4年生（標準）
                </button>
                <button
                  onClick={() => setSelectedGrade('grade5')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                    selectedGrade === 'grade5'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  小学5年生（高学年）
                </button>
              </div>
            </div>

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-15 pointer-events-none transform translate-x-10 -translate-y-6">
                <Flame className="w-80 h-80" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-xl space-y-3">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-amber-100 border border-white/30">
                    <Calendar className="w-4 h-4 text-amber-200" />
                    【{selectedGrade === 'grade2' ? '小学2年生用' : selectedGrade === 'grade5' ? '小学5年生用' : '小学3・4年生用'}】本日の20問模試
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    毎日1回の習慣で差がつく！<br />算数10問・国語10問の本日限定模試
                  </h2>

                  <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
                    Gemini AIが{selectedGrade === 'grade2' ? '小学2年生向け' : '選択した学年向け'}の入塾テスト問題を自動生成します。1日20問チャレンジして合格レベルの思考力を身につけましょう！
                  </p>

                  <div className="flex items-center gap-4 pt-2">
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
                        <span>AIが本日限定20問を生成中...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span>{streakInfo.testedToday ? 'もう一度本日の20問テストを解く' : '本日の20問テストを開始'}</span>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* TEST CARDS */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                分野別・総合練習テスト（{selectedGrade === 'grade2' ? '2年生向け' : '標準コース'}）
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Math Test Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                        <Calculator className="w-6 h-6" />
                      </div>
                      <span className="bg-blue-50 text-blue-700 font-semibold text-xs px-2.5 py-1 rounded-full border border-blue-200">
                        算数 10問 / 約15分
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-lg mb-1 group-hover:text-blue-600 transition">
                      算数 実戦対策テスト
                    </h4>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                      {selectedGrade === 'grade2'
                        ? 'たし算ひき算の工夫、九九・かけ算、長さ・時間の計算、図形の基礎問題など10問をテストします。'
                        : '計算の工夫、逆算、植木算、和差算、つるかめ算、過不足算、周期算、図形など10問をテストします。'}
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

                {/* Japanese Test Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <span className="bg-rose-50 text-rose-700 font-semibold text-xs px-2.5 py-1 rounded-full border border-rose-200">
                        国語 10問 / 約15分
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-lg mb-1 group-hover:text-rose-600 transition">
                      国語 実戦対策テスト
                    </h4>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                      {selectedGrade === 'grade2'
                        ? '2年生の漢字、反対の言葉、言葉のつなぎ方、ていねいな言葉、短い文の気持ちの理解など10問です。'
                        : '漢字、部首、対義語、ことわざ・四字熟語、主語述語、接続詞、指示語、登場人物の心情理解など10問です。'}
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

                {/* Uyghur Test Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 font-semibold text-xs px-2.5 py-1 rounded-full border border-emerald-200">
                        ウイグル語 10問 / 約15分
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-lg mb-1 group-hover:text-emerald-600 transition">
                      ウイグル語 (ئۇيغۇرچە) テスト
                    </h4>
                    <p className="text-slate-500 text-xs leading-relaxed mb-4">
                      ウイグル文字（アラビア文字表記）、日常単語（くだもの・家族・数・動物）、挨拶、文法、自己紹介など基礎10問です。
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

                {/* Combined Test Card */}
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
                        全20問 / 算10 + 国10
                      </span>
                    </div>
                    <h4 className="font-extrabold text-white text-lg mb-1">
                      算国 20問 総合実戦模試
                    </h4>
                    <p className="text-slate-300 text-xs leading-relaxed mb-4">
                      算数10問と国語10問（合計20問）のフルセット模試。入塾基準をバランスよくチェックします。
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

            {/* TIPS SECTION */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                ご家庭での継続学習・運用のコツ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 mb-1 text-sm">1. 兄弟でプロファイルを活用</div>
                  Googleアカウントでログインすれば、お子様ごとの成績グラフや連続テスト記録が自動で整理・保存されます。
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 mb-1 text-sm">2. 毎日1回「本日の20問模試」</div>
                  AIが毎日新しい問題を生成するので、飽きずに毎日チャレンジして習慣化できます。
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-900 mb-1 text-sm">3. 弱点分野のピンポイント復習</div>
                  「成績・分析」画面のレーダーチャートで、苦手な分野（植木算、指示語など）をひと目で把握できます。
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: QUIZ RUNNER */}
        {activeTab === 'quiz' && currentQuestions?.length > 0 && currentQuestions[currentIdx] && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Quiz Top Progress */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {selectedGrade === 'grade2' ? '2年生' : '標準'} / {selectedSubject === 'math' ? '算数' : selectedSubject === 'japanese' ? '国語' : selectedSubject === 'uyghur' ? 'ウイグル語' : selectedSubject === 'daily' ? '本日のAI模試' : '算国総合'}
                </span>
                <span className="ml-2 text-xs font-semibold text-slate-500">
                  第 {currentIdx + 1} / {currentQuestions.length} 問
                </span>
              </div>
              <div className="w-1/3 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / currentQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md">
              <div className="text-xs font-bold text-indigo-500 mb-2">
                【{currentQuestions[currentIdx]?.category || '思考力'}】
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line mb-6">
                {currentQuestions[currentIdx]?.question || ''}
              </h3>

              {/* Options */}
              <div className="space-y-3 mb-8">
                {(currentQuestions[currentIdx]?.options || []).map((opt, optIdx) => {
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

        {/* TAB 3: RESULTS */}
        {activeTab === 'results' && selectedHistoryItem && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Score Overview Header */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md text-center relative overflow-hidden">
              <div className="inline-block bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
                テスト完了 ({selectedHistoryItem.gradeLabel || '標準'} - {selectedHistoryItem.dateStr})
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">
                採点結果発表
              </h2>

              <div className="flex items-center justify-center gap-6 my-4">
                <div>
                  <div className="text-xs text-slate-500 font-semibold">正解数</div>
                  <div className="text-3xl font-black text-slate-800">
                    {selectedHistoryItem.score ?? 0} <span className="text-sm font-normal text-slate-500">/ {selectedHistoryItem.totalQuestions ?? 0} 問</span>
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-200"></div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold">正答率</div>
                  <div className="text-4xl font-black text-indigo-600">
                    {selectedHistoryItem.percentage ?? 0}%
                  </div>
                </div>
              </div>

              {/* Target Class Evaluation */}
              <div className="max-w-sm mx-auto bg-slate-50 rounded-xl p-3 border border-slate-200 mt-4">
                <div className="text-xs text-slate-500">四谷大塚 クラス判定目安</div>
                <div className="font-extrabold text-sm text-indigo-900 mt-0.5">
                  {getRankBadge(selectedHistoryItem.percentage ?? 0).title}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setActiveTab('home')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow"
                >
                  トップ画面へ戻る
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-6 py-2.5 rounded-xl text-xs transition"
                >
                  全体の学習成績・分析を見る
                </button>
              </div>
            </div>

            {/* Answer Breakdown & Explanations */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                問題ごとの詳細と解説
              </h3>

              {(selectedHistoryItem.answeredBreakdown || []).map((item, idx) => (
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
                      <span className="font-bold text-xs text-slate-700">【{item.category || '思考力'}】</span>
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
                        {item.options ? (item.options[item.userAnswerIndex] || '未回答') : '未回答'}
                      </span>
                    </div>
                    {!item.isCorrect && item.options && (
                      <div>
                        <span className="text-slate-500">正しい解答: </span>
                        <span className="font-bold text-emerald-700">{item.options[item.correctIndex]}</span>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t border-slate-100 text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-2 rounded">
                      <strong className="text-indigo-900 block mb-1">【解説】</strong>
                      {item.explanation || '解説はありません。'}
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
            
            {/* Overview Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-6 h-6 text-indigo-600" />
                  学習実績・成績ダッシュボード
                </h2>
                <p className="text-xs text-slate-500">
                  {userProfile.name} さんのテスト履歴と弱点分野の分析結果です。
                </p>
              </div>

              {/* Status Badge */}
              <div className={`px-4 py-2 rounded-xl border text-xs font-bold ${currentRank.border} ${currentRank.color}`}>
                判定: {currentRank.title}
              </div>
            </div>

            {/* Visual Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Radar Chart */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-slate-800 text-sm mb-2 w-full text-left flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  分野別理解度（レーダーチャート）
                </h3>
                <p className="text-[11px] text-slate-400 mb-4 w-full text-left">
                  正答率が低い分野（凹んでいる部分）が四谷大塚テスト前の重点復習ポイントです。
                </p>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Radar name="正答率(%)" dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="font-bold text-slate-800 text-sm mb-2 w-full text-left flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  得点率の推移（成長グラフ）
                </h3>
                <p className="text-[11px] text-slate-400 mb-4 w-full text-left">
                  過去のテスト結果の推移です。70%以上で入塾試験安心ラインに到達します。
                </p>
                <div className="w-full h-64">
                  {scoreTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scoreTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5, fill: '#4f46e5' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      まだテスト履歴がありません。テストを受けるとグラフが表示されます。
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* History List */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                過去のテスト履歴一覧
              </h3>

              {(!historyDocs || historyDocs.length === 0) ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  テストの履歴がありません。テストを受けると自動的にここに記録されます。
                </div>
              ) : (
                <div className="space-y-3">
                  {historyDocs.map((item, index) => (
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
                            【{item.gradeLabel || '標準'}】{item.subject === 'math' ? '算数テスト' : item.subject === 'japanese' ? '国語テスト' : item.subject === 'uyghur' ? 'ウイグル語テスト' : item.subject === 'daily' ? '本日のAI模試' : '算国総合模試'}
                          </span>
                          <span className="text-[11px] text-slate-400">{item.dateStr}</span>
                        </div>
                        <div className="text-xs text-slate-500">
                          正解: {item.score ?? 0} / {item.totalQuestions ?? 0} 問 ({item.durationSec ? `${item.durationSec}秒` : ''})
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-extrabold text-base text-indigo-600">
                            {item.percentage ?? 0}%
                          </div>
                          <div className="text-[10px] text-emerald-600 font-semibold">
                            {(item.percentage ?? 0) >= 60 ? '合格基準達成' : '要復習'}
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

        {/* TAB 5: PARENT ADMIN DASHBOARD */}
        {activeTab === 'admin' && isParentAdmin && (
          <div className="space-y-6">
            
            {/* Admin Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex items-center justify-between flex-wrap gap-4 border border-indigo-800">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black">
                  <ShieldCheck className="w-4 h-4" />
                  保護者専用管理モード
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">
                  ご家族の学習進捗＆習慣化ダッシュボード
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200">
                  毎日のテスト実施状況・連続クリア日数・成績の成長グラフをまとめて確認できます。
                </p>
              </div>

              <button
                onClick={handleAdminLogout}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition flex items-center gap-2 border border-slate-700"
              >
                <Unlock className="w-4 h-4 text-amber-400" />
                <span>管理モードを終了</span>
              </button>
            </div>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold">本日のテスト完了人数</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {familyMemberAnalytics.filter(m => m.testedToday).length} <span className="text-xs font-normal text-slate-500">/ {familyMemberAnalytics.length || 1} 人</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  毎日1回の習慣化継続中
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold">最高連続日数 (Streak)</span>
                  <Flame className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600">
                  {Math.max(...familyMemberAnalytics.map(m => m.streak), 0)} <span className="text-xs font-normal text-slate-500">日連続</span>
                </div>
                <div className="text-[11px] text-amber-600 font-semibold mt-1">
                  モチベーション維持良好
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold">家族累計テスト受検回数</span>
                  <Trophy className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {historyDocs.length} <span className="text-xs font-normal text-slate-500">回</span>
                </div>
                <div className="text-[11px] text-indigo-600 font-semibold mt-1">
                  テスト解き直し含む総数
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-bold">家族平均正答率</span>
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-indigo-600">
                  {averageScore}%
                </div>
                <div className="text-[11px] text-slate-500 font-semibold mt-1">
                  四谷大塚 クラス判定目安: {currentRank.title}
                </div>
              </div>
            </div>

            {/* Member Progress Cards */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
                <Users className="w-5 h-5 text-indigo-600" />
                お子様ごとの進捗＆習慣化チェック
              </h3>

              {familyMemberAnalytics.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  まだテストデータがありません。お子様がテストを受けると、自動的にここに進捗が表示されます。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {familyMemberAnalytics.map((member, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-xs">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-slate-900">{member.name}</div>
                            <div className="text-[10px] text-slate-400">最終受検: {member.lastExamDate}</div>
                          </div>
                        </div>

                        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${member.rankColor}`}>
                          {member.rankTitle}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                        <div>
                          <div className="text-[10px] text-slate-400">本日のテスト</div>
                          <div className={`font-black mt-0.5 ${member.testedToday ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {member.testedToday ? '完了 ✓' : '未完了'}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400">連続日数</div>
                          <div className="font-black text-amber-600 mt-0.5">
                            🔥 {member.streak} 日
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400">平均点</div>
                          <div className="font-black text-indigo-600 mt-0.5">
                            {member.avgScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past 14-Days Habit Tracker Calendar */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 overflow-x-auto">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                直近14日間の「毎日1回テスト」実施状況カレンダー
              </h3>

              {familyMemberAnalytics.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-400">データなし</div>
              ) : (
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-[140px_repeat(14,1fr)] gap-1 text-center text-[10px] font-bold text-slate-500 border-b border-slate-100 pb-2 mb-2">
                    <div className="text-left pl-2">生徒名</div>
                    {past14Days.map((day, i) => (
                      <div key={i} className={day.dStr === todayStr ? 'text-amber-600 font-black' : ''}>
                        {day.label}
                      </div>
                    ))}
                  </div>

                  {familyMemberAnalytics.map((member, mIdx) => (
                    <div key={mIdx} className="grid grid-cols-[140px_repeat(14,1fr)] gap-1 text-center items-center py-2 border-b border-slate-50 text-xs">
                      <div className="font-bold text-left pl-2 text-slate-800 truncate">{member.name}</div>
                      {past14Days.map((day, dIdx) => {
                        const isDone = member.dates.includes(day.dStr);
                        return (
                          <div key={dIdx} className="flex justify-center">
                            {isDone ? (
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                                ✓
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center text-[10px]">
                                ・
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Score Growth Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                全体の成績伸び率（過去の全テスト推移）
              </h3>
              <div className="w-full h-64">
                {scoreTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoreTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5, fill: '#4f46e5' }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    データなし
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 text-center">
        <div className="max-w-6xl mx-auto px-4">
          四谷大塚 入塾テスト実戦対策・学習実績保存システム (ご家族運用・保護者管理機能搭載)
        </div>
      </footer>
    </div>
  );
}
