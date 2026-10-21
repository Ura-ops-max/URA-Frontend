import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * If one page crashes while drawing, show a short message instead of a blank
 * (or black) screen, and keep the rest of the app usable. Moving to another
 * page (a new resetKey) clears the error.
 */
export default class PageErrorBoundary extends Component<
  { children: ReactNode; resetKey?: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[page] crashed:', error, info.componentStack);
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h2 className="text-lg font-black text-gray-900">Something went wrong on this page</h2>
        <p className="mt-2 text-sm text-gray-500">
          Your money and orders are safe. Please reload the page. If it keeps happening, contact support.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
        >
          Reload
        </button>
      </div>
    );
  }
}
