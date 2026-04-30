import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';

import { Icon } from './icons';
import { PGButton } from './primitives';

export function Camera({
  disabled,
  uploadInputId,
  onFiles,
}: {
  disabled?: boolean;
  uploadInputId?: string;
  onFiles: (files: File[]) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState(0);
  const [lastShotUrl, setLastShotUrl] = useState<string | null>(null);
  const [shotCount, setShotCount] = useState(0);
  const lastShotUrlRef = useRef<string | null>(null);

  useEffect(() => {
    lastShotUrlRef.current = lastShotUrl;
  }, [lastShotUrl]);

  useEffect(() => () => {
    if (lastShotUrlRef.current) URL.revokeObjectURL(lastShotUrlRef.current);
  }, []);

  const addInputFiles = (files: FileList | null) => {
    if (!files) return;
    onFiles(Array.from(files));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    onFiles(Array.from(event.dataTransfer.files));
  };

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const closeCamera = useCallback(() => {
    stopStream();
    setCameraOpen(false);
    setCameraError(null);
    setLastShotUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setShotCount(0);
  }, [stopStream]);

  useEffect(() => () => stopStream(), [stopStream]);

  const openCamera = async () => {
    if (disabled) return;
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
          videoRef.current.play().catch(() => {});
        }
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Camera unavailable';
      setCameraError(`Couldn't open camera (${msg}). Opening file picker instead.`);
      cameraRef.current?.click();
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    setFlashKey((k) => k + 1);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `page-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setLastShotUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        setShotCount((n) => n + 1);
        onFiles([file]);
      },
      'image/jpeg',
      0.92,
    );
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      style={{
        border: `3px dashed ${isDragOver ? 'var(--green)' : 'var(--hairline-strong)'}`,
        background: isDragOver ? 'var(--green-bg)' : 'var(--surface)',
        borderRadius: 24,
        padding: '22px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        transition: 'all 160ms',
      }}
    >
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        disabled={disabled}
        style={{ display: 'none' }}
        onChange={(event) => {
          addInputFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <input
        ref={uploadRef}
        id={uploadInputId}
        type="file"
        accept="image/*,application/pdf"
        multiple
        disabled={disabled}
        style={{ display: 'none' }}
        onChange={(event) => {
          addInputFiles(event.target.files);
          event.target.value = '';
        }}
      />

      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--green)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 0 var(--green-dark)',
        }}
      >
        <Icon.Camera s={32} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div className="t-h3">Open camera</div>
        <div className="t-body-sm" style={{ color: 'var(--ink-3)' }}>or drop pages / a PDF</div>
      </div>
      {cameraError && (
        <div
          className="t-body-sm"
          style={{
            color: 'var(--red)',
            background: 'var(--red-soft)',
            border: '2px solid var(--red)',
            borderRadius: 10,
            padding: '6px 10px',
            width: '100%',
          }}
        >
          {cameraError}
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, width: '100%' }}>
        <PGButton
          variant="primary"
          size="md"
          icon={<Icon.Camera s={18} />}
          fullWidth
          disabled={disabled}
          onClick={openCamera}
        >
          Camera
        </PGButton>
        <PGButton
          variant="secondary"
          size="md"
          icon={<Icon.Upload s={18} />}
          onClick={() => uploadRef.current?.click()}
          disabled={disabled}
          fullWidth
        >
          Upload
        </PGButton>
      </div>

      {cameraOpen && (
        <div
          role="dialog"
          aria-label="Camera"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'white',
            }}
          >
            <div style={{ fontWeight: 800 }}>Snap a page</div>
            <button
              onClick={closeCamera}
              aria-label="Close camera"
              style={{
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
              }}
            >
              <Icon.Close s={18} />
            </button>
          </div>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: 'black',
              }}
            />
            {flashKey > 0 && (
              <div
                key={flashKey}
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'white',
                  pointerEvents: 'none',
                  animation: 'pg-camera-flash 320ms ease-out forwards',
                }}
              />
            )}
            <style>{`
              @keyframes pg-camera-flash {
                0% { opacity: 0; }
                8% { opacity: 1; }
                100% { opacity: 0; }
              }
              @keyframes pg-shutter-press {
                0% { transform: scale(1); }
                40% { transform: scale(0.86); }
                100% { transform: scale(1); }
              }
              @keyframes pg-thumb-pop {
                0% { transform: scale(0.4); opacity: 0; }
                60% { transform: scale(1.08); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}</style>
          </div>
          <div
            style={{
              padding: '20px 16px 28px',
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: 16,
              color: 'white',
            }}
          >
            <div style={{ justifySelf: 'start' }}>
              {lastShotUrl ? (
                <div
                  key={shotCount}
                  style={{
                    position: 'relative',
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '2px solid rgba(255,255,255,0.85)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    animation: 'pg-thumb-pop 360ms cubic-bezier(.2,.7,.3,1)',
                  }}
                  aria-label="Latest captured photo"
                >
                  <img
                    src={lastShotUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {shotCount > 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        minWidth: 20,
                        height: 20,
                        padding: '0 5px',
                        borderRadius: 999,
                        background: 'var(--green)',
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                      }}
                    >
                      {shotCount}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ width: 56, height: 56 }} />
              )}
            </div>
            <button
              onClick={captureFrame}
              aria-label="Capture page"
              style={{
                width: 78,
                height: 78,
                borderRadius: '50%',
                background: 'white',
                border: '6px solid rgba(255,255,255,0.5)',
                cursor: 'pointer',
                boxShadow: '0 6px 0 rgba(0,0,0,0.3)',
                animation: flashKey > 0 ? 'pg-shutter-press 320ms ease-out' : undefined,
              }}
            />
            <div style={{ width: 56, height: 56, justifySelf: 'end' }} />
          </div>
        </div>
      )}
    </div>
  );
}
