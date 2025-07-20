
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, User, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ContactMessage {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface MessageReply {
  id: string;
  contact_message_id: string;
  sender_id: string;
  is_admin_reply: boolean;
  message: string;
  created_at: string;
}

interface MessageThread {
  message: ContactMessage;
  replies: MessageReply[];
}

const ContactUs = () => {
  const { user, loading } = useUnifiedAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

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

  useEffect(() => {
    fetchUserMessages();
    
    // Set up real-time subscriptions
    const messagesChannel = supabase
      .channel('contact-messages-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contact_messages',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchUserMessages();
      })
      .subscribe();

    const repliesChannel = supabase
      .channel('contact-replies-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contact_message_replies'
      }, () => {
        fetchUserMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(repliesChannel);
    };
  }, [user.id]);

  const fetchUserMessages = async () => {
    try {
      // Fetch user's contact messages
      const { data: messages, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Fetch replies for all messages
      const { data: replies, error: repliesError } = await supabase
        .from('contact_message_replies')
        .select('*')
        .in('contact_message_id', messages?.map(m => m.id) || [])
        .order('created_at', { ascending: true });

      if (repliesError) throw repliesError;

      // Group replies by message
      const threads: MessageThread[] = messages?.map(msg => ({
        message: msg,
        replies: replies?.filter(r => r.contact_message_id === msg.id) || []
      })) || [];

      setMessageThreads(threads);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load your messages.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          user_id: user.id,
          subject: subject.trim(),
          message: message.trim(),
        });

      if (error) throw error;

      setSubject("");
      setMessage("");
      toast({
        title: "Message Sent!",
        description: "Your message has been screamed into the void successfully! 📢",
      });
      
      fetchUserMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyToThread = async (threadId: string) => {
    if (!replyMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('contact_message_replies')
        .insert({
          contact_message_id: threadId,
          sender_id: user.id,
          is_admin_reply: false,
          message: replyMessage.trim(),
        });

      if (error) throw error;

      setReplyMessage("");
      toast({
        title: "Reply Sent!",
        description: "Your reply has been added to the conversation.",
      });
      
      fetchUserMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send your reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedThreadData = messageThreads.find(t => t.message.id === selectedThread);

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <div className="pt-20 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              💩 Contact Us
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              We probably won't answer your message, but feel free to scream into the void! 📢
            </p>
            <p className="text-sm text-gray-500">
              (Just kidding... we might actually respond if you're lucky!)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject
                    </label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="What's bothering you today?"
                      className="bg-gray-800 border-gray-700 text-white"
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
                      placeholder="Scream your thoughts here..."
                      rows={6}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !subject.trim() || !message.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? "Screaming..." : "Scream into the Void"}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Message History */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Your Message History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {messageThreads.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No messages yet</p>
                    <p className="text-sm text-gray-500">Send your first message to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messageThreads.map((thread) => (
                      <div key={thread.message.id} className="border border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-medium truncate">
                            {thread.message.subject}
                          </h3>
                          <div className="flex items-center gap-2 ml-2">
                            <Badge 
                              variant={thread.message.status === 'open' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {thread.message.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                          {thread.message.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(thread.message.created_at), 'MMM dd, yyyy HH:mm')}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedThread(
                              selectedThread === thread.message.id ? null : thread.message.id
                            )}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {selectedThread === thread.message.id ? 'Hide' : 'View'} Thread
                            {thread.replies.length > 0 && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {thread.replies.length}
                              </Badge>
                            )}
                          </Button>
                        </div>

                        {/* Thread Conversation */}
                        {selectedThread === thread.message.id && selectedThreadData && (
                          <div className="mt-4 border-t border-gray-700 pt-4">
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {selectedThreadData.replies.map((reply) => (
                                <div
                                  key={reply.id}
                                  className={`p-3 rounded-lg ${
                                    reply.is_admin_reply
                                      ? 'bg-blue-900/20 border border-blue-800/30'
                                      : 'bg-gray-800 border border-gray-700'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge
                                      variant={reply.is_admin_reply ? 'default' : 'secondary'}
                                      className="text-xs"
                                    >
                                      {reply.is_admin_reply ? 'Admin' : 'You'}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(reply.created_at), 'MMM dd, HH:mm')}
                                    </span>
                                  </div>
                                  <p className="text-gray-300 text-sm">{reply.message}</p>
                                </div>
                              ))}
                            </div>

                            {/* Reply Form */}
                            {selectedThreadData.message.status === 'open' && (
                              <div className="mt-4 pt-4 border-t border-gray-700">
                                <div className="flex gap-2">
                                  <Textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Type your reply..."
                                    rows={2}
                                    className="flex-1 bg-gray-800 border-gray-700 text-white text-sm"
                                  />
                                  <Button
                                    onClick={() => handleReplyToThread(selectedThreadData.message.id)}
                                    disabled={!replyMessage.trim()}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            {selectedThreadData.message.status === 'closed' && (
                              <div className="mt-4 pt-4 border-t border-gray-700">
                                <div className="flex items-center justify-center p-3 bg-gray-800 rounded-lg">
                                  <X className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm text-gray-500">
                                    This conversation has been closed
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
