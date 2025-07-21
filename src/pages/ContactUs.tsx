
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, Clock, CheckCircle } from "lucide-react";

interface ContactMessage {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  user_id: string;
  replies: ContactReply[];
}

interface ContactReply {
  id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
  sender_id: string;
}

const ContactUs = () => {
  const { user, loading } = useUnifiedAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  // Real-time subscription for new replies
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('contact-replies')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_message_replies'
        },
        (payload) => {
          console.log('New reply received:', payload);
          fetchMessages();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contact_messages'
        },
        (payload) => {
          console.log('Message status updated:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      console.log('Fetching user messages...');
      
      // Now we can use proper PostgREST syntax
      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      console.log('User messages fetched successfully:', messagesData);

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
            replies: repliesData || []
          };
        })
      );

      console.log('User messages with replies:', messagesWithReplies);
      setMessages(messagesWithReplies);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;

    setSubmitting(true);

    try {
      console.log('Submitting new contact message...');
      
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          user_id: user.id,
          subject: subject.trim(),
          message: message.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully. An admin will respond soon."
      });

      setSubject("");
      setMessage("");
      // fetchMessages will be called automatically via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (messageId: string) => {
    if (!user || !replyText[messageId]?.trim()) return;

    try {
      console.log('Sending user reply...');
      
      const { error } = await supabase
        .from('contact_message_replies')
        .insert({
          contact_message_id: messageId,
          sender_id: user.id,
          message: replyText[messageId].trim(),
          is_admin_reply: false
        });

      if (error) {
        console.error('Error sending reply:', error);
        throw error;
      }

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent"
      });

      setReplyText(prev => ({ ...prev, [messageId]: "" }));
      // fetchMessages will be called automatically via real-time subscription
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="pt-20 px-4 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Contact Us</h1>
          <p className="text-gray-400">Send us a message and we'll get back to you</p>
        </div>

        {/* New Message Form */}
        <Card className="bg-gray-800/40 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Send New Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your message"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question, issue, or feedback in detail"
                  rows={5}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={submitting || !subject.trim() || !message.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Message History */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Your Messages</h2>
          
          {loadingMessages ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <Card className="bg-gray-800/40 border-gray-700">
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No messages yet. Send your first message above!</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((msg) => (
              <Card key={msg.id} className="bg-gray-800/40 border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-white break-words">{msg.subject}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {msg.status === 'open' ? (
                        <span className="flex items-center gap-1 text-yellow-400 text-sm whitespace-nowrap">
                          <Clock className="h-4 w-4" />
                          Open
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-400 text-sm whitespace-nowrap">
                          <CheckCircle className="h-4 w-4" />
                          Closed
                        </span>
                      )}
                      <span className="text-gray-400 text-sm whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Original Message */}
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-2">You wrote:</div>
                    <p className="text-gray-300 whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>

                  {/* Replies */}
                  {msg.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`rounded-lg p-4 ${
                        reply.is_admin_reply
                          ? 'bg-blue-900/30 border-l-4 border-blue-500'
                          : 'bg-gray-700/50'
                      }`}
                    >
                      <div className="text-sm text-gray-400 mb-2">
                        {reply.is_admin_reply ? 'Admin replied:' : 'You replied:'}
                        <span className="ml-2 whitespace-nowrap">
                          {new Date(reply.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap break-words">{reply.message}</p>
                    </div>
                  ))}

                  {/* Reply Form (only for open messages) */}
                  {msg.status === 'open' && (
                    <div className="space-y-3">
                      <Textarea
                        value={replyText[msg.id] || ""}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [msg.id]: e.target.value }))}
                        placeholder="Type your reply..."
                        rows={3}
                        className="bg-gray-700 border-gray-600 text-white break-words"
                      />
                      <Button
                        onClick={() => handleReply(msg.id)}
                        disabled={!replyText[msg.id]?.trim()}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
