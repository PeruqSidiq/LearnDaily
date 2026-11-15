import { QuizUtils } from '../utils/QuizUtils.js';

export class MathGenerator {
  static seededRandom(seedBase, offset, min, max, multiplier = 17.3) {
    const x = Math.sin(seedBase + offset * multiplier) * 10000;
    const frac = x - Math.floor(x);
    return Math.floor(frac * (max - min + 1)) + min;
  }

  static generateGrade2(seedBase) {
    const rand = (offset, min, max) => MathGenerator.seededRandom(seedBase, offset, min, max, 17.3);

    const a1 = rand(1, 13, 28);
    const c1 = 40 - a1;
    const b1 = rand(2, 11, 29);
    const ans1 = 40 + b1;

    const perBox = rand(3, 4, 9);
    const boxes = rand(4, 3, 8);
    const ans2 = perBox * boxes;

    const baseCards = rand(5, 22, 48);
    const moreCards = rand(6, 6, 18);
    const friendCards = baseCards + moreCards;
    const ans3 = baseCards + friendCards;

    const meters = rand(7, 1, 3);
    const extraCm = rand(8, 10, 45);
    const cutCm = rand(9, 25, 85);
    const totalCm = meters * 100 + extraCm;
    const ans4 = totalCm - cutCm;

    const subNum = rand(10, 23, 78);
    const ans5 = 100 - subNum;

    const startSeq = rand(11, 2, 9);
    const stepSeq = rand(12, 3, 7);
    const seqArr = [0, 1, 2, 3, 4].map(i => startSeq + stepSeq * i);
    const ans6 = startSeq + stepSeq * 5;

    const startHour = rand(13, 8, 10);
    const startMin = rand(14, 15, 40);
    const addMin = rand(15, 30, 50);
    const totalMins = startMin + addMin;
    const endHour = startHour + Math.floor(totalMins / 60);
    const endMin = totalMins % 60;
    const altMin = endMin >= 5 ? endMin - 5 : endMin + 5;
    const ans7 = `午前 ${endHour}時 ${String(endMin).padStart(2, '0')}分`;

    const liters = rand(16, 2, 5);
    const deciliters = rand(17, 2, 8);
    const ans8 = liters * 10 + deciliters;

    const itemA = rand(18, 120, 260);
    const itemB = rand(19, 110, 210);
    const ans9 = 500 - (itemA + itemB);

    const shapes = [
      { name: "三角形", corners: 3, explain: "三角形は 3つの ちょうてん（角）と 3つの へんから できています。" },
      { name: "四角形（長方形）", corners: 4, explain: "四角形は 4つの ちょうてん（角）と 4つの へんから できています。" },
      { name: "さいころ（立方体）の めん（かお）", corners: 6, explain: "さいころ（立方体）の 面の数は 全部で 6つ です。" }
    ];
    const chosenShape = shapes[rand(20, 0, 2)];

    const pool = [
      {
        id: `g2_m1_${seedBase}`, category: "計算の工夫", categoryName: "算数計算",
        question: `つぎの けいさんを くふうして しなさい。\n${a1} + ${b1} + ${c1}`,
        options: [`${ans1}`, `${ans1 - 10}`, `${ans1 + 10}`, `${ans1 - 5}`], correctIndex: 0,
        explanation: `${a1} と ${c1} を さきに たすと ちょうど 40 になります。\n40 + ${b1} = ${ans1} です。`
      },
      {
        id: `g2_m2_${seedBase}`, category: "かけ算・九九", categoryName: "算数計算",
        question: `1ふくろに ${perBox}こずつ アメが はいっています。${boxes}ふくろでは みんなで 何こになりますか。`,
        options: [`${ans2} 個`, `${perBox + boxes} 個`, `${ans2 + perBox} 個`, `${ans2 - boxes} 個`], correctIndex: 0,
        explanation: `1つ分の数 × いくつ分 ＝ 全部の数 なので、\n${perBox} × ${boxes} = ${ans2} 個 になります。`
      },
      {
        id: `g2_m3_${seedBase}`, category: "文章題・和差", categoryName: "特殊算",
        question: `ゆうた君は カードを ${baseCards}まい もっています。けんた君は ゆうた君より ${moreCards}まい おおく もっています。2人あわせて 何まい もっていますか。`,
        options: [`${ans3} 枚`, `${friendCards} 枚`, `${baseCards * 2} 枚`, `${ans3 + 10} 枚`], correctIndex: 0,
        explanation: `まず けんた君の まい数を もとめます：${baseCards} + ${moreCards} = ${friendCards} 枚。\n2人あわせて：${baseCards} + ${friendCards} = ${ans3} 枚 です。`
      },
      {
        id: `g2_m4_${seedBase}`, category: "単位・長さ", categoryName: "思考力",
        question: `${meters}m ${extraCm}cm の リボンがあります。ここから ${cutCm}cm 切りとると、のこりは 何cm になりますか。`,
        options: [`${ans4} cm`, `${ans4 + 100} cm`, `${ans4 - 10} cm`, `${totalCm} cm`], correctIndex: 0,
        explanation: `1m ＝ 100cm なので、${meters}m ${extraCm}cm ＝ ${totalCm}cm です。\n${totalCm} - ${cutCm} ＝ ${ans4}cm となります。`
      },
      {
        id: `g2_m5_${seedBase}`, category: "たし算・ひき算", categoryName: "算数計算",
        question: `100 から ${subNum} を ひいた 答えは いくつですか。`,
        options: [`${ans5}`, `${ans5 + 10}`, `${ans5 - 10}`, `${100 - subNum + 1}`], correctIndex: 0,
        explanation: `100 - ${subNum} = ${ans5} です。たしかめ算（${ans5} + ${subNum} = 100）も してみましょう。`
      },
      {
        id: `g2_m6_${seedBase}`, category: "規則性", categoryName: "思考力",
        question: `${seqArr.join(', ')}, ◯ … と きまりよく ならんでいます。◯に はいる かずは いくつですか。`,
        options: [`${ans6}`, `${ans6 - 1}`, `${ans6 + stepSeq}`, `${ans6 + 1}`], correctIndex: 0,
        explanation: `${stepSeq}ずつ ふえる きまりです。\n${seqArr[4]} + ${stepSeq} = ${ans6} となります。`
      },
      {
        id: `g2_m7_${seedBase}`, category: "時計・時間", categoryName: "思考力",
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
        id: `g2_m8_${seedBase}`, category: "水のかさ", categoryName: "思考力",
        question: `${liters}L ${deciliters}dL の 水は、全部で 何dL（デシリットル）ですか。`,
        options: [`${ans8} dL`, `${liters + deciliters} dL`, `${ans8 * 10} dL`, `${ans8 - 5} dL`], correctIndex: 0,
        explanation: `1L ＝ 10dL なので、${liters}L ＝ ${liters * 10}dL です。\n${liters * 10} + ${deciliters} = ${ans8}dL になります。`
      },
      {
        id: `g2_m9_${seedBase}`, category: "お金の計算", categoryName: "算数計算",
        question: `500円玉を 1まい もって 買い物に いきました。${itemA}円の ノートと ${itemB}円の えんぴつを 買うと、おつりは 何円ですか。`,
        options: [`${ans9} 円`, `${500 - itemA} 円`, `${ans9 + 50} 円`, `${ans9 + 100} 円`], correctIndex: 0,
        explanation: `2つの 代金の 合計は ${itemA} + ${itemB} = ${itemA + itemB} 円です。\nおつりは 500 - ${itemA + itemB} = ${ans9} 円になります。`
      },
      {
        id: `g2_m10_${seedBase}`, category: "図形", categoryName: "図形",
        question: `${chosenShape.name}は いくつ ありますか。`,
        options: [`${chosenShape.corners} つ`, `${chosenShape.corners + 2} つ`, `${chosenShape.corners - 1} つ`, `${chosenShape.corners + 4} つ`], correctIndex: 0,
        explanation: chosenShape.explain
      }
    ];

    return QuizUtils.shuffleArray(pool).map(QuizUtils.randomizeQuestionOptions);
  }

  static generateGrade5(seedBase) {
    const rand = (offset, min, max) => MathGenerator.seededRandom(seedBase, offset, min, max, 23.7);

    const multX = rand(1, 14, 49);
    const numY1 = rand(2, 22, 68);
    const numY2 = 100 - numY1;
    const ans1 = multX * 100;

    const interval = rand(3, 3, 8);
    const gaps = rand(4, 10, 24);
    const totalDist = interval * gaps;
    const ans2 = gaps + 1;

    const younger = rand(5, 8, 15);
    const diff = rand(6, 4, 12) * 2;
    const older = younger + diff;
    const sumAge = younger + older;

    const firstTerm = rand(7, 2, 11);
    const commonDiff = rand(8, 3, 8);
    const targetN = rand(9, 10, 16);
    const seqPreview = [0, 1, 2, 3, 4].map(i => firstTerm + commonDiff * i);
    const ans4 = firstTerm + commonDiff * (targetN - 1);

    const turtles = rand(10, 3, 9);
    const rawCranes = rand(11, 4, 11);
    const cranes = rawCranes === turtles ? rawCranes + 1 : rawCranes;
    const totalHeads = cranes + turtles;
    const totalLegs = cranes * 2 + turtles * 4;

    const origNum = rand(12, 4, 15);
    const addStep = rand(13, 3, 9);
    const multStep = rand(14, 2, 5);
    const subStep = rand(15, 4, 14);
    const finalVal = (origNum + addStep) * multStep - subStep;

    const rectH = rand(16, 7, 12);
    const rectW = rand(17, 11, 18);
    const cutSide = rand(18, 1, 2);
    const ans7 = rectH * rectW - cutSide * cutSide * 4;

    const cubeEdge = rand(19, 3, 5);
    const ans8 = cubeEdge * cubeEdge * cubeEdge;

    const kids = rand(20, 6, 14);
    const lessGive = rand(21, 3, 5);
    const moreGive = lessGive + 2;
    const remBooks = rand(22, 6, 14);
    const shortBooks = kids * 2 - remBooks;

    const targetPos = rand(23, 32, 68);
    const colors = ["赤", "青", "黄", "白", "緑"];
    const remIdx = (targetPos - 1) % 5;
    const ans10 = colors[remIdx];

    const pool = [
      {
        id: `g5_m1_${seedBase}`, category: "計算の工夫", categoryName: "算数計算",
        question: `次の計算を工夫してしなさい。\n${multX} × ${numY1} + ${multX} × ${numY2}`,
        options: [`${ans1}`, `${ans1 / 10}`, `${ans1 + 100}`, `${multX * 50}`], correctIndex: 0,
        explanation: `分配法則を使います。\n${multX} × (${numY1} + ${numY2}) = ${multX} × 100 = ${ans1} となります。`
      },
      {
        id: `g5_m2_${seedBase}`, category: "植木算", categoryName: "特殊算",
        question: `長さ ${totalDist}m のまっすぐな道路の片側に、端から端まで ${interval}m おきに木を植えます。木は全部で何本必要ですか。`,
        options: [`${ans2} 本`, `${gaps} 本`, `${ans2 + 1} 本`, `${gaps - 1} 本`], correctIndex: 0,
        explanation: `両端に植える植木算です。\n間の数 ＝ ${totalDist} ÷ ${interval} ＝ ${gaps}（個）。\n木の数 ＝ ${gaps} ＋ 1 ＝ ${ans2}（本）となります。`
      },
      {
        id: `g5_m3_${seedBase}`, category: "和差算", categoryName: "特殊算",
        question: `AさんとBさんの年齢の和は ${sumAge} 歳で、AさんはBさんより ${diff} 歳年上です。Aさんは何歳ですか。`,
        options: [`${older} 歳`, `${younger} 歳`, `${older + 2} 歳`, `${Math.floor(sumAge / 2)} 歳`], correctIndex: 0,
        explanation: `和差算の公式を使います。\nAさん（大きい方）＝ (${sumAge} ＋ ${diff}) ÷ 2 ＝ ${older} 歳です。`
      },
      {
        id: `g5_m4_${seedBase}`, category: "等差数列", categoryName: "思考力",
        question: `${seqPreview.join(', ')}, … のように一定の決まりで数が並んでいます。この数列の第 ${targetN} 番目の数はいくつですか。`,
        options: [`${ans4}`, `${ans4 - commonDiff}`, `${ans4 + commonDiff}`, `${ans4 + 1}`], correctIndex: 0,
        explanation: `はじめの数 ${firstTerm}、ふえる数 ${commonDiff} の等差数列です。\n第 ${targetN} 番目の数 ＝ ${firstTerm} ＋ ${commonDiff} × (${targetN} - 1) ＝ ${ans4} です。`
      },
      {
        id: `g5_m5_${seedBase}`, category: "つるかめ算", categoryName: "特殊算",
        question: `ツルとカメが合わせて ${totalHeads} 匹います。足の数の合計は ${totalLegs} 本です。カメは何匹いますか。`,
        options: [`${turtles} 匹`, `${cranes} 匹`, `${turtles + 2} 匹`, `${turtles + 3} 匹`], correctIndex: 0,
        explanation: `すべてツル（足2本）だと仮定すると足は ${totalHeads * 2} 本。\n不足分 ${totalLegs - totalHeads * 2} 本 ÷ (4 - 2) ＝ ${turtles} 匹がカメです。`
      },
      {
        id: `g5_m6_${seedBase}`, category: "逆算", categoryName: "算数計算",
        question: `ある数に ${addStep} を足し、その数に ${multStep} をかけ、そこから ${subStep} を引くと ${finalVal} になりました。はじめの数はいくつですか。`,
        options: [`${origNum}`, `${origNum + 2}`, `${Math.max(1, origNum - 2)}`, `${origNum + addStep}`], correctIndex: 0,
        explanation: `ゴールから逆算します。\n(${finalVal} ＋ ${subStep}) ÷ ${multStep} - ${addStep} ＝ ${origNum} となります。`
      },
      {
        id: `g5_m7_${seedBase}`, category: "平面図形", categoryName: "図形",
        question: `たて ${rectH}cm、横 ${rectW}cm の長方形の四つの角から、1辺が ${cutSide}cm の正方形を1つずつ切り落としました。残った図形の面積は何 cm² ですか。`,
        options: [`${ans7} cm²`, `${rectH * rectW} cm²`, `${ans7 - 4} cm²`, `${ans7 + 10} cm²`], correctIndex: 0,
        explanation: `元の長方形 ${rectH} × ${rectW} ＝ ${rectH * rectW} cm² から、切り落とした正方形4つ分（${cutSide * cutSide * 4} cm²）を引いて ${ans7} cm² です。`
      },
      {
        id: `g5_m8_${seedBase}`, category: "立体図形", categoryName: "図形",
        question: `1辺が 1cm の小立方体を積み重ねて、1辺が ${cubeEdge}cm の大きな立方体を作ります。小立方体は全部で何個必要ですか。`,
        options: [`${ans8} 個`, `${cubeEdge * cubeEdge} 個`, `${cubeEdge * 6} 個`, `${ans8 + cubeEdge} 個`], correctIndex: 0,
        explanation: `立方体の体積（小立方体の個数）＝ ${cubeEdge} × ${cubeEdge} × ${cubeEdge} ＝ ${ans8} 個です。`
      },
      {
        id: `g5_m9_${seedBase}`, category: "過不足算", categoryName: "特殊算",
        question: `子どもにノートを配ります。1人に ${lessGive} 冊ずつ配ると ${remBooks} 冊余り、1人に ${moreGive} 冊ずつ配ると ${shortBooks} 冊足りなくなります。子どもは何人いますか。`,
        options: [`${kids} 人`, `${kids + 2} 人`, `${Math.max(2, kids - 2)} 人`, `${remBooks + shortBooks} 人`], correctIndex: 0,
        explanation: `過不足算の公式：(余り ＋ 不足) ÷ 1人あたりの差 ＝ (${remBooks} ＋ ${shortBooks}) ÷ (${moreGive} - ${lessGive}) ＝ ${kids} 人です。`
      },
      {
        id: `g5_m10_${seedBase}`, category: "周期算", categoryName: "思考力",
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

    return QuizUtils.shuffleArray(pool).map(QuizUtils.randomizeQuestionOptions);
  }
}
