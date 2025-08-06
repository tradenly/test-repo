import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Clock, MessageSquare, AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

interface AgentStatus {
  id: string;
  agent_name: string;
  status: string;
  active: boolean;
  last_post_time: string | null;
  next_scheduled_post: string | null;
  posts_today: number;
  total_posts: number;
  connection_status: 'connected' | 'disconnected' | 'error';
  error_message?: string;
}

export const AIAgentMonitor: React.FC = () => {
  const { user } = useUnifiedAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAgentStatuses = async () => {
    if (!user?.id) return;

    try {
      // Fetch deployed agents with their latest activity
      const { data: agentsData, error: agentsError } = await supabase
        .from('ai_agent_signups')
        .select(`
          id,
          agent_name,
          status,
          active,
          created_at,
          ai_agent_tasks!inner(
            id,
            created_at,
            status,
            error_message
          ),
          ai_agent_schedules!agent_signup_id(
            id,
            frequency_minutes,
            max_posts_per_day,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved');

      if (agentsError) throw agentsError;

      const statusPromises = (agentsData || []).map(async (agent) => {
        // Get today's posts count
        const today = new Date().toISOString().split('T')[0];
        const { count: postsToday } = await supabase
          .from('ai_agent_tasks')
          .select('id', { count: 'exact' })
          .eq('agent_id', agent.id)
          .eq('task_type', 'post')
          .eq('status', 'completed')
          .gte('created_at', `${today}T00:00:00.000Z`);

        // Get total posts count
        const { count: totalPosts } = await supabase
          .from('ai_agent_tasks')
          .select('id', { count: 'exact' })
          .eq('agent_id', agent.id)
          .eq('task_type', 'post')
          .eq('status', 'completed');

        // Get last successful post
        const { data: lastPost } = await supabase
          .from('ai_agent_tasks')
          .select('created_at')
          .eq('agent_id', agent.id)
          .eq('task_type', 'post')
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Calculate next scheduled post (simplified)
        const schedule = agent.ai_agent_schedules?.[0];
        let nextScheduledPost = null;
        if (schedule?.is_active && schedule.frequency_minutes && lastPost) {
          const lastPostTime = new Date(lastPost.created_at);
          const nextTime = new Date(lastPostTime.getTime() + (schedule.frequency_minutes * 60 * 1000));
          nextScheduledPost = nextTime.toISOString();
        }

        // Determine connection status
        let connectionStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
        let errorMessage: string | undefined;

        if (agent.active && schedule?.is_active) {
          // Check for recent errors
          const { data: recentError } = await supabase
            .from('ai_agent_tasks')
            .select('error_message, created_at')
            .eq('agent_id', agent.id)
            .eq('status', 'failed')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (recentError && new Date(recentError.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
            connectionStatus = 'error';
            errorMessage = recentError.error_message;
          } else {
            connectionStatus = 'connected';
          }
        }

        return {
          id: agent.id,
          agent_name: agent.agent_name,
          status: agent.status,
          active: agent.active,
          last_post_time: lastPost?.created_at || null,
          next_scheduled_post: nextScheduledPost,
          posts_today: postsToday || 0,
          total_posts: totalPosts || 0,
          connection_status: connectionStatus,
          error_message: errorMessage,
        };
      });

      const statuses = await Promise.all(statusPromises);
      setAgents(statuses);
    } catch (error) {
      console.error('Error fetching agent statuses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch agent statuses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshStatuses = async () => {
    setRefreshing(true);
    await fetchAgentStatuses();
  };

  const testAgentConnection = async (agentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-orchestrator', {
        body: { action: 'test_agent', agentId }
      });

      if (error) throw error;

      toast({
        title: "Connection Test",
        description: data.success ? "Agent connection successful!" : "Agent connection failed",
        variant: data.success ? "default" : "destructive",
      });

      await refreshStatuses();
    } catch (error) {
      console.error('Error testing agent connection:', error);
      toast({
        title: "Connection Test Failed",
        description: "Failed to test agent connection",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAgentStatuses();
    
    // Set up real-time updates
    const interval = setInterval(fetchAgentStatuses, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [user?.id]);

  const getStatusIcon = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleString();
  };

  const getTimeUntilNext = (nextTime: string | null) => {
    if (!nextTime) return 'Not scheduled';
    
    const now = new Date();
    const next = new Date(nextTime);
    const diffMs = next.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Overdue';
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m`;
    }
    return `${diffMins}m`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Agent Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Agent Monitoring
            </CardTitle>
            <CardDescription>
              Real-time status and performance monitoring for your AI agents
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStatuses}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {agents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active agents to monitor. Deploy an agent to see its status here.
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="border border-border rounded-lg p-4 bg-background/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(agent.connection_status)}
                    <div>
                      <h3 className="font-semibold text-white">{agent.agent_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className={getStatusColor(agent.connection_status)}>
                          {agent.connection_status.charAt(0).toUpperCase() + agent.connection_status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={agent.active ? "default" : "secondary"}>
                      {agent.active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testAgentConnection(agent.id)}
                    >
                      Test
                    </Button>
                  </div>
                </div>

                {agent.error_message && (
                  <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                    <strong>Error:</strong> {agent.error_message}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      Posts Today
                    </div>
                    <p className="text-sm font-medium text-white">{agent.posts_today}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      Total Posts
                    </div>
                    <p className="text-sm font-medium text-white">{agent.total_posts}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Last Post
                    </div>
                    <p className="text-xs font-medium text-white">
                      {formatTime(agent.last_post_time)}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Next Post
                    </div>
                    <p className="text-xs font-medium text-white">
                      {getTimeUntilNext(agent.next_scheduled_post)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};