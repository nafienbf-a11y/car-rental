import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#18181b', color: '#ef4444', fontFamily: 'monospace', minHeight: '100vh', boxSizing: 'border-box' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Application Crash Detected</h1>
          <p style={{ color: '#a1a1aa' }}>An unexpected error occurred in the React application rendering lifecycle.</p>
          
          <div style={{ marginTop: '20px', backgroundColor: '#09090b', padding: '15px', borderRadius: '8px', border: '1px solid #27272a', overflowX: 'auto' }}>
            <h3 style={{ color: '#f4f4f5', margin: '0 0 10px 0' }}>Error Message:</h3>
            <pre style={{ margin: 0, color: '#f87171', whiteSpace: 'pre-wrap' }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </div>
          
          {this.state.errorInfo && (
            <div style={{ marginTop: '20px', backgroundColor: '#09090b', padding: '15px', borderRadius: '8px', border: '1px solid #27272a', overflowX: 'auto' }}>
              <h3 style={{ color: '#f4f4f5', margin: '0 0 10px 0' }}>Component Stack Trace:</h3>
              <pre style={{ margin: 0, color: '#fb923c', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
          
          {this.state.error && this.state.error.stack && (
            <div style={{ marginTop: '20px', backgroundColor: '#09090b', padding: '15px', borderRadius: '8px', border: '1px solid #27272a', overflowX: 'auto' }}>
              <h3 style={{ color: '#f4f4f5', margin: '0 0 10px 0' }}>Error Stack:</h3>
              <pre style={{ margin: 0, color: '#a1a1aa', whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                {this.state.error.stack}
              </pre>
            </div>
          )}
          
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Clear LocalStorage & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
