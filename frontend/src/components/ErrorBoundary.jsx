import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-4xl text-red-500">error</span>
                        </div>
                        <h1 className="text-2xl font-black mb-2">Something went wrong</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            The page encountered an error. This may be due to a temporary server issue.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => { this.setState({ hasError: false, error: null }); }}
                                className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">refresh</span>
                                Try Again
                            </button>
                            <button
                                onClick={() => { window.location.href = '/'; }}
                                className="border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Go Home
                            </button>
                        </div>
                        {this.state.error && (
                            <details className="mt-6 text-left bg-slate-100 dark:bg-slate-900 rounded-xl p-4">
                                <summary className="text-xs font-bold text-slate-400 cursor-pointer">Error Details</summary>
                                <pre className="mt-2 text-xs text-red-500 overflow-auto whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
