import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { AVAILABLE_MOODS, getMoodById, shouldResetMood } from "@shared/moods";

export function registerMoodRoutes(app: Express) {
  // Get available moods
  app.get("/api/moods", (req, res) => {
    res.json(AVAILABLE_MOODS);
  });
  
  // Get current user's mood
  app.get("/api/mood", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if mood should be reset
      if (user.currentMood && shouldResetMood(user.moodUpdatedAt, user.lastSleepTime)) {
        await storage.updateUserMood(userId, null, null);
        return res.json({ 
          currentMood: null, 
          moodEmoji: null,
          needsUpdate: true,
          message: "Good morning! How are you feeling today?"
        });
      }
      
      res.json({ 
        currentMood: user.currentMood,
        moodEmoji: user.moodEmoji,
        moodUpdatedAt: user.moodUpdatedAt,
        needsUpdate: !user.currentMood
      });
    } catch (error) {
      console.error("Error fetching user mood:", error);
      res.status(500).json({ message: "Failed to fetch mood" });
    }
  });
  
  // Update current user's mood
  app.post("/api/mood", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const { moodId } = req.body;
      
      if (!moodId) {
        return res.status(400).json({ message: "Mood ID is required" });
      }
      
      const mood = getMoodById(moodId);
      if (!mood) {
        return res.status(400).json({ message: "Invalid mood ID" });
      }
      
      await storage.updateUserMood(userId, mood.id, mood.emoji);
      
      res.json({ 
        message: "Mood updated successfully",
        currentMood: mood.id,
        moodEmoji: mood.emoji
      });
    } catch (error) {
      console.error("Error updating mood:", error);
      res.status(500).json({ message: "Failed to update mood" });
    }
  });
  
  // Clear mood (user can manually clear their mood)
  app.delete("/api/mood", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      
      await storage.updateUserMood(userId, null, null);
      
      res.json({ message: "Mood cleared successfully" });
    } catch (error) {
      console.error("Error clearing mood:", error);
      res.status(500).json({ message: "Failed to clear mood" });
    }
  });
  
  // Get moods for group members
  app.get("/api/groups/:groupId/moods", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const userId = (req as any).user.claims.sub;
      
      // Check if user is a member of the group
      const member = await storage.getGroupMembership(groupId, userId);
      if (!member) {
        return res.status(403).json({ message: "You are not a member of this group" });
      }
      
      // Get group with members
      const group = await storage.getGroupById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      // Get mood data for all members
      const memberIds = group.members.map(m => m.userId);
      const usersWithMoods = await storage.getUsersWithMoods(memberIds);
      
      // Create a map of userId to mood data
      const moodMap = new Map(usersWithMoods.map(u => [
        u.id,
        {
          userId: u.id,
          name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
          currentMood: u.currentMood,
          moodEmoji: u.moodEmoji,
          moodUpdatedAt: u.moodUpdatedAt,
          shouldReset: shouldResetMood(u.moodUpdatedAt, u.lastSleepTime)
        }
      ]));
      
      // Return members with their mood data
      const membersWithMoods = group.members.map(member => ({
        ...member,
        mood: moodMap.get(member.userId) || {
          userId: member.userId,
          name: member.user.firstName || member.user.email,
          currentMood: null,
          moodEmoji: null,
          moodUpdatedAt: null,
          shouldReset: false
        }
      }));
      
      res.json(membersWithMoods);
    } catch (error) {
      console.error("Error fetching group moods:", error);
      res.status(500).json({ message: "Failed to fetch group moods" });
    }
  });
  
  // Get mood for partner
  app.get("/api/partner/mood", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const partnerSpace = await storage.getPartnerSpace(userId);
      
      if (!partnerSpace || !partnerSpace.partner) {
        return res.status(404).json({ message: "No active partner found" });
      }
      
      const partner = partnerSpace.partner;
      
      const moodData = {
        userId: partner.id,
        name: `${partner.firstName || ''} ${partner.lastName || ''}`.trim() || partner.email,
        currentMood: partner.currentMood,
        moodEmoji: partner.moodEmoji,
        moodUpdatedAt: partner.moodUpdatedAt,
        shouldReset: shouldResetMood(partner.moodUpdatedAt, partner.lastSleepTime)
      };
      
      res.json(moodData);
    } catch (error) {
      console.error("Error fetching partner mood:", error);
      res.status(500).json({ message: "Failed to fetch partner mood" });
    }
  });
}