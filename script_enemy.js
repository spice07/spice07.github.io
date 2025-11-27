// ======== グローバル変数 ==========
let initiative = 0;
let Name = "";
let memo = "";
let memoTemp ="";//メモ挟む用
let EachStatus = [];
let Commands="";//チャパレ

// ======== メイン処理 ==========
window.addEventListener("DOMContentLoaded", () => {
  fetch("weaponDB.csv")
    .then(res => res.text())
    .then(text => {
      loadWeaponCSV(text);
      console.log("weaponDB.csv を読み込みました");
    })
    .catch(err => console.error("武器CSV読み込み失敗:", err));
});


document.getElementById("parseBtn").addEventListener("click", () => {
  const input = document.getElementById("input").value;
  if (!input.trim()) return alert("データ出力.txtの内容を入力してください。");
  const category = document.querySelector('input[name="category"]:checked');
  if (!category) return alert("手駒種別を選択してください。");

  maneuverList = [];//武器テーブル初期化
  const lines = input.split("\n");
  const data = loadData(lines);
  const kekka = makeKekkaFromData(data);

  document.getElementById("output").textContent = kekka;
  enableAutoAssistSummaryUpdate();
  showAssistSummaryTable(maneuverList);
  showManeuverTable(maneuverList);
});


document.getElementById("ChatPalletBtn").addEventListener("click", () => {
  const text = document.getElementById("output").textContent;
  if (!text.trim()) return alert("出力がありません。まずマニューバを検出してください。");

  Commands="";
  memo="";
  let allM="";
  let partM = ["", "", "", "", ""];//0その他、1頭、2腕、3胴、4脚 ごとのパーツ
  let numOfPartM=[0,0,0,0,0];//各部位パーツ数
  //console.log(maneuverList);
  for (const mData of maneuverList) {
    allM+=("【"+ textOfSengen(mData,0)+"\n");//HP管理
    if(3<=mData.part && mData.part<=6){
      partM[mData.part-2]+=("【"+ textOfSengen(mData,0)+"\n");
      numOfPartM[mData.part-2]+=1;
    }else{
    partM[0]+=("【"+ textOfSengen(mData,0)+"\n");
      numOfPartM[0]+=1;
    }
    if(mData.sengen==false)continue;//宣言
    Commands+=textOfSengen(mData,1)+"\n";
    if(mData.roll!==0){//ダイスロール
      //console.log(textOfRoll_A(mData));
      Commands+=textOfRoll_A(mData)+"\n";
    }
  }
  console.log(allM);

  let savantMemo="";
  if(numOfPartM[0]!==0){//通常部位以外
    savantMemo+="～？～\n"+partM[0];}
    savantMemo+="～頭～\n"+partM[1];
    savantMemo+="～腕～\n"+partM[2];
    savantMemo+="～胴～\n"+partM[3];
    savantMemo+="～脚～\n"+partM[4];
  //console.log(savantMemo);
  const category = document.querySelector('input[name="category"]:checked')?.value;
  if(category=="s"){//サヴァント
    memo=savantMemo;
  }else{
    memo=allM;}

  EachStatus = [];
  EachStatus.push({
    label: "最大行動値", value: initiative,  max: initiative});
  if(category=="s"){//サヴァント
    EachStatus.push({label: "頭", value:numOfPartM[1],  max:numOfPartM[1]});
    EachStatus.push({label: "腕", value:numOfPartM[2],  max:numOfPartM[2]});
    EachStatus.push({label: "胴", value:numOfPartM[3],  max:numOfPartM[3]});
    EachStatus.push({label: "脚", value:numOfPartM[4],  max:numOfPartM[4]});
  }
  if(category=="h"){//ホラー
    EachStatus.push({label: "残パーツ",
	value:maneuverList.length,  max:maneuverList.length});}
  if(category=="r"){//レギオン
    EachStatus.push({label: "残機"}) ;}


  const kekka= JSON.stringify({
    kind: "character",
    data: {
      name: Name,
      initiative: initiative,
      status: EachStatus,
      commands: Commands,
      memo: memo
    }
  }, null, 2);
  document.getElementById("output").textContent = kekka;
});


document.getElementById("output").addEventListener("click", function() {
  const range = document.createRange();
  range.selectNodeContents(this);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
});


document.getElementById("downloadBtn").addEventListener("click", () => {
  const text = document.getElementById("output").textContent;
  if (!text.trim()) return alert("出力がありません。出力してください。");

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kekka.txt";
  a.click();
  URL.revokeObjectURL(url);
});

document.getElementById("sampleBtnS").addEventListener("click", () => {
  document.querySelector('input[name="category"][value="s"]').checked = true;
  document.getElementById("input").value =
`タイトル：サンプルデータ＿ネメシス
キャラクター名：ネメシス

種族：
享年：
髪の色：　　 / 瞳の色：　　 / 肌の色：
身長：
体重：

ポジション：
クラス：　 /
初期配置：煉獄
行動値：11

■パーソナルデータ■

暗示：
[記憶のカケラ] 内容



[未練]　　 内容　　　 狂気度　　発狂時
たからもの への 依存　■■■□　幼児退行(最大行動値減少(-2))
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()


■強化値■
　　　　武装　変異　改造
ﾒｲﾝｸﾗｽ　　 0　　 0　　 0
ｻﾌﾞｸﾗｽ　　 0　　 0　　 0
ﾎﾞｰﾅｽ
寵愛
=合計=　　 0　　 0　　 0

■マニューバ■

[部位] マニューバ名: タイミング : コスト : 射程　: 効果
[頭]　のうみそ　　 : オート　　 : なし　 : 自身　: 最大行動値＋２
[頭]　めだま　　　 : オート　　 : なし　 : 自身　: 最大行動値＋１
[頭]　あご　　　　 : アクション : ２　　 : ０　　: 肉弾攻撃１
[頭]　カンフー　　 : オート　　 : なし　 : 自身　: 最大行動値＋１
[頭]　死人指揮　　 : ジャッジ　 : ０　　 : ０～１: 支援２、自身には使用不可
[腕]　こぶし　　　 : アクション : ２　　 : ０　　: 肉弾攻撃１
[腕]　うで　　　　 : ジャッジ　 : １　　 : ０　　: 支援１
[腕]　かた　　　　 : アクション : ４　　 : 自身　: 移動１
[腕]　肉切り包丁　 : アクション : ２　　 : ０　　: 白兵攻撃２
[腕]　二丁拳銃　　 : アクション : ３　　 : ０～１: 射撃攻撃２＋連撃１
[胴]　せぼね　　　 : アクション : １　　 : 自身　: 次カウントで使うマニューバ１つのコスト－１（最低０）する
[胴]　はらわた　　 : オート　　 : なし　 : なし　: なし
[胴]　はらわた　　 : オート　　 : なし　 : なし　: なし
[胴]　庇う　　　　 : ダメージ　 : ０　　 : ０～１: 対象が受けたダメージを、代わりに自身が受ける。１ターンに何度でも使用可。
[胴]　しんぞう　　 : オート　　 : なし　 : 自身　: 最大行動値＋１
[脚]　ほね　　　　 : アクション : ３　　 : 自身　: 移動１
[脚]　ほね　　　　 : アクション : ３　　 : 自身　: 移動１
[脚]　あし　　　　 : ジャッジ　 : １　　 : ０　　: 妨害１


■その他■
寵愛点：0点
成長履歴：
No. 獲得寵愛点(達成/ﾎﾞｰﾅｽ/ﾋﾟﾝｿﾞﾛ)　メモ
0　　　　　0点(　　 /　　)
1　　　　　0点(　　 /　　)
2　　　　　0点(　　 /　　)


メモ：
悪意点９　パーツ数１８（頭５腕５胴５脚３）
クセのない外見と能力を誇る汎用兵士型サヴァント。`;
});

document.getElementById("sampleBtnH").addEventListener("click", () => {
  document.querySelector('input[name="category"][value="h"]').checked = true;
  document.getElementById("input").value =
`タイトル：サンプルデータ＿グール
キャラクター名：グール

種族：
享年：
髪の色：　　 / 瞳の色：　　 / 肌の色：
身長：
体重：

ポジション：
クラス：　 /
初期配置：煉獄
行動値：8

■パーソナルデータ■

暗示：
[記憶のカケラ] 内容



[未練]　　 内容　　　 狂気度　　発狂時
たからもの への 依存　■■■□　幼児退行(最大行動値減少(-2))
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()


■強化値■
　　　　武装　変異　改造
ﾒｲﾝｸﾗｽ　　 0　　 0　　 0
ｻﾌﾞｸﾗｽ　　 0　　 0　　 0
ﾎﾞｰﾅｽ
寵愛
=合計=　　 0　　 0　　 0

■マニューバ■

[部位] マニューバ名: タイミング : コスト : 射程: 効果
[]　　かみつきあご : アクション : 2　　　: 0　 : 肉弾攻撃2
[]　　ほね　　　　 : アクション : 3　　　: 自身: 移動1
[]　　ゆがんだうで : オート　　 : なし　 : 自身: 肉弾攻撃マニューバの攻撃判定の出目+1
[]　　のうみそ　　 : オート　　 : なし　 : 自身: 最大行動値+2
[]　　はらわた　　 : オート　　 : なし　 : なし: なし


■その他■
寵愛点：0点
成長履歴：
No. 獲得寵愛点(達成/ﾎﾞｰﾅｽ/ﾋﾟﾝｿﾞﾛ)　メモ
0　　　　　0点(　　 /　　)
1　　　　　0点(　　 /　　)
2　　　　　0点(　　 /　　)


メモ：
他アンデッドの肉体組織を捕食するアンデッド。野生化したものも多い。
悪意2`;
});

document.getElementById("sampleBtnR").addEventListener("click", () => {
  document.querySelector('input[name="category"][value="r"]').checked = true;
  document.getElementById("input").value =
`タイトル：サンプルデータ＿ゾンビ
キャラクター名：ゾンビ

種族：
享年：
髪の色：　　 / 瞳の色：　　 / 肌の色：
身長：
体重：

ポジション：
クラス：　 /
初期配置：煉獄
行動値：8

■パーソナルデータ■

暗示：
[記憶のカケラ] 内容



[未練]　　 内容　　　 狂気度　　発狂時
たからもの への 依存　■■■□　幼児退行(最大行動値減少(-2))
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()
　　　　　 への　　　 ■■■□　()


■強化値■
　　　　武装　変異　改造
ﾒｲﾝｸﾗｽ　　 0　　 0　　 0
ｻﾌﾞｸﾗｽ　　 0　　 0　　 0
ﾎﾞｰﾅｽ
寵愛
=合計=　　 0　　 0　　 0

■マニューバ■

[部位] マニューバ名: タイミング : コスト : 射程: 効果
[]　　ひきさく　　 : アクション : 2　　　: 0　 : 肉弾攻撃1+連撃[同エリアのゾンビの数÷10]（切捨て）
[]　　よろめく　　 : アクション : 3　　　: 自身: 移動1
[]　　むらがる　　 : ラピッド　 : 0　　　: 0　 : 移動妨害1


■その他■
寵愛点：0点
成長履歴：
No. 獲得寵愛点(達成/ﾎﾞｰﾅｽ/ﾋﾟﾝｿﾞﾛ)　メモ
0　　　　　0点(　　 /　　)
1　　　　　0点(　　 /　　)
2　　　　　0点(　　 /　　)


メモ：`;
});


// ======== データ解析関数群 ==========

function loadData(lines) {
  const data = Array.from({ length: 7 }, () => []);
  let type = 0;
  for (const line of lines) {
    if (isSectionHeader(line)) type++;
    data[type].push(line);
  }
  //console.log(data);
  return data;
}

function isSectionHeader(line) {
  const a = [
    "■パーソナルデータ■","[未練]","■強化値■",
    "■マニューバ■","■その他■","メモ："
  ];
  for (let i = 0; i < a.length; i++) {
    if (line.includes(a[i])) {
      return true;}
  }
  return false;
}

function makeKekkaFromData(data) {
  initiative = 0;
  Name = "";
  memo = "";
  EachStatus = [];

  output0(data[0]);
  output1(data[1]);
  output2(data[2]);
  output3(data[3]);
  output4(data[4]);
  //console.log(maneuverList);
  output5(data[5]);
  output6(data[6]);

  return JSON.stringify({
    kind: "character",
    data: {
      name: Name,
      initiative: initiative,
      status: EachStatus,
      commands: Commands,
      memo: memo
    }
  }, null, 2);
}

// ======== 各出力関数 ==========

function output0(lines) {
  Name = lines[1].split("：")[1]?.trim() || "";
  memoTemp=lines[11]+"　最大"+lines[12] +"\n";
  //↑初期配置と最大行動値　手前に強化値を挟むからtemp
  initiative = parseInt(lines[12].split("：")[1]) || 0;
  
}

let memory = 0;//グローバル変数 記憶のカケラの数
function output1(lines) {
}

function output2(lines) {
}
function output2_def() { // 未練初期状態用
}
function emo(text) { // 未練の狂気点を数値化
}

function output3(lines) {
}

//output4は後ろにあるよ

function output5(lines) {
}

function output6(lines) {
}



let maneuverList = []; // ← 武器クラス置き場

function output4(lines) {//マニューバあれこれ
  for (let i = 3; i < lines.length - 2; i++) {
    let parts = lines[i].split(":");
    if (parts.length < 5) continue;
    let maneuver = parts[0].trim().split(/\s+/); // 部位 + マニューバ名
    let timing = parts[1].trim().split(/\s+/)[0];
    let cost = parts[2].trim().split(/\s+/)[0];
    let range = parts[3].trim().split(/\s+/)[0];
    let effect = parts[4];

    if (maneuver.length > 1) {
      // ▼ ここで CSV に一致するマニューバがあるか検索
      const matchedCSV = weaponDB.find(w => w["マニューバ名"] === maneuver[1]);
      let newData;
      if (matchedCSV) {
        // ====== CSV の値で完全に上書きする ======
        newData = new ManeuverData({
          sengen: matchedCSV["宣言"] === "1",
          roll: Number(matchedCSV["判定"]),
          attack: Number(matchedCSV["attack"]),
          assist: Number(matchedCSV["assist"]),
          diceA: Number(matchedCSV["出目+-"]),
          damageA: Number(matchedCSV["ダメ+-"]),
          part: returnPart(maneuver[0]),//部位は絶対保管所準拠
          nameM: matchedCSV["マニューバ名"],
          timing:matchedCSV["ﾀｲﾐﾝｸﾞ"],
          cost: matchedCSV["ｺｽﾄ"],
          range: matchedCSV["射程"],
          effect: matchedCSV["効果"],
          origin: "CSV"                 //  追加
        });
      } else {
        // ====== 通常処理（今まで通り） ======
        newData = new ManeuverData({
          part: returnPart(maneuver[0]),
          nameM: maneuver[1],
          timing: returnTiming(timing),
          cost: cost,
          range: range,
          effect: effect,
          origin: "TXT"                 //  手入力
        });
      }
      maneuverList.push(newData);
    }
  }
}



//==================================================
// 1. クラス定義
//==================================================
class ManeuverData {
  constructor({
    sengen = false,
    roll = 0,
    attack = 0,
    assist = 0,
    diceA = 0,
    damageA = 0,
    part = 0,
    nameM = "",
    timing = "",
    cost = "",
    range = "",
    effect = "",
    origin = "TXT"   //  追加（CSV / TXT）
  } = {}) {
    this.sengen = sengen;
    this.roll = roll;
    this.attack = attack;
    this.assist = assist;
    this.diceA = diceA;
    this.damageA = damageA;
    this.part = part;
    this.nameM = nameM;
    this.timing = timing;
    this.cost = cost;
    this.range = range;
    this.effect = effect;
    this.origin = origin;  //  追加
  }
}


// select の選択肢
const rollOptions = [
  { value: 0, label: "不要" },
  { value: 1, label: "na" },
  { value: 2, label: "nc" },
  { value: 3, label: "1d10" }
];
function returnRoll(value){
  if (value==1) return "na";
  if (value==2) return "nc";
  if (value==3) return "1d10";
  return "不要";
}
const attackOptions = [
  { value: 0, label: "非攻撃" },
  { value: 1, label: "肉弾" },
  { value: 2, label: "白兵" },
  { value: 3, label: "射撃" },
  { value: 4, label: "砲撃" }
];
const assistOptions = [
  { value: 0, label: "自身,非補助" },
  { value: 1, label: "肉弾" },
  { value: 2, label: "白兵" },
  { value: 3, label: "射撃" },
  { value: 4, label: "砲撃" },
  { value: 5, label: "すべて" },
  { value: 6, label: "肉弾・白兵" }
];
const partOptions=[
  { value: 0, label: "？" },
  { value: 1, label: "ポジ" },
  { value: 2, label: "クラス" },//メインサブ統合
  { value: 3, label: "頭" },
  { value: 4, label: "腕" },
  { value: 5, label: "胴" },
  { value: 6, label: "脚" }
];
function returnPart(text){
  if (text.includes("ポジション")) return 1;
  if (text.includes("メインクラス")) return 2;
  if (text.includes("サブクラス")) return 2;
  if (text.includes("頭")) return 3;
  if (text.includes("腕")) return 4;
  if (text.includes("胴")) return 5;
  if (text.includes("脚")) return 6;
  return 0;
}
const timingOptions=[
  { value: "Au", label: "ｵｰﾄ" },
  { value: "A", label: "ｱｸｼｮﾝ" },
  { value: "J", label: "ｼﾞｬｯｼﾞ" },
  { value: "D", label: "ﾀﾞﾒｰｼﾞ"},
  { value: "R", label: "ﾗﾋﾟｯﾄﾞ" }
];
function returnTiming(text){
  if (text.includes("オート")) return "Au";
  if (text.includes("アクション")) return "A";
  if (text.includes("ジャッジ")) return "J";
  if (text.includes("ダメージ")) return "D";
  if (text.includes("ラピッド")) return "R";
  return "Au";
}




function showManeuverTable(maneuverList) {
  const container = document.getElementById("maneuverTableContainer");
  container.innerHTML = "";

  // ------ テーブルの外枠 ------
  let html = `
    <button id="addRow">＋ 行追加</button>
	<p></p>
    <table class="maneuver-table" id="maneuverTable"
    style="border-collapse: collapse; font-size:14px;">
      <thead>
        <tr>
          <th>宣言</th>
          <th>判定</th>
          <th>攻撃種</th>
          <th>常時補助種</th>
          <th>出目+-</th>
          <th>ダメ+-</th>
          <th>部位</th>
          <th>マニューバ名</th>
          <th>ﾀｲﾐﾝｸﾞ</th>
          <th>ｺｽﾄ</th>
          <th>射程</th>
          <th>効果</th>
          <th>要編集</th> 
          <th>削除</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  `;

  container.innerHTML = html;
  const tbody = container.querySelector("tbody");

  // 入力で Enter 押したときリロードしない用
  function preventEnterReload(input) {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      }
    });
  }

  function createSelect(options, currentValue, onChange) {
  const select = document.createElement("select");
  options.forEach(opt => {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    if (opt.value === currentValue) o.selected = true;
    select.appendChild(o);
  });
  select.onchange = () => onChange(Number(select.value));
  return select;
  }

  // ------ 1行作る ------
function createRow(m) {
  const tr = document.createElement("tr");

  const fields = [
    "sengen","roll","attack","assist","diceA","damageA",
    "part","nameM","timing","cost","range","effect"
  ];

  fields.forEach(key => {
    const td = document.createElement("td");
    const addSelect = (options, valueKey = key) =>
      td.appendChild(createSelect(options, m[valueKey], v => m[valueKey] = v));

    if (typeof m[key] === "boolean") {
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = m[key];
      input.onchange = () => m[key] = input.checked;
      td.appendChild(input);
    }
    else if (key === "roll") addSelect(rollOptions);
    else if (key === "attack") addSelect(attackOptions);
    else if (key === "assist") addSelect(assistOptions);
    else if (key === "part") addSelect(partOptions);
    else if (key === "timing") addSelect(timingOptions, "timing");
    else {
      const input = document.createElement("input");
      // ---- ここが追加 ----
      if (key === "diceA" || key === "damageA") {
        input.type = "number";
        input.step = "1";             // 整数のみ
        input.value = Number(m[key]); // 数値として保持
        input.oninput = () => m[key] = Number(input.value || 0);
      } 
      // ---- 上記以外の text のまま ----
      else {
      input.type = "text";
      input.value = m[key];
      input.oninput = () => m[key] = input.value;
      }

    preventEnterReload(input);
    td.appendChild(input);
    }

    tr.appendChild(td);
  });

  // 由来
  const tdOrg = document.createElement("td");
  tdOrg.textContent = (m.origin === "CSV" ? "  " : "✏️");
  tr.appendChild(tdOrg);

  // 削除
  const tdDel = document.createElement("td");
  const btn = document.createElement("button");
  btn.textContent = "－";
  btn.onclick = () => {
    tr.remove();
    const index = maneuverList.indexOf(m);
    if (index >= 0) maneuverList.splice(index, 1);
  };
  tdDel.appendChild(btn);
  tr.appendChild(tdDel);


  tbody.appendChild(tr);
}


  // ------ 初期データを行にする ------
  maneuverList.forEach(m => createRow(m));

  // ------ 行追加ボタン ------
  const add = document.getElementById("addRow");
  add.addEventListener("click", () => {
    let newData = new ManeuverData();
    maneuverList.push(newData);
    createRow(newData);
  });
}

let weaponDB = [];
function loadWeaponCSV(csvText) {
  const lines = csvText.trim().split("\n");
  const header = lines[0].split(",");

  weaponDB = lines.slice(1).map(line => {
    const cols = line.split(",");
    let obj = {};
    header.forEach((key, i) => {
      obj[key.trim()] = cols[i]?.trim();
    });
    return obj;
  });
}


function summarizeAssist(maneuverList) {//補正値まとめコーナー
  const groups = {
    1: { assist: "肉弾", diceA: 0, damageA: 0, names: [] }, // 肉弾
    2: { assist: "白兵", diceA: 0, damageA: 0, names: [] }, // 白兵
    3: { assist: "射撃", diceA: 0, damageA: 0, names: [] }, // 射撃
    4: { assist: "砲撃", diceA: 0, damageA: 0, names: [] }, // 砲撃
  };

  maneuverList.forEach(m => {
    if (m.assist === 5) {//すべて
      for (let i = 1; i <= 4; i++) {
        groups[i].diceA += Number(m.diceA || 0);
        groups[i].damageA += Number(m.damageA || 0);
        groups[i].names.push(m.nameM);
      }
    }else if (m.assist === 6) {//肉弾・白兵
      for (let i = 1; i <= 2; i++) {
        groups[i].diceA += Number(m.diceA || 0);
        groups[i].damageA += Number(m.damageA || 0);
        groups[i].names.push(m.nameM);
      }
    }else if (m.assist !== 0) {
      groups[m.assist].diceA += Number(m.diceA || 0);
      groups[m.assist].damageA += Number(m.damageA || 0);
      groups[m.assist].names.push(m.nameM);
    }
  });

  return [groups[1], groups[2],groups[3], groups[4]];
}


function showAssistSummaryTable(maneuverList) {
  const summary = summarizeAssist(maneuverList);

  let html = `
    <table class="maneuver-table">
      <tr>
        <th>攻撃種</th>
        <th>計 出目+-</th>
        <th>計 ダメ+-</th>
        <th>マニューバ名</th>
      </tr>
  `;

  summary.forEach(s => {
    html += `
      <tr>
        <td>${s.assist}</td>
        <td>${s.diceA}</td>
        <td>${s.damageA}</td>
        <td>${s.names.join(",")}</td>
      </tr>
    `;
  });

  html += `</table>`;
  document.getElementById("assistSummaryContainer").innerHTML = html;
}


function enableAutoAssistSummaryUpdate() {
  const container = document.getElementById("maneuverTableContainer");
  container.addEventListener("input", () => {
    const list = readTableToList();   // 現在の表から最新データを読み取る
    showAssistSummaryTable(list);
  });
}




function readTableToList() {
  const rows = document.querySelectorAll("#maneuverTableContainer table tr");
  const result = [];

  rows.forEach((tr, idx) => {
    if (idx === 0) return; // ヘッダ行スキップ

    const tds = tr.querySelectorAll("td");
    if (tds.length < 12) return;

    const getVal = (i) => (tds[i].querySelector("input, select")?.value ?? "");
    const getBool = (i) => (tds[i].querySelector("input[type=checkbox]")?.checked ?? false);

    result.push(new ManeuverData({
      sengen: getBool(0),
      roll: Number(getVal(1)),
      attack: Number(getVal(2)),
      assist: Number(getVal(3)),
      diceA: Number(getVal(4)),
      damageA: Number(getVal(5)),
      part: Number(getVal(6)),
      nameM: getVal(7),
      timing: getVal(8),
      cost: getVal(9),
      range: getVal(10),
      effect: getVal(11),
      origin: tds[12].textContent === "??" ? "CSV" : "TXT"
    }));
  });

  return result;
}


function textOfSengen(m,yesno){//mはManeuverData yesnoが0だと対象表記絶対無し
  let target="";
  if(m.attack!==0 && yesno!==0){
    target="　対象[○○]";}
  return m.nameM+"】"+m.timing+"/"+m.cost+"/"+m.range+","+m.effect+target ;
}

function textOfRoll_A(m){//mはManeuverData
  const summary = summarizeAssist(maneuverList);
  let diceA="";//補正値
  let damageA="";
  let helpM="";
  if(m.roll===1){//naじゃなきゃ補正は考えない
    const data=summary[m.attack-1];
    //console.log(data);
    if(m.assist===0)data.diceA+=Number(m.diceA);
    if(data.diceA>0){diceA="+"+data.diceA;}//出目補正
    if(data.diceA<0){diceA=String(data.diceA);}
    if(data.damageA>0){damageA="(+"+data.damageA+"ダメ)";}//ダメ補正
    if(data.damageA<0){damageA="(" +data.damageA+"ダメ)";}
    if(data.names.length>0){helpM="(+"+data.names.join(",") +")";}
  }
  return returnRoll(m.roll) +diceA +" "+m.nameM+"】"+m.effect+damageA+helpM;
}

