/*
 * はんこ屋ぶんちゃん ヒアリングシート — 質問セット「その他」v1.0
 * 8品目のどれにも当てはまらない相談、または品目を決めかねている方の受け皿。
 * 品目が決まっていないので選択肢は最小限にし、自由記述で受ける。
 * エンジン(index.html)の共通契約：{ meta, questions[] } を HEARING_SETS['sonota'] へ登録するだけ。
 */
(function () {
  'use strict';

  var Q = [
    {
      id: 'S1', round: 'ご相談内容', sum: 'つくりたいもの', type: 'text', multiline: true,
      title: 'どんなものをお作りしたいですか？',
      placeholder: '例）表彰用の楯／封筒に押す大きめのゴム印／お店で使う伝票 など。決まっていなければ「相談したい」でも大丈夫です',
    },
    {
      id: 'S2', round: 'ご相談内容', sum: '使う場面', type: 'text', optional: true,
      title: '何に使うものですか？（任意）',
      placeholder: '例）店頭で使う／お客様に配る／社内で使う など',
    },
    {
      id: 'S3', round: 'ご相談内容', sum: 'ご相談の段階',
      title: 'いまどの段階ですか？',
      options: [
        { label: '作るものが決まっている（見積りがほしい）', val: 'fixed' },
        { label: 'だいたい決まっているが相談したい', val: 'almost' },
        { label: 'まだ何も決まっていない（一から相談したい）', val: 'open' },
      ],
    },

    // ---- 仕様（分かる範囲で）----
    {
      id: 'S4', round: '仕様', sum: '数量', type: 'text', optional: true,
      title: '必要な数量（分かれば）',
      placeholder: '例）1個／50枚／未定',
    },
    {
      id: 'S5', round: '仕様', sum: 'サイズ・仕様', type: 'text', optional: true,
      title: 'サイズや仕様のご希望（任意）',
      placeholder: '例）A4くらい／横幅1m／素材は布 など。分からなければ空欄でOK',
    },
    {
      id: 'S6', round: '仕様', sum: '参考にしたいもの',
      title: '参考になるものはお手元にありますか？',
      options: [
        { label: '写真やURLがある' },
        { label: '現物がある（お持ちいただける）' },
        { label: '手描きのイメージがある' },
        { label: '特にない（一から相談したい）' },
      ],
    },

    // ---- 納期・予算 ----
    {
      id: 'S7', round: '納期・ご予算', sum: '納期', type: 'text', optional: true,
      title: 'ご希望の納期（あれば）',
      placeholder: '例）9/10まで／なるべく早く など',
    },
    {
      id: 'S8', round: '納期・ご予算', sum: 'ご予算', type: 'text', optional: true,
      title: 'ご予算の目安（任意）',
      placeholder: '例）1万円くらい／まずは相場が知りたい',
    },

    // ---- お客様情報 ----
    { id: 'S9', round: 'お客様情報', sum: 'お客様のお名前', type: 'text', title: 'ご記入者のお名前', placeholder: 'ご記入ください' },
    { id: 'S10', round: 'お客様情報', sum: '会社名・屋号', type: 'text', optional: true, title: '会社名・屋号（任意）', placeholder: 'あれば' },
    {
      id: 'S11', round: 'お客様情報', sum: 'ご希望の連絡手段', title: 'ご連絡はどの方法がよいですか？',
      options: [{ label: '電話' }, { label: 'LINE' }, { label: 'メール' }],
    },
    { id: 'S12', round: 'お客様情報', sum: 'ご連絡先', type: 'text', title: 'ご連絡先', placeholder: '電話番号／LINE ID／メールアドレス' },

    // ---- 素材・確認 ----
    {
      id: 'S13', round: '素材', type: 'note', title: '素材・原稿について',
      body: 'ロゴ・写真・原稿などの素材は、受付後にLINE・メールでお送りいただけます。今お手元になくても大丈夫です。',
    },
    {
      id: 'S14', round: 'ご確認', type: 'confirm', title: '最後にご確認ください',
      body: [
        'このフォームの送信はご注文の確定ではありません。内容を確認のうえ、お店からご連絡いたします。',
        'このシートでは金額は表示されません。サイトに載っている価格は目安で、お見積りは内容を確認してからお出しします。',
        '内容によってはお受けできない場合や、協力会社をご紹介する場合があります。',
        'いただいた内容を、ご相談の目的以外に使うことはありません。',
      ],
      checkLabel: '上記を確認しました',
    },
  ];

  window.HEARING_SETS = window.HEARING_SETS || {};
  window.HEARING_SETS['sonota'] = { meta: { key: 'sonota', label: 'その他', title: 'その他のご相談' }, questions: Q };
})();
