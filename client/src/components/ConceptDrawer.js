import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { PGBadge, PGDrawer } from './primitives';
export function ConceptDrawer({ concept, concepts, onClose, onSelect, }) {
    const relatedConcepts = concept
        ? concept.related
            .map((relatedId) => concepts.find((item) => item.id === relatedId))
            .filter((item) => Boolean(item))
        : [];
    return (_jsx(PGDrawer, { open: Boolean(concept), onClose: onClose, title: concept?.term, children: concept && (_jsxs(_Fragment, { children: [_jsx(PGBadge, { tone: "green", style: { marginBottom: 14 }, children: "Concept" }), _jsx("p", { className: "t-body", style: { color: 'var(--ink-2)', marginTop: 0, marginBottom: 0 }, children: concept.def }), _jsxs("div", { style: { marginTop: 18 }, children: [_jsx("div", { className: "t-h3", style: { marginBottom: 10 }, children: "Related terms" }), relatedConcepts.length > 0 ? (_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8 }, children: relatedConcepts.map((relatedConcept, index) => {
                                const tone = index % 2 === 0 ? 'blue' : 'yellow';
                                return (_jsx("button", { onClick: () => onSelect(relatedConcept), style: {
                                        padding: '8px 14px',
                                        background: `var(--${tone}-soft)`,
                                        color: 'var(--ink)',
                                        border: `2px solid var(--${tone === 'yellow' ? 'yellow-dark' : tone})`,
                                        borderRadius: 999,
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: 800,
                                    }, children: relatedConcept.term }, relatedConcept.id));
                            }) })) : (_jsx("p", { className: "t-body-sm", style: { color: 'var(--ink-3)', margin: 0 }, children: "No related terms were generated for this concept." }))] })] })) }));
}
