
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, User, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface ToolRequest {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ToolRequestMessage {
  id: string;
  tool_request_id: string;
  sender_id: string;
  message: string;
  is_admin_message: boolean;
  created_at: string;
}

export const UserToolRequestsView = () => {
  const [requests, setRequests] = useState<ToolRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ToolRequest | null>(null);
  const [messages, setMessages] = useState<ToolRequestMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserRequests();
    
    // Set up real-time subscription for request status changes
    const requestsSubscription = supabase
      .channel('user-tool-requests')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tool_requests'
        },
        (payload) => {
          console.log('Tool request updated:', payload);
          // Refresh requests to get updated status
          fetchUserRequests();
          
          // Update selected request if it's the one that was updated
          if (selectedRequest && payload.new.id === selectedRequest.id) {
            setSelectedRequest(payload.new as ToolRequest);
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel('user-tool-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tool_request_messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          // If the message is for the currently selected request, refresh messages
          if (selectedRequest && payload.new.tool_request_id === selectedRequest.id) {
            fetchMessages(selectedRequest.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsSubscription);
      supabase.removeChannel(messagesSubscription);
    };
  }, [selectedRequest]);

  useEffect(() => {
    if (selectedRequest) {
      fetchMessages(selectedRequest.id);
    }
  }, [selectedRequest]);

  const fetchUserRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tool_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched user requests:', data);
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching user requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your requests",
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
        .select('*')
        .eq('tool_request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch conversation",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRequest) return;

    // Prevent sending messages to closed requests
    if (selectedRequest.status === 'closed') {
      toast({
        title: "Cannot Send Message",
        description: "This request has been closed. Please create a new request if you need further assistance.",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('tool_request_messages')
        .insert({
          tool_request_id: selectedRequest.id,
          sender_id: user.id,
          message: newMessage.trim(),
          is_admin_message: false,
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages(selectedRequest.id);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Open';
      case 'in_progress': return 'In Progress';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-800/30 border-gray-700">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-gray-400">Loading your requests...</div>
        </CardContent>
      </Card>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="bg-gray-800/30 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Tool Requests
          </CardTitle>
          <CardDescription className="text-gray-400">
            You haven't submitted any tool requests yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800/30 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Tool Requests ({requests.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Track the status of your submitted requests and view admin responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Requests List */}
            <div className="space-y-3">
              <h3 className="text-white font-medium">Your Requests</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedRequest?.id === request.id
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700/70'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium text-sm truncate">{request.subject}</h4>
                      <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">{request.message}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{format(new Date(request.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation View */}
            <div className="border-l border-gray-700 pl-4">
              {!selectedRequest ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a request to view the conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-medium">{selectedRequest.subject}</h3>
                    <p className="text-gray-400 text-sm">
                      Status: <span className={`capitalize font-medium ${
                        selectedRequest.status === 'closed' ? 'text-gray-400' : 
                        selectedRequest.status === 'open' ? 'text-green-400' : 'text-blue-400'
                      }`}>
                        {getStatusText(selectedRequest.status)}
                      </span>
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {/* Original request */}
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">You</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(selectedRequest.created_at), 'MMM dd, HH:mm')}
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
                            ? 'bg-yellow-600/20 mr-4'
                            : 'bg-blue-600/20 ml-4'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User className={`h-4 w-4 ${message.is_admin_message ? 'text-yellow-400' : 'text-blue-400'}`} />
                          <span className={`text-sm font-medium ${
                            message.is_admin_message ? 'text-yellow-400' : 'text-blue-400'
                          }`}>
                            {message.is_admin_message ? 'Admin' : 'You'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(message.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form - Only show if request is not closed */}
                  {selectedRequest.status !== 'closed' ? (
                    <div className="space-y-3 pt-3 border-t border-gray-700">
                      <Textarea
                        placeholder="Type your response..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                        rows={2}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sendingMessage}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 text-white"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {sendingMessage ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-gray-700">
                      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-gray-400 text-sm mb-2">This request has been closed.</p>
                        <p className="text-gray-500 text-xs">
                          If you need further assistance, please submit a new request.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
