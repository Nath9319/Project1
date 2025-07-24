import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replitAuth";
import { insertPlanSchema, insertPlanParticipantSchema, insertReminderSchema } from "@shared/schema";
import { z } from "zod";

export function registerPlanRoutes(app: Express) {
  // Get plans for a group
  app.get("/api/groups/:groupId/plans", isAuthenticated, async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const userId = (req as any).user.claims.sub;
      
      // Check if user is a member of the group
      const member = await storage.getGroupMembership(groupId, userId);
      if (!member) {
        return res.status(403).json({ message: "You are not a member of this group" });
      }
      
      const plans = await storage.getPlansForGroup(groupId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching group plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });
  
  // Get plans for partner space
  app.get("/api/partner/plans", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const partnerSpace = await storage.getPartnerSpace(userId);
      
      if (!partnerSpace) {
        return res.status(404).json({ message: "Partner space not found" });
      }
      
      const plans = await storage.getPlansForPartnerSpace(partnerSpace.id);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching partner plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });
  
  // Get user's plans
  app.get("/api/plans", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const plans = await storage.getPlansForUser(userId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching user plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });
  
  // Create a plan
  app.post("/api/plans", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const planData = insertPlanSchema.extend({
        participants: z.array(z.object({
          userId: z.string(),
          role: z.string().optional(),
          rsvpStatus: z.string().optional()
        })).optional()
      }).parse(req.body);
      
      // Verify user has permission to create plan in the group/partner space
      if (planData.groupId) {
        const member = await storage.getGroupMembership(planData.groupId, userId);
        if (!member) {
          return res.status(403).json({ message: "You are not a member of this group" });
        }
      } else if (planData.partnerSpaceId) {
        const partnerSpace = await storage.getPartnerSpace(userId);
        if (!partnerSpace || partnerSpace.id !== planData.partnerSpaceId) {
          return res.status(403).json({ message: "You don't have access to this partner space" });
        }
      }
      
      // Extract participants from the plan data
      const { participants, ...planDetails } = planData;
      
      // Create the plan
      const plan = await storage.createPlan({
        ...planDetails,
        createdBy: userId
      });
      
      // Add participants if provided
      if (participants && participants.length > 0) {
        const participantsToAdd = participants.map(p => ({
          planId: plan.id,
          userId: p.userId,
          role: p.role || "participant",
          rsvpStatus: p.rsvpStatus || "pending"
        }));
        await storage.addPlanParticipants(participantsToAdd);
      }
      
      // Always add the creator as a participant
      await storage.addPlanParticipants([{
        planId: plan.id,
        userId,
        role: "organizer",
        rsvpStatus: "attending"
      }]);
      
      res.json(plan);
    } catch (error) {
      console.error("Error creating plan:", error);
      res.status(500).json({ message: "Failed to create plan" });
    }
  });
  
  // Update a plan
  app.patch("/api/plans/:planId", isAuthenticated, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const userId = (req as any).user.claims.sub;
      
      // Get the plan to check permissions
      const plans = await storage.getPlansForUser(userId);
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found or you don't have access" });
      }
      
      // Only the creator can update the plan
      if (plan.createdBy !== userId) {
        return res.status(403).json({ message: "Only the organizer can update this plan" });
      }
      
      const updates = insertPlanSchema.partial().parse(req.body);
      const updatedPlan = await storage.updatePlan(planId, updates);
      
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating plan:", error);
      res.status(500).json({ message: "Failed to update plan" });
    }
  });
  
  // Delete a plan
  app.delete("/api/plans/:planId", isAuthenticated, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const userId = (req as any).user.claims.sub;
      
      // Get the plan to check permissions
      const plans = await storage.getPlansForUser(userId);
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found or you don't have access" });
      }
      
      // Only the creator can delete the plan
      if (plan.createdBy !== userId) {
        return res.status(403).json({ message: "Only the organizer can delete this plan" });
      }
      
      await storage.deletePlan(planId);
      res.json({ message: "Plan deleted successfully" });
    } catch (error) {
      console.error("Error deleting plan:", error);
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });
  
  // Update RSVP status
  app.patch("/api/plans/:planId/rsvp", isAuthenticated, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const userId = (req as any).user.claims.sub;
      const { rsvpStatus } = req.body;
      
      if (!rsvpStatus) {
        return res.status(400).json({ message: "RSVP status is required" });
      }
      
      await storage.updateParticipantRsvp(planId, userId, rsvpStatus);
      res.json({ message: "RSVP updated successfully" });
    } catch (error) {
      console.error("Error updating RSVP:", error);
      res.status(500).json({ message: "Failed to update RSVP" });
    }
  });
  
  // Add participants to a plan
  app.post("/api/plans/:planId/participants", isAuthenticated, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const userId = (req as any).user.claims.sub;
      const { participants } = req.body;
      
      // Get the plan to check permissions
      const plans = await storage.getPlansForUser(userId);
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found or you don't have access" });
      }
      
      // Only the creator can add participants
      if (plan.createdBy !== userId) {
        return res.status(403).json({ message: "Only the organizer can add participants" });
      }
      
      const participantsToAdd = participants.map((p: any) => ({
        planId,
        userId: p.userId,
        role: p.role || "participant",
        rsvpStatus: p.rsvpStatus || "pending"
      }));
      
      await storage.addPlanParticipants(participantsToAdd);
      res.json({ message: "Participants added successfully" });
    } catch (error) {
      console.error("Error adding participants:", error);
      res.status(500).json({ message: "Failed to add participants" });
    }
  });
  
  // Remove a participant from a plan
  app.delete("/api/plans/:planId/participants/:participantId", isAuthenticated, async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const participantId = req.params.participantId;
      const userId = (req as any).user.claims.sub;
      
      // Get the plan to check permissions
      const plans = await storage.getPlansForUser(userId);
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found or you don't have access" });
      }
      
      // Only the creator or the participant themselves can remove
      if (plan.createdBy !== userId && participantId !== userId) {
        return res.status(403).json({ message: "You don't have permission to remove this participant" });
      }
      
      await storage.removePlanParticipant(planId, participantId);
      res.json({ message: "Participant removed successfully" });
    } catch (error) {
      console.error("Error removing participant:", error);
      res.status(500).json({ message: "Failed to remove participant" });
    }
  });
}