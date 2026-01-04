import { Component, ReactNode, ErrorInfo } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'global' | 'feature' | 'component'; // For different error handling
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle errors in the component tree
 * 
 * Usage:
 * <ErrorBoundary level="feature" onError={handleError}>
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error details
    this.setState({ errorInfo });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Send to error tracking service (Sentry, DataDog, etc.)
    this.logErrorToService(error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: Implement error tracking service
    // Example with Sentry:
    // captureException(error, {
    //   contexts: {
    //     react: {
    //       componentStack: errorInfo.componentStack,
    //     },
    //   },
    //   level: this.props.level === 'global' ? 'fatal' : 'error',
    // });

    console.error('[ErrorBoundary]', {
      level: this.props.level,
      error: error.message,
      timestamp: new Date().toISOString(),
      componentStack: errorInfo.componentStack,
    });
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <DefaultErrorFallback
            error={this.state.error}
            level={this.props.level || 'component'}
            onReset={this.handleReset}
          />
        )
      );
    }

    return this.props.children;
  }
}

// Default fallback UI
function DefaultErrorFallback({
  error,
  level,
  onReset,
}: {
  error: Error | null;
  level: 'global' | 'feature' | 'component';
  onReset: () => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center',
        alignItems: 'center',
        minHeight: level === 'global' ? '100vh' : '200px',
        justifyContent: 'center',
        background: level === 'global' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.05)',
        borderRadius: level === 'global' ? 0 : '8px',
        border: level === 'global' ? 'none' : '1px solid rgba(255, 0, 0, 0.2)',
      }}
    >
      <h1 style={{ color: '#ff6b6b', margin: 0 }}>
        {level === 'global' ? '⚠️ Application Error' : '❌ Something Went Wrong'}
      </h1>
      
      <p style={{ color: '#888', marginTop: '0.5rem' }}>
        {error?.message || 'An unexpected error occurred'}
      </p>

      {process.env.NODE_ENV === 'development' && (
        <details
          style={{
            marginTop: '1rem',
            textAlign: 'left',
            maxWidth: '600px',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1rem',
            borderRadius: '4px',
            color: '#aaa',
            fontSize: '0.875rem',
          }}
        >
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Error Details (Dev Only)
          </summary>
          <pre style={{ overflow: 'auto', marginTop: '0.5rem' }}>
            {error?.stack}
          </pre>
        </details>
      )}

      <button
        onClick={onReset}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1.5rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.875rem',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = '#5a6fd8';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = '#667eea';
        }}
      >
        {level === 'global' ? 'Reload Application' : 'Try Again'}
      </button>

      {level === 'global' && (
        <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '1rem' }}>
          If this problem persists, please contact support.
        </p>
      )}
    </div>
  );
}

export default ErrorBoundary;