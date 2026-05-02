import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { PGCard, PGSkel } from './primitives';
const ForceGraph2D = lazy(async () => {
    const mod = await import('react-force-graph-2d');
    return {
        default: mod.default,
    };
});
const NODE_TONES = [
    { color: 'var(--green-soft)', stroke: 'var(--green-dark)' },
    { color: 'var(--blue-soft)', stroke: 'var(--blue-dark)' },
    { color: 'var(--yellow-soft)', stroke: 'var(--yellow-dark)' },
    { color: 'var(--pink-soft)', stroke: '#A8235A' },
    { color: 'var(--orange-soft)', stroke: '#9A5A00' },
];
export function ConceptMap({ concepts, activeConceptId, onSelect, }) {
    const containerRef = useRef(null);
    const graphRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [hoveredId, setHoveredId] = useState(null);
    useEffect(() => {
        if (!containerRef.current)
            return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry)
                return;
            setSize({
                width: Math.round(entry.contentRect.width),
                height: Math.round(entry.contentRect.height),
            });
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);
    const graphData = useMemo(() => {
        const conceptIds = new Set(concepts.map((concept) => concept.id));
        const nodes = concepts.map((concept, index) => {
            const tone = NODE_TONES[index % NODE_TONES.length];
            return {
                id: concept.id,
                label: concept.term,
                concept,
                color: tone.color,
                stroke: tone.stroke,
                activeStroke: index === 0 ? 'var(--green-dark)' : tone.stroke,
                isHub: index === 0,
                size: index === 0 ? 1.2 : 1,
            };
        });
        const seenLinks = new Set();
        const links = [];
        concepts.forEach((concept) => {
            concept.related.forEach((relatedId) => {
                if (!conceptIds.has(relatedId))
                    return;
                const key = [concept.id, relatedId].sort().join('::');
                if (seenLinks.has(key))
                    return;
                seenLinks.add(key);
                links.push({ source: concept.id, target: relatedId });
            });
        });
        return { nodes, links };
    }, [concepts]);
    useEffect(() => {
        const graph = graphRef.current;
        if (!graph || graphData.nodes.length === 0)
            return;
        graph.d3Force('charge')?.strength?.(-280);
        graph.d3Force('link')?.distance?.(110);
        graph.d3Force('link')?.strength?.(0.7);
        graph.d3ReheatSimulation();
    }, [graphData]);
    useEffect(() => {
        const graph = graphRef.current;
        if (!graph || size.width === 0 || size.height === 0)
            return;
        const timeoutId = window.setTimeout(() => {
            graph.zoomToFit(450, 54);
        }, 140);
        return () => window.clearTimeout(timeoutId);
    }, [graphData, size.height, size.width]);
    const activeOrHoveredId = activeConceptId ?? hoveredId;
    if (concepts.length < 3) {
        return (_jsx("div", { style: { padding: '12px 20px 110px' }, children: _jsxs(PGCard, { thick: true, style: { padding: 18, background: 'linear-gradient(180deg, #FFFBEA 0%, #FFF3C7 100%)' }, children: [_jsx("div", { className: "t-h3", style: { marginBottom: 8 }, children: "Concept map needs a few more nodes" }), _jsxs("p", { className: "t-body-sm", style: { color: 'var(--ink-2)', margin: 0 }, children: ["This document only has ", concepts.length, " concept", concepts.length === 1 ? '' : 's', ", so the study guide is showing the summary and flashcards instead."] })] }) }));
    }
    return (_jsxs("div", { ref: containerRef, className: "concept-map-shell", style: { position: 'relative', flex: 1, minHeight: 420, margin: '0 16px 110px' }, children: [_jsx("div", { className: "concept-map-hint", children: "Drag the map around. Tap any concept for its definition." }), size.width > 0 && size.height > 0 ? (_jsx(Suspense, { fallback: _jsx(ConceptMapFallback, {}), children: _jsx(ForceGraph2D, { ref: graphRef, width: size.width, height: size.height, backgroundColor: "transparent", graphData: graphData, cooldownTicks: 120, nodeRelSize: 9, linkWidth: 1.8, linkColor: () => 'rgba(60, 60, 60, 0.22)', linkLineDash: () => [5, 5], showPointerCursor: true, enableNodeDrag: true, onNodeClick: (node) => {
                        onSelect(node.concept);
                    }, onNodeHover: (node) => setHoveredId(node?.id ? String(node.id) : null), onBackgroundClick: () => setHoveredId(null), nodeCanvasObject: (node, ctx, globalScale) => {
                        drawNodePill(ctx, node, globalScale, activeOrHoveredId === node.id);
                    }, nodePointerAreaPaint: (node, color, ctx, globalScale) => {
                        drawNodePill(ctx, node, globalScale, activeOrHoveredId === node.id, color);
                    } }) })) : (_jsx(ConceptMapFallback, {}))] }));
}
function ConceptMapFallback() {
    return (_jsxs("div", { style: { padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsx(PGSkel, { w: "40%", h: 20 }), _jsx(PGSkel, { w: "100%", h: 220, r: 24 }), _jsx(PGSkel, { w: "70%", h: 20 })] }));
}
function drawNodePill(ctx, node, globalScale, active, paintColor) {
    const label = node.label ?? '';
    const fontSize = (node.isHub ? 17 : 15) / globalScale;
    const paddingX = 12 / globalScale;
    const paddingY = 8 / globalScale;
    const radius = 16 / globalScale;
    ctx.save();
    ctx.font = `800 ${fontSize}px var(--font-sans)`;
    const textWidth = ctx.measureText(label).width;
    const width = textWidth + paddingX * 2;
    const height = fontSize + paddingY * 2;
    const x = (node.x ?? 0) - width / 2;
    const y = (node.y ?? 0) - height / 2;
    ctx.beginPath();
    roundRect(ctx, x, y, width, height, radius);
    ctx.fillStyle = paintColor ?? (node.color ?? 'white');
    ctx.fill();
    ctx.lineWidth = (active ? 4 : 2.5) / globalScale;
    ctx.strokeStyle = paintColor ?? (active ? node.activeStroke ?? node.stroke ?? '#333' : node.stroke ?? '#333');
    ctx.stroke();
    ctx.fillStyle = paintColor ? paintColor : 'var(--ink)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, node.x ?? 0, node.y ?? 0);
    ctx.restore();
}
function roundRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
