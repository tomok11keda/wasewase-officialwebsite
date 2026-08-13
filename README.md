# わせわせ（wasewase）公式サイト

早稲田大学生限定のキャンパスアプリ「わせわせ」のランディングページです。

現在は**事前登録**向け。正式リリース後は、設定を1箇所変えるだけで **App Store 導線**に切り替えられます。

---

## 技術スタック

- HTML
- CSS
- Vanilla JavaScript
- Google Apps Script（フォーム送信）
- Google Fonts（Noto Sans JP。Hiragino 系が無い環境向け）

フレームワーク（React / Next.js など）は使用していません。

---

## フォルダ構成

```
/
├── index.html
├── css/
│   ├── style.css        # デザインシステム本体
│   └── animation.css    # 控えめな入場アニメーション
├── js/
│   ├── main.js          # ヘッダー・メニュー・サイトモード切替
│   ├── animation.js     # Intersection Observer
│   └── form.js          # 事前登録フォーム
├── assets/
│   ├── images/          # アプリスクショ
│   ├── icons/           # ロゴ
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

送信成功時のみサンクスカードが表示されます。

---

## SEO / OGP

`index.html` の `<head>` に title / description / OGP / Twitter Card を設定しています。

本番ドメインに合わせて、`og:url` や `og:image` の URL を書き換えてください。

推奨アセット:

- `assets/images/ogp.png`（1200×630）
- `assets/icons/favicon.ico`
- `assets/icons/apple-touch-icon.png`

---

## デザイン

アプリ UI に合わせたライトテーマです。

- Primary: `#891E2B`
- Background: `#F7F9FC`
- Surface: `#FFFFFF`
- Text: `#0F1419`
- 日本語フォント: Hiragino Sans / Noto Sans JP
- CTA は pill（`border-radius: 999px`）

---

## 今後の拡張アイデア

- 時間割など、未収録スクリーンショットの追加
- favicon / OGP 画像の追加
- プライバシーポリシー・利用規約ページ
- 公式 Instagram URL の設定（`js/form.js` の `INSTAGRAM_URL`）
