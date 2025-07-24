import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { 
  insertGroupPolicySchema,
  insertPolicyProposalSchema,
  insertPolicyVoteSchema,
  insertFlaggedCommentSchema,
  insertDebateMessageSchema
} from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Get group policies
router.get('/api/groups/:groupId/policies', isAuthenticated, async (req: any, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const userId = req.user.claims.sub;

    // Check if user is a member
    const membership = await storage.getGroupMembership(groupId, userId);
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const policies = await storage.getGroupPolicies(groupId);
    res.json(policies);
  } catch (error) {
    console.error('Error fetching group policies:', error);
    res.status(500).json({ message: 'Failed to fetch policies' });
  }
});

// Create new policy (admin only)
router.post('/api/groups/:groupId/policies', isAuthenticated, async (req: any, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const userId = req.user.claims.sub;

    // Check if user is admin
    const membership = await storage.getGroupMembership(groupId, userId);
    if (!membership || membership.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create policies' });
    }

    const body = insertGroupPolicySchema.parse({
      ...req.body,
      groupId,
      proposedBy: userId,
      status: 'active',
      approvedAt: new Date()
    });

    const policy = await storage.createGroupPolicy(body);
    res.json(policy);
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ message: 'Failed to create policy' });
  }
});

// Propose policy change
router.post('/api/policies/:policyId/proposals', isAuthenticated, async (req: any, res) => {
  try {
    const policyId = parseInt(req.params.policyId);
    const userId = req.user.claims.sub;

    // Get policy and check membership
    const policy = await storage.getGroupPolicy(policyId);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }

    const membership = await storage.getGroupMembership(policy.groupId, userId);
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Validate approval days
    if (req.body.approvalDays < policy.approvalDays) {
      return res.status(400).json({ 
        message: `Approval days must be at least ${policy.approvalDays} days` 
      });
    }

    const autoApprovalDate = new Date();
    autoApprovalDate.setDate(autoApprovalDate.getDate() + req.body.approvalDays);

    const body = insertPolicyProposalSchema.parse({
      ...req.body,
      policyId,
      proposedBy: userId,
      autoApprovalDate
    });

    const proposal = await storage.createPolicyProposal(body);
    res.json(proposal);
  } catch (error) {
    console.error('Error creating proposal:', error);
    res.status(500).json({ message: 'Failed to create proposal' });
  }
});

// Vote on policy proposal
router.post('/api/proposals/:proposalId/vote', isAuthenticated, async (req: any, res) => {
  try {
    const proposalId = parseInt(req.params.proposalId);
    const userId = req.user.claims.sub;

    // Get proposal and check membership
    const proposal = await storage.getPolicyProposal(proposalId);
    if (!proposal) {
      return res.status(404).json({ message: 'Proposal not found' });
    }

    const policy = await storage.getGroupPolicy(proposal.policyId);
    const membership = await storage.getGroupMembership(policy.groupId, userId);
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    // Check if already voted
    const existingVote = await storage.getUserPolicyVote(proposalId, userId);
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted on this proposal' });
    }

    const body = insertPolicyVoteSchema.parse({
      ...req.body,
      proposalId,
      userId
    });

    const vote = await storage.createPolicyVote(body);

    // Check if proposal should be approved/rejected
    await storage.checkPolicyProposalStatus(proposalId);

    res.json(vote);
  } catch (error) {
    console.error('Error voting on proposal:', error);
    res.status(500).json({ message: 'Failed to vote on proposal' });
  }
});

// Flag comment for policy violation
router.post('/api/interactions/:interactionId/flag', isAuthenticated, async (req: any, res) => {
  try {
    const interactionId = parseInt(req.params.interactionId);
    const userId = req.user.claims.sub;

    // Get interaction and check if it's a comment
    const interaction = await storage.getEntryInteraction(interactionId);
    if (!interaction || interaction.type !== 'comment') {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Get entry and check membership
    const entry = await storage.getEntry(interaction.entryId);
    if (!entry || !entry.groupId) {
      return res.status(404).json({ message: 'Entry not found or not in a group' });
    }

    const membership = await storage.getGroupMembership(entry.groupId, userId);
    if (!membership) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const body = insertFlaggedCommentSchema.parse({
      ...req.body,
      interactionId,
      flaggedBy: userId
    });

    const flag = await storage.createFlaggedComment(body);

    // Create debate for the flag
    const debate = await storage.createCommentDebate({
      flagId: flag.id,
      status: 'active'
    });

    res.json({ flag, debate });
  } catch (error) {
    console.error('Error flagging comment:', error);
    res.status(500).json({ message: 'Failed to flag comment' });
  }
});

// Get debates for a group (admin only)
router.get('/api/groups/:groupId/debates', isAuthenticated, async (req: any, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const userId = req.user.claims.sub;

    // Check if user is admin
    const membership = await storage.getGroupMembership(groupId, userId);
    if (!membership || (membership.role !== 'admin' && membership.role !== 'co-admin')) {
      return res.status(403).json({ message: 'Only admins can view debates' });
    }

    const debates = await storage.getGroupDebates(groupId);
    res.json(debates);
  } catch (error) {
    console.error('Error fetching debates:', error);
    res.status(500).json({ message: 'Failed to fetch debates' });
  }
});

// Get debate messages
router.get('/api/debates/:debateId/messages', isAuthenticated, async (req: any, res) => {
  try {
    const debateId = parseInt(req.params.debateId);
    const userId = req.user.claims.sub;

    // Check if user is involved in the debate
    const debate = await storage.getDebateWithParticipants(debateId);
    if (!debate) {
      return res.status(404).json({ message: 'Debate not found' });
    }

    const isParticipant = debate.participants.some(p => p.id === userId);
    const isAdmin = debate.admins.some(a => a.id === userId);

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to view this debate' });
    }

    const messages = await storage.getDebateMessages(debateId);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching debate messages:', error);
    res.status(500).json({ message: 'Failed to fetch debate messages' });
  }
});

// Send debate message
router.post('/api/debates/:debateId/messages', isAuthenticated, async (req: any, res) => {
  try {
    const debateId = parseInt(req.params.debateId);
    const userId = req.user.claims.sub;

    // Check if user is involved in the debate
    const debate = await storage.getDebateWithParticipants(debateId);
    if (!debate) {
      return res.status(404).json({ message: 'Debate not found' });
    }

    const isParticipant = debate.participants.some(p => p.id === userId);
    const isAdmin = debate.admins.some(a => a.id === userId);

    if (!isParticipant && !isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to participate in this debate' });
    }

    const body = insertDebateMessageSchema.parse({
      ...req.body,
      debateId,
      userId
    });

    const message = await storage.createDebateMessage(body);
    res.json(message);
  } catch (error) {
    console.error('Error sending debate message:', error);
    res.status(500).json({ message: 'Failed to send debate message' });
  }
});

// Close debate and issue penalty (admin only)
router.post('/api/debates/:debateId/close', isAuthenticated, async (req: any, res) => {
  try {
    const debateId = parseInt(req.params.debateId);
    const userId = req.user.claims.sub;

    // Get debate and check admin status
    const debate = await storage.getDebateWithParticipants(debateId);
    if (!debate) {
      return res.status(404).json({ message: 'Debate not found' });
    }

    const isAdmin = debate.admins.some(a => a.id === userId);
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can close debates' });
    }

    // Update debate status
    const updatedDebate = await storage.closeDebate(debateId, {
      adminDecision: req.body.decision,
      penalty: req.body.penalty,
      decidedBy: userId,
      decidedAt: new Date()
    });

    // Issue penalty if specified
    if (req.body.penalty && req.body.penalty !== 'dismissed') {
      const flag = await storage.getFlaggedComment(debate.flagId);
      const interaction = await storage.getEntryInteraction(flag.interactionId);
      
      let duration: number | null = null;
      let penaltyType = 'warning';
      
      if (req.body.penalty.startsWith('mute_')) {
        penaltyType = 'mute';
        duration = parseInt(req.body.penalty.split('_')[1]);
      } else if (req.body.penalty === 'ban') {
        penaltyType = 'ban';
      }

      const expiresAt = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null;

      await storage.createMemberPenalty({
        groupId: debate.groupId,
        userId: interaction.userId,
        penaltyType,
        duration,
        reason: req.body.decision,
        debateId,
        issuedBy: userId,
        expiresAt
      });
    }

    res.json(updatedDebate);
  } catch (error) {
    console.error('Error closing debate:', error);
    res.status(500).json({ message: 'Failed to close debate' });
  }
});

// Get member penalties
router.get('/api/groups/:groupId/penalties', isAuthenticated, async (req: any, res) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const userId = req.user.claims.sub;

    // Check if user is admin
    const membership = await storage.getGroupMembership(groupId, userId);
    if (!membership || (membership.role !== 'admin' && membership.role !== 'co-admin')) {
      return res.status(403).json({ message: 'Only admins can view penalties' });
    }

    const penalties = await storage.getGroupPenalties(groupId);
    res.json(penalties);
  } catch (error) {
    console.error('Error fetching penalties:', error);
    res.status(500).json({ message: 'Failed to fetch penalties' });
  }
});

export default router;