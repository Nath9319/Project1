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
  role: varchar("role", { length: 20 }).notNull().default("member"), // admin, member, view-only
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Journal entries
export const entries = pgTable("entries", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  groupId: integer("group_id").references(() => groups.id),
  visibility: varchar("visibility", { length: 20 }).notNull().default("private"), // private, group, public
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  groupsCreated: many(groups),
  groupMemberships: many(groupMembers),
  entries: many(entries),
  interactions: many(entryInteractions),
  invitationsSent: many(groupInvitations),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  members: many(groupMembers),
  entries: many(entries),
  invitations: many(groupInvitations),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertGroupSchema = createInsertSchema(groups).omit({ id: true, createdAt: true, updatedAt: true });
export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({ id: true, joinedAt: true });
export const insertEntrySchema = createInsertSchema(entries).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEntryInteractionSchema = createInsertSchema(entryInteractions).omit({ id: true, createdAt: true });
export const insertGroupInvitationSchema = createInsertSchema(groupInvitations).omit({ id: true, createdAt: true });

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
