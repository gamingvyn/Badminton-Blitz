import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  avatarColor: text("avatar_color").notNull().default("#2563eb"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  player1Id: integer("player1_id").notNull().references(() => users.id),
  player2Id: integer("player2_id"),
  player1Score: integer("player1_score").notNull(),
  player2Score: integer("player2_score").notNull(),
  winnerId: integer("winner_id").notNull(),
  gameMode: text("game_mode").notNull(),
  aiDifficulty: text("ai_difficulty"),
  playedAt: timestamp("played_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updateUserSchema = z.object({
  avatarColor: z.string().optional(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  playedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
