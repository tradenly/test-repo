import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { Bot, Info, Wallet, Settings, BarChart3, Power, PowerOff, Edit, Trash2, MessageSquare, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TwitterAccountConnection } from "./TwitterAccountConnection";

interface AIAgentSectionProps {
  user: UnifiedUser;
}

export const AIAgentSection = ({ user }: AIAgentSectionProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [deployedAgents, setDeployedAgents] = useState<any[]>([]);
  const [userTier, setUserTier] = useState(1); // Default tier 1
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // Profile fields
  const [agentName, setAgentName] = useState("");
  const [category, setCategory] = useState("");
  const [ticker, setTicker] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [marketCapValue, setMarketCapValue] = useState("");
  const [cryptoNetwork, setCryptoNetwork] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [age, setAge] = useState("");
  const [bio, setBio] = useState("");

  // Personality fields
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [responseStyle, setResponseStyle] = useState("");
  const [adjectives, setAdjectives] = useState("");
  const [tone, setTone] = useState("");
  const [appearance, setAppearance] = useState("");

  // Posting fields
  const [socialProfile, setSocialProfile] = useState("");
  const [postingProbability, setPostingProbability] = useState("5");
  const [timelineReplyProbability, setTimelineReplyProbability] = useState("1");
  const [socialUsername, setSocialUsername] = useState("");
  const [socialPassword, setSocialPassword] = useState("");
  const [voiceModel, setVoiceModel] = useState("");
  const [voiceType, setVoiceType] = useState("");
  const [triggerApiKey, setTriggerApiKey] = useState("");
  
  // Enhanced scheduling fields
  const [timezone, setTimezone] = useState("UTC");
  const [frequencyMinutes, setFrequencyMinutes] = useState("60");
  const [maxPostsPerDay, setMaxPostsPerDay] = useState("24");
  const [activeDays, setActiveDays] = useState([1,2,3,4,5,6,7]);
  const [activeHoursStart, setActiveHoursStart] = useState("9");
  const [activeHoursEnd, setActiveHoursEnd] = useState("17");
  
  // Twitter authentication method
  const [twitterAuthMethod, setTwitterAuthMethod] = useState("oauth_v2");

  // Testing fields
  const [inReplyToId, setInReplyToId] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);

  // Signup fields
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState("");
  const [cardanoAddress, setCardanoAddress] = useState("");

  // Helper functions for deployed agents
  const getTierLimit = (tier: number) => {
    const limits = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
    return limits[tier as keyof typeof limits] || 1;
  };

  const loadDeployedAgents = async () => {
    setIsLoadingAgents(true);
    try {
      const { data, error } = await supabase
        .from('ai_agent_signups')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'approved', 'active', 'inactive']);
      
      if (error) throw error;
      setDeployedAgents(data || []);
    } catch (error) {
      console.error('Error loading deployed agents:', error);
      toast({
        title: "Error Loading Agents",
        description: "Failed to load your deployed agents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [selectedTwitterAccount, setSelectedTwitterAccount] = useState<string>('');
  const [twitterAccounts, setTwitterAccounts] = useState<any[]>([]);
  
  // Test tweet functionality
  const [testTweetContent, setTestTweetContent] = useState('');
  const [selectedTestAccount, setSelectedTestAccount] = useState<string>('');
  const [testTweetLoading, setTestTweetLoading] = useState(false);
  
  // AI tweet functionality
  const [aiTweetPrompt, setAiTweetPrompt] = useState('');
  const [selectedAiAgent, setSelectedAiAgent] = useState<string>('');
  const [selectedAiTestAccount, setSelectedAiTestAccount] = useState<string>('');
  const [aiTweetLoading, setAiTweetLoading] = useState(false);

  const toggleAgentStatus = async (agentId: string, newStatus: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('ai_agent_signups')
        .update({ active: newStatus === 'active' })
        .eq('id', agentId);

      if (error) throw error;

      setDeployedAgents(prev => 
        prev.map(agent => 
          agent.id === agentId ? { ...agent, active: newStatus === 'active' } : agent
        )
      );

      toast({
        title: `Agent ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        description: `Your agent has been ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      console.error('Error toggling agent status:', error);
      toast({
        title: "Error",
        description: "Failed to update agent status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const editAgent = (agent: any) => {
    setEditingAgent(agent);
    // Pre-fill form with agent data
    setAgentName(agent.agent_name || '');
    setCategory(agent.category || '');
    setTicker(agent.ticker || '');
    setPolicyId(agent.policy_id || '');
    setMarketCapValue(agent.market_cap_value?.toString() || '');
    setCryptoNetwork(agent.crypto_network || '');
    setImageUrl(agent.image_url || '');
    setAge(agent.age?.toString() || '');
    setBio(agent.bio || '');
    setDescription(agent.description || '');
    setPersonality(agent.personality || '');
    setFirstMessage(agent.first_message || '');
    setResponseStyle(agent.response_style || '');
    setAdjectives(agent.adjectives || '');
    setTone(agent.tone || '');
    setAppearance(agent.appearance || '');
    setSocialProfile(agent.social_profile || '');
    setPostingProbability(agent.posting_probability?.toString() || '5');
    setTimelineReplyProbability(agent.timeline_reply_probability?.toString() || '1');
    setSocialUsername(agent.social_username || '');
    setSocialPassword(agent.social_password || '');
    setVoiceModel(agent.voice_model || '');
    setVoiceType(agent.voice_type || '');
    setTriggerApiKey(agent.trigger_api_key || '');
    setActiveTab('profile');
  };

  const saveAgentChanges = async () => {
    if (!editingAgent) return;

    try {
      const { error } = await supabase
        .from('ai_agent_signups')
        .update({
          agent_name: agentName,
          category,
          ticker,
          policy_id: policyId,
          market_cap_value: marketCapValue ? parseFloat(marketCapValue) : null,
          crypto_network: cryptoNetwork,
          image_url: imageUrl,
          age: age ? parseInt(age) : null,
          bio,
          description,
          personality,
          first_message: firstMessage,
          response_style: responseStyle,
          adjectives,
          tone,
          appearance,
          social_profile: socialProfile,
          posting_probability: parseInt(postingProbability),
          timeline_reply_probability: parseInt(timelineReplyProbability),
          social_username: socialUsername,
          social_password: socialPassword,
          voice_model: voiceModel,
          voice_type: voiceType,
          trigger_api_key: triggerApiKey,
        })
        .eq('id', editingAgent.id);

      if (error) throw error;

      toast({
        title: "Agent Updated",
        description: "Your AI agent has been updated successfully.",
      });

      setEditingAgent(null);
      loadDeployedAgents();
      
      // Reset form
      setAgentName("");
      setCategory("");
      setTicker("");
      setPolicyId("");
      setMarketCapValue("");
      setCryptoNetwork("");
      setImageUrl("");
      setAge("");
      setBio("");
      setDescription("");
      setPersonality("");
      setFirstMessage("");
      setResponseStyle("");
      setAdjectives("");
      setTone("");
      setAppearance("");
      setSocialProfile("");
      setPostingProbability("5");
      setTimelineReplyProbability("1");
      setSocialUsername("");
      setSocialPassword("");
      setVoiceModel("");
      setVoiceType("");
      setTriggerApiKey("");
      
      setActiveTab('deployed');
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadTwitterAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('user_twitter_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setTwitterAccounts(data || []);
    } catch (error) {
      console.error('Error loading Twitter accounts:', error);
    }
  };

  useEffect(() => {
    loadTwitterAccounts();
  }, [user.id]);

  const handleTestTweet = async () => {
    if (!testTweetContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter tweet content.",
        variant: "destructive",
      });
      return;
    }

    const accountToUse = selectedTestAccount || twitterAccounts[0]?.id;
    if (!accountToUse) {
      toast({
        title: "Error", 
        description: "No Twitter account selected.",
        variant: "destructive",
      });
      return;
    }

    setTestTweetLoading(true);

    try {
      // Use appropriate Twitter integration based on auth method
      const functionName = twitterAuthMethod === "oauth_v1" ? 'twitter-integration-v1' : 'twitter-integration';
      const requestBody = twitterAuthMethod === "oauth_v1" ? 
        {
          action: 'test-tweet-v1',
          text: testTweetContent,
          userId: user.id
        } : 
        {
          action: 'test-tweet',
          tweetText: testTweetContent,
          userId: user.id,
          twitterAccountId: accountToUse
        };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: data.message || "Test tweet posted successfully!",
        });
        setTestTweetContent('');
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Error sending test tweet:', error);
      toast({
        title: "Tweet Failed",
        description: error.message || "Failed to send test tweet. Please check your Twitter connection.",
        variant: "destructive",
      });
    } finally {
      setTestTweetLoading(false);
    }
  };

  const handleAiTweet = async () => {
    if (!aiTweetPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the AI.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAiAgent) {
      toast({
        title: "Error",
        description: "Please select an AI agent.",
        variant: "destructive",
      });
      return;
    }

    const accountToUse = selectedAiTestAccount || twitterAccounts[0]?.id;
    if (!accountToUse) {
      toast({
        title: "Error", 
        description: "No Twitter account selected.",
        variant: "destructive",
      });
      return;
    }

    setAiTweetLoading(true);

    try {
      // Use appropriate Twitter integration based on auth method
      const functionName = twitterAuthMethod === "oauth_v1" ? 'twitter-integration-v1' : 'twitter-integration';
      const requestBody = twitterAuthMethod === "oauth_v1" ? 
        {
          action: 'generate-and-post-v1',
          prompt: aiTweetPrompt,
          userId: user.id,
          agentId: selectedAiAgent
        } : 
        {
          action: 'generate-and-post',
          prompt: aiTweetPrompt,
          userId: user.id,
          agentId: selectedAiAgent,
          twitterAccountId: accountToUse
        };

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: requestBody
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success!",
          description: `AI generated and posted: "${data.content.substring(0, 50)}..."`,
        });
        setAiTweetPrompt('');
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Error with AI tweet:', error);
      toast({
        title: "AI Tweet Failed",
        description: error.message || "Failed to generate and post AI tweet.",
        variant: "destructive",
      });
    } finally {
      setAiTweetLoading(false);
    }
  };

  const deleteAgent = async (agentId: string) => {
    try {
      const { error } = await supabase
        .from('ai_agent_signups')
        .delete()
        .eq('id', agentId);

      if (error) throw error;

      setDeployedAgents(prev => prev.filter(agent => agent.id !== agentId));

      toast({
        title: "Agent Deleted",
        description: "Your AI agent has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load deployed agents when the deployed tab is accessed
  useEffect(() => {
    if (activeTab === 'deployed') {
      loadDeployedAgents();
    }
  }, [activeTab]);

  // Validation functions for each tab
  const validateProfileTab = () => {
    if (!agentName || !category || !age) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in Agent Name, Category, and Age fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validatePersonalityTab = () => {
    if (!description) {
      toast({
        title: "Required Fields Missing", 
        description: "Please fill in the Description field.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validatePostingTab = () => {
    if (!socialProfile || !postingProbability || !timelineReplyProbability) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in Social Profile, Posting Probability, and Timeline Reply Probability fields.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const validateSignupFields = () => {
    if (!email || !platform || !cardanoAddress) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in email, platform, and Cardano wallet address in the signup section.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Tab navigation functions
  const handleSaveAndNext = (currentTab: string, nextTab: string, validationFn: () => boolean) => {
    if (validationFn()) {
      setActiveTab(nextTab);
      toast({
        title: "Progress Saved",
        description: "Your information has been saved. Continue with the next step.",
      });
    }
  };

  const handleCreateAgent = async () => {
    // Validate all required tabs
    if (!validateProfileTab() || !validatePersonalityTab() || !validatePostingTab() || !validateSignupFields()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('ai_agent_signups')
        .insert({
          user_id: user.id,
          email,
          platform,
          cardano_wallet_address: cardanoAddress,
          agent_name: agentName,
          category,
          ticker,
          policy_id: policyId,
          market_cap_value: marketCapValue ? parseFloat(marketCapValue) : null,
          crypto_network: cryptoNetwork,
          image_url: imageUrl,
          age: age ? parseInt(age) : null,
          bio,
          description,
          personality,
          first_message: firstMessage,
          response_style: responseStyle,
          adjectives,
          tone,
          appearance,
          social_profile: socialProfile,
          posting_probability: parseInt(postingProbability),
          timeline_reply_probability: parseInt(timelineReplyProbability),
          voice_model: voiceModel,
          voice_type: voiceType,
          trigger_api_key: triggerApiKey,
          social_username: socialUsername,
          social_password: socialPassword,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "AI Agent Created Successfully",
        description: "Your AI agent has been created and is pending approval!",
      });

      // Reset form
      setEmail("");
      setPlatform("");
      setCardanoAddress("");
      setAgentName("");
      setCategory("");
      setTicker("");
      setPolicyId("");
      setMarketCapValue("");
      setCryptoNetwork("");
      setImageUrl("");
      setAge("");
      setBio("");
      setDescription("");
      setPersonality("");
      setFirstMessage("");
      setResponseStyle("");
      setAdjectives("");
      setTone("");
      setAppearance("");
      setSocialProfile("");
      setPostingProbability("5");
      setTimelineReplyProbability("1");
      setSocialUsername("");
      setSocialPassword("");
      setVoiceModel("");
      setVoiceType("");
      setTriggerApiKey("");

      // Navigate to deployed agents tab and reload
      setActiveTab('deployed');
      loadDeployedAgents();

    } catch (error) {
      console.error('Error creating AI agent:', error);
      toast({
        title: "Creation Failed",
        description: "There was an error creating your AI agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!email || !platform || !cardanoAddress) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in email, platform, and Cardano wallet address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('ai_agent_signups')
        .insert({
          user_id: user.id,
          email,
          platform,
          cardano_wallet_address: cardanoAddress,
          agent_name: agentName,
          category,
          ticker,
          policy_id: policyId,
          market_cap_value: marketCapValue ? parseFloat(marketCapValue) : null,
          crypto_network: cryptoNetwork,
          image_url: imageUrl,
          age: age ? parseInt(age) : null,
          bio,
          description,
          personality,
          first_message: firstMessage,
          response_style: responseStyle,
          adjectives,
          tone,
          appearance,
          social_profile: socialProfile,
          posting_probability: parseInt(postingProbability),
          timeline_reply_probability: parseInt(timelineReplyProbability),
          voice_model: voiceModel,
          voice_type: voiceType,
          trigger_api_key: triggerApiKey,
        });

      if (error) throw error;

      toast({
        title: "AI Agent Signup Submitted",
        description: "Your AI agent configuration has been submitted successfully!",
      });

      // Reset form
      setEmail("");
      setPlatform("");
      setCardanoAddress("");
      setAgentName("");
      setCategory("");
      setTicker("");
      setPolicyId("");
      setMarketCapValue("");
      setCryptoNetwork("");
      setImageUrl("");
      setAge("");
      setBio("");
      setDescription("");
      setPersonality("");
      setFirstMessage("");
      setResponseStyle("");
      setAdjectives("");
      setTone("");
      setAppearance("");
      setSocialProfile("");
      setPostingProbability("5");
      setTimelineReplyProbability("1");
      setSocialUsername("");
      setSocialPassword("");
      setVoiceModel("");
      setVoiceType("");
      setTriggerApiKey("");

    } catch (error) {
      console.error('Error submitting AI agent signup:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your AI agent configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Agent Configuration</h1>
          <p className="text-gray-400">Configure and launch your own AI agent for social media</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-card">
          <TabsTrigger value="profile">{editingAgent ? 'Edit' : 'Profile'}</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="posting">Posting</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
          <TabsTrigger value="deployed">Deployed Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Configure your AI agent's basic profile settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Name*</Label>
                  <Input
                    id="agent-name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Agent name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category*</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="defi">DeFi</SelectItem>
                      <SelectItem value="nft">NFT</SelectItem>
                      <SelectItem value="gaming">Gaming</SelectItem>
                      <SelectItem value="meme">Meme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticker">Ticker</Label>
                  <Input
                    id="ticker"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    placeholder="Token ticker"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy-id">PolicyId</Label>
                  <Input
                    id="policy-id"
                    value={policyId}
                    onChange={(e) => setPolicyId(e.target.value)}
                    placeholder="Policy ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="market-cap">Market Cap Value</Label>
                  <Input
                    id="market-cap"
                    type="number"
                    value={marketCapValue}
                    onChange={(e) => setMarketCapValue(e.target.value)}
                    placeholder="Market cap"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crypto-network">Crypto Network</Label>
                  <Select value={cryptoNetwork} onValueChange={setCryptoNetwork}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select network" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardano">Cardano</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Profile image URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age*</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Agent age"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short bio of the agent, max 500 characters."
                  maxLength={500}
                />
              </div>
              
              {/* Save & Next Button */}
              <div className="flex justify-end pt-4 border-t border-border">
                <Button 
                  onClick={() => handleSaveAndNext('profile', 'personality', validateProfileTab)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Save & Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personality Configuration</CardTitle>
              <CardDescription>Define your AI agent's personality and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description*</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief overview of the agent's purpose, appearance, and primary function"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personality">Personality</Label>
                <Textarea
                  id="personality"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="Personality traits - Example: manipulative, flirtatious, sadistic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="first-message">First Message</Label>
                <Textarea
                  id="first-message"
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  placeholder="Insert the exact opening message the agent will send"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="response-style">Response Style</Label>
                <Textarea
                  id="response-style"
                  value={responseStyle}
                  onChange={(e) => setResponseStyle(e.target.value)}
                  placeholder="Example: short responses, use plain American English, avoid rhetorical questions"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjectives">Adjectives</Label>
                <Textarea
                  id="adjectives"
                  value={adjectives}
                  onChange={(e) => setAdjectives(e.target.value)}
                  placeholder="Example: intelligent, insane, schizo-autist"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Textarea
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  placeholder="Example: seductive, humorous, technical, casual"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appearance">Appearance</Label>
                <Textarea
                  id="appearance"
                  value={appearance}
                  onChange={(e) => setAppearance(e.target.value)}
                  placeholder="Appearance of the agent, example: a woman with long black hair and blue eyes"
                />
              </div>
              
              {/* Save & Next Button */}
              <div className="flex justify-end pt-4 border-t border-border">
                <Button 
                  onClick={() => handleSaveAndNext('personality', 'posting', validatePersonalityTab)}
                  className="bg-primary hover:bg-primary/90"
                >
                  Save & Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Posting Configuration</CardTitle>
              <CardDescription>Configure posting behavior and voice settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="social-profile">Social Profile</Label>
                  <Select value={socialProfile} onValueChange={setSocialProfile}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="posting-probability">Posting Probability (%)*</Label>
                  <Input
                    id="posting-probability"
                    type="number"
                    min="0"
                    max="10"
                    value={postingProbability}
                    onChange={(e) => setPostingProbability(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Probability to make a post on every job execution. Don't use values over 10.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline-reply-probability">Timeline Reply Probability (%)*</Label>
                  <Input
                    id="timeline-reply-probability"
                    type="number"
                    min="0"
                    max="5"
                    value={timelineReplyProbability}
                    onChange={(e) => setTimelineReplyProbability(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Probability to reply to a timeline post. Don't use values over 5.</p>
                </div>
              </div>

              {/* Enhanced Scheduling Section */}
              <div className="bg-background border rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold mb-3">Posting Schedule Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Posting Frequency</Label>
                    <Select value={frequencyMinutes} onValueChange={setFrequencyMinutes}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                        <SelectItem value="30">Every 30 minutes</SelectItem>
                        <SelectItem value="60">Every hour</SelectItem>
                        <SelectItem value="120">Every 2 hours</SelectItem>
                        <SelectItem value="240">Every 4 hours</SelectItem>
                        <SelectItem value="480">Every 8 hours</SelectItem>
                        <SelectItem value="720">Every 12 hours</SelectItem>
                        <SelectItem value="1440">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-posts">Max Posts Per Day</Label>
                    <Input
                      id="max-posts"
                      type="number"
                      min="1"
                      max="100"
                      value={maxPostsPerDay}
                      onChange={(e) => setMaxPostsPerDay(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Daily posting limit for rate control</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="active-hours-start">Active Hours Start</Label>
                    <Input
                      id="active-hours-start"
                      type="number"
                      min="0"
                      max="23"
                      value={activeHoursStart}
                      onChange={(e) => setActiveHoursStart(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="active-hours-end">Active Hours End</Label>
                    <Input
                      id="active-hours-end"
                      type="number"
                      min="0"
                      max="23"
                      value={activeHoursEnd}
                      onChange={(e) => setActiveHoursEnd(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Active Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 1, label: 'Mon' },
                      { value: 2, label: 'Tue' },
                      { value: 3, label: 'Wed' },
                      { value: 4, label: 'Thu' },
                      { value: 5, label: 'Fri' },
                      { value: 6, label: 'Sat' },
                      { value: 7, label: 'Sun' }
                    ].map(day => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={activeDays.includes(day.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setActiveDays(prev => 
                            prev.includes(day.value) 
                              ? prev.filter(d => d !== day.value)
                              : [...prev, day.value]
                          );
                        }}
                      >
                        {day.label}
                      </Button>
                    ))}
                   </div>
                 </div>
               </div>

               {/* Social Media Credentials */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">Social Media Credentials</h3>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>We recommend setting up an alt account to use with your AI agent in the event that you get banned from that platform for over posting. It is not recommended for you to use your main social media account.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="social-username">Username</Label>
                    <Input
                      id="social-username"
                      value={socialUsername}
                      onChange={(e) => setSocialUsername(e.target.value)}
                      placeholder="Enter username for selected platform"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="social-password">Password</Label>
                    <Input
                      id="social-password"
                      type="password"
                      value={socialPassword}
                      onChange={(e) => setSocialPassword(e.target.value)}
                      placeholder="Enter password for selected platform"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Voice</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voice-model">Voice Model</Label>
                    <Select value={voiceModel} onValueChange={setVoiceModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select voice model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="model1">Model 1</SelectItem>
                        <SelectItem value="model2">Model 2</SelectItem>
                        <SelectItem value="model3">Model 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voice-type">Voice Type</Label>
                    <Select value={voiceType} onValueChange={setVoiceType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select voice type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Triggers</h3>
                <p className="text-sm text-gray-400">If enabled, the agent will be able to be triggered by a web API. Read more about this functionality on the documentation page.</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Trigger API Key"
                    value={triggerApiKey}
                    onChange={(e) => setTriggerApiKey(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="secondary">Generate</Button>
                </div>
              </div>
              
              {/* Save & Next or Update Button */}
              <div className="flex justify-end items-center gap-2 pt-4 border-t border-border">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Make sure to also fill out the information below with your email address and your Cardano wallet address.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {editingAgent ? (
                  <Button 
                    onClick={saveAgentChanges}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isSubmitting ? "Updating Agent..." : "Update Agent"}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleCreateAgent}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? "Creating Agent..." : "Save & Create Agent"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Testing</CardTitle>
              <CardDescription>Test your AI agent configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="in-reply-to-id">In Reply To ID</Label>
                <Input
                  id="in-reply-to-id"
                  value={inReplyToId}
                  onChange={(e) => setInReplyToId(e.target.value)}
                  placeholder="ID of the post you want to reply to. (optional)"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-image"
                    checked={hasImage}
                    onCheckedChange={(checked) => setHasImage(checked as boolean)}
                  />
                  <Label htmlFor="has-image">Has Image</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="has-video"
                    checked={hasVideo}
                    onCheckedChange={(checked) => setHasVideo(checked as boolean)}
                  />
                  <Label htmlFor="has-video">Has Video</Label>
                </div>
              </div>
              <Button className="w-full">Generate Post</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="twitter" className="space-y-6">
          {/* Authentication Method Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Twitter Authentication Method</CardTitle>
              <CardDescription>Choose how you want to connect your Twitter account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="oauth-v2"
                    name="twitter-auth"
                    value="oauth_v2"
                    checked={twitterAuthMethod === "oauth_v2"}
                    onChange={(e) => setTwitterAuthMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="oauth-v2" className="cursor-pointer">
                    <div>
                      <div className="font-medium">OAuth 2.0 (Recommended)</div>
                      <div className="text-sm text-muted-foreground">Secure authentication via Twitter Developer App</div>
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="oauth-v1"
                    name="twitter-auth"
                    value="oauth_v1"
                    checked={twitterAuthMethod === "oauth_v1"}
                    onChange={(e) => setTwitterAuthMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="oauth-v1" className="cursor-pointer">
                    <div>
                      <div className="font-medium">OAuth 1.0a (Legacy)</div>
                      <div className="text-sm text-muted-foreground">Username/password authentication (working as of Aug 2)</div>
                    </div>
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Component */}
          {twitterAuthMethod === "oauth_v2" ? (
            <TwitterAccountConnection 
              user={user} 
              onAccountsChange={(accounts) => {
                setTwitterAccounts(accounts);
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Twitter OAuth 1.0a Connection</CardTitle>
                <CardDescription>Connect using username and password (legacy method)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    ⚠️ This method uses your Twitter username and password. Only use this with a dedicated agent account.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter-username">Twitter Username</Label>
                    <Input
                      id="twitter-username"
                      value={socialUsername}
                      onChange={(e) => setSocialUsername(e.target.value)}
                      placeholder="@yourusername"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter-password">Twitter Password</Label>
                    <Input
                      id="twitter-password"
                      type="password"
                      value={socialPassword}
                      onChange={(e) => setSocialPassword(e.target.value)}
                      placeholder="Your Twitter password"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => {
                    if (socialUsername && socialPassword) {
                      setTwitterAccounts([{
                        id: 'legacy-account',
                        username: socialUsername.replace('@', ''),
                        display_name: socialUsername,
                        is_active: true,
                        authentication_method: 'oauth_v1'
                      }]);
                      toast({
                        title: "Account Connected",
                        description: "Legacy Twitter account connected successfully.",
                      });
                    } else {
                      toast({
                        title: "Missing Information",
                        description: "Please enter both username and password.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className="w-full"
                >
                  Connect Account
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Test Tweet Card */}
          {twitterAccounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Test Tweet
                </CardTitle>
                <CardDescription>
                  Send a test tweet to verify your Twitter connection is working
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-tweet">Tweet Content</Label>
                  <Textarea
                    id="test-tweet"
                    value={testTweetContent}
                    onChange={(e) => setTestTweetContent(e.target.value)}
                    placeholder="Write your test tweet here..."
                    maxLength={280}
                    rows={3}
                  />
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>{testTweetContent.length}/280 characters</span>
                  </div>
                </div>
                
                {twitterAccounts.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="test-tweet-account">Select Account</Label>
                    <Select value={selectedTestAccount} onValueChange={setSelectedTestAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose account to tweet from" />
                      </SelectTrigger>
                      <SelectContent>
                        {twitterAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            @{account.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  onClick={handleTestTweet}
                  disabled={!testTweetContent.trim() || testTweetLoading || (!selectedTestAccount && twitterAccounts.length > 1)}
                  className="w-full"
                >
                  {testTweetLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Sending Tweet...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Test Tweet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* AI Generated Tweet Test */}
          {twitterAccounts.length > 0 && deployedAgents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Generated Tweet Test
                </CardTitle>
                <CardDescription>
                  Test your AI agent's ability to generate and post tweets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Tweet Prompt</Label>
                  <Textarea
                    id="ai-prompt"
                    value={aiTweetPrompt}
                    onChange={(e) => setAiTweetPrompt(e.target.value)}
                    placeholder="Give your AI agent a prompt for the tweet (e.g., 'Share an interesting fact about cryptocurrency')"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-agent-select">Select Agent</Label>
                  <Select value={selectedAiAgent} onValueChange={setSelectedAiAgent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose AI agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {deployedAgents.filter(agent => agent.status === 'approved').map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.agent_name} - {agent.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {twitterAccounts.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="ai-tweet-account">Select Account</Label>
                    <Select value={selectedAiTestAccount} onValueChange={setSelectedAiTestAccount}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose account to tweet from" />
                      </SelectTrigger>
                      <SelectContent>
                        {twitterAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            @{account.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button 
                  onClick={handleAiTweet}
                  disabled={!aiTweetPrompt.trim() || !selectedAiAgent || aiTweetLoading || (!selectedAiTestAccount && twitterAccounts.length > 1)}
                  className="w-full"
                >
                  {aiTweetLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Generating & Posting...
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4 mr-2" />
                      Generate & Post AI Tweet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Agent to Account Linking */}
          {editingAgent && twitterAccounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Link Twitter Account</CardTitle>
                <CardDescription>
                  Connect this agent to a specific Twitter account for posting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitter-account">Select Twitter Account</Label>
                  <Select value={selectedTwitterAccount} onValueChange={setSelectedTwitterAccount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a Twitter account" />
                    </SelectTrigger>
                    <SelectContent>
                      {twitterAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          @{account.username} - {account.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => {
                  toast({
                    title: "Account Linked",
                    description: "Twitter account linked to agent successfully"
                  });
                }}>
                  Link Account
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deployed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Deployed AI Agents
                </div>
                <Badge variant="secondary">
                  Tier {userTier} - {deployedAgents.length}/{getTierLimit(userTier)} agents
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage your deployed AI agents, view analytics, and control their activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAgents ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-gray-400">Loading your agents...</p>
                  </div>
                </div>
              ) : deployedAgents.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">No Deployed Agents</h3>
                    <p className="text-gray-400 mb-4">You haven't deployed any AI agents yet. Configure and submit an agent to get started.</p>
                    <Button onClick={() => setActiveTab('profile')} variant="outline">
                      Create Your First Agent
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {deployedAgents.map((agent) => (
                    <Card key={agent.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-4">
                            {/* Agent Header */}
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-lg font-semibold text-white">{agent.agent_name || 'Unnamed Agent'}</h3>
                                  <Badge variant={
                                    agent.status === 'pending' ? 'secondary' : 
                                    agent.status === 'approved' ? 'default' : 
                                    agent.status === 'active' ? 'default' : 'outline'
                                  }>
                                    {agent.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-400">{agent.platform} • {agent.category}</p>
                              </div>
                            </div>

                            {/* Agent Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-background/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <MessageSquare className="h-4 w-4 text-primary" />
                                  <span className="text-xs text-gray-400">Posts Today</span>
                                </div>
                                <p className="text-lg font-semibold text-white">0</p>
                              </div>
                              <div className="bg-background/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <BarChart3 className="h-4 w-4 text-primary" />
                                  <span className="text-xs text-gray-400">Total Posts</span>
                                </div>
                                <p className="text-lg font-semibold text-white">0</p>
                              </div>
                              <div className="bg-background/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <span className="text-xs text-gray-400">Created</span>
                                </div>
                                <p className="text-sm font-semibold text-white">
                                  {new Date(agent.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="bg-background/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-gray-400">Post Frequency</span>
                                </div>
                                <p className="text-sm font-semibold text-white">{agent.posting_probability}%</p>
                              </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium text-white">Recent Activity</h4>
                              <div className="bg-background/30 rounded-lg p-3">
                                <p className="text-sm text-gray-400">No recent activity to display</p>
                              </div>
                            </div>
                          </div>

                           {/* Action Buttons */}
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleAgentStatus(agent.id, agent.active ? 'inactive' : 'active')}
                              className="flex items-center gap-2"
                              disabled={agent.status === 'pending'}
                            >
                              {agent.active ? (
                                <>
                                  <PowerOff className="h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4" />
                                  {agent.status === 'pending' ? 'Pending Approval' : 'Activate'}
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => editAgent(agent)}
                              className="flex items-center gap-2"
                              disabled={agent.status === 'pending'}
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteAgent(agent.id)}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Tier Upgrade Notice */}
              {deployedAgents.length >= getTierLimit(userTier) && (
                <Card className="mt-6 border-amber-500/50 bg-amber-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5 text-amber-500" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">Agent Limit Reached</h4>
                        <p className="text-sm text-gray-400">
                          You've reached your tier {userTier} limit of {getTierLimit(userTier)} agents. 
                          Upgrade your tier to deploy more agents across different platforms.
                        </p>
                      </div>
                      <Button size="sm" variant="outline" disabled>
                        Upgrade Tier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Signup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Sign Up for AI Agent Service
          </CardTitle>
          <CardDescription>
            Connect your information to get started with AI agent services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email Address*</Label>
              <Input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-platform">Platform*</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardano-address">Cardano Wallet Address*</Label>
            <Input
              id="cardano-address"
              value={cardanoAddress}
              onChange={(e) => setCardanoAddress(e.target.value)}
              placeholder="addr1..."
              required
            />
            <p className="text-sm text-gray-500">
              Used to verify PPEE token ownership for subscription payments
            </p>
          </div>

          <Button 
            variant="ghost" 
            className="w-full border border-dashed border-gray-600 hover:border-gray-500"
            disabled
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet (Coming Soon)
          </Button>

          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    <strong>Requirements:</strong><br />
                    • Sign up ahead of time to gain access<br />
                    • Verify wallet ownership of PPEE tokens<br />
                    • Monthly subscription fee based on tier and posting frequency<br />
                    • Price packages will be updated soon
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !email || !platform || !cardanoAddress}
              className="ml-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};