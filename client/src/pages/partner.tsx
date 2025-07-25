import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SharedNavigation } from "@/components/shared-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Heart, 
  Plus, 
  Mail,
  UserSearch,
  MessageCircle,
  Calendar,
  Lock
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { PartnerSpaceWithPartner } from "@shared/schema";

export default function Partner() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<"email" | "username">("email");
  const [inviteValue, setInviteValue] = useState("");
  const [message, setMessage] = useState("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: t('auth.loginRequired'),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast, t]);

  // Fetch partner space
  const { data: partnerSpace, isLoading: loadingSpace } = useQuery<PartnerSpaceWithPartner>({
    queryKey: ["/api/partner/space"],
    enabled: !!user,
  });

  // Create partner space mutation
  const createPartnerSpaceMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/partner/create", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner/space"] });
      setShowCreateDialog(false);
      toast({
        title: "Success",
        description: "Partner space created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: t('auth.loginRequired'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create partner space",
        variant: "destructive",
      });
    },
  });

  // Send partner invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async (data: { method: string; value: string; message?: string }) => {
      return await apiRequest("/api/partner/invite", { body: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner/space"] });
      setShowInviteDialog(false);
      setInviteValue("");
      setMessage("");
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: t('auth.loginRequired'),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const handleSendInvitation = () => {
    if (!inviteValue.trim()) {
      toast({
        title: "Error",
        description: inviteMethod === "email" ? "Please enter an email address" : "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    sendInvitationMutation.mutate({
      method: inviteMethod,
      value: inviteValue,
      message: message.trim() || undefined,
    });
  };

  if (isLoading || !user || loadingSpace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedNavigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mode Indicator Banner */}
        <div className="mb-4 p-3 glass-subtle rounded-lg shadow-ios">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="text-sm font-medium text-foreground">{t('partner.title')}</span>
              <span className="text-xs text-muted-foreground">• {t('partner.description')}</span>
            </div>
          </div>
        </div>

        {!partnerSpace ? (
          // No partner space yet
          <Card className="glass max-w-2xl mx-auto shadow-ios">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="w-20 h-20 bg-rose-100 dark:bg-rose-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-rose-600 dark:text-rose-400" />
              </div>
              
              <h2 className="text-2xl font-semibold mb-2">{t('partner.empty')}</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {t('partner.emptyDescription')}
              </p>
              
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('partner.create')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Partner space exists
          <div className="space-y-6">
            {/* Partner Space Info */}
            <Card className="glass shadow-ios">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  <span>{t('partner.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Show partner info if connected */}
                  {partnerSpace.partnerId ? (
                    <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {partnerSpace.partner?.profileImageUrl ? (
                          <img 
                            src={partnerSpace.partner.profileImageUrl} 
                            alt="Partner"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-rose-200 dark:bg-rose-800 flex items-center justify-center">
                            <span className="text-lg font-semibold text-rose-700 dark:text-rose-300">
                              {(partnerSpace.partner?.firstName?.[0] || partnerSpace.partner?.email?.[0] || 'P').toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {partnerSpace.partner?.firstName || partnerSpace.partner?.email?.split('@')[0]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {partnerSpace.partner?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Connected since {partnerSpace.createdAt ? new Date(partnerSpace.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  ) : (
                    // Waiting for partner to accept
                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
                      <AlertDescription className="text-amber-800 dark:text-amber-200">
                        Waiting for your partner to accept the invitation...
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4" />
                      <span>Your conversations are private and secure</span>
                    </div>
                    
                    {!partnerSpace.partnerId && (
                      <Button 
                        onClick={() => setShowInviteDialog(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {t('partner.invite')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            {partnerSpace.partnerId && (
              <Card className="glass shadow-ios">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Recent Conversations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-1">Start sharing your thoughts with your partner</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Create Partner Space Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('partner.create')}</DialogTitle>
            <DialogDescription>
              Private space for two
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Share entries and chat privately
            </p>
            
            <div className="flex space-x-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createPartnerSpaceMutation.mutate()}
                disabled={createPartnerSpaceMutation.isPending}
                className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
              >
                {createPartnerSpaceMutation.isPending ? "Creating" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Partner Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('partner.invite')}</DialogTitle>
            <DialogDescription>
              Invite your partner to join your private space
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Invite Method Selection */}
            <div className="flex space-x-2 mb-4">
              <Button
                variant={inviteMethod === "email" ? "default" : "outline"}
                size="sm"
                onClick={() => setInviteMethod("email")}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                variant={inviteMethod === "username" ? "default" : "outline"}
                size="sm"
                onClick={() => setInviteMethod("username")}
                className="flex-1"
              >
                <UserSearch className="w-4 h-4 mr-2" />
                Username
              </Button>
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <Label>
                {inviteMethod === "email" ? "Partner's Email" : "Partner's Username"}
              </Label>
              <Input
                type={inviteMethod === "email" ? "email" : "text"}
                placeholder={inviteMethod === "email" ? "email@example.com" : "username"}
                value={inviteValue}
                onChange={(e) => setInviteValue(e.target.value)}
              />
            </div>

            {/* Personal Message */}
            <div className="space-y-2">
              <Label>Personal Message (Optional)</Label>
              <Textarea
                placeholder="Add a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInviteDialog(false);
                  setInviteValue("");
                  setMessage("");
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendInvitation}
                disabled={sendInvitationMutation.isPending || !inviteValue.trim()}
                className="flex-1 bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700"
              >
                {sendInvitationMutation.isPending ? "Sending" : "Send"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}