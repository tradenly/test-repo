import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

export interface TrafficOverview {
  totalVisitors: number;
  totalPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  uniqueVisitors: number;
  returningVisitors: number;
  newVisitors: number;
  topCountries: Array<{ country: string; visitors: number; percentage: number }>;
}

export interface RealTimeData {
  activeVisitors: number;
  recentActivity: Array<{
    id: string;
    timestamp: string;
    page: string;
    country: string;
    device: string;
    isNewVisitor: boolean;
  }>;
  currentPageViews: Array<{ page: string; viewers: number }>;
}

export interface GeographyData {
  countries: Array<{
    countryCode: string;
    countryName: string;
    visitors: number;
    pageViews: number;
    averageSessionDuration: number;
  }>;
  cities: Array<{
    city: string;
    country: string;
    visitors: number;
    percentage: number;
  }>;
}

export interface DeviceData {
  deviceTypes: Array<{ type: string; count: number; percentage: number }>;
  browsers: Array<{ browser: string; count: number; percentage: number }>;
  operatingSystems: Array<{ os: string; count: number; percentage: number }>;
  screenResolutions: Array<{ resolution: string; count: number; percentage: number }>;
}

export interface SourceData {
  trafficSources: Array<{
    sourceType: string;
    sourceName: string;
    visitors: number;
    percentage: number;
    bounceRate: number;
  }>;
  referrers: Array<{
    domain: string;
    visitors: number;
    percentage: number;
  }>;
  campaigns: Array<{
    campaign: string;
    source: string;
    visitors: number;
    conversions: number;
  }>;
}

export interface PageData {
  popularPages: Array<{
    path: string;
    title: string;
    pageViews: number;
    uniquePageViews: number;
    averageTimeOnPage: number;
    bounceRate: number;
    exitRate: number;
  }>;
  entryPages: Array<{
    path: string;
    entries: number;
    bounceRate: number;
  }>;
  exitPages: Array<{
    path: string;
    exits: number;
    exitRate: number;
  }>;
}

export interface SessionData {
  sessionDurations: Array<{ range: string; count: number }>;
  pageViewDistribution: Array<{ pages: string; sessions: number }>;
  hourlyActivity: Array<{ hour: number; sessions: number; pageViews: number }>;
  weeklyTrends: Array<{
    date: string;
    sessions: number;
    pageViews: number;
    uniqueVisitors: number;
  }>;
}

export interface TrafficAnalyticsData {
  overview: TrafficOverview;
  realTime: RealTimeData;
  geography: GeographyData;
  devices: DeviceData;
  sources: SourceData;
  pages: PageData;
  sessions: SessionData;
}

const fetchTrafficOverview = async (): Promise<TrafficOverview> => {
  const sevenDaysAgo = subDays(new Date(), 7);
  
  // Get total visitors (unique sessions)
  const { data: totalVisitorsData } = await supabase
    .from('visitor_sessions')
    .select('id', { count: 'exact' })
    .gte('start_time', sevenDaysAgo.toISOString());

  // Get total page views
  const { data: totalPageViewsData } = await supabase
    .from('page_views')
    .select('id', { count: 'exact' })
    .gte('view_time', sevenDaysAgo.toISOString());

  // Get session duration stats
  const { data: sessionDurationData } = await supabase
    .from('visitor_sessions')
    .select('duration_seconds')
    .gte('start_time', sevenDaysAgo.toISOString())
    .not('duration_seconds', 'is', null);

  const averageSessionDuration = sessionDurationData?.length 
    ? sessionDurationData.reduce((sum, session) => sum + (session.duration_seconds || 0), 0) / sessionDurationData.length
    : 0;

  // Get bounce rate
  const { data: bounceData } = await supabase
    .from('visitor_sessions')
    .select('is_bounce')
    .gte('start_time', sevenDaysAgo.toISOString());

  const bounceRate = bounceData?.length 
    ? (bounceData.filter(session => session.is_bounce).length / bounceData.length) * 100
    : 0;

  // Get unique visitors by IP
  const { data: uniqueVisitorsData } = await supabase
    .from('visitor_sessions')
    .select('ip_address')
    .gte('start_time', sevenDaysAgo.toISOString());

  const uniqueIPs = new Set(uniqueVisitorsData?.map(session => session.ip_address) || []);
  const uniqueVisitors = uniqueIPs.size;

  // Get returning vs new visitors (simplified - based on if user_id exists)
  const { data: returningVisitorsData } = await supabase
    .from('visitor_sessions')
    .select('user_id')
    .gte('start_time', sevenDaysAgo.toISOString())
    .not('user_id', 'is', null);

  const returningVisitors = returningVisitorsData?.length || 0;
  const totalSessions = totalVisitorsData?.length || 0;
  const newVisitors = totalSessions - returningVisitors;

  // Get top countries
  const { data: countriesData } = await supabase
    .from('visitor_analytics')
    .select('country_name, session_id')
    .gte('created_at', sevenDaysAgo.toISOString())
    .not('country_name', 'is', null);

  const countryCount = countriesData?.reduce((acc, item) => {
    acc[item.country_name] = (acc[item.country_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topCountries = Object.entries(countryCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([country, visitors]) => ({
      country,
      visitors,
      percentage: totalSessions ? (visitors / totalSessions) * 100 : 0
    }));

  return {
    totalVisitors: totalSessions,
    totalPageViews: totalPageViewsData?.length || 0,
    averageSessionDuration,
    bounceRate,
    uniqueVisitors,
    returningVisitors,
    newVisitors,
    topCountries
  };
};

const fetchRealTimeData = async (): Promise<RealTimeData> => {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  
  // Get active visitors (sessions active in last 15 minutes)
  const { data: activeVisitorsData } = await supabase
    .from('visitor_sessions')
    .select('id', { count: 'exact' })
    .gte('start_time', fifteenMinutesAgo.toISOString())
    .is('end_time', null);

  // Get recent activity
  const { data: recentActivityData } = await supabase
    .from('page_views')
    .select(`
      id,
      view_time,
      page_path,
      visitor_sessions!inner(
        user_id,
        visitor_analytics(country_name, device_type)
      )
    `)
    .gte('view_time', fifteenMinutesAgo.toISOString())
    .order('view_time', { ascending: false })
    .limit(20);

  const recentActivity = recentActivityData?.map(activity => ({
    id: activity.id,
    timestamp: activity.view_time,
    page: activity.page_path,
    country: activity.visitor_sessions?.visitor_analytics?.[0]?.country_name || 'Unknown',
    device: activity.visitor_sessions?.visitor_analytics?.[0]?.device_type || 'Unknown',
    isNewVisitor: !activity.visitor_sessions?.user_id
  })) || [];

  // Get current page views (simplified - just recent pages)
  const { data: currentPageViewsData } = await supabase
    .from('page_views')
    .select('page_path')
    .gte('view_time', fifteenMinutesAgo.toISOString());

  const pageViewCount = currentPageViewsData?.reduce((acc, item) => {
    acc[item.page_path] = (acc[item.page_path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const currentPageViews = Object.entries(pageViewCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([page, viewers]) => ({ page, viewers }));

  return {
    activeVisitors: activeVisitorsData?.length || 0,
    recentActivity,
    currentPageViews
  };
};

const fetchGeographyData = async (): Promise<GeographyData> => {
  const sevenDaysAgo = subDays(new Date(), 7);
  
  // Get countries data
  const { data: countriesRawData } = await supabase
    .from('visitor_analytics')
    .select(`
      country_code,
      country_name,
      session_id,
      visitor_sessions!inner(duration_seconds, page_count)
    `)
    .gte('created_at', sevenDaysAgo.toISOString())
    .not('country_name', 'is', null);

  const countryStats = countriesRawData?.reduce((acc, item) => {
    const key = item.country_code;
    if (!acc[key]) {
      acc[key] = {
        countryCode: item.country_code,
        countryName: item.country_name,
        visitors: 0,
        pageViews: 0,
        totalDuration: 0,
        sessionCount: 0
      };
    }
    acc[key].visitors += 1;
    acc[key].pageViews += item.visitor_sessions?.page_count || 0;
    acc[key].totalDuration += item.visitor_sessions?.duration_seconds || 0;
    acc[key].sessionCount += 1;
    return acc;
  }, {} as Record<string, any>) || {};

  const countries = Object.values(countryStats).map((country: any) => ({
    countryCode: country.countryCode,
    countryName: country.countryName,
    visitors: country.visitors,
    pageViews: country.pageViews,
    averageSessionDuration: country.sessionCount ? country.totalDuration / country.sessionCount : 0
  }));

  // Get cities data
  const { data: citiesRawData } = await supabase
    .from('visitor_analytics')
    .select('city, country_name, session_id')
    .gte('created_at', sevenDaysAgo.toISOString())
    .not('city', 'is', null);

  const cityCount = citiesRawData?.reduce((acc, item) => {
    const key = `${item.city}, ${item.country_name}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const totalCityVisitors = Object.values(cityCount).reduce((sum, count) => sum + count, 0);
  const cities = Object.entries(cityCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([cityCountry, visitors]) => {
      const [city, country] = cityCountry.split(', ');
      return {
        city,
        country,
        visitors,
        percentage: totalCityVisitors ? (visitors / totalCityVisitors) * 100 : 0
      };
    });

  return { countries, cities };
};

export const useTrafficAnalyticsData = () => {
  return useQuery({
    queryKey: ['traffic-analytics'],
    queryFn: async (): Promise<TrafficAnalyticsData> => {
      const [overview, realTime, geography] = await Promise.all([
        fetchTrafficOverview(),
        fetchRealTimeData(),
        fetchGeographyData()
      ]);

      // Mock data for other sections (can be implemented later)
      const devices: DeviceData = {
        deviceTypes: [],
        browsers: [],
        operatingSystems: [],
        screenResolutions: []
      };

      const sources: SourceData = {
        trafficSources: [],
        referrers: [],
        campaigns: []
      };

      const pages: PageData = {
        popularPages: [],
        entryPages: [],
        exitPages: []
      };

      const sessions: SessionData = {
        sessionDurations: [],
        pageViewDistribution: [],
        hourlyActivity: [],
        weeklyTrends: []
      };

      return {
        overview,
        realTime,
        geography,
        devices,
        sources,
        pages,
        sessions
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time data
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};