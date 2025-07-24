import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { getMoodById } from "@shared/moods";

interface GroupMoodDisplayProps {
  groupId: number;
}

interface MemberMood {
  userId: string;
  name: string;
  currentMood: string | null;
  moodEmoji: string | null;
  moodUpdatedAt: string | null;
  shouldReset: boolean;
}

interface GroupMember {
  userId: string;
  role: string;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  mood: MemberMood;
}

export function GroupMoodDisplay({ groupId }: GroupMoodDisplayProps) {
  const { data: members } = useQuery<GroupMember[]>({
    queryKey: [`/api/groups/${groupId}/moods`],
  });
  
  if (!members || members.length === 0) {
    return null;
  }
  
  const membersWithMoods = members.filter(m => m.mood.currentMood && !m.mood.shouldReset);
  
  if (membersWithMoods.length === 0) {
    return null;
  }
  
  return (
    <Card className="glass-card mb-8 shadow-ios">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Group Moods</h3>
        </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {membersWithMoods.map((member) => {
          const mood = getMoodById(member.mood.currentMood!);
          return (
            <div
              key={member.userId}
              className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
              style={{ backgroundColor: `${mood?.color}20` }}
            >
              <span className="text-lg">{member.mood.moodEmoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.user.firstName || member.user.email.split('@')[0]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mood?.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      </CardContent>
    </Card>
  );
}