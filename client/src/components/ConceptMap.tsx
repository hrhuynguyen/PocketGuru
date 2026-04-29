import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import type { ForceGraphMethods, ForceGraphProps, NodeObject } from 'react-force-graph-2d';

import type { Concept } from '../lib/sampleDoc';
import { PGCard, PGSkel } from './primitives';

type ConceptNode = {
  id: string;
  label: string;
  concept: Concept;
  color: string;
  stroke: string;
  activeStroke: string;
  textColor: string;
  isHub: boolean;
  size: number;
};

type ToneTokens = { color: string; stroke: string };
type ResolvedTokens = { ink: string; tones: ToneTokens[] };

const FALLBACK_TOKENS: ResolvedTokens = {
  ink: '#3C3C3C',
  tones: [
    { color: '#D7FFB8', stroke: '#46A302' },
    { color: '#D0EFFF', stroke: '#1899D6' },
    { color: '#FFF1B8', stroke: '#E6B400' },
    { color: '#FFD4E2', stroke: '#A8235A' },
    { color: '#FFE0B0', stroke: '#9A5A00' },
  ],
};

const TONE_VAR_NAMES = [
  ['--green-soft', '--green-dark'],
  ['--blue-soft', '--blue-dark'],
  ['--yellow-soft', '--yellow-dark'],
  ['--pink-soft', '#A8235A'],
  ['--orange-soft', '#9A5A00'],
] as const;

function readVar(styles: CSSStyleDeclaration, value: string, fallback: string): string {
  if (value.startsWith('#') || value.startsWith('rgb')) return value;
  const v = styles.getPropertyValue(value).trim();
  return v || fallback;
}

function useResolvedTokens(): ResolvedTokens {
  const [tokens, setTokens] = useState<ResolvedTokens>(FALLBACK_TOKENS);

  useEffect(() => {
    const resolve = () => {
      if (typeof window === 'undefined') return;
      const styles = window.getComputedStyle(document.documentElement);
      setTokens({
        ink: readVar(styles, '--ink', FALLBACK_TOKENS.ink),
        tones: TONE_VAR_NAMES.map(([colorVar, strokeVar], i) => ({
          color: readVar(styles, colorVar, FALLBACK_TOKENS.tones[i].color),
          stroke: readVar(styles, strokeVar, FALLBACK_TOKENS.tones[i].stroke),
        })),
      });
    };
    resolve();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', resolve);
    return () => mq.removeEventListener('change', resolve);
  }, []);

  return tokens;
}

type ConceptLink = {
  source: string;
  target: string;
};

const ForceGraph2D = lazy(async () => {
  const mod = await import('react-force-graph-2d');
  return {
    default: mod.default as ComponentType<
      ForceGraphProps<ConceptNode, ConceptLink> & {
        ref?: React.Ref<ForceGraphMethods<ConceptNode, ConceptLink>>;
      }
    >,
  };
});

export function ConceptMap({
  concepts,
  activeConceptId,
  onSelect,
}: {
  concepts: Concept[];
  activeConceptId: string | null;
  onSelect: (concept: Concept) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const graphRef = useRef<ForceGraphMethods<ConceptNode, ConceptLink> | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const tokens = useResolvedTokens();

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
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
      const tone = tokens.tones[index % tokens.tones.length];
      return {
        id: concept.id,
        label: concept.term,
        concept,
        color: tone.color,
        stroke: tone.stroke,
        activeStroke: index === 0 ? tokens.tones[0].stroke : tone.stroke,
        textColor: tokens.ink,
        isHub: index === 0,
        size: index === 0 ? 1.2 : 1,
      };
    });

    const seenLinks = new Set<string>();
    const links: ConceptLink[] = [];

    concepts.forEach((concept) => {
      concept.related.forEach((relatedId) => {
        if (!conceptIds.has(relatedId)) return;
        const key = [concept.id, relatedId].sort().join('::');
        if (seenLinks.has(key)) return;
        seenLinks.add(key);
        links.push({ source: concept.id, target: relatedId });
      });
    });

    return { nodes, links };
  }, [concepts, tokens]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph || graphData.nodes.length === 0) return;

    graph.d3Force('charge')?.strength?.(-280);
    graph.d3Force('link')?.distance?.(110);
    graph.d3Force('link')?.strength?.(0.7);
    graph.d3ReheatSimulation();
  }, [graphData]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph || size.width === 0 || size.height === 0) return;

    const timeoutId = window.setTimeout(() => {
      graph.zoomToFit(450, 54);
    }, 140);

    return () => window.clearTimeout(timeoutId);
  }, [graphData, size.height, size.width]);

  const activeOrHoveredId = activeConceptId ?? hoveredId;

  if (concepts.length < 3) {
    return (
      <div style={{ padding: '12px 20px 110px' }}>
        <PGCard thick style={{ padding: 18, background: 'linear-gradient(180deg, #FFFBEA 0%, #FFF3C7 100%)' }}>
          <div className="t-h3" style={{ marginBottom: 8 }}>
            Concept map needs a few more nodes
          </div>
          <p className="t-body-sm" style={{ color: 'var(--ink-2)', margin: 0 }}>
            This document only has {concepts.length} concept{concepts.length === 1 ? '' : 's'}, so the study guide is showing the summary and flashcards instead.
          </p>
        </PGCard>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="concept-map-shell"
      style={{ position: 'relative', flex: 1, minHeight: 420, margin: '0 16px 110px' }}
    >
      <div className="concept-map-hint">
        Drag the map around. Tap any concept for its definition.
      </div>
      {size.width > 0 && size.height > 0 ? (
        <Suspense fallback={<ConceptMapFallback />}>
          <ForceGraph2D
            ref={graphRef}
            width={size.width}
            height={size.height}
            backgroundColor="transparent"
            graphData={graphData}
            cooldownTicks={120}
            nodeRelSize={9}
            linkWidth={1.8}
            linkColor={() => 'rgba(60, 60, 60, 0.22)'}
            linkLineDash={() => [5, 5]}
            showPointerCursor
            enableNodeDrag
            onNodeClick={(node) => {
              onSelect(node.concept);
            }}
            onNodeHover={(node) => setHoveredId(node?.id ? String(node.id) : null)}
            onBackgroundClick={() => setHoveredId(null)}
            nodeCanvasObject={(node, ctx, globalScale) => {
              drawNodePill(ctx, node, globalScale, activeOrHoveredId === node.id);
            }}
            nodePointerAreaPaint={(node, color, ctx, globalScale) => {
              drawNodePill(ctx, node, globalScale, activeOrHoveredId === node.id, color);
            }}
          />
        </Suspense>
      ) : (
        <ConceptMapFallback />
      )}
    </div>
  );
}

function ConceptMapFallback() {
  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <PGSkel w="40%" h={20} />
      <PGSkel w="100%" h={220} r={24} />
      <PGSkel w="70%" h={20} />
    </div>
  );
}

function drawNodePill(
  ctx: CanvasRenderingContext2D,
  node: NodeObject<ConceptNode>,
  globalScale: number,
  active: boolean,
  paintColor?: string,
) {
  const label = node.label ?? '';
  const fontSize = (node.isHub ? 17 : 15) / globalScale;
  const paddingX = 12 / globalScale;
  const paddingY = 8 / globalScale;
  const radius = 16 / globalScale;

  ctx.save();
  ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  const textWidth = ctx.measureText(label).width;
  const width = textWidth + paddingX * 2;
  const height = fontSize + paddingY * 2;
  const x = (node.x ?? 0) - width / 2;
  const y = (node.y ?? 0) - height / 2;

  ctx.beginPath();
  roundRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = paintColor ?? (node.color ?? '#FFFFFF');
  ctx.fill();
  ctx.lineWidth = (active ? 4 : 2.5) / globalScale;
  ctx.strokeStyle = paintColor ?? (active ? node.activeStroke ?? node.stroke ?? '#333333' : node.stroke ?? '#333333');
  ctx.stroke();

  ctx.fillStyle = paintColor ? paintColor : (node.textColor ?? '#3C3C3C');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, node.x ?? 0, node.y ?? 0);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
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
