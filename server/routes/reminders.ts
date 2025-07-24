import { Router } from "express";
import { db } from "../db";
import { reminders, plans, insertReminderSchema } from "@shared/schema";
import { eq, and, desc, lte } from "drizzle-orm";
import { isAuthenticated } from "../replitAuth";

const router = Router();

// Get all reminders for the current user
router.get("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const userReminders = await db
      .select()
      .from(reminders)
      .leftJoin(plans, eq(reminders.planId, plans.id))
      .where(eq(reminders.userId, userId))
      .orderBy(desc(reminders.reminderTime));

    res.json(userReminders);
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
});

// Get active reminders (due now or past due)
router.get("/active", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const now = new Date();
    
    const activeReminders = await db
      .select({
        reminder: reminders,
        plan: plans,
      })
      .from(reminders)
      .leftJoin(plans, eq(reminders.planId, plans.id))
      .where(
        and(
          eq(reminders.userId, userId),
          eq(reminders.isActive, true),
          lte(reminders.reminderTime, now)
        )
      )
      .orderBy(reminders.reminderTime);

    res.json(activeReminders);
  } catch (error) {
    console.error("Error fetching active reminders:", error);
    res.status(500).json({ message: "Failed to fetch active reminders" });
  }
});

// Create a new reminder
router.post("/", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const reminderData = {
      ...req.body,
      userId,
    };

    const validated = insertReminderSchema.parse(reminderData);
    
    const [newReminder] = await db.insert(reminders).values(validated).returning();

    res.json(newReminder);
  } catch (error) {
    console.error("Error creating reminder:", error);
    res.status(500).json({ message: "Failed to create reminder" });
  }
});

// Update reminder
router.patch("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const reminderId = parseInt(req.params.id);
    
    // Check if user owns the reminder
    const [existingReminder] = await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)));

    if (!existingReminder) {
      return res.status(403).json({ message: "Unauthorized to update this reminder" });
    }

    const [updatedReminder] = await db
      .update(reminders)
      .set(req.body)
      .where(eq(reminders.id, reminderId))
      .returning();

    res.json(updatedReminder);
  } catch (error) {
    console.error("Error updating reminder:", error);
    res.status(500).json({ message: "Failed to update reminder" });
  }
});

// Delete reminder
router.delete("/:id", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const reminderId = parseInt(req.params.id);
    
    // Check if user owns the reminder
    const [existingReminder] = await db
      .select()
      .from(reminders)
      .where(and(eq(reminders.id, reminderId), eq(reminders.userId, userId)));

    if (!existingReminder) {
      return res.status(403).json({ message: "Unauthorized to delete this reminder" });
    }

    await db.delete(reminders).where(eq(reminders.id, reminderId));
    res.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    res.status(500).json({ message: "Failed to delete reminder" });
  }
});

export default router;