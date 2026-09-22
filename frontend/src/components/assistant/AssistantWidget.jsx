import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { doc, updateDoc } from 'firebase/firestore';
import {
  ArrowUp,
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  CircleHelp,
  RotateCcw,
  Sparkles,
  ThumbsUp,
  X,
} from 'lucide-react';
import Alano from '../mascot/Alano';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { useAuthStore } from '../../store/authStore';
import { useAssistantUiStore } from '../../store/assistantUiStore';
import { getUserCourses } from '../../services/course.service';
import { functions, db } from '../../services/firebase';
import './AssistantWidget.css';

// Timeout je malo veći od najgoreg slučaja na backendu (5 modela x 12s fallback lanac).
const askAsistentCallable = httpsCallable(functions, 'askAsistent', { timeout: 75000 });
const GRADES = [5, 6, 7, 8];
const PANEL_TRANSITION_MS = 360;

function genId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function matchesQuery(query) {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(query).matches;
}

const THINKING_WORDS = ['Размишљам', 'Смишљам', 'Мозгам', 'Претражујем', 'Сричем одговор'];
const TYPE_SPEED_MS = 55;
const DELETE_SPEED_MS = 32;
const HOLD_MS = 700;

// Kucanje-brisanje petlja kroz slatke reči dok Alano "razmišlja" — zamena za suvoparne
// tri tačkice, u duhu maskote.
function ThinkingText() {
  const [text, setText] = useState('');
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setText(THINKING_WORDS[0]);
      return undefined;
    }
    let wordIndex = 0;
    let charIndex = 0;
    let phase = 'typing';
    let timer;

    const tick = () => {
      const word = THINKING_WORDS[wordIndex];
      if (phase === 'typing') {
        charIndex += 1;
        setText(word.slice(0, charIndex));
        if (charIndex >= word.length) {
          phase = 'holding';
          timer = setTimeout(tick, HOLD_MS);
          return;
        }
        timer = setTimeout(tick, TYPE_SPEED_MS);
        return;
      }
      if (phase === 'holding') {
        phase = 'deleting';
        timer = setTimeout(tick, DELETE_SPEED_MS);
        return;
      }
      // deleting
      charIndex -= 1;
      setText(word.slice(0, charIndex));
      if (charIndex <= 0) {
        wordIndex = (wordIndex + 1) % THINKING_WORDS.length;
        phase = 'typing';
        timer = setTimeout(tick, TYPE_SPEED_MS);
        return;
      }
      timer = setTimeout(tick, DELETE_SPEED_MS);
    };

    timer = setTimeout(tick, TYPE_SPEED_MS);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <span className="alano-thinking" aria-label="Алано пише">
      {text}
      <span className="alano-thinking-cursor">|</span>
    </span>
  );
}

function MascotBubbleAvatar() {
  return (
    <div className="alano-message-avatar" aria-hidden="true">
      <img src="/mascot/alano-hero.webp" alt="" draggable={false} />
    </div>
  );
}

function buildGreeting({ isLoggedIn, firstName, razred, owned, navigate, onPickGrade, onQuickAsk }) {
  if (!isLoggedIn) {
    return {
      id: genId(),
      role: 'assistant',
      content:
        'Ћао! 👋 Ја сам Алано, твој помоћник на платформи Српски у срцу. Ту сам за курсеве, тестове и све што те занима. Како могу да ти помогнем?',
      chips: [
        { label: 'Како ради платформа?', onClick: () => onQuickAsk('Како функционише платформа?') },
        { label: 'Колико кошта курс?', onClick: () => onQuickAsk('Колико кошта курс?') },
        { label: 'Направи налог', onClick: () => navigate('/register') },
      ],
    };
  }

  if (!razred) {
    return {
      id: genId(),
      role: 'assistant',
      content: `Ћао${firstName ? `, ${firstName}` : ''}! 👋 Реци ми који си разред, па ћу ти давати прецизније предлоге:`,
      chips: [
        ...GRADES.map((g) => ({ label: `${g}. разред`, onClick: () => onPickGrade(g) })),
        { label: 'Прескочи', onClick: () => onPickGrade(null) },
      ],
    };
  }

  if (owned?.length) {
    return {
      id: genId(),
      role: 'assistant',
      content: `Ћао, ${firstName}! 👋 Твој курс „${owned[0].title}” те чека. Можемо да наставимо тамо где си стао/-ла или да решимо неку недоумицу.`,
      chips: [
        { label: 'Настави курс', onClick: () => navigate(`/course/${owned[0].id}`) },
        { label: `Тест за ${razred}. разред`, onClick: () => navigate(`/inicijalni-test/${razred}`) },
      ],
    };
  }

  return {
    id: genId(),
    role: 'assistant',
    content: `Ћао, ${firstName}! 👋 За ${razred}. разред могу да ти предложим курс или бесплатан иницијални тест. Шта желиш прво?`,
    chips: [
      { label: 'Погледај курсеве', onClick: () => navigate('/courses') },
      { label: `Тест за ${razred}. разред`, onClick: () => navigate(`/inicijalni-test/${razred}`) },
    ],
  };
}

function buildQuickActions({ navigate, onFocusInput, firstOwnedCourse, razred, isLoggedIn }) {
  return [
    {
      key: 'courses',
      label: firstOwnedCourse ? 'Настави курс' : 'Пронађи курс',
      description: firstOwnedCourse ? 'Ту где си стао/-ла' : 'Изабери програм за себе',
      icon: BookOpen,
      tone: 'rose',
      onClick: () => navigate(firstOwnedCourse ? `/course/${firstOwnedCourse.id}` : '/courses'),
    },
    {
      key: 'schedule',
      label: 'Распоред часова',
      description: isLoggedIn ? 'Погледај своје термине' : 'Сазнај више о настави',
      icon: CalendarDays,
      tone: 'blue',
      onClick: () => navigate(isLoggedIn ? '/dashboard' : '/online-nastava'),
    },
    {
      key: 'test',
      label: 'Мини тест',
      description: 'Провери своје знање',
      icon: ChartNoAxesColumnIncreasing,
      tone: 'mint',
      onClick: () => navigate(razred ? `/inicijalni-test/${razred}` : '/#inicijalni-testovi'),
    },
    {
      key: 'question',
      label: 'Постави питање',
      description: 'Ту сам за све недоумице',
      icon: CircleHelp,
      tone: 'violet',
      onClick: onFocusInput,
    },
  ];
}

export default function AssistantWidget() {
  const { user, userProfile, refreshUserProfile } = useAuthStore();
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  // isOpen živi u deljenom store-u — otvara ga i QuickDock (leva traka/donja traka), ne
  // samo widget sam po sebi.
  const isOpen = useAssistantUiStore((s) => s.isOpen);
  const setAssistantOpen = useAssistantUiStore((s) => s.setAssistantOpen);

  const [panelRendered, setPanelRendered] = useState(false);
  const [panelShown, setPanelShown] = useState(false);
  const [panelPose, setPanelPose] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [ownedCourses, setOwnedCourses] = useState([]);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const closeWidget = () => setAssistantOpen(false);

  const navigateFromWidget = (path) => {
    closeWidget();
    navigate(path);
  };

  useEffect(() => {
    let raf;
    let timer;
    if (isOpen) {
      setPanelRendered(true);
      raf = requestAnimationFrame(() => setPanelShown(true));
    } else {
      setPanelShown(false);
      timer = setTimeout(() => setPanelRendered(false), PANEL_TRANSITION_MS);
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  // Panel je modal na svim širinama, zato pozadina ostaje mirna dok je otvoren.
  useEffect(() => {
    if (!isOpen) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeWidget();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !matchesQuery('(min-width: 640px)')) return undefined;
    const timer = setTimeout(() => inputRef.current?.focus(), PANEL_TRANSITION_MS + 80);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || greeted) return undefined;
    let cancelled = false;
    setGreeted(true);
    setPanelPose('wave');

    (async () => {
      let owned = [];
      if (user) {
        try {
          owned = await getUserCourses(user.uid);
        } catch {
          owned = [];
        }
      }
      if (cancelled) return;
      setOwnedCourses(owned);
      const greeting = buildGreeting({
        isLoggedIn: !!user,
        firstName: userProfile?.ime?.split(' ')?.[0],
        razred: userProfile?.razred,
        owned,
        navigate: navigateFromWidget,
        onPickGrade: handlePickGrade,
        onQuickAsk: (text) => handleSend(text),
      });
      setMessages([greeting]);
    })();

    return () => {
      cancelled = true;
    };
    // Funkcije koriste uvek aktuelno stanje iz rendera u kom je pozdrav pokrenut.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, greeted]);

  useEffect(() => {
    if (messages.length <= 1 && !sending) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const handlePickGrade = async (grade) => {
    if (grade && user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { razred: grade });
        await refreshUserProfile();
      } catch (err) {
        console.error('Грешка при чувању разреда:', err);
      }
    }
    setMessages((current) => [
      ...current,
      {
        id: genId(),
        role: 'assistant',
        content: grade
          ? `Супер, ${grade}. разред! 🎓 Сада могу још боље да ти помогнем.`
          : 'У реду — увек ми касније можеш рећи који си разред. 🙂',
        chips: grade
          ? [
              { label: 'Погледај курсеве', onClick: () => navigateFromWidget('/courses') },
              { label: `Тест за ${grade}. разред`, onClick: () => navigateFromWidget(`/inicijalni-test/${grade}`) },
            ]
          : undefined,
      },
    ]);
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const historyForApi = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .slice(-6)
      .map((message) => ({ role: message.role, content: message.content }));

    setMessages((current) => [...current, { id: genId(), role: 'user', content: text }]);
    setInput('');
    setSending(true);

    try {
      const response = await askAsistentCallable({ message: text, history: historyForApi });
      const { ok, reply } = response.data || {};
      setMessages((current) => [...current, { id: genId(), role: 'assistant', content: reply, ok }]);
    } catch (err) {
      console.error('Assistant call failed:', err);
      setMessages((current) => [
        ...current,
        {
          id: genId(),
          role: 'assistant',
          ok: false,
          content: 'Дошло је до грешке на вези 🌐 Покушај поново за тренутак или нам пиши преко контакт странице.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleThumbsUp = (id) => {
    setPanelPose('celebrating');
    setMessages((current) => current.map((message) => (message.id === id ? { ...message, rated: true } : message)));
  };

  const handleResetConversation = () => {
    if (sending) return;
    setMessages([]);
    setInput('');
    setGreeted(false);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickActions = buildQuickActions({
    navigate: navigateFromWidget,
    onFocusInput: () => inputRef.current?.focus(),
    firstOwnedCourse: ownedCourses[0],
    razred: userProfile?.razred,
    isLoggedIn: !!user,
  });
  const showWelcome = messages.length <= 1 && !sending;

  const backdropClass = panelShown ? 'is-visible' : '';
  const panelClass = panelShown ? 'is-visible' : '';

  return (
    <>
      {panelRendered && (
        <>
          <button
            type="button"
            className={`alano-backdrop ${backdropClass} ${reducedMotion ? 'reduce-motion' : ''}`}
            onClick={closeWidget}
            aria-label="Затвори помоћника"
            tabIndex={panelShown ? 0 : -1}
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Алано — AI помоћник платформе Српски у срцу"
            aria-hidden={!panelShown}
            className={`alano-panel ${panelClass} ${reducedMotion ? 'reduce-motion' : ''}`}
          >
            <header className="alano-header">
              <div className="alano-brand">
                <span className="alano-brand-mark">
                  <img src="/logoICON.svg" alt="" />
                </span>
                <span className="alano-brand-copy">
                  <strong>Српски у срцу</strong>
                  <small><Sparkles size={11} /> AI помоћник Алано</small>
                </span>
              </div>

              <div className="alano-header-actions">
                <button
                  type="button"
                  onClick={handleResetConversation}
                  disabled={sending}
                  aria-label="Нови разговор"
                  title="Нови разговор"
                >
                  <RotateCcw size={18} />
                </button>
                <button type="button" onClick={closeWidget} aria-label="Затвори" title="Затвори">
                  <X size={20} />
                </button>
              </div>
            </header>

            <div ref={scrollRef} role="log" aria-live="polite" className="alano-conversation">
              <div className="alano-conversation-inner">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`alano-message-row ${message.role === 'user' ? 'is-user' : 'is-assistant'}`}
                  >
                    {message.role === 'assistant' && <MascotBubbleAvatar />}
                    <div
                      className={`alano-message ${
                        message.role === 'user' ? 'is-user' : message.ok === false ? 'is-error' : 'is-assistant'
                      }`}
                    >
                      <div className="alano-message-text">{message.content}</div>

                      {message.chips && (
                        <div className="alano-chips">
                          {message.chips.map((chip, index) => (
                            <button type="button" key={`${message.id}-${index}`} onClick={chip.onClick}>
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {message.role === 'assistant' && message.ok !== false && !message.rated && (
                        <button type="button" className="alano-helpful" onClick={() => handleThumbsUp(message.id)}>
                          <ThumbsUp size={12} /> Корисно
                        </button>
                      )}
                      {message.rated && <div className="alano-thanks">Хвала ти! ♥</div>}
                    </div>
                  </div>
                ))}

                {sending && (
                  <div className="alano-message-row is-assistant">
                    <MascotBubbleAvatar />
                    <div className="alano-message is-assistant alano-typing-bubble">
                      <ThinkingText />
                    </div>
                  </div>
                )}

                {showWelcome && (
                  <div className="alano-welcome">
                    <div className="alano-quick-actions" aria-label="Брзе опције">
                      {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            type="button"
                            key={action.key}
                            className={`alano-action-card tone-${action.tone}`}
                            onClick={action.onClick}
                          >
                            <span className="alano-action-icon"><Icon size={22} strokeWidth={2} /></span>
                            <span className="alano-action-copy">
                              <strong>{action.label}</strong>
                              <small>{action.description}</small>
                            </span>
                            <ChevronRight className="alano-action-arrow" size={20} strokeWidth={2.2} />
                          </button>
                        );
                      })}
                    </div>

                    <div className="alano-mascot-stage" aria-hidden="true">
                      <span className="alano-stage-copy">Знање<br />је у теби!</span>
                      <Alano
                        pose={panelPose}
                        size={270}
                        className="alano-stage-mascot"
                        onPoseEnd={() => setPanelPose('idle')}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="alano-composer-wrap">
              <form
                className="alano-composer"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSend();
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Постави ми питање..."
                  disabled={sending}
                  aria-label="Порука за Алана"
                />
                <button type="submit" disabled={sending || !input.trim()} aria-label="Пошаљи поруку">
                  <ArrowUp size={21} strokeWidth={2.5} />
                </button>
              </form>
              <p>Алано може да погреши — важне информације додатно провери.</p>
            </div>
          </section>
        </>
      )}
    </>
  );
}
