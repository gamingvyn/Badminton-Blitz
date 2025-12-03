import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import { 
  users, matches,
  type User, type InsertUser, 
  type Match, type InsertMatch 
} from "@shared/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStats(userId: number, won: boolean): Promise<void>;
  updateUserAvatar(userId: number, avatarColor: string): Promise<void>;
  createMatch(match: InsertMatch): Promise<Match>;
  getMatchesByUser(userId: number): Promise<Match[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserStats(userId: number, won: boolean): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;
    
    if (won) {
      await db.update(users)
        .set({ wins: user.wins + 1 })
        .where(eq(users.id, userId));
    } else {
      await db.update(users)
        .set({ losses: user.losses + 1 })
        .where(eq(users.id, userId));
    }
  }

  async updateUserAvatar(userId: number, avatarColor: string): Promise<void> {
    await db.update(users)
      .set({ avatarColor })
      .where(eq(users.id, userId));
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const result = await db.insert(matches).values(match).returning();
    return result[0];
  }

  async getMatchesByUser(userId: number): Promise<Match[]> {
    const result = await db.select()
      .from(matches)
      .where(eq(matches.player1Id, userId))
      .orderBy(desc(matches.playedAt))
      .limit(20);
    return result;
  }
}

export const storage = new DatabaseStorage();
