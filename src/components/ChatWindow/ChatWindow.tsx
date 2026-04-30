import { MessageSquareText, ChevronDown, Send, Loader2 } from "lucide-react";
import { formatBusinessHour } from "@/lib/dateTime";
import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  onLoadOlderMessages: () => void;
  hasMoreMessages: boolean;
  isLoadingMessages?: boolean;
  isLoadingOlderMessages?: boolean;
  onSendMessage?: (text: string) => void;
  isSending?: boolean;
  onToggleBot?: (isBotActive: boolean) => void;
  isTogglingBot?: boolean;
}

export interface Contact {
  id: string;
  clientId?: string | null;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread?: number | boolean;
  subtitle?: string;
  isBotActive?: boolean;
}

export interface Message {
  id: number;
  text: string;
  timestamp: string;
  sent: boolean;
  sessionId?: string;
}

const formatMessageTime = (value: string) => {
  return formatBusinessHour(value, "Sem horário");
};

const toDateKey = (value: string) => {
  if (!value || value === "Sem horário") return "sem-data";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "sem-data";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateBadge = (value: string) => {
  if (value === "sem-data") return "Sem data";

  const today = new Date();
  const todayKey = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;
  if (value === todayKey) return "HOJE";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const renderMessageText = (text: string) => {
  if (!text) return null;
  
  let cleanText = text.trim();
  if (cleanText.startsWith('"') && cleanText.endsWith('"')) {
    try {
      const parsed = JSON.parse(cleanText);
      if (typeof parsed === 'string') {
        cleanText = parsed;
      }
    } catch (e) {
      cleanText = cleanText.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
  } else if (cleanText.includes('\\n')) {
    cleanText = cleanText.replace(/\\n/g, '\n');
  }
  
  const parts = cleanText.split(/(\*[^\*]+\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <strong key={index} className="font-bold">
          {part.slice(1, -1)}
        </strong>
      );
    }
    return part;
  });
};

export function ChatWindow({
  contact,
  messages,
  onLoadOlderMessages,
  hasMoreMessages,
  isLoadingMessages,
  isLoadingOlderMessages,
  onSendMessage,
  isSending,
  onToggleBot,
  isTogglingBot,
}: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [isReady, setIsReady] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const previousScrollHeightRef = useRef(0);
  const previousScrollTopRef = useRef(0);
  const shouldPreserveScrollRef = useRef(false);
  const loadLockRef = useRef(false);
  const lastContactIdRef = useRef<string | null>(null);
  const didScrollToBottomOnContactRef = useRef(false);
  
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isAtBottomRef = useRef(true);
  const prevMessagesLengthRef = useRef(0);

  const groupedMessages = useMemo(() => {
    const groups: { dateKey: string; messages: (Message & { dateKey: string })[] }[] = [];
    
    messages.forEach((message) => {
      const dateKey = toDateKey(message.timestamp);
      let currentGroup = groups[groups.length - 1];
      
      if (!currentGroup || currentGroup.dateKey !== dateKey) {
        currentGroup = { dateKey, messages: [] };
        groups.push(currentGroup);
      }
      
      currentGroup.messages.push({ ...message, dateKey });
    });

    return groups;
  }, [messages]);

  const handleScroll = () => {
    const element = scrollContainerRef.current;
    if (!element) return;

    const atBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 50;
    isAtBottomRef.current = atBottom;

    if (atBottom && showScrollButton) {
      setShowScrollButton(false);
    }

    if (
      element.scrollTop <= 50 &&
      hasMoreMessages &&
      !isLoadingMessages &&
      !isLoadingOlderMessages &&
      !loadLockRef.current
    ) {
      previousScrollHeightRef.current = element.scrollHeight;
      previousScrollTopRef.current = element.scrollTop;
      shouldPreserveScrollRef.current = true;
      loadLockRef.current = true;

      onLoadOlderMessages();

      // Fallback de segurança para liberar o lock caso o carregamento seja instantâneo (ex: cache)
      setTimeout(() => {
        loadLockRef.current = false;
      }, 800);
    }
  };

  useEffect(() => {
    if (isLoadingOlderMessages) {
      loadLockRef.current = true;
    } else {
      // Libera o lock quando o carregamento termina
      const timer = setTimeout(() => {
        loadLockRef.current = false;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoadingOlderMessages]);

  useEffect(() => {
    const currentContactId = contact?.id || null;

    if (currentContactId !== lastContactIdRef.current) {
      lastContactIdRef.current = currentContactId;
      didScrollToBottomOnContactRef.current = false;
      shouldPreserveScrollRef.current = false;
      setShowScrollButton(false);
      prevMessagesLengthRef.current = 0;
      isAtBottomRef.current = true;
      setIsReady(false);
    }
  }, [contact?.id]);

  useEffect(() => {
    const element = scrollContainerRef.current;
    if (!element) return;

    if (shouldPreserveScrollRef.current) {
      const newScrollHeight = element.scrollHeight;
      const delta = newScrollHeight - previousScrollHeightRef.current;
      element.scrollTop = previousScrollTopRef.current + delta;
      shouldPreserveScrollRef.current = false;
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    if (!didScrollToBottomOnContactRef.current && !isLoadingMessages) {
      if (messages.length > 0) {
        element.scrollTop = element.scrollHeight;
      }
      didScrollToBottomOnContactRef.current = true;
      prevMessagesLengthRef.current = messages.length;
      isAtBottomRef.current = true;
      setIsReady(true);
      return;
    }

    if (messages.length > prevMessagesLengthRef.current && didScrollToBottomOnContactRef.current && !isLoadingMessages) {
      if (isAtBottomRef.current) {
        element.scrollTop = element.scrollHeight;
      } else {
        setShowScrollButton(true);
      }
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, isLoadingMessages]);

  const scrollToBottom = () => {
    const element = scrollContainerRef.current;
    if (!element) return;
    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth"
    });
    setShowScrollButton(false);
  };

  if (!contact) {
    return (
      <div className="flex-1 bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center text-slate-600">
          <div className="size-14 mx-auto mb-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
            <MessageSquareText className="size-7" />
          </div>
          <p className="text-sm">Selecione uma conversa para visualizar as mensagens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-slate-50 h-full">
      {/* Header updates instantly without animation for a snappier feel */}
      <div className="bg-white p-4 flex items-center gap-3 border-b border-border">
        <div className="size-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
          <span className="text-sm">{contact.avatar}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-slate-900 font-semibold truncate">{contact.name}</h2>
          <p className="text-xs text-slate-600 truncate mt-1">{contact.subtitle || `Cliente: ${contact.id}`}</p>
        </div>
        
        {contact.isBotActive === false && onToggleBot && (
          <button
            onClick={() => onToggleBot(true)}
            disabled={isTogglingBot}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isTogglingBot ? <Loader2 className="size-3 animate-spin" /> : <MessageSquareText className="size-3.5" />}
            Reativar Agente
          </button>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 bg-slate-50 custom-scrollbar"
      >
        <div className={`space-y-3 transition-opacity duration-300 ${(isReady || isLoadingMessages) ? "opacity-100" : "opacity-0"}`}>
          {contact.isBotActive === false && !isLoadingMessages && (
            <div className="flex justify-center mb-6">
              <div className="px-4 py-2 bg-orange-100/80 backdrop-blur-sm border border-orange-200 rounded-full text-orange-800 text-[11px] font-medium flex items-center gap-2 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Agente IA pausado: Atendimento em modo humano
              </div>
            </div>
          )}

          {isLoadingOlderMessages && messages.length > 0 && (
            <div className="text-xs text-slate-500 text-center py-2">Carregando mensagens anteriores...</div>
          )}

          {isLoadingMessages && (
            <div className="space-y-6 py-6 w-full flex flex-col px-2">
              <div className="flex items-center justify-center">
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              
              <div className="flex justify-start">
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <Skeleton className="h-16 w-[280px] rounded-2xl rounded-tl-sm" />
                  <Skeleton className="h-12 w-[220px] rounded-2xl rounded-tl-sm" />
                </div>
              </div>

              <div className="flex justify-end">
                <Skeleton className="h-14 w-[240px] rounded-2xl rounded-tr-sm" />
              </div>

              <div className="flex justify-start">
                <Skeleton className="h-20 w-[300px] rounded-2xl rounded-tl-sm" />
              </div>
            </div>
          )}

          {!isLoadingMessages && !messages.length && (
            <div className="text-sm text-slate-600 text-center py-8">
              Nenhuma mensagem disponível para este contato.
            </div>
          )}

          {!isLoadingMessages && groupedMessages.map((group) => (
            <div key={group.dateKey} className="flex flex-col space-y-3">
              <div className="flex items-center justify-center py-2 sticky -top-2 z-10">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/95 backdrop-blur-sm px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm">
                  {formatDateBadge(group.dateKey)}
                </span>
              </div>

              {group.messages.map((message) => (
                <div key={`${message.sessionId || "session"}-${message.id}`} className={`flex ${message.sent ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-md px-3 py-2 rounded-lg border shadow-sm ${
                      message.sent
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{renderMessageText(message.text)}</p>
                    <span
                      className={`text-xs float-right ml-2 mt-1 ${
                        message.sent ? "text-blue-100" : "text-slate-500"
                      }`}
                    >
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-8 p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-400 cursor-pointer transition-all flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 z-10"
          title="Novas mensagens"
        >
          <ChevronDown className="size-5" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
          </span>
        </button>
      )}

      <div className="bg-white p-4 border-t border-border">
        {onSendMessage ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim() && !isSending) {
                onSendMessage(inputText.trim());
                setInputText("");
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isSending}
              className="flex-1 px-4 py-2 text-sm border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="flex items-center justify-center p-2 rounded-full bg-blue-600 text-white disabled:opacity-50 disabled:hover:bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {isSending ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
            </button>
          </form>
        ) : (
          <div className="text-sm text-slate-600">
            Modo monitoramento: visualização somente leitura das mensagens do chat.
          </div>
        )}
      </div>
    </div>
  );
}
