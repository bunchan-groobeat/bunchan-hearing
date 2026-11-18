/*
 * はんこ屋ぶんちゃん ヒアリングシート — 質問セット「印鑑」v1
 * 指示書§3-11準拠。個人/法人で分岐、法人3点セットはサイズ3本を連続表示。
 * C＝お客様情報＋やらないこと宣言のみ（素材送付・データ分岐・NGは非搭載）。
 * やらないこと宣言の文面は本番文面（2026-07-20 社長確定・全種目同文）。
 */
(function () {
  'use strict';

  var Q = [
    {
      id: 'I1', round: 'ご相談内容', sum: '種別',
      title: '個人の印鑑ですか？ 会社の印鑑ですか？',
      options: [
        { label: '個人印（実印・銀行印・認印）', val: 'personal' },
        { label: '法人印（会社の印鑑）', val: 'corp' },
      ],
    },

    // ===== 個人ルート =====
    {
      id: 'I2', round: '個人印', sum: '種類', showIf: isP,
      title: '種類はどれですか？',
      options: [
        { label: '実印（役所に登録する印）' },
        { label: '銀行印' },
        { label: '認印（普段使い）' },
      ],
    },
    {
      id: 'I3', round: '個人印', sum: '彫刻する名前', type: 'text', showIf: isP,
      title: '彫刻するお名前',
      placeholder: '例）山田太郎',
    },
    {
      id: 'I4', round: '個人印', sum: '彫り方', showIf: isP,
      title: '彫り方',
      options: [
        { label: 'フルネーム' },
        { label: '名字のみ' },
        { label: '名前のみ' },
      ],
    },
    // 認印はラクトのお値段を出す（2026-11-18 社長「10ミリ600円・12ミリ1,100円 税別」）
    {
      id: 'I5L', round: '個人印', sum: '材質・サイズ', showIf: isMitome,
      title: '認印はラクト（認印用の素材）がおすすめです',
      note: 'お値段は税別です。',
      options: [
        { label: 'ラクト 10mm　600円', val: 'l10' },
        { label: 'ラクト 12mm　1,100円', val: 'l12' },
        { label: 'ほかの材質・サイズにしたい', val: 'other' },
      ],
    },
    {
      id: 'I5', round: '個人印', sum: 'サイズ', showIf: function (a) { return isP(a) && !isLacto(a); },
      title: 'サイズ',
      note: '実印は15mm以上が一般的です。',
      options: [
        { label: '10.5mm' },
        { label: '12.0mm' },
        { label: '13.5mm' },
        { label: '15.0mm' },
        { label: '16.5mm' },
        { label: '18.0mm' },
      ],
    },

    // ===== 法人ルート =====
    {
      id: 'I6', round: '法人印', sum: '種類', showIf: isC,
      title: 'どの印鑑ですか？',
      options: [
        { label: '3点セット（代表印＋銀行印＋角印）', val: 'set' },
        { label: '代表印（丸印）', val: 'rep' },
        { label: '法人銀行印', val: 'bank' },
        { label: '角印（社印）', val: 'kaku' },
      ],
    },
    {
      id: 'I7', round: '法人印', sum: '彫刻内容', type: 'text', multiline: true, showIf: isC,
      title: '彫刻する内容',
      note: '会社名＋中文字（代表取締役印・銀行之印 など）。角印は「之印」の有無もお書きください。',
      placeholder: '例）\n有限会社ぶんちゃん\n代表取締役印',
    },
    // 3点セット：サイズを3本連続で
    {
      id: 'I8', round: '法人印（3点セット）', sum: '代表印サイズ', showIf: isSet,
      title: '① 代表印のサイズ',
      options: [{ label: '16.5mm' }, { label: '18.0mm' }],
    },
    {
      id: 'I9', round: '法人印（3点セット）', sum: '銀行印サイズ', showIf: isSet,
      title: '② 銀行印のサイズ',
      options: [{ label: '16.5mm' }, { label: '18.0mm' }],
    },
    {
      id: 'I10', round: '法人印（3点セット）', sum: '角印サイズ', showIf: isSet,
      title: '③ 角印のサイズ',
      options: [{ label: '21.0mm' }, { label: '24.0mm' }],
    },
    // 法人・単体（3点セット以外）
    {
      id: 'I11', round: '法人印', sum: 'サイズ', type: 'text', showIf: isCorpSingle,
      title: 'ご希望サイズ（分かる範囲でOK）',
      note: '目安：代表印 16.5/18mm・法人銀行印 16.5/18mm・角印 21/24mm',
      placeholder: '例）18mm',
    },

    // ===== 共通 =====
    {
      id: 'I12', round: 'ご希望', sum: '書体',
      title: '書体',
      note: '実印・銀行印は、偽造されにくい篆書・印相体がおすすめです。（3点セットは3本共通で1回選択）',
      options: [
        { label: '篆書（てんしょ）' },
        { label: '印相体（吉相体）' },
        { label: '古印体' },
        { label: '隷書' },
        { label: '楷書' },
        { label: '行書' },
      ],
    },
    {
      id: 'I13', round: 'ご希望', sum: '材質', showIf: function (a) { return !isLacto(a); },
      title: '材質',
      note: '3点セットは3本共通で1回選択（変えたい場合は最後の連絡先欄で一言添えてください）。',
      options: [
        { label: '薩摩本柘植（さつまほんつげ）' },
        { label: 'アグニ' },
        { label: 'アグニブラック' },
        { label: '黒水牛' },
        { label: '天然黒水牛' },
        { label: '牛角（色）' },
        { label: '牛角（白）' },
        { label: 'チタン' },
        { label: '象牙' },
      ],
    },
    {
      id: 'I14', round: 'ご希望', sum: 'ケース',
      title: '印鑑ケースは？',
      options: [
        { label: 'つける' },
        { label: 'なし' },
      ],
    },
    {
      id: 'I15', round: '納期', sum: '納期', type: 'text', optional: true,
      title: 'ご希望の納期（あれば）',
      placeholder: '例）7/25まで／なるべく早く など',
    },

    // ===== お客様情報 ＋ 宣言 =====
    {
      id: 'I16', round: 'お客様情報', sum: 'お客様のお名前', type: 'text',
      title: 'ご記入者のお名前',
      placeholder: 'ご記入ください',
    },
    {
      id: 'I17', round: 'お客様情報', sum: 'ご希望の連絡手段',
      title: 'ご連絡はどの方法がよいですか？',
      options: [
        { label: '電話' },
        { label: 'LINE' },
        { label: 'メール' },
      ],
    },
    {
      id: 'I18', round: 'お客様情報', sum: 'ご連絡先', type: 'text',
      title: 'ご連絡先',
      placeholder: '電話番号／LINE ID／メールアドレス',
    },
    {
      id: 'I19', round: 'ご確認', type: 'confirm',
      title: '最後にご確認ください',
      // ★本番文面（2026-07-20 社長確定）。
      body: [
        'このフォームの送信はご注文の確定ではありません。内容を確認のうえ、お店からご連絡いたします。',
        'ラクトの認印は、このシートでお値段をお出しします。それ以外の印鑑は、内容を確認してからお見積りをお出しします（サイトに載っている価格は目安です）。',
        'いただいた内容を、ご相談の目的以外に使うことはありません。',
      ],
      checkLabel: '上記を確認しました',
    },
  ];

  function isP(a) { return a.I1 && a.I1.val === 'personal'; }
  function isC(a) { return a.I1 && a.I1.val === 'corp'; }
  function isSet(a) { return isC(a) && a.I6 && a.I6.val === 'set'; }
  function isCorpSingle(a) { return isC(a) && a.I6 && a.I6.val !== 'set'; }
  function isMitome(a) { return isP(a) && a.I2 && a.I2.label.indexOf('認印') === 0; }
  function isLacto(a) { return isMitome(a) && a.I5L && (a.I5L.val === 'l10' || a.I5L.val === 'l12'); }

  // ラクトの認印だけお値段を出す。それ以外は null（金額の欄を出さない）
  var LACTO = { l10: { size: '10mm', yen: 600 }, l12: { size: '12mm', yen: 1100 } };
  function estimate(a, visible) {
    if (!visible('I5L') || !isLacto(a)) return null;
    var p = LACTO[a.I5L.val];
    var lines = ['認印・ラクト ' + p.size + '：' + p.yen.toLocaleString('ja-JP') + '円'];
    if (visible('I14') && a.I14 && a.I14.label === 'つける') lines.push('印鑑ケースのお値段は別にお知らせします');
    return {
      label: 'お値段',
      fixed: true,
      total: p.yen.toLocaleString('ja-JP') + '円（税別）',
      lines: lines,
      note: 'この金額で承ります（印鑑本体のお値段です）。',
    };
  }

  window.HEARING_SETS = window.HEARING_SETS || {};
  window.HEARING_SETS['inkan'] = {
    meta: { key: 'inkan', label: '印鑑', ver: 'v1.1', title: '印鑑ヒアリング' },
    questions: Q,
    estimate: estimate,
  };
})();
