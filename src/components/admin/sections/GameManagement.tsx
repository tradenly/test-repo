
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGameSettings } from "@/hooks/useGameSettings";
import { Gamepad2, Shield, Coins, Settings2, Save } from "lucide-react";

export const GameManagement = () => {
  const { toast } = useToast();
  const { data: gameSettings, isLoading, updateGameSettings } = useGameSettings();
  const [editingSettings, setEditingSettings] = useState<{[key: string]: any}>({});

  const gameDisplayNames = {
    flappy_hippos: "🦛 Flappy Hippos",
    falling_logs: "🪵 Falling Logs", 
    poopee_crush: "💩 POOPEE Crush",
    miss_poopee_man: "👻 Miss POOPEE-Man"
  };

  const handleSettingChange = (gameType: string, field: string, value: any) => {
    setEditingSettings(prev => ({
      ...prev,
      [gameType]: {
        ...prev[gameType],
        [field]: value
      }
    }));
  };

  const handleSaveSettings = async (gameType: string) => {
    const changes = editingSettings[gameType];
    if (!changes) return;

    try {
      await updateGameSettings(gameType, changes);
      setEditingSettings(prev => {
        const updated = { ...prev };
        delete updated[gameType];
        return updated;
      });
      toast({
        title: "Settings Updated",
        description: `Game settings for ${gameDisplayNames[gameType as keyof typeof gameDisplayNames]} have been saved.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update game settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getCurrentValue = (gameType: string, field: string, defaultValue: any) => {
    return editingSettings[gameType]?.[field] ?? 
           gameSettings?.find(g => g.game_type === gameType)?.[field] ?? 
           defaultValue;
  };

  const hasChanges = (gameType: string) => {
    return editingSettings[gameType] && Object.keys(editingSettings[gameType]).length > 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Game Management</h2>
        </div>
        <div className="text-gray-400">Loading game settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Gamepad2 className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Game Management</h2>
      </div>
      
      <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg">
        <strong>Note:</strong> When games are disabled, they will show a deactivation banner and normal users cannot play them. 
        Admins can still access disabled games for testing purposes.
      </div>

      <div className="grid gap-6">
        {gameSettings?.map((game) => (
          <Card key={game.game_type} className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  {gameDisplayNames[game.game_type as keyof typeof gameDisplayNames]}
                  <Badge variant={game.is_enabled ? "default" : "secondary"}>
                    {game.is_enabled ? "Active" : "Disabled"}
                  </Badge>
                </CardTitle>
                {hasChanges(game.game_type) && (
                  <Button
                    onClick={() => handleSaveSettings(game.game_type)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Game Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Game Status</Label>
                  <p className="text-sm text-gray-400">
                    Toggle to enable or disable this game for regular users
                  </p>
                </div>
                <Switch
                  checked={getCurrentValue(game.game_type, 'is_enabled', true)}
                  onCheckedChange={(checked) => 
                    handleSettingChange(game.game_type, 'is_enabled', checked)
                  }
                />
              </div>

              <Separator className="bg-gray-700" />

              {/* Entry Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white flex items-center gap-1">
                    <Coins className="h-4 w-4" />
                    Entry Cost (Credits)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={getCurrentValue(game.game_type, 'entry_cost_credits', 1)}
                    onChange={(e) => 
                      handleSettingChange(game.game_type, 'entry_cost_credits', parseFloat(e.target.value) || 0)
                    }
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>

                {/* Shield Settings (Flappy Hippos only) */}
                {game.game_type === 'flappy_hippos' && (
                  <>
                    <div>
                      <Label className="text-white flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        Shield Cost (Credits)
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={getCurrentValue(game.game_type, 'shield_cost', 5)}
                        onChange={(e) => 
                          handleSettingChange(game.game_type, 'shield_cost', parseFloat(e.target.value) || 0)
                        }
                        className="bg-gray-700 border-gray-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Max Shields Purchasable</Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={getCurrentValue(game.game_type, 'max_shields_purchasable', 3)}
                        onChange={(e) => 
                          handleSettingChange(game.game_type, 'max_shields_purchasable', parseInt(e.target.value) || 0)
                        }
                        className="bg-gray-700 border-gray-600 text-white mt-1"
                      />
                    </div>
                  </>
                )}
              </div>

              <Separator className="bg-gray-700" />

              {/* Payout Multipliers */}
              <div>
                <Label className="text-white flex items-center gap-1 mb-2">
                  <Settings2 className="h-4 w-4" />
                  Payout Configuration
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm text-gray-300">Base Multiplier</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={getCurrentValue(game.game_type, 'payout_multipliers', {})?.base || 1.0}
                      onChange={(e) => {
                        const currentMultipliers = getCurrentValue(game.game_type, 'payout_multipliers', {});
                        handleSettingChange(game.game_type, 'payout_multipliers', {
                          ...currentMultipliers,
                          base: parseFloat(e.target.value) || 0
                        });
                      }}
                      className="bg-gray-700 border-gray-600 text-white text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-gray-300">Bonus Multiplier</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={getCurrentValue(game.game_type, 'payout_multipliers', {})?.bonus || 0.1}
                      onChange={(e) => {
                        const currentMultipliers = getCurrentValue(game.game_type, 'payout_multipliers', {});
                        handleSettingChange(game.game_type, 'payout_multipliers', {
                          ...currentMultipliers,
                          bonus: parseFloat(e.target.value) || 0
                        });
                      }}
                      className="bg-gray-700 border-gray-600 text-white text-sm mt-1"
                    />
                  </div>
                  {game.game_type === 'flappy_hippos' && (
                    <div>
                      <Label className="text-sm text-gray-300">Shield Bonus</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={getCurrentValue(game.game_type, 'payout_multipliers', {})?.shield_bonus || 0.05}
                        onChange={(e) => {
                          const currentMultipliers = getCurrentValue(game.game_type, 'payout_multipliers', {});
                          handleSettingChange(game.game_type, 'payout_multipliers', {
                            ...currentMultipliers,
                            shield_bonus: parseFloat(e.target.value) || 0
                          });
                        }}
                        className="bg-gray-700 border-gray-600 text-white text-sm mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
