import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ConceptDrawer } from '../components/ConceptDrawer';
import { ConceptMap } from '../components/ConceptMap';
import { Flashcard } from '../components/Flashcard';
import { Icon } from '../components/icons';
import { PGBadge, PGButton, PGCard, PGIconBtn, PGNav, PGSkel } from '../components/primitives';
import { adaptDocument } from '../lib/docAdapter';
import { useDeleteDocument, useDocument, useRenameDocument } from '../lib/queries';
import { SAMPLE_DOC, type Concept, type SampleDoc } from '../lib/sampleDoc';

type Tab = 'summary' | 'map' | 'cards';
const CONCEPT_CHIP_TONES = ['green', 'blue', 'yellow', 'pink', 'orange'] as const;

export default function StudyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('summary');
  const [drawer, setDrawer] = useState<Concept | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSample = !id || id === 'sample';
  const docQuery = useDocument(isSample ? undefined : id);
  const rename = useRenameDocument();
  const remove = useDeleteDocument();
  const doc: SampleDoc | null = isSample
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
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
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
    } catch {
      // keep editor open
    }
  };

  const submitDelete = async () => {
    if (!id || isSample) return;
    try {
      await remove.mutateAsync(id);
      navigate('/app');
    } catch {
      setConfirmDelete(false);
    }
  };

  if (!doc) {
    return (
      <div className="pg-shell">
        <PGNav left={<PGIconBtn icon={<Icon.ArrowLeft s={18} />} onClick={goBack} />} title="Study guide" />
        <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {docQuery.error ? (
            <div className="t-body-sm" style={{ color: 'var(--red)' }}>Couldn&apos;t load this document.</div>
          ) : (
            <>
              <PGSkel w="60%" h={20} />
              <PGSkel w="100%" h={120} r={16} />
              <PGSkel w="100%" h={80} r={16} />
            </>
          )}
        </div>
      </div>
    );
  }

  const canEdit = !isSample;

  return (
    <div className="pg-shell">
      <PGNav
        left={<PGIconBtn icon={<Icon.ArrowLeft s={18} />} onClick={goBack} />}
        title="Study guide"
        right={
          canEdit ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <PGIconBtn
                icon={<Icon.More s={18} />}
                onClick={() => setMenuOpen((v) => !v)}
                label="Document options"
              />
              {menuOpen && (
                <div
                  style={{
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
                  }}
                >
                  <StudyMenuItem
                    icon={<Icon.Edit s={16} />}
                    label="Rename"
                    onClick={() => {
                      setMenuOpen(false);
                      setEditing(true);
                    }}
                  />
                  <StudyMenuItem
                    icon={<Icon.Trash s={16} />}
                    label="Delete"
                    danger
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmDelete(true);
                    }}
                  />
                </div>
              )}
            </div>
          ) : undefined
        }
      />

      <div style={{ padding: '16px 20px 10px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 6 }}>{doc.source}</div>
          {editing ? (
            <input
              ref={titleInputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submitRename();
                if (e.key === 'Escape') setEditing(false);
              }}
              onBlur={() => void submitRename()}
              disabled={rename.isPending}
              maxLength={200}
              style={{
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
              }}
            />
          ) : (
            <h1 className="t-h1" style={{ margin: 0, fontSize: 24, lineHeight: 1.15 }}>{doc.title}</h1>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <PGBadge tone="green">{doc.concepts.length} concepts</PGBadge>
          <PGBadge tone="blue">{doc.flashcards.length} cards</PGBadge>
          <PGBadge tone="yellow">{doc.quiz.length} quiz questions</PGBadge>
        </div>
        <PGCard
          thick
          style={{
            padding: 18,
            background: 'linear-gradient(180deg, #FFFDF8 0%, #F7FFF0 100%)',
          }}
        >
          <div className="study-prose">
            {doc.summary.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </PGCard>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ display: 'flex', gap: 6, padding: 4, background: 'var(--surface-2)', borderRadius: 14, border: '2px solid var(--hairline)' }}>
          {(['summary', 'map', 'cards'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
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
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="no-scrollbar" style={{ flex: 1, overflowY: tab === 'map' ? 'hidden' : 'auto' }}>
        {tab === 'summary' && (
          <div style={{ padding: '4px 20px 110px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PGCard thick style={{ padding: 16 }}>
              <div className="t-h3" style={{ marginBottom: 8 }}>How to use this guide</div>
              <p className="t-body-sm" style={{ color: 'var(--ink-2)', margin: 0 }}>
                Read the recap, open a concept to review its definition, then switch to cards when you want faster repetition.
              </p>
            </PGCard>
            <div className="t-h3" style={{ marginBottom: 0 }}>Key concepts</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {doc.concepts.map((concept, index) => {
                const tone = CONCEPT_CHIP_TONES[index % CONCEPT_CHIP_TONES.length];
                return (
                  <button
                    key={concept.id}
                    onClick={() => setDrawer(concept)}
                    style={{
                      padding: '8px 14px',
                      background: `var(--${tone}-soft)`,
                      color: 'var(--ink)',
                      border: `2px solid var(--${tone === 'yellow' ? 'yellow-dark' : tone})`,
                      borderRadius: 999,
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {concept.term}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {tab === 'map' && <ConceptMap concepts={doc.concepts} activeConceptId={drawer?.id ?? null} onSelect={setDrawer} />}
        {tab === 'cards' && <FlashcardsView doc={doc} />}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 20px 24px',
          background: 'linear-gradient(to top, var(--bg) 80%, transparent)',
          pointerEvents: 'none',
        }}
      >
        <div style={{ pointerEvents: 'auto' }}>
          <PGButton variant="primary" size="lg" fullWidth icon={<Icon.Lightning s={18} />} onClick={startQuiz}>
            Start quiz · {doc.quiz.length} questions
          </PGButton>
        </div>
      </div>

      <ConceptDrawer concept={drawer} concepts={doc.concepts} onClose={() => setDrawer(null)} onSelect={setDrawer} />

      {confirmDelete && (
        <div
          onClick={() => !remove.isPending && setConfirmDelete(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 360,
              background: 'var(--surface)',
              border: '2px solid var(--hairline-strong)',
              borderRadius: 18,
              padding: 18,
              boxShadow: '0 8px 0 var(--hairline)',
            }}
          >
            <div className="t-h3" style={{ marginBottom: 6 }}>Delete this study guide?</div>
            <div className="t-body-sm" style={{ color: 'var(--ink-3)', marginBottom: 14 }}>
              “{doc.title}” will be removed from your library. This can&apos;t be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <PGButton
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setConfirmDelete(false)}
                disabled={remove.isPending}
              >
                Cancel
              </PGButton>
              <PGButton
                variant="primary"
                size="md"
                fullWidth
                icon={<Icon.Trash s={16} />}
                onClick={submitDelete}
                disabled={remove.isPending}
                style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
              >
                {remove.isPending ? 'Deleting…' : 'Delete'}
              </PGButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StudyMenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
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
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = danger
          ? 'var(--red-soft)'
          : 'var(--surface-2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function FlashcardsView({ doc }: { doc: SampleDoc }) {
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
    return (
      <div style={{ padding: '12px 20px 110px' }}>
        <PGCard thick style={{ padding: 18 }}>
          <div className="t-h3" style={{ marginBottom: 8 }}>No flashcards yet</div>
          <p className="t-body-sm" style={{ color: 'var(--ink-2)', margin: 0 }}>
            This study guide did not generate any flashcards for the document.
          </p>
        </PGCard>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 0 110px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <PGBadge tone="blue">Card {i + 1} of {total}</PGBadge>
      </div>
      <p className="t-body-sm" style={{ color: 'var(--ink-3)', margin: '0 24px 16px', textAlign: 'center' }}>
        Flip for the answer, then swipe or use the arrows to move through the deck.
      </p>
      <div style={{ position: 'relative', width: 320, maxWidth: 'calc(100vw - 40px)', height: 250 }}>
        {i > 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'translateX(-30px) scale(0.92) rotate(-4deg)',
              opacity: 0.5,
              background: 'var(--surface)',
              border: '2px solid var(--hairline-strong)',
              borderRadius: 22,
              boxShadow: '0 4px 0 var(--hairline)',
            }}
          />
        )}
        {i < total - 1 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'translateX(30px) scale(0.92) rotate(4deg)',
              opacity: 0.5,
              background: 'var(--surface)',
              border: '2px solid var(--hairline-strong)',
              borderRadius: 22,
              boxShadow: '0 4px 0 var(--hairline)',
            }}
          />
        )}
        <Flashcard
          front={cards[i].front}
          back={cards[i].back}
          index={i}
          total={total}
          onNext={next}
          onPrev={prev}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22 }}>
        <button
          onClick={prev}
          disabled={i === 0}
          style={{
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
          }}
        >
          <Icon.ArrowLeft s={20} />
        </button>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', height: 8 }}>
          {cards.map((_, k) => (
            <div
              key={k}
              style={{
                width: k === i ? 22 : 8,
                height: 8,
                borderRadius: 4,
                background: k === i ? 'var(--green)' : 'var(--hairline-strong)',
                transition: 'all 220ms',
              }}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={i === total - 1}
          style={{
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
          }}
        >
          <Icon.ArrowRight s={20} />
        </button>
      </div>
    </div>
  );
}
