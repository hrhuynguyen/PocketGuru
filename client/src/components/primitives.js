import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Icon } from './icons';
const TONE_BG = {
    green: { bg: 'var(--green-soft)', fg: 'var(--green-dark)' },
    yellow: { bg: 'var(--yellow-soft)', fg: '#7A5A00' },
    blue: { bg: 'var(--blue-soft)', fg: 'var(--blue-dark)' },
    pink: { bg: 'var(--pink-soft)', fg: '#A8235A' },
    purple: { bg: 'var(--purple-soft)', fg: '#6B2DAD' },
    orange: { bg: 'var(--orange-soft)', fg: '#9A5A00' },
    red: { bg: 'var(--red-soft)', fg: 'var(--red)' },
    neutral: { bg: 'var(--surface-2)', fg: 'var(--ink-2)' },
};
export function PGButton({ variant = 'primary', size = 'lg', icon, children, onClick, disabled, fullWidth, style = {}, }) {
    const heights = { sm: 40, md: 48, lg: 56 };
    const fontSize = { sm: 13, md: 14, lg: 15 };
    const padX = { sm: 14, md: 18, lg: 22 };
    const radius = { sm: 12, md: 14, lg: 16 };
    return (_jsxs("button", { onClick: onClick, disabled: disabled, className: `pg-btn pg-btn-${variant}`, style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            height: heights[size],
            padding: `0 ${padX[size]}px`,
            borderRadius: radius[size],
            fontSize: fontSize[size],
            fontWeight: 800,
            width: fullWidth ? '100%' : undefined,
            ...style,
        }, children: [icon, children] }));
}
export function PGCard({ children, padding = 16, style = {}, onClick, thick, }) {
    return (_jsx("div", { onClick: onClick, className: `pg-card${thick ? ' pg-card-thick' : ''}`, style: { padding, cursor: onClick ? 'pointer' : undefined, ...style }, children: children }));
}
export function PGBadge({ tone = 'green', children, style = {} }) {
    const t = TONE_BG[tone];
    return (_jsx("span", { style: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            height: 26,
            padding: '0 10px',
            borderRadius: 999,
            background: t.bg,
            color: t.fg,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            ...style,
        }, children: children }));
}
export function PGProgress({ value, max = 1, color = 'var(--green)', height = 16 }) {
    const pct = Math.min(100, (value / max) * 100);
    return (_jsx("div", { style: { width: '100%', height, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden', position: 'relative' }, children: _jsx("div", { style: {
                width: `${pct}%`,
                height: '100%',
                background: color,
                borderRadius: 999,
                transition: 'width 320ms cubic-bezier(.2,.7,.3,1)',
                position: 'relative',
            }, children: pct > 8 && (_jsx("div", { style: { position: 'absolute', top: 3, left: 6, right: 6, height: 4, background: 'rgba(255,255,255,0.45)', borderRadius: 999 } })) }) }));
}
export function PGThumb({ label = 'P. 1', size = 60, selected = false, onRemove }) {
    return (_jsxs("div", { style: { position: 'relative', width: size, height: size * 1.3, flexShrink: 0 }, children: [_jsxs("div", { style: {
                    width: '100%',
                    height: '100%',
                    borderRadius: 14,
                    background: 'var(--surface-2)',
                    border: selected ? '3px solid var(--green)' : '2px solid var(--hairline-strong)',
                    position: 'relative',
                    overflow: 'hidden',
                }, children: [_jsx("div", { style: {
                            position: 'absolute',
                            inset: '14% 12% 14% 12%',
                            background: 'repeating-linear-gradient(180deg, var(--ink-4) 0 1px, transparent 1px 7px)',
                            opacity: 0.4,
                        } }), _jsx("div", { style: { position: 'absolute', top: '10%', left: '12%', width: '60%', height: 3, background: 'var(--ink-3)', borderRadius: 2 } })] }), _jsx("div", { style: {
                    position: 'absolute',
                    bottom: 4,
                    left: 4,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: 'var(--ink-2)',
                    background: 'rgba(255,255,255,0.9)',
                    padding: '1px 4px',
                    borderRadius: 4,
                    fontWeight: 700,
                }, children: label }), onRemove && (_jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    onRemove();
                }, style: {
                    position: 'absolute',
                    top: -7,
                    right: -7,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--red)',
                    color: 'white',
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                }, children: _jsx(Icon.Close, { s: 12 }) }))] }));
}
export function PGDrawer({ open, onClose, children, title }) {
    if (!open)
        return null;
    return (_jsxs("div", { style: { position: 'absolute', inset: 0, zIndex: 60, animation: 'fadeIn 180ms ease' }, children: [_jsx("div", { onClick: onClose, style: { position: 'absolute', inset: 0, background: 'rgba(20,20,20,0.4)' } }), _jsxs("div", { style: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--surface)',
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    padding: '14px 20px 28px',
                    animation: 'drawerSlideUp 280ms cubic-bezier(.2,.7,.3,1)',
                    maxHeight: '78%',
                    overflowY: 'auto',
                }, children: [_jsx("div", { style: { width: 44, height: 5, background: 'var(--hairline-strong)', borderRadius: 3, margin: '4px auto 14px' } }), title && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, children: [_jsx("h3", { className: "t-h2", style: { margin: 0 }, children: title }), _jsx("button", { onClick: onClose, style: {
                                    background: 'var(--surface-2)',
                                    border: 0,
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--ink-2)',
                                }, children: _jsx(Icon.Close, { s: 16 }) })] })), children] })] }));
}
export function PGSkel({ w, h = 14, r = 8, style = {} }) {
    return _jsx("div", { className: "skeleton", style: { width: w, height: h, borderRadius: r, ...style } });
}
export function PGNav({ left, title, right }) {
    return (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px 12px',
            minHeight: 52,
            background: 'var(--surface)',
            borderBottom: '2px solid var(--hairline)',
        }, children: [_jsx("div", { style: { minWidth: 40, display: 'flex' }, children: left }), _jsx("div", { className: "t-h3", style: { flex: 1, textAlign: 'center' }, children: title }), _jsx("div", { style: { minWidth: 40, display: 'flex', justifyContent: 'flex-end', gap: 6 }, children: right })] }));
}
export function PGIconBtn({ icon, onClick, label }) {
    return (_jsx("button", { onClick: onClick, "aria-label": label, style: {
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'var(--surface-2)',
            color: 'var(--ink-2)',
            border: '2px solid var(--hairline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
        }, children: icon }));
}
