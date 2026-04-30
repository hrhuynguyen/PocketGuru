import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConceptDrawer } from '../components/ConceptDrawer';
import { ConceptMap } from '../components/ConceptMap';
import { Flashcard } from '../components/Flashcard';
import { Icon } from '../components/icons';
import { PGBadge, PGButton, PGCard, PGIconBtn, PGNav, PGSkel } from '../components/primitives';
import { adaptDocument } from '../lib/docAdapter';
import { useDeleteDocument, useDocument, useRenameDocument } from '../lib/queries';
import { SAMPLE_DOC } from '../lib/sampleDoc';
const CONCEPT_CHIP_TONES = ['green', 'blue', 'yellow', 'pink', 'orange'];
export default function StudyPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState('summary');
    const [drawer, setDrawer] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const [confirmDelete, setConfirmDelete] = useState(false);
    const titleInputRef = useRef(null);
    const menuRef = useRef(null);
    const isSample = !id || id === 'sample';
    const docQuery = useDocument(isSample ? undefined : id);
    const rename = useRenameDocument();
    const remove = useDeleteDocument();
    const doc = isSample
        ? SAMPLE_DOC
        : docQuery.data
            ? adaptDocument(docQuery.data)
            : null;
    const goBack = () => navigate('/app');
    const startQuiz = () => navigate(`/quiz/${id ?? 'sample'}`);
    useEffect(() => {
        if (editing) {
            setDraft(doc?.title ?? '');
            requestAnimationFrame(() => {
                titleInputRef.current?.focus();
                titleInputRef.current?.select();
            });
        }
    }, [editing, doc?.title]);
    useEffect(() => {
        if (!menuOpen)
            return;
        const onDocClick = (e) => {
            if (!menuRef.current?.contains(e.target))
                setMenuOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [menuOpen]);
    const submitRename = async () => {
        if (!id || isSample || !doc) {
            setEditing(false);
            return;
        }
        const trimmed = draft.trim();
        if (!trimmed || trimmed === doc.title) {
            setEditing(false);
            return;
        }
        try {
            await rename.mutateAsync({ id, title: trimmed });
            setEditing(false);
        }
        catch {
            // keep editor open
        }
    };
    const submitDelete = async () => {
        if (!id || isSample)
            return;
        try {
            await remove.mutateAsync(id);
            navigate('/app');
        }
        catch {
            setConfirmDelete(false);
        }
    };
    if (!doc) {
        return (_jsxs("div", { className: "pg-shell", children: [_jsx(PGNav, { left: _jsx(PGIconBtn, { icon: _jsx(Icon.ArrowLeft, { s: 18 }), onClick: goBack }), title: "Study guide" }), _jsx("div", { style: { padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }, children: docQuery.error ? (_jsx("div", { className: "t-body-sm", style: { color: 'var(--red)' }, children: "Couldn't load this document." })) : (_jsxs(_Fragment, { children: [_jsx(PGSkel, { w: "60%", h: 20 }), _jsx(PGSkel, { w: "100%", h: 120, r: 16 }), _jsx(PGSkel, { w: "100%", h: 80, r: 16 })] })) })] }));
    }
    const canEdit = !isSample;
    return (_jsxs("div", { className: "pg-shell", children: [_jsx(PGNav, { left: _jsx(PGIconBtn, { icon: _jsx(Icon.ArrowLeft, { s: 18 }), onClick: goBack }), title: "Study guide", right: canEdit ? (_jsxs("div", { ref: menuRef, style: { position: 'relative' }, children: [_jsx(PGIconBtn, { icon: _jsx(Icon.More, { s: 18 }), onClick: () => setMenuOpen((v) => !v), label: "Document options" }), menuOpen && (_jsxs("div", { style: {
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                right: 0,
                                minWidth: 160,
                                background: 'var(--surface)',
                                border: '2px solid var(--hairline-strong)',
                                borderRadius: 12,
                                boxShadow: '0 6px 0 var(--hairline)',
                                padding: 6,
                                zIndex: 30,
                            }, children: [_jsx(StudyMenuItem, { icon: _jsx(Icon.Edit, { s: 16 }), label: "Rename", onClick: () => {
                                        setMenuOpen(false);
                                        setEditing(true);
                                    } }), _jsx(StudyMenuItem, { icon: _jsx(Icon.Trash, { s: 16 }), label: "Delete", danger: true, onClick: () => {
                                        setMenuOpen(false);
                                        setConfirmDelete(true);
                                    } })] }))] })) : undefined }), _jsxs("div", { style: { padding: '16px 20px 10px', display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { children: [_jsx("div", { className: "t-eyebrow", style: { marginBottom: 6 }, children: doc.source }), editing ? (_jsx("input", { ref: titleInputRef, value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => {
                                    if (e.key === 'Enter')
                                        void submitRename();
                                    if (e.key === 'Escape')
                                        setEditing(false);
                                }, onBlur: () => void submitRename(), disabled: rename.isPending, maxLength: 200, style: {
                                    width: '100%',
                                    margin: 0,
                                    fontSize: 24,
                                    lineHeight: 1.15,
                                    fontWeight: 800,
                                    color: 'var(--ink)',
                                    background: 'var(--surface-2)',
                                    border: '2px solid var(--green)',
                                    borderRadius: 12,
                                    padding: '6px 10px',
                                    fontFamily: 'inherit',
                                    outline: 'none',
                                } })) : (_jsx("h1", { className: "t-h1", style: { margin: 0, fontSize: 24, lineHeight: 1.15 }, children: doc.title }))] }), _jsxs("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap' }, children: [_jsxs(PGBadge, { tone: "green", children: [doc.concepts.length, " concepts"] }), _jsxs(PGBadge, { tone: "blue", children: [doc.flashcards.length, " cards"] }), _jsxs(PGBadge, { tone: "yellow", children: [doc.quiz.length, " quiz questions"] })] }), _jsx(PGCard, { thick: true, style: {
                            padding: 18,
                            background: 'linear-gradient(180deg, #FFFDF8 0%, #F7FFF0 100%)',
                        }, children: _jsx("div", { className: "study-prose", children: doc.summary.map((paragraph, index) => (_jsx("p", { children: paragraph }, index))) }) })] }), _jsx("div", { style: { padding: '0 16px 12px' }, children: _jsx("div", { style: { display: 'flex', gap: 6, padding: 4, background: 'var(--surface-2)', borderRadius: 14, border: '2px solid var(--hairline)' }, children: ['summary', 'map', 'cards'].map((t) => (_jsx("button", { onClick: () => setTab(t), style: {
                            flex: 1,
                            padding: '10px 6px',
                            background: tab === t ? 'var(--surface)' : 'transparent',
                            border: tab === t ? '2px solid var(--hairline-strong)' : '2px solid transparent',
                            borderBottomWidth: tab === t ? 3 : 2,
                            borderRadius: 10,
                            color: tab === t ? 'var(--ink)' : 'var(--ink-3)',
                            fontSize: 13,
                            fontWeight: 800,
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                        }, children: t }, t))) }) }), _jsxs("div", { className: "no-scrollbar", style: { flex: 1, overflowY: tab === 'map' ? 'hidden' : 'auto' }, children: [tab === 'summary' && (_jsxs("div", { style: { padding: '4px 20px 110px', display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsxs(PGCard, { thick: true, style: { padding: 16 }, children: [_jsx("div", { className: "t-h3", style: { marginBottom: 8 }, children: "How to use this guide" }), _jsx("p", { className: "t-body-sm", style: { color: 'var(--ink-2)', margin: 0 }, children: "Read the recap, open a concept to review its definition, then switch to cards when you want faster repetition." })] }), _jsx("div", { className: "t-h3", style: { marginBottom: 0 }, children: "Key concepts" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8 }, children: doc.concepts.map((concept, index) => {
                                    const tone = CONCEPT_CHIP_TONES[index % CONCEPT_CHIP_TONES.length];
                                    return (_jsx("button", { onClick: () => setDrawer(concept), style: {
                                            padding: '8px 14px',
                                            background: `var(--${tone}-soft)`,
                                            color: 'var(--ink)',
                                            border: `2px solid var(--${tone === 'yellow' ? 'yellow-dark' : tone})`,
                                            borderRadius: 999,
                                            cursor: 'pointer',
                                            fontSize: 13,
                                            fontWeight: 800,
                                        }, children: concept.term }, concept.id));
                                }) })] })), tab === 'map' && _jsx(ConceptMap, { concepts: doc.concepts, activeConceptId: drawer?.id ?? null, onSelect: setDrawer }), tab === 'cards' && _jsx(FlashcardsView, { doc: doc })] }), _jsx("div", { style: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: '12px 20px 24px',
                    background: 'linear-gradient(to top, var(--bg) 80%, transparent)',
                    pointerEvents: 'none',
                }, children: _jsx("div", { style: { pointerEvents: 'auto' }, children: _jsxs(PGButton, { variant: "primary", size: "lg", fullWidth: true, icon: _jsx(Icon.Lightning, { s: 18 }), onClick: startQuiz, children: ["Start quiz \u00B7 ", doc.quiz.length, " questions"] }) }) }), _jsx(ConceptDrawer, { concept: drawer, concepts: doc.concepts, onClose: () => setDrawer(null), onSelect: setDrawer }), confirmDelete && (_jsx("div", { onClick: () => !remove.isPending && setConfirmDelete(false), style: {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.45)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 20,
                    zIndex: 9999,
                }, children: _jsxs("div", { onClick: (e) => e.stopPropagation(), style: {
                        width: '100%',
                        maxWidth: 360,
                        background: 'var(--surface)',
                        border: '2px solid var(--hairline-strong)',
                        borderRadius: 18,
                        padding: 18,
                        boxShadow: '0 8px 0 var(--hairline)',
                    }, children: [_jsx("div", { className: "t-h3", style: { marginBottom: 6 }, children: "Delete this study guide?" }), _jsxs("div", { className: "t-body-sm", style: { color: 'var(--ink-3)', marginBottom: 14 }, children: ["\u201C", doc.title, "\u201D will be removed from your library. This can't be undone."] }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx(PGButton, { variant: "secondary", size: "md", fullWidth: true, onClick: () => setConfirmDelete(false), disabled: remove.isPending, children: "Cancel" }), _jsx(PGButton, { variant: "primary", size: "md", fullWidth: true, icon: _jsx(Icon.Trash, { s: 16 }), onClick: submitDelete, disabled: remove.isPending, style: { background: 'var(--red)', borderColor: 'var(--red)' }, children: remove.isPending ? 'Deleting…' : 'Delete' })] })] }) }))] }));
}
function StudyMenuItem({ icon, label, onClick, danger, }) {
    return (_jsxs("button", { onClick: onClick, style: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '8px 10px',
            background: 'transparent',
            border: 'none',
            borderRadius: 8,
            color: danger ? 'var(--red)' : 'var(--ink)',
            fontSize: 13,
            fontWeight: 700,
            textAlign: 'left',
            cursor: 'pointer',
        }, onMouseEnter: (e) => {
            e.currentTarget.style.background = danger
                ? 'var(--red-soft)'
                : 'var(--surface-2)';
        }, onMouseLeave: (e) => {
            e.currentTarget.style.background = 'transparent';
        }, children: [icon, _jsx("span", { children: label })] }));
}
function FlashcardsView({ doc }) {
    const cards = doc.flashcards;
    const total = cards.length;
    const [i, setI] = useState(0);
    const next = () => {
        setI((v) => Math.min(v + 1, total - 1));
    };
    const prev = () => {
        setI((v) => Math.max(v - 1, 0));
    };
    if (total === 0) {
        return (_jsx("div", { style: { padding: '12px 20px 110px' }, children: _jsxs(PGCard, { thick: true, style: { padding: 18 }, children: [_jsx("div", { className: "t-h3", style: { marginBottom: 8 }, children: "No flashcards yet" }), _jsx("p", { className: "t-body-sm", style: { color: 'var(--ink-2)', margin: 0 }, children: "This study guide did not generate any flashcards for the document." })] }) }));
    }
    return (_jsxs("div", { style: { padding: '12px 0 110px', display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: [_jsx("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }, children: _jsxs(PGBadge, { tone: "blue", children: ["Card ", i + 1, " of ", total] }) }), _jsx("p", { className: "t-body-sm", style: { color: 'var(--ink-3)', margin: '0 24px 16px', textAlign: 'center' }, children: "Flip for the answer, then swipe or use the arrows to move through the deck." }), _jsxs("div", { style: { position: 'relative', width: 320, maxWidth: 'calc(100vw - 40px)', height: 250 }, children: [i > 0 && (_jsx("div", { style: {
                            position: 'absolute',
                            inset: 0,
                            transform: 'translateX(-30px) scale(0.92) rotate(-4deg)',
                            opacity: 0.5,
                            background: 'var(--surface)',
                            border: '2px solid var(--hairline-strong)',
                            borderRadius: 22,
                            boxShadow: '0 4px 0 var(--hairline)',
                        } })), i < total - 1 && (_jsx("div", { style: {
                            position: 'absolute',
                            inset: 0,
                            transform: 'translateX(30px) scale(0.92) rotate(4deg)',
                            opacity: 0.5,
                            background: 'var(--surface)',
                            border: '2px solid var(--hairline-strong)',
                            borderRadius: 22,
                            boxShadow: '0 4px 0 var(--hairline)',
                        } })), _jsx(Flashcard, { front: cards[i].front, back: cards[i].back, index: i, total: total, onNext: next, onPrev: prev })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16, marginTop: 22 }, children: [_jsx("button", { onClick: prev, disabled: i === 0, style: {
                            width: 50,
                            height: 50,
                            borderRadius: 14,
                            background: 'var(--surface)',
                            border: '2px solid var(--hairline-strong)',
                            boxShadow: i === 0 ? '0 2px 0 var(--hairline)' : '0 4px 0 var(--hairline-strong)',
                            color: i === 0 ? 'var(--ink-4)' : 'var(--ink)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: i === 0 ? 'not-allowed' : 'pointer',
                        }, children: _jsx(Icon.ArrowLeft, { s: 20 }) }), _jsx("div", { style: { display: 'flex', gap: 5, alignItems: 'center', height: 8 }, children: cards.map((_, k) => (_jsx("div", { style: {
                                width: k === i ? 22 : 8,
                                height: 8,
                                borderRadius: 4,
                                background: k === i ? 'var(--green)' : 'var(--hairline-strong)',
                                transition: 'all 220ms',
                            } }, k))) }), _jsx("button", { onClick: next, disabled: i === total - 1, style: {
                            width: 50,
                            height: 50,
                            borderRadius: 14,
                            background: i === total - 1 ? 'var(--surface)' : 'var(--green)',
                            color: i === total - 1 ? 'var(--ink-4)' : 'white',
                            border: '2px solid ' + (i === total - 1 ? 'var(--hairline-strong)' : 'var(--green-dark)'),
                            boxShadow: i === total - 1 ? '0 2px 0 var(--hairline)' : '0 4px 0 var(--green-dark)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: i === total - 1 ? 'not-allowed' : 'pointer',
                        }, children: _jsx(Icon.ArrowRight, { s: 20 }) })] })] }));
}
