import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, RefreshCw, Activity, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AgentTask {
  id: string;
  agent_id: string;
  task_type: string;
  content: any;
  status: string;
  created_at: string;
  executed_at?: string;
  error_message?: string;
  ai_agent_signups?: {
    agent_name: string;
    user_id: string;
  };
}

interface AgentLog {
  id: string;
  agent_id: string;
  log_level: string;
  message: string;
  created_at: string;
  ai_agent_signups?: {
    agent_name: string;
  };
}

interface AgentSchedule {
  id: string;
  agent_id: string;
  frequency_minutes: number;
  is_active: boolean;
  ai_agent_signups?: {
    agent_name: string;
    status: string;
  };
}

export const TwitterAgentMonitor = () => {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [schedules, setSchedules] = useState<AgentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch recent tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('ai_agent_tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (tasksError) throw tasksError;

      // Fetch recent logs
      const { data: logsData, error: logsError } = await supabase
        .from('ai_agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Fetch schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('ai_agent_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (schedulesError) throw schedulesError;

      setTasks(tasksData || []);
      setLogs(logsData || []);
      setSchedules(schedulesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch monitoring data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerOrchestrator = async (action: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-agent-orchestrator', {
        body: { action }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `${action.replace('_', ' ')} completed successfully`,
      });

      // Refresh data after processing
      setTimeout(fetchData, 2000);
    } catch (error) {
      console.error('Error triggering orchestrator:', error);
      toast({
        title: 'Error',
        description: `Failed to ${action.replace('_', ' ')}`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Activity className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      case 'info':
        return <Badge variant="outline">Info</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Twitter Agent Monitor</CardTitle>
          <CardDescription>Loading monitoring data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Twitter Agent Monitor</CardTitle>
            <CardDescription>Monitor AI agent activity and manage orchestration</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => triggerOrchestrator('process_schedules')}
              disabled={isProcessing}
              variant="outline"
              size="sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Generate Content
            </Button>
            <Button
              onClick={() => triggerOrchestrator('process_tasks')}
              disabled={isProcessing}
              variant="outline"
              size="sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              Process Tasks
            </Button>
            <Button
              onClick={() => triggerOrchestrator('full_cycle')}
              disabled={isProcessing}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              Full Cycle
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="logs">Logs ({logs.length})</TabsTrigger>
          <TabsTrigger value="schedules">Schedules ({schedules.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Latest AI agent tasks and their execution status</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Content Preview</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Executed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          {task.ai_agent_signups?.agent_name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.task_type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {task.content?.text || JSON.stringify(task.content)}
                        </TableCell>
                        <TableCell>{formatTimestamp(task.created_at)}</TableCell>
                        <TableCell>
                          {task.executed_at ? formatTimestamp(task.executed_at) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Recent AI agent activity and system logs</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          {log.ai_agent_signups?.agent_name || 'System'}
                        </TableCell>
                        <TableCell>{getLogLevelBadge(log.log_level)}</TableCell>
                        <TableCell className="max-w-md">{log.message}</TableCell>
                        <TableCell>{formatTimestamp(log.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Agent Schedules</CardTitle>
              <CardDescription>Active agent posting schedules and configurations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Agent Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          {schedule.ai_agent_signups?.agent_name || 'Unknown'}
                        </TableCell>
                        <TableCell>Every {schedule.frequency_minutes} min</TableCell>
                        <TableCell>
                          {schedule.is_active ? (
                            <Badge variant="default"><Play className="w-3 h-3 mr-1" />Active</Badge>
                          ) : (
                            <Badge variant="secondary"><Pause className="w-3 h-3 mr-1" />Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={schedule.ai_agent_signups?.status === 'approved' ? 'default' : 'secondary'}>
                            {schedule.ai_agent_signups?.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Toggle schedule status
                              supabase
                                .from('ai_agent_schedules')
                                .update({ is_active: !schedule.is_active })
                                .eq('id', schedule.id)
                                .then(() => fetchData());
                            }}
                          >
                            {schedule.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};