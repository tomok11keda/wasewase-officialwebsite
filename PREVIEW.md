# ビジュアルリデザイン比較プレビュー

本番（`index.html`）は変更していません。比較用ページのみ追加しています。

## プレビュー方法

```bash
python3 -m http.server 5500
```

- 比較ハブ: http://localhost:5500/preview-index.html
- 案A Editorial Minimal: http://localhost:5500/preview-a.html
- 案B Bold Campus: http://localhost:5500/preview-b.html
- 現行: http://localhost:5500/index.html

## ファイル

| ファイル | 役割 |
|---|---|
| `preview-index.html` | A/B/現行の導線ハブ |
| `preview-a.html` | 案A（現行HTMLと同内容 + theme-a） |
| `preview-b.html` | 案B（現行HTMLと同内容 + theme-b） |
| `css/theme-a.css` | Editorial Minimal 上書き |
| `css/theme-b.css` | Bold Campus 上書き |

画像素材（`assets/images/devices/*`, `assets/images/ui/*`）は未変更です。
