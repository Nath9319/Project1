import {
  users,
  groups,
  groupMembers,
  entries,
  entryInteractions,
  groupInvitations,
  type User,
  type UpsertUser,
  type Group,
  type InsertGroup,
  type GroupMember,
  type InsertGroupMember,
  type Entry,
  type InsertEntry,
  type EntryInteraction,
  type InsertEntryInteraction,
  type GroupInvitation,
  type InsertGroupInvitation,
  type EntryWithAuthorAndGroup,
  type GroupWithMembers,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Group operations
  createGroup(group: InsertGroup): Promise<Group>;
  getGroupsByUserId(userId: string): Promise<GroupWithMembers[]>;
  getGroupById(id: number): Promise<GroupWithMembers | undefined>;
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: number, userId: string): Promise<void>;
  updateGroupMemberRole(groupId: number, userId: string, role: string): Promise<void>;

  // Entry operations
  createEntry(entry: InsertEntry): Promise<Entry>;
  getEntriesByUserId(userId: string, limit?: number, offset?: number): Promise<EntryWithAuthorAndGroup[]>;
  getEntriesByGroupId(groupId: number, limit?: number, offset?: number): Promise<EntryWithAuthorAndGroup[]>;
  getEntryById(id: number): Promise<EntryWithAuthorAndGroup | undefined>;
  updateEntry(id: number, updates: Partial<InsertEntry>): Promise<Entry>;
  deleteEntry(id: number): Promise<void>;
  searchEntries(userId: string, query: string, filters?: {
    emotions?: string[];
    tags?: string[];
    groupId?: number;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<EntryWithAuthorAndGroup[]>;

  // Entry interaction operations
  addEntryInteraction(interaction: InsertEntryInteraction): Promise<EntryInteraction>;
  removeEntryInteraction(entryId: number, userId: string, type: string): Promise<void>;
  getEntryInteractions(entryId: number): Promise<EntryInteraction[]>;

  // Group invitation operations
  createGroupInvitation(invitation: InsertGroupInvitation): Promise<GroupInvitation>;
  getGroupInvitationByToken(token: string): Promise<GroupInvitation | undefined>;
  updateGroupInvitationStatus(token: string, status: string): Promise<void>;
  getPendingInvitationsByEmail(email: string): Promise<GroupInvitation[]>;

  // Analytics operations
  getUserMoodStats(userId: string, days: number): Promise<{ emotion: string; count: number }[]>;
  getUserEntryStats(userId: string, days: number): Promise<{ date: string; count: number }[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Group operations
  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    
    // Add creator as admin
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: group.createdBy,
      role: "admin",
    });

    return newGroup;
  }

  async getGroupsByUserId(userId: string): Promise<GroupWithMembers[]> {
    const userGroups = await db
      .select({
        group: groups,
        creator: users,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .innerJoin(users, eq(groups.createdBy, users.id))
      .where(eq(groupMembers.userId, userId));

    const result: GroupWithMembers[] = [];
    
    for (const { group, creator } of userGroups) {
      const members = await db
        .select({
          groupMember: groupMembers,
          user: users,
        })
        .from(groupMembers)
        .innerJoin(users, eq(groupMembers.userId, users.id))
        .where(eq(groupMembers.groupId, group.id));

      const entryCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(entries)
        .where(eq(entries.groupId, group.id));

      result.push({
        ...group,
        creator,
        members: members.map(({ groupMember, user }) => ({
          ...groupMember,
          user,
        })),
        _count: {
          entries: entryCount[0]?.count || 0,
          members: members.length,
        },
      });
    }

    return result;
  }

  async getGroupById(id: number): Promise<GroupWithMembers | undefined> {
    const [groupData] = await db
      .select({
        group: groups,
        creator: users,
      })
      .from(groups)
      .innerJoin(users, eq(groups.createdBy, users.id))
      .where(eq(groups.id, id));

    if (!groupData) return undefined;

    const members = await db
      .select({
        groupMember: groupMembers,
        user: users,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, id));

    const entryCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(entries)
      .where(eq(entries.groupId, id));

    return {
      ...groupData.group,
      creator: groupData.creator,
      members: members.map(({ groupMember, user }) => ({
        ...groupMember,
        user,
      })),
      _count: {
        entries: entryCount[0]?.count || 0,
        members: members.length,
      },
    };
  }

  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const [newMember] = await db.insert(groupMembers).values(member).returning();
    return newMember;
  }

  async removeGroupMember(groupId: number, userId: string): Promise<void> {
    await db
      .delete(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
  }

  async updateGroupMemberRole(groupId: number, userId: string, role: string): Promise<void> {
    await db
      .update(groupMembers)
      .set({ role })
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
  }

  // Entry operations
  async createEntry(entry: InsertEntry): Promise<Entry> {
    const [newEntry] = await db.insert(entries).values(entry).returning();
    return newEntry;
  }

  async getEntriesByUserId(userId: string, limit = 20, offset = 0): Promise<EntryWithAuthorAndGroup[]> {
    const userGroupIds = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    const groupIds = userGroupIds.map(g => g.groupId);

    const entryData = await db
      .select({
        entry: entries,
        author: users,
        group: groups,
      })
      .from(entries)
      .innerJoin(users, eq(entries.authorId, users.id))
      .leftJoin(groups, eq(entries.groupId, groups.id))
      .where(
        or(
          eq(entries.authorId, userId),
          and(
            groupIds.length > 0 ? sql`${entries.groupId} = ANY(${groupIds})` : sql`false`,
            eq(entries.visibility, "group")
          )
        )
      )
      .orderBy(desc(entries.createdAt))
      .limit(limit)
      .offset(offset);

    const result: EntryWithAuthorAndGroup[] = [];
    
    for (const { entry, author, group } of entryData) {
      const interactions = await this.getEntryInteractions(entry.id);
      result.push({
        ...entry,
        author,
        group: group || undefined,
        interactions,
      });
    }

    return result;
  }

  async getEntriesByGroupId(groupId: number, limit = 20, offset = 0): Promise<EntryWithAuthorAndGroup[]> {
    const entryData = await db
      .select({
        entry: entries,
        author: users,
        group: groups,
      })
      .from(entries)
      .innerJoin(users, eq(entries.authorId, users.id))
      .leftJoin(groups, eq(entries.groupId, groups.id))
      .where(eq(entries.groupId, groupId))
      .orderBy(desc(entries.createdAt))
      .limit(limit)
      .offset(offset);

    const result: EntryWithAuthorAndGroup[] = [];
    
    for (const { entry, author, group } of entryData) {
      const interactions = await this.getEntryInteractions(entry.id);
      result.push({
        ...entry,
        author,
        group: group || undefined,
        interactions,
      });
    }

    return result;
  }

  async getEntryById(id: number): Promise<EntryWithAuthorAndGroup | undefined> {
    const [entryData] = await db
      .select({
        entry: entries,
        author: users,
        group: groups,
      })
      .from(entries)
      .innerJoin(users, eq(entries.authorId, users.id))
      .leftJoin(groups, eq(entries.groupId, groups.id))
      .where(eq(entries.id, id));

    if (!entryData) return undefined;

    const interactions = await this.getEntryInteractions(id);

    return {
      ...entryData.entry,
      author: entryData.author,
      group: entryData.group || undefined,
      interactions,
    };
  }

  async updateEntry(id: number, updates: Partial<InsertEntry>): Promise<Entry> {
    const [updatedEntry] = await db
      .update(entries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(entries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteEntry(id: number): Promise<void> {
    await db.delete(entries).where(eq(entries.id, id));
  }

  async searchEntries(
    userId: string,
    query: string,
    filters?: {
      emotions?: string[];
      tags?: string[];
      groupId?: number;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<EntryWithAuthorAndGroup[]> {
    const userGroupIds = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    const groupIds = userGroupIds.map(g => g.groupId);

    let whereConditions = or(
      eq(entries.authorId, userId),
      and(
        entries.groupId ? sql`${entries.groupId} = ANY(${groupIds})` : sql`false`,
        eq(entries.visibility, "group")
      )
    );

    const conditions = [whereConditions];

    if (query) {
      conditions.push(ilike(entries.content, `%${query}%`));
    }

    if (filters?.groupId) {
      conditions.push(eq(entries.groupId, filters.groupId));
    }

    if (filters?.dateFrom) {
      conditions.push(sql`${entries.createdAt} >= ${filters.dateFrom}`);
    }

    if (filters?.dateTo) {
      conditions.push(sql`${entries.createdAt} <= ${filters.dateTo}`);
    }

    const entryData = await db
      .select({
        entry: entries,
        author: users,
        group: groups,
      })
      .from(entries)
      .innerJoin(users, eq(entries.authorId, users.id))
      .leftJoin(groups, eq(entries.groupId, groups.id))
      .where(and(...conditions))
      .orderBy(desc(entries.createdAt))
      .limit(50);

    const result: EntryWithAuthorAndGroup[] = [];
    
    for (const { entry, author, group } of entryData) {
      const interactions = await this.getEntryInteractions(entry.id);
      result.push({
        ...entry,
        author,
        group: group || undefined,
        interactions,
      });
    }

    return result;
  }

  // Entry interaction operations
  async addEntryInteraction(interaction: InsertEntryInteraction): Promise<EntryInteraction> {
    const [newInteraction] = await db.insert(entryInteractions).values(interaction).returning();
    return newInteraction;
  }

  async removeEntryInteraction(entryId: number, userId: string, type: string): Promise<void> {
    await db
      .delete(entryInteractions)
      .where(
        and(
          eq(entryInteractions.entryId, entryId),
          eq(entryInteractions.userId, userId),
          eq(entryInteractions.type, type)
        )
      );
  }

  async getEntryInteractions(entryId: number): Promise<EntryInteraction[]> {
    return await db
      .select()
      .from(entryInteractions)
      .where(eq(entryInteractions.entryId, entryId))
      .orderBy(desc(entryInteractions.createdAt));
  }

  // Group invitation operations
  async createGroupInvitation(invitation: InsertGroupInvitation): Promise<GroupInvitation> {
    const [newInvitation] = await db.insert(groupInvitations).values(invitation).returning();
    return newInvitation;
  }

  async getGroupInvitationByToken(token: string): Promise<GroupInvitation | undefined> {
    const [invitation] = await db
      .select()
      .from(groupInvitations)
      .where(eq(groupInvitations.token, token));
    return invitation;
  }

  async updateGroupInvitationStatus(token: string, status: string): Promise<void> {
    await db
      .update(groupInvitations)
      .set({ status })
      .where(eq(groupInvitations.token, token));
  }

  async getPendingInvitationsByEmail(email: string): Promise<GroupInvitation[]> {
    return await db
      .select()
      .from(groupInvitations)
      .where(and(eq(groupInvitations.email, email), eq(groupInvitations.status, "pending")));
  }

  // Analytics operations
  async getUserMoodStats(userId: string, days: number): Promise<{ emotion: string; count: number }[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const results = await db
      .select({
        emotions: entries.emotions,
      })
      .from(entries)
      .where(
        and(
          eq(entries.authorId, userId),
          sql`${entries.createdAt} >= ${dateThreshold}`
        )
      );

    const emotionCounts: Record<string, number> = {};
    
    results.forEach(({ emotions }) => {
      emotions?.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
    }));
  }

  async getUserEntryStats(userId: string, days: number): Promise<{ date: string; count: number }[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const results = await db
      .select({
        date: sql<string>`DATE(${entries.createdAt})`,
        count: sql<number>`count(*)`,
      })
      .from(entries)
      .where(
        and(
          eq(entries.authorId, userId),
          sql`${entries.createdAt} >= ${dateThreshold}`
        )
      )
      .groupBy(sql`DATE(${entries.createdAt})`)
      .orderBy(sql`DATE(${entries.createdAt})`);

    return results;
  }
}

export const storage = new DatabaseStorage();
