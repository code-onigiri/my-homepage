import { config, fields, collection } from '@keystatic/core';

export default config({
  // GitHub モード: GitHub API 経由でコミット＆プッシュ
  storage: {
    kind: 'github',
    repo: {
      owner: 'code-onigiri',
      name: 'my-homepage',
    },
  },
  ui: {
    brand: { name: '🍙 code-onigiri CMS' },
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
      columns: ['date', 'draft'],
      schema: {
        title: fields.slug({
          name: {
            label: 'タイトル',
            validation: { isRequired: true },
          },
        }),
        description: fields.text({
          label: '説明',
          multiline: true,
        }),
        date: fields.date({
          label: '投稿日',
          validation: { isRequired: true },
        }),
        draft: fields.checkbox({
          label: '下書き',
          description: '有効にすると本番サイトに表示されません',
          defaultValue: false,
        }),
        image: fields.image({
          label: 'アイキャッチ画像',
          description: 'OGP やブログ一覧で表示される画像',
          directory: 'public/assets/blog',
          publicPath: '/assets/blog/',
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
