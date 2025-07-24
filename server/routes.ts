import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { uploadMultiple } from "./middleware/upload";
import path from "path";
import {
  insertGroupSchema,
  insertEntrySchema,
  insertEntryInteractionSchema,
  insertGroupInvitationSchema,
} from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files statically
  app.use('/uploads', express.static('uploads'));

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // File upload endpoint
  app.post('/api/upload', isAuthenticated, uploadMultiple, async (req: any, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const attachments = req.files.map((file: Express.Multer.File) => ({
        type: file.mimetype.startsWith('image/') ? 'image' : 
              file.mimetype.startsWith('audio/') ? 'audio' :
              file.mimetype.startsWith('video/') ? 'video' : 'document',
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        size: file.size,
        mimeType: file.mimetype,
      }));

      res.json({ attachments });
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  // Group routes
  app.post("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupData = insertGroupSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const group = await storage.createGroup(groupData);
      const groupWithMembers = await storage.getGroupById(group.id);
      
      res.json(groupWithMembers);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(400).json({ message: "Failed to create group" });
    }
  });

  app.get("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getGroupsByUserId(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroupById(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      // Check if user is a member
      const userId = req.user.claims.sub;
      const isMember = group.members.some(member => member.userId === userId);
      
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  // Get group entries
  app.get("/api/groups/:id/entries", isAuthenticated, async (req: any, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Check if user is member of the group
      const group = await storage.getGroupById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      const isMember = group.members.some(member => member.userId === userId);
      if (!isMember) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const entries = await storage.getGroupEntries(groupId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching group entries:", error);
      res.status(500).json({ message: "Failed to fetch group entries" });
    }
  });

  // Group invitation routes
  app.post("/api/groups/:id/invite", isAuthenticated, async (req: any, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user is admin of the group
      const group = await storage.getGroupById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const userMembership = group.members.find(member => member.userId === userId);
      if (!userMembership || userMembership.role !== "admin") {
        return res.status(403).json({ message: "Only group admins can send invitations" });
      }

      const token = nanoid(32);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const invitation = await storage.createGroupInvitation({
        groupId,
        invitedBy: userId,
        email,
        token,
        expiresAt,
      });

      // TODO: Send email invitation
      // For now, return the token for testing
      res.json({ 
        message: "Invitation sent successfully",
        invitationToken: token // Remove this in production
      });
    } catch (error) {
      console.error("Error sending invitation:", error);
      res.status(500).json({ message: "Failed to send invitation" });
    }
  });

  app.post("/api/invitations/:token/accept", isAuthenticated, async (req: any, res) => {
    try {
      const { token } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (!user?.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      const invitation = await storage.getGroupInvitationByToken(token);
      
      if (!invitation) {
        return res.status(404).json({ message: "Invitation not found" });
      }

      if (invitation.status !== "pending") {
        return res.status(400).json({ message: "Invitation is no longer valid" });
      }

      if (invitation.email !== user.email) {
        return res.status(403).json({ message: "Invitation is not for this email address" });
      }

      if (new Date() > invitation.expiresAt) {
        await storage.updateGroupInvitationStatus(token, "expired");
        return res.status(400).json({ message: "Invitation has expired" });
      }

      // Add user to group
      await storage.addGroupMember({
        groupId: invitation.groupId,
        userId,
        role: "member",
      });

      // Update invitation status
      await storage.updateGroupInvitationStatus(token, "accepted");

      const group = await storage.getGroupById(invitation.groupId);
      res.json({ message: "Successfully joined group", group });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(500).json({ message: "Failed to accept invitation" });
    }
  });

  // Entry routes
  app.post("/api/entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertEntrySchema.parse({
        ...req.body,
        authorId: userId,
      });

      // Validate group membership if groupId is provided
      if (entryData.groupId) {
        const group = await storage.getGroupById(entryData.groupId);
        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }

        const isMember = group.members.some(member => member.userId === userId);
        if (!isMember) {
          return res.status(403).json({ message: "You are not a member of this group" });
        }
      }

      const entry = await storage.createEntry(entryData);
      const entryWithDetails = await storage.getEntryById(entry.id);
      
      res.json(entryWithDetails);
    } catch (error) {
      console.error("Error creating entry:", error);
      res.status(400).json({ message: "Failed to create entry" });
    }
  });

  app.get("/api/entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;

      let entries;
      if (groupId) {
        // Validate group membership
        const group = await storage.getGroupById(groupId);
        if (!group) {
          return res.status(404).json({ message: "Group not found" });
        }

        const isMember = group.members.some(member => member.userId === userId);
        if (!isMember) {
          return res.status(403).json({ message: "You are not a member of this group" });
        }

        entries = await storage.getEntriesByGroupId(groupId, limit, offset);
      } else {
        entries = await storage.getEntriesByUserId(userId, limit, offset);
      }

      res.json(entries);
    } catch (error) {
      console.error("Error fetching entries:", error);
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  app.get("/api/entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const entry = await storage.getEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      // Check access permissions
      let hasAccess = false;
      
      if (entry.authorId === userId) {
        hasAccess = true;
      } else if (entry.visibility === "group" && entry.groupId) {
        const group = await storage.getGroupById(entry.groupId);
        hasAccess = group?.members.some(member => member.userId === userId) || false;
      }

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(entry);
    } catch (error) {
      console.error("Error fetching entry:", error);
      res.status(500).json({ message: "Failed to fetch entry" });
    }
  });

  app.put("/api/entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const entry = await storage.getEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      if (entry.authorId !== userId) {
        return res.status(403).json({ message: "You can only edit your own entries" });
      }

      const updateData = insertEntrySchema.partial().parse(req.body);
      const updatedEntry = await storage.updateEntry(entryId, updateData);
      const entryWithDetails = await storage.getEntryById(updatedEntry.id);
      
      res.json(entryWithDetails);
    } catch (error) {
      console.error("Error updating entry:", error);
      res.status(400).json({ message: "Failed to update entry" });
    }
  });

  app.delete("/api/entries/:id", isAuthenticated, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const entry = await storage.getEntryById(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      if (entry.authorId !== userId) {
        return res.status(403).json({ message: "You can only delete your own entries" });
      }

      await storage.deleteEntry(entryId);
      res.json({ message: "Entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting entry:", error);
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Entry interaction routes
  app.post("/api/entries/:id/interactions", isAuthenticated, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const interactionData = insertEntryInteractionSchema.parse({
        ...req.body,
        entryId,
        userId,
      });

      // Validate entry access
      const entry = await storage.getEntryById(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      let hasAccess = false;
      if (entry.authorId === userId) {
        hasAccess = true;
      } else if (entry.visibility === "group" && entry.groupId) {
        const group = await storage.getGroupById(entry.groupId);
        hasAccess = group?.members.some(member => member.userId === userId) || false;
      }

      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      const interaction = await storage.addEntryInteraction(interactionData);
      res.json(interaction);
    } catch (error) {
      console.error("Error adding interaction:", error);
      res.status(400).json({ message: "Failed to add interaction" });
    }
  });

  app.delete("/api/entries/:id/interactions/:type", isAuthenticated, async (req: any, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { type } = req.params;

      await storage.removeEntryInteraction(entryId, userId, type);
      res.json({ message: "Interaction removed successfully" });
    } catch (error) {
      console.error("Error removing interaction:", error);
      res.status(500).json({ message: "Failed to remove interaction" });
    }
  });

  // Search routes
  app.get("/api/search/entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.q as string || "";
      const emotions = req.query.emotions ? (req.query.emotions as string).split(",") : undefined;
      const tags = req.query.tags ? (req.query.tags as string).split(",") : undefined;
      const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

      const entries = await storage.searchEntries(userId, query, {
        emotions,
        tags,
        groupId,
        dateFrom,
        dateTo,
      });

      res.json(entries);
    } catch (error) {
      console.error("Error searching entries:", error);
      res.status(500).json({ message: "Failed to search entries" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/mood", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 30;

      const moodStats = await storage.getUserMoodStats(userId, days);
      res.json(moodStats);
    } catch (error) {
      console.error("Error fetching mood stats:", error);
      res.status(500).json({ message: "Failed to fetch mood statistics" });
    }
  });

  app.get("/api/analytics/entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 30;

      const entryStats = await storage.getUserEntryStats(userId, days);
      res.json(entryStats);
    } catch (error) {
      console.error("Error fetching entry stats:", error);
      res.status(500).json({ message: "Failed to fetch entry statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
