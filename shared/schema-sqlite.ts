import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  index,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON stored as text
    expire: integer("expire", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  })
);

// User storage table for Replit Auth
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  currentMood: text("current_mood"),
  moodEmoji: text("mood_emoji"),
  moodUpdatedAt: integer("mood_updated_at", { mode: "timestamp_ms" }),
  lastSleepTime: integer("last_sleep_time", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Groups for collaborative journaling
export const groups = sqliteTable("groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#6366F1"),
  icon: text("icon").default("fas fa-users"),
  createdBy: text("created_by").notNull().references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Group memberships
export const groupMembers = sqliteTable("group_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // admin, co-admin, member
  joinedAt: integer("joined_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
  addedBy: text("added_by").references(() => users.id),
  canViewHistoryBefore: integer("can_view_history_before", { mode: "timestamp_ms" }), // null means can view all history
});

// Journal entries with activity type for color coding
export const entries = sqliteTable("entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  content: text("content").notNull(),
  authorId: text("author_id").notNull().references(() => users.id),
  groupId: integer("group_id").references(() => groups.id),
  visibility: text("visibility").notNull().default("private"), // private, group, public
  activityType: text("activity_type").notNull().default("note"), // note, emotional_trigger, group_insight, reflection, milestone
  emotions: text("emotions"), // JSON array stored as text
  tags: text("tags"), // JSON array stored as text
  peopleInvolved: text("people_involved"), // JSON array stored as text
  attachments: text("attachments"), // JSON array stored as text
  location: text("location"), // JSON object stored as text
  color: text("color").default("blue"), // User-selected color for calendar display
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Entry interactions (likes, comments)
export const entryInteractions = sqliteTable("entry_interactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entryId: integer("entry_id").notNull().references(() => entries.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // like, comment
  content: text("content"), // for comments
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Partner space table
export const partnerSpaces = sqliteTable("partner_spaces", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  partnerId: text("partner_id").references(() => users.id),
  status: text("status").notNull().default("pending"), // pending, active, declined
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
  acceptedAt: integer("accepted_at", { mode: "timestamp_ms" }),
});

// Partner invitations table
export const partnerInvitations = sqliteTable("partner_invitations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  spaceId: integer("space_id").notNull().references(() => partnerSpaces.id),
  inviterId: text("inviter_id").notNull().references(() => users.id),
  inviteeEmail: text("invitee_email"),
  inviteeUsername: text("invitee_username"),
  message: text("message"),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, accepted, declined, expired
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

// Group invitations
export const groupInvitations = sqliteTable("group_invitations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  invitedBy: text("invited_by").notNull().references(() => users.id),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, accepted, expired
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// History sharing consent - tracks which members consent to share their history with new members
export const historyShareConsent = sqliteTable("history_share_consent", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  existingMemberId: text("existing_member_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  newMemberId: text("new_member_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  consentGiven: integer("consent_given", { mode: "boolean" }).notNull().default(false),
  consentDate: integer("consent_date", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Plans and reminders
export const plans = sqliteTable("plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  createdBy: text("created_by").notNull().references(() => users.id),
  groupId: integer("group_id").references(() => groups.id),
  partnerSpaceId: integer("partner_space_id").references(() => partnerSpaces.id),
  visibility: text("visibility").notNull().default("private"), // private, group, partner
  scheduledFor: integer("scheduled_for", { mode: "timestamp_ms" }).notNull(),
  location: text("location"), // JSON object stored as text
  attachments: text("attachments"), // JSON array stored as text
  reminderSettings: text("reminder_settings"), // JSON object stored as text
  status: text("status").notNull().default("active"), // active, completed, cancelled
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Plan participants (for RSVPs)
export const planParticipants = sqliteTable("plan_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  status: text("status").notNull().default("invited"), // invited, going, maybe, declined
  respondedAt: integer("responded_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Reminders
export const reminders = sqliteTable("reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  planId: integer("plan_id").references(() => plans.id, { onDelete: "cascade" }),
  entryId: integer("entry_id").references(() => entries.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  reminderTime: integer("reminder_time", { mode: "timestamp_ms" }).notNull(),
  voiceNote: text("voice_note"), // JSON object stored as text
  videoNote: text("video_note"), // JSON object stored as text
  repeatPattern: text("repeat_pattern"), // none, daily, weekly, monthly
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastTriggered: integer("last_triggered", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Group policies and rules
export const groupPolicies = sqliteTable("group_policies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  status: text("status").notNull().default("active"), // active, proposed, archived
  proposedBy: text("proposed_by").references(() => users.id),
  approvalDays: integer("approval_days").notNull().default(7), // minimum 7 days
  proposedAt: integer("proposed_at", { mode: "timestamp_ms" }),
  approvedAt: integer("approved_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Policy change proposals
export const policyProposals = sqliteTable("policy_proposals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  policyId: integer("policy_id").notNull().references(() => groupPolicies.id),
  proposedBy: text("proposed_by").notNull().references(() => users.id),
  changeType: text("change_type").notNull(), // edit, new_rule, delete
  proposedContent: text("proposed_content").notNull(),
  approvalDays: integer("approval_days").notNull(), // must be >= current approval days
  status: text("status").notNull().default("pending"), // pending, approved, rejected, auto_approved
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
  autoApprovalDate: integer("auto_approval_date", { mode: "timestamp_ms" }).notNull(),
});

// Policy votes
export const policyVotes = sqliteTable("policy_votes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  proposalId: integer("proposal_id").notNull().references(() => policyProposals.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  vote: text("vote").notNull(), // approve, reject
  comment: text("comment"),
  votedAt: integer("voted_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Flagged comments for policy violations
export const flaggedComments = sqliteTable("flagged_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  interactionId: integer("interaction_id").notNull().references(() => entryInteractions.id),
  flaggedBy: text("flagged_by").notNull().references(() => users.id),
  policyId: integer("policy_id").notNull().references(() => groupPolicies.id),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending, under_debate, resolved, dismissed
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Debates for flagged comments
export const commentDebates = sqliteTable("comment_debates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  flagId: integer("flag_id").notNull().references(() => flaggedComments.id),
  status: text("status").notNull().default("active"), // active, closed
  adminDecision: text("admin_decision"),
  penalty: text("penalty"), // warning, mute_1d, mute_7d, mute_30d, ban
  decidedBy: text("decided_by").references(() => users.id),
  decidedAt: integer("decided_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Debate messages
export const debateMessages = sqliteTable("debate_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  debateId: integer("debate_id").notNull().references(() => commentDebates.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Member penalties
export const memberPenalties = sqliteTable("member_penalties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupId: integer("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id),
  penaltyType: text("penalty_type").notNull(), // warning, mute, ban
  duration: integer("duration"), // in days, null for permanent
  reason: text("reason").notNull(),
  debateId: integer("debate_id").references(() => commentDebates.id),
  issuedBy: text("issued_by").notNull().references(() => users.id),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Bookings - for appointments, reservations, etc.
export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id").references(() => plans.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // restaurant, hotel, flight, appointment, service
  groupId: integer("group_id").references(() => groups.id, { onDelete: "cascade" }),
  partnerSpaceId: integer("partner_space_id").references(() => partnerSpaces.id, { onDelete: "cascade" }),
  bookedBy: text("booked_by").notNull().references(() => users.id),
  bookingReference: text("booking_reference"),
  venue: text("venue"),
  startTime: integer("start_time", { mode: "timestamp_ms" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp_ms" }),
  cost: real("cost"),
  currency: text("currency").default("USD"),
  confirmationDetails: text("confirmation_details"), // JSON stored as text
  attachments: text("attachments"), // JSON array stored as text
  status: text("status").notNull().default("confirmed"), // pending, confirmed, cancelled
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Booking shares - control who can see specific bookings
export const bookingShares = sqliteTable("booking_shares", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookingId: integer("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  sharedWithUserId: text("shared_with_user_id").references(() => users.id),
  sharedWithGroupId: integer("shared_with_group_id").references(() => groups.id),
  canEdit: integer("can_edit", { mode: "boolean" }).default(false),
  sharedAt: integer("shared_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => Date.now()),
});

// Relations (keeping the same structure as PostgreSQL version)
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
  plans: many(plans),
  reminders: many(reminders),
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
  reminders: many(reminders),
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

// Plans relations
export const plansRelations = relations(plans, ({ one, many }) => ({
  creator: one(users, {
    fields: [plans.createdBy],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [plans.groupId],
    references: [groups.id],
  }),
  partnerSpace: one(partnerSpaces, {
    fields: [plans.partnerSpaceId],
    references: [partnerSpaces.id],
  }),
  participants: many(planParticipants),
  reminders: many(reminders),
}));

// Plan participants relations
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

// Reminders relations
export const remindersRelations = relations(reminders, ({ one }) => ({
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [reminders.planId],
    references: [plans.id],
  }),
  entry: one(entries, {
    fields: [reminders.entryId],
    references: [entries.id],
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
export const insertPlanParticipantSchema = createInsertSchema(planParticipants).omit({ id: true, createdAt: true });
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
export type InsertPlan = typeof plans.$inferInsert;
export type PlanParticipant = typeof planParticipants.$inferSelect;
export type InsertPlanParticipant = typeof planParticipants.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = typeof reminders.$inferInsert;

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
