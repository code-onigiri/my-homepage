# AGENT: レトロスペクティブ（短縮版）

**目的**
- 自動作業での誤りを再発させないための反省点と改善策を記録する。

**主要な問題と対策**
- ユーザー承認不足：変更前に短い提案で承認を取得する。 
- レイアウト適用ミス：`src/pages`/`src/layouts` を事前確認する。 
- クライアント初期化ミス：Astro とフレームワークコンポーネントの実行対象を明確化する。
- アセット404：パス検証とブラウザ/curl での確認を必須にする。
- 検証不足：小さなテストページで段階的に確認する。

**主な改善・成功事例**
- パンくずの縦揃え問題をリセット（list リセット + items-baseline）。
- アイコンセット不足を `@iconify-json/line-md` を追加して解消。
- アイコン切替にアニメーションを導入して状態変化を可視化。
- テーマ初期化を `public/theme-init.js` に分離、Alpine 初期化をコンポーネント化。
- ブログ最新5件の取得は `getCollection("blog")`→ソート→`.slice(0,5)` で実装。

**Alpine.js を使ったブログフィルタ**
- サーバー側で記事データを JSON 整形（ISO 日付文字列含む）してクライアントで処理。
- `x-data` に直接埋め込む方法と、必要に応じて `window` に関数を公開してスコープ問題を回避。
- 検索・タグ選択・日付ソートをクライアントで組み合わせて動作。

**ビルド最適化**
- `bun` 導入で依存インストール・開発が高速化。
- `oxlint`（Rust 製リンター）を追加して高速な静的解析を実現。
- `astro.config.mjs` に terser/minify や画像最適化の設定を追加。

**重要な修正**
- `wrangler.jsonc` の `name` を `my-homepage` に変更し、dev 起動エラーを解消。

**次の提案**
- 将来的に rolldown 検討、`oxlintrc.json` のルール調整。

**参照**
- 実装例: src/pages/blog/index.astro

---
**今回の振り返り**
- うまくいかなかったこと: タイポグラフィやコード表示の指定が散在して統一感が出にくかった。
- なぜうまくいったか: 変数化したフォントと行間を全体で参照し、コードブロック専用フォントを明示したことで一貫性と可読性が両立できた。

**追記**
- うまくいかなかったこと: ヘッダー要素の高さと並びの基準が曖昧で視線のズレが起きた。
- なぜうまくいったか: 高さと行送りを揃え、ボタン位置を基準に合わせたことで整列が改善した。概要は情報量を削って一行ずつに整理した。

**追記2**
- うまくいかなかったこと: 「概要」の対象がTOCであることを見落とし、別のセクションを簡略化してしまった。
- なぜうまくいったか: TOC専用のスタイルを用意して装飾を抑え、箇条書きの見た目を簡潔にできた。

---
更新: 要点のみを抽出した短縮版に変更。

---
**追記3**
- うまくいかなかったこと: ブログページのスタイルがページ内に散在し、タグやフォームの見た目が箇所ごとに微妙に違って保守が重かった。
- なぜうまくいったか: 共通クラス（フォーム、タグチップ、アクティブ/非アクティブ）を全体CSSに集約し、日付ソートも数値化して再計算コストを削減できた。

**追記4**
- うまくいかなかったこと: グローバルな`ul/ol`スタイルがナビゲーションにも適用され、ヘッダーのパンくず位置がずれた。
- なぜうまくいったか: リストのスタイルを`main`配下に限定して、本文とナビゲーションを分離できた。

**追記5**
- うまくいかなかったこと: 関連ページの導線がホームに無く、見つけにくかった。
- なぜうまくいったか: 専用ページを追加し、ホームに明確なリンクセクションを設置して導線を固定できた。

**追記6**
- うまくいかなかったこと: 日本語と英語の段落・見出しで折り返しやカーニングの方針が曖昧で、表示が環境によって不安定だった。
- なぜうまくいったか: 言語別のベースルールとユーティリティを明文化し、適用範囲を限定することで可読性と一貫性を両立できた。

---
**追記7**
- うまくいかなかったこと: CMS導入で認証や保存先の前提を決めずに着手すると、OAuthやコンテンツパスの設定が曖昧になり動作確認まで進めなかった。
- なぜうまくいったか: 既存のコンテンツスキーマに合わせてCMSのコレクションと保存先を先に固定し、OAuthは公式プロバイダ前提で最小構成から組み立てたことで実装が整理できた。

---
**追記8**
- うまくいかなかったこと: WorkersにOAuthを置く前提だけを先に決めたため、必要なエンドポイントや環境変数が曖昧で手順が見えにくかった。
- なぜうまくいったか: /auth と /callback の最小実装を先に用意し、必要な環境変数を明文化したことで導入手順が具体化できた。

---
**追記9（Keystatic CMS 導入）**
- うまくいかなかったこと（過去の試行）: Decap CMS + 自前 OAuth プロキシの構成は、認証フローの実装・デバッグ負荷が高く、Cloudflare Workers 上での動作確認に多くの工数がかかった。
- うまくいかなかったこと（今回）: Astro 5 では `output: 'hybrid'` が廃止されており、そのまま指定するとビルドエラーになった。また `fields.markdoc()` を使うと `.mdoc` 拡張子が必要で、既存の `.md` ファイルが Keystatic の一覧に表示されなかった。
- なぜうまくいったか: Keystatic を採用し `@keystatic/astro` がルーティング・API を自動注入するため、手動の OAuth プロキシが不要になった。`output: 'server'` + 各ページに `export const prerender = true` を追加することで、既存ページは静的プリレンダリング、Keystatic 管理画面だけ SSR で動作する構成が実現できた。`.md` → `.mdoc` リネーム + `@astrojs/markdoc` 追加で Keystatic のコンテンツ記法と統一し、`keystatic.config.ts` で `import.meta.env.PROD` による local/github モード自動切替を設定した。

---
**追記10（GitHub App 連携）**
- うまくいかなかったこと: `.env` の変更で Vite が何度もホットリロードを繰り返し、`virtual:keystatic-config` の解決エラーが発生してサーバーが不安定になった。`KEYSTATIC_SECRET` が空のまま放置されていた。
- なぜうまくいったか: GitHub App は Keystatic のセットアップ UI（`/keystatic/setup`）経由で作成し、`CLIENT_ID` と `CLIENT_SECRET` が `.env` に自動設定された。`KEYSTATIC_SECRET` は `openssl rand -hex 32` で生成し、`PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` は GitHub App 設定ページの slug を手動で確認して追記した。`.env` 編集中は dev サーバーを停止してから再起動することで不安定さを回避できた。Cloudflare Pages デプロイには同じ4変数をダッシュボードで設定すればよい。

---
**追記11（Keystatic API 500 エラー調査）**
- うまくいかなかったこと: `/api/keystatic/github/login` がデプロイ環境で 500 空ボディを返す。`@keystatic/core` の `makeGenericAPIRouteHandler` は環境変数が不足すると同期的に `throw` し、エラー本文がレスポンスに含まれないため原因が見えにくかった。`import.meta.env.*` はビルド時しか解決されず、`process.env.*` は CF Workers で空オブジェクトのため、フォールバックチェーンが全段失敗する構造だった。
- なぜわかったか: `@keystatic/astro` → `@keystatic/core/api/generic`（worker export）→ `@astrojs/cloudflare/dist/utils/handler.js` のコードパスを全て読み、環境変数の優先順位（config → locals.runtime.env → import.meta.env → process.env）と throw 条件を特定した。Cloudflare Pages ダッシュボードの Production/Preview 環境区別・再デプロイ要件が見落とされやすい原因であることを確認した。
- なぜうまくいったか: Cloudflare Pages ダッシュボードで Production 環境に4変数すべてを設定し、新しいデプロイをトリガーしたことで `context.locals.runtime.env` 経由で正しく読み込まれた。`wrangler.jsonc` の `vars` だけでは Cloudflare Pages の GitHub 連携デプロイに反映されないため、ダッシュボード設定が必須。

---
**追記12（OAuth callback 401 "Authorization failed" 調査）**
- うまくいかなかったこと: GitHub OAuth 認可後のコールバック `/api/keystatic/github/oauth/callback` で 401 が返る。エラーメッセージが `Authorization failed` の一言しかなく、GitHub API からの実際のレスポンス内容がログにも表示されないため原因が掴みにくかった。
- なぜわかったか: `@keystatic/core/dist/keystatic-core-api-generic.worker.js` の `githubOauthCallback` 関数を全行読み、401 が返る箇所が2つあることを特定した。(1) `tokenRes.ok` が false の場合（GitHub API が非200を返す）、(2) `tokenDataResultType.create()` で superstruct バリデーション失敗の場合。GitHub の `/login/oauth/access_token` はエラー時も 200 を返すため、実際には (2) が発火する可能性が高い。`tokenDataResultType` は `expires_in`, `refresh_token`, `refresh_token_expires_in` を必須としており、GitHub App の「Expire user authorization tokens」が有効でないと返らないフィールド。
- 最も可能性が高い原因:
  1. **Cloudflare に設定した `KEYSTATIC_GITHUB_CLIENT_SECRET` の値が不正**: GitHub が 200 + `{ error: "incorrect_client_credentials" }` を返し、スキーマ不一致で catch → 401。
  2. **GitHub App の「Expire user authorization tokens」が無効**: トークンレスポンスに `refresh_token` 等がなくスキーマ不一致 → 401。
  3. **Callback URL 不一致**: GitHub App に `https://code-onigiri.pages.dev/api/keystatic/github/oauth/callback` が登録されていない。
- 修正手順:
  1. GitHub App 設定 (`https://github.com/settings/apps/for-my-homepage`) で「Expire user authorization tokens」が有効か確認。
  2. Callback URL に `https://code-onigiri.pages.dev/api/keystatic/github/oauth/callback` が含まれているか確認。
  3. Cloudflare Pages ダッシュボードの Secrets に `KEYSTATIC_GITHUB_CLIENT_SECRET` / `KEYSTATIC_SECRET` が正確に設定されているか再確認（コピペ末尾の空白・改行に注意）。
  4. デバッグ用に一時的にレスポンスをログ出力して GitHub からの実際のエラー内容を確認するのが最速。
- なぜうまくいったか: GitHub App 設定の「Optional features」→「User-to-server token expiration」を Opt-in で有効化したことで、OAuth トークン交換のレスポンスに `refresh_token`・`expires_in`・`refresh_token_expires_in` が含まれるようになり、Keystatic の superstruct バリデーションが通るようになった。この設定は GitHub App 作成時にデフォルト無効の場合があり、Keystatic のドキュメントにも明記が薄い盲点。

---
**追記13（CMS カスタマイズ）**
- うまくいかなかったこと: `@cloudflare/workerd-linux-64` を手動インストールした副作用で esbuild のバージョン衝突が発生し、ビルドが `callback is not a function` エラーで失敗した。
- なぜうまくいったか: 不要パッケージを削除しキャッシュをクリアして解消。カスタマイズ自体は `keystatic.config.ts` のスキーマ追加（draft, image, multiline description）と `content/config.ts` の同期、記事一覧での `draft` フィルタ実装をセットで行い整合性を保った。