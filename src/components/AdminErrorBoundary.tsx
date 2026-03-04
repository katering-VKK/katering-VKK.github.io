import React, { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

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

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen pt-20 px-6 flex flex-col items-center justify-center">
          <p className="text-gray-600 mb-4">Помилка завантаження адмінки</p>
          <button onClick={() => this.setState({ hasError: false })} className="text-violet-600 hover:underline">
            Спробувати знову
          </button>
          <Link to="/" className="mt-4 text-gray-500 hover:text-black">
            На головну
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
