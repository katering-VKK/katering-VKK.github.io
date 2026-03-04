import React, { Component, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    setTimeout(() => window.location.reload(), 150);
  }

  render() {
    const { children } = (this as React.Component<Props, State>).props;
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Завантаження…</p>
          </div>
        </div>
      );
    }
    return children;
  }
}
