import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearEntered } from '../App';
import { GoogleIcon } from './AuthNav';
import { Icon } from './icons';
import { PGButton, PGIconBtn } from './primitives';
import { useLogout, useMe } from '../lib/queries';
export function SettingsMenu() {
    const me = useMe();
    const logout = useLogout();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const onPointerDown = (event) => {
            if (ref.current && !ref.current.contains(event.target))
                setOpen(false);
        };
        window.addEventListener('pointerdown', onPointerDown);
        return () => window.removeEventListener('pointerdown', onPointerDown);
    }, [open]);
    const authed = me.data && !me.data.anonymous ? me.data : null;
    return (_jsxs("div", { ref: ref, style: { position: 'relative' }, children: [_jsx(PGIconBtn, { icon: _jsx(Icon.Settings, { s: 18 }), label: "Settings", onClick: () => setOpen((v) => !v) }), open && (_jsx("div", { style: {
                    position: 'absolute',
                    top: 44,
                    left: 0,
                    zIndex: 30,
                    width: 240,
                    background: 'var(--surface)',
                    border: '2px solid var(--hairline-strong)',
                    borderBottomWidth: 4,
                    borderRadius: 16,
                    padding: 12,
                    boxShadow: '0 12px 24px rgba(60,60,60,0.16)',
                }, children: authed ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "t-eyebrow", style: { marginBottom: 4 }, children: "Signed in" }), _jsx("div", { className: "t-body-sm", style: { color: 'var(--ink)', overflowWrap: 'anywhere', marginBottom: 10 }, children: authed.email }), _jsx(PGButton, { variant: "secondary", size: "sm", fullWidth: true, icon: _jsx(Icon.Close, { s: 13 }), disabled: logout.isPending, onClick: () => {
                                logout.mutate(undefined, {
                                    onSuccess: () => {
                                        clearEntered();
                                        setOpen(false);
                                        navigate('/');
                                    },
                                });
                            }, children: "Sign out" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "t-eyebrow", style: { marginBottom: 4 }, children: "Account" }), _jsx("div", { className: "t-body-sm", style: { color: 'var(--ink-3)', marginBottom: 10 }, children: "Sign in to save your guides across devices." }), _jsx(PGButton, { variant: "primary", size: "sm", fullWidth: true, icon: _jsx(GoogleIcon, {}), onClick: () => window.location.assign('/api/auth/login/google?next=/app'), children: "Sign in with Google" })] })) }))] }));
}
