
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Bot, Send, TestTube, Twitter, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const SystemTestPanel = () => {
  const { toast } = useToast();
  const { user } = useAdminAuth();
  const [isTestingTwitter, setIsTestingTwitter] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [testMessage, setTestMessage] = useState("This is a test message from the POOPEE AI system! 🚀");
  const [aiPrompt, setAiPrompt] = useState("Generate a fun tweet about crypto and memes");
  const [selectedAgent, setSelectedAgent] = useState("");
  const [selectedTwitterAccount, setSelectedTwitterAccount] = useState("");
  const [agents, setAgents] = useState<any[]>([]);
  const [twitterAccounts, setTwitterAccounts] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<any>(null);

  const loadTestData = async () => {
    try {
      // Load agents
      const { data: agentsData } = await supabase
        .from('ai_agent_signups')
        .select('*')
        .eq('status', 'approved')
        .eq('active', true);

      // Load Twitter accounts
      const { data: twitterData } = await supabase
        .from('user_twitter_connections')
        .select('*')
        .eq('is_active', true);

      setAgents(agentsData || []);
      setTwitterAccounts(twitterData || []);
    } catch (error) {
      console.error('Error loading test data:', error);
    }
  };

  useState(() => {
    loadTestData();
  });

  const testTwitterConnection = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "No user authenticated",
        variant: "destructive",
      });
      return;
    }

    setIsTestingTwitter(true);
    setTestResults(null);

    try {
      console.log('🧪 Testing Twitter integration...');

      const { data, error } = await supabase.functions.invoke('twitter-integration', {
        body: {
          action: 'test-tweet',
          tweetText: testMessage,
          userId: user.id,
          twitterAccountId: selectedTwitterAccount || undefined,
        },
      });

      if (error) {
        console.error('❌ Twitter test failed:', error);
        throw error;
      }

      console.log('✅ Twitter test result:', data);

      setTestResults({
        type: 'twitter',
        success: data.success,
        data: data,
        timestamp: new Date().toISOString()
      });

      if (data.success) {
        toast({
          title: "Twitter Test Successful",
          description: data.message || "Test tweet posted successfully!",
        });
      } else {
        throw new Error(data.error || 'Twitter test failed');
      }

    } catch (error: any) {
      console.error('❌ Twitter test error:', error);
      setTestResults({
        type: 'twitter',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Twitter Test Failed",
        description: error.message || "Failed to post test tweet",
        variant: "destructive",
      });
    } finally {
      setIsTestingTwitter(false);
    }
  };

  const testAIGeneration = async () => {
    if (!user?.id || !selectedAgent || !selectedTwitterAccount) {
      toast({
        title: "Error",
        description: "Please select an agent and Twitter account",
        variant: "destructive",
      });
      return;
    }

    setIsTestingAI(true);
    setTestResults(null);

    try {
      console.log('🤖 Testing AI generation and posting...');

      const { data, error } = await supabase.functions.invoke('twitter-integration', {
        body: {
          action: 'generate-and-post',
          userId: user.id,
          agentId: selectedAgent,
          twitterAccountId: selectedTwitterAccount,
          prompt: aiPrompt,
        },
      });

      if (error) {
        console.error('❌ AI test failed:', error);
        throw error;
      }

      console.log('✅ AI test result:', data);

      setTestResults({
        type: 'ai',
        success: data.success,
        data: data,
        timestamp: new Date().toISOString()
      });

      if (data.success) {
        toast({
          title: "AI Test Successful",
          description: data.message || "AI tweet generated and posted successfully!",
        });
      } else {
        throw new Error(data.error || 'AI test failed');
      }

    } catch (error: any) {
      console.error('❌ AI test error:', error);
      setTestResults({
        type: 'ai',
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "AI Test Failed",
        description: error.message || "Failed to generate and post AI tweet",
        variant: "destructive",
      });
    } finally {
      setIsTestingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            System Testing Panel
          </CardTitle>
          <CardDescription>
            Test Twitter connectivity and AI agent functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Twitter Connection Test */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter Integration Test
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-message">Test Message</Label>
                <Textarea
                  id="test-message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Enter test message to post..."
                  className="min-h-[80px]"
                />
              </div>
              
              <div>
                <Label htmlFor="twitter-account">Twitter Account (Optional)</Label>
                <Select value={selectedTwitterAccount} onValueChange={setSelectedTwitterAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Use app default or select account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Use App Default Account</SelectItem>
                    {twitterAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        @{account.username} ({account.display_name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={testTwitterConnection} 
              disabled={isTestingTwitter || !testMessage.trim()}
              className="gap-2"
            >
              {isTestingTwitter ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Testing Twitter...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Test Twitter Post
                </>
              )}
            </Button>
          </div>

          <div className="border-t pt-6">
            {/* AI Agent Test */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Agent Test
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent-select">AI Agent</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an AI agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.agent_name || agent.email} ({agent.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="twitter-account-ai">Twitter Account</Label>
                  <Select value={selectedTwitterAccount} onValueChange={setSelectedTwitterAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Twitter account" />
                    </SelectTrigger>
                    <SelectContent>
                      {twitterAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          @{account.username} ({account.display_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="ai-prompt">AI Prompt</Label>
                <Textarea
                  id="ai-prompt"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Enter prompt for AI content generation..."
                  className="min-h-[80px]"
                />
              </div>
              
              <Button 
                onClick={testAIGeneration}
                disabled={isTestingAI || !selectedAgent || !selectedTwitterAccount || !aiPrompt.trim()}
                className="gap-2"
              >
                {isTestingAI ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Testing AI Agent...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    Test AI Generation & Post
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Test Results */}
          {testResults && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Test Results</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    {testResults.success ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Success
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Failed
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {testResults.type === 'twitter' ? 'Twitter Test' : 'AI Agent Test'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(testResults.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {testResults.success ? (
                    <div className="space-y-2">
                      {testResults.data.tweetId && (
                        <p className="text-sm">
                          <strong>Tweet ID:</strong> {testResults.data.tweetId}
                        </p>
                      )}
                      {testResults.data.generatedContent && (
                        <div>
                          <p className="text-sm font-medium">Generated Content:</p>
                          <p className="text-sm bg-muted p-2 rounded">
                            {testResults.data.generatedContent}
                          </p>
                        </div>
                      )}
                      {testResults.data.message && (
                        <p className="text-sm text-green-600">
                          {testResults.data.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">
                      <strong>Error:</strong> {testResults.error}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Status */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">System Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Agents</span>
                    <Badge variant="secondary">{agents.length}</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Twitter Accounts</span>
                    <Badge variant="secondary">{twitterAccounts.length}</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Test</span>
                    <Badge variant={testResults?.success ? "default" : testResults ? "destructive" : "secondary"}>
                      {testResults ? (testResults.success ? "Pass" : "Fail") : "None"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
