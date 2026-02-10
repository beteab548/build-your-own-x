'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#030406] text-white flex items-center justify-center p-6">
                    <div className="max-w-2xl w-full glass p-8 rounded-3xl border border-red-500/20">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-500/10 rounded-full">
                                <AlertTriangle size={48} className="text-red-500" />
                            </div>
                        </div>

                        {/* Error Title */}
                        <h1 className="text-3xl font-bold text-center mb-4 text-red-400">
                            Oops! Something Went Wrong
                        </h1>

                        {/* Error Message */}
                        <p className="text-gray-400 text-center mb-6">
                            The application encountered an unexpected error. This might be due to:
                        </p>

                        <ul className="text-sm text-gray-400 mb-8 space-y-2 bg-black/30 p-4 rounded-lg">
                            <li>• WebContainer initialization failure (browser compatibility issue)</li>
                            <li>• Monaco Editor loading error</li>
                            <li>• Network connectivity problem</li>
                            <li>• Browser extension interference</li>
                        </ul>

                        {/* Error Details (Collapsible) */}
                        {this.state.error && (
                            <details className="mb-8 bg-black/50 p-4 rounded-lg border border-white/5">
                                <summary className="cursor-pointer text-sm font-semibold text-gray-300 mb-2">
                                    Technical Details
                                </summary>
                                <div className="text-xs font-mono text-red-400 mt-2 overflow-auto max-h-40">
                                    <p className="mb-2">{this.state.error.toString()}</p>
                                    {this.state.errorInfo && (
                                        <pre className="text-gray-500">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </div>
                            </details>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-semibold"
                            >
                                <RefreshCw size={18} />
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                <Home size={18} />
                                Go Home
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="text-xs text-gray-500 text-center mt-8">
                            If this problem persists, try using a different browser or disabling browser extensions.
                            <br />
                            WebContainer requires Chrome, Edge, or Firefox with SharedArrayBuffer support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
