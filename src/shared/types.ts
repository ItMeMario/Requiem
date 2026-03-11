import { z } from 'zod';

export const CampaignSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Name is required"),
  genre: z.string().optional().nullable(),
  system: z.string().optional().nullable()
});

export type Campaign = z.infer<typeof CampaignSchema>;

export const EntrySchema = z.object({
  id: z.number().optional(),
  campaign_id: z.number(),
  title: z.string().min(1, "Title is required"),
  content: z.string(), // JSON string that holds ReactQuill content or similar
  creation_date: z.string() // ISO date string
});

export type Entry = z.infer<typeof EntrySchema>;

export const EntitySchema = z.object({
  id: z.number().optional(),
  campaign_id: z.number(),
  type: z.enum(['character', 'location']),
  name: z.string().min(1, "Name is required"),
  subtitle: z.string().optional().nullable(), // raça/região
  status_or_type: z.string().optional().nullable(),
  age_or_climate: z.string().optional().nullable(),
  faction: z.string().optional().nullable(),
  lore: z.string().optional().nullable(),
  setting: z.string().optional().nullable(),
  personal_notes: z.string().optional().nullable(),
  tags: z.string().optional().nullable() // JSON array string or comma separated
});

export type Entity = z.infer<typeof EntitySchema>;
