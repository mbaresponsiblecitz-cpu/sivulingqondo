import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const focusAreas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/focus-areas' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    image: z.string(),
    icon: z.string().optional(),
    order: z.number().default(0),
  }),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    image: z.string().optional(),
    order: z.number().default(0),
  }),
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/gallery' }),
  schema: z.object({
    image: z.string(),
    caption: z.string().optional(),
    programme: z.string().optional(),
    order: z.number().default(0),
  }),
});

const transparency = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/transparency' }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    chip: z.string().optional(),
    invoice: z.string().optional(),
    date: z.coerce.date().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { focusAreas, team, gallery, transparency };
