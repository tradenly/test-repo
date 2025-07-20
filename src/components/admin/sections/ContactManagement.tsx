
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { MessageCircle, User, Mail, Clock, Send, X, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface ContactMessage {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
}

interface MessageReply {
  id: string;
  contact_message_id: string;
  sender_id: string;
  is_admin_reply: boolean;
  message: string;
  created_at: string;
}

interface MessageWithUser extends ContactMessage {
  user_profile: UserProfile;
  user_email: string;
  replies: MessageReply[];
}

export const ContactManagement = () => {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchContactMessages();
    
    // Set up real-time subscriptions
    const messagesChannel = supabase
      .channel('admin-contact-messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contact_messages'
      }, () => {
        fetchContactMessages();
      })
      .subscribe();

    const repliesChannel = supabase
      .channel('admin-contact-replies')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contact_message_replies'
      }, () => {
        fetchContactMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(repliesChannel);
    };
  }, []);

  const fetchContactMessages = async () => {
    try {
      // Fetch all contact messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      if (!messagesData) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Fetch user profiles and emails
      const userIds = [...new Set(messagesData.map(m => m.user_id))];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Fetch user emails from auth.users (we need to use a different approach since we can't directly query auth.users)
      // For now, we'll get emails through the RPC or create a view if needed
      // Let's fetch emails via a workaround - getting them from the raw_user_meta_data when available
      
      // Fetch replies for all messages
      const { data: replies, error: repliesError } = await supabase
        .from('contact_message_replies')
        .select('*')
        .in('contact_message_id', messagesData.map(m => m.id))
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      // Combine the data
      const messagesWithUsers: MessageWithUser[] = messagesData.map(msg => {
        const userProfile = profiles?.find(p => p.id === msg.user_id) || {
          id: msg.user_id,
          username: 'Unknown User',
          full_name: 'Unknown User'
        };
        
        const messageReplies = replies?.filter(r => r.contact_message_id === msg.id) || [];
        
        return {
          ...msg,
          user_profile: userProfile,
          user_email: 'Email not available', // We'll need to handle this differently
          replies: messageReplies
        };
      });

      setMessages(messagesWithUsers);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: "Error",
        description: "Failed to load contact messages.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (messageId: string) => {
    if (!replyText.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('contact_message_replies')
        .insert({
          contact_message_id: messageId,
          sender_id: user.id,
          is_admin_reply: true,
          message: replyText.trim(),
        });

      if (error) throw error;

      setReplyText("");
      toast({
        title: "Reply Sent!",
        description: "Your reply has been sent to the user.",
      });
      
      fetchContactMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'closed', updated_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Message Closed",
        description: "The message has been closed successfully.",
      });
      
      fetchContactMessages();
    } catch (error) {
      console.error('Error closing message:', error);
      toast({
        title: "Error",
        description: "Failed to close message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReopenMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: 'open', updated_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Message Reopened",
        description: "The message has been reopened successfully.",
      });
      
      fetchContactMessages();
    } catch (error) {
      console.error('Error reopening message:', error);
      toast({
        title: "Error",
        description: "Failed to reopen message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.user_profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.user_profile.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const selectedMessageData = messages.find(m => m.id === selectedMessage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading contact messages...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Contact Messages</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {messages.length} Total Messages
        </Badge>
      </div>

      {/* Search and Filter */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search messages, subjects, or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Messages ({filteredMessages.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No messages found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMessage === msg.id
                        ? 'border-blue-500 bg-blue-900/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedMessage(msg.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium truncate">
                        {msg.subject}
                      </h3>
                      <Badge 
                        variant={msg.status === 'open' ? 'default' : 'secondary'}
                        className="text-xs ml-2"
                      >
                        {msg.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                      <User className="h-3 w-3" />
                      <span>{msg.user_profile.full_name} (@{msg.user_profile.username})</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                      {msg.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(msg.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                      {msg.replies.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {msg.replies.length} replies
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Message Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedMessageData ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select a message to view details</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Message Header */}
                <div className="border-b border-gray-700 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-semibold text-white">
                      {selectedMessageData.subject}
                    </h2>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={selectedMessageData.status === 'open' ? 'default' : 'secondary'}
                      >
                        {selectedMessageData.status}
                      </Badge>
                      {selectedMessageData.status === 'open' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCloseMessage(selectedMessageData.id)}
                          className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReopenMessage(selectedMessageData.id)}
                          className="text-green-400 border-green-400 hover:bg-green-400 hover:text-white"
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        {selectedMessageData.user_profile.full_name} 
                        (@{selectedMessageData.user_profile.username})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{selectedMessageData.user_email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(selectedMessageData.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Original Message */}
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Original Message</h3>
                  <p className="text-gray-300">{selectedMessageData.message}</p>
                </div>

                {/* Conversation Thread */}
                {selectedMessageData.replies.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-white font-medium">Conversation</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedMessageData.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className={`p-3 rounded-lg ${
                            reply.is_admin_reply
                              ? 'bg-blue-900/20 border border-blue-800/30 ml-4'
                              : 'bg-gray-800 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant={reply.is_admin_reply ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {reply.is_admin_reply ? 'Admin' : 'User'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(reply.created_at), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                {selectedMessageData.status === 'open' && (
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-white font-medium mb-3">Send Reply</h3>
                    <div className="space-y-3">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply to the user..."
                        rows={4}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <Button
                        onClick={() => handleSendReply(selectedMessageData.id)}
                        disabled={!replyText.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                )}

                {selectedMessageData.status === 'closed' && (
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-center p-4 bg-gray-800 rounded-lg">
                      <X className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-gray-500">
                        This conversation is closed
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
