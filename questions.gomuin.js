/*
 * はんこ屋ぶんちゃん ヒアリングシート — 質問セット「ゴム印」v2（2026-11-17）
 * v1.1からの変更（社長 2026-11-17「具体的にして注文率を上げたい」「目安の値段は出していい」）：
 *   ① 使い道から選ぶ形に（のべ板・プラ台・T角などの店の言葉はヒントに回す）
 *   ② どの選択肢にも目安の売値（税込）を出し、最後に目安金額×個数を出す
 *   ③ 印面の文字を欄ごとに入力（会社名・住所・電話…）。写真で送る道も用意
 *   ④ 最後に「作ってほしい／まず金額／店で相談」を聞く
 * 売値の正本＝HQ projects/hanko-bunchan/価格表_ゴム印_v1.md（見積アプリと同じ計算で代表サイズを出した値）。
 * ★ここには売値（税込）だけを書く。原価は絶対に書かない（公開リポジトリ）。
 */
(function () {
  'use strict';

  // ---- 目安の売値（税込）。[小, 中, 大] の順。耐油は oil に別記（無いものは赤ゴムの2倍）----
  var P = {
    addr: { // 住所印 小＝約50×15・中＝約60×20・大＝約70×30
      ac:    { name: '透明の持ち手つき（プラ台）', red: [2860, 3300, 3850] },
      nobe:  { name: '台なしのゴム板（のべ板）', red: [2090, 2750, 3630] },
      kumi:  { name: '組み替えられるアドレス印', red: [1650, 1650, 1650] },
      shiny: { name: 'インク内蔵タイプ', red: [2200, 4400, 5500], noOil: true },
    },
    name: { // 氏名印 約30〜40×6（文字数で変わる）
      nobe: { name: '台なしのゴム板（のべ板）', red: [[440, 550]] },
      cb:   { name: '色つきの台（カラー台）', red: [[660, 880]] },
      ac:   { name: '透明の持ち手つき（プラ台）', red: [[1760, 1980]] },
    },
    kaku: { // 小＝約15mm・中＝約20〜25mm・大＝約30〜40mm
      t:    { name: '黒い持ち手つき（T角・T丸）', red: [3080, [3190, 3630], [4180, 4730]], oil: [4620, [4950, 5940], [8250, 9240]] },
      ac:   { name: '透明の持ち手つき（プラ台）', red: [1760, [1980, 2090], [2200, 2750]] },
      nobe: { name: '台なしのゴム板（のべ板）', red: [880, [1210, 1320], [1430, 2420]] },
    },
    date: { // サンビー データー印 完成品
      d: { name: 'データー印', red: [[2640, 2750], [2750, 3410], [3630, 4730]], noOil: true },
    },
    free: { // フリーメイト（合わせ版）
      f: { name: 'フリーメイト', red: [1320, 1320, 1320] },
    },
  };

  function yen(n) { return n.toLocaleString('ja-JP') + '円'; }
  function rng(v) { return Array.isArray(v) ? v : [v, v]; }
  function rngText(v) { var r = rng(v); return r[0] === r[1] ? yen(r[0]) : yen(r[0]) + '〜' + yen(r[1]); }
  function minOf(t) { var m = Infinity; Object.keys(t).forEach(function (k) { t[k].red.forEach(function (v) { m = Math.min(m, rng(v)[0]); }); }); return m; }
  function span(item) { // その形の全サイズの幅
    var lo = Infinity, hi = 0;
    item.red.forEach(function (v) { var r = rng(v); lo = Math.min(lo, r[0]); hi = Math.max(hi, r[1]); });
    return lo === hi ? yen(lo) : yen(lo) + '〜' + yen(hi);
  }

  function use(a) { return a.G1 && a.G1.val; }
  function form(a) {
    var u = use(a);
    if (u === 'addr') return (a.G2 && a.G2.val !== 'omakase') ? a.G2.val : 'ac';
    if (u === 'name') return (a.G3 && a.G3.val !== 'omakase') ? a.G3.val : 'nobe';
    if (u === 'kaku') return (a.G4 && a.G4.val !== 'omakase') ? a.G4.val : 't';
    if (u === 'date') return 'd';
    if (u === 'free') return 'f';
    return null;
  }
  function sizeIdx(a) {
    var u = use(a), q = u === 'addr' ? a.G6 : u === 'kaku' ? a.G7 : u === 'date' ? a.G8 : null;
    if (u === 'name' || u === 'free') return 0;
    return q && typeof q.val === 'number' ? q.val : 1; // 分からない＝中
  }
  function sizeHint(u, i) {
    return function (a) {
      var f = form(a); if (!f || !P[u][f]) return '';
      return '目安 ' + rngText(P[u][f].red[i]);
    };
  }
  var hasGum = function (a) {
    var u = use(a); if (!u || u === 'other' || u === 'date') return false;
    var f = form(a); return !(P[u][f] && P[u][f].noOil);
  };
  function isTyped(a) { return a.G12 && a.G12.val === 'type'; }

  // ---- 印面の欄（使い道ごと）----
  var FIELDS = {
    addr: [
      { key: 'company', label: '会社名・屋号', placeholder: '例）有限会社ぶんちゃん' },
      { key: 'zip', label: '郵便番号・住所', placeholder: '例）〒963-8004 郡山市中町1-2-3', multiline: true },
      { key: 'tel', label: '電話番号', placeholder: '例）024-000-0000', inputmode: 'tel' },
      { key: 'fax', label: 'FAX', placeholder: '例）024-000-0001', inputmode: 'tel' },
      { key: 'more', label: 'そのほか入れたい文字', placeholder: '例）代表取締役 山田太郎／メール・URL など', multiline: true },
    ],
    name: [
      { key: 'name', label: '入れるお名前', placeholder: '例）山田' },
    ],
    kaku: [
      { key: 'text', label: '彫る文字', placeholder: '例）済／検印／株式会社ぶんちゃん之印', multiline: true },
    ],
    date: [
      { key: 'top', label: '日付の上に入れる文字', placeholder: '例）ぶんちゃん商店' },
      { key: 'bottom', label: '日付の下に入れる文字', placeholder: '例）受付／山田' },
    ],
    free: [
      { key: 'lines', label: '入れたい文字（1段ずつ改行）', placeholder: '例）\n営業部\n山田太郎', multiline: true },
    ],
    other: [
      { key: 'what', label: '作りたいもの・使い道', placeholder: '例）お店のロゴのハンコをポイントカードに押したい', multiline: true },
    ],
  };
  var NEED = { addr: ['company', 'zip', 'tel'], name: ['name'], kaku: ['text'], date: ['top', 'bottom'], free: ['lines'], other: ['what'] };

  var Q = [
    {
      id: 'G1', round: 'ご相談内容', sum: '使い道',
      title: 'どんなハンコを作りたいですか？',
      options: [
        { label: '住所・会社名のハンコ', val: 'addr', hint: '封筒・請求書・領収書に／目安 ' + yen(minOf(P.addr)) + '〜' },
        { label: 'お名前のハンコ（氏名印）', val: 'name', hint: '書類の名前欄に／目安 ' + yen(minOf(P.name)) + '〜' },
        { label: '四角・丸のハンコ', val: 'kaku', hint: '社印・検印・「済」・ロゴなど／目安 ' + yen(minOf(P.kaku)) + '〜' },
        { label: '日付が変えられるハンコ（データー印）', val: 'date', hint: '受付印・検収印など／目安 ' + yen(minOf(P.date)) + '〜' },
        { label: '文字を差し替えて使うハンコ（フリーメイト）', val: 'free', hint: '担当者名や部署を入れ替えたい／目安 ' + yen(minOf(P.free)) + '〜' },
        { label: 'その他・分からない', val: 'other', hint: '使い道を伺ってご提案します' },
      ],
    },

    // ---- 形（使い道ごと）----
    {
      id: 'G2', round: '形', sum: '形', showIf: function (a) { return use(a) === 'addr'; },
      title: 'どの形にしますか？',
      options: [
        { label: P.addr.ac.name, val: 'ac', hint: 'いちばん人気・押しやすい／目安 ' + span(P.addr.ac) },
        { label: P.addr.nobe.name, val: 'nobe', hint: 'お手持ちの台に貼る・お手頃／目安 ' + span(P.addr.nobe) },
        { label: P.addr.kumi.name, val: 'kumi', hint: '住所だけ・電話だけなど行ごとに押し分け／目安 ' + span(P.addr.kumi) },
        { label: P.addr.shiny.name, val: 'shiny', hint: 'スタンプ台いらず／目安 ' + span(P.addr.shiny) },
        { label: 'おまかせ', val: 'omakase', hint: 'お店のおすすめ（プラ台）でご提案します' },
      ],
    },
    {
      id: 'G3', round: '形', sum: '形', showIf: function (a) { return use(a) === 'name'; },
      title: 'どの形にしますか？',
      options: [
        { label: P.name.nobe.name, val: 'nobe', hint: 'お手頃／目安 ' + span(P.name.nobe) },
        { label: P.name.cb.name, val: 'cb', hint: '7色から選べます／目安 ' + span(P.name.cb) },
        { label: P.name.ac.name, val: 'ac', hint: '押しやすい／目安 ' + span(P.name.ac) },
        { label: 'おまかせ', val: 'omakase', hint: 'お店のおすすめでご提案します' },
      ],
    },
    {
      id: 'G4', round: '形', sum: '形', showIf: function (a) { return use(a) === 'kaku'; },
      title: 'どの形にしますか？',
      options: [
        { label: P.kaku.t.name, val: 't', hint: 'しっかり押せる定番／目安 ' + span(P.kaku.t) },
        { label: P.kaku.ac.name, val: 'ac', hint: '押す位置が見える／目安 ' + span(P.kaku.ac) },
        { label: P.kaku.nobe.name, val: 'nobe', hint: 'お手頃／目安 ' + span(P.kaku.nobe) },
        { label: 'おまかせ', val: 'omakase', hint: 'お店のおすすめでご提案します' },
      ],
    },
    {
      id: 'G5', round: '形', sum: '形', showIf: function (a) { return use(a) === 'date'; },
      title: '外側の形は？',
      options: [
        { label: '丸' }, { label: '四角' }, { label: '小判形（たて長の丸）' }, { label: 'おまかせ' },
      ],
    },

    // ---- 大きさ ----
    {
      id: 'G6', round: '大きさ', sum: '大きさ',
      showIf: function (a) { return use(a) === 'addr' && form(a) !== 'kumi'; },
      title: '大きさは？',
      note: '迷ったら「標準」がおすすめです。',
      options: [
        { label: '小さめ（2行くらい・約50×15mm）', val: 0, hint: sizeHint('addr', 0) },
        { label: '標準（3行くらい・約60×20mm）', val: 1, hint: function (a) { return '封筒・請求書でいちばん多い大きさ／' + sizeHint('addr', 1)(a); } },
        { label: '大きめ（4〜5行・約70×30mm）', val: 2, hint: sizeHint('addr', 2) },
        { label: '分からない', val: 1, hint: '標準の大きさでご提案します' },
      ],
    },
    {
      id: 'G7', round: '大きさ', sum: '大きさ', showIf: function (a) { return use(a) === 'kaku'; },
      title: '大きさは？',
      options: [
        { label: '小さめ（約15mm）', val: 0, hint: sizeHint('kaku', 0) },
        { label: '中くらい（約20〜25mm）', val: 1, hint: sizeHint('kaku', 1) },
        { label: '大きめ（約30〜40mm）', val: 2, hint: sizeHint('kaku', 2) },
        { label: '分からない', val: 1, hint: '使い道に合わせてご提案します' },
      ],
    },
    {
      id: 'G8', round: '大きさ', sum: '大きさ', showIf: function (a) { return use(a) === 'date'; },
      title: '大きさは？',
      options: [
        { label: '小さめ（約12〜16mm）', val: 0, hint: sizeHint('date', 0) },
        { label: '中くらい（約17〜25mm）', val: 1, hint: sizeHint('date', 1) },
        { label: '大きめ（約26mm以上）', val: 2, hint: sizeHint('date', 2) },
        { label: '分からない', val: 1, hint: '使い道に合わせてご提案します' },
      ],
    },
    {
      id: 'G9', round: '種類別のご確認', sum: '日付の表示形式', showIf: function (a) { return use(a) === 'date'; },
      title: '日付の表示は？',
      options: [
        { label: '西暦（例 2026.11.17）' },
        { label: '和暦（例 R8.11.17）' },
        { label: 'おまかせ' },
      ],
    },
    {
      id: 'G10', round: '種類別のご確認', sum: '段数', showIf: function (a) { return use(a) === 'free'; },
      title: '何段にしますか？',
      options: [
        { label: '2段' }, { label: '3段' }, { label: '4段' }, { label: '分からない（相談したい）' },
      ],
    },
    {
      id: 'G11', round: '仕様', sum: 'ゴム', showIf: hasGum,
      title: 'どのインクで押しますか？',
      options: [
        { label: 'ふつうのスタンプ台（赤ゴム）', val: 'red', hint: 'ほとんどの方はこちら' },
        { label: '油性インク（耐油ゴム）', val: 'oil', hint: 'ダンボール・ビニールなどに押す方向け／目安の金額が約2倍になります' },
        { label: '分からない', val: 'red', hint: 'ふつうのスタンプ台でご提案します' },
      ],
    },

    // ---- 印面の文字 ----
    {
      id: 'G12', round: '印面に入れる文字', sum: '文字の伝え方',
      title: 'ハンコに入れる文字はどう伝えますか？',
      options: [
        { label: 'ここで入力する', val: 'type', hint: '1〜2分で終わります' },
        { label: '名刺や今のハンコの写真をLINEで送る', val: 'photo', hint: '入力はしなくて大丈夫です' },
      ],
    },
    {
      id: 'G13', round: '印面に入れる文字', sum: '印面の文字', type: 'fields', showIf: isTyped,
      title: 'ハンコに入れる文字を入れてください',
      note: '入れたい文字だけで大丈夫です。並び順や改行は、お店で見やすく整えます。',
      fields: function (a) { return FIELDS[use(a)] || FIELDS.other; },
      needAny: function (a) { return NEED[use(a)] || NEED.other; },
      needHint: '少なくとも1つ入れてください（写真で送る場合は「戻る」で選び直せます）',
    },
    {
      id: 'G14', round: '印面に入れる文字', sum: '書き方', showIf: function (a) { return use(a) === 'addr'; },
      title: '横書き・縦書きは？',
      options: [{ label: '横書き' }, { label: '縦書き' }, { label: 'おまかせ' }],
    },
    {
      id: 'G15', round: '仕様', sum: '書体', showIf: function (a) { return use(a) !== 'date'; },
      title: '書体はどれがよいですか？',
      options: [
        { label: 'おまかせ', hint: '使い道に合わせてお店が選びます' },
        { label: 'ゴシック', hint: 'はっきり読みやすい' },
        { label: '明朝', hint: 'きちんとした印象' },
        { label: '楷書', hint: '手書きのような和の印象' },
        { label: '丸ゴシック', hint: 'やわらかい印象' },
        { label: '行書' }, { label: '隷書' }, { label: '古印体' },
      ],
    },

    // ---- 個数・納期・ご意向 ----
    {
      id: 'G16', round: '仕様', sum: '個数', type: 'text',
      title: '必要な個数',
      placeholder: '例）1',
      inputmode: 'numeric',
    },
    {
      id: 'G17', round: '納期', sum: '納期', type: 'text', optional: true,
      title: 'ご希望の納期（あれば）',
      placeholder: '例）11/30まで／なるべく早く など',
    },
    {
      id: 'G18', round: 'ご意向', sum: 'ご意向',
      title: 'このあと、どうしたいですか？',
      options: [
        { label: 'この内容で作ってほしい', val: 'order', hint: '金額が目安どおりなら、確認のあと制作に入ります' },
        { label: 'まず正式な金額を知りたい', val: 'quote' },
        { label: 'お店で相談したい', val: 'visit' },
      ],
    },
  ];

  function qty(a) {
    var s = String(a.G16 || '1').replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); });
    var n = parseInt(s.replace(/[^0-9]/g, ''), 10);
    return n > 0 ? n : 1;
  }

  function estimate(a, visible) {
    var u = use(a);
    if (!u || u === 'other') {
      return { total: '内容を伺ってからお知らせします', lines: [], note: '写真や使い道を伺って、合うものと金額をご提案します。' };
    }
    var f = form(a), item = P[u][f];
    if (!item) return null;
    var i = sizeIdx(a);
    var oil = visible('G11') && a.G11 && a.G11.val === 'oil';
    var unit = rng(item.red[i] != null ? item.red[i] : item.red[0]);
    if (oil) unit = item.oil ? rng(item.oil[i]) : [unit[0] * 2, unit[1] * 2];
    var n = qty(a);
    var formQ = { addr: 'G2', name: 'G3', kaku: 'G4' }[u];
    var parts = [item.name + (formQ && a[formQ] && a[formQ].val === 'omakase' ? '（おまかせの例）' : '')];
    var sizeQ = u === 'addr' ? 'G6' : u === 'kaku' ? 'G7' : u === 'date' ? 'G8' : null;
    if (sizeQ && visible(sizeQ) && a[sizeQ]) {
      var sl = a[sizeQ].label.replace(/（.*$/, '');
      parts.push(sl === '分からない' ? (u === 'addr' ? '標準の大きさで計算' : '中くらいで計算') : sl);
    }
    if (visible('G11')) parts.push(oil ? '耐油ゴム' : '赤ゴム');
    var total = unit[0] === unit[1] ? yen(unit[0] * n) : yen(unit[0] * n) + '〜' + yen(unit[1] * n);
    return {
      total: total + '（税込）',
      lines: [parts.join('・') + '：' + rngText(unit) + ' × ' + n + '個'],
      note: '目安です。文字の量・大きさ・持ち手の変更などで変わることがあります。正式な金額は内容を確認してお店からお知らせします。',
    };
  }

  window.HEARING_SETS = window.HEARING_SETS || {};
  window.HEARING_SETS['gomuin'] = {
    meta: { key: 'gomuin', label: 'ゴム印', ver: 'v2', title: 'ゴム印ヒアリング' },
    questions: Q,
    estimate: estimate,
    afterNotes: function (a) {
      var n = [];
      if (a.G12 && a.G12.val === 'photo') n.push('送ったあと、続けてLINEのトークに名刺や今のハンコの写真を送ってください。写真が届いたら印面をお作りします。');
      if (use(a) === 'kaku' || use(a) === 'other') n.push('ロゴや絵を入れる場合は、その画像もLINEで送ってください。');
      return n;
    },
    flow: [
      '下の「LINEで送る」で、この内容をお店に送る',
      'お店から正式な金額と納期をご連絡します',
      'OKをいただいたら制作に入ります',
      'できあがったら、お店でお受け取りください',
    ],
  };
})();
