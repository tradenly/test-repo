import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Brain, Share2, Key, TestTube, Shield, Activity } from "lucide-react";

interface APIConfiguration {
  [key: string]: string;
}

export const ConfigurationTab = () => {
  const { toast } = useToast();
  const [aiConfigs, setAiConfigs] = useState<APIConfiguration>({});
  const [socialConfigs, setSocialConfigs] = useState<APIConfiguration>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'ai_openai_api_key',
          'ai_claude_api_key',
          'ai_deepseek_api_key',
          'ai_llama_api_key',
          'social_twitter_consumer_key',
          'social_twitter_consumer_secret',
          'social_twitter_access_token',
          'social_twitter_access_token_secret',
          'social_facebook_app_id',
          'social_facebook_app_secret',
          'social_linkedin_client_id',
          'social_linkedin_client_secret',
          'social_instagram_app_id',
          'social_instagram_app_secret'
        ]);

      if (error) throw error;

      const aiSettings: APIConfiguration = {};
      const socialSettings: APIConfiguration = {};

      data?.forEach(setting => {
        const value = Array.isArray(setting.setting_value) 
          ? setting.setting_value[0] 
          : setting.setting_value;
        const stringValue = typeof value === 'string' ? value : String(value || '');
        
        if (setting.setting_key.startsWith('ai_')) {
          aiSettings[setting.setting_key] = stringValue;
        } else if (setting.setting_key.startsWith('social_')) {
          socialSettings[setting.setting_key] = stringValue;
        }
      });

      setAiConfigs(aiSettings);
      setSocialConfigs(socialSettings);
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast({
        title: "Error",
        description: "Failed to load API configurations.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async (settingKey: string, value: string) => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: [value],
          description: `API configuration for ${settingKey}`
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Configuration saved successfully.",
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async (provider: string, configs: APIConfiguration) => {
    // This would be implemented with specific test logic for each provider
    toast({
      title: "Test Connection",
      description: `Testing ${provider} connection... (Feature coming soon)`,
    });
  };

  const ConfigurationSection = ({ 
    title, 
    description, 
    icon: Icon, 
    configs, 
    setConfigs, 
    fields 
  }: {
    title: string;
    description: string;
    icon: any;
    configs: APIConfiguration;
    setConfigs: (configs: APIConfiguration) => void;
    fields: { key: string; label: string; placeholder: string; }[];
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map(field => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key}>{field.label}</Label>
            <div className="flex gap-2">
              <Input
                id={field.key}
                type="password"
                placeholder={field.placeholder}
                value={configs[field.key] || ''}
                onChange={(e) => setConfigs({ ...configs, [field.key]: e.target.value })}
              />
              <Button
                variant="outline"
                onClick={() => saveConfiguration(field.key, configs[field.key] || '')}
                disabled={isSaving}
              >
                Save
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading configurations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="ai-models" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ai-models">AI Models</TabsTrigger>
          <TabsTrigger value="social-media">Social Media</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-models" className="space-y-6">
          <ConfigurationSection
            title="OpenAI Configuration"
            description="Configure OpenAI API for GPT models"
            icon={Brain}
            configs={aiConfigs}
            setConfigs={setAiConfigs}
            fields={[
              { key: 'ai_openai_api_key', label: 'OpenAI API Key', placeholder: 'sk-...' }
            ]}
          />

          <ConfigurationSection
            title="Claude Configuration"
            description="Configure Anthropic Claude API"
            icon={Brain}
            configs={aiConfigs}
            setConfigs={setAiConfigs}
            fields={[
              { key: 'ai_claude_api_key', label: 'Claude API Key', placeholder: 'sk-ant-...' }
            ]}
          />

          <ConfigurationSection
            title="DeepSeek Configuration"
            description="Configure DeepSeek API"
            icon={Brain}
            configs={aiConfigs}
            setConfigs={setAiConfigs}
            fields={[
              { key: 'ai_deepseek_api_key', label: 'DeepSeek API Key', placeholder: 'sk-...' }
            ]}
          />

          <ConfigurationSection
            title="Llama Configuration"
            description="Configure Llama API (via Hugging Face or other providers)"
            icon={Brain}
            configs={aiConfigs}
            setConfigs={setAiConfigs}
            fields={[
              { key: 'ai_llama_api_key', label: 'Llama API Key', placeholder: 'hf_...' }
            ]}
          />
        </TabsContent>

        <TabsContent value="social-media" className="space-y-6">
          <ConfigurationSection
            title="Twitter/X Configuration"
            description="Configure Twitter API v2 for posting and interactions"
            icon={Share2}
            configs={socialConfigs}
            setConfigs={setSocialConfigs}
            fields={[
              { key: 'social_twitter_consumer_key', label: 'Consumer Key (API Key)', placeholder: 'Your Twitter API Key' },
              { key: 'social_twitter_consumer_secret', label: 'Consumer Secret (API Secret)', placeholder: 'Your Twitter API Secret' },
              { key: 'social_twitter_access_token', label: 'Access Token', placeholder: 'Your Twitter Access Token' },
              { key: 'social_twitter_access_token_secret', label: 'Access Token Secret', placeholder: 'Your Twitter Access Token Secret' }
            ]}
          />

          <ConfigurationSection
            title="Facebook Configuration"
            description="Configure Facebook Graph API"
            icon={Share2}
            configs={socialConfigs}
            setConfigs={setSocialConfigs}
            fields={[
              { key: 'social_facebook_app_id', label: 'App ID', placeholder: 'Your Facebook App ID' },
              { key: 'social_facebook_app_secret', label: 'App Secret', placeholder: 'Your Facebook App Secret' }
            ]}
          />

          <ConfigurationSection
            title="LinkedIn Configuration"
            description="Configure LinkedIn API"
            icon={Share2}
            configs={socialConfigs}
            setConfigs={setSocialConfigs}
            fields={[
              { key: 'social_linkedin_client_id', label: 'Client ID', placeholder: 'Your LinkedIn Client ID' },
              { key: 'social_linkedin_client_secret', label: 'Client Secret', placeholder: 'Your LinkedIn Client Secret' }
            ]}
          />

          <ConfigurationSection
            title="Instagram Configuration"
            description="Configure Instagram Basic Display API"
            icon={Share2}
            configs={socialConfigs}
            setConfigs={setSocialConfigs}
            fields={[
              { key: 'social_instagram_app_id', label: 'App ID', placeholder: 'Your Instagram App ID' },
              { key: 'social_instagram_app_secret', label: 'App Secret', placeholder: 'Your Instagram App Secret' }
            ]}
          />
        </TabsContent>

        <TabsContent value="deployment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Agent Deployment Settings
              </CardTitle>
              <CardDescription>Configure deployment and runtime settings for AI agents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Deployment Status</h4>
                    <p className="text-sm text-muted-foreground mb-3">Current system status and capabilities</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">AI Models</span>
                        <span className="text-sm text-green-400">● Ready</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Social APIs</span>
                        <span className="text-sm text-yellow-400">● Partial</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Agent Runtime</span>
                        <span className="text-sm text-red-400">● Pending</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2">Quick Actions</h4>
                    <p className="text-sm text-muted-foreground mb-3">Test and manage agent deployments</p>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Test AI Connections
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        Test Social APIs
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        Deploy Test Agent
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Safety
              </CardTitle>
              <CardDescription>Configure safety measures and content moderation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold">Rate Limiting</h4>
                    <p className="text-sm text-muted-foreground mt-1">Automatic rate limiting per platform</p>
                    <span className="text-sm text-green-400">● Active</span>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold">Content Moderation</h4>
                    <p className="text-sm text-muted-foreground mt-1">AI-powered content filtering</p>
                    <span className="text-sm text-green-400">● Active</span>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold">Compliance</h4>
                    <p className="text-sm text-muted-foreground mt-1">Platform ToS compliance</p>
                    <span className="text-sm text-green-400">● Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Agent Monitoring
              </CardTitle>
              <CardDescription>Monitor active agents and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Agent Monitoring Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  Real-time monitoring and analytics for deployed AI agents will appear here once agents are active.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-muted-foreground">Active Agents</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-muted-foreground">Posts Today</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">0</div>
                      <div className="text-sm text-muted-foreground">Interactions</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};