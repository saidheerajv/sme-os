import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Card, Button } from 'flowbite-react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex justify-center items-center h-screen p-2">
          <Card className="p-8 max-w-lg w-full text-center">
            <div className="flex flex-col items-center">
              <FaExclamationTriangle className="text-4xl text-red-500 mb-2" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <Button color="failure" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;