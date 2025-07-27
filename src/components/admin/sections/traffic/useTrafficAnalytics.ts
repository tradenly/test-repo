import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

export interface TrafficMetrics {
  totalSessions: number;
  uniqueVisitors: number;
  totalPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number; percentage: number }>;
  trafficSources: Array<{ source: string; sessions: number; percentage: number }>;
  geoData: Array<{ country: string; sessions: number; percentage: number }>;
  deviceData: Array<{ type: string; sessions: number; percentage: number }>;
  dailyTraffic: Array<{ date: string; sessions: number; pageViews: number }>;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export const useTrafficAnalytics = (dateRange: DateRange) => {
  const [data, setData] = useState<TrafficMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrafficData = async () => {
      try {
        setLoading(true);
        setError(null);

        const fromDate = startOfDay(dateRange.from).toISOString();
        const toDate = endOfDay(dateRange.to).toISOString();

        // Fetch visitor sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from('visitor_sessions')
          .select('*')
          .gte('created_at', fromDate)
          .lte('created_at', toDate);

        if (sessionsError) throw sessionsError;

        // Fetch page views
        const { data: pageViews, error: pageViewsError } = await supabase
          .from('page_views')
          .select('*')
          .gte('created_at', fromDate)
          .lte('created_at', toDate);

        if (pageViewsError) throw pageViewsError;

        // Fetch visitor analytics for geo and device data
        const { data: analytics, error: analyticsError } = await supabase
          .from('visitor_analytics')
          .select('*')
          .gte('created_at', fromDate)
          .lte('created_at', toDate);

        if (analyticsError) throw analyticsError;

        // Process the data
        const processedData = processTrafficData(sessions || [], pageViews || [], analytics || []);
        setData(processedData);
      } catch (err) {
        console.error('Error fetching traffic data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch traffic data');
        
        // Set empty data structure instead of null for better UX
        setData({
          totalSessions: 0,
          uniqueVisitors: 0,
          totalPageViews: 0,
          averageSessionDuration: 0,
          bounceRate: 0,
          topPages: [],
          trafficSources: [],
          geoData: [],
          deviceData: [],
          dailyTraffic: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrafficData();
  }, [dateRange.from, dateRange.to]);

  return { data, loading, error };
};

function processTrafficData(
  sessions: any[],
  pageViews: any[],
  analytics: any[]
): TrafficMetrics {
  // Calculate basic metrics
  const totalSessions = sessions.length;
  const uniqueVisitors = new Set(sessions.map(s => s.ip_address)).size;
  const totalPageViews = pageViews.length;
  
  const avgDuration = sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / totalSessions || 0;
  const bounces = sessions.filter(s => s.is_bounce).length;
  const bounceRate = totalSessions > 0 ? (bounces / totalSessions) * 100 : 0;

  // Process top pages
  const pageStats = pageViews.reduce((acc, pv) => {
    const page = pv.page_path || 'Unknown';
    acc[page] = (acc[page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPages = Object.entries(pageStats)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([page, views]) => ({
      page,
      views: views as number,
      percentage: ((views as number) / totalPageViews) * 100
    }));

  // Process traffic sources
  const sourceStats = sessions.reduce((acc, session) => {
    let source = 'Direct';
    if (session.utm_source) {
      source = session.utm_source;
    } else if (session.referrer && !session.referrer.includes(window.location.hostname)) {
      try {
        source = new URL(session.referrer).hostname;
      } catch {
        source = 'Referrer';
      }
    }
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const trafficSources = Object.entries(sourceStats)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([source, sessionCount]) => ({
      source,
      sessions: sessionCount as number,
      percentage: ((sessionCount as number) / totalSessions) * 100
    }));

  // Process geographic data
  const geoStats = analytics.reduce((acc, item) => {
    const country = item.country_name || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const geoData = Object.entries(geoStats)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([country, sessionCount]) => ({
      country,
      sessions: sessionCount as number,
      percentage: ((sessionCount as number) / analytics.length) * 100
    }));

  // Process device data
  const deviceStats = analytics.reduce((acc, item) => {
    const type = item.device_type || (item.is_mobile ? 'Mobile' : 'Desktop');
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceData = Object.entries(deviceStats)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([type, sessionCount]) => ({
      type,
      sessions: sessionCount as number,
      percentage: ((sessionCount as number) / analytics.length) * 100
    }));

  // Process daily traffic
  const dailyStats = sessions.reduce((acc, session) => {
    const date = format(new Date(session.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { sessions: 0, pageViews: 0 };
    }
    acc[date].sessions += 1;
    return acc;
  }, {} as Record<string, { sessions: number; pageViews: number }>);

  // Add page views to daily stats
  pageViews.forEach(pv => {
    const date = format(new Date(pv.created_at), 'yyyy-MM-dd');
    if (dailyStats[date]) {
      dailyStats[date].pageViews += 1;
    }
  });

  const dailyTraffic = Object.entries(dailyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({
      date,
      sessions: (stats as { sessions: number; pageViews: number }).sessions,
      pageViews: (stats as { sessions: number; pageViews: number }).pageViews
    }));

  return {
    totalSessions,
    uniqueVisitors,
    totalPageViews,
    averageSessionDuration: avgDuration,
    bounceRate,
    topPages,
    trafficSources,
    geoData,
    deviceData,
    dailyTraffic
  };
}