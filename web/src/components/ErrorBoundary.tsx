'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
  eventId: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const eventId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      eventId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      eventId: this.state.eventId
    };

    console.error('ErrorBoundary caught an error:', errorDetails);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(errorDetails);
    }
    
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.props.resetOnPropsChange && 
        prevProps.children !== this.props.children &&
        this.state.hasError) {
      this.resetError();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      window.clearTimeout(this.resetTimeoutId);
    }
  }

  logErrorToService = (errorDetails: any) => {
    // In a real app, you'd send this to your error tracking service
    // like Sentry, Bugsnag, LogRocket, etc.
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorDetails)
    }).catch(() => {
      // Silently fail if logging service is down
    });
  };

  resetError = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null
    });
  };

  retryWithDelay = (delay: number = 3000) => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.resetError();
    }, delay);
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
            eventId={this.state.eventId}
          />
        );
      }

      return <DefaultErrorFallback {...this.state} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo, 
  resetError, 
  eventId 
}) => {
  const [isReporting, setIsReporting] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const sendErrorReport = async () => {
    setIsReporting(true);
    try {
      // Simulate error reporting
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReportSent(true);
    } catch (err) {
      console.error('Failed to send error report:', err);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-zinc-950 to-purple-900/10" />
      <motion.div
        className="absolute top-20 left-20 w-40 h-40 bg-red-500/5 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      
      <motion.div
        className="text-center max-w-lg mx-auto relative z-10"
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Error Icon */}
        <motion.div
          className="relative inline-block mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="text-7xl">⚠️</div>
          <motion.div
            className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            Oops! Something went wrong
          </h2>
          <p className="text-zinc-400 mb-2 leading-relaxed">
            We encountered an unexpected error while loading this section.
            <br />
            Our AI engineers have been notified.
          </p>
          {eventId && (
            <p className="text-zinc-600 text-sm mb-6">
              Error ID: <code className="bg-zinc-800 px-2 py-1 rounded text-red-400">{eventId}</code>
            </p>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            className="glass px-6 py-3 text-white font-medium rounded-full border border-purple-500/50 hover:border-purple-400 bg-purple-600/20 flex items-center gap-2"
            onClick={resetError}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </motion.button>

          <motion.button
            className="glass px-6 py-3 text-zinc-300 font-medium rounded-full border border-zinc-600/50 hover:border-zinc-500 bg-zinc-800/20 flex items-center gap-2"
            onClick={() => window.location.href = '/'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </motion.button>
        </motion.div>

        {/* Report Error */}
        {!reportSent && (
          <motion.button
            className="text-zinc-500 hover:text-zinc-300 text-sm font-medium flex items-center gap-1 mx-auto"
            onClick={sendErrorReport}
            disabled={isReporting}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {isReporting ? (
              <>
                <div className="w-3 h-3 border border-zinc-500 border-t-transparent rounded-full animate-spin" />
                Sending report...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Report this error
              </>
            )}
          </motion.button>
        )}

        {reportSent && (
          <motion.div
            className="text-green-400 text-sm flex items-center gap-1 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Error report sent successfully
          </motion.div>
        )}

        {/* Development Details */}
        {process.env.NODE_ENV === 'development' && error && (
          <motion.details
            className="mt-8 text-left"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <summary className="cursor-pointer text-zinc-500 hover:text-zinc-300 mb-2">
              🔍 Error Details (Development Mode)
            </summary>
            <div className="space-y-2">
              <div className="p-4 bg-zinc-900 rounded-lg text-xs overflow-auto">
                <div className="text-red-400 font-medium mb-2">Error Message:</div>
                <div className="text-red-300 mb-4">{error.message}</div>
                <div className="text-red-400 font-medium mb-2">Stack Trace:</div>
                <pre className="text-red-300 whitespace-pre-wrap">{error.stack}</pre>
              </div>
              {errorInfo && (
                <div className="p-4 bg-zinc-900 rounded-lg text-xs overflow-auto">
                  <div className="text-orange-400 font-medium mb-2">Component Stack:</div>
                  <pre className="text-orange-300 whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                </div>
              )}
            </div>
          </motion.details>
        )}
      </motion.div>
    </div>
  );
};

// Additional error boundary variants
export const SectionErrorBoundary: React.FC<{ children: React.ReactNode; sectionName?: string }> = ({ 
  children, 
  sectionName = "section" 
}) => (
  <ErrorBoundary
    fallback={({ error, resetError }) => (
      <div className="py-16 px-6 text-center">
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-4xl mb-4">😵</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Failed to load {sectionName}
          </h3>
          <p className="text-zinc-400 mb-4">
            This section encountered an error and couldn't load properly.
          </p>
          <motion.button
            className="glass px-4 py-2 text-white text-sm font-medium rounded-full border border-purple-500/50"
            onClick={resetError}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retry
          </motion.button>
        </motion.div>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;