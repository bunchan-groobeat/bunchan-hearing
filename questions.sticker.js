/*
 * はんこ屋ぶんちゃん ヒアリングシート — 質問セット「ステッカー」v1（第2便・§3-4）
 * 共通型（データ分岐・NG・C・宣言）。アップロードは案内文(note)。宣言は本番文面（2026-07-20 社長確定）。
 */
(function () {
  'use strict';
  var Q = [
    { id: 'S1', round: 'ご相談内容', sum: 'ご依頼区分', title: 'ご依頼の種類は？',
      options: [
        { label: '新しくデザインする', val: 'new' },
        { label: '仕上がりデータを持っている（入稿）', val: 'data' },
        { label: '前回と同じ・リピート', val: 'repeat' },
      ] },
    { id: 'S2', round: 'デザイン', sum: '避けたいこと', type: 'text', optional: true, showIf: isNew,
      title: 'これだけは避けたい、はありますか？（任意）', placeholder: '任意' },
    { id: 'S3', round: 'データ入稿', type: 'note', showIf: isData,
      title: '仕上がりデータの送付', body: '印刷用データ（ai / PDF / 画像など）は、受付後にLINE・メールでお送りください。' },
    { id: 'S4', round: 'リピート', sum: 'リピート内容', showIf: isRepeat,
      title: '前回からの変更は？',
      options: [{ label: '前回とまったく同じ', val: 'same' }, { label: '一部変更あり', val: 'change' }] },
    { id: 'S5', round: 'リピート', sum: '変更点', type: 'text', multiline: true, title: '変更したい点',
      placeholder: '例）サイズだけ変更／枚数変更 など',
      showIf: function (a) { return isRepeat(a) && a.S4 && a.S4.val === 'change'; } },

    { id: 'S6', round: '仕様', sum: '用途', multi: true, note: '複数選べます',
      title: 'どこに貼りますか？',
      options: [
        { label: '屋内' },
        { label: '屋外' },
        { label: '車に貼る' },
      ] },
    { id: 'S7', round: '仕様', sum: 'サイズ', title: 'サイズ',
      options: [
        { label: '50mm角くらい' },
        { label: '100mm角くらい' },
        { label: 'おまかせ' },
      ] },
    { id: 'S8', round: '仕様', sum: 'サイズ補足', type: 'text', optional: true,
      title: 'その他サイズ・寸法の指定があれば（任意）', placeholder: '例）長方形 60×30mm など' },
    { id: 'S9', round: '仕様', sum: '形状', title: '形状',
      options: [
        { label: '四角' },
        { label: '丸' },
        { label: '型抜きカット（フチに沿って）' },
      ] },
    { id: 'S10', round: '仕様', sum: '素材', title: '素材',
      options: [
        { label: '白' },
        { label: '透明' },
        { label: 'マット' },
        { label: 'おまかせ' },
      ] },
    { id: 'S11', round: '仕様', sum: 'ラミネート', title: 'ラミネート（表面保護）',
      note: '屋外・車には推奨です。',
      options: [
        { label: 'なし' },
        { label: '艶あり' },
        { label: '艶なし（マット）' },
      ] },
    { id: 'S12', round: '仕様', sum: '数量', type: 'text', title: '数量', placeholder: '例）50枚', inputmode: 'numeric' },
    { id: 'S13', round: '納期', sum: '納期', title: 'お急ぎ度',
      options: [
        { label: '特急（できるだけ早く）' },
        { label: '通常' },
        { label: 'ゆっくりでOK' },
      ] },
    { id: 'S14', round: '納期', sum: '希望日', type: 'text', optional: true, title: 'ご希望日があれば（任意）', placeholder: '例）7/28まで' },

    { id: 'S15', round: 'お客様情報', sum: 'お客様のお名前', type: 'text', title: 'ご記入者のお名前', placeholder: 'ご記入ください' },
    { id: 'S16', round: 'お客様情報', sum: '会社名・屋号', type: 'text', optional: true, title: '会社名・屋号（任意）', placeholder: 'あれば' },
    { id: 'S17', round: 'お客様情報', sum: 'ご希望の連絡手段', title: 'ご連絡はどの方法がよいですか？',
      options: [{ label: '電話' }, { label: 'LINE' }, { label: 'メール' }] },
    { id: 'S18', round: 'お客様情報', sum: 'ご連絡先', type: 'text', title: 'ご連絡先', placeholder: '電話番号／LINE ID／メールアドレス' },
    { id: 'S19', round: '素材', type: 'note', title: '素材について',
      body: 'ロゴやデザインの素材は、受付後にLINE・メールでお送りいただけます。今お手元になくても大丈夫です。' },
    { id: 'S20', round: 'ご確認', type: 'confirm', title: '最後にご確認ください',
      body: [
        'このフォームの送信はご注文の確定ではありません。内容を確認のうえ、お店からご連絡いたします。',
        'このシートでは金額は表示されません。サイトに載っている価格は目安で、お見積りは内容を確認してからお出しします。',
        'いただいた内容を、ご相談の目的以外に使うことはありません。',
      ], checkLabel: '上記を確認しました' },
  ];

  function isNew(a) { return a.S1 && a.S1.val === 'new'; }
  function isData(a) { return a.S1 && a.S1.val === 'data'; }
  function isRepeat(a) { return a.S1 && a.S1.val === 'repeat'; }

  window.HEARING_SETS = window.HEARING_SETS || {};
  window.HEARING_SETS['sticker'] = { meta: { key: 'sticker', label: 'ステッカー', title: 'ステッカー ヒアリング' }, questions: Q };
})();
