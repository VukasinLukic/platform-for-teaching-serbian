import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { doc, updateDoc } from 'firebase/firestore';
import { X, ArrowUp, ThumbsUp, BookOpen, ClipboardList, CreditCard, MessageCircle } from 'lucide-react';
import Alano from '../mascot/Alano';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { useAuthStore } from '../../store/authStore';
import { useAssistantUiStore } from '../../store/assistantUiStore';
import { getUserCourses } from '../../services/course.service';
import { functions, db } from '../../services/firebase';

// timeout malo veći od najgoreg slučaja na backendu (4 modela x 14s fallback lanac)
const askAsistentCallable = httpsCallable(functions, 'askAsistent', { timeout: 65000 });
const GRADES = [5, 6, 7, 8];
const WAVE_NUDGE_INTERVAL_MS = 90000;
const MAX_NUDGES = 3;
const PANEL_TRANSITION_MS = 260;
const SEEN_STORAGE_KEY = 'alano-widget-seen';

function genId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Bezbedno čitanje viewport media-query-ja (SSR-safe, ne baca ako matchMedia ne postoji)
function matchesQuery(query) {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia(query).matches;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gray-300 alano-typing-dot"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
      <style>{`
        @keyframes alano-typing-kf { 0%, 60%, 100% { opacity: .3; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-2px); } }
        .alano-typing-dot { display: inline-block; animation: alano-typing-kf 1.2s ease-in-out infinite; }
      `}</style>
    </span>
  );
}

function MascotBubbleAvatar() {
  return (
    <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 overflow-hidden">
      <img
        src="/mascot/alano-hero.webp"
        alt=""
        draggable={false}
        className="w-5 h-5 object-contain select-none"
        style={{ WebkitTouchCallout: 'none' }}
      />
    </div>
  );
}

function buildGreeting({ isLoggedIn, firstName, razred, owned, navigate, onPickGrade, onQuickAsk }) {
  if (!isLoggedIn) {
    return {
      id: genId(),
      role: 'assistant',
      content:
        'Ћао! 👋 Ја сам Алано, твој помоћник на платформи Српски у Срцу. Ту сам да ти помогнем око коришћења сајта, курсева и свега што те занима. Шта би желео/-ла да знаш?',
      chips: [
        { label: 'Како функционише платформа?', onClick: () => onQuickAsk('Како функционише платформа?') },
        { label: 'Колико кошта курс?', onClick: () => onQuickAsk('Колико кошта курс?') },
        { label: 'Направи налог', onClick: () => navigate('/register') },
      ],
    };
  }

  if (!razred) {
    return {
      id: genId(),
      role: 'assistant',
      content: `Ћао${firstName ? ', ' + firstName : ''}! 👋 Ту сам да ти помогнем. Реци ми, ког си разреда, па ћу ти давати прецизније предлоге:`,
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
      content: `Ћао, ${firstName}! Видим да си ${razred}. разред и да имаш приступ курсу „${owned[0].title}". Треба ти помоћ око тога, или те занима нешто друго?`,
      chips: [
        { label: 'Настави курс', onClick: () => navigate(`/course/${owned[0].id}`) },
        { label: `Иниц. тест за ${razred}. разред`, onClick: () => navigate(`/inicijalni-test/${razred}`) },
      ],
    };
  }

  return {
    id: genId(),
    role: 'assistant',
    content: `Ћао, ${firstName}! Ти си ${razred}. разред. Могу да ти предложим курс или бесплатан иницијални тест — шта те занима?`,
    chips: [
      { label: 'Погледај курсеве', onClick: () => navigate('/courses') },
      { label: `Иниц. тест за ${razred}. разред`, onClick: () => navigate(`/inicijalni-test/${razred}`) },
    ],
  };
}

function buildQuickActions({ navigate, onQuickAsk }) {
  return [
    { key: 'courses', label: 'Курсеви', icon: BookOpen, bg: 'bg-red-50', fg: 'text-[#D62828]', onClick: () => navigate('/courses') },
    { key: 'tests', label: 'Тестови', icon: ClipboardList, bg: 'bg-amber-50', fg: 'text-amber-600', onClick: () => navigate('/#inicijalni-testovi') },
    { key: 'payment', label: 'Плаћање', icon: CreditCard, bg: 'bg-emerald-50', fg: 'text-emerald-600', onClick: () => onQuickAsk('Како да платим курс?') },
    { key: 'contact', label: 'Контакт', icon: MessageCircle, bg: 'bg-blue-50', fg: 'text-blue-600', onClick: () => navigate('/contact') },
  ];
}

export default function AssistantWidget() {
  const { user, userProfile, refreshUserProfile } = useAuthStore();
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  const setAssistantOpen = useAssistantUiStore((s) => s.setAssistantOpen);

  const [isOpen, setIsOpen] = useState(false);
  const [panelRendered, setPanelRendered] = useState(false);
  const [panelShown, setPanelShown] = useState(false);
  const [launcherPose, setLauncherPose] = useState('idle');
  const [panelPose, setPanelPose] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const nudgeCountRef = useRef(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Obavesti ostale floating elemente (npr. HelpButton) da se sklone dok je chat otvoren
  useEffect(() => {
    setAssistantOpen(isOpen);
  }, [isOpen, setAssistantOpen]);

  // Da li je korisnik ikad ranije otvorio Alana — ako nije, prikaži "Ново" bedž na launcheru
  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_STORAGE_KEY)) setShowBadge(true);
    } catch {
      // localStorage nedostupan (privatni režim i sl.) — bedž jednostavno izostaje
    }
  }, []);

  const openWidget = () => {
    setIsOpen(true);
    if (showBadge) {
      setShowBadge(false);
      try {
        localStorage.setItem(SEEN_STORAGE_KEY, '1');
      } catch {
        // ignoriši — nije kritično
      }
    }
  };

  // Mount/unmount panela sa malim odlaganjem radi glatke enter/exit tranzicije
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

  // Zaključaj skrolovanje pozadine dok je bottom-sheet otvoren na mobilnom
  useEffect(() => {
    if (!isOpen || !matchesQuery('(max-width: 639px)')) return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Escape zatvara widget
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  // Autofokus na input samo na desktopu/tabletu — na mobilnom ne guramo tastaturu odmah
  useEffect(() => {
    if (!isOpen || !matchesQuery('(min-width: 640px)')) return undefined;
    const t = setTimeout(() => inputRef.current?.focus(), PANEL_TRANSITION_MS + 60);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Povremeni "wave" nudge na zatvorenom launcher-u da privuče pažnju
  useEffect(() => {
    if (isOpen) return undefined;
    const interval = setInterval(() => {
      if (nudgeCountRef.current >= MAX_NUDGES) return;
      nudgeCountRef.current += 1;
      setLauncherPose('wave');
    }, WAVE_NUDGE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Personalizovan pozdrav pri prvom otvaranju u sesiji
  useEffect(() => {
    if (!isOpen || greeted) return;
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
      const greeting = buildGreeting({
        isLoggedIn: !!user,
        firstName: userProfile?.ime?.split(' ')?.[0],
        razred: userProfile?.razred,
        owned,
        navigate,
        onPickGrade: handlePickGrade,
        onQuickAsk: (text) => handleSend(text),
      });
      setTimeout(() => setMessages([greeting]), 350);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, greeted]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const handlePickGrade = async (grade) => {
    if (grade && user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { razred: grade });
        await refreshUserProfile();
      } catch (err) {
        console.error('Greška pri čuvanju razreda:', err);
      }
    }
    setMessages((m) => [
      ...m,
      {
        id: genId(),
        role: 'assistant',
        content: grade
          ? `Супер, ${grade}. разред! 🎓 Сад могу боље да ти помогнем.`
          : 'У реду, увек ми касније можеш рећи који си разред. 🙂',
        chips: grade
          ? [
              { label: 'Погледај курсеве', onClick: () => navigate('/courses') },
              { label: `Иниц. тест за ${grade}. разред`, onClick: () => navigate(`/inicijalni-test/${grade}`) },
            ]
          : undefined,
      },
    ]);
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;

    const historyForApi = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((m) => [...m, { id: genId(), role: 'user', content: text }]);
    setInput('');
    setSending(true);

    try {
      const res = await askAsistentCallable({ message: text, history: historyForApi });
      const { ok, reply } = res.data || {};
      setMessages((m) => [...m, { id: genId(), role: 'assistant', content: reply, ok }]);
    } catch (err) {
      console.error('Assistant call failed:', err);
      setMessages((m) => [
        ...m,
        {
          id: genId(),
          role: 'assistant',
          ok: false,
          content: 'Дошло је до грешке на вези 🌐 Пробај поново за тренутак, или нам пиши на /contact.',
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleThumbsUp = (id) => {
    setPanelPose('celebrating');
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, rated: true } : msg)));
  };

  // Mobilni: klizi odozdo na gore. Desktop/tablet: klizi sa DESNE IVICE prozora ka svom
  // mestu (translate-x-full = potpuno van ekrana, pa uklizi ka centru/uglu) — i zatvara se
  // istim putem unazad.
  const panelVisibilityClass = reducedMotion
    ? panelShown
      ? 'opacity-100'
      : 'opacity-0'
    : panelShown
    ? 'opacity-100 translate-y-0 scale-100 sm:translate-x-0'
    : 'opacity-0 translate-y-8 scale-[0.97] sm:translate-y-0 sm:scale-100 sm:translate-x-full';

  const quickActions = buildQuickActions({ navigate, onQuickAsk: (text) => handleSend(text) });
  const showQuickActions = messages.length <= 1 && !sending;

  return (
    <>
      {/* Zatamnjena pozadina na mobilnom — tap za zatvaranje (na desktopu widget ne blokira stranicu) */}
      {panelRendered && (
        <div
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 z-30 bg-black/25 backdrop-blur-[2px] sm:hidden transition-opacity ${
            reducedMotion ? 'duration-100' : 'duration-300'
          } ${panelShown ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        />
      )}

      {!isOpen && (
        <button
          onClick={openWidget}
          className="fixed right-6 z-40 w-16 h-16 rounded-full bg-white shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D62828]/30"
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
          aria-label="Отвори помоћника Алана"
        >
          {!reducedMotion && (
            <span
              className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#D62828] to-[#F2C94C] opacity-25 blur-md alano-launcher-glow"
              aria-hidden="true"
            />
          )}
          <Alano pose={launcherPose} size={52} onPoseEnd={() => setLauncherPose('idle')} />
          {showBadge && (
            <span
              className="absolute -top-1 -right-1 z-10 flex items-center justify-center px-1.5 py-0.5 rounded-full bg-[#F2C94C] text-[#1A1A1A] text-[10px] font-bold shadow-sm border-2 border-white alano-badge-pop"
              aria-hidden="true"
            >
              Ново
            </span>
          )}
          <style>{`
            @keyframes alano-launcher-glow-kf { 0%, 100% { opacity: .18; transform: scale(1); } 50% { opacity: .38; transform: scale(1.06); } }
            .alano-launcher-glow { animation: alano-launcher-glow-kf 3.6s ease-in-out infinite; }
            @keyframes alano-badge-pop-kf { 0% { opacity: 0; transform: scale(0.4); } 70% { transform: scale(1.12); } 100% { opacity: 1; transform: scale(1); } }
            .alano-badge-pop { animation: alano-badge-pop-kf .4s cubic-bezier(.34,1.56,.64,1) .3s backwards; }
          `}</style>
        </button>
      )}

      {panelRendered && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Алано — помоћник"
          aria-hidden={!panelShown}
          className={`fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 z-40 w-full sm:w-[380px] md:w-[400px] lg:w-[420px] h-[85dvh] sm:h-[600px] md:h-[640px] lg:h-[680px] sm:max-h-[80vh] bg-gradient-to-b from-white via-white to-red-50/40 sm:rounded-[28px] rounded-t-[28px] shadow-2xl ring-1 ring-black/5 flex flex-col overflow-hidden border border-gray-100 ${
            reducedMotion ? 'alano-panel-transition-reduced' : 'alano-panel-transition'
          } ${panelVisibilityClass} ${panelShown ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          {/* Drag handle (samo mobilni, dekorativno + tap za zatvaranje) */}
          <button
            onClick={() => setIsOpen(false)}
            className="sm:hidden flex-shrink-0 flex justify-center pt-2.5 pb-1 focus-visible:outline-none"
            aria-label="Затвори"
          >
            <span className="h-1.5 w-10 rounded-full bg-gray-300" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#D62828] to-[#B91F1F] flex-shrink-0">
            <Alano pose={panelPose} size={40} onPoseEnd={() => setPanelPose('idle')} />
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm leading-tight">Алано</div>
              <div className="text-white/80 text-[11px] leading-tight">ту сам да помогнем</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#D62828]"
              aria-label="Затвори"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4"
          >
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && <MascotBubbleAvatar />}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#D62828] text-white rounded-br-sm shadow-sm'
                      : m.ok === false
                      ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-sm'
                      : 'bg-white border border-gray-100 text-[#1A1A1A] rounded-bl-sm shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.content}</div>

                  {m.chips && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {m.chips.map((chip, i) => (
                        <button
                          key={i}
                          onClick={chip.onClick}
                          className="inline-flex items-center min-h-[36px] text-xs font-semibold px-3.5 py-2 rounded-full bg-red-50 text-[#D62828] hover:bg-red-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828] focus-visible:ring-offset-1"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {m.role === 'assistant' && m.ok !== false && !m.rated && (
                    <button
                      onClick={() => handleThumbsUp(m.id)}
                      className="mt-2 -mx-2 -my-1 px-2 py-1 flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#D62828] transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62828]/40"
                    >
                      <ThumbsUp className="w-3 h-3" /> Корисно
                    </button>
                  )}
                  {m.rated && <div className="mt-2 text-[11px] text-green-600 font-medium">Хвала ти! ❤️</div>}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start">
                <MascotBubbleAvatar />
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Brze radnje — vidljivo dok je razgovor tek počeo */}
          {showQuickActions && (
            <div className="flex-shrink-0 flex items-stretch justify-between gap-1.5 px-4 pt-1 pb-2.5">
              {quickActions.map((qa) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.key}
                    onClick={qa.onClick}
                    className="flex-1 flex flex-col items-center gap-1.5 group focus-visible:outline-none"
                  >
                    <span
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center ${qa.bg} ${qa.fg} shadow-sm group-hover:scale-105 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-[#D62828]/40 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-semibold text-gray-500 group-hover:text-[#1A1A1A] transition-colors">
                      {qa.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 px-3 pt-3 border-t border-gray-100 bg-white/80 backdrop-blur-sm flex-shrink-0"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Питај ме било шта..."
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#D62828] focus-visible:ring-2 focus-visible:ring-[#D62828]/20 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-[#D62828] to-[#F2825C] text-white flex items-center justify-center disabled:opacity-40 disabled:grayscale hover:shadow-lg active:scale-95 transition-all flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C94C] focus-visible:ring-offset-2"
              aria-label="Пошаљи"
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </form>

          <style>{`
            .alano-panel-transition {
              transition-property: opacity, transform;
              transition-duration: 420ms;
              transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
            }
            .alano-panel-transition-reduced {
              transition-property: opacity;
              transition-duration: 100ms;
              transition-timing-function: ease-out;
            }
          `}</style>
        </div>
      )}
    </>
  );
}
