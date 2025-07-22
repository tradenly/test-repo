
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
import { Gamepad2, Shield, Coins, Settings2, Save, Info, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const GameManagement = () => {
  const { toast } = useToast();
  const { data: gameSettings, isLoading, updateGameSettings } = useGameSettings();
  const [editingSettings, setEditingSettings] = useState<{[key: string]: any}>({});

  const gameDisplayNames = {
    flappy_hippos: "🦛 Flappy Hippos",
    falling_logs: "🪵 Falling Logs", 
    poopee_crush: "💩 POOPEE Crush",
    miss_poopee_man: "👻 Miss POOPEE-Man",
    space_invaders: "🛸 Space Invaders"
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

  // Calculate estimated payout range for preview
  const getEstimatedPayout = (gameType: string) => {
    const current = gameSettings?.find(g => g.game_type === gameType);
    if (!current) return "N/A";
    
    const entryCost = getCurrentValue(gameType, 'entry_cost_credits', 1);
    const multipliers = getCurrentValue(gameType, 'payout_multipliers', {});
    const baseMultiplier = multipliers.base || 1.0;
    
    // Example calculation for typical scores
    const lowScore = 100;
    const highScore = 1000;
    const lowPayout = Math.min((lowScore / 100) * baseMultiplier, entryCost * 2);
    const highPayout = Math.min((highScore / 100) * baseMultiplier, entryCost * 2);
    
    return `${lowPayout.toFixed(3)}-${highPayout.toFixed(3)} credits`;
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
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Game Management</h2>
        </div>
        
        {/* Emergency Alert for Space Invaders */}
        <div className="bg-red-900/20 border border-red-600/50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="text-red-400 font-bold">Emergency Payout Fix Applied</h3>
          </div>
          <p className="text-red-300 text-sm">
            Space Invaders payout multipliers have been emergency-capped to prevent excessive payouts. 
            Base multiplier is now capped at 0.01, bonus at 0.05, and maximum payout is 2x entry cost.
          </p>
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
                    <div className="flex items-center gap-1 mb-1">
                      <Coins className="h-4 w-4 text-yellow-400" />
                      <Label className="text-white">Entry Cost (Credits)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Credits required to start the game. Players must have sufficient balance. This is also used in payout calculations as a baseline.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={getCurrentValue(game.game_type, 'entry_cost_credits', 1)}
                      onChange={(e) => 
                        handleSettingChange(game.game_type, 'entry_cost_credits', parseFloat(e.target.value) || 0)
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  {/* Shield Settings (Flappy Hippos only) */}
                  {game.game_type === 'flappy_hippos' && (
                    <>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Shield className="h-4 w-4 text-blue-400" />
                          <Label className="text-white">Shield Cost (Credits)</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Cost per shield that players can purchase during gameplay to protect against obstacles.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={getCurrentValue(game.game_type, 'shield_cost', 5)}
                          onChange={(e) => 
                            handleSettingChange(game.game_type, 'shield_cost', parseFloat(e.target.value) || 0)
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Label className="text-white">Max Shields Purchasable</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Maximum number of shields a player can purchase in a single game session.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={getCurrentValue(game.game_type, 'max_shields_purchasable', 3)}
                          onChange={(e) => 
                            handleSettingChange(game.game_type, 'max_shields_purchasable', parseInt(e.target.value) || 0)
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </>
                  )}
                </div>

                <Separator className="bg-gray-700" />

                {/* Payout Multipliers */}
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Settings2 className="h-4 w-4 text-purple-400" />
                    <Label className="text-white">Payout Configuration</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p><strong>Critical:</strong> These control how players earn credits. Low values prevent bankruptcy. Estimated range for this game: {getEstimatedPayout(game.game_type)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Label className="text-sm text-gray-300">Base Multiplier</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p><strong>Formula:</strong> (score ÷ 100) × multiplier = base credits</p>
                            <p><strong>Safe range:</strong> 0.001-0.01</p>
                            <p><strong>Example:</strong> Score 1000 × 0.01 = 0.1 credits</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        max="0.01"
                        value={getCurrentValue(game.game_type, 'payout_multipliers', {})?.base || 1.0}
                        onChange={(e) => {
                          const currentMultipliers = getCurrentValue(game.game_type, 'payout_multipliers', {});
                          handleSettingChange(game.game_type, 'payout_multipliers', {
                            ...currentMultipliers,
                            base: Math.min(parseFloat(e.target.value) || 0, 0.01) // Cap at 0.01
                          });
                        }}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Label className="text-sm text-gray-300">Bonus Multiplier</Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-gray-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p><strong>When:</strong> High accuracy (&gt;80%)</p>
                            <p><strong>Formula:</strong> (score ÷ 100) × bonus multiplier</p>
                            <p><strong>Safe range:</strong> 0.01-0.05</p>
                            <p><strong>Purpose:</strong> Reward skilled players</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        max="0.05"
                        value={getCurrentValue(game.game_type, 'payout_multipliers', {})?.bonus || 0.1}
                        onChange={(e) => {
                          const currentMultipliers = getCurrentValue(game.game_type, 'payout_multipliers', {});
                          handleSettingChange(game.game_type, 'payout_multipliers', {
                            ...currentMultipliers,
                            bonus: Math.min(parseFloat(e.target.value) || 0, 0.05) // Cap at 0.05
                          });
                        }}
                        className="bg-gray-700 border-gray-600 text-white text-sm"
                      />
                    </div>
                    {game.game_type === 'flappy_hippos' && (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Label className="text-sm text-gray-300">Shield Bonus</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p><strong>Formula:</strong> shields_used × bonus × entry_cost</p>
                              <p><strong>Purpose:</strong> Reward strategic shield usage</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          max="0.05"
                          value={getCurrentValue(game.game_type, 'payout_multipliers', {})?.shield_bonus || 0.05}
                          onChange={(e) => {
                            const currentMultipliers = getCurrentValue(game.game_type, 'payout_multipliers', {});
                            handleSettingChange(game.game_type, 'payout_multipliers', {
                              ...currentMultipliers,
                              shield_bonus: Math.min(parseFloat(e.target.value) || 0, 0.05)
                            });
                          }}
                          className="bg-gray-700 border-gray-600 text-white text-sm"
                        />
                      </div>
                    )}
                    {game.game_type === 'space_invaders' && (
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <Label className="text-sm text-gray-300">Wave Bonus</Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p><strong>Formula:</strong> (waves-1) × bonus × entry_cost</p>
                              <p><strong>Safe range:</strong> 0.01-0.05</p>
                              <p><strong>Purpose:</strong> Reward wave progression</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          max="0.05"
                          value={getCurrentValue(game.game_type, 'payout_multipliers', {})?.wave_bonus || 0.05}
                          onChange={(e) => {
                            const currentMultipliers = getCurrentValue(game.game_type, 'payout_multipliers', {});
                            handleSettingChange(game.game_type, 'payout_multipliers', {
                              ...currentMultipliers,
                              wave_bonus: Math.min(parseFloat(e.target.value) || 0, 0.05) // Cap at 0.05
                            });
                          }}
                          className="bg-gray-700 border-gray-600 text-white text-sm"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-2 p-2 bg-gray-900/50 rounded text-xs text-gray-400">
                    <strong>💡 Estimated payout range:</strong> {getEstimatedPayout(game.game_type)} | 
                    <strong> Max per game:</strong> {(getCurrentValue(game.game_type, 'entry_cost_credits', 1) * 2).toFixed(2)} credits
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
};
