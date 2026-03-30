# Support Tools v2.0

社内サポート向け — メモ・返信ドラフト・SQLスクリプト生成ツール。

## セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数を設定
cp .env.local.example .env.local
# .env.local を編集して RAPIDAPI_KEY を設定

# 開発サーバー起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 手動で追加が必要なファイル

| ファイル | 配置先 | 説明 |
|---|---|---|
| `DataDictionary.htm` | `public/static/` | Data Dictionary (Form タブの右ペインに表示) |
| `template.txt` | `static/` (プロジェクトルート直下) | SQL スクリプトテンプレート |
| `favicon.ico` | `public/` | ファビコン |

### `static/template.txt` の構造

```
-- ヘッダー部分 (ClientBaseURL を SET する行まで)
-- Set @Description, @ZendeskId, @SessionId
-- ヘッダー続き
-- mid
-- テール部分 (スクリプトの後に続く共通フッター)
```

API は `-- Set @Description, @ZendeskId, @SessionId` の前後と `-- mid` の前後でテキストを分割し、フォームの値を差し込みます。

## プロジェクト構成

```
support-tools/
├── src/app/
│   ├── globals.css          # デザイントークン・リセット・アニメーション
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # エントリーポイント
│   ├── hooks/
│   │   └── useLocalStorage.ts
│   ├── components/
│   │   ├── Shell.tsx / .module.css   # アプリクロム (トップバー・タブナビ)
│   │   ├── ui.tsx / .module.css      # 共有 UI (Panel, Field, Btn, CopyBtn…)
│   │   ├── MemoTab.tsx / .module.css
│   │   ├── ReplyTab.tsx / .module.css
│   │   └── FormTab.tsx / .module.css
│   └── api/
│       ├── CreateScript/route.ts
│       ├── generateSessionId/route.ts
│       └── template/route.ts
├── public/
│   └── static/              # ← DataDictionary をここに配置
├── static/                  # ← template.txt をここに配置
├── .env.local.example
└── package.json
```

## 環境変数

| 変数名 | 必須 | 説明 |
|---|---|---|
| `COMPANY_NAME | x | your_company_name_here |
| `MY_NAME` | x | your_name_here |
| `ENGINEER_NAME | x | your_signature_here |
| `RAPIDAPI_KEY` | ✓ | OneCompiler API キー (`/api/generateSessionId` で使用) |

## テクノロジースタック

- **Next.js 15** (App Router)
- **TypeScript**
- **CSS Modules** (外部UIライブラリ不使用)
- **Monaco Editor** (`@monaco-editor/react`) — SQL エディタ
- **IBM Plex Mono / IBM Plex Sans JP** — Google Fonts
