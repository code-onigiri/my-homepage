import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    // Keystatic は YYYY-MM-DD 文字列を出力するため、文字列も受け付けて Date に変換
    date: z.union([z.date(), z.string()]).transform((val) =>
      typeof val === 'string' ? new Date(val) : val
    ),
    draft: z.boolean().optional().default(false),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
    toc: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };
