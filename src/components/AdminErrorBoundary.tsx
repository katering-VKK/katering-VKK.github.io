import React, { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  retryKey: number;
}

export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, retryKey: 0 };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState(prev => ({ hasError: false, retryKey: prev.retryKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen pt-20 px-6 flex flex-col items-center justify-center">
          <p className="text-gray-600 mb-4">Помилка завантаження адмінки</p>
          <div className="flex gap-4">
            <button onClick={this.handleRetry} className="text-violet-600 hover:underline">
              Спробувати знову
            </button>
            <button onClick={() => window.location.reload()} className="text-violet-600 hover:underline">
              Оновити сторінку
            </button>
          </div>
          <Link to="/" className="mt-4 text-gray-500 hover:text-black">
            На головну
          </Link>
        </div>
      );
    }
    return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
  }
}
