import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-2xl text-center space-y-6 animate-in fade-in-0 zoom-in-95">
            
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Something Went Wrong
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                An unexpected error occurred while loading this section of the application.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                className="gap-2 text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  this.handleReset();
                  window.location.href = '/dashboard';
                }}
                className="gap-2 text-xs font-bold cursor-pointer bg-primary text-primary-foreground"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Go to Dashboard</span>
              </Button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
