import {
  users,
  groups,
  groupMembers,
  entries,
  entryInteractions,
  groupInvitations,
  historyShareConsent,
  partnerSpaces,
  partnerInvitations,
  groupPolicies,
  policyProposals,
  policyVotes,
  flaggedComments,
  commentDebates,
  debateMessages,
  memberPenalties,
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
  type HistoryShareConsent,
  type InsertHistoryShareConsent,
  type PartnerSpace,
  type InsertPartnerSpace,
  type PartnerInvitation,
  type InsertPartnerInvitation,
  type PartnerSpaceWithPartner,
  type GroupPolicy,
  type InsertGroupPolicy,
  type PolicyProposal,
  type InsertPolicyProposal,
  type PolicyVote,
  type InsertPolicyVote,
  type FlaggedComment,
  type InsertFlaggedComment,
  type CommentDebate,
  type InsertCommentDebate,
  type DebateMessage,
  type InsertDebateMessage,
  type MemberPenalty,
  type InsertMemberPenalty,
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
  getGroupEntries(groupId: number, userId?: string): Promise<EntryWithAuthorAndGroup[]>;
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: number, userId: string): Promise<void>;
  updateGroupMemberRole(groupId: number, userId: string, role: string): Promise<void>;
  getGroupMemberRole(groupId: number, userId: string): Promise<string | undefined>;
  
  // History sharing operations
  createHistoryShareConsent(consent: InsertHistoryShareConsent): Promise<HistoryShareConsent>;
  getHistoryShareConsents(groupId: number, newMemberId: string): Promise<HistoryShareConsent[]>;
  updateHistoryShareConsent(groupId: number, existingMemberId: string, newMemberId: string, consentGiven: boolean): Promise<void>;

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
  getUserEntriesForMonth(userId: string, month: string): Promise<Entry[]>;

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
  
  // Partner operations
  getPartnerSpace(userId: string): Promise<PartnerSpaceWithPartner | undefined>;
  createPartnerSpace(userId: string): Promise<PartnerSpace>;
  createPartnerInvitation(data: InsertPartnerInvitation): Promise<PartnerInvitation>;
  findUserByEmail(email: string): Promise<User | undefined>;
  findUserByUsername(username: string): Promise<User | undefined>;

  // Policy operations
  getGroupPolicies(groupId: number): Promise<GroupPolicy[]>;
  getGroupPolicy(policyId: number): Promise<GroupPolicy | undefined>;
  createGroupPolicy(policy: InsertGroupPolicy): Promise<GroupPolicy>;
  updateGroupPolicy(policyId: number, updates: Partial<InsertGroupPolicy>): Promise<GroupPolicy>;
  createPolicyProposal(proposal: InsertPolicyProposal): Promise<PolicyProposal>;
  getPolicyProposal(proposalId: number): Promise<PolicyProposal | undefined>;
  createPolicyVote(vote: InsertPolicyVote): Promise<PolicyVote>;
  getUserPolicyVote(proposalId: number, userId: string): Promise<PolicyVote | undefined>;
  checkPolicyProposalStatus(proposalId: number): Promise<void>;
  
  // Flagging and debate operations
  getEntry(entryId: number): Promise<Entry | undefined>;
  getEntryInteraction(interactionId: number): Promise<EntryInteraction | undefined>;
  createFlaggedComment(flag: InsertFlaggedComment): Promise<FlaggedComment>;
  getFlaggedComment(flagId: number): Promise<FlaggedComment | undefined>;
  createCommentDebate(debate: InsertCommentDebate): Promise<CommentDebate>;
  getDebateWithParticipants(debateId: number): Promise<any>;
  getGroupDebates(groupId: number): Promise<CommentDebate[]>;
  getDebateMessages(debateId: number): Promise<DebateMessage[]>;
  createDebateMessage(message: InsertDebateMessage): Promise<DebateMessage>;
  closeDebate(debateId: number, updates: any): Promise<CommentDebate>;
  
  // Penalty operations
  createMemberPenalty(penalty: InsertMemberPenalty): Promise<MemberPenalty>;
  getGroupPenalties(groupId: number): Promise<MemberPenalty[]>;
  getGroupMembership(groupId: number, userId: string): Promise<GroupMember | undefined>;
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

  async getGroupMemberRole(groupId: number, userId: string): Promise<string | undefined> {
    const [member] = await db
      .select({ role: groupMembers.role })
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
    
    return member?.role;
  }

  async getGroupEntries(groupId: number, userId?: string): Promise<EntryWithAuthorAndGroup[]> {
    const entryData = await db
      .select({
        entry: entries,
        author: users,
        group: groups,
      })
      .from(entries)
      .innerJoin(users, eq(entries.authorId, users.id))
      .leftJoin(groups, eq(entries.groupId, groups.id))
      .where(and(eq(entries.groupId, groupId), eq(entries.visibility, "group")))
      .orderBy(desc(entries.createdAt));

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

  // Entry operations
  async createEntry(entry: InsertEntry): Promise<Entry> {
    const [newEntry] = await db.insert(entries).values(entry).returning();
    return newEntry;
  }

  async getEntriesByUserId(userId: string, limit = 20, offset = 0): Promise<EntryWithAuthorAndGroup[]> {
    // Start with user's own entries
    let query = db
      .select({
        entry: entries,
        author: users,
        group: groups,
      })
      .from(entries)
      .innerJoin(users, eq(entries.authorId, users.id))
      .leftJoin(groups, eq(entries.groupId, groups.id))
      .where(eq(entries.authorId, userId))
      .orderBy(desc(entries.createdAt))
      .limit(limit)
      .offset(offset);

    const entryData = await query;
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

  async getUserEntriesForMonth(userId: string, month: string): Promise<Entry[]> {
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999);
    
    const userEntries = await db
      .select()
      .from(entries)
      .where(
        and(
          eq(entries.authorId, userId),
          sql`${entries.createdAt} >= ${startDate}`,
          sql`${entries.createdAt} <= ${endDate}`
        )
      )
      .orderBy(desc(entries.createdAt));
    
    return userEntries;
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

  // History sharing operations
  async createHistoryShareConsent(consent: InsertHistoryShareConsent): Promise<HistoryShareConsent> {
    const [newConsent] = await db.insert(historyShareConsent).values(consent).returning();
    return newConsent;
  }

  async getHistoryShareConsents(groupId: number, newMemberId: string): Promise<HistoryShareConsent[]> {
    return await db
      .select()
      .from(historyShareConsent)
      .where(
        and(
          eq(historyShareConsent.groupId, groupId),
          eq(historyShareConsent.newMemberId, newMemberId)
        )
      );
  }

  async updateHistoryShareConsent(
    groupId: number,
    existingMemberId: string,
    newMemberId: string,
    consentGiven: boolean
  ): Promise<void> {
    await db
      .update(historyShareConsent)
      .set({ consentGiven, consentDate: new Date() })
      .where(
        and(
          eq(historyShareConsent.groupId, groupId),
          eq(historyShareConsent.existingMemberId, existingMemberId),
          eq(historyShareConsent.newMemberId, newMemberId)
        )
      );
  }
  
  // Partner operations
  async getPartnerSpace(userId: string): Promise<PartnerSpaceWithPartner | undefined> {
    const result = await db
      .select({
        space: partnerSpaces,
        partner: users,
      })
      .from(partnerSpaces)
      .leftJoin(users, eq(partnerSpaces.partnerId, users.id))
      .where(
        or(
          eq(partnerSpaces.userId, userId),
          eq(partnerSpaces.partnerId, userId)
        )
      );

    if (result.length === 0) return undefined;

    const { space, partner } = result[0];
    return {
      ...space,
      partner: partner || undefined,
    };
  }

  async createPartnerSpace(userId: string): Promise<PartnerSpace> {
    const [space] = await db
      .insert(partnerSpaces)
      .values({ userId })
      .returning();
    return space;
  }

  async createPartnerInvitation(data: InsertPartnerInvitation): Promise<PartnerInvitation> {
    const [invitation] = await db
      .insert(partnerInvitations)
      .values(data)
      .returning();
    return invitation;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(ilike(users.email, `${username}%`));
    return user;
  }

  // Policy operations
  async getGroupPolicies(groupId: number): Promise<GroupPolicy[]> {
    return await db
      .select()
      .from(groupPolicies)
      .where(eq(groupPolicies.groupId, groupId))
      .orderBy(desc(groupPolicies.createdAt));
  }

  async getGroupPolicy(policyId: number): Promise<GroupPolicy | undefined> {
    const [policy] = await db
      .select()
      .from(groupPolicies)
      .where(eq(groupPolicies.id, policyId));
    return policy;
  }

  async createGroupPolicy(policy: InsertGroupPolicy): Promise<GroupPolicy> {
    const [newPolicy] = await db.insert(groupPolicies).values(policy).returning();
    return newPolicy;
  }

  async updateGroupPolicy(policyId: number, updates: Partial<InsertGroupPolicy>): Promise<GroupPolicy> {
    const [updated] = await db
      .update(groupPolicies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(groupPolicies.id, policyId))
      .returning();
    return updated;
  }

  async createPolicyProposal(proposal: InsertPolicyProposal): Promise<PolicyProposal> {
    const [newProposal] = await db.insert(policyProposals).values(proposal).returning();
    return newProposal;
  }

  async getPolicyProposal(proposalId: number): Promise<PolicyProposal | undefined> {
    const [proposal] = await db
      .select()
      .from(policyProposals)
      .where(eq(policyProposals.id, proposalId));
    return proposal;
  }

  async createPolicyVote(vote: InsertPolicyVote): Promise<PolicyVote> {
    const [newVote] = await db.insert(policyVotes).values(vote).returning();
    return newVote;
  }

  async getUserPolicyVote(proposalId: number, userId: string): Promise<PolicyVote | undefined> {
    const [vote] = await db
      .select()
      .from(policyVotes)
      .where(
        and(
          eq(policyVotes.proposalId, proposalId),
          eq(policyVotes.userId, userId)
        )
      );
    return vote;
  }

  async checkPolicyProposalStatus(proposalId: number): Promise<void> {
    const proposal = await this.getPolicyProposal(proposalId);
    if (!proposal || proposal.status !== 'pending') return;

    // Count votes
    const votes = await db
      .select({ 
        support: policyVotes.support,
        count: sql<number>`count(*)` 
      })
      .from(policyVotes)
      .where(eq(policyVotes.proposalId, proposalId))
      .groupBy(policyVotes.support);

    let supportVotes = 0;
    let opposedVotes = 0;

    votes.forEach(({ support, count }) => {
      if (support) supportVotes = count;
      else opposedVotes = count;
    });

    const policy = await this.getGroupPolicy(proposal.policyId);
    const groupMembers = await db
      .select({ count: sql<number>`count(*)` })
      .from(groupMembers)
      .where(eq(groupMembers.groupId, policy!.groupId));

    const totalMembers = groupMembers[0].count;
    const approvalPercentage = (supportVotes / totalMembers) * 100;

    // Check if proposal should be approved
    if (approvalPercentage >= 50) {
      await db
        .update(policyProposals)
        .set({ 
          status: 'approved',
          approvedAt: new Date()
        })
        .where(eq(policyProposals.id, proposalId));

      // Update the policy
      await this.updateGroupPolicy(proposal.policyId, {
        title: proposal.newTitle,
        description: proposal.newDescription,
        approvalDays: proposal.approvalDays
      });
    }
  }

  // Flagging and debate operations
  async getEntry(entryId: number): Promise<Entry | undefined> {
    const [entry] = await db
      .select()
      .from(entries)
      .where(eq(entries.id, entryId));
    return entry;
  }

  async getEntryInteraction(interactionId: number): Promise<EntryInteraction | undefined> {
    const [interaction] = await db
      .select()
      .from(entryInteractions)
      .where(eq(entryInteractions.id, interactionId));
    return interaction;
  }

  async createFlaggedComment(flag: InsertFlaggedComment): Promise<FlaggedComment> {
    const [newFlag] = await db.insert(flaggedComments).values(flag).returning();
    return newFlag;
  }

  async getFlaggedComment(flagId: number): Promise<FlaggedComment | undefined> {
    const [flag] = await db
      .select()
      .from(flaggedComments)
      .where(eq(flaggedComments.id, flagId));
    return flag;
  }

  async createCommentDebate(debate: InsertCommentDebate): Promise<CommentDebate> {
    const [newDebate] = await db.insert(commentDebates).values(debate).returning();
    return newDebate;
  }

  async getDebateWithParticipants(debateId: number): Promise<any> {
    const [debate] = await db
      .select()
      .from(commentDebates)
      .where(eq(commentDebates.id, debateId));

    if (!debate) return null;

    // Get flag and interaction details
    const flag = await this.getFlaggedComment(debate.flagId);
    const interaction = await this.getEntryInteraction(flag!.interactionId);
    const entry = await this.getEntry(interaction!.entryId);

    // Get participants (commenter and flagger)
    const participants = await db
      .select()
      .from(users)
      .where(or(
        eq(users.id, interaction!.userId),
        eq(users.id, flag!.flaggedBy)
      ));

    // Get group admins
    const admins = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(
        and(
          eq(groupMembers.groupId, entry!.groupId!),
          or(eq(groupMembers.role, 'admin'), eq(groupMembers.role, 'co-admin'))
        )
      );

    return {
      ...debate,
      flagId: debate.flagId,
      participants,
      admins,
      groupId: entry!.groupId
    };
  }

  async getGroupDebates(groupId: number): Promise<CommentDebate[]> {
    const debates = await db
      .select({
        debate: commentDebates,
        flag: flaggedComments,
        interaction: entryInteractions,
        entry: entries,
      })
      .from(commentDebates)
      .innerJoin(flaggedComments, eq(commentDebates.flagId, flaggedComments.id))
      .innerJoin(entryInteractions, eq(flaggedComments.interactionId, entryInteractions.id))
      .innerJoin(entries, eq(entryInteractions.entryId, entries.id))
      .where(eq(entries.groupId, groupId))
      .orderBy(desc(commentDebates.createdAt));

    return debates.map(d => d.debate);
  }

  async getDebateMessages(debateId: number): Promise<DebateMessage[]> {
    return await db
      .select()
      .from(debateMessages)
      .where(eq(debateMessages.debateId, debateId))
      .orderBy(debateMessages.createdAt);
  }

  async createDebateMessage(message: InsertDebateMessage): Promise<DebateMessage> {
    const [newMessage] = await db.insert(debateMessages).values(message).returning();
    return newMessage;
  }

  async closeDebate(debateId: number, updates: any): Promise<CommentDebate> {
    const [updated] = await db
      .update(commentDebates)
      .set({
        status: 'closed',
        adminDecision: updates.adminDecision,
        penalty: updates.penalty,
        decidedBy: updates.decidedBy,
        decidedAt: updates.decidedAt,
      })
      .where(eq(commentDebates.id, debateId))
      .returning();
    return updated;
  }

  // Penalty operations
  async createMemberPenalty(penalty: InsertMemberPenalty): Promise<MemberPenalty> {
    const [newPenalty] = await db.insert(memberPenalties).values(penalty).returning();
    return newPenalty;
  }

  async getGroupPenalties(groupId: number): Promise<MemberPenalty[]> {
    return await db
      .select()
      .from(memberPenalties)
      .where(eq(memberPenalties.groupId, groupId))
      .orderBy(desc(memberPenalties.createdAt));
  }

  async getGroupMembership(groupId: number, userId: string): Promise<GroupMember | undefined> {
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId)
        )
      );
    return membership;
  }
}

export const storage = new DatabaseStorage();
