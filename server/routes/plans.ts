import { Router } from "express";
import { db } from "../db";
import { plans, planParticipants, reminders, insertPlanSchema, insertReminderSchema } from "@shared/schema";
import { eq, and, or, desc, gte, lte } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";
import { z } from "zod";

const router = Router();

// Get all plans for the current user
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    // Get plans created by user or where user is a participant
    const userPlans = await db
      .select()
      .from(plans)
      .leftJoin(planParticipants, eq(plans.id, planParticipants.planId))
      .where(
        or(
          eq(plans.createdBy, userId),
          eq(planParticipants.userId, userId)
        )
      )
      .orderBy(desc(plans.scheduledFor));

    res.json(userPlans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ message: "Failed to fetch plans" });
  }
});

// Create a new plan
router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const planData = {
      ...req.body,
      createdBy: userId,
    };

    const validated = insertPlanSchema.parse(planData);
    
    const [newPlan] = await db.insert(plans).values(validated).returning();

    // Add creator as participant
    await db.insert(planParticipants).values({
      planId: newPlan.id,
      userId: userId,
      status: "going",
    });

    // Create reminder if enabled
    if (planData.reminderSettings?.enabled) {
      const reminderTime = new Date(newPlan.scheduledFor);
      reminderTime.setMinutes(reminderTime.getMinutes() - (planData.reminderSettings.minutesBefore || 30));

      await db.insert(reminders).values({
        userId,
        planId: newPlan.id,
        title: `Reminder: ${newPlan.title}`,
        description: newPlan.description,
        reminderTime: reminderTime.toISOString(),
        voiceNote: planData.attachments?.find((a: any) => a.mimeType?.startsWith('audio')),
        videoNote: planData.attachments?.find((a: any) => a.mimeType?.startsWith('video')),
        isActive: true,
      });
    }

    res.json(newPlan);
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({ message: "Failed to create plan" });
  }
});

// Update plan
router.patch("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const planId = parseInt(req.params.id);
    
    // Check if user is the creator
    const [existingPlan] = await db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.createdBy, userId)));

    if (!existingPlan) {
      return res.status(403).json({ message: "Unauthorized to update this plan" });
    }

    const [updatedPlan] = await db
      .update(plans)
      .set({
        ...req.body,
        updatedAt: new Date(),
      })
      .where(eq(plans.id, planId))
      .returning();

    res.json(updatedPlan);
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ message: "Failed to update plan" });
  }
});

// Delete plan
router.delete("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const planId = parseInt(req.params.id);
    
    // Check if user is the creator
    const [existingPlan] = await db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.createdBy, userId)));

    if (!existingPlan) {
      return res.status(403).json({ message: "Unauthorized to delete this plan" });
    }

    await db.delete(plans).where(eq(plans.id, planId));
    res.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    res.status(500).json({ message: "Failed to delete plan" });
  }
});

// Update participant status (RSVP)
router.patch("/:id/rsvp", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const planId = parseInt(req.params.id);
    const { status } = req.body;

    const [participant] = await db
      .update(planParticipants)
      .set({
        status,
        respondedAt: new Date(),
      })
      .where(and(
        eq(planParticipants.planId, planId),
        eq(planParticipants.userId, userId)
      ))
      .returning();

    if (!participant) {
      // Create new participant if not exists
      const [newParticipant] = await db
        .insert(planParticipants)
        .values({
          planId,
          userId,
          status,
          respondedAt: new Date(),
        })
        .returning();
      
      return res.json(newParticipant);
    }

    res.json(participant);
  } catch (error) {
    console.error("Error updating RSVP:", error);
    res.status(500).json({ message: "Failed to update RSVP" });
  }
});

export default router;