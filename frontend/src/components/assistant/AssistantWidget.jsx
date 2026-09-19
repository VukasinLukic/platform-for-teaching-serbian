import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { doc, updateDoc } from 'firebase/firestore';
import { X, Send, ThumbsUp } from 'lucide-react';
import Alano from '../mascot/Alano';
import { useAuthStore } from '../../store/authStore';
import { getUserCourses } from '../../services/course.service';
import { functions, db } from '../../services/firebase';

// timeout malo veći od najgoreg slučaja na backendu (4 modela x 14s fallback lanac)
const askAsistentCallable = httpsCallable(functions, 'askAsistent', { timeout: 65000 });
const GRADES = [5, 6, 7, 8];
const WAVE_NUDGE_INTERVAL_MS = 90000;
const MAX_NUDGES = 3;

function genId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

export default function AssistantWidget() {
  const { user, userProfile, refreshUserProfile } = useAuthStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [launcherPose, setLauncherPose] = useState('idle');
  const [panelPose, setPanelPose] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [greeted, setGreeted] = useState(false);

  const nudgeCountRef = useRef(0);
  const scrollRef = useRef(null);

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

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-white shadow-xl border border-gray-100 hover:scale-105 transition-transform flex items-center justify-center"
          aria-label="Отвори помоћника Алана"
        >
          <Alano pose={launcherPose} size={52} onPoseEnd={() => setLauncherPose('idle')} />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-6 sm:right-6 z-40 w-full sm:w-[380px] h-[85vh] sm:h-[600px] sm:max-h-[80vh] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#D62828] to-[#B91F1F] flex-shrink-0">
            <Alano pose={panelPose} size={40} onPoseEnd={() => setPanelPose('idle')} />
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm">Алано</div>
              <div className="text-white/80 text-[11px]">ту сам да помогнем</div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Затвори"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#fdfafc]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <img src="/mascot/alano-hero.webp" alt="" className="w-6 h-6 mr-2 mt-1 flex-shrink-0" />
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#D62828] text-white rounded-br-sm'
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
                          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-[#D62828] hover:bg-red-100 transition-colors"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {m.role === 'assistant' && m.ok !== false && !m.rated && (
                    <button
                      onClick={() => handleThumbsUp(m.id)}
                      className="mt-2 flex items-center gap-1 text-[11px] text-gray-400 hover:text-[#D62828] transition-colors"
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
                <img src="/mascot/alano-hero.webp" alt="" className="w-6 h-6 mr-2 mt-1 flex-shrink-0" />
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white flex-shrink-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Постави питање..."
              disabled={sending}
              className="flex-1 px-4 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#D62828] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="w-10 h-10 rounded-full bg-[#D62828] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#B91F1F] transition-colors flex-shrink-0"
              aria-label="Пошаљи"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
