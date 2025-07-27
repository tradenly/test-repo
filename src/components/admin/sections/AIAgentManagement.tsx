import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bot, Search, Filter, Eye, CheckCircle, XCircle } from "lucide-react";

interface AIAgentSignup {
  id: string;
  user_id: string;
  email: string;
  platform: string;
  cardano_wallet_address: string;
  agent_name?: string;
  category?: string;
  status: string;
  verified: boolean;
  ppee_tokens_verified: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    username?: string;
    full_name?: string;
  };
}

export const AIAgentManagement = () => {
  const { toast } = useToast();
  const [signups, setSignups] = useState<AIAgentSignup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSignup, setSelectedSignup] = useState<AIAgentSignup | null>(null);

  useEffect(() => {
    fetchSignups();
  }, []);

  const fetchSignups = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agent_signups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles separately
      const signupsWithProfiles = await Promise.all(
        (data || []).map(async (signup) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', signup.user_id)
            .maybeSingle();
          
          return {
            ...signup,
            profiles: profile || undefined
          };
        })
      );

      setSignups(signupsWithProfiles);
    } catch (error) {
      console.error('Error fetching AI agent signups:', error);
      toast({
        title: "Error",
        description: "Failed to load AI agent signups.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSignupStatus = async (signupId: string, updates: Partial<AIAgentSignup>) => {
    try {
      const { error } = await supabase
        .from('ai_agent_signups')
        .update(updates)
        .eq('id', signupId);

      if (error) throw error;

      setSignups(prev => prev.map(signup => 
        signup.id === signupId ? { ...signup, ...updates } : signup
      ));

      toast({
        title: "Success",
        description: "Signup status updated successfully.",
      });
    } catch (error) {
      console.error('Error updating signup:', error);
      toast({
        title: "Error",
        description: "Failed to update signup status.",
        variant: "destructive",
      });
    }
  };

  const filteredSignups = signups.filter(signup => {
    const matchesSearch = 
      signup.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.agent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      signup.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || signup.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Loading AI agent signups...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="h-8 w-8 text-yellow-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">AI Agent Management</h1>
          <p className="text-gray-400">Manage AI agent signups and configurations</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by email, agent name, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{signups.length}</div>
            <div className="text-sm text-gray-400">Total Signups</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {signups.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-400">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {signups.filter(s => s.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-400">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {signups.filter(s => s.ppee_tokens_verified).length}
            </div>
            <div className="text-sm text-gray-400">PPEE Verified</div>
          </CardContent>
        </Card>
      </div>

      {/* Signups List */}
      <Card>
        <CardHeader>
          <CardTitle>AI Agent Signups ({filteredSignups.length})</CardTitle>
          <CardDescription>Manage and review AI agent signup requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSignups.map((signup) => (
              <div key={signup.id} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">
                        {signup.agent_name || "Unnamed Agent"}
                      </h3>
                      {getStatusBadge(signup.status)}
                      {signup.ppee_tokens_verified && (
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          PPEE Verified
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      <p><strong>User:</strong> {signup.profiles?.full_name || signup.profiles?.username || 'Unknown'}</p>
                      <p><strong>Email:</strong> {signup.email}</p>
                      <p><strong>Platform:</strong> {signup.platform}</p>
                      <p><strong>Category:</strong> {signup.category || 'Not specified'}</p>
                      <p><strong>Cardano Address:</strong> {signup.cardano_wallet_address}</p>
                      <p><strong>Created:</strong> {new Date(signup.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSignup(signup)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    {signup.status === 'pending' && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => updateSignupStatus(signup.id, { status: 'approved' })}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateSignupStatus(signup.id, { status: 'rejected' })}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateSignupStatus(signup.id, { 
                        ppee_tokens_verified: !signup.ppee_tokens_verified 
                      })}
                    >
                      {signup.ppee_tokens_verified ? "Unverify PPEE" : "Verify PPEE"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredSignups.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No AI agent signups found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Signup Details Modal */}
      {selectedSignup && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-card border border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Signup Details: {selectedSignup.agent_name || "Unnamed Agent"}</CardTitle>
              <Button variant="ghost" onClick={() => setSelectedSignup(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-white mb-2">Basic Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Agent Name:</strong> {selectedSignup.agent_name || 'Not specified'}</p>
                  <p><strong>Category:</strong> {selectedSignup.category || 'Not specified'}</p>
                  <p><strong>Email:</strong> {selectedSignup.email}</p>
                  <p><strong>Platform:</strong> {selectedSignup.platform}</p>
                  <p><strong>Cardano Address:</strong> {selectedSignup.cardano_wallet_address}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">Status</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>Status:</span> {getStatusBadge(selectedSignup.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>PPEE Verified:</span>
                    {selectedSignup.ppee_tokens_verified ? (
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-400 border-red-400">
                        <XCircle className="h-3 w-3 mr-1" />
                        No
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};