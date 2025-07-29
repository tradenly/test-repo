import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

interface SessionData {
  sessionId: string;
  startTime: Date;
  pageCount: number;
  lastPageView: Date;
}

interface TrafficTracking {
  sessionData: SessionData | null;
  trackPageView: (pagePath: string, pageTitle?: string) => void;
  endSession: () => void;
}

// Session storage keys
const SESSION_KEY = 'visitor_session_data';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export const useTrafficTracking = (): TrafficTracking => {
  const location = useLocation();
  const sessionRef = useRef<SessionData | null>(null);
  const lastPageViewRef = useRef<string>('');
  const pageStartTimeRef = useRef<Date>(new Date());
  const visibilityTimeRef = useRef<number>(0);

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get or create session
  const getSession = useCallback(async (): Promise<SessionData> => {
    const stored = localStorage.getItem(SESSION_KEY);
    const now = new Date();

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const lastActivity = new Date(parsed.lastPageView);
        
        // Check if session is still valid (within 30 minutes)
        if (now.getTime() - lastActivity.getTime() < SESSION_DURATION) {
          const sessionData = {
            ...parsed,
            startTime: new Date(parsed.startTime),
            lastPageView: new Date(parsed.lastPageView)
          };
          sessionRef.current = sessionData;
          return sessionData;
        }
      } catch (error) {
        console.error('Error parsing stored session:', error);
      }
    }

    // Create new session
    const newSession: SessionData = {
      sessionId: generateSessionId(),
      startTime: now,
      pageCount: 0,
      lastPageView: now
    };

    sessionRef.current = newSession;
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

    // Create session in database
    await createDatabaseSession(newSession);
    
    return newSession;
  }, [generateSessionId]);

  // Create database session record
  const createDatabaseSession = async (sessionData: SessionData) => {
    try {
      const userAgent = navigator.userAgent;
      const referrer = document.referrer;
      
      // Extract UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');
      const utmTerm = urlParams.get('utm_term');
      const utmContent = urlParams.get('utm_content');

      // Use a fallback IP address since we can't reliably get client IP from browser
      const fallbackIP = '0.0.0.0';

      const { error: sessionError } = await supabase.from('visitor_sessions').insert({
        session_id: sessionData.sessionId,
        ip_address: fallbackIP,
        user_agent: userAgent,
        start_time: sessionData.startTime.toISOString(),
        referrer: referrer || null,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_term: utmTerm,
        utm_content: utmContent,
        page_count: 0,
        is_bounce: true // Will be updated later
      });

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return;
      }

      // Create visitor analytics record
      await createVisitorAnalytics(sessionData.sessionId);
    } catch (error) {
      console.error('Error creating database session:', error);
    }
  };

  // Create visitor analytics record  
  const createVisitorAnalytics = async (sessionId: string) => {
    try {
      // Get device and browser information
      const deviceInfo = {
        is_mobile: /Mobi|Android/i.test(navigator.userAgent),
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // Get browser and OS info
      const browserInfo = getBrowserInfo();
      const osInfo = getOSInfo();

      // Fallback geographic data based on browser timezone and language
      const locale = navigator.language || 'en-US';
      const country = locale.includes('-') ? locale.split('-')[1] : 'US';
      const countryNames: Record<string, string> = {
        'US': 'United States',
        'GB': 'United Kingdom', 
        'CA': 'Canada',
        'AU': 'Australia',
        'DE': 'Germany',
        'FR': 'France',
        'ES': 'Spain',
        'IT': 'Italy',
        'JP': 'Japan',
        'CN': 'China',
        'IN': 'India',
        'BR': 'Brazil',
        'MX': 'Mexico'
      };

      const { error: analyticsError } = await supabase.from('visitor_analytics').insert({
        session_id: sessionId,
        country_code: country,
        country_name: countryNames[country] || 'Unknown',
        region: null,
        city: null,
        timezone: deviceInfo.timezone,
        latitude: null,
        longitude: null,
        isp: null,
        device_type: deviceInfo.is_mobile ? 'Mobile' : 'Desktop',
        browser_name: browserInfo.name,
        browser_version: browserInfo.version,
        os_name: osInfo.name,
        os_version: osInfo.version,
        screen_resolution: deviceInfo.screen_resolution,
        viewport_size: deviceInfo.viewport_size,
        is_mobile: deviceInfo.is_mobile,
        is_bot: /bot|crawler|spider/i.test(navigator.userAgent)
      });

      if (analyticsError) {
        console.error('Error creating visitor analytics:', analyticsError);
      }
    } catch (error) {
      console.error('Error creating visitor analytics:', error);
    }
  };

  // Track page view
  const trackPageView = useCallback(async (pagePath: string, pageTitle?: string) => {
    try {
      const session = await getSession();
      const now = new Date();

      // Update previous page view end time if exists
      if (lastPageViewRef.current) {
        const timeOnPage = Math.floor((now.getTime() - pageStartTimeRef.current.getTime()) / 1000);
        await updatePageViewEndTime(lastPageViewRef.current, timeOnPage);
      }

      // Create new page view record
      const { data, error } = await supabase.from('page_views').insert({
        session_id: session.sessionId,
        page_path: pagePath,
        page_title: pageTitle || document.title,
        view_time: now.toISOString(),
        scroll_depth_percent: 0,
        interactions_count: 0,
        exit_page: false
      }).select().single();

      if (error) throw error;

      // Update session
      session.pageCount += 1;
      session.lastPageView = now;
      sessionRef.current = session;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      // Update database session
      await supabase.from('visitor_sessions')
        .update({
          page_count: session.pageCount,
          is_bounce: session.pageCount === 1,
          updated_at: now.toISOString()
        })
        .eq('session_id', session.sessionId);

      lastPageViewRef.current = data.id;
      pageStartTimeRef.current = now;
      
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, [getSession]);

  // Update page view end time
  const updatePageViewEndTime = async (pageViewId: string, timeOnPage: number) => {
    try {
      await supabase.from('page_views')
        .update({
          time_on_page_seconds: timeOnPage,
          exit_page: true
        })
        .eq('id', pageViewId);
    } catch (error) {
      console.error('Error updating page view end time:', error);
    }
  };

  // End session
  const endSession = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;

    try {
      const now = new Date();
      const duration = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);

      // Update final page view
      if (lastPageViewRef.current) {
        const timeOnPage = Math.floor((now.getTime() - pageStartTimeRef.current.getTime()) / 1000);
        await updatePageViewEndTime(lastPageViewRef.current, timeOnPage);
      }

      // Update session end time
      await supabase.from('visitor_sessions')
        .update({
          end_time: now.toISOString(),
          duration_seconds: duration,
          updated_at: now.toISOString()
        })
        .eq('session_id', session.sessionId);

      // Clear session
      localStorage.removeItem(SESSION_KEY);
      sessionRef.current = null;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, []);

  // Track page changes
  useEffect(() => {
    const pagePath = location.pathname + location.search;
    trackPageView(pagePath);
  }, [location, trackPageView]);

  // Track scroll depth
  useEffect(() => {
    let maxScrollDepth = 0;
    
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      
      if (scrollPercent > maxScrollDepth) {
        maxScrollDepth = scrollPercent;
        
        // Update current page view with scroll depth
        if (lastPageViewRef.current) {
          supabase.from('page_views')
            .update({ scroll_depth_percent: maxScrollDepth })
            .eq('id', lastPageViewRef.current);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track interactions
  useEffect(() => {
    let interactionCount = 0;
    
    const trackInteraction = () => {
      interactionCount++;
      
      if (lastPageViewRef.current) {
        supabase.from('page_views')
          .update({ interactions_count: interactionCount })
          .eq('id', lastPageViewRef.current);
      }
    };

    // Track clicks, key presses, and mouse movements (throttled)
    let lastInteraction = 0;
    const throttledTrackInteraction = () => {
      const now = Date.now();
      if (now - lastInteraction > 5000) { // Throttle to once per 5 seconds
        lastInteraction = now;
        trackInteraction();
      }
    };

    document.addEventListener('click', trackInteraction);
    document.addEventListener('keydown', trackInteraction);
    document.addEventListener('mousemove', throttledTrackInteraction);

    return () => {
      document.removeEventListener('click', trackInteraction);
      document.removeEventListener('keydown', trackInteraction);
      document.removeEventListener('mousemove', throttledTrackInteraction);
    };
  }, []);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      endSession();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        visibilityTimeRef.current = Date.now();
      } else {
        // If page was hidden for more than 30 minutes, end session
        if (visibilityTimeRef.current && Date.now() - visibilityTimeRef.current > SESSION_DURATION) {
          endSession();
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [endSession]);

  return {
    sessionData: sessionRef.current,
    trackPageView,
    endSession
  };
};

// Helper functions for browser/OS detection
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Unknown';
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || 'Unknown';
  }

  return { name: browserName, version: browserVersion };
}

function getOSInfo() {
  const userAgent = navigator.userAgent;
  let osName = 'Unknown';
  let osVersion = 'Unknown';

  if (userAgent.indexOf('Windows') > -1) {
    osName = 'Windows';
    if (userAgent.indexOf('Windows NT 10') > -1) osVersion = '10';
    else if (userAgent.indexOf('Windows NT 6.3') > -1) osVersion = '8.1';
    else if (userAgent.indexOf('Windows NT 6.2') > -1) osVersion = '8';
    else if (userAgent.indexOf('Windows NT 6.1') > -1) osVersion = '7';
  } else if (userAgent.indexOf('Mac') > -1) {
    osName = 'macOS';
    const match = userAgent.match(/Mac OS X ([0-9_]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  } else if (userAgent.indexOf('Linux') > -1) {
    osName = 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    osName = 'Android';
    const match = userAgent.match(/Android ([0-9.]+)/);
    if (match) osVersion = match[1];
  } else if (userAgent.indexOf('iOS') > -1) {
    osName = 'iOS';
    const match = userAgent.match(/OS ([0-9_]+)/);
    if (match) osVersion = match[1].replace(/_/g, '.');
  }

  return { name: osName, version: osVersion };
}