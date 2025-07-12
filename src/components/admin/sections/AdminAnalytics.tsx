
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, GamepadIcon, DollarSign, TrendingUp, Trophy, Clock, Target, Coins } from 'lucide-react';

const gameColors = {
  flappy_hippos: '#3B82F6',
  poopee_crush: '#10B981', 
  falling_logs: '#F59E0B'
};

const gameNames = {
  flappy_hippos: 'Flappy Hippos',
  poopee_crush: 'Poopee Crush',
  falling_logs: 'Falling Logs'
};

export const AdminAnalytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      console.log('🔍 AdminAnalytics: Fetching comprehensive analytics data');
      
      // Get all game sessions with user info
      const { data: sessions, error: sessionsError } = await supabase
        .from('game_sessions')
        .select(`
          *,
          profiles!game_sessions_user_id_fkey (username, full_name)
        `)
        .order('created_at', { ascending: false });

      if (sessionsError) {
        console.error('❌ Error fetching game sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('📊 Raw sessions data:', sessions?.length, 'sessions');

      // Get daily sessions for the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentSessions = sessions?.filter(session => 
        new Date(session.created_at) >= thirtyDaysAgo
      ) || [];

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
        avgPerSession: stats.sessions > 0 ? (stats.creditsSpent / stats.sessions).toFixed(2) : 0
      }));

      // Top players analysis
      const playerStats = sessions?.reduce((acc, session) => {
        const userId = session.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            username: session.profiles?.username || 'Anonymous',
            fullName: session.profiles?.full_name || 'Unknown',
            totalSessions: 0,
            totalCreditsSpent: 0,
            totalCreditsEarned: 0,
            highestScore: 0,
            totalDuration: 0,
            games: new Set()
          };
        }
        acc[userId].totalSessions++;
        acc[userId].totalCreditsSpent += session.credits_spent || 0;
        acc[userId].totalCreditsEarned += session.credits_earned || 0;
        acc[userId].highestScore = Math.max(acc[userId].highestScore, session.score || 0);
        acc[userId].totalDuration += session.duration_seconds || 0;
        acc[userId].games.add(session.game_type);
        return acc;
      }, {} as Record<string, any>) || {};

      const topPlayers = Object.values(playerStats)
        .sort((a: any, b: any) => b.totalSessions - a.totalSessions)
        .slice(0, 10);

      // Daily activity data
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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <div className="text-gray-400">Loading comprehensive analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <div className="text-gray-400">No analytics data available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Comprehensive insights into game performance and user engagement</p>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Sessions</CardTitle>
            <GamepadIcon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.overview.totalSessions}</div>
            <p className="text-xs text-gray-500">Across all games</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Unique Players</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.overview.uniquePlayers}</div>
            <p className="text-xs text-gray-500">Active users</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics.overview.totalRevenue.toFixed(0)} Credits</div>
            <p className="text-xs text-gray-500">Net profit</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Session Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Math.round(analytics.overview.avgSessionDuration)}s</div>
            <p className="text-xs text-gray-500">Per session</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Game Popularity Pie Chart */}
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Game Popularity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.gamePopularityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {analytics.gamePopularityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={Object.values(gameColors)[index % Object.values(gameColors).length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Financial Performance */}
        <Card className="bg-gray-800/40 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Financial Performance by Game</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.gameFinancialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar dataKey="spent" fill="#EF4444" name="Credits Spent" />
                  <Bar dataKey="earned" fill="#10B981" name="Credits Earned" />
                  <Bar dataKey="profit" fill="#3B82F6" name="Net Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Daily Activity (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.dailyActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '6px'
                  }}
                />
                <Line type="monotone" dataKey="sessions" stroke="#3B82F6" name="Sessions" />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Players Table */}
      <Card className="bg-gray-800/40 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Top Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-400">Player</TableHead>
                <TableHead className="text-gray-400">Sessions</TableHead>
                <TableHead className="text-gray-400">Credits Spent</TableHead>
                <TableHead className="text-gray-400">Credits Earned</TableHead>
                <TableHead className="text-gray-400">Highest Score</TableHead>
                <TableHead className="text-gray-400">Total Playtime</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topPlayers.map((player: any, index: number) => (
                <TableRow key={player.userId}>
                  <TableCell className="text-white">
                    <div>
                      <div className="font-medium">{player.username}</div>
                      <div className="text-sm text-gray-400">{player.fullName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">{player.totalSessions}</TableCell>
                  <TableCell className="text-white">{player.totalCreditsSpent.toFixed(1)}</TableCell>
                  <TableCell className="text-white">{player.totalCreditsEarned.toFixed(1)}</TableCell>
                  <TableCell className="text-white">{player.highestScore}</TableCell>
                  <TableCell className="text-white">{Math.round(player.totalDuration / 60)}m</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Game Performance Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(analytics.gameStats).map(([gameType, stats]: [string, any]) => (
          <Card key={gameType} className="bg-gray-800/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5" style={{ color: gameColors[gameType as keyof typeof gameColors] }} />
                {stats.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Sessions:</span>
                <span className="text-white">{stats.sessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Unique Players:</span>
                <span className="text-white">{stats.uniquePlayers.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Score:</span>
                <span className="text-white">{stats.sessions > 0 ? Math.round(stats.totalScore / stats.sessions) : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Credits/Session:</span>
                <span className="text-white">{stats.sessions > 0 ? (stats.creditsSpent / stats.sessions).toFixed(1) : 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Profit Margin:</span>
                <span className="text-white">{stats.creditsSpent > 0 ? (((stats.creditsSpent - stats.creditsEarned) / stats.creditsSpent) * 100).toFixed(1) : 0}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
