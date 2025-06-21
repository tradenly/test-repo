
import { Card, CardContent } from "@/components/ui/card";

export const LoadingCard = () => {
  return (
    <Card className="bg-gray-800/40 border-gray-700">
      <CardContent className="p-6">
        <p className="text-gray-400 text-center">Loading social accounts...</p>
      </CardContent>
    </Card>
  );
};
