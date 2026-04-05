'use client';

import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3 max-w-sm">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
            <h2 className="text-base font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">{this.state.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => this.setState({ hasError: false, message: '' })}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Try again
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
