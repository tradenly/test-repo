
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, User, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface ToolRequest {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}

interface ToolRequestMessage {
  id: string;
  tool_request_id: string;
  sender_id: string;
  message: string;
  is_admin_message: boolean;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}

export const ToolRequestManagement = () => {
  const [requests, setRequests] = useState<ToolRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ToolRequest | null>(null);
  const [messages, setMessages] = useState<ToolRequestMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      fetchMessages(selectedRequest.id);
    }
  }, [selectedRequest]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('tool_requests')
        .select(`
          *,
          profiles:user_id (username, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tool requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (requestId: string) => {
    try {
      const { data, error } = await supabase
        .from('tool_request_messages')
        .select(`
          *,
          profiles:sender_id (username, full_name)
        `)
        .eq('tool_request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from('tool_request_messages')
        .insert({
          tool_request_id: selectedRequest.id,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          message: newMessage.trim(),
          is_admin_message: true,
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages(selectedRequest.id);
      
      // Update request status if it was closed
      if (selectedRequest.status === 'closed') {
        await supabase
          .from('tool_requests')
          .update({ status: 'open' })
          .eq('id', selectedRequest.id);
        
        fetchRequests();
      }

      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tool_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;

      fetchRequests();
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status });
      }

      toast({
        title: "Success",
        description: `Request marked as ${status}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-yellow-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Tool Requests</h1>
            <p className="text-gray-400">Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-yellow-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Tool Requests</h1>
          <p className="text-gray-400">
            Manage and respond to user tool requests
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests List */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">All Requests ({requests.length})</CardTitle>
            <CardDescription className="text-gray-400">
              Click on a request to view details and conversation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tool requests found</p>
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedRequest?.id === request.id
                      ? 'bg-blue-600/20 border-blue-500'
                      : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/70'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium truncate">{request.subject}</h3>
                    <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">{request.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{request.profiles?.username || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(request.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Conversation View */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">
                  {selectedRequest ? selectedRequest.subject : 'Select a Request'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {selectedRequest
                    ? `Conversation with ${selectedRequest.profiles?.username || 'Unknown User'}`
                    : 'Choose a request from the list to view the conversation'
                  }
                </CardDescription>
              </div>
              {selectedRequest && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'in_progress')}
                    disabled={selectedRequest.status === 'in_progress'}
                    className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                  >
                    In Progress
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'closed')}
                    disabled={selectedRequest.status === 'closed'}
                    className="border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedRequest ? (
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a request to view the conversation</p>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {/* Original request */}
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">
                        {selectedRequest.profiles?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(selectedRequest.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{selectedRequest.message}</p>
                  </div>

                  {/* Conversation messages */}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.is_admin_message
                          ? 'bg-yellow-600/20 ml-4'
                          : 'bg-gray-700/50 mr-4'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User className={`h-4 w-4 ${message.is_admin_message ? 'text-yellow-400' : 'text-blue-400'}`} />
                        <span className={`text-sm font-medium ${
                          message.is_admin_message ? 'text-yellow-400' : 'text-blue-400'
                        }`}>
                          {message.is_admin_message 
                            ? 'Admin' 
                            : message.profiles?.username || 'Unknown User'
                          }
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(message.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{message.message}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <Textarea
                    placeholder="Type your response..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                    rows={3}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="bg-yellow-600 hover:bg-yellow-500 text-black"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendingMessage ? 'Sending...' : 'Send Reply'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
