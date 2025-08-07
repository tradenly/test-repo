import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bot, 
  Send, 
  Sparkles, 
  AlertCircle,
  Trash2,
  MessageSquare,
  Twitter,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TwitterConnectionManager } from './TwitterConnectionManager';

interface TwitterConnection {
  id: string;
  username: string;
  display_name: string;
  is_active: boolean;
}

interface AIAgent {
  id: string;
  agent_name: string;
  category: string;
  description?: string;
  personality?: string;
  posting_probability?: number;
  timeline_reply_probability?: number;
  status: string;
  active: boolean;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  post_type: string;
  status: string;
  posted_at?: string;
  twitter_post_id?: string;
  ai_agent_signups?: { agent_name: string };
  user_twitter_connections?: { username: string };
  created_at: string;
}

interface AIAgentSectionProps {
  user: { id: string; email?: string };
}

export const AIAgentSection: React.FC<AIAgentSectionProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [connections, setConnections] = useState<TwitterConnection[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Form states
  const [agentName, setAgentName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [postingProbability, setPostingProbability] = useState("5");
  const [timelineReplyProbability, setTimelineReplyProbability] = useState("1");
  
  // Test tweet states
  const [testTweetContent, setTestTweetContent] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  
  // AI tweet states
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_agent_signups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error: any) {
      console.error('Error loading agents:', error);
      toast({
        title: "Error",
        description: "Failed to load AI agents.",
        variant: "destructive"
      });
    }
  };

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('twitter-oauth-v2', {
        body: { action: 'check-connection', userId: user.id }
      });

      if (error) throw error;
      setConnections(data.connections || []);
      
      // Set first active connection as default
      const activeConnections = data.connections?.filter((c: TwitterConnection) => c.is_active) || [];
      if (activeConnections.length > 0 && !selectedConnection) {
        setSelectedConnection(activeConnections[0].id);
      }
    } catch (error: any) {
      console.error('Error loading connections:', error);
    }
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('twitter-api', {
        body: { action: 'get-posts', userId: user.id }
      });

      if (error) throw error;
      setPosts(data.posts || []);
    } catch (error: any) {
      console.error('Error loading posts:', error);
    }
  };

  useEffect(() => {
    loadAgents();
    loadConnections();
    loadPosts();
  }, [user.id]);

  const validateBasicFields = () => {
    if (!agentName || !category || !description) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in Agent Name, Category, and Description fields.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const validatePersonalityFields = () => {
    if (!personality) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in the Personality field.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const createAgent = async () => {
    if (!validateBasicFields() || !validatePersonalityFields()) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('ai_agent_signups')
        .insert({
          user_id: user.id,
          agent_name: agentName,
          category,
          description,
          personality,
          posting_probability: parseInt(postingProbability),
          timeline_reply_probability: parseInt(timelineReplyProbability),
          status: 'approved',
          active: true,
          email: user.email || '',
          platform: 'twitter',
          cardano_wallet_address: 'not_required'
        });

      if (error) throw error;

      toast({
        title: "Agent Created",
        description: "Your AI agent has been created successfully."
      });

      // Clear form
      setAgentName("");
      setCategory("");
      setDescription("");
      setPersonality("");
      setPostingProbability("5");
      setTimelineReplyProbability("1");
      
      loadAgents();
      setActiveTab("deployed");
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('ai_agent_signups')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      setAgents(prev => prev.filter(agent => agent.id !== agentId));
      toast({
        title: "Agent Deleted",
        description: "Your AI agent has been deleted successfully."
      });
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sendTestTweet = async () => {
    if (!testTweetContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter tweet content.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedConnection) {
      toast({
        title: "Error",
        description: "Please select a Twitter connection.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSendingTest(true);
      const { data, error } = await supabase.functions.invoke('twitter-api', {
        body: {
          action: 'test-tweet',
          userId: user.id,
          connectionId: selectedConnection,
          content: testTweetContent
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: data.message || "Test tweet posted successfully!"
        });
        setTestTweetContent("");
        loadPosts();
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error: any) {
      console.error('Error sending test tweet:', error);
      toast({
        title: "Tweet Failed",
        description: error.message || "Failed to send test tweet.",
        variant: "destructive"
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const generateAndPostTweet = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the AI.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAgent) {
      toast({
        title: "Error",
        description: "Please select an AI agent.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedConnection) {
      toast({
        title: "Error",
        description: "Please select a Twitter connection.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('twitter-api', {
        body: {
          action: 'generate-and-post',
          userId: user.id,
          connectionId: selectedConnection,
          agentId: selectedAgent,
          prompt: aiPrompt
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: `AI generated and posted: "${data.content.substring(0, 50)}..."`
        });
        setAiPrompt("");
        loadPosts();
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error: any) {
      console.error('Error with AI tweet:', error);
      toast({
        title: "AI Tweet Failed",
        description: error.message || "Failed to generate and post AI tweet.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const activeConnections = connections.filter(c => c.is_active);
  const hasActiveConnection = activeConnections.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">AI Agent Management</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="create">Create Agent</TabsTrigger>
          <TabsTrigger value="deployed">Deployed Agents</TabsTrigger>
          <TabsTrigger value="twitter">Twitter Connection</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="posts">Post History</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New AI Agent</CardTitle>
              <CardDescription>Set up your AI agent's basic information and personality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent-name">Agent Name *</Label>
                  <Input
                    id="agent-name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Enter agent name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="memecoin">Memecoin</SelectItem>
                      <SelectItem value="nft">NFT Collection</SelectItem>
                      <SelectItem value="crypto">Crypto Project</SelectItem>
                      <SelectItem value="influencer">Influencer</SelectItem>
                      <SelectItem value="brand">Brand</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what your agent represents..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="personality">Personality *</Label>
                <Textarea
                  id="personality"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="Describe your agent's personality, tone, and style..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="posting-prob">Posting Frequency (per day)</Label>
                  <Select value={postingProbability} onValueChange={setPostingProbability}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 post per day</SelectItem>
                      <SelectItem value="3">3 posts per day</SelectItem>
                      <SelectItem value="5">5 posts per day</SelectItem>
                      <SelectItem value="10">10 posts per day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="reply-prob">Reply Frequency</Label>
                  <Select value={timelineReplyProbability} onValueChange={setTimelineReplyProbability}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Low</SelectItem>
                      <SelectItem value="3">Medium</SelectItem>
                      <SelectItem value="5">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={createAgent} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Agent...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Create AI Agent
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your AI Agents</CardTitle>
              <CardDescription>Manage your deployed AI agents</CardDescription>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No AI agents created yet. Create your first agent to get started.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{agent.agent_name}</h4>
                          <p className="text-sm text-muted-foreground">{agent.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={agent.status === 'approved' ? "default" : "secondary"}>
                            {agent.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAgent(agent.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {agent.description && (
                        <p className="text-sm">{agent.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Posts per day:</span>
                          <span className="ml-2">{agent.posting_probability || 5}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2">{new Date(agent.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="twitter" className="space-y-6">
          <TwitterConnectionManager 
            userId={user.id} 
            onConnectionChange={loadConnections}
          />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          {!hasActiveConnection && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need to connect a Twitter account before testing. 
                Go to the Twitter Connection tab to connect an account.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Tweet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Test Tweet
                </CardTitle>
                <CardDescription>Send a test tweet to verify your connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="twitter-connection">Twitter Account</Label>
                  <Select 
                    value={selectedConnection} 
                    onValueChange={setSelectedConnection}
                    disabled={!hasActiveConnection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Twitter account" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeConnections.map((connection) => (
                        <SelectItem key={connection.id} value={connection.id}>
                          @{connection.username} ({connection.display_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="test-tweet">Tweet Content</Label>
                  <Textarea
                    id="test-tweet"
                    value={testTweetContent}
                    onChange={(e) => setTestTweetContent(e.target.value)}
                    placeholder="Enter your test tweet content..."
                    maxLength={280}
                    disabled={!hasActiveConnection}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {testTweetContent.length}/280 characters
                  </p>
                </div>

                <Button 
                  onClick={sendTestTweet} 
                  disabled={isSendingTest || !hasActiveConnection}
                  className="w-full"
                >
                  {isSendingTest ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Test Tweet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* AI Generated Tweet */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Generated Tweet
                </CardTitle>
                <CardDescription>Let your AI agent generate and post a tweet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ai-agent">AI Agent</Label>
                  <Select 
                    value={selectedAgent} 
                    onValueChange={setSelectedAgent}
                    disabled={agents.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.filter(a => a.status === 'approved').map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.agent_name} ({agent.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ai-prompt">AI Prompt</Label>
                  <Textarea
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="What should your AI agent tweet about?"
                    disabled={!hasActiveConnection || agents.length === 0}
                  />
                </div>

                <Button 
                  onClick={generateAndPostTweet} 
                  disabled={isGenerating || !hasActiveConnection || agents.length === 0}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating & Posting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate & Post Tweet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Post History
              </CardTitle>
              <CardDescription>View your recent AI agent posts</CardDescription>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No posts yet. Create an agent and start posting to see your history here.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant={post.post_type === 'test' ? "secondary" : "default"}>
                            {post.post_type === 'test' ? 'Test' : 'AI Generated'}
                          </Badge>
                          <Badge variant={post.status === 'posted' ? "default" : "destructive"}>
                            {post.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {post.posted_at ? new Date(post.posted_at).toLocaleString() : 'Not posted'}
                        </div>
                      </div>
                      
                      <p className="text-sm">{post.content}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {post.ai_agent_signups?.agent_name && (
                            <span>Agent: {post.ai_agent_signups.agent_name}</span>
                          )}
                          {post.user_twitter_connections?.username && (
                            <span>@{post.user_twitter_connections.username}</span>
                          )}
                        </div>
                        {post.twitter_post_id && (
                          <Badge variant="outline" className="text-xs">
                            <Twitter className="h-3 w-3 mr-1" />
                            Posted
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};