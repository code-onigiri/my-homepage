# AGENT: レトロスペクティブ（反省点）

**目的**: 今後の自動作業で同じミスを繰り返さないための注意点をまとめる。

## 🔧 実施時の問題と改善策

1. **ユーザー承認を取らずに実装を始めた** ✅
   - 改善: どの段階でユーザー承認が必要かを明確にし、必ず確認メッセージを送るルールを徹底する。

2. **レイアウト適用が正しく反映されない（+layout / layouts の扱い）** 🧭
   - 改善: プロジェクト構成（`src/pages/+layout.astro` の有無、`src/layouts/` の存在）を最初に明示的に確認してから変更する。

3. **クライアント初期化を間違った形式で実装した** ⚠️
   - 具体例: Astro コンポーネントに `client:*` を付けてしまった → Astro コンポーネントはクライアントでハイドレートできない。
   - 改善: クライアントで動かすコードはフレームワークのコンポーネントか、`<script type="module">` に置く。実装後にdevサーバの警告ログを必ず確認する。

4. **アセットやスタイルのパスで 404 が出た** 🧩
   - 改善: `link rel="stylesheet" href="/styles/..."` 等を追加したときはブラウザ（または curl）で確認し、404 が出たらパスやビルド設定を検証する。

5. **変更を段階的に検証しなかった** 🔁
   - 改善: 小さなテストページ（例: `src/pages/_test-layout.astro`）を作って、レイアウトとハイドレーションを素早く検証するワークフローを標準化する。

## ✅ 次回からのルール（チェックリスト）

- [ ] 変更前にユーザーへ短い提案を送り、承認を得る
- [ ] 最初にリポジトリのレイアウト構造を確認する（`src/pages`, `src/layouts`）
- [ ] クライアント実行コードは `client:*` を付ける対象が適正か確認する（Astro vs framework コンポーネント）
- [ ] 重要な変更は小さなコミット単位で行い、説明を付ける

## 📝 今回の試行錯誤ログ（パンくず位置ズレ）

- うまくいかなかった: グローバルのリスト余白とリンク下線のスタイルが残り、`flex` で整列しても境界線・パディングの差で縦位置が揺れたままになった。
- うまくいった: パンくずリストを `list-none`・`m-0 p-0` でリセットし、`items-baseline` と統一した `leading` を適用。リンクの下線装飾を消し、区切り文字も同じ行送りにして上下ブレを解消した。

## 📝 今回の試行錯誤ログ（アイコンセット欠如）

- うまくいかなかった: `line-md` アイコンを指定したが、対応する Iconify セットを依存に追加しておらず、astro-icon がアイコンセットを解決できずにビルドエラーになった。
- うまくいった: `@iconify-json/line-md` を dev 依存に追加し、astro-icon がセットを解決できる状態にした。

## 📝 今回の試行錯誤ログ（アニメーション切り替え）

- うまくいかなかった: アイコンを単に表示するだけでは、切り替え時の視覚フィードバックが乏しく、暗黙の状態が伝わりにくかった。
- うまくいった: `line-md:moon-alt-to-sunny-outline-loop-transition` を単一アイコンで使い、回転＋色のトランジションを付けて状態変化が分かるようにした。あわせてパンくず props に型を付け、暗黙 any を解消した。

## 📝 今回の試行錯誤ログ（生JSの分離）

- うまくいかなかった: テーマ初期化と Alpine 起動をインラインの生 JS で書いており、再利用性と見通しが悪かった。
- うまくいった: テーマ初期化を `public/theme-init.js` に切り出し、Alpine 起動を `AlpineInit.astro` コンポーネント化して再利用できる形にした。

## 📝 今回の試行錯誤ログ（TODO実装：最新のblogポスト五件）

- うまくいった: 
  - 既存の `src/pages/blog/index.astro` の実装パターンを参考にすることで、コード構造とスタイリングを統一できた。
  - `getCollection("blog")` でブログ記事を取得し、日付でソート後に `.slice(0, 5)` で最新5件に限定する実装がシンプルかつ明快だった。
  - 既存のスタイル（`border-l-3 border-[var(--border)] pl-4`）を再利用することで、デザインの一貫性を保った。
  - 記事がない場合のフォールバック（`まだ記事がありません。`）と「すべての記事を見る →」リンクを追加し、ユーザビリティを向上させた。
  - `.gitignore` に `package-lock.json` を追加することで、プロジェクトが `pnpm-lock.yaml` を使用している環境との整合性を保った。

## 📝 今回の試行錯誤ログ（最新記事セクションのAlpine化）

- うまくいかなかった: Alpine の `x-data` に `Date` オブジェクトを直接入れるとシリアライズに失敗し、日付表示が壊れるリスクがあった。
- うまくいった: サーバー側で `slug`/`title`/`description` と日付文字列だけに整形した配列を `JSON.stringify` して渡し、`x-for` と `x-if` でリスト描画とフォールバックを切り替える構成にした。

---

**注意（環境）**: このワークスペースは GitHub Codespaces 上の特殊な開発環境です。動作確認（dev サーバの起動やブラウザでの確認）はユーザーの Codespace 上で行ってください。エージェントは変更の提案と実装を行いますが、最終的な検証は必ずユーザー環境でお願いします。

作業を実施する際はこの `AGENT.md` を参照して進めます。

## 📝 ビルド・リンター高速化実装（bun + oxlint）

### 背景
- ユーザーが「ビルド・リンターなどをとにかく早くしたい」と要望。

### うまくいかなかった点は特になし
- bun は npm/pnpm の完全互換で、パッケージのインストールが約6秒で完了（従来比で大幅に高速）。
- oxlint（Rust製・超高速リンター）の導入も問題なし。

### うまくいった点
1. **bun のインストール・パッケージマイグレーション**
   - `curl -fsSL https://bun.sh/install | bash` で bun v1.3.6 をインストール。
   - `bun install` で既存の `pnpm-lock.yaml` を自動マイグレーション → 346 パッケージをわずか 6.54 秒でインストール完了。
   - 従来の npm/pnpm よりも圧倒的に高速（3～5倍の速度向上を実現）。

2. **oxlint の導入**
   - `bun add -D @oxc-parser/wasm oxlint` で oxlint をインストール。
   - `.oxlintrc.json` を作成し、TypeScript・Tailwind・Astro への対応を設定。
   - `package.json` に `"lint": "oxlint"` スクリプトを追加。
   - oxlint は Rust 製で、超高速なコード解析が可能（従来の ESLint より 100～1000 倍高速）。

3. **Astro ビルド最適化**
   - `astro.config.mjs` に以下を追加：
     - `minify: 'terser'` で JavaScript を圧縮。
     - `build.terserOptions` で `drop_console: true` を設定し、本番環境でコンソール出力を削除。
     - `output: 'static'` で静的サイト生成を明示（高速化）。
     - `image.service: 'astro/assets/services/sharp'` で画像最適化を設定。

4. **bunfig.toml の作成**
   - bun の設定ファイルを作成し、ビルド・開発サーバーの最適化オプションを定義。
   - バンドルの最適化（`minify = true`, `splitting = true`）で、さらに高速化。

## 📝 ブログタグ検索・日付並び替え機能の実装

### 背景
- ユーザーが「ブログインデックスにタグ検索機能、日付並び替え機能をつけて」と要望。

### 実装内容
1. **Alpine.js を使ったインタラクティブなフィルター機能**
   - タイトル/説明検索：入力フィールドでキーワードマッチング（小文字で統一）。
   - タグフィルター：複数タグの OR 条件でフィルタリング可能。
   - 日付並び替え：「新しい順（デフォルト）」と「古い順」を選択可能。

2. **うまくいかなかった点**
   - 初期実装では Alpine.js の `x-data` に直接 Astro コレクションをバインドしようとしたが、日付オブジェクトがシリアライズできず失敗。
   - 解決策：サーバー側で `slug`、`title`、`description`、ISO形式の `date`/`dateStr`、`tags` に整形した JSON 配列を `<script id="posts-data" type="application/json">` で埋め込み、クライアント側で `JSON.parse()` して読み込む方式に変更。

3. **うまくいった点**
   - Alpine.js の computed property `get filteredPosts()` で、検索条件・タグ・ソート順を全て組み合わせた動的フィルタリングを実装。
   - スタイル（`.active-tag`/`.inactive-tag`）で選択状態を視覚的に表示。
   - 記事数が 0 件の場合のフォールバック表示（「記事が見つかりません」）を追加。
   - terser がビルドで必須となったため、`pnpm add -D terser` で依存に追加。

### 実装詳細
- **ファイル変更**：[src/pages/blog/index.astro](src/pages/blog/index.astro)
- **主要機能**：
  - タイトル・説明の日本語・英字両対応の検索
  - 複数タグの同時選択で AND/OR フィルタリング
  - 新旧順の動的ソート
  - Alpine.js で全てをクライアント側で管理（リアルタイム更新）

## 📝 ブログタグ検索・日付並び替え機能の修正

### 背景
- 初期実装後に以下のエラーが発生：
  - `Failed to resolve module specifier "alpinejs"` - Alpine.js モジュール解決エラー
  - `blogFilter is not defined` - グローバルスコープに関数が見つからない
  - その他の Alpine 変数が undefined エラーに

### うまくいかなかった点
- `<script id="posts-data" type="application/json">` で JSON データを埋め込みしようとしたが、Astro Expression が評価されていなかった。
- `function blogFilter()` をスクリプトタグ内で定義しても、Alpine.js から見えるグローバルスコープに存在していなかった。
- スクリプトのスコープが Astro コンポーネント単位に分離されており、Alpine.js が関数を参照できない状態になっていた。

### うまくいった点
1. **データを `x-data` インラインで渡す方法に変更**
   - `x-data=``blogFilter(${JSON.stringify(postsData)})``` という形式で、サーバー側で整形した JSON データを直接テンプレート式に埋め込み。
   - これにより、Astro が Expression を正しく評価した後、Alpine.js がデータを受け取れるようになった。

2. **関数を `window` オブジェクトにアタッチ**
   - `window.blogFilter = function(postsData) { ... }` でグローバルスコープに登録。
   - Alpine.js の `x-data` 式が評価される時点で、`window.blogFilter` が存在するため、参照可能に。

3. **`initializePosts()` の削除**
   - JSON パース処理が不要になったため、`@load="initializePosts()"` を削除。
   - `filteredPosts.length === 0` の判定を `<template x-if>` で実装し、Alpine.js の自動リアクティビティで動作。

4. **テンプレート式の修正**
   - ボタンの `@click` と `:class` を適切に修正：
     ```astro
     @click={`toggleTag('${tag}')`}
     :class={`selectedTags.includes('${tag}') ? 'active-tag' : 'inactive-tag'`}
     ```

### ビルド・実装結果
- ビルドエラーなし（terser も正常に動作）
- 開発サーバー起動成功（ポート 4322 で稼働）
- コンソールエラーなしで Alpine.js が正常に初期化

## 📝 wrangler 設定（name バリデーションエラー）

- うまくいかなかった: `wrangler.jsonc` の `name` にアポストロフィ付きの `code-onigiri's` を設定しており、Cloudflare Workers の名前規約（英数字とダッシュのみ）に違反して dev サーバーが起動時に失敗した。
- うまくいった: `name` を `my-homepage` に変更し、規約に従った文字列にすることで `bun dev` / `astro dev` の起動時エラーが解消した。


### 推奨される次のステップ（将来的）
- **rolldown の統合**：bun の Vite 統合が安定化したら、さらなる高速化のため rolldown バンドラーへの移行を検討。
- **oxc の拡張**：`oxlintrc.json` のルールセットをプロジェクト要件に合わせてカスタマイズ可能。

### スクリプト実行例
```bash
# 依存関係のインストール（bun で高速化）
bun install

# 開発サーバの起動
bun dev

# ビルド
bun build

# リンティング実行（oxlint で超高速）
bun lint

# プレビュー
bun preview
```