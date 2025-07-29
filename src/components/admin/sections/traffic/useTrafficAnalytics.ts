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
  
  // Fix average duration calculation
  const sessionsWithDuration = sessions.filter(s => s.duration_seconds && s.duration_seconds > 0);
  const avgDuration = sessionsWithDuration.length > 0 
    ? Math.round(sessionsWithDuration.reduce((sum, s) => sum + s.duration_seconds, 0) / sessionsWithDuration.length)
    : 0;
  
  // Fix bounce rate - only sessions with page_count <= 1 OR is_bounce = true
  const bounces = sessions.filter(s => s.is_bounce === true || s.page_count <= 1).length;
  const bounceRate = totalSessions > 0 ? Math.round((bounces / totalSessions) * 100) : 0;

  // Process top pages with proper null handling
  const pageStats = pageViews.reduce((acc, pv) => {
    let page = pv.page_path || '/';
    // Clean up the page path - remove query parameters and tokens
    page = page.split('?')[0];
    if (page.length > 50) {
      page = page.substring(0, 47) + '...';
    }
    acc[page] = (acc[page] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPages = Object.entries(pageStats)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 10)
    .map(([page, views]) => ({
      page,
      views: views as number,
      percentage: totalPageViews > 0 ? ((views as number) / totalPageViews) * 100 : 0
    }));

  // Process traffic sources with improved logic
  const sourceStats = sessions.reduce((acc, session) => {
    let source = 'Direct';
    
    if (session.utm_source) {
      source = session.utm_source;
    } else if (session.referrer && session.referrer.trim() !== '') {
      try {
        const url = new URL(session.referrer);
        const domain = url.hostname.toLowerCase();
        
        // Filter out internal referrers
        if (domain.includes('lovable') || domain === window.location.hostname) {
          source = 'Internal';
        } else {
          // Map common domains to readable names
          if (domain.includes('google')) source = 'Google';
          else if (domain.includes('facebook')) source = 'Facebook';
          else if (domain.includes('twitter') || domain.includes('x.com')) source = 'Twitter/X';
          else if (domain.includes('linkedin')) source = 'LinkedIn';
          else if (domain.includes('youtube')) source = 'YouTube';
          else if (domain.includes('instagram')) source = 'Instagram';
          else if (domain.includes('reddit')) source = 'Reddit';
          else if (domain.includes('github')) source = 'GitHub';
          else source = domain.replace('www.', '');
        }
      } catch {
        source = 'Referral';
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
      percentage: totalSessions > 0 ? ((sessionCount as number) / totalSessions) * 100 : 0
    }));

  // Process geographic data with proper totals
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
      percentage: totalSessions > 0 ? ((sessionCount as number) / totalSessions) * 100 : 0
    }));

  // Process device data with proper totals
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
      percentage: totalSessions > 0 ? ((sessionCount as number) / totalSessions) * 100 : 0
    }));

  // Process daily traffic - use start_time for sessions
  const dailyStats = sessions.reduce((acc, session) => {
    const date = format(new Date(session.start_time || session.created_at), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { sessions: 0, pageViews: 0 };
    }
    acc[date].sessions += 1;
    return acc;
  }, {} as Record<string, { sessions: number; pageViews: number }>);

  // Add page views to daily stats
  pageViews.forEach(pv => {
    const date = format(new Date(pv.view_time || pv.created_at), 'yyyy-MM-dd');
    if (!dailyStats[date]) {
      dailyStats[date] = { sessions: 0, pageViews: 0 };
    }
    dailyStats[date].pageViews += 1;
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