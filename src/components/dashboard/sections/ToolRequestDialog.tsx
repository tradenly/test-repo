
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToolRequests } from "@/hooks/useToolRequests";

interface ToolRequestDialogProps {
  children: React.ReactNode;
}

export const ToolRequestDialog = ({ children }: ToolRequestDialogProps) => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { submitToolRequest, submitting } = useToolRequests();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      return;
    }

    const success = await submitToolRequest(subject, message);
    if (success) {
      setSubject("");
      setMessage("");
      setOpen(false);
    }
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Request a New Tool</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-gray-300">
              Subject
            </Label>
            <Input
              id="subject"
              placeholder="Brief description of the tool you need"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300">
              Details
            </Label>
            <Textarea
              id="message"
              placeholder="Please describe what the tool should do, how you would use it, and any specific features you'd like to see..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 min-h-[120px]"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!subject.trim() || !message.trim() || submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
