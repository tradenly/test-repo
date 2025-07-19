
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

export const InfoCardsSection = () => {
  const navigate = useNavigate();
  const { user } = useUnifiedAuth();

  const handleFreeToolsClick = () => {
    if (user) {
      navigate('/dashboard?section=free-tools');
    } else {
      navigate('/auth');
    }
  };

  const handleNewsClick = () => {
    if (user) {
      navigate('/dashboard?section=news-updates');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Tools Card */}
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-purple-600/20 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                <img 
                  src="/lovable-uploads/83ea26bc-3fb2-4c8a-8d8d-f4047385255d.png" 
                  alt="Tools icon" 
                  className="h-8 w-8"
                />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Free Tools
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Built for the community
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-6 leading-relaxed">
                Access our collection of free crypto and blockchain tools designed to help the community navigate the toiletverse with ease.
              </p>
              <Button 
                onClick={handleFreeToolsClick}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 transform hover:scale-105 transition-all duration-300"
              >
                Explore Free Tools
              </Button>
            </CardContent>
          </Card>

          {/* News & Updates Card */}
          <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-blue-600/20 rounded-full w-16 h-16 flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                <img 
                  src="/lovable-uploads/b9ceab90-992d-4db1-a446-1c332aed9ee6.png" 
                  alt="News icon" 
                  className="h-8 w-8"
                />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                News & Updates
              </CardTitle>
              <CardDescription className="text-gray-300 text-base">
                Stay in the loop
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-6 leading-relaxed">
                Get the latest updates on POOPEE developments, new games, token launches, and community events straight from the source.
              </p>
              <Button 
                onClick={handleNewsClick}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 transform hover:scale-105 transition-all duration-300"
              >
                Read Latest News
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
