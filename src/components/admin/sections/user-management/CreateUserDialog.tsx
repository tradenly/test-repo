
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateUserForm } from "./CreateUserForm";
import { UserPlus } from "lucide-react";

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserDialog = ({ isOpen, onClose, onSuccess }: CreateUserDialogProps) => {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-400" />
            Create New User
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new user account with initial setup. The user will receive a temporary password
            and will be prompted to change it on first login.
          </DialogDescription>
        </DialogHeader>
        
        <CreateUserForm onSuccess={handleSuccess} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
};
