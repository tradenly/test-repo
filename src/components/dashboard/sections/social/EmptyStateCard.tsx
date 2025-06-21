
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

interface EmptyStateCardProps {
  onAddClick: () => void;
}

export const EmptyStateCard = ({ onAddClick }: EmptyStateCardProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardContent className="p-12 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-white font-medium mb-2">No social accounts linked</h3>
        <p className="text-gray-400 mb-4">
          Connect your social media accounts to enhance your profile
        </p>
        <Button
          onClick={onAddClick}
          className="bg-gray-700 hover:bg-gray-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Your First Account
        </Button>
      </CardContent>
    </Card>
  );
};
