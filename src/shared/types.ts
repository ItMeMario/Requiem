import { z } from 'zod';

export const CampaignSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  genre: z.string().optional().nullable(),
  system: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  collaborators: z.array(z.string()).optional().nullable()
});

export type Campaign = z.infer<typeof CampaignSchema>;

export const EntrySchema = z.object({
  id: z.number().optional(),
  campaign_id: z.number(),
  title: z.string().min(1, "Title is required"),
  content: z.string(), // JSON string that holds ReactQuill content or similar
  creation_date: z.string(), // ISO date string
  shared: z.boolean().optional().nullable(),
  authorId: z.string().optional().nullable(),
  authorName: z.string().optional().nullable()
});

export type Entry = z.infer<typeof EntrySchema>;

export const CharacterSchema = z.object({
  id: z.number().optional(),
  campaign_id: z.number(),
  name: z.string().min(1, "Name is required"),
  race: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  age: z.string().optional().nullable(),
  faction: z.string().optional().nullable(),
  lore: z.string().optional().nullable(),
  bonds: z.string().optional().nullable(),
  personal_notes: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  shared: z.boolean().optional().nullable(),
  authorId: z.string().optional().nullable(),
  authorName: z.string().optional().nullable(),
  attachments: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      url: z.string(),
      size: z.number().optional().nullable()
    })
  ).optional().nullable()
});

export type Character = z.infer<typeof CharacterSchema>;

export const LocationSchema = z.object({
  id: z.number().optional(),
  campaign_id: z.number(),
  name: z.string().min(1, "Name is required"),
  region: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  lore: z.string().optional().nullable(),
  present_npcs: z.string().optional().nullable(),
  atmosphere: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  shared: z.boolean().optional().nullable(),
  authorId: z.string().optional().nullable(),
  authorName: z.string().optional().nullable()
});

export type Location = z.infer<typeof LocationSchema>;
