import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { insertReminderSchema } from "@shared/schema";

export function registerReminderRoutes(app: Express) {
  // Get user's reminders
  app.get("/api/reminders", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const reminders = await storage.getRemindersForUser(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });
  
  // Get upcoming reminders
  app.get("/api/reminders/upcoming", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const reminders = await storage.getUpcomingReminders(userId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching upcoming reminders:", error);
      res.status(500).json({ message: "Failed to fetch upcoming reminders" });
    }
  });
  
  // Create a reminder
  app.post("/api/reminders", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const reminderData = insertReminderSchema.parse(req.body);
      
      // If the reminder is for a plan, verify the user has access to it
      if (reminderData.planId) {
        const plans = await storage.getPlansForUser(userId);
        const plan = plans.find(p => p.id === reminderData.planId);
        if (!plan) {
          return res.status(403).json({ message: "You don't have access to this plan" });
        }
      }
      
      const reminder = await storage.createReminder({
        ...reminderData,
        userId
      });
      
      res.json(reminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });
  
  // Update a reminder
  app.patch("/api/reminders/:reminderId", isAuthenticated, async (req, res) => {
    try {
      const reminderId = parseInt(req.params.reminderId);
      const userId = (req as any).user.claims.sub;
      
      // Get the reminder to check ownership
      const reminders = await storage.getRemindersForUser(userId);
      const reminder = reminders.find(r => r.id === reminderId);
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      const updates = insertReminderSchema.partial().parse(req.body);
      const updatedReminder = await storage.updateReminder(reminderId, updates);
      
      res.json(updatedReminder);
    } catch (error) {
      console.error("Error updating reminder:", error);
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });
  
  // Delete a reminder
  app.delete("/api/reminders/:reminderId", isAuthenticated, async (req, res) => {
    try {
      const reminderId = parseInt(req.params.reminderId);
      const userId = (req as any).user.claims.sub;
      
      // Get the reminder to check ownership
      const reminders = await storage.getRemindersForUser(userId);
      const reminder = reminders.find(r => r.id === reminderId);
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      await storage.deleteReminder(reminderId);
      res.json({ message: "Reminder deleted successfully" });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      res.status(500).json({ message: "Failed to delete reminder" });
    }
  });
  
  // Mark reminder as completed
  app.patch("/api/reminders/:reminderId/complete", isAuthenticated, async (req, res) => {
    try {
      const reminderId = parseInt(req.params.reminderId);
      const userId = (req as any).user.claims.sub;
      
      // Get the reminder to check ownership
      const reminders = await storage.getRemindersForUser(userId);
      const reminder = reminders.find(r => r.id === reminderId);
      
      if (!reminder) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      
      const updatedReminder = await storage.updateReminder(reminderId, {
        status: "completed"
      });
      
      res.json(updatedReminder);
    } catch (error) {
      console.error("Error completing reminder:", error);
      res.status(500).json({ message: "Failed to complete reminder" });
    }
  });
}