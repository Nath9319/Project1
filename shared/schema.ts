import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  decimal,
  date,
  time,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Groups for collaborative journaling
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#6366F1"),
  icon: varchar("icon", { length: 50 }).default("fas fa-users"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group memberships
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull().default("member"), // admin, co-admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
  addedBy: varchar("added_by").references(() => users.id),
  canViewHistoryBefore: timestamp("can_view_history_before"), // null means can view all history
});

// Journal entries with activity type for color coding
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  groupId: integer("group_id").references(() => groups.id),
  visibility: varchar("visibility", { length: 20 }).notNull().default("private"), // private, group, public
  activityType: varchar("activity_type", { length: 30 }).notNull().default("note"), // note, emotional_trigger, group_insight, reflection, milestone
  emotions: text("emotions").array().default([]),
  tags: text("tags").array().default([]),
  peopleInvolved: text("people_involved").array().default([]),
  attachments: jsonb("attachments").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Entry interactions (likes, comments)
export const entryInteractions = pgTable("entry_interactions", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull().references(() => entries.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // like, comment
  content: text("content"), // for comments
  createdAt: timestamp("created_at").defaultNow(),
});

// Partner space table
export const partnerSpaces = pgTable("partner_spaces", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  partnerId: varchar("partner_id").references(() => users.id),
  status: varchar("status", { enum: ["pending", "active", "declined"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  acceptedAt: timestamp("accepted_at"),
});

// Partner invitations table
export const partnerInvitations = pgTable("partner_invitations", {
  id: serial("id").primaryKey(),
  spaceId: integer("space_id").notNull().references(() => partnerSpaces.id),
  inviterId: varchar("inviter_id").notNull().references(() => users.id),
  inviteeEmail: varchar("invitee_email"),
  inviteeUsername: varchar("invitee_username"),
  message: text("message"),
  token: varchar("token").notNull().unique(),
  status: varchar("status", { enum: ["pending", "accepted", "declined", "expired"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

// Group invitations
export const groupInvitations = pgTable("group_invitations", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  email: varchar("email").notNull(),
  token: varchar("token").notNull().unique(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, accepted, expired
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// History sharing consent - tracks which members consent to share their history with new members
export const historyShareConsent = pgTable("history_share_consent", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  existingMemberId: varchar("existing_member_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  newMemberId: varchar("new_member_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  consentGiven: boolean("consent_given").notNull().default(false),
  consentDate: timestamp("consent_date").defaultNow(),
});

// Group policies and rules
export const groupPolicies = pgTable("group_policies", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, proposed, archived
  proposedBy: varchar("proposed_by").references(() => users.id),
  approvalDays: integer("approval_days").notNull().default(7), // minimum 7 days
  proposedAt: timestamp("proposed_at"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Policy change proposals
export const policyProposals = pgTable("policy_proposals", {
  id: serial("id").primaryKey(),
  policyId: integer("policy_id").notNull().references(() => groupPolicies.id),
  proposedBy: varchar("proposed_by").notNull().references(() => users.id),
  changeType: varchar("change_type", { length: 20 }).notNull(), // edit, new_rule, delete
  proposedContent: text("proposed_content").notNull(),
  approvalDays: integer("approval_days").notNull(), // must be >= current approval days
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, rejected, auto_approved
  createdAt: timestamp("created_at").defaultNow(),
  autoApprovalDate: timestamp("auto_approval_date").notNull(),
});

// Policy votes
export const policyVotes = pgTable("policy_votes", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull().references(() => policyProposals.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  vote: varchar("vote", { length: 10 }).notNull(), // approve, reject
  comment: text("comment"),
  votedAt: timestamp("voted_at").defaultNow(),
});

// Flagged comments for policy violations
export const flaggedComments = pgTable("flagged_comments", {
  id: serial("id").primaryKey(),
  interactionId: integer("interaction_id").notNull().references(() => entryInteractions.id),
  flaggedBy: varchar("flagged_by").notNull().references(() => users.id),
  policyId: integer("policy_id").notNull().references(() => groupPolicies.id),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, under_debate, resolved, dismissed
  createdAt: timestamp("created_at").defaultNow(),
});

// Debates for flagged comments
export const commentDebates = pgTable("comment_debates", {
  id: serial("id").primaryKey(),
  flagId: integer("flag_id").notNull().references(() => flaggedComments.id),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, closed
  adminDecision: text("admin_decision"),
  penalty: varchar("penalty", { length: 50 }), // warning, mute_1d, mute_7d, mute_30d, ban
  decidedBy: varchar("decided_by").references(() => users.id),
  decidedAt: timestamp("decided_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Debate messages
export const debateMessages = pgTable("debate_messages", {
  id: serial("id").primaryKey(),
  debateId: integer("debate_id").notNull().references(() => commentDebates.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Member penalties
export const memberPenalties = pgTable("member_penalties", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  penaltyType: varchar("penalty_type", { length: 50 }).notNull(), // warning, mute, ban
  duration: integer("duration"), // in days, null for permanent
  reason: text("reason").notNull(),
  debateId: integer("debate_id").references(() => commentDebates.id),
  issuedBy: varchar("issued_by").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  groupsCreated: many(groups),
  groupMemberships: many(groupMembers),
  entries: many(entries),
  interactions: many(entryInteractions),
  invitationsSent: many(groupInvitations),
  partnerSpace: one(partnerSpaces),
  partnerInvitationsSent: many(partnerInvitations),
  policyProposals: many(policyProposals),
  policyVotes: many(policyVotes),
  flaggedComments: many(flaggedComments),
  debateMessages: many(debateMessages),
  penalties: many(memberPenalties),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  members: many(groupMembers),
  entries: many(entries),
  invitations: many(groupInvitations),
  policies: many(groupPolicies),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const entriesRelations = relations(entries, ({ one, many }) => ({
  author: one(users, {
    fields: [entries.authorId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [entries.groupId],
    references: [groups.id],
  }),
  interactions: many(entryInteractions),
}));

export const entryInteractionsRelations = relations(entryInteractions, ({ one }) => ({
  entry: one(entries, {
    fields: [entryInteractions.entryId],
    references: [entries.id],
  }),
  user: one(users, {
    fields: [entryInteractions.userId],
    references: [users.id],
  }),
}));

export const groupInvitationsRelations = relations(groupInvitations, ({ one }) => ({
  group: one(groups, {
    fields: [groupInvitations.groupId],
    references: [groups.id],
  }),
  inviter: one(users, {
    fields: [groupInvitations.invitedBy],
    references: [users.id],
  }),
}));

export const historyShareConsentRelations = relations(historyShareConsent, ({ one }) => ({
  group: one(groups, {
    fields: [historyShareConsent.groupId],
    references: [groups.id],
  }),
  existingMember: one(users, {
    fields: [historyShareConsent.existingMemberId],
    references: [users.id],
  }),
  newMember: one(users, {
    fields: [historyShareConsent.newMemberId],
    references: [users.id],
  }),
}));

export const partnerSpacesRelations = relations(partnerSpaces, ({ one, many }) => ({
  user: one(users, {
    fields: [partnerSpaces.userId],
    references: [users.id],
  }),
  partner: one(users, {
    fields: [partnerSpaces.partnerId],
    references: [users.id],
  }),
  invitations: many(partnerInvitations),
}));

// Policy relations
export const groupPoliciesRelations = relations(groupPolicies, ({ one, many }) => ({
  group: one(groups, {
    fields: [groupPolicies.groupId],
    references: [groups.id],
  }),
  proposer: one(users, {
    fields: [groupPolicies.proposedBy],
    references: [users.id],
  }),
  proposals: many(policyProposals),
  flaggedComments: many(flaggedComments),
}));

export const policyProposalsRelations = relations(policyProposals, ({ one, many }) => ({
  policy: one(groupPolicies, {
    fields: [policyProposals.policyId],
    references: [groupPolicies.id],
  }),
  proposedBy: one(users, {
    fields: [policyProposals.proposedBy],
    references: [users.id],
  }),
  votes: many(policyVotes),
}));

export const policyVotesRelations = relations(policyVotes, ({ one }) => ({
  proposal: one(policyProposals, {
    fields: [policyVotes.proposalId],
    references: [policyProposals.id],
  }),
  user: one(users, {
    fields: [policyVotes.userId],
    references: [users.id],
  }),
}));

export const flaggedCommentsRelations = relations(flaggedComments, ({ one }) => ({
  interaction: one(entryInteractions, {
    fields: [flaggedComments.interactionId],
    references: [entryInteractions.id],
  }),
  flaggedBy: one(users, {
    fields: [flaggedComments.flaggedBy],
    references: [users.id],
  }),
  policy: one(groupPolicies, {
    fields: [flaggedComments.policyId],
    references: [groupPolicies.id],
  }),
  debate: one(commentDebates),
}));

export const commentDebatesRelations = relations(commentDebates, ({ one, many }) => ({
  flag: one(flaggedComments, {
    fields: [commentDebates.flagId],
    references: [flaggedComments.id],
  }),
  decidedBy: one(users, {
    fields: [commentDebates.decidedBy],
    references: [users.id],
  }),
  messages: many(debateMessages),
  penalty: one(memberPenalties),
}));

export const debateMessagesRelations = relations(debateMessages, ({ one }) => ({
  debate: one(commentDebates, {
    fields: [debateMessages.debateId],
    references: [commentDebates.id],
  }),
  user: one(users, {
    fields: [debateMessages.userId],
    references: [users.id],
  }),
}));

export const memberPenaltiesRelations = relations(memberPenalties, ({ one }) => ({
  group: one(groups, {
    fields: [memberPenalties.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [memberPenalties.userId],
    references: [users.id],
  }),
  issuedBy: one(users, {
    fields: [memberPenalties.issuedBy],
    references: [users.id],
  }),
  debate: one(commentDebates, {
    fields: [memberPenalties.debateId],
    references: [commentDebates.id],
  }),
}));

export const partnerInvitationsRelations = relations(partnerInvitations, ({ one }) => ({
  space: one(partnerSpaces, {
    fields: [partnerInvitations.spaceId],
    references: [partnerSpaces.id],
  }),
  inviter: one(users, {
    fields: [partnerInvitations.inviterId],
    references: [users.id],
  }),
}));

// Plans and events table - can be for groups or partner spaces
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // event, meeting, appointment, deadline, goal
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  partnerSpaceId: integer("partner_space_id").references(() => partnerSpaces.id, { onDelete: "cascade" }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: varchar("location", { length: 500 }),
  isAllDay: boolean("is_all_day").default(false),
  recurrence: jsonb("recurrence"), // { type: 'daily'|'weekly'|'monthly', interval: number, until?: Date }
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, completed, cancelled
  color: varchar("color", { length: 7 }), // hex color for visual distinction
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Plan participants - who the plan is shared with
export const planParticipants = pgTable("plan_participants", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role", { length: 20 }).notNull().default("participant"), // organizer, participant, viewer
  rsvpStatus: varchar("rsvp_status", { length: 20 }), // accepted, declined, maybe, pending
  notificationEnabled: boolean("notification_enabled").default(true),
  addedAt: timestamp("added_at").defaultNow(),
});

// Reminders for plans or standalone
export const reminders = pgTable("reminders", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => plans.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  reminderTime: timestamp("reminder_time").notNull(),
  notificationMethod: text("notification_method").array().default(["in_app"]), // in_app, email, sms
  isRecurring: boolean("is_recurring").default(false),
  recurrenceRule: jsonb("recurrence_rule"), // similar to plans recurrence
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, sent, dismissed
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings - for appointments, reservations, etc.
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => plans.id),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // restaurant, hotel, flight, appointment, service
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  partnerSpaceId: integer("partner_space_id").references(() => partnerSpaces.id, { onDelete: "cascade" }),
  bookedBy: varchar("booked_by").notNull().references(() => users.id),
  bookingReference: varchar("booking_reference", { length: 255 }),
  venue: varchar("venue", { length: 500 }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  confirmationDetails: jsonb("confirmation_details"),
  attachments: text("attachments").array(), // URLs to uploaded documents/images
  status: varchar("status", { length: 20 }).notNull().default("confirmed"), // pending, confirmed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Booking shares - control who can see specific bookings
export const bookingShares = pgTable("booking_shares", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  sharedWithUserId: varchar("shared_with_user_id").references(() => users.id),
  sharedWithGroupId: integer("shared_with_group_id").references(() => groups.id),
  canEdit: boolean("can_edit").default(false),
  sharedAt: timestamp("shared_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({ id: true, joinedAt: true });
export const insertEntrySchema = createInsertSchema(entries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEntryInteractionSchema = createInsertSchema(entryInteractions).omit({ id: true, createdAt: true });
export const insertGroupInvitationSchema = createInsertSchema(groupInvitations).omit({ id: true, createdAt: true });
export const insertHistoryShareConsentSchema = createInsertSchema(historyShareConsent).omit({ id: true, consentDate: true });
export const insertPartnerSpaceSchema = createInsertSchema(partnerSpaces).omit({ id: true, createdAt: true, acceptedAt: true });
export const insertPartnerInvitationSchema = createInsertSchema(partnerInvitations).omit({ id: true, createdAt: true });
export const insertGroupPolicySchema = createInsertSchema(groupPolicies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPolicyProposalSchema = createInsertSchema(policyProposals).omit({ id: true, createdAt: true });
export const insertPolicyVoteSchema = createInsertSchema(policyVotes).omit({ id: true, votedAt: true });
export const insertFlaggedCommentSchema = createInsertSchema(flaggedComments).omit({ id: true, createdAt: true });
export const insertCommentDebateSchema = createInsertSchema(commentDebates).omit({ id: true, createdAt: true });
export const insertDebateMessageSchema = createInsertSchema(debateMessages).omit({ id: true, createdAt: true });
export const insertMemberPenaltySchema = createInsertSchema(memberPenalties).omit({ id: true, createdAt: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPlanParticipantSchema = createInsertSchema(planParticipants).omit({ id: true, addedAt: true });
export const insertReminderSchema = createInsertSchema(reminders).omit({ id: true, createdAt: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true });
export const insertBookingShareSchema = createInsertSchema(bookingShares).omit({ id: true, sharedAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type Entry = typeof entries.$inferSelect;
export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type EntryInteraction = typeof entryInteractions.$inferSelect;
export type InsertEntryInteraction = z.infer<typeof insertEntryInteractionSchema>;
export type GroupInvitation = typeof groupInvitations.$inferSelect;
export type InsertGroupInvitation = z.infer<typeof insertGroupInvitationSchema>;
export type HistoryShareConsent = typeof historyShareConsent.$inferSelect;
export type InsertHistoryShareConsent = z.infer<typeof insertHistoryShareConsentSchema>;
export type PartnerSpace = typeof partnerSpaces.$inferSelect;
export type InsertPartnerSpace = z.infer<typeof insertPartnerSpaceSchema>;
export type PartnerInvitation = typeof partnerInvitations.$inferSelect;
export type InsertPartnerInvitation = z.infer<typeof insertPartnerInvitationSchema>;
export type GroupPolicy = typeof groupPolicies.$inferSelect;
export type InsertGroupPolicy = z.infer<typeof insertGroupPolicySchema>;
export type PolicyProposal = typeof policyProposals.$inferSelect;
export type InsertPolicyProposal = z.infer<typeof insertPolicyProposalSchema>;
export type PolicyVote = typeof policyVotes.$inferSelect;
export type InsertPolicyVote = z.infer<typeof insertPolicyVoteSchema>;
export type FlaggedComment = typeof flaggedComments.$inferSelect;
export type InsertFlaggedComment = z.infer<typeof insertFlaggedCommentSchema>;
export type CommentDebate = typeof commentDebates.$inferSelect;
export type InsertCommentDebate = z.infer<typeof insertCommentDebateSchema>;
export type DebateMessage = typeof debateMessages.$inferSelect;
export type InsertDebateMessage = z.infer<typeof insertDebateMessageSchema>;
export type MemberPenalty = typeof memberPenalties.$inferSelect;
export type InsertMemberPenalty = z.infer<typeof insertMemberPenaltySchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type PlanParticipant = typeof planParticipants.$inferSelect;
export type InsertPlanParticipant = z.infer<typeof insertPlanParticipantSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type BookingShare = typeof bookingShares.$inferSelect;
export type InsertBookingShare = z.infer<typeof insertBookingShareSchema>;

// Extended types with relations
export type EntryWithAuthorAndGroup = Entry & {
  author: User;
  group?: Group;
  interactions: EntryInteraction[];
};

export type GroupWithMembers = Group & {
  creator: User;
  members: (GroupMember & { user: User })[];
  _count?: {
    entries: number;
    members: number;
  };
};

export type PartnerSpaceWithPartner = PartnerSpace & {
  partner?: User;
  invitations?: PartnerInvitation[];
};

// Plans relations
export const plansRelations = relations(plans, ({ one, many }) => ({
  group: one(groups, {
    fields: [plans.groupId],
    references: [groups.id],
  }),
  partnerSpace: one(partnerSpaces, {
    fields: [plans.partnerSpaceId],
    references: [partnerSpaces.id],
  }),
  creator: one(users, {
    fields: [plans.createdBy],
    references: [users.id],
  }),
  participants: many(planParticipants),
  reminders: many(reminders),
}));

export const planParticipantsRelations = relations(planParticipants, ({ one }) => ({
  plan: one(plans, {
    fields: [planParticipants.planId],
    references: [plans.id],
  }),
  user: one(users, {
    fields: [planParticipants.userId],
    references: [users.id],
  }),
}));

export const remindersRelations = relations(reminders, ({ one }) => ({
  plan: one(plans, {
    fields: [reminders.planId],
    references: [plans.id],
  }),
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  plan: one(plans, {
    fields: [bookings.planId],
    references: [plans.id],
  }),
  group: one(groups, {
    fields: [bookings.groupId],
    references: [groups.id],
  }),
  partnerSpace: one(partnerSpaces, {
    fields: [bookings.partnerSpaceId],
    references: [partnerSpaces.id],
  }),
  bookedBy: one(users, {
    fields: [bookings.bookedBy],
    references: [users.id],
  }),
  shares: many(bookingShares),
}));

export const bookingSharesRelations = relations(bookingShares, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingShares.bookingId],
    references: [bookings.id],
  }),
  sharedWithUser: one(users, {
    fields: [bookingShares.sharedWithUserId],
    references: [users.id],
  }),
  sharedWithGroup: one(groups, {
    fields: [bookingShares.sharedWithGroupId],
    references: [groups.id],
  }),
}));
