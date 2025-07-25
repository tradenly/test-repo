import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackingData {
  sessionId: string;
  userId?: string;
  pageView?: {
    path: string;
    title?: string;
    timeOnPage?: number;
    scrollDepth?: number;
    interactions?: number;
  };
  sessionEnd?: {
    duration: number;
    pageCount: number;
  };
  userAgent: string;
  referrer?: string;
  utmParams?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

interface DeviceInfo {
  deviceType: string;
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  screenResolution: string;
  viewportSize: string;
  isMobile: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: requestData } = await req.json();
    const trackingData: TrackingData = requestData;

    // Get client IP address
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    '127.0.0.1';

    // Parse user agent for device info
    const deviceInfo = parseUserAgent(trackingData.userAgent);

    // Get or create visitor session
    let sessionRecord = await getOrCreateSession(
      supabase, 
      trackingData.sessionId, 
      clientIP, 
      trackingData.userAgent,
      trackingData.referrer,
      trackingData.utmParams,
      trackingData.userId
    );

    // Get IP geolocation data
    const geoData = await getGeoLocation(clientIP);

    // Store analytics data
    await storeAnalyticsData(supabase, sessionRecord.id, geoData, deviceInfo);

    // Handle page view tracking
    if (trackingData.pageView) {
      await trackPageView(
        supabase,
        sessionRecord.id,
        trackingData.userId,
        trackingData.pageView
      );
    }

    // Handle session end tracking
    if (trackingData.sessionEnd) {
      await endSession(
        supabase,
        sessionRecord.id,
        trackingData.sessionEnd.duration,
        trackingData.sessionEnd.pageCount
      );
    }

    // Store traffic source data
    await storeTrafficSource(
      supabase,
      sessionRecord.id,
      trackingData.referrer,
      trackingData.utmParams
    );

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error tracking visitor:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function getOrCreateSession(
  supabase: any,
  sessionId: string,
  ipAddress: string,
  userAgent: string,
  referrer?: string,
  utmParams?: any,
  userId?: string
) {
  // Try to get existing session
  const { data: existingSession } = await supabase
    .from('visitor_sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (existingSession) {
    // Update user_id if user logged in
    if (userId && !existingSession.user_id) {
      await supabase
        .from('visitor_sessions')
        .update({ user_id: userId })
        .eq('id', existingSession.id);
      
      return { ...existingSession, user_id: userId };
    }
    return existingSession;
  }

  // Create new session
  const { data: newSession, error } = await supabase
    .from('visitor_sessions')
    .insert({
      session_id: sessionId,
      user_id: userId || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer: referrer || null,
      utm_source: utmParams?.source || null,
      utm_medium: utmParams?.medium || null,
      utm_campaign: utmParams?.campaign || null,
      utm_term: utmParams?.term || null,
      utm_content: utmParams?.content || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }

  return newSession;
}

async function getGeoLocation(ipAddress: string) {
  try {
    // Skip geolocation for localhost/development
    if (ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
      return {
        country_code: 'US',
        country_name: 'United States',
        region: 'Development',
        city: 'Localhost',
        timezone: 'America/New_York',
        latitude: 40.7128,
        longitude: -74.0060,
        isp: 'Local Development'
      };
    }

    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,timezone,lat,lon,isp,query`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country_code: data.countryCode,
        country_name: data.country,
        region: data.regionName,
        city: data.city,
        timezone: data.timezone,
        latitude: data.lat,
        longitude: data.lon,
        isp: data.isp
      };
    }
    
    throw new Error(data.message || 'Geolocation failed');
  } catch (error) {
    console.error('Geolocation error:', error);
    // Return default values if geolocation fails
    return {
      country_code: null,
      country_name: null,
      region: null,
      city: null,
      timezone: null,
      latitude: null,
      longitude: null,
      isp: null
    };
  }
}

function parseUserAgent(userAgent: string): DeviceInfo {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  let deviceType = 'desktop';
  if (/tablet|ipad/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (isMobile) {
    deviceType = 'mobile';
  }

  // Simple browser detection
  let browserName = 'Unknown';
  let browserVersion = '';
  
  if (userAgent.includes('Chrome/')) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.includes('Firefox/')) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Safari\/([0-9.]+)/)?.[1] || '';
  } else if (userAgent.includes('Edge/')) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || '';
  }

  // Simple OS detection
  let osName = 'Unknown';
  let osVersion = '';
  
  if (userAgent.includes('Windows NT')) {
    osName = 'Windows';
    osVersion = userAgent.match(/Windows NT ([0-9.]+)/)?.[1] || '';
  } else if (userAgent.includes('Mac OS X')) {
    osName = 'macOS';
    osVersion = userAgent.match(/Mac OS X ([0-9_.]+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (userAgent.includes('Linux')) {
    osName = 'Linux';
  } else if (userAgent.includes('Android')) {
    osName = 'Android';
    osVersion = userAgent.match(/Android ([0-9.]+)/)?.[1] || '';
  } else if (userAgent.includes('iPhone OS') || userAgent.includes('iOS')) {
    osName = 'iOS';
    osVersion = userAgent.match(/OS ([0-9_]+)/)?.[1]?.replace(/_/g, '.') || '';
  }

  return {
    deviceType,
    browserName,
    browserVersion,
    osName,
    osVersion,
    screenResolution: '',
    viewportSize: '',
    isMobile
  };
}

async function storeAnalyticsData(
  supabase: any,
  sessionId: string,
  geoData: any,
  deviceInfo: DeviceInfo
) {
  // Check if analytics data already exists for this session
  const { data: existing } = await supabase
    .from('visitor_analytics')
    .select('id')
    .eq('session_id', sessionId)
    .single();

  if (existing) {
    return; // Already stored
  }

  const { error } = await supabase
    .from('visitor_analytics')
    .insert({
      session_id: sessionId,
      ...geoData,
      ...deviceInfo,
      is_bot: /bot|crawler|spider/i.test(deviceInfo.browserName)
    });

  if (error) {
    console.error('Error storing analytics data:', error);
  }
}

async function trackPageView(
  supabase: any,
  sessionId: string,
  userId: string | undefined,
  pageView: any
) {
  const { error } = await supabase
    .from('page_views')
    .insert({
      session_id: sessionId,
      user_id: userId || null,
      page_path: pageView.path,
      page_title: pageView.title || null,
      time_on_page_seconds: pageView.timeOnPage || null,
      scroll_depth_percent: pageView.scrollDepth || 0,
      interactions_count: pageView.interactions || 0
    });

  if (error) {
    console.error('Error tracking page view:', error);
  }

  // Update session page count and bounce status
  await supabase
    .from('visitor_sessions')
    .update({
      page_count: supabase.raw('page_count + 1'),
      is_bounce: false
    })
    .eq('id', sessionId);
}

async function endSession(
  supabase: any,
  sessionId: string,
  duration: number,
  pageCount: number
) {
  const { error } = await supabase
    .from('visitor_sessions')
    .update({
      end_time: new Date().toISOString(),
      duration_seconds: duration,
      page_count: pageCount,
      is_bounce: pageCount <= 1
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Error ending session:', error);
  }
}

async function storeTrafficSource(
  supabase: any,
  sessionId: string,
  referrer?: string,
  utmParams?: any
) {
  // Check if traffic source already exists
  const { data: existing } = await supabase
    .from('traffic_sources')
    .select('id')
    .eq('session_id', sessionId)
    .single();

  if (existing) {
    return; // Already stored
  }

  let sourceType = 'direct';
  let sourceName = null;
  let referrerDomain = null;

  if (referrer) {
    try {
      const url = new URL(referrer);
      referrerDomain = url.hostname;
      
      // Classify traffic source
      if (url.hostname.includes('google')) {
        sourceType = 'search';
        sourceName = 'Google';
      } else if (url.hostname.includes('facebook')) {
        sourceType = 'social';
        sourceName = 'Facebook';
      } else if (url.hostname.includes('twitter') || url.hostname.includes('t.co')) {
        sourceType = 'social';
        sourceName = 'Twitter';
      } else if (url.hostname.includes('youtube')) {
        sourceType = 'social';
        sourceName = 'YouTube';
      } else if (url.hostname.includes('linkedin')) {
        sourceType = 'social';
        sourceName = 'LinkedIn';
      } else if (url.hostname.includes('instagram')) {
        sourceType = 'social';
        sourceName = 'Instagram';
      } else {
        sourceType = 'referral';
        sourceName = url.hostname;
      }
    } catch (error) {
      console.error('Error parsing referrer URL:', error);
    }
  }

  // Override with UTM parameters if present
  if (utmParams?.source) {
    sourceName = utmParams.source;
    if (utmParams.medium === 'email') {
      sourceType = 'email';
    } else if (utmParams.medium === 'social') {
      sourceType = 'social';
    } else if (utmParams.medium === 'cpc' || utmParams.medium === 'paid') {
      sourceType = 'campaign';
    }
  }

  const { error } = await supabase
    .from('traffic_sources')
    .insert({
      session_id: sessionId,
      source_type: sourceType,
      source_name: sourceName,
      referrer_domain: referrerDomain,
      campaign_id: utmParams?.campaign || null
    });

  if (error) {
    console.error('Error storing traffic source:', error);
  }
}