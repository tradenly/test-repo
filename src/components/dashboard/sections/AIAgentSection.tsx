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

  const toggleAgentStatus = async (agentId: string, newStatus: 'active' | 'inactive') => {
    try {
      const { error } = await supabase
        .from('ai_agent_signups')
        .update({ status: newStatus })
        .eq('id', agentId);

      if (error) throw error;

      setDeployedAgents(prev => 
        prev.map(agent => 
          agent.id === agentId ? { ...agent, status: newStatus } : agent
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
        <TabsList className="grid w-full grid-cols-5 bg-card">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="posting">Posting</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
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
              
              {/* Save & Create Button */}
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
                <Button 
                  onClick={handleCreateAgent}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? "Creating Agent..." : "Save & Create Agent"}
                </Button>
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
                                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
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
                              onClick={() => toggleAgentStatus(agent.id, agent.status === 'active' ? 'inactive' : 'active')}
                              className="flex items-center gap-2"
                            >
                              {agent.status === 'active' ? (
                                <>
                                  <PowerOff className="h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-2"
                              disabled
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