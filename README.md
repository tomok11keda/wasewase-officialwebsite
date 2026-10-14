# わせわせ（wasewase）公式サイト

早稲田大学生向けキャンパスアプリ「わせわせ」のランディングページです。

App Store で正式配信中のインストール獲得を目的とした静的サイトです。

---

## 技術スタック

- HTML
- CSS
- Vanilla JavaScript
- Google Fonts（Noto Sans JP / Zen Kaku Gothic New。Hiragino 系が無い環境向け）

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
│   ├── main.js          # App Store CTA・ヘッダー・モバイル固定CTA
│   └── animation.js     # Intersection Observer
├── assets/
│   ├── images/          # アプリスクリーンショット
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

## App Store URL の変更

インストール導線の URL は `js/main.js` の `SITE_CONFIG.appStoreUrl` で一元管理しています。

```js
const SITE_CONFIG = {
  appStoreUrl:
    "https://apps.apple.com/jp/app/%E3%82%8F%E3%81%9B%E3%82%8F%E3%81%9B/id6785786679",
  ctaLabel: "App Store で入手",
};
```

HTML 内の `data-store-cta` / `data-appstore-link` 付きリンクも、読み込み時にこの値へ揃えられます。  
HTML 側の初期 `href` も同じ URL にしてあるので、JS 無効時でも導線は維持されます。

---

## SEO / OGP

`index.html` の `<head>` に title / description / OGP / Twitter Card / JSON-LD を設定しています。

- canonical / og:url: `https://wasewase.app/`
- OGP 画像（`ogp.png`）は未配置のため、現時点では `og:image` を設定していません

推奨アセット（次フェーズ）:

- `assets/images/ogp.png`（1200×630）
- `assets/icons/favicon.ico`

---

## デザイン

アプリ UI に合わせたライトテーマです。

- Primary: `#891E2B`
- Background: `#F7F9FC`
- Surface: `#FFFFFF`
- Text: `#0F1419`
- 日本語フォント: Hiragino Sans / Zen Kaku Gothic New / Noto Sans JP

---

## 今後の拡張アイデア

- OGP 画像の追加
- プライバシーポリシー・利用規約ページ
- 本番ドメイン（`wasewase.app`）の配信確認と正規URLの最終確定
