import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { Icon } from './icons';
import { PGButton } from './primitives';
export function Camera({ disabled, uploadInputId, onFiles, }) {
    const cameraRef = useRef(null);
    const uploadRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);
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
                }, children: _jsx(Icon.Camera, { s: 32 }) }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { className: "t-h3", children: "Open camera" }), _jsx("div", { className: "t-body-sm", style: { color: 'var(--ink-3)' }, children: "or drop pages / a PDF" })] }), _jsxs("div", { style: { display: 'flex', gap: 10, width: '100%' }, children: [_jsx(PGButton, { variant: "primary", size: "md", icon: _jsx(Icon.Camera, { s: 18 }), fullWidth: true, disabled: disabled, onClick: () => cameraRef.current?.click(), children: "Camera" }), _jsx(PGButton, { variant: "secondary", size: "md", icon: _jsx(Icon.Upload, { s: 18 }), onClick: () => uploadRef.current?.click(), disabled: disabled, fullWidth: true, children: "Upload" })] })] }));
}
