import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Shield, FileText, AlertTriangle, Gavel, Users, Clock, CheckCircle, XCircle, Info } from "lucide-react";
import { SharedNavigation } from "@/components/shared-navigation";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";

import type { GroupPolicy, PolicyProposal, CommentDebate, MemberPenalty } from "@shared/schema";

const createPolicySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  approvalDays: z.number().min(7, "Minimum approval period is 7 days").max(30, "Maximum approval period is 30 days"),
});

const proposePolicyChangeSchema = z.object({
  proposedContent: z.string().min(10, "Content must be at least 10 characters"),
  changeType: z.enum(["edit", "new_rule", "delete"]),
  approvalDays: z.number().min(7, "Minimum approval period is 7 days"),
  reason: z.string().min(10, "Please provide a reason for the change"),
});

type CreatePolicyForm = z.infer<typeof createPolicySchema>;
type ProposePolicyChangeForm = z.infer<typeof proposePolicyChangeSchema>;

export default function GroupPolicies() {
  const { id } = useParams();
  const groupId = parseInt(id as string);
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("policies");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<GroupPolicy | null>(null);
  const [isProposeChangeDialogOpen, setIsProposeChangeDialogOpen] = useState(false);

  // Fetch group details to check user role
  const { data: group } = useQuery<any>({
    queryKey: ["/api/groups", groupId],
  });

  const userMembership = group?.members.find(m => m.userId === user?.id);
  const isAdmin = userMembership?.role === "admin" || userMembership?.role === "co-admin";

  // Fetch policies
  const { data: policies = [], isLoading: policiesLoading } = useQuery<GroupPolicy[]>({
    queryKey: [`/api/groups/${groupId}/policies`],
    enabled: !!groupId,
  });

  // Fetch debates (admin only)
  const { data: debates = [], isLoading: debatesLoading } = useQuery<CommentDebate[]>({
    queryKey: [`/api/groups/${groupId}/debates`],
    enabled: !!groupId && isAdmin,
  });

  // Fetch penalties (admin only)
  const { data: penalties = [], isLoading: penaltiesLoading } = useQuery<MemberPenalty[]>({
    queryKey: [`/api/groups/${groupId}/penalties`],
    enabled: !!groupId && isAdmin,
  });

  // Create policy form
  const createPolicyForm = useForm<CreatePolicyForm>({
    resolver: zodResolver(createPolicySchema),
    defaultValues: {
      title: "",
      content: "",
      approvalDays: 7,
    },
  });

  // Propose change form
  const proposePolicyChangeForm = useForm<ProposePolicyChangeForm>({
    resolver: zodResolver(proposePolicyChangeSchema),
    defaultValues: {
      proposedContent: selectedPolicy?.content || "",
      changeType: "edit" as const,
      approvalDays: selectedPolicy?.approvalDays || 7,
      reason: "",
    },
  });

  // Create policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: async (data: CreatePolicyForm) => {
      await apiRequest(`/api/groups/${groupId}/policies`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/policies`] });
      toast({
        title: "Success",
        description: "Policy created successfully",
      });
      setIsCreateDialogOpen(false);
      createPolicyForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create policy",
        variant: "destructive",
      });
    },
  });

  // Propose policy change mutation
  const proposePolicyChangeMutation = useMutation({
    mutationFn: async (data: ProposePolicyChangeForm) => {
      await apiRequest(`/api/policies/${selectedPolicy?.id}/proposals`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/policies`] });
      toast({
        title: "Success",
        description: "Policy change proposal submitted",
      });
      setIsProposeChangeDialogOpen(false);
      proposePolicyChangeForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit proposal",
        variant: "destructive",
      });
    },
  });

  const renderPolicies = () => (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Shield className="h-4 w-4" />
                Create Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Policy</DialogTitle>
                <DialogDescription>
                  Create a new policy for your group. Policies help maintain community standards.
                </DialogDescription>
              </DialogHeader>
              <Form {...createPolicyForm}>
                <form onSubmit={createPolicyForm.handleSubmit((data) => createPolicyMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={createPolicyForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Respectful Communication" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createPolicyForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what this policy covers and why it's important..."
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createPolicyForm.control}
                    name="approvalDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Approval Period (days)</FormLabel>
                        <FormDescription>
                          How many days should policy changes require for approval
                        </FormDescription>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <Slider
                              min={7}
                              max={30}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="flex-1"
                            />
                            <span className="w-12 text-sm font-medium">{field.value}</span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createPolicyMutation.isPending}>
                      Create Policy
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {policiesLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading policies...</div>
      ) : policies.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No policies have been created yet</p>
            {isAdmin && (
              <p className="text-sm text-muted-foreground">
                Create your first policy to establish community guidelines
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        policies.map((policy: GroupPolicy) => (
          <Card key={policy.id} className="backdrop-blur-md bg-background/80">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                  <CardDescription className="mt-1">
                    Created {policy.createdAt ? format(new Date(policy.createdAt), "PPP") : "Recently"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {policy.approvalDays} days
                  </Badge>
                  <Badge variant={policy.status === "active" ? "default" : "secondary"}>
                    {policy.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {policy.content}
              </p>
              {!isAdmin && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPolicy(policy);
                      proposePolicyChangeForm.reset({
                        proposedContent: policy.content,
                        changeType: "edit" as const,
                        approvalDays: policy.approvalDays,
                        reason: "",
                      });
                      setIsProposeChangeDialogOpen(true);
                    }}
                  >
                    Propose Change
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Propose Change Dialog */}
      <Dialog open={isProposeChangeDialogOpen} onOpenChange={setIsProposeChangeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Propose Policy Change</DialogTitle>
            <DialogDescription>
              Suggest changes to the "{selectedPolicy?.title}" policy. Changes require member approval.
            </DialogDescription>
          </DialogHeader>
          <Form {...proposePolicyChangeForm}>
            <form onSubmit={proposePolicyChangeForm.handleSubmit((data) => proposePolicyChangeMutation.mutate(data))} className="space-y-4">
              <FormField
                control={proposePolicyChangeForm.control}
                name="changeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Change Type</FormLabel>
                    <FormControl>
                      <select {...field} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="edit">Edit Policy</option>
                        <option value="new_rule">Add New Rule</option>
                        <option value="delete">Delete Policy</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={proposePolicyChangeForm.control}
                name="proposedContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proposed Content</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={proposePolicyChangeForm.control}
                name="approvalDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Period (days)</FormLabel>
                    <FormDescription>
                      Cannot be less than current period ({selectedPolicy?.approvalDays} days)
                    </FormDescription>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        <Slider
                          min={selectedPolicy?.approvalDays || 7}
                          max={30}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-sm font-medium">{field.value}</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={proposePolicyChangeForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Change</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Explain why this change is needed..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsProposeChangeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={proposePolicyChangeMutation.isPending}>
                  Submit Proposal
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderDebates = () => {
    if (!isAdmin) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <Gavel className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Only admins can view debates</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {debatesLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading debates...</div>
        ) : debates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Gavel className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No active debates</p>
              <p className="text-sm text-muted-foreground">
                Debates are created when comments are flagged for policy violations
              </p>
            </CardContent>
          </Card>
        ) : (
          debates.map((debate: CommentDebate) => (
            <Card key={debate.id} className="backdrop-blur-md bg-background/80">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Debate #{debate.id}</CardTitle>
                    <CardDescription>
                      Started {debate.createdAt ? format(new Date(debate.createdAt), "PPP") : "Recently"}
                    </CardDescription>
                  </div>
                  <Badge variant={debate.status === "active" ? "default" : "secondary"}>
                    {debate.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {debate.status === "closed" && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Decision:</span>
                      <span className="text-muted-foreground">{debate.adminDecision}</span>
                      {debate.penalty && (
                        <Badge variant="destructive" className="ml-2">
                          {debate.penalty}
                        </Badge>
                      )}
                    </div>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/groups/${groupId}/debates/${debate.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  const renderPenalties = () => {
    if (!isAdmin) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Only admins can view penalties</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {penaltiesLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading penalties...</div>
        ) : penalties.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No penalties issued</p>
              <p className="text-sm text-muted-foreground">
                A clean record! Keep up the positive community environment
              </p>
            </CardContent>
          </Card>
        ) : (
          penalties.map((penalty: MemberPenalty) => (
            <Card key={penalty.id} className="backdrop-blur-md bg-background/80">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{penalty.penaltyType}</CardTitle>
                    <CardDescription>
                      Issued {penalty.createdAt ? format(new Date(penalty.createdAt), "PPP") : "Recently"}
                    </CardDescription>
                  </div>
                  {penalty.expiresAt && new Date(penalty.expiresAt) > new Date() ? (
                    <Badge variant="destructive">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Expired</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Reason:</span>{" "}
                  <span className="text-muted-foreground">{penalty.reason}</span>
                </div>
                {penalty.duration && (
                  <div>
                    <span className="font-medium">Duration:</span>{" "}
                    <span className="text-muted-foreground">{penalty.duration} days</span>
                  </div>
                )}
                {penalty.expiresAt && (
                  <div>
                    <span className="font-medium">Expires:</span>{" "}
                    <span className="text-muted-foreground">
                      {format(new Date(penalty.expiresAt), "PPP")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <SharedNavigation />
      
      <main className="container mx-auto px-4 pt-20 pb-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 mb-4"
          >
            <Link href={`/groups/${groupId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Group
            </Link>
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Group Policies</h1>
          </div>
          <p className="text-muted-foreground">
            Manage community guidelines and handle policy violations
          </p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="policies" className="gap-2">
              <FileText className="h-4 w-4" />
              Policies
            </TabsTrigger>
            <TabsTrigger value="debates" className="gap-2" disabled={!isAdmin}>
              <Gavel className="h-4 w-4" />
              Debates
            </TabsTrigger>
            <TabsTrigger value="penalties" className="gap-2" disabled={!isAdmin}>
              <AlertTriangle className="h-4 w-4" />
              Penalties
            </TabsTrigger>
          </TabsList>

          <TabsContent value="policies" className="space-y-4">
            {renderPolicies()}
          </TabsContent>

          <TabsContent value="debates" className="space-y-4">
            {renderDebates()}
          </TabsContent>

          <TabsContent value="penalties" className="space-y-4">
            {renderPenalties()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}