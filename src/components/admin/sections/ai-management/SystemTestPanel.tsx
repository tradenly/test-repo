import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Play, TestTube, Zap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const SystemTestPanel = () => {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);

  const runSystemTest = async (testType: string) => {
    setIsRunning(true);
    try {
      let result;
      
      switch (testType) {
        case 'connections':
          result = await supabase.functions.invoke('test-connections', {
            body: { action: 'system_status' }
          });
          break;
        case 'orchestrator_schedules':
          result = await supabase.functions.invoke('ai-agent-orchestrator', {
            body: { action: 'process_schedules' }
          });
          break;
        case 'orchestrator_tasks':
          result = await supabase.functions.invoke('ai-agent-orchestrator', {
            body: { action: 'process_tasks' }
          });
          break;
        case 'full_cycle':
          result = await supabase.functions.invoke('ai-agent-orchestrator', {
            body: { action: 'full_cycle' }
          });
          break;
        default:
          throw new Error(`Unknown test type: ${testType}`);
      }

      setTestResults(prev => ({
        ...prev,
        [testType]: result
      }));

      toast({
        title: "Test Complete",
        description: `${testType} test completed`,
        variant: result.error ? 'destructive' : 'default'
      });

    } catch (error) {
      const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      setTestResults(prev => ({
        ...prev,
        [testType]: errorResult
      }));

      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getTestStatus = (testType: string) => {
    const result = testResults[testType];
    if (!result) return { icon: <AlertTriangle className="h-4 w-4" />, color: 'secondary', text: 'Not Tested' };
    if (result.error) return { icon: <XCircle className="h-4 w-4" />, color: 'destructive', text: 'Failed' };
    return { icon: <CheckCircle className="h-4 w-4" />, color: 'default', text: 'Passed' };
  };

  const TestButton = ({ testType, label, description, tooltip }: { 
    testType: string; 
    label: string; 
    description: string;
    tooltip?: string;
  }) => {
    const status = getTestStatus(testType);
    
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Badge variant={status.color as any} className="flex items-center gap-1">
              {status.icon}
              {status.text}
            </Badge>
          </div>
          <CardDescription className="text-xs">{description}</CardDescription>
          {tooltip && (
            <div className="text-xs text-muted-foreground bg-muted p-3 rounded mt-2 border-l-4 border-primary">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-foreground">What this does:</strong>
                  <p className="mt-1">{tooltip}</p>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={() => runSystemTest(testType)}
            disabled={isRunning}
            size="sm"
            className="w-full"
          >
            <TestTube className="h-3 w-3 mr-1" />
            {isRunning ? 'Testing...' : `Test ${label}`}
          </Button>
          
          {testResults[testType] && (
            <div className="mt-3 p-2 bg-muted rounded text-xs">
              <pre className="whitespace-pre-wrap max-h-32 overflow-y-auto">
                {JSON.stringify(testResults[testType], null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            AI Agent System Tests
          </CardTitle>
          <CardDescription>
            Comprehensive testing panel for the AI agent deployment system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TestButton 
              testType="connections"
              label="API Connections"
              description="Test OpenAI, Twitter, and Database connectivity"
              tooltip="Tests all required API connections: OpenAI for AI content generation, Twitter API for social media posting, and database connectivity for storing agent data and logs. This verifies that all credentials are properly configured and services are accessible."
            />
            
            <TestButton 
              testType="orchestrator_schedules"
              label="Generate Content"
              description="Test AI content generation for active agents"
              tooltip="Checks active agent schedules and generates AI content based on agent personalities and configurations. This simulates the automatic content creation process that runs based on each agent's posting schedule and probability settings."
            />
            
            <TestButton 
              testType="orchestrator_tasks"
              label="Process Tasks"
              description="Execute pending tasks via Twitter API"
              tooltip="Processes all pending tasks in the queue by posting them to Twitter using the configured API credentials. This tests the actual social media posting functionality and verifies that generated content reaches the target platforms."
            />
            
            <TestButton 
              testType="full_cycle"
              label="Full Cycle Test"
              description="Complete end-to-end agent operation test"
              tooltip="Runs the complete agent workflow from start to finish: 1) Checks active schedules, 2) Generates AI content for eligible agents, 3) Creates posting tasks, 4) Executes tasks via Twitter API. This is a comprehensive test of the entire AI agent system."
            />
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-muted/50 to-muted rounded-lg border">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <TestTube className="h-4 w-4 text-primary" />
              System Test Guide
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-foreground mb-2">Test Order Recommendation:</p>
                <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
                  <li><strong>API Connections</strong> - Verify all services are accessible</li>
                  <li><strong>Generate Content</strong> - Test AI content creation</li>
                  <li><strong>Process Tasks</strong> - Verify posting functionality</li>
                  <li><strong>Full Cycle Test</strong> - End-to-end system validation</li>
                </ol>
              </div>
              <div>
                <p className="font-medium text-foreground mb-2">System Requirements:</p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Active agent schedules configured</li>
                  <li>Twitter accounts connected to agents</li>
                  <li>API credentials properly set in secrets</li>
                  <li>Agents in 'active' status</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};