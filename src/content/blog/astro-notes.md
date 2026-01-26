---
title: "Astroで書くときの覚え書き"
description: "Markdown をそのままコンテンツとして扱い、JavaScript は必要なときだけ。"
date: 2025-01-10
tags: ["astro", "notes"]
---

Astro では、コンテンツのほとんどを静的 HTML として生成し、必要なインタラクションだけをクライアントで動かします。
このブログも同じ方針で、記事そのものは Markdown のまま、テーマ切り替えなど小さなスクリプトだけを載せています。

- `src/content/blog` に Markdown を追加するだけで記事が増える
- スキーマは `src/content/config.ts` で定義
- `getCollection('blog')` で日付順に取得

読みやすさを優先するなら、まずは余白と行間、そしてシンプルな色数だけで十分です。
