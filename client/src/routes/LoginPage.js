import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { markEntered } from '../App';
import { GoogleIcon } from '../components/AuthNav';
import { Sage } from '../components/Sage';
import { Icon } from '../components/icons';
import { PGButton } from '../components/primitives';
export default function LoginPage() {
    const navigate = useNavigate();
    const continueAsGuest = () => {
        markEntered();
        navigate('/app');
    };
    return (_jsxs("div", { className: "pg-shell login-shell", children: [_jsxs("div", { className: "polka-yellow", style: {
                    position: 'relative',
                    height: 280,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    borderBottom: '4px solid var(--yellow)',
                    overflow: 'hidden',
                }, children: [_jsx("button", { onClick: () => navigate(-1), "aria-label": "Back", style: {
                            position: 'absolute',
                            top: 18,
                            left: 18,
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            background: 'var(--surface)',
                            border: '2px solid var(--hairline-strong)',
                            boxShadow: '0 3px 0 var(--hairline)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 2,
                        }, children: _jsx(Icon.ArrowLeft, { s: 18 }) }), _jsx(AccentStar, {}), _jsx(AccentBolt, {}), _jsx("div", { style: { position: 'absolute', top: 130, left: 24, width: 18, height: 18, borderRadius: 4, background: 'var(--purple)', border: '2px solid var(--ink)', transform: 'rotate(20deg)' } }), _jsx("div", { style: { position: 'absolute', top: 160, right: 40, width: 14, height: 14, borderRadius: '50%', background: 'var(--green)', border: '2px solid var(--ink)' } }), _jsx("div", { style: { paddingBottom: 14 }, children: _jsx(Sage, { pose: "wave", size: 180 }) })] }), _jsxs("div", { style: { position: 'relative', marginTop: -22, marginLeft: 'auto', marginRight: 'auto', background: 'white', border: '2px solid var(--ink)', borderRadius: 18, padding: '10px 16px', boxShadow: '0 4px 0 var(--ink)', zIndex: 2 }, children: [_jsx("div", { style: { position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 14, height: 14, background: 'white', border: '2px solid var(--ink)', borderRight: 0, borderBottom: 0 } }), _jsx("div", { style: { fontWeight: 800, fontSize: 13, color: 'var(--ink)' }, children: "Welcome back, friend!" })] }), _jsxs("div", { className: "no-scrollbar", style: { flex: 1, overflowY: 'auto', padding: '22px 22px 28px' }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 22 }, children: [_jsx("h1", { className: "t-display", style: { margin: '0 0 6px', fontSize: 28 }, children: "Sign in to PocketGuru" }), _jsx("div", { className: "t-body-sm", style: { color: 'var(--ink-3)' }, children: "Keep every guide synced to your Google account." })] }), _jsxs("button", { className: "pg-btn", onClick: () => window.location.assign('/api/auth/login/google?next=/app'), style: {
                            width: '100%',
                            height: 54,
                            borderRadius: 14,
                            background: '#fff',
                            color: 'var(--ink)',
                            border: '2px solid var(--hairline-strong)',
                            boxShadow: '0 4px 0 var(--hairline-strong)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            fontSize: 14,
                            textTransform: 'none',
                            letterSpacing: 0,
                        }, children: [_jsx(GoogleIcon, {}), "Continue with Google"] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }, children: [_jsx("div", { style: { flex: 1, height: 2, background: 'var(--hairline)' } }), _jsx("span", { className: "t-mono", style: { color: 'var(--ink-3)', fontSize: 11 }, children: "OR" }), _jsx("div", { style: { flex: 1, height: 2, background: 'var(--hairline)' } })] }), _jsx(PGButton, { variant: "secondary", size: "lg", fullWidth: true, icon: _jsx(Icon.Camera, { s: 18 }), onClick: continueAsGuest, children: "Continue as guest" }), _jsx("div", { style: { marginTop: 18, textAlign: 'center' }, children: _jsx("button", { onClick: () => navigate('/'), style: { background: 'transparent', border: 0, color: 'var(--green-dark)', fontWeight: 900, cursor: 'pointer', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em' }, children: "See how PocketGuru works" }) })] })] }));
}
function AccentStar() {
    return (_jsx("div", { style: { position: 'absolute', top: 28, left: 78, transform: 'rotate(-12deg)', color: 'var(--pink)' }, children: _jsx(Icon.Star, { s: 34 }) }));
}
function AccentBolt() {
    return (_jsx("div", { style: { position: 'absolute', top: 50, right: 36, transform: 'rotate(18deg)' }, children: _jsx(Icon.Lightning, { s: 28 }) }));
}
