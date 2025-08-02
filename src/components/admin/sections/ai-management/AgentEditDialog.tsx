import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface AIAgentSignup {
  id: string;
  user_id: string;
  email: string;
  platform: string;
  cardano_wallet_address: string;
  agent_name?: string;
  category?: string;
  ticker?: string;
  policy_id?: string;
  market_cap_value?: number;
  crypto_network?: string;
  image_url?: string;
  age?: number;
  bio?: string;
  description?: string;
  personality?: string;
  first_message?: string;
  response_style?: string;
  adjectives?: string;
  tone?: string;
  appearance?: string;
  social_profile?: string;
  posting_probability?: number;
  timeline_reply_probability?: number;
  voice_model?: string;
  voice_type?: string;
  trigger_api_key?: string;
  social_username?: string;
  social_password?: string;
  status: string;
  verified: boolean;
  ppee_tokens_verified: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface AgentEditDialogProps {
  agent: AIAgentSignup | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentId: string, updates: Partial<AIAgentSignup>) => void;
}

export const AgentEditDialog: React.FC<AgentEditDialogProps> = ({
  agent,
  isOpen,
  onClose,
  onSave,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<AIAgentSignup>>({});

  useEffect(() => {
    if (agent) {
      setFormData({
        agent_name: agent.agent_name,
        category: agent.category,
        ticker: agent.ticker,
        bio: agent.bio,
        description: agent.description,
        personality: agent.personality,
        first_message: agent.first_message,
        response_style: agent.response_style,
        adjectives: agent.adjectives,
        tone: agent.tone,
        appearance: agent.appearance,
        social_profile: agent.social_profile,
        posting_probability: agent.posting_probability,
        timeline_reply_probability: agent.timeline_reply_probability,
        voice_model: agent.voice_model,
        voice_type: agent.voice_type,
        social_username: agent.social_username,
        // Don't include password for security
      });
    }
  }, [agent]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!agent) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('ai_agent_signups')
        .update(formData)
        .eq('id', agent.id);

      if (error) throw error;

      onSave(agent.id, formData);
      onClose();
      
      toast({
        title: "Success",
        description: "Agent updated successfully.",
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      toast({
        title: "Error",
        description: "Failed to update agent.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent: {agent.agent_name || "Unnamed Agent"}</DialogTitle>
          <DialogDescription>
            Update the agent's configuration and personality settings.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold">Basic Information</h4>
            
            <div>
              <Label htmlFor="agent_name">Agent Name</Label>
              <Input
                id="agent_name"
                value={formData.agent_name || ''}
                onChange={(e) => handleInputChange('agent_name', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="memecoin">Memecoin</SelectItem>
                  <SelectItem value="nft">NFT Collection</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="defi">DeFi</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ticker">Ticker/Symbol</Label>
              <Input
                id="ticker"
                value={formData.ticker || ''}
                onChange={(e) => handleInputChange('ticker', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Personality & Behavior */}
          <div className="space-y-4">
            <h4 className="font-semibold">Personality & Behavior</h4>
            
            <div>
              <Label htmlFor="personality">Personality</Label>
              <Textarea
                id="personality"
                value={formData.personality || ''}
                onChange={(e) => handleInputChange('personality', e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={formData.tone || ''}
                onValueChange={(value) => handleInputChange('tone', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="sarcastic">Sarcastic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="response_style">Response Style</Label>
              <Select
                value={formData.response_style || ''}
                onValueChange={(value) => handleInputChange('response_style', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select response style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short & Punchy</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="adjectives">Adjectives (comma-separated)</Label>
              <Input
                id="adjectives"
                value={formData.adjectives || ''}
                onChange={(e) => handleInputChange('adjectives', e.target.value)}
                placeholder="funny, smart, witty"
              />
            </div>

            <div>
              <Label htmlFor="first_message">First Message</Label>
              <Textarea
                id="first_message"
                value={formData.first_message || ''}
                onChange={(e) => handleInputChange('first_message', e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="appearance">Appearance Description</Label>
              <Textarea
                id="appearance"
                value={formData.appearance || ''}
                onChange={(e) => handleInputChange('appearance', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Posting Configuration */}
          <div className="space-y-4">
            <h4 className="font-semibold">Posting Configuration</h4>
            
            <div>
              <Label htmlFor="posting_probability">Posting Probability (%)</Label>
              <Input
                id="posting_probability"
                type="number"
                min="0"
                max="100"
                value={formData.posting_probability || 0}
                onChange={(e) => handleInputChange('posting_probability', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="timeline_reply_probability">Timeline Reply Probability (%)</Label>
              <Input
                id="timeline_reply_probability"
                type="number"
                min="0"
                max="100"
                value={formData.timeline_reply_probability || 0}
                onChange={(e) => handleInputChange('timeline_reply_probability', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="social_username">Social Username</Label>
              <Input
                id="social_username"
                value={formData.social_username || ''}
                onChange={(e) => handleInputChange('social_username', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="social_profile">Social Profile Description</Label>
              <Textarea
                id="social_profile"
                value={formData.social_profile || ''}
                onChange={(e) => handleInputChange('social_profile', e.target.value)}
                rows={2}
              />
            </div>
          </div>

          {/* Voice Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold">Voice Settings</h4>
            
            <div>
              <Label htmlFor="voice_model">Voice Model</Label>
              <Select
                value={formData.voice_model || ''}
                onValueChange={(value) => handleInputChange('voice_model', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select voice model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="neural">Neural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="voice_type">Voice Type</Label>
              <Select
                value={formData.voice_type || ''}
                onValueChange={(value) => handleInputChange('voice_type', value)}
              >
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

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};