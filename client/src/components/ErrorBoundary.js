import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { PGButton, PGCard } from './primitives';
import { Sage } from './Sage';
export class ErrorBoundary extends Component {
    state = { error: null };
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, info) {
        // eslint-disable-next-line no-console
        console.error('Route error boundary caught:', error, info);
    }
    handleStartOver = () => {
        this.setState({ error: null });
        if (typeof window !== 'undefined') {
            window.location.assign('/app');
        }
    };
    render() {
        if (!this.state.error)
            return this.props.children;
        return (_jsxs("div", { className: "pg-shell", style: { padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }, children: [_jsx(Sage, { pose: "read", size: 120 }), _jsxs(PGCard, { thick: true, padding: 20, style: { width: '100%', textAlign: 'center' }, children: [_jsx("div", { className: "t-h2", style: { marginBottom: 8 }, children: "Something went sideways" }), _jsx("p", { className: "t-body-sm", style: { color: 'var(--ink-2)', margin: '0 0 16px' }, children: "We hit an unexpected snag. Let's start fresh from the home screen." }), _jsx(PGButton, { variant: "primary", size: "md", onClick: this.handleStartOver, fullWidth: true, children: "Start Over" })] })] }));
    }
}
