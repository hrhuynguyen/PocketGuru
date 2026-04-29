import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { PGButton } from './primitives';
export function Camera({ disabled, uploadInputId, onFiles, }) {
    const cameraRef = useRef(null);
    const uploadRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const addInputFiles = (files) => {
        if (!files)
            return;
        onFiles(Array.from(files));
    };
    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragOver(false);
        if (disabled)
            return;
        onFiles(Array.from(event.dataTransfer.files));
    };
    const stopStream = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current)
            videoRef.current.srcObject = null;
    }, []);
    const closeCamera = useCallback(() => {
        stopStream();
        setCameraOpen(false);
        setCameraError(null);
    }, [stopStream]);
    useEffect(() => () => stopStream(), [stopStream]);
    const openCamera = async () => {
        if (disabled)
            return;
        setCameraError(null);
        const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
        if (!supported) {
            cameraRef.current?.click();
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });
            streamRef.current = stream;
            setCameraOpen(true);
            requestAnimationFrame(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(() => { });
                }
            });
        }
        catch (e) {
            const msg = e instanceof Error ? e.message : 'Camera unavailable';
            setCameraError(`Couldn't open camera (${msg}). Opening file picker instead.`);
            cameraRef.current?.click();
        }
    };
    const captureFrame = () => {
        const video = videoRef.current;
        const stream = streamRef.current;
        if (!video || !stream)
            return;
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h)
            return;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob((blob) => {
            if (!blob)
                return;
            const file = new File([blob], `page-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onFiles([file]);
        }, 'image/jpeg', 0.92);
    };
    return (_jsxs("div", { onDragOver: (event) => {
            event.preventDefault();
            if (!disabled)
                setIsDragOver(true);
        }, onDragLeave: () => setIsDragOver(false), onDrop: handleDrop, style: {
            border: `3px dashed ${isDragOver ? 'var(--green)' : 'var(--hairline-strong)'}`,
            background: isDragOver ? 'var(--green-bg)' : 'var(--surface)',
            borderRadius: 24,
            padding: '22px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            transition: 'all 160ms',
        }, children: [_jsx("input", { ref: cameraRef, type: "file", accept: "image/*", capture: "environment", multiple: true, disabled: disabled, style: { display: 'none' }, onChange: (event) => {
                    addInputFiles(event.target.files);
                    event.target.value = '';
                } }), _jsx("input", { ref: uploadRef, id: uploadInputId, type: "file", accept: "image/*,application/pdf", multiple: true, disabled: disabled, style: { display: 'none' }, onChange: (event) => {
                    addInputFiles(event.target.files);
                    event.target.value = '';
                } }), _jsx("div", { style: {
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 0 var(--green-dark)',
                }, children: _jsx(Icon.Camera, { s: 32 }) }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { className: "t-h3", children: "Open camera" }), _jsx("div", { className: "t-body-sm", style: { color: 'var(--ink-3)' }, children: "or drop pages / a PDF" })] }), cameraError && (_jsx("div", { className: "t-body-sm", style: {
                    color: 'var(--red)',
                    background: 'var(--red-soft)',
                    border: '2px solid var(--red)',
                    borderRadius: 10,
                    padding: '6px 10px',
                    width: '100%',
                }, children: cameraError })), _jsxs("div", { style: { display: 'flex', gap: 10, width: '100%' }, children: [_jsx(PGButton, { variant: "primary", size: "md", icon: _jsx(Icon.Camera, { s: 18 }), fullWidth: true, disabled: disabled, onClick: openCamera, children: "Camera" }), _jsx(PGButton, { variant: "secondary", size: "md", icon: _jsx(Icon.Upload, { s: 18 }), onClick: () => uploadRef.current?.click(), disabled: disabled, fullWidth: true, children: "Upload" })] }), cameraOpen && (_jsxs("div", { role: "dialog", "aria-label": "Camera", style: {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.92)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                }, children: [_jsxs("div", { style: {
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: 'white',
                        }, children: [_jsx("div", { style: { fontWeight: 800 }, children: "Snap a page" }), _jsx("button", { onClick: closeCamera, "aria-label": "Close camera", style: {
                                    width: 40,
                                    height: 40,
                                    borderRadius: 12,
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '2px solid rgba(255,255,255,0.4)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }, children: _jsx(Icon.Close, { s: 18 }) })] }), _jsx("div", { style: { flex: 1, position: 'relative', overflow: 'hidden' }, children: _jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, style: {
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                background: 'black',
                            } }) }), _jsx("div", { style: {
                            padding: '20px 16px 28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 24,
                            color: 'white',
                        }, children: _jsx("button", { onClick: captureFrame, "aria-label": "Capture page", style: {
                                width: 78,
                                height: 78,
                                borderRadius: '50%',
                                background: 'white',
                                border: '6px solid rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                boxShadow: '0 6px 0 rgba(0,0,0,0.3)',
                            } }) })] }))] }));
}
