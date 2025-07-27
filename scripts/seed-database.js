import { db } from '../server/db.js';
import { 
  users, 
  groups, 
  groupMembers, 
  entries, 
  entryInteractions,
  plans,
  planParticipants,
  reminders,
  bookings
} from '../shared/schema-sqlite.js';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create sample users
    const sampleUsers = [
      {
        id: 'user_1',
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Johnson',
        currentMood: 'happy',
        moodEmoji: '😊',
        moodUpdatedAt: Date.now(),
      },
      {
        id: 'user_2',
        email: 'bob@example.com',
        firstName: 'Bob',
        lastName: 'Smith',
        currentMood: 'excited',
        moodEmoji: '🎉',
        moodUpdatedAt: Date.now(),
      },
      {
        id: 'user_3',
        email: 'charlie@example.com',
        firstName: 'Charlie',
        lastName: 'Brown',
        currentMood: 'calm',
        moodEmoji: '😌',
        moodUpdatedAt: Date.now(),
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
      },
      {
        name: 'Work Team',
        description: 'Team collaboration and mood sharing',
        color: '#4ECDC4',
        icon: 'fas fa-briefcase',
        createdBy: 'user_2',
      },
      {
        name: 'Study Group',
        description: 'University study group for motivation',
        color: '#45B7D1',
        icon: 'fas fa-graduation-cap',
        createdBy: 'user_3',
      },
    ];

    console.log('👨‍👩‍👧‍👦 Creating groups...');
    const insertedGroups = await db.insert(groups).values(sampleGroups).returning();

    // Create group memberships
    const groupMemberships = [
      // Family Circle members
      { groupId: insertedGroups[0].id, userId: 'user_1', role: 'admin' },
      { groupId: insertedGroups[0].id, userId: 'user_2', role: 'member' },
      { groupId: insertedGroups[0].id, userId: 'user_3', role: 'member' },
      
      // Work Team members
      { groupId: insertedGroups[1].id, userId: 'user_2', role: 'admin' },
      { groupId: insertedGroups[1].id, userId: 'user_1', role: 'member' },
      
      // Study Group members
      { groupId: insertedGroups[2].id, userId: 'user_3', role: 'admin' },
      { groupId: insertedGroups[2].id, userId: 'user_1', role: 'member' },
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
      },
      {
        content: 'Private reflection: Setting new goals for next month. Focus on work-life balance.',
        authorId: 'user_1',
        visibility: 'private',
        activityType: 'reflection',
        emotions: JSON.stringify(['thoughtful', 'motivated']),
        tags: JSON.stringify(['goals', 'balance', 'self-improvement']),
        color: 'purple',
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
      },
      {
        entryId: insertedEntries[0].id,
        userId: 'user_3',
        type: 'comment',
        content: 'That sounds wonderful! I should try morning walks too 🚶‍♀️',
      },
      {
        entryId: insertedEntries[1].id,
        userId: 'user_1',
        type: 'like',
      },
      {
        entryId: insertedEntries[1].id,
        userId: 'user_1',
        type: 'comment',
        content: 'Congratulations! Your hard work really paid off 🎉',
      },
      {
        entryId: insertedEntries[2].id,
        userId: 'user_1',
        type: 'comment',
        content: 'You\'ve got this! Remember to take care of yourself 💪',
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
        scheduledFor: Date.now() + (7 * 24 * 60 * 60 * 1000), // 1 week from now
        location: JSON.stringify({
          name: 'Alice\'s House',
          address: '123 Family Lane',
        }),
        reminderSettings: JSON.stringify({
          enabled: true,
          minutesBefore: 60,
          soundEnabled: true,
        }),
      },
      {
        title: 'Team Building Workshop',
        description: 'Quarterly team building and planning session',
        createdBy: 'user_2',
        groupId: insertedGroups[1].id,
        visibility: 'group',
        scheduledFor: Date.now() + (14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        location: JSON.stringify({
          name: 'Conference Room A',
          address: 'Office Building, Floor 5',
        }),
        reminderSettings: JSON.stringify({
          enabled: true,
          minutesBefore: 120,
          soundEnabled: false,
        }),
      },
      {
        title: 'Study Session',
        description: 'Group study session for upcoming finals',
        createdBy: 'user_3',
        groupId: insertedGroups[2].id,
        visibility: 'group',
        scheduledFor: Date.now() + (3 * 24 * 60 * 60 * 1000), // 3 days from now
        location: JSON.stringify({
          name: 'University Library',
          address: 'Room 204, Main Library',
        }),
        reminderSettings: JSON.stringify({
          enabled: true,
          minutesBefore: 30,
          soundEnabled: true,
        }),
      },
    ];

    console.log('📅 Creating plans...');
    const insertedPlans = await db.insert(plans).values(samplePlans).returning();

    // Create plan participants
    const planParticipants = [
      // Family Game Night
      { planId: insertedPlans[0].id, userId: 'user_1', status: 'going' },
      { planId: insertedPlans[0].id, userId: 'user_2', status: 'going' },
      { planId: insertedPlans[0].id, userId: 'user_3', status: 'maybe' },
      
      // Team Building Workshop
      { planId: insertedPlans[1].id, userId: 'user_2', status: 'going' },
      { planId: insertedPlans[1].id, userId: 'user_1', status: 'going' },
      
      // Study Session
      { planId: insertedPlans[2].id, userId: 'user_3', status: 'going' },
      { planId: insertedPlans[2].id, userId: 'user_1', status: 'going' },
    ];

    console.log('👥 Creating plan participants...');
    await db.insert(planParticipants).values(planParticipants);

    // Create sample reminders
    const sampleReminders = [
      {
        userId: 'user_1',
        planId: insertedPlans[0].id,
        title: 'Prepare snacks for game night',
        description: 'Buy chips, drinks, and prepare sandwiches',
        reminderTime: Date.now() + (6 * 24 * 60 * 60 * 1000), // 6 days from now
        repeatPattern: 'none',
      },
      {
        userId: 'user_2',
        planId: insertedPlans[1].id,
        title: 'Review presentation slides',
        description: 'Final review of workshop materials',
        reminderTime: Date.now() + (13 * 24 * 60 * 60 * 1000), // 13 days from now
        repeatPattern: 'none',
      },
      {
        userId: 'user_3',
        entryId: insertedEntries[2].id,
        title: 'Take a study break',
        description: 'Remember to rest and recharge',
        reminderTime: Date.now() + (2 * 60 * 60 * 1000), // 2 hours from now
        repeatPattern: 'daily',
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
        startTime: Date.now() + (14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endTime: Date.now() + (14 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000), // 4 hours later
        cost: 150.00,
        currency: 'USD',
        confirmationDetails: JSON.stringify({
          bookedAt: new Date().toISOString(),
          cancellationPolicy: '24 hours notice required',
        }),
        status: 'confirmed',
        notes: 'Projector and whiteboard requested',
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
    console.log(`👥 Plan participants: ${planParticipants.length}`);
    console.log(`⏰ Reminders: ${sampleReminders.length}`);
    console.log(`🏢 Bookings: ${sampleBookings.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => {
    console.log('🎉 Seeding complete!');
    process.exit(0);
  });
}

export default seedDatabase;
