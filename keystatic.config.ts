import { config, fields, collection } from '@keystatic/core';

const isProd = import.meta.env.PROD;

export default config({
  // ローカル: local モード（ファイル直接読み書き）
  // 本番: github モード（GitHub API 経由でコミット＆プッシュ）
  storage: isProd
    ? {
        kind: 'github',
        repo: {
          owner: 'code-onigiri',
          name: 'my-homepage',
        },
      }
    : {
        kind: 'local',
      },
  ui: {
    brand: { name: 'code-onigiri CMS' },
    navigation: {
      コンテンツ: ['blog'],
    },
  },
  collections: {
    blog: collection({
      label: 'ブログ記事',
      slugField: 'title',
      path: 'src/content/blog/*',
      entryLayout: 'content',
      format: {
        contentField: 'content',
      },
      schema: {
        title: fields.slug({
          name: {
            label: 'タイトル',
            validation: { isRequired: true },
          },
        }),
        description: fields.text({
          label: '説明',
        }),
        date: fields.date({
          label: '投稿日',
          validation: { isRequired: true },
        }),
        tags: fields.array(
          fields.text({ label: 'タグ' }),
          {
            label: 'タグ',
            itemLabel: (props) => props.value,
          },
        ),
        toc: fields.checkbox({
          label: '目次を表示',
          defaultValue: false,
        }),
        content: fields.markdoc({
          label: '本文',
        }),
      },
    }),
  },
});
