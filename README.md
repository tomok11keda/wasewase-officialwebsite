# わせわせ（WaseWase）公式サイト

早稲田大学生限定SNS「わせわせ」のランディングページです。

現在は**事前登録**向け。正式リリース後は、設定を1箇所変えるだけで **App Store 導線**に切り替えられます。

---

## 技術スタック

- HTML
- Tailwind CSS（CDN）
- Vanilla JavaScript
- Google Apps Script（フォーム送信・接続予定）

フレームワーク（React / Next.js など）は使用していません。

---

## フォルダ構成

```
/
├── index.html
├── css/
│   ├── style.css        # デザインシステム本体
│   └── animation.css    # スクロールアニメーション
├── js/
│   ├── main.js          # ヘッダー・メニュー・サイトモード切替
│   ├── animation.js     # Intersection Observer
│   └── form.js          # 事前登録フォーム
├── assets/
│   ├── images/          # OGP・スクショなど
│   ├── icons/           # favicon など
│   └── videos/
└── README.md
```

---

## ローカルでの確認方法

このプロジェクトは静的サイトです。次のいずれかで開けます。

1. `index.html` をブラウザで直接開く
2. VS Code / Cursor の Live Server などでローカルサーバーを立てる

例（Python がある場合）:

```bash
python -m http.server 5500
```

ブラウザで `http://localhost:5500` を開いてください。

---

## サイトモードの切り替え（事前登録 ↔ App Store）

`js/main.js` の `SITE_CONFIG` を編集します。

```js
const SITE_CONFIG = {
  mode: "preregister", // ← "appstore" に変更
  appStoreUrl: "https://apps.apple.com/アプリのURL",
  // ...
};
```

| mode | 表示内容 |
|------|----------|
| `preregister` | 事前登録フォーム |
| `appstore` | App Store ダウンロード CTA |

ヘッダー・フッターの CTA 文言も自動で同期されます。

---

## フォーム × Google Apps Script

`js/form.js` の `GAS_ENDPOINT` に Web アプリ URL を設定済みです。

送信 JSON:

```json
{
  "nickname": "...",
  "instagram": "...",
  "referrer": "",
  "email": ""
}
```

※ HTML 上の入力名 `wasedaEmail` の値は、GAS へは `email` キーで送ります。

### GAS 側の例（スプレッドシートに追記）

```js
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([
    new Date(),
    data.nickname || "",
    data.instagram || "",
    data.referrer || "",
    data.email || "",
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

デプロイ時は「アクセスできるユーザー: 全員」にしてください。
送信成功時のみサンクスカードが表示されます。

---

## SEO / OGP

`index.html` の `<head>` に以下を設定済みです。

- title / description
- OGP / Twitter Card
- favicon 用コメント（画像を置いたらコメント解除）

本番ドメインに合わせて、`og:url` や `og:image` の URL を書き換えてください。

推奨アセット:

- `assets/images/ogp.png`（1200×630）
- `assets/icons/favicon.ico`
- `assets/icons/apple-touch-icon.png`

---

## デザインについて

- ベース: ダークサーフェス + 白 / グレー
- アクセント: 早稲田クリムゾン `#5A1818` `#7A1F1F` `#A02222` `#D52B2B`
- 表現: ガラス、ぼかし、グラデーション、控えめな Glow
- 参考トーン: Apple / Linear / Vercel / Arc / Raycast

---

## 今後の拡張アイデア

- 実機スクリーンショットへの差し替え（`#screens`）
- favicon / OGP 画像の追加
- プライバシーポリシー・利用規約ページ
- App Store バッジ画像の追加
