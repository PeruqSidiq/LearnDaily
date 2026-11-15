// src/data/QuestionBank.js
// 全学年共通の英語入門問題（通常45問＋リスニング15問＝全60問） ＋ 2年生・5年生向けの国語・算数問題バンク

export class QuestionBank {
  // =========================================================================
  // 1. 英語（English）入門トレーニング問題（全60問・全学年共通）
  // =========================================================================
  static ENGLISH_QUESTIONS = [
    // --- あいさつ・基本表現（5問） ---
    {
      id: 'en_01',
      category: 'あいさつ',
      question: '朝（あさ）に会ったときのあいさつ「おはよう」は英語でどれ？',
      choices: ['Good morning', 'Good night', 'Thank you', 'Goodbye'],
      answer: 'Good morning',
      explanation: 'Good morning（グッド モーニング）は「おはよう」という意味です。'
    },
    {
      id: 'en_02',
      category: 'あいさつ',
      question: '誰かに何かをしてもらったときの「ありがとう」は英語でどれ？',
      choices: ['Thank you', 'Excuse me', 'I am sorry', 'Hello'],
      answer: 'Thank you',
      explanation: 'Thank you（サンキュー）は感謝を伝える「ありがとう」です。'
    },
    {
      id: 'en_03',
      category: 'あいさつ',
      question: '夜、寝る前に言う「おやすみなさい」は英語でどれ？',
      choices: ['Good night', 'Good afternoon', 'See you', 'Welcome'],
      answer: 'Good night',
      explanation: 'Good night（グッド ナイト）は夜寝る前の「おやすみなさい」です。'
    },
    {
      id: 'en_04',
      category: 'あいさつ',
      question: '初めて会った人に「はじめまして」と伝える英語はどれ？',
      choices: ['Nice to meet you', 'How old are you', 'Happy birthday', 'Good luck'],
      answer: 'Nice to meet you',
      explanation: 'Nice to meet you（ナイス トゥ ミート ユー）で「はじめまして」になります。'
    },
    {
      id: 'en_05',
      category: 'あいさつ',
      question: '友だちと別れるときの「またね（さようなら）」は英語でどれ？',
      choices: ['See you', 'Thank you', 'Here you are', 'Come here'],
      answer: 'See you',
      explanation: 'See you（シー ユー）は「またね！」という親しみのあるあいさつです。'
    },

    // --- 数字・曜日（4問） ---
    {
      id: 'en_06',
      category: '数字・曜日',
      question: '数字の「3」を表す英単語はどれ？',
      choices: ['three', 'two', 'four', 'five'],
      answer: 'three',
      explanation: '1＝one、2＝two、3＝three（スリー）、4＝four、5＝five です。'
    },
    {
      id: 'en_07',
      category: '数字・曜日',
      question: '数字の「7」を表す英単語はどれ？',
      choices: ['seven', 'six', 'eight', 'nine'],
      answer: 'seven',
      explanation: '6＝six、7＝seven（セブン）、8＝eight、9＝nine、10＝ten です。'
    },
    {
      id: 'en_08',
      category: '数字・曜日',
      question: '数字の「10」を表す英単語はどれ？',
      choices: ['ten', 'one', 'two', 'twelve'],
      answer: 'ten',
      explanation: 'ten（テン）は数字の「10」を表します。'
    },
    {
      id: 'en_09',
      category: '数字・曜日',
      question: '「日曜日（にちようび）」を表す英単語はどれ？',
      choices: ['Sunday', 'Monday', 'Friday', 'Saturday'],
      answer: 'Sunday',
      explanation: 'Sun（太陽）の日で Sunday（サンデー）＝日曜日です。'
    },

    // --- 色（カラー）（4問） ---
    {
      id: 'en_10',
      category: '色・かたち',
      question: '「赤色（あかいろ）」を表す英単語はどれ？',
      choices: ['red', 'blue', 'yellow', 'green'],
      answer: 'red',
      explanation: 'red（レッド）は「赤」、blue（ブルー）は「青」です。'
    },
    {
      id: 'en_11',
      category: '色・かたち',
      question: '「青色（あおいろ）」を表す英単語はどれ？',
      choices: ['blue', 'black', 'white', 'pink'],
      answer: 'blue',
      explanation: 'blue（ブルー）は空や海のような「青色」を表します。'
    },
    {
      id: 'en_12',
      category: '色・かたち',
      question: '「黄色（きいろ）」を表す英単語はどれ？',
      choices: ['yellow', 'green', 'orange', 'purple'],
      answer: 'yellow',
      explanation: 'yellow（イエロー）はレモンやバナナのような「黄色」です。'
    },
    {
      id: 'en_13',
      category: '色・かたち',
      question: '「緑色（みどりいろ）」を表す英単語はどれ？',
      choices: ['green', 'gray', 'brown', 'white'],
      answer: 'green',
      explanation: 'green（グリーン）は葉っぱや森のような「緑色」です。'
    },

    // --- 動物・生き物（4問） ---
    {
      id: 'en_14',
      category: '動物',
      question: '「犬（いぬ）」を表す英単語はどれ？',
      choices: ['dog', 'cat', 'bird', 'fish'],
      answer: 'dog',
      explanation: 'dog（ドッグ）は「犬」、cat（キャット）は「猫」です。'
    },
    {
      id: 'en_15',
      category: '動物',
      question: '「猫（ねこ）」を表す英単語はどれ？',
      choices: ['cat', 'rabbit', 'bear', 'lion'],
      answer: 'cat',
      explanation: 'cat（キャット）は「猫」を表す英単語です。'
    },
    {
      id: 'en_16',
      category: '動物',
      question: '「うさぎ」を表す英単語はどれ？',
      choices: ['rabbit', 'monkey', 'tiger', 'horse'],
      answer: 'rabbit',
      explanation: 'rabbit（ラビット）は耳の長い「うさぎ」です。'
    },
    {
      id: 'en_17',
      category: '動物',
      question: '空を飛ぶ「鳥（とり）」を表す英単語はどれ？',
      choices: ['bird', 'fish', 'frog', 'duck'],
      answer: 'bird',
      explanation: 'bird（バード）は「鳥」、fish（フィッシュ）は「魚」です。'
    },

    // --- 食べ物・飲み物（3問） ---
    {
      id: 'en_18',
      category: '食べ物',
      question: '「りんご」を表す英単語はどれ？',
      choices: ['apple', 'banana', 'orange', 'grape'],
      answer: 'apple',
      explanation: 'apple（アップル）は「りんご」です。'
    },
    {
      id: 'en_19',
      category: '食べ物',
      question: '「水（みず）」を表す英単語はどれ？',
      choices: ['water', 'milk', 'juice', 'tea'],
      answer: 'water',
      explanation: 'water（ウォーター）は「水」、milk（ミルク）は「牛乳」です。'
    },
    {
      id: 'en_20',
      category: '食べ物',
      question: '「たまご」を表す英単語はどれ？',
      choices: ['egg', 'bread', 'rice', 'meat'],
      answer: 'egg',
      explanation: 'egg（エッグ）は「たまご」、bread（ブレッド）は「パン」です。'
    },

    // --- 身の回り・日常フレーズ（5問） ---
    {
      id: 'en_21',
      category: '身の回り',
      question: '「本（ほん）」を表す英単語はどれ？',
      choices: ['book', 'pen', 'desk', 'bag'],
      answer: 'book',
      explanation: 'book（ブック）は「本」、desk（デスク）は「机」です。'
    },
    {
      id: 'en_22',
      category: '身の回り',
      question: '「学校（がっこう）」を表す英単語はどれ？',
      choices: ['school', 'park', 'station', 'library'],
      answer: 'school',
      explanation: 'school（スクール）は「学校」、park（パーク）は「公園」です。'
    },
    {
      id: 'en_23',
      category: '日常フレーズ',
      question: '「私はりんごが好きです」を英語で言うとどれ？',
      choices: ['I like apples.', 'I have a pen.', 'I am happy.', 'I go to school.'],
      answer: 'I like apples.',
      explanation: 'I like ～（アイ ライク ～）で「私は～が好きです」という意味になります。'
    },
    {
      id: 'en_24',
      category: '日常フレーズ',
      question: '相手に「元気ですか？」とたずねる英語はどれ？',
      choices: ['How are you?', 'Who are you?', 'Where are you?', 'What is this?'],
      answer: 'How are you?',
      explanation: 'How are you?（ハウ アー ユー？）は「元気ですか？」という定番の質問です。'
    },
    {
      id: 'en_25',
      category: '日常フレーズ',
      question: '「これは何ですか？」とたずねる英語はどれ？',
      choices: ['What is this?', 'How old are you?', 'What time is it?', 'Can you swim?'],
      answer: 'What is this?',
      explanation: 'What is this?（ワット イズ ディス？）で「これは何ですか？」と聞けます。'
    },

    // =======================================================================
    // ★ 新規追加：英単語・表現 20問（天気・乗り物・家族・からだ・動き）
    // =======================================================================
    // --- 天気（4問） ---
    {
      id: 'en_26',
      category: '天気',
      question: '「晴れ（はれ）」を表す英単語はどれ？',
      choices: ['sunny', 'rainy', 'cloudy', 'snowy'],
      answer: 'sunny',
      explanation: 'sunny（サニー）は太陽が出て「晴れ」という意味です。'
    },
    {
      id: 'en_27',
      category: '天気',
      question: '「雨（あめ）」の天気を表す英単語はどれ？',
      choices: ['rainy', 'sunny', 'windy', 'fine'],
      answer: 'rainy',
      explanation: 'rain（雨）からできた rainy（レイニー）は「雨降り」を表します。'
    },
    {
      id: 'en_28',
      category: '天気',
      question: '「くもり」を表す英単語はどれ？',
      choices: ['cloudy', 'snowy', 'hot', 'cold'],
      answer: 'cloudy',
      explanation: 'cloud（雲）からできた cloudy（クラウディ）は「くもり」です。'
    },
    {
      id: 'en_29',
      category: '天気',
      question: '「雪（ゆき）」の天気を表す英単語はどれ？',
      choices: ['snowy', 'rainy', 'sunny', 'warm'],
      answer: 'snowy',
      explanation: 'snow（雪）からできた snowy（スノーウィー）は「雪降り」です。'
    },

    // --- 乗り物（4問） ---
    {
      id: 'en_30',
      category: '乗り物',
      question: '線路を走る「電車（でんしゃ）」を表す英単語はどれ？',
      choices: ['train', 'car', 'bus', 'ship'],
      answer: 'train',
      explanation: 'train（トレイン）は「電車・列車」を表す英単語です。'
    },
    {
      id: 'en_31',
      category: '乗り物',
      question: '空を飛ぶ「飛行機（ひこうき）」を表す英単語はどれ？',
      choices: ['airplane', 'bicycle', 'boat', 'taxi'],
      answer: 'airplane',
      explanation: 'airplane（エアプレイン）は空を飛ぶ「飛行機」です。'
    },
    {
      id: 'en_32',
      category: '乗り物',
      question: 'ペダルをこいで乗る「自転車（じてんしゃ）」を表す英単語はどれ？',
      choices: ['bicycle', 'train', 'truck', 'bus'],
      answer: 'bicycle',
      explanation: 'bicycle（バイシクル）は「自転車」です（短く bike とも言います）。'
    },
    {
      id: 'en_33',
      category: '乗り物',
      question: '道路を走る「自動車（くるま）」を表す英単語はどれ？',
      choices: ['car', 'ship', 'plane', 'rocket'],
      answer: 'car',
      explanation: 'car（カー）は「自動車・車」を表す基本の英単語です。'
    },

    // --- 家族・身近な人（4問） ---
    {
      id: 'en_34',
      category: '家族・人',
      question: '「お母さん」を表す英単語はどれ？',
      choices: ['mother', 'father', 'sister', 'brother'],
      answer: 'mother',
      explanation: 'mother（マザー）は「お母さん」、呼びかけるときは Mom（マム）とも言います。'
    },
    {
      id: 'en_35',
      category: '家族・人',
      question: '「お父さん」を表す英単語はどれ？',
      choices: ['father', 'mother', 'uncle', 'baby'],
      answer: 'father',
      explanation: 'father（ファザー）は「お父さん」、呼びかけるときは Dad（ダッド）とも言います。'
    },
    {
      id: 'en_36',
      category: '家族・人',
      question: '「友だち」を表す英単語はどれ？',
      choices: ['friend', 'teacher', 'student', 'family'],
      answer: 'friend',
      explanation: 'friend（フレンド）は「友だち」を表す大切な英単語です。'
    },
    {
      id: 'en_37',
      category: '家族・人',
      question: '学校で教えてくれる「先生（せんせい）」を表す英単語はどれ？',
      choices: ['teacher', 'doctor', 'singer', 'cook'],
      answer: 'teacher',
      explanation: 'teach（教える）人のことで teacher（ティーチャー）＝「先生」です。'
    },

    // --- からだのパーツ（4問） ---
    {
      id: 'en_38',
      category: 'からだ',
      question: 'ものを見る「目（め）」を表す英単語はどれ？',
      choices: ['eye', 'ear', 'nose', 'mouth'],
      answer: 'eye',
      explanation: 'eye（アイ）は「目」です。両目なら eyes（アイズ）になります。'
    },
    {
      id: 'en_39',
      category: 'からだ',
      question: '音を聞く「耳（みみ）」を表す英単語はどれ？',
      choices: ['ear', 'eye', 'hand', 'foot'],
      answer: 'ear',
      explanation: 'ear（イヤー）は「耳」を表す英単語です。'
    },
    {
      id: 'en_40',
      category: 'からだ',
      question: 'ごはんを食べたり話したりする「口（くち）」を表す英単語はどれ？',
      choices: ['mouth', 'nose', 'head', 'hair'],
      answer: 'mouth',
      explanation: 'mouth（マウス）は「口」を表す英単語です。'
    },
    {
      id: 'en_41',
      category: 'からだ',
      question: 'えんぴつを持ったり拍手したりする「手（て）」を表す英単語はどれ？',
      choices: ['hand', 'leg', 'face', 'neck'],
      answer: 'hand',
      explanation: 'hand（ハンド）は「手」です。手を洗うは wash hands と言います。'
    },

    // --- よく使う動き・気持ち（4問） ---
    {
      id: 'en_42',
      category: '動き・気持ち',
      question: 'プールや海で「泳ぐ（およぐ）」を表す英単語はどれ？',
      choices: ['swim', 'run', 'jump', 'sleep'],
      answer: 'swim',
      explanation: 'swim（スイム）は「泳ぐ」です。水泳は swimming です。'
    },
    {
      id: 'en_43',
      category: '動き・気持ち',
      question: '運動場などで「走る（はしる）」を表す英単語はどれ？',
      choices: ['run', 'walk', 'stop', 'sit'],
      answer: 'run',
      explanation: 'run（ラン）は「走る」、walk（ウォーク）は「歩く」です。'
    },
    {
      id: 'en_44',
      category: '動き・気持ち',
      question: '「うれしい・しあわせ」を表す英単語はどれ？',
      choices: ['happy', 'sad', 'angry', 'sleepy'],
      answer: 'happy',
      explanation: 'happy（ハッピー）は「うれしい・楽しい」という気持ちを表します。'
    },
    {
      id: 'en_45',
      category: '動き・気持ち',
      question: '「おなかがすいた」を表す英単語はどれ？',
      choices: ['hungry', 'thirsty', 'tired', 'full'],
      answer: 'hungry',
      explanation: 'I am hungry.（アイ アム ハングリー）で「おなかがすいた！」になります。'
    },

    // =======================================================================
    // ★ 新規追加：発音を聞いて意味を選ぶリスニング問題（15問）
    // =======================================================================
    {
      id: 'en_ls_01',
      type: 'listening',
      audioText: 'Good afternoon',
      category: 'リスニング（あいさつ）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、正しい意味をえらぼう！',
      choices: ['こんにちは（昼のあいさつ）', 'おやすみなさい', 'ありがとう', 'はじめまして'],
      answer: 'こんにちは（昼のあいさつ）',
      explanation: '発音された英語は「Good afternoon（グッド アフタヌーン）」＝「こんにちは」です。'
    },
    {
      id: 'en_ls_02',
      type: 'listening',
      audioText: 'Excuse me',
      category: 'リスニング（あいさつ）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、正しい意味をえらぼう！',
      choices: ['すみません（声をかけるとき）', 'おめでとう', 'またあした', 'いただきます'],
      answer: 'すみません（声をかけるとき）',
      explanation: '発音された英語は「Excuse me（エクスキューズ ミー）」＝「すみません」です。'
    },
    {
      id: 'en_ls_03',
      type: 'listening',
      audioText: 'elephant',
      category: 'リスニング（動物）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、どの動物のことかえらぼう！',
      choices: ['ゾウ', 'キリン', 'ライオン', 'ペンギン'],
      answer: 'ゾウ',
      explanation: '発音された英語は「elephant（エレファント）」＝鼻の長い「ゾウ」です。'
    },
    {
      id: 'en_ls_04',
      type: 'listening',
      audioText: 'dolphin',
      category: 'リスニング（動物）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、どの生き物のことかえらぼう！',
      choices: ['イルカ', 'クジラ', 'サメ', 'カメ'],
      answer: 'イルカ',
      explanation: '発音された英語は「dolphin（ドルフィン）」＝海の「イルカ」です。'
    },
    {
      id: 'en_ls_05',
      type: 'listening',
      audioText: 'butterfly',
      category: 'リスニング（生き物）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、どの生き物のことかえらぼう！',
      choices: ['チョウ（ちょうちょ）', 'カブトムシ', 'テントウムシ', 'トンボ'],
      answer: 'チョウ（ちょうちょ）',
      explanation: '発音された英語は「butterfly（バタフライ）」＝「チョウ」です。'
    },
    {
      id: 'en_ls_06',
      type: 'listening',
      audioText: 'strawberry',
      category: 'リスニング（食べ物）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、どの食べ物のことかえらぼう！',
      choices: ['いちご', 'スイカ', 'ぶどう', 'もも'],
      answer: 'いちご',
      explanation: '発音された英語は「strawberry（ストロベリー）」＝赤い「いちご」です。'
    },
    {
      id: 'en_ls_07',
      type: 'listening',
      audioText: 'watermelon',
      category: 'リスニング（食べ物）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、どの食べ物のことかえらぼう！',
      choices: ['スイカ', 'メロン', 'パイナップル', 'バナナ'],
      answer: 'スイカ',
      explanation: '発音された英語は「watermelon（ウォーターメロン）」＝夏の「スイカ」です。'
    },
    {
      id: 'en_ls_08',
      type: 'listening',
      audioText: 'breakfast',
      category: 'リスニング（生活）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、正しい意味をえらぼう！',
      choices: ['朝ごはん（朝食）', '昼ごはん（昼食）', '夜ごはん（夕食）', 'おやつ'],
      answer: '朝ごはん（朝食）',
      explanation: '発音された英語は「breakfast（ブレックファスト）」＝「朝ごはん」です。'
    },
    {
      id: 'en_ls_09',
      type: 'listening',
      audioText: 'library',
      category: 'リスニング（場所）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、どの場所のことかえらぼう！',
      choices: ['図書館（としょかん）', '駅（えき）', '病院（びょういん）', '動物園（どうぶつえん）'],
      answer: '図書館（としょかん）',
      explanation: '発音された英語は「library（ライブラリー）」＝本がたくさんある「図書館」です。'
    },
    {
      id: 'en_ls_10',
      type: 'listening',
      audioText: 'umbrella',
      category: 'リスニング（持ち物）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、どの持ち物のことかえらぼう！',
      choices: ['かさ（雨傘）', 'くつ', 'ぼうし', 'とけい'],
      answer: 'かさ（雨傘）',
      explanation: '発音された英語は「umbrella（アンブレラ）」＝雨の日にさす「かさ」です。'
    },
    {
      id: 'en_ls_11',
      type: 'listening',
      audioText: 'Happy birthday!',
      category: 'リスニング（フレーズ）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、正しい意味をえらぼう！',
      choices: ['お誕生日おめでとう！', 'あけましておめでとう！', 'がんばってね！', 'おかえりなさい！'],
      answer: 'お誕生日おめでとう！',
      explanation: '発音された英語は「Happy birthday!（ハッピー バースデー）」＝「お誕生日おめでとう！」です。'
    },
    {
      id: 'en_ls_12',
      type: 'listening',
      audioText: 'See you tomorrow.',
      category: 'リスニング（フレーズ）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、正しい意味をえらぼう！',
      choices: ['またあしたね。', 'はじめまして。', 'お元気ですか？', '気をつけてね。'],
      answer: 'またあしたね。',
      explanation: '発音された英語は「See you tomorrow.（シー ユー トゥモロー）」＝「またあしたね」です。'
    },
    {
      id: 'en_ls_13',
      type: 'listening',
      audioText: 'I can swim.',
      category: 'リスニング（フレーズ）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、正しい意味をえらぼう！',
      choices: ['私は泳ぐことができます。', '私は速く走れます。', '私はピアノが弾けます。', '私は英語が話せます。'],
      answer: '私は泳ぐことができます。',
      explanation: '発音された英語は「I can swim.（アイ キャン スイム）」＝「私は泳ぐことができます」です。'
    },
    {
      id: 'en_ls_14',
      type: 'listening',
      audioText: 'It is sunny today.',
      category: 'リスニング（フレーズ）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、正しい意味をえらぼう！',
      choices: ['今日は晴れです。', '今日は雨です。', '今日はとても寒いです。', '明日は雪が降ります。'],
      answer: '今日は晴れです。',
      explanation: '発音された英語は「It is sunny today.（イット イズ サニー トゥデイ）」＝「今日は晴れです」です。'
    },
    {
      id: 'en_ls_15',
      type: 'listening',
      audioText: 'Good job!',
      category: 'リスニング（フレーズ）',
      question: '【リスニング】スピーカーボタンを押して英語の発音を聞き、正しい意味をえらぼう！',
      choices: ['よくできたね！（すごいね！）', 'ごめんなさい！', 'ちょっと待ってね！', 'おやすみなさい！'],
      answer: 'よくできたね！（すごいね！）',
      explanation: '発音された英語は「Good job!（グッド ジョブ）」＝「よくできたね！」とほめる表現です。'
    }
  ];

  // =========================================================================
  // 2. 国語問題（小学2年生向け）
  // =========================================================================
  static GRADE2_JAPANESE = [
    {
      id: 'jp2_01',
      category: '漢字の読み',
      question: '「毎日、元気に学校へ行く。」の「元気」の読み方はどれ？',
      choices: ['げんき', 'てんき', 'でんき', 'ほんき'],
      answer: 'げんき',
      explanation: '「元気」は「げんき」と読みます。'
    },
    {
      id: 'jp2_02',
      category: '反対の言葉',
      question: '「大きい」の反対（はんたい）の意味の言葉はどれ？',
      choices: ['小さい', '長い', '高い', '広い'],
      answer: '小さい',
      explanation: '「大きい」の反対は「小さい（ちいさい）」です。'
    },
    {
      id: 'jp2_03',
      category: '反対の言葉',
      question: '「新しい」の反対（はんたい）の意味の言葉はどれ？',
      choices: ['古い', '若い', '早い', '近い'],
      answer: '古い',
      explanation: '「新しい（あたらしい）」の反対は「古い（ふるい）」です。'
    },
    {
      id: 'jp2_04',
      category: '文のきまり',
      question: '「白い うさぎが ぴょんと はねた。」で、「なにが」にあたる言葉はどれ？',
      choices: ['うさぎが', '白い', 'ぴょんと', 'はねた'],
      answer: 'うさぎが',
      explanation: '文の主人公（主語）は「うさぎが」です。'
    },
    {
      id: 'jp2_05',
      category: '言葉の意味',
      question: '「朝ごはんを 食べる」の「朝」の反対の言葉はどれ？',
      choices: ['夜', '昼', '夕方', '今日'],
      answer: '夜',
      explanation: '「朝（あさ）」の反対は「夜（よる）」です。'
    },
    {
      id: 'jp2_06',
      category: '漢字の読み',
      question: '「空に 白い 雲が うかんでいる。」の「雲」の読み方はどれ？',
      choices: ['くも', 'ゆき', 'あめ', 'かぜ'],
      answer: 'くも',
      explanation: '「雲」は「くも」と読みます。'
    },
    {
      id: 'jp2_07',
      category: 'つながる言葉',
      question: '（ ）に入る言葉はどれ？「雨が ふってきた。（ ）、かさを さした。」',
      choices: ['だから', 'しかし', 'けれど', 'なぜなら'],
      answer: 'だから',
      explanation: '前の文が理由になっているときは「だから」をつなげます。'
    },
    {
      id: 'jp2_08',
      category: 'ものの数え方',
      question: 'えんぴつを数えるときに使う言葉はどれ？',
      choices: ['1本（いっぽん）', '1枚（いちまい）', '1匹（いっぴき）', '1冊（いっさつ）'],
      answer: '1本（いっぽん）',
      explanation: '細長いものは「1本、2本…」と数えます。'
    },
    {
      id: 'jp2_09',
      category: 'ものの数え方',
      question: '本やノートを数えるときに使う言葉はどれ？',
      choices: ['1冊（いっさつ）', '1枚（いちまい）', '1台（いちだい）', '1杯（いっぱい）'],
      answer: '1冊（いっさつ）',
      explanation: 'ページがとじてある本やノートは「1冊、2冊…」と数えます。'
    },
    {
      id: 'jp2_10',
      category: '読解・気持ち',
      question: '「けんた君は テストで 100点を とって、とびあがって よろこんだ。」どんな気持ちですか？',
      choices: ['とても うれしい気持ち', 'くやしくて かなしい気持ち', 'びっくりして こわい気持ち', 'ねむくて つかれた気持ち'],
      answer: 'とても うれしい気持ち',
      explanation: '「とびあがって よろこんだ」という行動から、とてもうれしい気持ちがわかります。'
    }
  ];

  // =========================================================================
  // 3. 国語問題（小学5年生向け）
  // =========================================================================
  static GRADE5_JAPANESE = [
    {
      id: 'jp5_01',
      category: '対義語・類義語',
      question: '「複雑（ふくざつ）」の対義語として最も適切なものはどれ？',
      choices: ['単純', '簡単', '容易', '明快'],
      answer: '単純',
      explanation: '「複雑」の対義語は「単純（たんじゅん）」です（「簡単」の対義語は「困難」）。'
    },
    {
      id: 'jp5_02',
      category: '慣用句',
      question: '非常に驚いてあきれる様子を表す慣用句「開いた（ ）がふさがらない」の空欄はどれ？',
      choices: ['口', '目', '耳', '手'],
      answer: '口',
      explanation: 'あまりの驚きに口を開けたまま閉じられない様子から「開いた口がふさがらない」と言います。'
    },
    {
      id: 'jp5_03',
      category: '四字熟語',
      question: '「原因と結果がぴったり一致すること、よい行いをすればよい報いがあること」を表す四字熟語はどれ？',
      choices: ['因果応報', '一石二鳥', '以心伝心', '十人十色'],
      answer: '因果応報',
      explanation: '「因果応報（いんがおうほう）」は、原因に応じた結果が返ってくることを表します。'
    },
    {
      id: 'jp5_04',
      category: '接続語',
      question: '（ ）に入る最も適切な接続詞はどれ？「今日は朝から強い雨が降っていた。（ ）、試合は予定通り行われた。」',
      choices: ['しかし', 'つまり', 'したがって', 'たとえば'],
      answer: 'しかし',
      explanation: '雨という悪条件にもかかわらず実施されたという逆接の関係なので「しかし」が入ります。'
    },
    {
      id: 'jp5_05',
      category: 'ことわざ',
      question: '「失敗しても反省して原因を改めれば、かえって次の成功につながる」という意味のことわざはどれ？',
      choices: ['失敗は成功の母', '猿も木から落ちる', '急がば回れ', '石の上にも三年'],
      answer: '失敗は成功の母',
      explanation: '「失敗は成功の母」は、失敗から学ぶことで成功が生まれるという教えです。'
    },
    {
      id: 'jp5_06',
      category: '文法・主語述語',
      question: '「昨日、公園のベンチで本を読んでいた妹が急に笑い出した。」の主語はどれ？',
      choices: ['妹が', '昨日', '本を', '公園のベンチで'],
      answer: '妹が',
      explanation: '「だれが・なにが」にあたる「妹が」が、「笑い出した（述語）」に対応する主語です。'
    },
    {
      id: 'jp5_07',
      category: '敬語',
      question: '「先生がおっしゃった」の「おっしゃった」は何という敬語の種類ですか？',
      choices: ['尊敬語', '謙譲語', '丁寧語', '美化語'],
      answer: '尊敬語',
      explanation: '相手（先生）の動作を高めて敬意を表す「おっしゃる」は尊敬語です。'
    },
    {
      id: 'jp5_08',
      category: '指示語',
      question: '「彼は毎日欠かさず素振りを続けた。それが全国大会優勝につながった。」の「それ」が指す内容はどれ？',
      choices: ['毎日欠かさず素振りを続けたこと', '全国大会で優勝したこと', '毎日練習を見学したこと', '新しい道具を買ったこと'],
      answer: '毎日欠かさず素振りを続けたこと',
      explanation: '指示語「それ」は直前の文の内容全体を指しています。'
    },
    {
      id: 'jp5_09',
      category: '漢字の知識',
      question: '「泳」「海」「池」の3つの漢字に共通する部首の名前はどれ？',
      choices: ['さんずい', 'にすい', 'きへん', 'てへん'],
      answer: 'さんずい',
      explanation: '水に関係する漢字につく左側の部首は「さんずい」です。'
    },
    {
      id: 'jp5_10',
      category: '文章読解・要旨',
      question: '「読書は知識を増やすだけでなく、他人の心を想像し思いやりを育む。だからこそ子どもの頃から本に親しむべきだ。」筆者の主張はどれ？',
      choices: ['思いやりを育む読書に子どもの頃から親しむことが大切だ', '知識を増やすために難しい本だけを読むべきだ', '大人になってから読書を始めれば十分である', '本を読むよりも外で遊ぶほうが大切である'],
      answer: '思いやりを育む読書に子どもの頃から親しむことが大切だ',
      explanation: '「だからこそ〜べきだ」の後ろに筆者が最も伝えたい主張（要旨）が書かれています。'
    }
  ];

  // =========================================================================
  // 4. 算数予備問題（MathGeneratorの補助用）
  // =========================================================================
  static GRADE2_MATH_FALLBACK = [
    {
      id: 'm2_fb_01',
      category: '時計・時間',
      question: '午後2時30分の40分後は、午後何時何分ですか？',
      choices: ['午後3時10分', '午後3時00分', '午後2時70分', '午後3時20分'],
      answer: '午後3時10分',
      explanation: '2時30分から30分たつと3時00分、さらに10分たって午後3時10分になります。'
    },
    {
      id: 'm2_fb_02',
      category: '長さ・単位',
      question: '2m 35cm は、全部で何cmですか？',
      choices: ['235cm', '2035cm', '55cm', '2350cm'],
      answer: '235cm',
      explanation: '1m ＝ 100cm なので、2m ＝ 200cm。200 ＋ 35 ＝ 235cm です。'
    }
  ];

  static GRADE5_MATH_FALLBACK = [
    {
      id: 'm5_fb_01',
      category: 'つるかめ算・思考力',
      question: 'ツルとカメが合わせて10匹います。足の数の合計が28本のとき、カメは何匹いますか？',
      choices: ['4匹', '6匹', '5匹', '3匹'],
      answer: '4匹',
      explanation: '全部ツルだと足は2×10＝20本。差の8本を足の差（4−2＝2本）で割ると8÷2＝4匹がカメです。'
    },
    {
      id: 'm5_fb_02',
      category: '植木算・思考力',
      question: '長さ60mのまっすぐな道の片側に、端から端まで5mおきに木を植えます。木は全部で何本必要ですか？',
      choices: ['13本', '12本', '11本', '14本'],
      answer: '13本',
      explanation: '間の数は 60÷5＝12か所。両端に植えるので 12＋1＝13本 必要です。'
    }
  ];

  // =========================================================================
  // 5. 互換用アクセサメソッド
  // =========================================================================
  static getEnglishQuestions() {
    return this.ENGLISH_QUESTIONS;
  }

  static getJapaneseQuestions(grade) {
    return String(grade) === '5' ? this.GRADE5_JAPANESE : this.GRADE2_JAPANESE;
  }

  static getMathFallbackQuestions(grade) {
    return String(grade) === '5' ? this.GRADE5_MATH_FALLBACK : this.GRADE2_MATH_FALLBACK;
  }
}

export default QuestionBank;
