import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sage } from '../components/Sage';
import { Icon } from '../components/icons';
import { PGButton, PGProgress, PGSkel, PGNav, PGIconBtn } from '../components/primitives';
import { adaptDocument } from '../lib/docAdapter';
import { useDocument, useSubmitAttempt } from '../lib/queries';
import { SAMPLE_DOC } from '../lib/sampleDoc';
import { useQuizStore } from '../store/quizStore';
export default function QuizPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const setStoreAnswers = useQuizStore((s) => s.setAnswers);
    const submitAttempt = useSubmitAttempt();
    const isSample = !id || id === 'sample';
    const docQuery = useDocument(isSample ? undefined : id);
    const doc = isSample ? SAMPLE_DOC : docQuery.data ? adaptDocument(docQuery.data) : null;
    const quiz = doc?.quiz ?? [];
    const quizId = doc?.quizId;
    const [i, setI] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [hearts, setHearts] = useState(5);
    useEffect(() => {
        if (quiz.length > 0 && answers.length !== quiz.length) {
            setAnswers(Array(quiz.length).fill(null));
        }
    }, [quiz.length, answers.length]);
    if (!doc || answers.length !== quiz.length) {
        return (_jsxs("div", { className: "pg-shell", children: [_jsx(PGNav, { left: _jsx(PGIconBtn, { icon: _jsx(Icon.Close, { s: 18 }), onClick: () => navigate('/app') }), title: "Quiz" }), _jsx("div", { style: { padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }, children: docQuery.error ? (_jsx("div", { className: "t-body-sm", style: { color: 'var(--red)' }, children: "Couldn't load this quiz." })) : (_jsxs(_Fragment, { children: [_jsx(PGSkel, { w: "100%", h: 48, r: 12 }), _jsx(PGSkel, { w: "100%", h: 120, r: 16 }), _jsx(PGSkel, { w: "100%", h: 56, r: 16 }), _jsx(PGSkel, { w: "100%", h: 56, r: 16 })] })) })] }));
    }
    const q = quiz[i];
    const sel = answers[i];
    const locked = sel !== null;
    const isLast = i === quiz.length - 1;
    const select = (idx) => {
        if (locked)
            return;
        setAnswers((a) => {
            const n = [...a];
            n[i] = idx;
            return n;
        });
        if (idx !== q.correct)
            setHearts((h) => Math.max(0, h - 1));
    };
    const onNext = async () => {
        if (isLast) {
            setStoreAnswers(answers);
            if (quizId && answers.every((a) => a !== null)) {
                try {
                    const result = await submitAttempt.mutateAsync({ quiz_id: quizId, answers });
                    navigate(`/results/${result.attempt_id}`);
                    return;
                }
                catch {
                    // fall through to sample results render from local state
                }
            }
            navigate('/results/sample');
        }
        else {
            setI((v) => v + 1);
        }
    };
    const goBack = () => navigate('/app');
    return (_jsxs("div", { className: "pg-shell", children: [_jsxs("div", { style: { padding: '12px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx("button", { onClick: goBack, style: {
                            background: 'var(--surface-2)',
                            border: '2px solid var(--hairline)',
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--ink-3)',
                            cursor: 'pointer',
                        }, children: _jsx(Icon.Close, { s: 18 }) }), _jsx("div", { style: { flex: 1 }, children: _jsx(PGProgress, { value: i + (locked ? 1 : 0.4), max: quiz.length, color: "var(--green)", height: 16 }) }), _jsxs("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: 'var(--red-soft)',
                            border: '2px solid var(--red)',
                        }, children: [_jsx(Icon.Heart, { s: 16 }), _jsx("span", { style: { fontSize: 13, fontWeight: 800, color: 'var(--red)', fontFamily: 'var(--font-mono)' }, children: hearts })] })] }), _jsxs("div", { className: "no-scrollbar", style: { flex: 1, overflowY: 'auto', padding: '14px 20px 14px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }, children: [_jsx(Sage, { pose: locked ? (sel === q.correct ? 'happy' : 'think') : 'wave', size: 72, animated: false }), _jsxs("div", { style: {
                                    flex: 1,
                                    position: 'relative',
                                    background: 'var(--surface)',
                                    border: '2px solid var(--hairline-strong)',
                                    borderRadius: 16,
                                    padding: '12px 14px',
                                    marginTop: 8,
                                }, children: [_jsx("div", { style: {
                                            position: 'absolute',
                                            left: -8,
                                            top: 14,
                                            width: 0,
                                            height: 0,
                                            borderTop: '8px solid transparent',
                                            borderBottom: '8px solid transparent',
                                            borderRight: '8px solid var(--hairline-strong)',
                                        } }), _jsx("div", { style: {
                                            position: 'absolute',
                                            left: -5,
                                            top: 15,
                                            width: 0,
                                            height: 0,
                                            borderTop: '7px solid transparent',
                                            borderBottom: '7px solid transparent',
                                            borderRight: '7px solid var(--surface)',
                                        } }), _jsxs("div", { className: "t-eyebrow", style: { marginBottom: 4, color: 'var(--green-dark)' }, children: ["Question ", i + 1] }), _jsx("div", { className: "t-h2", style: { fontSize: 17, lineHeight: 1.35 }, children: q.prompt })] })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: q.options.map((opt, idx) => {
                            const isSel = sel === idx;
                            const isCorrect = locked && idx === q.correct;
                            const isWrong = locked && isSel && idx !== q.correct;
                            let bg = 'var(--surface)';
                            let border = '2px solid var(--hairline-strong)';
                            let shadow = '0 4px 0 var(--hairline)';
                            let fg = 'var(--ink)';
                            let circleBg = 'var(--surface-2)';
                            let circleFg = 'var(--ink-3)';
                            if (isCorrect) {
                                bg = 'var(--green-soft)';
                                border = '2px solid var(--green)';
                                shadow = '0 4px 0 var(--green)';
                                circleBg = 'var(--green)';
                                circleFg = 'white';
                            }
                            else if (isWrong) {
                                bg = 'var(--red-soft)';
                                border = '2px solid var(--red)';
                                shadow = '0 4px 0 var(--red)';
                                circleBg = 'var(--red)';
                                circleFg = 'white';
                            }
                            else if (isSel) {
                                bg = 'var(--blue-soft)';
                                border = '2px solid var(--blue)';
                                shadow = '0 4px 0 var(--blue)';
                                circleBg = 'var(--blue)';
                                circleFg = 'white';
                            }
                            else if (locked) {
                                fg = 'var(--ink-3)';
                                shadow = '0 2px 0 var(--hairline)';
                            }
                            return (_jsxs("button", { onClick: () => select(idx), disabled: locked, style: {
                                    minHeight: 60,
                                    padding: '12px 16px',
                                    background: bg,
                                    border,
                                    borderRadius: 16,
                                    boxShadow: shadow,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    cursor: locked ? 'default' : 'pointer',
                                    textAlign: 'left',
                                    color: fg,
                                    transition: 'all 140ms',
                                    fontFamily: 'inherit',
                                }, children: [_jsx("div", { style: {
                                            width: 32,
                                            height: 32,
                                            borderRadius: 10,
                                            background: circleBg,
                                            color: circleFg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontFamily: 'var(--font-mono)',
                                            fontSize: 14,
                                            fontWeight: 800,
                                            flexShrink: 0,
                                        }, children: isCorrect ? _jsx(Icon.Check, { s: 16 }) : isWrong ? _jsx(Icon.X, { s: 14 }) : String.fromCharCode(65 + idx) }), _jsx("span", { style: { fontSize: 15, lineHeight: 1.35, fontWeight: 700 }, children: opt })] }, idx));
                        }) }), locked && (_jsxs("div", { style: { marginTop: 18, animation: 'fadeIn 240ms ease' }, children: [_jsxs("div", { style: {
                                    padding: 14,
                                    borderRadius: 16,
                                    background: sel === q.correct ? 'var(--green-soft)' : 'var(--red-soft)',
                                    border: `2px solid ${sel === q.correct ? 'var(--green)' : 'var(--red)'}`,
                                    borderBottomWidth: 4,
                                }, children: [_jsx("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }, children: sel === q.correct ? (_jsxs(_Fragment, { children: [_jsx(Sage, { pose: "happy", size: 48, animated: false }), _jsx("div", { className: "t-h2", style: { color: 'var(--green-dark)' }, children: "Nice one!" })] })) : (_jsxs(_Fragment, { children: [_jsx(Sage, { pose: "think", size: 48, animated: false }), _jsx("div", { className: "t-h2", style: { color: 'var(--red)' }, children: "Not quite!" })] })) }), _jsx("p", { className: "t-body-sm", style: { margin: 0, color: 'var(--ink-2)' }, children: q.explanation })] }), _jsxs("div", { style: {
                                    marginTop: 10,
                                    padding: '12px 14px',
                                    background: 'var(--surface)',
                                    border: '2px solid var(--hairline-strong)',
                                    borderRadius: 14,
                                    display: 'flex',
                                    gap: 10,
                                }, children: [_jsx("div", { style: { color: 'var(--blue)', flexShrink: 0, marginTop: 1 }, children: _jsx(Icon.Quote, { s: 18 }) }), _jsxs("div", { children: [_jsx("div", { className: "t-eyebrow", style: { marginBottom: 4 }, children: "From your notes" }), _jsx("div", { className: "t-body-sm", style: { color: 'var(--ink-2)', fontStyle: 'italic' }, children: q.quote })] })] })] }))] }), _jsx("div", { style: {
                    padding: '12px 20px 24px',
                    borderTop: locked ? '2px solid var(--hairline)' : 'none',
                    background: 'var(--surface)',
                }, children: _jsx(PGButton, { variant: "primary", size: "lg", fullWidth: true, disabled: !locked, icon: isLast ? undefined : _jsx(Icon.ArrowRight, { s: 18 }), onClick: onNext, children: isLast ? 'See results' : 'Continue' }) })] }));
}
