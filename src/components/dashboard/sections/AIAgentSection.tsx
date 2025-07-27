import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UnifiedUser } from "@/hooks/useUnifiedAuth";
import { Bot, Info, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AIAgentSectionProps {
  user: UnifiedUser;
}

export const AIAgentSection = ({ user }: AIAgentSectionProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

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
        <TabsList className="grid w-full grid-cols-4 bg-card">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="posting">Posting</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
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