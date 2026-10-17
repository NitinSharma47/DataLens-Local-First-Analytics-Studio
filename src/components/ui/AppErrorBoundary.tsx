import { Component, type ErrorInfo, type ReactNode } from 'react';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('DataLens encountered a rendering error.', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="app-error" role="alert">
          <div className="app-error-card">
            <p className="eyebrow">DATALENS WORKSPACE</p>
            <h1>Something went wrong</h1>
            <p>Your local workspace is still on this device. Reload the app to try again.</p>
            <button className="button button--primary" type="button" onClick={() => window.location.reload()}>Reload DataLens</button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
