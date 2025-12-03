import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { insertUserSchema, insertMatchSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input" });
      }
      
      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
      const user = await storage.createUser({
        ...parsed.data,
        password: hashedPassword,
      });
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  app.patch("/api/users/:id/avatar", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { avatarColor } = req.body;
      
      if (!avatarColor) {
        return res.status(400).json({ message: "Avatar color required" });
      }
      
      await storage.updateUserAvatar(userId, avatarColor);
      res.json({ success: true });
    } catch (error) {
      console.error("Update avatar error:", error);
      res.status(500).json({ message: "Failed to update avatar" });
    }
  });
  
  app.post("/api/matches", async (req, res) => {
    try {
      const parsed = insertMatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid match data" });
      }
      
      const match = await storage.createMatch(parsed.data);
      
      const won = parsed.data.winnerId === parsed.data.player1Id;
      await storage.updateUserStats(parsed.data.player1Id, won);
      
      res.json(match);
    } catch (error) {
      console.error("Create match error:", error);
      res.status(500).json({ message: "Failed to record match" });
    }
  });
  
  app.get("/api/matches/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const matches = await storage.getMatchesByUser(userId);
      res.json(matches);
    } catch (error) {
      console.error("Get matches error:", error);
      res.status(500).json({ message: "Failed to get matches" });
    }
  });

  return httpServer;
}
