import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthNudge } from '../components/AuthNudge';
import { Sage } from '../components/Sage';
import { Icon } from '../components/icons';
import { PGButton, PGIconBtn, PGNav, PGSkel } from '../components/primitives';
import { adaptDocument } from '../lib/docAdapter';
import { useAttempt, useDocument, useDocumentList, useMe } from '../lib/queries';
import { SAMPLE_DOC } from '../lib/sampleDoc';
import { useQuizStore } from '../store/quizStore';
export default function ResultsPage() {
    const { attemptId } = useParams();
    const navigate = useNavigate();
    const stored = useQuizStore((s) => s.answers);
    const isSample = !attemptId || attemptId === 'sample';
    const attemptQuery = useAttempt(isSample ? undefined : attemptId);
    const documentId = isSample ? undefined : attemptQuery.data?.document_id;
    const docQuery = useDocument(isSample ? undefined : documentId);
    const docsQuery = useDocumentList();
    const meQuery = useMe();
    const doc = isSample ? SAMPLE_DOC : docQuery.data ? adaptDocument(docQuery.data) : null;
    const [open, setOpen] = useState(null);
    const loadError = attemptQuery.error || docQuery.error;
    if (!doc) {
        return (_jsxs("div", { className: "pg-shell", children: [_jsx(PGNav, { title: "Results", right: _jsx(PGIconBtn, { icon: _jsx(Icon.Library, { s: 18 }), onClick: () => navigate('/app') }) }), _jsx("div", { style: { padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }, children: loadError ? (_jsx("div", { className: "t-body-sm", style: { color: 'var(--red)' }, children: "Couldn't load these results." })) : (_jsxs(_Fragment, { children: [_jsx(PGSkel, { w: "100%", h: 180, r: 22 }), _jsx(PGSkel, { w: "100%", h: 64, r: 14 }), _jsx(PGSkel, { w: "100%", h: 64, r: 14 })] })) })] }));
    }
    const fallback = doc.quiz.map((q, i) => (i % 4 === 0 ? (q.correct + 1) % 4 : q.correct));
    const apiAnswers = attemptQuery.data?.answers;
    const answers = apiAnswers && apiAnswers.length === doc.quiz.length
        ? apiAnswers
        : stored.length === doc.quiz.length
            ? stored
            : fallback;
    const correct = answers.reduce((acc, a, i) => acc + (a === doc.quiz[i].correct ? 1 : 0), 0);
    const total = doc.quiz.length;
    const pct = correct / total;
    const verdict = pct >= 0.9 ? 'Amazing!' : pct >= 0.7 ? 'Great job!' : pct >= 0.5 ? 'Good start!' : 'Keep going!';
    const sub = pct >= 0.7 ? 'You really know your stuff.' : pct >= 0.5 ? 'A few weak spots — review and try again.' : 'Brush up on the key concepts!';
    const sagePose = pct >= 0.7 ? 'cheer' : pct >= 0.5 ? 'happy' : 'think';
    const retryTarget = isSample ? 'sample' : (documentId ?? 'sample');
    const retry = () => navigate(`/quiz/${retryTarget}`);
    const library = () => navigate('/app');
    return (_jsxs("div", { className: "pg-shell", children: [_jsx(PGNav, { title: "Results", right: _jsx(PGIconBtn, { icon: _jsx(Icon.Library, { s: 18 }), onClick: library }) }), _jsxs("div", { className: "no-scrollbar", style: { flex: 1, overflowY: 'auto', padding: '12px 20px 110px' }, children: [_jsxs("div", { className: "polka-yellow", style: {
                            borderRadius: 22,
                            border: '3px solid var(--yellow)',
                            boxShadow: '0 4px 0 var(--yellow-dark)',
                            padding: '18px 20px 22px',
                            textAlign: 'center',
                            marginBottom: 18,
                            position: 'relative',
                            overflow: 'hidden',
                        }, children: [_jsx("div", { style: { display: 'flex', justifyContent: 'center', marginBottom: 6 }, children: _jsx(Sage, { pose: sagePose, size: 120 }) }), _jsx("h1", { className: "t-display", style: { margin: 0, fontSize: 28 }, children: verdict }), _jsx("p", { className: "t-body-sm", style: { color: 'var(--ink-2)', margin: '4px 0 14px' }, children: sub }), _jsx(ScoreRing, { correct: correct, total: total })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 22 }, children: [_jsx(StatCell, { label: "Correct", value: String(correct), tone: "green", icon: _jsx(Icon.Check, { s: 14 }) }), _jsx(StatCell, { label: "Wrong", value: String(total - correct), tone: "red", icon: _jsx(Icon.X, { s: 12 }) }), _jsx(StatCell, { label: "Time", value: "3:42", tone: "blue", mono: true, icon: _jsx(Icon.Lightning, { s: 14 }) })] }), _jsx(AuthNudge, { me: meQuery.data, show: (docsQuery.data?.items.length ?? 0) >= 1 }), _jsx("div", { className: "t-h3", style: { marginBottom: 10 }, children: "Review your answers" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: doc.quiz.map((q, idx) => {
                            const userA = answers[idx];
                            const ok = userA === q.correct;
                            const expanded = open === idx;
                            return (_jsxs("div", { style: {
                                    background: 'var(--surface)',
                                    border: `2px solid ${ok ? 'var(--green)' : 'var(--red)'}`,
                                    borderBottomWidth: 3,
                                    borderRadius: 16,
                                    overflow: 'hidden',
                                }, children: [_jsxs("button", { onClick: () => setOpen((o) => (o === idx ? null : idx)), style: {
                                            width: '100%',
                                            padding: '12px 14px',
                                            background: 'transparent',
                                            border: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        }, children: [_jsx("div", { style: {
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: 10,
                                                    background: ok ? 'var(--green)' : 'var(--red)',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }, children: ok ? _jsx(Icon.Check, { s: 16 }) : _jsx(Icon.X, { s: 13 }) }), _jsx("div", { style: { flex: 1, minWidth: 0 }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'baseline', gap: 8 }, children: [_jsxs("span", { className: "t-mono", style: { color: 'var(--ink-4)' }, children: ["Q", idx + 1] }), _jsx("span", { className: "t-body-sm", style: {
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                display: '-webkit-box',
                                                                WebkitBoxOrient: 'vertical',
                                                                WebkitLineClamp: expanded ? 'unset' : 2,
                                                            }, children: q.prompt })] }) }), _jsx("div", { style: {
                                                    transition: 'transform 200ms',
                                                    transform: expanded ? 'rotate(180deg)' : 'none',
                                                    color: 'var(--ink-3)',
                                                }, children: _jsx(Icon.ChevronDown, { s: 18 }) })] }), expanded && (_jsxs("div", { style: {
                                            padding: '0 14px 14px 56px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8,
                                            animation: 'fadeIn 200ms',
                                        }, children: [_jsx(ReviewRow, { label: "Your answer", value: userA != null ? q.options[userA] : '—', tone: ok ? 'green' : 'red' }), !ok && _jsx(ReviewRow, { label: "Correct answer", value: q.options[q.correct], tone: "green" }), _jsx("p", { className: "t-body-sm", style: { color: 'var(--ink-2)', margin: '4px 0 0' }, children: q.explanation })] }))] }, idx));
                        }) })] }), _jsxs("div", { style: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '12px 20px 24px',
                    background: 'var(--surface)',
                    borderTop: '2px solid var(--hairline)',
                    display: 'flex',
                    gap: 8,
                }, children: [_jsx(PGButton, { variant: "secondary", size: "lg", icon: _jsx(Icon.Library, { s: 18 }), onClick: library, children: "Library" }), _jsx("div", { style: { flex: 1 }, children: _jsx(PGButton, { variant: "primary", size: "lg", fullWidth: true, icon: _jsx(Icon.Refresh, { s: 18 }), onClick: retry, children: "Try again" }) })] })] }));
}
function ScoreRing({ correct, total, size = 140 }) {
    const stroke = 14;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = correct / total;
    const offset = c * (1 - pct);
    const ringColor = pct >= 0.7 ? 'var(--green)' : pct >= 0.5 ? 'var(--orange)' : 'var(--red)';
    return (_jsxs("div", { style: { position: 'relative', width: size, height: size, margin: '0 auto' }, children: [_jsxs("svg", { width: size, height: size, children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: r, fill: "white", stroke: "var(--hairline-strong)", strokeWidth: 3 }), _jsx("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: ringColor, strokeWidth: stroke, strokeLinecap: "round", strokeDasharray: c, strokeDashoffset: offset, transform: `rotate(-90 ${size / 2} ${size / 2})` })] }), _jsxs("div", { style: {
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }, children: [_jsxs("div", { style: { fontSize: 38, fontWeight: 900, lineHeight: 1, color: 'var(--ink)' }, children: [correct, _jsxs("span", { style: { color: 'var(--ink-3)' }, children: ["/", total] })] }), _jsxs("div", { className: "t-mono", style: { color: 'var(--ink-2)', marginTop: 4, fontSize: 12 }, children: [Math.round(pct * 100), "%"] })] })] }));
}
const STAT_TONE = {
    green: { bg: 'var(--green-soft)', fg: 'var(--green-dark)', bd: 'var(--green)' },
    red: { bg: 'var(--red-soft)', fg: 'var(--red)', bd: 'var(--red)' },
    blue: { bg: 'var(--blue-soft)', fg: 'var(--blue-dark)', bd: 'var(--blue)' },
};
function StatCell({ label, value, tone, mono, icon }) {
    const t = STAT_TONE[tone];
    return (_jsxs("div", { style: {
            padding: '10px 12px',
            background: t.bg,
            border: `2px solid ${t.bd}`,
            borderBottomWidth: 3,
            borderRadius: 14,
        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 4, color: t.fg, marginBottom: 4 }, children: [icon, _jsx("span", { className: "t-eyebrow", style: { fontSize: 10, color: t.fg }, children: label })] }), _jsx("div", { style: { fontSize: 22, fontWeight: 900, color: t.fg, fontFamily: mono ? 'var(--font-mono)' : 'inherit' }, children: value })] }));
}
const REVIEW_TONE = {
    green: { bg: 'var(--green-soft)', bd: 'var(--green)' },
    red: { bg: 'var(--red-soft)', bd: 'var(--red)' },
};
function ReviewRow({ label, value, tone }) {
    const t = REVIEW_TONE[tone];
    return (_jsxs("div", { style: { padding: '8px 10px', background: t.bg, border: `2px solid ${t.bd}`, borderRadius: 10 }, children: [_jsx("div", { className: "t-eyebrow", style: { fontSize: 10, marginBottom: 2 }, children: label }), _jsx("div", { className: "t-body-sm", style: { color: 'var(--ink)' }, children: value })] }));
}
