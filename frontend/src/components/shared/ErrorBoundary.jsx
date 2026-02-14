import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('❌ ErrorBoundary caught error:', error);
        console.error('❌ Error info:', errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="h-screen w-screen flex items-center justify-center bg-red-50">
                    <div className="max-w-2xl p-8 bg-white rounded-lg shadow-lg border-2 border-red-200">
                        <h1 className="text-2xl font-bold text-red-900 mb-4">
                            Something Went Wrong
                        </h1>
                        <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
                            <pre className="text-sm text-red-800 overflow-auto">
                                {this.state.error?.toString()}
                            </pre>
                        </div>
                        <details className="mb-4">
                            <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                                Technical Details
                            </summary>
                            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;