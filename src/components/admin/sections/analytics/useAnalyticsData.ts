
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const gameNames = {
  flappy_hippos: 'Flappy Hippos',
  poopee_crush: 'Poopee Crush',
  falling_logs: 'Falling Logs'
};

export const useAnalyticsData = () => {
  return useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      console.log('🔍 AdminAnalytics: Fetching comprehensive analytics data');
      
      // Get leaderboard data (includes user info properly joined)
      const { data: leaderboardData, error: leaderboardError } = await supabase.rpc('get_leaderboard_stats');
      
      if (leaderboardError) {
        console.error('❌ Error fetching leaderboard data:', leaderboardError);
        throw leaderboardError;
      }

      // Get all game sessions for analytics
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('❌ Error fetching game sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('📊 Analytics data:', {
        leaderboardEntries: leaderboardData?.length,
        totalSessions: sessions?.length
      });

      // Process overview metrics
      const totalSessions = sessions?.length || 0;
      const uniquePlayers = new Set(sessions?.map(s => s.user_id)).size;
      const totalCreditsSpent = sessions?.reduce((sum, s) => sum + (s.credits_spent || 0), 0) || 0;
      const totalCreditsEarned = sessions?.reduce((sum, s) => sum + (s.credits_earned || 0), 0) || 0;
      const totalRevenue = totalCreditsSpent - totalCreditsEarned;
      const avgSessionDuration = sessions?.length ? 
        sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length : 0;

      // Process game popularity data
      const gameStats = sessions?.reduce((acc, session) => {
        const gameType = session.game_type || 'unknown';
        if (!acc[gameType]) {
          acc[gameType] = {
            name: gameNames[gameType as keyof typeof gameNames] || gameType,
            sessions: 0,
            creditsSpent: 0,
            creditsEarned: 0,
            totalScore: 0,
            totalDuration: 0,
            uniquePlayers: new Set()
          };
        }
        acc[gameType].sessions++;
        acc[gameType].creditsSpent += session.credits_spent || 0;
        acc[gameType].creditsEarned += session.credits_earned || 0;
        acc[gameType].totalScore += session.score || 0;
        acc[gameType].totalDuration += session.duration_seconds || 0;
        acc[gameType].uniquePlayers.add(session.user_id);
        return acc;
      }, {} as Record<string, any>) || {};

      // Convert to arrays for charts
      const gamePopularityData = Object.entries(gameStats).map(([key, stats]) => ({
        name: stats.name,
        value: stats.sessions,
        percentage: ((stats.sessions / totalSessions) * 100).toFixed(1)
      }));

      const gameFinancialData = Object.entries(gameStats).map(([key, stats]) => ({
        name: stats.name,
        spent: stats.creditsSpent,
        earned: stats.creditsEarned,
        profit: stats.creditsSpent - stats.creditsEarned,
        avgPerSession: stats.sessions > 0 ? (stats.creditsSpent / stats.sessions).toFixed(2) : "0"
      }));

      // Use leaderboard data for top players (already has proper user info)
      const topPlayers = leaderboardData?.slice(0, 10) || [];

      // Daily activity data
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentSessions = sessions?.filter(session => 
        new Date(session.created_at) >= thirtyDaysAgo
      ) || [];

      const dailyData: Record<string, { date: string; sessions: number; revenue: number }> = {};
      recentSessions.forEach((session) => {
        const date = new Date(session.created_at).toLocaleDateString();
        if (!dailyData[date]) {
          dailyData[date] = { date, sessions: 0, revenue: 0 };
        }
        dailyData[date].sessions++;
        dailyData[date].revenue += (session.credits_spent || 0) - (session.credits_earned || 0);
      });

      const dailyActivityData = Object.values(dailyData)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14); // Last 14 days

      console.log('✅ AdminAnalytics: Processed analytics data:', {
        totalSessions,
        uniquePlayers,
        gameTypes: Object.keys(gameStats),
        topPlayersCount: topPlayers.length
      });

      return {
        overview: {
          totalSessions,
          uniquePlayers,
          totalCreditsSpent,
          totalCreditsEarned,
          totalRevenue,
          avgSessionDuration
        },
        gamePopularityData,
        gameFinancialData,
        gameStats,
        topPlayers,
        dailyActivityData
      };
    },
  });
};
