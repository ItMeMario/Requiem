import { z } from 'zod';

export const CampaignSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(1, "Nome é obrigatório"),
  genero: z.string().optional().nullable(),
  sistema: z.string().optional().nullable()
});

export type Campaign = z.infer<typeof CampaignSchema>;

export const EntrySchema = z.object({
  id: z.number().optional(),
  campaign_id: z.number(),
  titulo: z.string().min(1, "Título é obrigatório"),
  conteudo: z.string(), // JSON string that holds ReactQuill content or similar
  data_criacao: z.string() // ISO date string
});

export type Entry = z.infer<typeof EntrySchema>;

export const EntitySchema = z.object({
  id: z.number().optional(),
  campaign_id: z.number(),
  tipo: z.enum(['character', 'location']),
  nome: z.string().min(1, "Nome é obrigatório"),
  subtitulo: z.string().optional().nullable(), // raça/região
  status_ou_tipo: z.string().optional().nullable(),
  idade_ou_clima: z.string().optional().nullable(),
  faccao: z.string().optional().nullable(),
  lore: z.string().optional().nullable(),
  ambientacao: z.string().optional().nullable(),
  notas_pessoais: z.string().optional().nullable(),
  tags: z.string().optional().nullable() // JSON array string or comma separated
});

export type Entity = z.infer<typeof EntitySchema>;
