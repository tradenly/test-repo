import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedUser } from './useUnifiedAuth';

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

class TrafficTracker {
  public sessionId: string;
  private startTime: number;
  private lastPageTime: number;
  private pageViews: number;
  private currentPath: string;
  private maxScrollDepth: number;
  private interactions: number;
  private isTracking: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.lastPageTime = Date.now();
    this.pageViews = 0;
    this.currentPath = '';
    this.maxScrollDepth = 0;
    this.interactions = 0;
    this.isTracking = true;

    this.setupEventListeners();
    this.setupSessionTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners() {
    // Track scroll depth
    const handleScroll = () => {
      if (!this.isTracking) return;
      
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent || 0);
    };

    // Track user interactions
    const handleInteraction = () => {
      if (!this.isTracking) return;
      this.interactions++;
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleInteraction, { passive: true });
    window.addEventListener('keydown', handleInteraction, { passive: true });
    window.addEventListener('touchstart', handleInteraction, { passive: true });

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }

  private setupSessionTracking() {
    // Track session end on page unload
    const handleBeforeUnload = () => {
      this.endSession();
    };

    // Track session end on visibility change (when tab becomes hidden)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.sendCurrentPageView();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic session updates (every 30 seconds)
    const sessionInterval = setInterval(() => {
      if (this.isTracking) {
        this.sendHeartbeat();
      }
    }, 30000);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(sessionInterval);
    };
  }

  async trackPageView(path: string, title?: string, userId?: string) {
    if (!this.isTracking) return;

    // Send previous page view data if exists
    if (this.currentPath && this.currentPath !== path) {
      await this.sendCurrentPageView();
    }

    // Update tracking state
    this.currentPath = path;
    this.lastPageTime = Date.now();
    this.pageViews++;
    this.maxScrollDepth = 0;
    this.interactions = 0;

    // Get UTM parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {
      source: urlParams.get('utm_source') || undefined,
      medium: urlParams.get('utm_medium') || undefined,
      campaign: urlParams.get('utm_campaign') || undefined,
      term: urlParams.get('utm_term') || undefined,
      content: urlParams.get('utm_content') || undefined,
    };

    // Prepare tracking data
    const trackingData: TrackingData = {
      sessionId: this.sessionId,
      userId,
      pageView: {
        path,
        title: title || document.title,
        timeOnPage: 0, // Will be updated when leaving page
        scrollDepth: 0,
        interactions: 0,
      },
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined,
      utmParams: Object.values(utmParams).some(Boolean) ? utmParams : undefined,
    };

    try {
      await supabase.functions.invoke('track-visitor', {
        body: trackingData,
      });
    } catch (error) {
      // Silently handle tracking errors to not break the app
      console.warn('Traffic tracking error:', error);
    }
  }

  private async sendCurrentPageView() {
    if (!this.currentPath) return;

    const timeOnPage = Math.round((Date.now() - this.lastPageTime) / 1000);
    
    const trackingData: TrackingData = {
      sessionId: this.sessionId,
      pageView: {
        path: this.currentPath,
        timeOnPage,
        scrollDepth: this.maxScrollDepth,
        interactions: this.interactions,
      },
      userAgent: navigator.userAgent,
    };

    try {
      await supabase.functions.invoke('track-visitor', {
        body: trackingData,
      });
    } catch (error) {
      // Silently handle tracking errors to not break the app
      console.warn('Traffic tracking update error:', error);
    }
  }

  private async sendHeartbeat() {
    // Just a simple heartbeat to keep session active
    // Could be used for real-time visitor tracking
  }

  private async endSession() {
    if (!this.isTracking) return;

    await this.sendCurrentPageView();

    const sessionDuration = Math.round((Date.now() - this.startTime) / 1000);
    
    const trackingData: TrackingData = {
      sessionId: this.sessionId,
      sessionEnd: {
        duration: sessionDuration,
        pageCount: this.pageViews,
      },
      userAgent: navigator.userAgent,
    };

    try {
      await supabase.functions.invoke('track-visitor', {
        body: trackingData,
      });
    } catch (error) {
      // Silently handle tracking errors to not break the app
      console.warn('Session end tracking error:', error);
    }

    this.isTracking = false;
  }

  updateUserId(userId: string) {
    // Update the current session with user ID when user logs in
    const trackingData: TrackingData = {
      sessionId: this.sessionId,
      userId,
      userAgent: navigator.userAgent,
    };

    supabase.functions.invoke('track-visitor', {
      body: trackingData,
    }).catch(error => {
      // Silently handle tracking errors to not break the app
      console.warn('User ID update tracking error:', error);
    });
  }
}

let globalTracker: TrafficTracker | null = null;

export const useTrafficAnalytics = (user?: UnifiedUser | null) => {
  const location = useLocation();
  const trackerRef = useRef<TrafficTracker | null>(null);

  // Initialize tracker
  useEffect(() => {
    if (!globalTracker) {
      globalTracker = new TrafficTracker();
    }
    trackerRef.current = globalTracker;

    return () => {
      // Don't destroy global tracker on component unmount
    };
  }, []);

  // Track route changes
  useEffect(() => {
    if (trackerRef.current) {
      const path = location.pathname + location.search;
      trackerRef.current.trackPageView(path, document.title, user?.id);
    }
  }, [location.pathname, location.search, user?.id]);

  // Update user ID when user logs in/out
  useEffect(() => {
    if (trackerRef.current && user?.id) {
      trackerRef.current.updateUserId(user.id);
    }
  }, [user?.id]);

  const trackCustomEvent = useCallback((eventName: string, data?: any) => {
    // Could be extended for custom event tracking
    console.log('Custom event tracked:', eventName, data);
  }, []);

  return {
    trackCustomEvent,
    sessionId: trackerRef.current?.sessionId,
  };
};
