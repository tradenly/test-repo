
import { Search, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserSearchSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onCreateUser: () => void;
}

export const UserSearchSection = ({ searchTerm, onSearchChange, onCreateUser }: UserSearchSectionProps) => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Search Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by username or full name..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <Button
            onClick={onCreateUser}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
