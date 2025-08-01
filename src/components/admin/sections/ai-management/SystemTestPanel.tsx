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

  const TestButton = ({ testType, label, description }: { testType: string; label: string; description: string }) => {
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
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={() => runSystemTest(testType)}
            disabled={isRunning}
            size="sm"
            className="w-full"
          >
            <TestTube className="h-3 w-3 mr-1" />
            Test {label}
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
            />
            
            <TestButton 
              testType="orchestrator_schedules"
              label="Process Schedules"
              description="Test agent schedule processing and content generation"
            />
            
            <TestButton 
              testType="orchestrator_tasks"
              label="Process Tasks"
              description="Test pending task execution via Twitter API"
            />
            
            <TestButton 
              testType="full_cycle"
              label="Full Cycle"
              description="Complete end-to-end agent operation test"
            />
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Test Instructions:</h4>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. <strong>API Connections</strong> - Verifies OpenAI API key and Twitter credentials</li>
              <li>2. <strong>Process Schedules</strong> - Creates AI-generated content for active agents</li>
              <li>3. <strong>Process Tasks</strong> - Executes pending tasks via Twitter API</li>
              <li>4. <strong>Full Cycle</strong> - Runs complete agent workflow from content generation to posting</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};