import { Bot, Settings, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentManagementTab } from "./ai-management/AgentManagementTab";
import { ConfigurationTab } from "./ai-management/ConfigurationTab";
import { TwitterAgentMonitor } from "./ai-management/TwitterAgentMonitor";
import { SystemTestPanel } from "./ai-management/SystemTestPanel";

export const AIAgentManagement = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Bot className="h-8 w-8 text-yellow-400" />
        <div>
          <h1 className="text-3xl font-bold">AI Agent Management</h1>
          <p className="text-muted-foreground">Manage AI agents, configurations, and deployments</p>
        </div>
      </div>

      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            System Test
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agent Management
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Twitter Monitor
          </TabsTrigger>
          <TabsTrigger value="configuration" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="mt-6">
          <SystemTestPanel />
        </TabsContent>

        <TabsContent value="management" className="mt-6">
          <AgentManagementTab />
        </TabsContent>

        <TabsContent value="monitor" className="mt-6">
          <TwitterAgentMonitor />
        </TabsContent>

        <TabsContent value="configuration" className="mt-6">
          <ConfigurationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};