import { z } from 'zod'

export const SettingsSchema = z.object({
  notNotation: z.enum(['prime', 'overbar']).default('prime'),
  reducedMotion: z.boolean().default(false),
  ambientEffects: z.boolean().default(true),
  textSpeed: z.enum(['fast', 'normal', 'slow']).default('normal'),
  soundEnabled: z.boolean().default(true),
  volume: z.number().min(0).max(1).default(0.5),
})
export type Settings = z.infer<typeof SettingsSchema>

export const LessonProgressSchema = z.object({
  done: z.boolean(),
  completedAt: z.string().optional(),
})

export const PuzzleProgressSchema = z.object({
  stars: z.number().min(0).max(3),
  attempts: z.number().min(0),
  hintsUsed: z.number().min(0),
  usedShowSolution: z.boolean().default(false),
  solvedAt: z.string().optional(),
})

export const ConceptStatSchema = z.object({
  attempts: z.number().min(0),
  successes: z.number().min(0),
  hintsUsed: z.number().min(0),
})

export const SavedCircuitSchema = z.object({
  name: z.string(),
  circuit: z.any(),
  savedAt: z.string(),
})

const defaultSettings = (): z.infer<typeof SettingsSchema> => ({
  notNotation: 'prime',
  reducedMotion: false,
  ambientEffects: true,
  textSpeed: 'normal',
  soundEnabled: true,
  volume: 0.5,
})

export const SaveV1Schema = z.object({
  schema: z.literal(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  playerName: z.string().default(''),
  xp: z.number().min(0).default(0),
  level: z.number().min(1).default(1),
  progress: z.object({
    lessons: z.record(z.string(), LessonProgressSchema).default({}),
    puzzles: z.record(z.string(), PuzzleProgressSchema).default({}),
  }).default(() => ({ lessons: {}, puzzles: {} })),
  achievements: z.record(z.string(), z.string()).default({}),
  settings: SettingsSchema.default(defaultSettings),
  sandbox: z.object({
    circuits: z.record(z.string(), SavedCircuitSchema).default({}),
  }).default(() => ({ circuits: {} })),
  conceptStats: z.record(z.string(), ConceptStatSchema).default({}),
  worldsIntroduced: z.array(z.string()).default([]),
})
export type SaveV1 = z.infer<typeof SaveV1Schema>

export const CURRENT_SCHEMA = 1 as const

export function defaultSave(playerName = ''): SaveV1 {
  const now = new Date().toISOString()
  return {
    schema: 1,
    createdAt: now,
    updatedAt: now,
    playerName,
    xp: 0,
    level: 1,
    progress: { lessons: {}, puzzles: {} },
    achievements: {},
    settings: defaultSettings(),
    sandbox: { circuits: {} },
    conceptStats: {},
    worldsIntroduced: [],
  }
}
