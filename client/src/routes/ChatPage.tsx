import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthNav } from '../components/AuthNav';
import { Sage } from '../components/Sage';
import { SettingsMenu } from '../components/SettingsMenu';
import { Icon } from '../components/icons';
import { PGNav } from '../components/primitives';
import { useSageChat, type ChatMessage } from '../lib/queries';

const SUGGESTIONS = [
  'Explain ATP synthase like I forgot biology.',
  'What caused the French Revolution?',
  'Why does DFS use a stack?',
  'Give me a 30-second recap of supply & demand.',
];

const GREETING: ChatMessage = {
  role: 'assistant',
  content: "Hey, I'm Sage — your pocket professor. Ask me anything about what you're studying. I'll keep it short and clear.",
};

export default function ChatPage() {
  const navigate = useNavigate();
  const chat = useSageChat();
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, chat.isPending]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || chat.isPending) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setDraft('');
    setError(null);
    const forServer = next.slice(1);
    chat.mutate(
      { messages: forServer },
      {
        onSuccess: ({ reply }) => {
          setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
        },
        onError: (e) => {
          setError(e.message || 'Sage hit a snag — try again in a sec.');
        },
      },
    );
    inputRef.current?.focus();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(draft);
    }
  };

  const showSuggestions = messages.length <= 1 && !chat.isPending;

  return (
    <div className="pg-shell">
      <PGNav
        left={<SettingsMenu />}
        title={<ChatTitle />}
        right={<AuthNav />}
      />

      <div
        ref={scrollRef}
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} content={m.content} />
        ))}
        {chat.isPending && <TypingBubble />}
        {error && (
          <div
            style={{
              alignSelf: 'flex-start',
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: 16,
              background: 'var(--red-soft, #FFE3E3)',
              border: '2px solid var(--red, #E54545)',
              color: 'var(--red, #B12C2C)',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        )}

        {showSuggestions && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="t-eyebrow" style={{ marginLeft: 4 }}>Try asking</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    background: 'var(--surface)',
                    border: '2px solid var(--hairline-strong)',
                    boxShadow: '0 3px 0 var(--hairline-strong)',
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--ink)',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          padding: '10px 14px 18px',
          borderTop: '2px solid var(--hairline)',
          background: 'var(--surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
            background: 'var(--surface-2)',
            border: '2px solid var(--hairline-strong)',
            borderRadius: 18,
            padding: '8px 10px 8px 14px',
          }}
        >
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask Sage anything…"
            rows={1}
            disabled={chat.isPending}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              resize: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--ink)',
              maxHeight: 140,
              padding: '8px 0',
              lineHeight: 1.4,
            }}
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim() || chat.isPending}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: !draft.trim() || chat.isPending ? 'var(--hairline-strong)' : 'var(--green)',
              color: 'white',
              border: 'none',
              boxShadow: !draft.trim() || chat.isPending ? 'none' : '0 3px 0 var(--green-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: !draft.trim() || chat.isPending ? 'not-allowed' : 'pointer',
              flex: '0 0 auto',
            }}
          >
            <Icon.Send s={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => navigate('/app')}
            style={pillBtnStyle}
          >
            <Icon.Camera s={14} /> Snap notes
          </button>
          <button
            type="button"
            onClick={() => navigate('/study/sample')}
            style={pillBtnStyle}
          >
            <Icon.Library s={14} /> Sample guide
          </button>
        </div>
      </form>
    </div>
  );
}

function ChatTitle() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Sage pose="happy" size={28} animated={false} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.05 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 900, fontSize: 16, color: 'var(--ink)' }}>Sage</span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
          }}
        >
          Your pocket professor
        </span>
      </div>
    </div>
  );
}

function Bubble({ role, content }: { role: 'user' | 'assistant'; content: string }) {
  if (role === 'user') {
    return (
      <div style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 18,
            borderBottomRightRadius: 6,
            background: 'var(--green)',
            color: 'white',
            border: '2px solid var(--green-dark)',
            boxShadow: '0 3px 0 var(--green-dark)',
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.45,
            whiteSpace: 'pre-wrap',
          }}
        >
          {content}
        </div>
      </div>
    );
  }
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '90%', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <div style={{ flex: '0 0 auto', marginTop: 2 }}>
        <Sage pose="read" size={36} animated={false} />
      </div>
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 18,
          borderBottomLeftRadius: 6,
          background: 'var(--surface)',
          color: 'var(--ink)',
          border: '2px solid var(--hairline-strong)',
          boxShadow: '0 3px 0 var(--hairline-strong)',
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
      <Sage pose="think" size={36} animated />
      <div
        style={{
          padding: '10px 14px',
          borderRadius: 18,
          borderBottomLeftRadius: 6,
          background: 'var(--surface)',
          border: '2px solid var(--hairline-strong)',
          boxShadow: '0 3px 0 var(--hairline-strong)',
          display: 'inline-flex',
          gap: 4,
        }}
      >
        <Dot delay={0} />
        <Dot delay={120} />
        <Dot delay={240} />
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: 'var(--ink-3)',
        animation: 'pg-typing-bounce 900ms ease-in-out infinite',
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

const pillBtnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 999,
  background: 'var(--surface)',
  border: '2px solid var(--hairline-strong)',
  boxShadow: '0 2px 0 var(--hairline-strong)',
  fontSize: 12,
  fontWeight: 800,
  color: 'var(--ink-2)',
  cursor: 'pointer',
};
