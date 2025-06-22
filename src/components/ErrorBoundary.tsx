
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { logger } from "@/utils/logger";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Error caught by boundary:', error);
    logger.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="bg-gray-800/40 border-gray-700" role="alert" aria-labelledby="error-title">
          <CardHeader>
            <CardTitle id="error-title" className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              We encountered an error while loading this section. Please try refreshing the page.
            </p>
            {this.state.error && (
              <p className="text-sm text-gray-500 mt-2">
                Error: {this.state.error.message}
              </p>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              aria-label="Refresh the page"
            >
              Refresh Page
            </button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
