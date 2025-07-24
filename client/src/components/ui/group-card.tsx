import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  Crown,
  UserPlus,
  MoreVertical,
  MessageSquare
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GroupWithMembers } from "@shared/schema";

interface GroupCardProps {
  group: GroupWithMembers;
  currentUserId: string;
  onInvite?: () => void;
}

export function GroupCard({ group, currentUserId, onInvite }: GroupCardProps) {
  const currentUserMembership = group.members.find(member => member.userId === currentUserId);
  const isAdmin = currentUserMembership?.role === "admin";
  const isCreator = group.createdBy === currentUserId;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getGroupColor = (groupName: string) => {
    // Generate consistent colors based on group name
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-green-100 text-green-700 border-green-200",
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-pink-100 text-pink-700 border-pink-200",
      "bg-yellow-100 text-yellow-700 border-yellow-200",
      "bg-indigo-100 text-indigo-700 border-indigo-200",
    ];
    
    const hash = groupName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${getGroupColor(group.name)}`}>
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">{group.name}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                </Badge>
                {isCreator && (
                  <Badge variant="secondary" className="text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Owner
                  </Badge>
                )}
                {isAdmin && !isCreator && (
                  <Badge variant="secondary" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <MessageSquare className="w-4 h-4 mr-2" />
                View Entries
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuItem onClick={onInvite}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Members
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Manage Group
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Leave Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {group.description && (
          <p className="text-slate-600 text-sm mb-4 line-clamp-3">
            {group.description}
          </p>
        )}
        
        <div className="space-y-3">
          {/* Group Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-slate-600">
              <MessageSquare className="w-4 h-4" />
              <span>{group._count?.entries || 0} entries</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>Created {formatDate(group.createdAt!)}</span>
            </div>
          </div>

          {/* Recent Members */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">RECENT MEMBERS</p>
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {group.members.slice(0, 4).map((member) => (
                  <img
                    key={member.userId}
                    src={member.user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"}
                    alt={`${member.user.firstName || 'User'} ${member.user.lastName || ''}`}
                    className="w-6 h-6 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              {group.members.length > 4 && (
                <span className="text-xs text-slate-500">
                  +{group.members.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2">
            <Link href={`/groups/${group.id}`}>
              <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
                View Group
              </Button>
            </Link>
            {isAdmin && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onInvite}
                className="px-3"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
