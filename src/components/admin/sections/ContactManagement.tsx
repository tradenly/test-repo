
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, User, Clock, CheckCircle, Send, RefreshCw } from "lucide-react";

interface ContactMessage {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  user_id: string;
  user_profile?: {
    username: string;
    full_name: string;
  };
  replies: ContactReply[];
}

interface ContactReply {
  id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
  sender_id: string;
}

export const ContactManagement = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [submittingReplies, setSubmittingReplies] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchMessages();
  }, []);

  // Real-time subscription for contact messages and replies
  useEffect(() => {
    const channel = supabase
      .channel('admin-contact-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_messages'
        },
        (payload) => {
          console.log('Contact message change:', payload);
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_message_replies'
        },
        (payload) => {
          console.log('Contact reply change:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      console.log('Fetching contact messages...');
      
      // First, fetch all contact messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      console.log('Contact messages fetched:', messagesData);

      // Get unique user IDs from messages
      const userIds = [...new Set(messagesData?.map(msg => msg.user_id) || [])];
      
      // Fetch profile data for all unique users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profilesData);

      // Create a map of user profiles for easy lookup
      const profileMap = (profilesData || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Fetch replies for each message
      const messagesWithReplies = await Promise.all(
        (messagesData || []).map(async (msg: any) => {
          const { data: repliesData, error: repliesError } = await supabase
            .from('contact_message_replies')
            .select('*')
            .eq('contact_message_id', msg.id)
            .order('created_at', { ascending: true });

          if (repliesError) {
            console.error('Error fetching replies for message:', msg.id, repliesError);
            throw repliesError;
          }

          return {
            ...msg,
            user_profile: profileMap[msg.user_id] || null,
            replies: repliesData || []
          };
        })
      );

      console.log('Messages with replies and profiles:', messagesWithReplies);
      setMessages(messagesWithReplies);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (messageId: string) => {
    const replyText = replyTexts[messageId]?.trim();
    if (!replyText) return;

    setSubmittingReplies(prev => ({ ...prev, [messageId]: true }));

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('contact_message_replies')
        .insert({
          contact_message_id: messageId,
          sender_id: userData.user.id,
          message: replyText,
          is_admin_reply: true
        });

      if (error) {
        console.error('Error sending reply:', error);
        throw error;
      }

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent to the user"
      });

      setReplyTexts(prev => ({ ...prev, [messageId]: "" }));
      // fetchMessages will be called automatically via real-time subscription
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingReplies(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', messageId);

      if (error) {
        console.error('Error updating status:', error);
        throw error;
      }

      toast({
        title: "Status Updated",
        description: `Message marked as ${newStatus}`
      });

      // fetchMessages will be called automatically via real-time subscription
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contact Messages</h1>
          <p className="text-gray-400 mt-2">Manage user contact messages and support requests</p>
        </div>
        <Button onClick={fetchMessages} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {messages.length === 0 ? (
        <Card className="bg-gray-800/40 border-gray-700">
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Messages</h3>
            <p className="text-gray-400">No contact messages have been received yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="bg-gray-800/40 border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      {message.subject}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {message.user_profile?.full_name || message.user_profile?.username || 'Unknown User'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(message.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={message.status === 'open' ? 'secondary' : 'outline'}
                      className={
                        message.status === 'open'
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }
                    >
                      {message.status === 'open' ? (
                        <Clock className="h-3 w-3 mr-1" />
                      ) : (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      {message.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(
                        message.id,
                        message.status === 'open' ? 'closed' : 'open'
                      )}
                    >
                      Mark as {message.status === 'open' ? 'Closed' : 'Open'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Original Message */}
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Original message:</div>
                  <p className="text-gray-300">{message.message}</p>
                </div>

                {/* Replies Thread */}
                {message.replies.length > 0 && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-300">Conversation:</div>
                    {message.replies.map((reply) => (
                      <div
                        key={reply.id}
                        className={`rounded-lg p-4 ${
                          reply.is_admin_reply
                            ? 'bg-blue-900/30 border-l-4 border-blue-500'
                            : 'bg-gray-700/50 border-l-4 border-gray-500'
                        }`}
                      >
                        <div className="text-sm text-gray-400 mb-2">
                          {reply.is_admin_reply ? 'Admin' : 'User'} replied:
                          <span className="ml-2">
                            {new Date(reply.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-300">{reply.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {message.status === 'open' && (
                  <div className="space-y-3 border-t border-gray-600 pt-4">
                    <div className="text-sm font-medium text-gray-300">Send Reply:</div>
                    <Textarea
                      value={replyTexts[message.id] || ""}
                      onChange={(e) =>
                        setReplyTexts(prev => ({ ...prev, [message.id]: e.target.value }))
                      }
                      placeholder="Type your response to the user..."
                      rows={3}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button
                      onClick={() => handleReply(message.id)}
                      disabled={!replyTexts[message.id]?.trim() || submittingReplies[message.id]}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {submittingReplies[message.id] ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
