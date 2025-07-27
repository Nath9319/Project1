import { db } from '../server/db';
import { 
  users, 
  groups, 
  groupMembers, 
  entries, 
  entryInteractions,
  plans,
  planParticipants,
  reminders,
  bookings,
  bookingShares
} from '../shared/schema-sqlite';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await db.delete(bookingShares);
    await db.delete(bookings);
    await db.delete(reminders);
    await db.delete(planParticipants);
    await db.delete(plans);
    await db.delete(entryInteractions);
    await db.delete(entries);
    await db.delete(groupMembers);
    await db.delete(groups);
    await db.delete(users);

    // Create sample users
    const sampleUsers = [
      {
        id: 'user_1',
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        currentMood: 'happy',
        moodEmoji: '😊',
        moodUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user_2',
        email: 'bob@example.com',
        firstName: 'Bob',
        lastName: 'Smith',
        currentMood: 'excited',
        moodEmoji: '🎉',
        moodUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'user_3',
        email: 'charlie@example.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        currentMood: 'calm',
        moodEmoji: '😌',
        moodUpdatedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log('👥 Creating users...');
    await db.insert(users).values(sampleUsers);

    // Create sample groups
    const sampleGroups = [
      {
        name: 'Family Circle',
        description: 'Our close family group for sharing daily moments',
        color: '#FF6B6B',
        icon: 'fas fa-home',
        createdBy: 'user_1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Work Team',
        description: 'Team collaboration and mood sharing',
        color: '#4ECDC4',
        icon: 'fas fa-briefcase',
        createdBy: 'user_2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Study Group',
        description: 'University study group for motivation',
        color: '#45B7D1',
        icon: 'fas fa-graduation-cap',
        createdBy: 'user_3',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log('👨‍👩‍👧‍👦 Creating groups...');
    const insertedGroups = await db.insert(groups).values(sampleGroups).returning();

    // Create group memberships
    const groupMemberships = [
      // Family Circle members
      { groupId: insertedGroups[0].id, userId: 'user_1', role: 'admin', joinedAt: new Date() },
      { groupId: insertedGroups[0].id, userId: 'user_2', role: 'member', joinedAt: new Date() },
      { groupId: insertedGroups[0].id, userId: 'user_3', role: 'member', joinedAt: new Date() },
      
      // Work Team members
      { groupId: insertedGroups[1].id, userId: 'user_2', role: 'admin', joinedAt: new Date() },
      { groupId: insertedGroups[1].id, userId: 'user_1', role: 'member', joinedAt: new Date() },
      
      // Study Group members
      { groupId: insertedGroups[2].id, userId: 'user_3', role: 'admin', joinedAt: new Date() },
      { groupId: insertedGroups[2].id, userId: 'user_1', role: 'member', joinedAt: new Date() },
    ];

    console.log('🤝 Creating group memberships...');
    await db.insert(groupMembers).values(groupMemberships);

    // Create sample entries
    const sampleEntries = [
      {
        content: 'Had a wonderful morning walk today! The weather is perfect and I feel so energized. 🌞',
        authorId: 'user_1',
        groupId: insertedGroups[0].id,
        visibility: 'group',
        activityType: 'milestone',
        emotions: JSON.stringify(['happy', 'energized', 'grateful']),
        tags: JSON.stringify(['morning', 'exercise', 'nature']),
        color: 'green',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        content: 'Finished the quarterly report ahead of schedule! Team collaboration was amazing. 💼',
        authorId: 'user_2',
        groupId: insertedGroups[1].id,
        visibility: 'group',
        activityType: 'milestone',
        emotions: JSON.stringify(['accomplished', 'proud', 'relieved']),
        tags: JSON.stringify(['work', 'achievement', 'teamwork']),
        color: 'blue',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        content: 'Studying for finals but feeling a bit overwhelmed. Need to take breaks more often.',
        authorId: 'user_3',
        groupId: insertedGroups[2].id,
        visibility: 'group',
        activityType: 'emotional_trigger',
        emotions: JSON.stringify(['stressed', 'determined', 'hopeful']),
        tags: JSON.stringify(['study', 'exams', 'self-care']),
        color: 'orange',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        content: 'Private reflection: Setting new goals for next month. Focus on work-life balance.',
        authorId: 'user_1',
        visibility: 'private',
        activityType: 'reflection',
        emotions: JSON.stringify(['thoughtful', 'motivated']),
        tags: JSON.stringify(['goals', 'balance', 'self-improvement']),
        color: 'purple',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log('📝 Creating journal entries...');
    const insertedEntries = await db.insert(entries).values(sampleEntries).returning();

    // Create sample interactions
    const sampleInteractions = [
      {
        entryId: insertedEntries[0].id,
        userId: 'user_2',
        type: 'like',
        createdAt: new Date(),
      },
      {
        entryId: insertedEntries[0].id,
        userId: 'user_3',
        type: 'comment',
        content: 'That sounds wonderful! I should try morning walks too 🚶‍♀️',
        createdAt: new Date(),
      },
      {
        entryId: insertedEntries[1].id,
        userId: 'user_1',
        type: 'like',
        createdAt: new Date(),
      },
      {
        entryId: insertedEntries[1].id,
        userId: 'user_1',
        type: 'comment',
        content: 'Congratulations! Your hard work really paid off 🎉',
        createdAt: new Date(),
      },
      {
        entryId: insertedEntries[2].id,
        userId: 'user_1',
        type: 'comment',
        content: 'You\'ve got this! Remember to take care of yourself 💪',
        createdAt: new Date(),
      },
    ];

    console.log('💬 Creating interactions...');
    await db.insert(entryInteractions).values(sampleInteractions);

    // Create sample plans
    const samplePlans = [
      {
        title: 'Family Game Night',
        description: 'Monthly family gathering with board games and snacks',
        createdBy: 'user_1',
        groupId: insertedGroups[0].id,
        visibility: 'group',
        scheduledFor: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 1 week from now
        location: JSON.stringify({
          name: 'Alice\'s House',
          address: '123 Family Lane',
        }),
        reminderSettings: JSON.stringify({
          enabled: true,
          minutesBefore: 60,
          soundEnabled: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Team Building Workshop',
        description: 'Quarterly team building and planning session',
        createdBy: 'user_2',
        groupId: insertedGroups[1].id,
        visibility: 'group',
        scheduledFor: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)), // 2 weeks from now
        location: JSON.stringify({
          name: 'Conference Room A',
          address: 'Office Building, Floor 5',
        }),
        reminderSettings: JSON.stringify({
          enabled: true,
          minutesBefore: 120,
          soundEnabled: false,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Study Session',
        description: 'Group study session for upcoming finals',
        createdBy: 'user_3',
        groupId: insertedGroups[2].id,
        visibility: 'group',
        scheduledFor: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)), // 3 days from now
        location: JSON.stringify({
          name: 'University Library',
          address: 'Room 204, Main Library',
        }),
        reminderSettings: JSON.stringify({
          enabled: true,
          minutesBefore: 30,
          soundEnabled: true,
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log('📅 Creating plans...');
    const insertedPlans = await db.insert(plans).values(samplePlans).returning();

    // Create plan participants
    const planParticipantsData = [
      // Family Game Night
      { planId: insertedPlans[0].id, userId: 'user_1', status: 'going', createdAt: new Date() },
      { planId: insertedPlans[0].id, userId: 'user_2', status: 'going', createdAt: new Date() },
      { planId: insertedPlans[0].id, userId: 'user_3', status: 'maybe', createdAt: new Date() },
      
      // Team Building Workshop
      { planId: insertedPlans[1].id, userId: 'user_2', status: 'going', createdAt: new Date() },
      { planId: insertedPlans[1].id, userId: 'user_1', status: 'going', createdAt: new Date() },
      
      // Study Session
      { planId: insertedPlans[2].id, userId: 'user_3', status: 'going', createdAt: new Date() },
      { planId: insertedPlans[2].id, userId: 'user_1', status: 'going', createdAt: new Date() },
    ];

    console.log('👥 Creating plan participants...');
    await db.insert(planParticipants).values(planParticipantsData);

    // Create sample reminders
    const sampleReminders = [
      {
        userId: 'user_1',
        planId: insertedPlans[0].id,
        title: 'Prepare snacks for game night',
        description: 'Buy chips, drinks, and prepare sandwiches',
        reminderTime: new Date(Date.now() + (6 * 24 * 60 * 60 * 1000)), // 6 days from now
        repeatPattern: 'none',
        createdAt: new Date(),
      },
      {
        userId: 'user_2',
        planId: insertedPlans[1].id,
        title: 'Review presentation slides',
        description: 'Final review of workshop materials',
        reminderTime: new Date(Date.now() + (13 * 24 * 60 * 60 * 1000)), // 13 days from now
        repeatPattern: 'none',
        createdAt: new Date(),
      },
      {
        userId: 'user_3',
        entryId: insertedEntries[2].id,
        title: 'Take a study break',
        description: 'Remember to rest and recharge',
        reminderTime: new Date(Date.now() + (2 * 60 * 60 * 1000)), // 2 hours from now
        repeatPattern: 'daily',
        createdAt: new Date(),
      },
    ];

    console.log('⏰ Creating reminders...');
    await db.insert(reminders).values(sampleReminders);

    // Create sample bookings
    const sampleBookings = [
      {
        planId: insertedPlans[1].id,
        title: 'Conference Room Booking',
        type: 'venue',
        groupId: insertedGroups[1].id,
        bookedBy: 'user_2',
        bookingReference: 'CR-A-240127-001',
        venue: 'Conference Room A, 5th Floor',
        startTime: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)), // 2 weeks from now
        endTime: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000)), // 4 hours later
        cost: 150.00,
        currency: 'USD',
        confirmationDetails: JSON.stringify({
          bookedAt: new Date().toISOString(),
          cancellationPolicy: '24 hours notice required',
        }),
        status: 'confirmed',
        notes: 'Projector and whiteboard requested',
        createdAt: new Date(),
      },
    ];

    console.log('🏢 Creating bookings...');
    await db.insert(bookings).values(sampleBookings);

    console.log('✅ Database seeding completed successfully!');
    
    // Print summary
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${sampleUsers.length}`);
    console.log(`👨‍👩‍👧‍👦 Groups: ${sampleGroups.length}`);
    console.log(`🤝 Group memberships: ${groupMemberships.length}`);
    console.log(`📝 Journal entries: ${sampleEntries.length}`);
    console.log(`💬 Interactions: ${sampleInteractions.length}`);
    console.log(`📅 Plans: ${samplePlans.length}`);
    console.log(`👥 Plan participants: ${planParticipantsData.length}`);
    console.log(`⏰ Reminders: ${sampleReminders.length}`);
    console.log(`🏢 Bookings: ${sampleBookings.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase().then(() => {
  console.log('🎉 Seeding complete!');
  process.exit(0);
});

export default seedDatabase;
