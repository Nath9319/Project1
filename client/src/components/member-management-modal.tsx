import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Shield, User, UserMinus, ChevronDown } from "lucide-react";
import type { GroupWithMembers } from "@shared/schema";

interface MemberManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: GroupWithMembers;
  currentUserId: string;
  isAdmin: boolean;
}

export function MemberManagementModal({
  open,
  onOpenChange,
  group,
  currentUserId,
  isAdmin,
}: MemberManagementModalProps) {
  const { toast } = useToast();
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest(`/api/groups/${group.id}/members/${userId}/role`, "PUT", { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", group.id.toString()] });
      toast({
        title: "Success",
        description: "Member role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update member role",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/groups/${group.id}/members/${userId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", group.id.toString()] });
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member",
        variant: "destructive",
      });
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    setSelectedRoles({ ...selectedRoles, [userId]: newRole });
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleRemoveMember = (userId: string) => {
    if (confirm("Are you sure you want to remove this member from the group?")) {
      removeMemberMutation.mutate(userId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
          <DialogDescription>
            Update member roles and manage group access
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {group.members.map((member) => {
            const isCreator = member.userId === group.createdBy;
            const currentRole = selectedRoles[member.userId] || member.role;

            return (
              <div
                key={member.userId}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {member.user.profileImageUrl ? (
                    <img
                      src={member.user.profileImageUrl}
                      alt={member.user.firstName || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {(member.user.firstName?.[0] || member.user.email?.[0] || "U").toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {member.user.firstName && member.user.lastName
                        ? `${member.user.firstName} ${member.user.lastName}`
                        : member.user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {isCreator && (
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Creator
                        </Badge>
                      )}
                      {currentRole === "admin" && !isCreator && (
                        <Badge variant="secondary" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {currentRole === "co-admin" && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Co-Admin
                        </Badge>
                      )}
                      {currentRole === "member" && (
                        <Badge variant="outline" className="text-xs">
                          <User className="w-3 h-3 mr-1" />
                          Member
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isAdmin && !isCreator && member.userId !== currentUserId && (
                    <>
                      <Select
                        value={currentRole}
                        onValueChange={(value) => handleRoleChange(member.userId, value)}
                        disabled={updateRoleMutation.isPending}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="co-admin">Co-Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={removeMemberMutation.isPending}
                      >
                        <UserMinus className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                  {member.userId === currentUserId && !isCreator && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.userId)}
                      disabled={removeMemberMutation.isPending}
                    >
                      Leave Group
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}