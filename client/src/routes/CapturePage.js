import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthNav } from '../components/AuthNav';
import { AuthNudge } from '../components/AuthNudge';
import { Camera } from '../components/Camera';
import { PDFPreview } from '../components/PDFPreview';
import { Sage, SageBadge } from '../components/Sage';
import { SettingsMenu } from '../components/SettingsMenu';
import { Icon } from '../components/icons';
import { PGButton, PGCard, PGNav, PGProgress, PGSkel } from '../components/primitives';
import { ApiError } from '../lib/api';
import { buildPdfFromImages } from '../lib/pdf';
import { useDocumentList, useMe, useProcess } from '../lib/queries';
const TONE_MAP = {
    blue: { bg: 'var(--blue-soft)', ic: 'var(--blue)' },
    pink: { bg: 'var(--pink-soft)', ic: 'var(--pink)' },
    purple: { bg: 'var(--purple-soft)', ic: 'var(--purple)' },
    orange: { bg: 'var(--orange-soft)', ic: 'var(--orange)' },
};
const RECENT_TONES = ['blue', 'pink', 'purple', 'orange'];
const UPLOAD_INPUT_ID = 'capture-upload-input';
export default function CapturePage() {
    const navigate = useNavigate();
    const docsQuery = useDocumentList();
    const meQuery = useMe();
    const process = useProcess();
    const [thumbs, setThumbs] = useState([]);
    const [captureState, setCaptureState] = useState('idle');
    const [preparedUpload, setPreparedUpload] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [retryAfterSec, setRetryAfterSec] = useState(0);
    const isWorking = captureState === 'building-pdf' || captureState === 'uploading' || captureState === 'processing' || captureState === 'done';
    const isRateLimited = retryAfterSec > 0;
    useEffect(() => {
        if (retryAfterSec <= 0)
            return;
        const t = window.setInterval(() => {
            setRetryAfterSec((s) => Math.max(0, s - 1));
        }, 1000);
        return () => window.clearInterval(t);
    }, [retryAfterSec]);
    const resetPreparedUpload = () => {
        setPreparedUpload(null);
        setUploadProgress(0);
        if (captureState === 'error')
            setCaptureState('idle');
        setError(null);
    };
    const removeThumb = (id) => {
        resetPreparedUpload();
        setThumbs((items) => items.filter((item) => item.id !== id));
    };
    const reorderThumbs = (from, to) => {
        resetPreparedUpload();
        setThumbs((items) => {
            if (from < 0 || to < 0 || from >= items.length || to >= items.length)
                return items;
            const next = [...items];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    };
    const addFiles = (files) => {
        const accepted = files.filter((file) => file.type.startsWith('image/') || file.type === 'application/pdf');
        if (!accepted.length) {
            setError('Add images or a PDF.');
            setCaptureState('error');
            return;
        }
        resetPreparedUpload();
        const pdf = accepted.find((file) => file.type === 'application/pdf');
        if (pdf) {
            if (accepted.length > 1 || thumbs.length > 0) {
                setError('PDF uploads work one file at a time. I kept the PDF you selected.');
                setCaptureState('error');
            }
            setThumbs([{ id: makeThumbId(), file: pdf }]);
            return;
        }
        const slots = Math.max(0, 10 - thumbs.length);
        if (slots === 0) {
            setError('You can upload up to 10 pages at once.');
            setCaptureState('error');
            return;
        }
        if (accepted.length > slots) {
            setError(`I added the first ${slots} page${slots === 1 ? '' : 's'} so this stays under 10 pages.`);
            setCaptureState('error');
        }
        setThumbs((items) => [
            ...items,
            ...accepted.slice(0, slots).map((file) => ({ id: makeThumbId(), file })),
        ]);
    };
    const handleProcess = async () => {
        if (!thumbs.length || isWorking || process.isPending || isRateLimited)
            return;
        setError(null);
        try {
            const upload = preparedUpload ?? await prepareUpload(thumbs, setCaptureState);
            setPreparedUpload(upload);
            setCaptureState('uploading');
            setUploadProgress(0);
            const res = await process.mutateAsync({
                ...upload,
                onUploadProgress: (progress) => {
                    setUploadProgress(progress);
                    if (progress >= 1)
                        setCaptureState('processing');
                },
            });
            setCaptureState('done');
            navigate(`/study/${res.document_id}`);
        }
        catch (e) {
            setCaptureState('error');
            if (e instanceof ApiError) {
                if (e.status === 429) {
                    setRetryAfterSec(e.retryAfter ?? 60);
                    setError("We're studying a lot right now — give us a moment.");
                    return;
                }
                if (e.code === 'ocr_too_short') {
                    setError("We couldn't read this document — try a clearer photo.");
                    return;
                }
                setError(e.message);
                return;
            }
            setError(e instanceof Error ? e.message : 'Upload failed');
        }
    };
    if (isWorking) {
        return _jsx(CaptureLoading, { pages: thumbs.length, state: captureState, progress: uploadProgress });
    }
    return (_jsxs("div", { className: "pg-shell", children: [_jsx(PGNav, { left: _jsx(SettingsMenu, {}), title: _jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: 8 }, children: [_jsx(SageBadge, { size: 28 }), " PocketGuru"] }), right: _jsx(AuthNav, {}) }), _jsxs("div", { className: "no-scrollbar", style: { flex: 1, overflowY: 'auto' }, children: [_jsx("div", { className: "polka-green", style: { padding: '18px 20px 22px', position: 'relative', overflow: 'hidden' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 14 }, children: [_jsx(Sage, { pose: "wave", size: 92 }), _jsxs("div", { children: [_jsx("div", { className: "t-eyebrow", style: { color: 'var(--green-dark)', marginBottom: 2 }, children: "Hi, I'm Sage!" }), _jsxs("h1", { className: "t-h1", style: { margin: 0, fontSize: 22, lineHeight: 1.15 }, children: ["Snap a page,", _jsx("br", {}), "I'll teach the rest."] })] })] }) }), _jsxs("div", { style: { padding: '20px 16px 24px' }, children: [_jsx(Camera, { disabled: isWorking, uploadInputId: UPLOAD_INPUT_ID, onFiles: addFiles }), error && (_jsxs("div", { className: "t-body-sm", style: {
                                    marginTop: 12,
                                    padding: '10px 12px',
                                    background: 'var(--red-soft)',
                                    border: '2px solid var(--red)',
                                    borderRadius: 12,
                                    color: 'var(--red)',
                                }, children: [_jsx("div", { children: error }), isRateLimited && (_jsxs("div", { className: "t-mono", style: { marginTop: 6, color: 'var(--ink-2)' }, children: ["Try again in ", retryAfterSec, "s"] })), thumbs.length > 0 && !isRateLimited && (_jsx("div", { style: { marginTop: 10 }, children: _jsx(PGButton, { variant: "secondary", size: "sm", icon: _jsx(Icon.Refresh, { s: 15 }), onClick: handleProcess, children: "Retry" }) }))] })), _jsx(PDFPreview, { items: thumbs, disabled: isWorking, onAdd: () => document.getElementById(UPLOAD_INPUT_ID)?.click(), onRemove: removeThumb, onReorder: reorderThumbs }), _jsx("div", { style: { marginTop: thumbs.length > 0 ? 16 : 18 }, children: _jsx(PGButton, { variant: "primary", size: "lg", fullWidth: true, icon: _jsx(Icon.Sparkle, { s: 18 }), onClick: handleProcess, disabled: thumbs.length === 0 || isWorking || isRateLimited, children: isRateLimited ? `Wait ${retryAfterSec}s…` : 'Generate Study Guide' }) }), _jsxs("div", { style: { marginTop: 28 }, children: [_jsx("div", { className: "t-h3", style: { marginBottom: 10 }, children: "Pick up where you left off" }), _jsx(AuthNudge, { me: meQuery.data, show: (docsQuery.data?.items.length ?? 0) >= 1 }), _jsx(RecentDocs, { query: docsQuery, onOpen: (id) => navigate(`/study/${id}`) })] })] })] })] }));
}
async function prepareUpload(items, setState) {
    const files = items.map((item) => item.file);
    const pdfFiles = files.filter((file) => file.type === 'application/pdf');
    const titleSource = pdfFiles[0] ?? files[0];
    const title = titleSource.name.replace(/\.[^.]+$/, '') || 'notes';
    if (pdfFiles.length > 0) {
        if (files.length > 1)
            throw new Error('Upload one PDF by itself, or remove it and use images.');
        return { file: pdfFiles[0], title };
    }
    setState('building-pdf');
    const pdfBlob = await buildPdfFromImages(files);
    return {
        file: new File([pdfBlob], `${title}.pdf`, { type: 'application/pdf' }),
        title,
    };
}
function makeThumbId() {
    return `t${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
function CaptureLoading({ pages, state, progress, }) {
    const heading = state === 'building-pdf'
        ? 'Building your PDF...'
        : state === 'uploading'
            ? 'Uploading your pages...'
            : 'Reading your document...';
    const detail = state === 'building-pdf'
        ? 'Putting your pages in the order you chose'
        : state === 'uploading'
            ? `${Math.round(progress * 100)}% uploaded`
            : `Studying ${pages} page${pages !== 1 ? 's' : ''} of your notes`;
    return (_jsxs("div", { className: "pg-shell", children: [_jsx(PGNav, { title: heading }), _jsxs("div", { style: { flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }, children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '20px 0 8px' }, children: [_jsx(Sage, { pose: "read", size: 140 }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("h2", { className: "t-h2", style: { margin: 0, marginBottom: 6 }, children: heading }), _jsx("div", { className: "t-body-sm", style: { color: 'var(--ink-3)' }, children: detail })] })] }), state === 'uploading' && (_jsx("div", { style: { width: '100%' }, children: _jsx(PGProgress, { value: progress, max: 1, color: "var(--blue)", height: 14 }) })), _jsxs("div", { style: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsxs(PGCard, { padding: 14, children: [_jsx(PGSkel, { w: "55%", h: 16, style: { marginBottom: 14 } }), _jsx(PGSkel, { w: "100%", h: 10, style: { marginBottom: 8 } }), _jsx(PGSkel, { w: "92%", h: 10, style: { marginBottom: 8 } }), _jsx(PGSkel, { w: "76%", h: 10 })] }), _jsxs(PGCard, { padding: 14, children: [_jsx(PGSkel, { w: "40%", h: 12, style: { marginBottom: 14 } }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx(PGSkel, { w: "100%", h: 48, r: 12 }), _jsx(PGSkel, { w: "100%", h: 48, r: 12 })] })] })] }), _jsx(ProcessingSteps, {})] })] }));
}
function relativeWhen(iso) {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then))
        return '';
    const diffMin = Math.max(0, Math.round((Date.now() - then) / 60_000));
    if (diffMin < 1)
        return 'just now';
    if (diffMin < 60)
        return `${diffMin}m ago`;
    const diffH = Math.round(diffMin / 60);
    if (diffH < 24)
        return `${diffH}h ago`;
    const diffD = Math.round(diffH / 24);
    if (diffD < 7)
        return `${diffD}d ago`;
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
function RecentDocs({ query, onOpen, }) {
    if (query.isLoading) {
        return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsx(PGSkel, { w: "100%", h: 72, r: 16 }), _jsx(PGSkel, { w: "100%", h: 72, r: 16 })] }));
    }
    if (query.error) {
        return (_jsx("div", { className: "t-body-sm", style: { color: 'var(--red)' }, children: "Couldn't load your library. Try again in a bit." }));
    }
    const items = query.data?.items ?? [];
    if (items.length === 0) {
        return (_jsx(PGCard, { padding: 16, style: { textAlign: 'center' }, children: _jsx("div", { className: "t-body-sm", style: { color: 'var(--ink-3)' }, children: "No notes yet \u2014 snap your first page to get started!" }) }));
    }
    return (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: items.slice(0, 5).map((d, i) => (_jsx(RecentDocCard, { doc: d, tone: RECENT_TONES[i % RECENT_TONES.length], onOpen: onOpen }, d.id))) }));
}
function RecentDocCard({ doc, tone, onOpen, }) {
    const map = TONE_MAP[tone];
    return (_jsxs(PGCard, { thick: true, padding: 14, onClick: () => onOpen(doc.id), style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx("div", { style: {
                    width: 44,
                    height: 52,
                    borderRadius: 10,
                    background: map.bg,
                    border: `2px solid ${map.ic}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: map.ic,
                    flexShrink: 0,
                }, children: _jsx(Icon.Doc, { s: 20 }) }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { className: "t-body-sm", style: {
                            color: 'var(--ink)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontWeight: 800,
                        }, children: doc.title }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }, children: [_jsxs("span", { className: "t-mono", style: { color: 'var(--ink-3)' }, children: [doc.page_count, " page", doc.page_count === 1 ? '' : 's'] }), _jsx("span", { style: { width: 3, height: 3, borderRadius: '50%', background: 'var(--ink-4)' } }), _jsx("span", { className: "t-mono", style: { color: 'var(--ink-3)' }, children: relativeWhen(doc.created_at) })] })] }), doc.last_attempt_score != null && (_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'var(--yellow-soft)',
                    border: '2px solid var(--yellow-dark)',
                }, children: [_jsx(Icon.Star, { s: 13 }), _jsxs("span", { style: { fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 800, color: '#7A5A00' }, children: [doc.last_attempt_score, "%"] })] }))] }));
}
function ProcessingSteps() {
    const [step, setStep] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setStep((s) => Math.min(s + 1, 2)), 800);
        return () => clearInterval(t);
    }, []);
    const steps = [
        { id: 'ocr', label: 'Reading', icon: _jsx(Icon.Image, { s: 14 }) },
        { id: 'gen', label: 'Summarizing', icon: _jsx(Icon.Sparkle, { s: 14 }) },
        { id: 'quiz', label: 'Building quiz', icon: _jsx(Icon.Lightning, { s: 14 }) },
    ];
    return (_jsx("div", { style: { display: 'flex', gap: 8, marginTop: 'auto' }, children: steps.map((s, i) => (_jsxs("div", { style: {
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                background: i <= step ? 'var(--green-soft)' : 'var(--surface-2)',
                border: `2px solid ${i <= step ? 'var(--green)' : 'var(--hairline)'}`,
                borderRadius: 999,
                color: i <= step ? 'var(--green-dark)' : 'var(--ink-4)',
                transition: 'all 240ms',
            }, children: [i < step ? _jsx(Icon.Check, { s: 14 }) : s.icon, _jsx("span", { style: { fontSize: 12, fontWeight: 800 }, children: s.label })] }, s.id))) }));
}
