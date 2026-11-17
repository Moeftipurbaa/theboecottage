import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

const ADMIN_WA_LINK = 'https://wa.me/628214441271';
const SESSION_KEY = 'the_boe_ai_chat_session';
const HISTORY_KEY = 'the_boe_ai_chat_history';

const SUGGESTION_CHIPS = [
    'Perbedaan Daisy & Lily',
    'Harga & Cara Bayar',
    'Fasilitas Villa',
    'Paket BBQ & Steamboat',
    'Menu Breakfast',
    'Rekomendasi Wisata',
    'Cek Ketersediaan Kamar',
];

const INITIAL_BOT_MESSAGE = {
    sender: 'bot',
    text: 'Salam hangat dari **The Boe Cottage Dieng**.\n\nSaya adalah asisten virtual AI Anda yang siap melayani 24/7. Anda dapat menanyakan tentang detail kamar (**Daisy** & **Lily**), tarif, fasilitas lengkap, paket BBQ & Steamboat, sarapan, maupun rekomendasi tempat wisata di Dieng.\n\nSilakan pilih topik di bawah atau ketik pertanyaan Anda langsung!',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

function renderFormattedText(text) {
    if (!text) return null;

    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
        const trimmed = line.trim();
        if (trimmed === '') {
            return <div key={`spacer-${lineIndex}`} className="h-2" />;
        }

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\.\s/.test(trimmed);
        const cleanLine = isBullet
            ? trimmed.replace(/^[•\-]\s*/, '').replace(/^\d+\.\s*/, '')
            : line;

        const elements = [];
        const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g;
        let lastIdx = 0;
        let match;

        while ((match = regex.exec(cleanLine)) !== null) {
            if (match.index > lastIdx) {
                elements.push(cleanLine.substring(lastIdx, match.index));
            }

            const token = match[0];
            if (token.startsWith('[') && token.endsWith(')')) {
                const linkMatch = token.match(/^\[(.*?)\]\((.*?)\)$/);
                if (linkMatch) {
                    const [, label, href] = linkMatch;
                    const isExternal = href.startsWith('http') || href.startsWith('https://wa.me');
                    elements.push(
                        <a
                            key={`link-${lineIndex}-${match.index}`}
                            href={href}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                            className="font-medium text-[#AE8A66] underline decoration-[#AE8A66]/60 hover:text-[#8C6D4F] transition-colors"
                        >
                            {label}
                        </a>
                    );
                }
            } else if (token.startsWith('**') && token.endsWith('**')) {
                const boldContent = token.slice(2, -2);
                elements.push(
                    <strong key={`bold-${lineIndex}-${match.index}`} className="font-semibold text-[#1E322A]">
                        {boldContent}
                    </strong>
                );
            }

            lastIdx = regex.lastIndex;
        }

        if (lastIdx < cleanLine.length) {
            elements.push(cleanLine.substring(lastIdx));
        }

        if (isBullet) {
            return (
                <div key={`bullet-${lineIndex}`} className="flex items-start gap-1.5 my-1 text-[13px] leading-relaxed">
                    <span className="text-[#AE8A66] font-bold mt-0.5 select-none">•</span>
                    <div className="flex-1 text-[#2B3530]">{elements}</div>
                </div>
            );
        }

        return (
            <p key={`p-${lineIndex}`} className="my-1 text-[13px] leading-relaxed text-[#2B3530]">
                {elements}
            </p>
        );
    });
}

function WhatsAppIcon({ className = 'h-3.5 w-3.5' }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.488-8.414z" />
        </svg>
    );
}

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_BOT_MESSAGE]);
    const [inputQuery, setInputQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState('');
    const [hasUnread, setHasUnread] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Load session and chat history from sessionStorage on mount
    useEffect(() => {
        try {
            const savedSession = sessionStorage.getItem(SESSION_KEY);
            if (savedSession) {
                setSessionId(savedSession);
            }

            const savedHistory = sessionStorage.getItem(HISTORY_KEY);
            if (savedHistory) {
                const parsed = JSON.parse(savedHistory);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                }
            }
        } catch {
            // Ignore sessionStorage parse errors
        }
    }, []);

    // Save history when messages change
    useEffect(() => {
        try {
            if (messages.length > 1) {
                sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
            }
        } catch {
            // Ignore write errors
        }
    }, [messages]);

    // Save session id when generated
    useEffect(() => {
        if (sessionId) {
            try {
                sessionStorage.setItem(SESSION_KEY, sessionId);
            } catch {
                // Ignore write errors
            }
        }
    }, [sessionId]);

    // Auto scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setHasUnread(false);
        }
    }, [messages, isOpen, isLoading]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 200);
        }
    }, [isOpen]);

    const handleSendMessage = async (textToSend) => {
        const query = (textToSend || inputQuery).trim();
        if (!query || isLoading) return;

        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const userMsg = {
            sender: 'user',
            text: query,
            time: timeNow,
        };

        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        setInputQuery('');
        setIsLoading(true);

        try {
            const response = await axios.post('/api/ai-chat', {
                message: query,
                session_id: sessionId || null,
            });

            if (response.data?.session_id) {
                setSessionId(response.data.session_id);
            }

            const botReplyText = response.data?.reply || 'Terima kasih atas pesan Anda. Silakan hubungi admin kami untuk informasi lebih lanjut.';
            const botMsg = {
                sender: 'bot',
                text: botReplyText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages([...nextMessages, botMsg]);

            if (!isOpen) {
                setHasUnread(true);
            }
        } catch (error) {
            console.error('AI Concierge error:', error);
            const errorMsg = {
                sender: 'bot',
                text: 'Maaf, terjadi gangguan sementara pada koneksi AI Concierge. Anda dapat menghubungi [WhatsApp Admin kami di 0821 4441 271](https://wa.me/628214441271) untuk respon instan.',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages([...nextMessages, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetChat = () => {
        setMessages([INITIAL_BOT_MESSAGE]);
        try {
            sessionStorage.removeItem(HISTORY_KEY);
            sessionStorage.removeItem(SESSION_KEY);
        } catch {
            // Ignore
        }
        setSessionId('');
    };

    return (
        <aside aria-label="AI Concierge 24/7" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
            {/* Expanded Chat Box */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-label="The Boe Cottage AI Concierge Chat"
                    className="flex flex-col w-[calc(100vw-2.5rem)] sm:w-[410px] h-[550px] max-h-[82vh] bg-[#F1ECE0] rounded-2xl shadow-2xl border border-[#DCD8CF] overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
                >
                    {/* Header */}
                    <div className="bg-[#1E322A] px-4 py-3.5 flex items-center justify-between text-[#F1ECE0] border-b border-[#346B55]/50">
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#346B55] border border-[#AE8A66]/60 text-[#AE8A66]">
                                <span className="font-serif text-[11px] font-bold tracking-tight">Boe</span>
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#1E322A]" />
                            </div>
                            <div>
                                <h3 className="font-serif text-sm font-semibold tracking-wide text-white">
                                    The Boe Concierge
                                </h3>
                                <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>Online 24/7 • Dataran Tinggi Dieng</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Direct WhatsApp Admin Action */}
                            <a
                                href={ADMIN_WA_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Chat Admin via WhatsApp"
                                aria-label="Chat WhatsApp Admin 0821 4441 271"
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#346B55] hover:bg-[#285342] text-[10px] font-medium text-emerald-100 transition-colors"
                            >
                                <WhatsAppIcon className="h-3 w-3 text-emerald-300" />
                                <span className="hidden sm:inline">Admin WA</span>
                            </a>

                            {/* Reset conversation */}
                            <button
                                type="button"
                                onClick={handleResetChat}
                                title="Mulai ulang percakapan"
                                aria-label="Mulai ulang percakapan"
                                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" className="h-3.5 w-3.5">
                                    <path d="M3.5 10a6.5 6.5 0 1 1 1.9 4.6l-2.4 2.4m.5-6h6v-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>

                            {/* Close/Minimize */}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                title="Tutup chat"
                                aria-label="Tutup chat"
                                className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" className="h-4 w-4">
                                    <path d="M5 15L15 5M5 5l10 10" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 text-sm">
                        {messages.map((msg, index) => {
                            const isUser = msg.sender === 'user';
                            return (
                                <div
                                    key={index}
                                    className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!isUser && (
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E322A] text-[#AE8A66] text-[10px] font-serif font-bold shadow-xs">
                                            B
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                                            isUser
                                                ? 'bg-[#1E322A] text-white rounded-tr-none'
                                                : 'bg-white text-[#1E322A] border border-[#E3DCD0] rounded-tl-none'
                                        }`}
                                    >
                                        <div className="text-[13px] leading-relaxed break-words">
                                            {isUser ? (
                                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                            ) : (
                                                renderFormattedText(msg.text)
                                            )}
                                        </div>
                                        <div
                                            className={`mt-1 text-[9px] text-right ${
                                                isUser ? 'text-white/60' : 'text-[#8C928A]'
                                            }`}
                                        >
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="flex items-start gap-2 justify-start">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E322A] text-[#AE8A66] text-[10px] font-serif font-bold">
                                    B
                                </div>
                                <div className="bg-white border border-[#E3DCD0] rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#AE8A66] animate-bounce [animation-delay:-0.3s]" />
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#AE8A66] animate-bounce [animation-delay:-0.15s]" />
                                        <span className="h-1.5 w-1.5 rounded-full bg-[#AE8A66] animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="border-t border-[#DCD8CF]/60 bg-[#EBE5D8]/60 px-3 py-2">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-medium tracking-wider text-[#666A64] uppercase">
                                Topik Populer
                            </span>
                            <span className="text-[9px] text-[#AE8A66]">Klik untuk bertanya</span>
                        </div>
                        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                            {SUGGESTION_CHIPS.map((chip) => (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => handleSendMessage(chip)}
                                    disabled={isLoading}
                                    className="shrink-0 px-2.5 py-1 rounded-full bg-white border border-[#D5CDC0] text-[#1E322A] text-[11px] font-medium hover:border-[#AE8A66] hover:bg-[#F8F5EE] active:scale-95 transition-all disabled:opacity-50 shadow-2xs"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat Input */}
                    <div className="bg-white px-3 py-2.5 border-t border-[#DCD8CF]">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSendMessage();
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputQuery}
                                onChange={(e) => setInputQuery(e.target.value)}
                                placeholder="Ketik pertanyaan seputar cottage..."
                                disabled={isLoading}
                                className="flex-1 rounded-xl border border-[#D5CDC0] bg-[#F8F5EE] px-3 py-2 text-xs text-[#1E322A] placeholder-[#8C928A] focus:border-[#346B55] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#346B55] transition-all disabled:opacity-60"
                            />
                            <button
                                type="submit"
                                disabled={!inputQuery.trim() || isLoading}
                                aria-label="Kirim pesan"
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#1E322A] text-white hover:bg-[#346B55] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                            >
                                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" className="h-4 w-4">
                                    <path d="M3.5 10l13-6-4.5 13-3-4.5-5.5-2.5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </form>
                        <div className="mt-1.5 flex items-center justify-between text-[9px] text-[#777B75]">
                            <span>The Boe Cottage Concierge 24/7</span>
                            <a
                                href={ADMIN_WA_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#346B55] font-medium hover:underline"
                            >
                                <WhatsAppIcon className="h-2.5 w-2.5" />
                                <span>WA Admin: 0821 4441 271</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Trigger Button */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Buka AI Virtual Concierge 24/7"
                    className="group relative flex items-center gap-2.5 rounded-full bg-[#1E322A] px-4 py-3 text-white shadow-xl hover:bg-[#284439] hover:shadow-2xl active:scale-95 transition-all duration-300 border border-[#AE8A66]/50"
                >
                    {/* Pulsing indicator */}
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </span>

                    {/* Icon */}
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#346B55] text-[#AE8A66]">
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-4 w-4">
                            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    {/* Text Label */}
                    <div className="text-left">
                        <p className="font-serif text-xs font-semibold leading-tight text-white">
                            AI Concierge
                        </p>
                        <p className="font-sans text-[9px] font-medium tracking-wider text-[#AE8A66]">
                            24/7 Virtual Host
                        </p>
                    </div>

                    {/* Unread badge */}
                    {hasUnread && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-xs">
                            !
                        </span>
                    )}
                </button>
            )}
        </aside>
    );
}

